/**
 * `npm run build:apk` / `npm run build:apk:universal` (PLAN 5.3a, ADR-039): a local release APK
 * without an Expo account.
 *
 * 1. `expo prebuild` (non-interactive, CI=1) generates or updates the gitignored android/.
 *    Prebuild rewrites package.json's "android"/"ios" scripts to `expo run:*`; the script puts
 *    package.json back byte for byte and warns about any other tracked file prebuild changed.
 * 2. Writes android/local.properties from ANDROID_HOME (or the default SDK location).
 * 3. Runs `gradlew assembleRelease` for the chosen ABIs (signed with the debug keystore).
 * 4. Checks Gradle's APK's signer with apksigner: a different key than the published releases'
 *    would stop phones from updating without an uninstall (and data loss), so the build fails
 *    before anything is copied (ADR-043).
 * 5. Copies the APK to builds/ with a versioned name and prints its path and SHA-256.
 *
 * `npm run build:aab` (`--aab`, PLAN 7.2, ADR-066) makes the Google Play App Bundle instead: it
 * checks that the upload key's Gradle properties exist (names only), always runs a clean prebuild,
 * runs `gradlew bundleRelease` for every ABI with `-PskillforgeUploadSigning=true` (the release
 * signing switch of plugins/withUploadSigning.js), checks the bundle's signer with `keytool` against
 * `UPLOAD_SIGNER_SHA256` and copies it to builds/.
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
  GRADLE_AAB_PATH,
  GRADLE_APK_PATH,
  PREBUILD_PROTECTED_FILES,
  aabFileName,
  apkFileName,
  apksignerPath,
  appVersion,
  gradleCommand,
  keytoolCandidates,
  localPropertiesContent,
  missingUploadProperties,
  parseBuildArgs,
  parseKeytoolDigests,
  parseSignerDigests,
  prebuildArgs,
  resolveSdkDir,
  signerProblem,
  uploadSignerProblem,
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

/** Fails early, before the slow prebuild, when the upload key's Gradle properties are missing. */
function checkUploadProperties(): void {
  const file = join(homedir(), '.gradle', 'gradle.properties');
  const text = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const missing = missingUploadProperties(text, process.env);
  if (missing.length > 0) {
    throw new Error(
      `the upload key isn't configured: ${missing.join(', ')} missing in ${file} ` +
        '(see docs/CONTEXT.md "Play build", PLAN 7.1)',
    );
  }
}

/** Fails the build when the App Bundle isn't signed with the upload key (ADR-066). */
function checkUploadSigner(aab: string): void {
  // A bare name is looked up on PATH by the shell; a full path must exist.
  const onPath = (candidate: string) => !candidate.includes('/') && !candidate.includes('\\');
  const keytool = keytoolCandidates(process.env, process.platform).find(
    (candidate) => onPath(candidate) || existsSync(candidate),
  );
  if (!keytool) throw new Error('keytool not found; set JAVA_HOME to a JDK');
  // One quoted command string with a shell (Windows); both are our paths.
  const result = spawnSync(`"${keytool}" -printcert -jarfile "${aab}"`, {
    encoding: 'utf8',
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`keytool -printcert failed:\n${result.stderr || result.stdout}`);
  }
  const problem = uploadSignerProblem(parseKeytoolDigests(result.stdout));
  if (problem) throw new Error(`Signer check: ${problem}`);
  console.log('Signer:  the upload key (Play App Signing re-signs it for devices)');
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
    `SkillForge ${version} (versionCode ${versionCode}), ABIs ${options.abis.join(', ')}` +
      (options.aab ? ', App Bundle for Google Play' : ''),
  );
  if (options.aab) checkUploadProperties();

  if (options.skipPrebuild) {
    if (!existsSync(ANDROID_DIR))
      throw new Error('android/ does not exist; run without --skip-prebuild');
  } else {
    prebuild(options.clean);
  }
  const sdkDir = writeLocalProperties();

  const gradle = gradleCommand(process.platform, options.abis, options.aab);
  // A full path: cmd.exe doesn't reliably find a .bat in the spawn cwd.
  const wrapper = join(ANDROID_DIR, gradle.command);
  run(isWindows && wrapper.includes(' ') ? `"${wrapper}"` : wrapper, gradle.args, {
    cwd: ANDROID_DIR,
  });

  if (options.aab) {
    const bundle = join(ROOT, ...GRADLE_AAB_PATH);
    if (!existsSync(bundle)) throw new Error(`Gradle finished but ${bundle} is missing`);
    // Checked before the copy, so a wrongly signed bundle never lands in builds/.
    checkUploadSigner(bundle);
    const outDir = join(ROOT, APK_OUTPUT_DIR);
    mkdirSync(outDir, { recursive: true });
    const target = join(outDir, aabFileName({ version, versionCode, commit }));
    copyFileSync(bundle, target);
    const sizeMb = (statSync(target).size / (1024 * 1024)).toFixed(1);
    console.log(`\nAAB:     ${target} (${sizeMb} MB)`);
    console.log(`SHA-256: ${sha256(target)}`);
    console.log('Upload it in Play Console; it carries its native debug symbols.');
    return;
  }

  const built = join(ROOT, ...GRADLE_APK_PATH);
  if (!existsSync(built)) throw new Error(`Gradle finished but ${built} is missing`);
  // Checked before the copy, so a wrongly signed APK never lands in builds/ (ADR-043).
  checkSigner(sdkDir, built);
  const outDir = join(ROOT, APK_OUTPUT_DIR);
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, apkFileName({ version, versionCode, abis: options.abis, commit }));
  copyFileSync(built, target);

  const sizeMb = (statSync(target).size / (1024 * 1024)).toFixed(1);
  console.log(`\nAPK:     ${target} (${sizeMb} MB)`);
  console.log(`SHA-256: ${sha256(target)}`);
  console.log(
    'Signed with the debug keystore: fine for sideloading; for Play use npm run build:aab.',
  );
}

try {
  main();
} catch (error) {
  console.error(`\nbuild:apk failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
