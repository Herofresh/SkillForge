/**
 * `npm run build:apk` / `npm run build:apk:universal` (PLAN 5.3a, ADR-039): a local release APK
 * without an Expo account.
 *
 * 1. `expo prebuild` (non-interactive, CI=1) generates or updates the gitignored android/.
 *    Prebuild rewrites package.json's "android"/"ios" scripts to `expo run:*`; the script puts
 *    package.json back byte for byte and warns about any other tracked file prebuild changed.
 * 2. Writes android/local.properties from ANDROID_HOME (or the default SDK location).
 * 3. Runs `gradlew assembleRelease` for the chosen ABIs (signed with the debug keystore).
 * 4. Copies the APK to builds/ with a versioned name and prints its SHA-256.
 * 5. Checks the signer with apksigner: a different key than the published releases' would stop
 *    phones from updating without an uninstall (and data loss), so the build fails (ADR-043).
 *
 * Run through tsx (it imports the tested pure module `buildApkConfig.ts`).
 */
import { spawnSync, type SpawnSyncOptions } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  APK_OUTPUT_DIR,
  BUILD_USAGE,
  GRADLE_APK_PATH,
  PREBUILD_PROTECTED_FILES,
  apkFileName,
  apksignerPath,
  appVersion,
  gradleCommand,
  localPropertiesContent,
  parseBuildArgs,
  parseSignerDigests,
  prebuildArgs,
  resolveSdkDir,
  signerProblem,
} from './buildApkConfig';

// npm run always starts scripts in the package root.
const ROOT = process.cwd();
const ANDROID_DIR = join(ROOT, 'android');
const isWindows = process.platform === 'win32';

function run(command: string, args: string[], options: SpawnSyncOptions = {}): void {
  console.log(`\n> ${command} ${args.join(' ')}`);
  // .cmd/.bat launchers (npx, gradlew.bat) need a shell on Windows; the arguments are fixed (no user text).
  // One command string with a shell (Node deprecates args + shell, DEP0190).
  const result = isWindows
    ? spawnSync([command, ...args].join(' '), { stdio: 'inherit', shell: true, ...options })
    : spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited with ${result.status ?? result.signal}`);
  }
}

function capture(command: string, args: string[]): string | undefined {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : undefined;
}

function trackedChanges(): Set<string> {
  const status = capture('git', ['status', '--porcelain', '--untracked-files=no']) ?? '';
  return new Set(status.split('\n').filter((line) => line.length > 0));
}

function prebuild(clean: boolean): void {
  const before = trackedChanges();
  const snapshots = PREBUILD_PROTECTED_FILES.map((file) => ({
    path: join(ROOT, file),
    content: readFileSync(join(ROOT, file)),
  }));
  try {
    run('npx', prebuildArgs(clean), { cwd: ROOT, env: { ...process.env, CI: '1' } });
  } finally {
    for (const { path, content } of snapshots) {
      if (!readFileSync(path).equals(content)) {
        writeFileSync(path, content);
        console.log(`Restored ${path} (prebuild had rewritten it).`);
      }
    }
  }
  const added = [...trackedChanges()].filter((line) => !before.has(line));
  if (added.length > 0) {
    console.warn(
      `\nWarning: prebuild changed tracked files; review them before committing:\n${added.join('\n')}`,
    );
  }
}

function writeLocalProperties(): string {
  const sdkDir = resolveSdkDir(process.env, process.platform, homedir());
  if (!sdkDir || !existsSync(sdkDir)) {
    throw new Error(
      `Android SDK not found${sdkDir ? ` at ${sdkDir}` : ''}. Install it or set ANDROID_HOME.`,
    );
  }
  writeFileSync(join(ANDROID_DIR, 'local.properties'), localPropertiesContent(sdkDir));
  console.log(`\nAndroid SDK: ${sdkDir}`);
  return sdkDir;
}

/** Fails the build when the APK isn't signed with the published releases' key (ADR-043). */
function checkSigner(sdkDir: string, apk: string): void {
  const buildTools = join(sdkDir, 'build-tools');
  const versions = existsSync(buildTools) ? readdirSync(buildTools) : [];
  const apksigner = apksignerPath(sdkDir, versions, process.platform);
  if (!apksigner || !existsSync(apksigner)) {
    throw new Error(`apksigner not found under ${buildTools}; install the Android build-tools`);
  }
  // One quoted command string with a shell (the .bat needs one on Windows); both are our paths.
  const result = spawnSync(`"${apksigner}" verify --print-certs "${apk}"`, {
    encoding: 'utf8',
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`apksigner verify failed:\n${result.stderr || result.stdout}`);
  }
  const problem = signerProblem(parseSignerDigests(result.stdout));
  if (problem) throw new Error(`Signer check: ${problem}`);
  console.log('Signer:  the release key (updates over earlier installs keep their data)');
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function main(): void {
  const options = parseBuildArgs(process.argv.slice(2));
  if (options.help) {
    console.log(BUILD_USAGE);
    return;
  }
  const { version, versionCode } = appVersion(
    JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')),
  );
  const commit = capture('git', ['rev-parse', '--short', 'HEAD']);
  console.log(
    `SkillForge ${version} (versionCode ${versionCode}), ABIs ${options.abis.join(', ')}`,
  );

  if (options.skipPrebuild) {
    if (!existsSync(ANDROID_DIR))
      throw new Error('android/ does not exist; run without --skip-prebuild');
  } else {
    prebuild(options.clean);
  }
  const sdkDir = writeLocalProperties();

  const gradle = gradleCommand(process.platform, options.abis);
  // A full path: cmd.exe doesn't reliably find a .bat in the spawn cwd.
  const wrapper = join(ANDROID_DIR, gradle.command);
  run(isWindows && wrapper.includes(' ') ? `"${wrapper}"` : wrapper, gradle.args, {
    cwd: ANDROID_DIR,
  });

  const built = join(ROOT, ...GRADLE_APK_PATH);
  if (!existsSync(built)) throw new Error(`Gradle finished but ${built} is missing`);
  const outDir = join(ROOT, APK_OUTPUT_DIR);
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, apkFileName({ version, versionCode, abis: options.abis, commit }));
  copyFileSync(built, target);

  const sizeMb = (statSync(target).size / (1024 * 1024)).toFixed(1);
  console.log(`\nAPK:     ${target} (${sizeMb} MB)`);
  console.log(`SHA-256: ${sha256(target)}`);
  checkSigner(sdkDir, target);
  console.log('Signed with the debug keystore: fine for sideloading, not for Play (PLAN 5.3b).');
}

try {
  main();
} catch (error) {
  console.error(`\nbuild:apk failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
