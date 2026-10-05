/**
 * Pure parts of `npm run build:apk` (PLAN 5.3a, ADR-039): argument parsing, ABI sets, the Android
 * SDK location, `local.properties`, the output file name and the commands to run. No file system
 * or process access here, so Jest can test it; `scripts/buildApk.ts` does the I/O.
 */
import { posix, win32 } from 'node:path';

/** Every ABI React Native can build native libraries for. */
export const KNOWN_ABIS = ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'] as const;
export type Abi = (typeof KNOWN_ABIS)[number];

/** Phones (the Pixel 8 Pro and nearly every Android phone since 2017). */
export const PHONE_ABIS: readonly Abi[] = ['arm64-v8a'];
/** Phones plus the x86_64 emulator (an arm64-only APK crashes there with SoLoaderDSONotFoundError). */
export const UNIVERSAL_ABIS: readonly Abi[] = ['arm64-v8a', 'x86_64'];

/** Gitignored folder the finished APKs are copied to. */
export const APK_OUTPUT_DIR = 'builds';
/** Where Gradle writes the release APK, relative to the repo root. */
export const GRADLE_APK_PATH = [
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk',
];
/** Files `expo prebuild` may rewrite (the "android"/"ios" scripts, dependency pins); restored after it. */
export const PREBUILD_PROTECTED_FILES = ['package.json'];

export interface BuildOptions {
  abis: Abi[];
  /**
   * An Android App Bundle for Google Play (PLAN 7.2, ADR-066): every ABI, a clean prebuild, signed
   * with the upload key and checked against `UPLOAD_SIGNER_SHA256`.
   */
  aab: boolean;
  /** Recreate android/ from scratch (slow, cold Gradle build) instead of applying changes to it. */
  clean: boolean;
  /** Reuse android/ as it is and only run Gradle. */
  skipPrebuild: boolean;
  help: boolean;
}

export const BUILD_USAGE = `Usage: npm run build:apk [-- options]      (arm64-v8a, for phones)
       npm run build:apk:universal          (arm64-v8a + x86_64, also runs on the emulator)
       npm run build:aab                    (App Bundle for Google Play, upload key, every ABI)

Options:
  --aab                App Bundle for Play (always a clean prebuild; no ABI options)
  --universal          arm64-v8a + x86_64
  --abis=<a,b>         explicit ABIs (${KNOWN_ABIS.join(', ')})
  --clean              recreate android/ (after changing app.json plugins or native dependencies)
  --skip-prebuild      only run Gradle on the existing android/
  --help               show this help`;

function parseAbiList(value: string): Abi[] {
  const abis = value
    .split(',')
    .map((abi) => abi.trim())
    .filter((abi) => abi.length > 0);
  if (abis.length === 0) throw new Error('--abis needs at least one ABI');
  const unknown = abis.filter((abi) => !(KNOWN_ABIS as readonly string[]).includes(abi));
  if (unknown.length > 0) {
    throw new Error(`Unknown ABI: ${unknown.join(', ')} (known: ${KNOWN_ABIS.join(', ')})`);
  }
  return [...new Set(abis as Abi[])];
}

/** Parses the script's arguments (after `node script`). Throws with a readable message. */
export function parseBuildArgs(argv: readonly string[]): BuildOptions {
  let abis: Abi[] | undefined;
  let clean = false;
  let skipPrebuild = false;
  let help = false;
  let aab = false;
  for (const arg of argv) {
    if (arg === '--aab') {
      aab = true;
    } else if (arg === '--universal') {
      if (abis) throw new Error('Use either --universal or --abis, not both');
      abis = [...UNIVERSAL_ABIS];
    } else if (arg.startsWith('--abis=')) {
      if (abis) throw new Error('Use either --universal or --abis, not both');
      abis = parseAbiList(arg.slice('--abis='.length));
    } else if (arg === '--clean') {
      clean = true;
    } else if (arg === '--skip-prebuild') {
      skipPrebuild = true;
    } else if (arg === '--help' || arg === '-h') {
      help = true;
    } else {
      throw new Error(`Unknown option: ${arg}\n\n${BUILD_USAGE}`);
    }
  }
  if (clean && skipPrebuild) throw new Error('Use either --clean or --skip-prebuild, not both');
  if (aab) {
    // A stale android/ would ship an old versionCode; Play splits the bundle per device ABI.
    if (abis) throw new Error('--aab always includes every ABI; drop --universal / --abis');
    if (skipPrebuild) throw new Error('--aab always runs a clean prebuild; drop --skip-prebuild');
    return { abis: [...KNOWN_ABIS], clean: true, skipPrebuild: false, help, aab };
  }
  return { abis: abis ?? [...PHONE_ABIS], clean, skipPrebuild, help, aab };
}

/** Short label for the file name: "arm64", "universal", or the ABIs joined with "+". */
export function abiLabel(abis: readonly Abi[]): string {
  const same = (set: readonly Abi[]) =>
    set.length === abis.length && set.every((abi) => abis.includes(abi));
  if (same(PHONE_ABIS)) return 'arm64';
  if (same(UNIVERSAL_ABIS)) return 'universal';
  return abis.join('+');
}

/**
 * The Android SDK: `ANDROID_HOME`, then the deprecated `ANDROID_SDK_ROOT`, then Android Studio's
 * default install location for the platform. Undefined when nothing is known (e.g. Windows
 * without LOCALAPPDATA).
 */
export function resolveSdkDir(
  env: Readonly<Record<string, string | undefined>>,
  platform: NodeJS.Platform,
  home: string,
): string | undefined {
  const fromEnv = env.ANDROID_HOME || env.ANDROID_SDK_ROOT;
  if (fromEnv) return fromEnv;
  if (platform === 'win32') {
    return env.LOCALAPPDATA ? win32.join(env.LOCALAPPDATA, 'Android', 'Sdk') : undefined;
  }
  if (platform === 'darwin') return posix.join(home, 'Library', 'Android', 'sdk');
  return posix.join(home, 'Android', 'Sdk');
}

/**
 * `android/local.properties`. Backslashes become forward slashes (Gradle accepts them on
 * Windows), so no Java properties escaping is needed.
 */
export function localPropertiesContent(sdkDir: string): string {
  return `# Written by scripts/buildApk.ts. Do not commit.\nsdk.dir=${sdkDir.replace(/\\/g, '/')}\n`;
}

/** `SkillForge-0.1.0-vc1-universal-d18a142.apk`; the commit is left out when unknown. */
export function apkFileName(parts: {
  version: string;
  versionCode: number;
  abis: readonly Abi[];
  commit?: string;
}): string {
  const commit = parts.commit ? `-${parts.commit}` : '';
  return `SkillForge-${parts.version}-vc${parts.versionCode}-${abiLabel(parts.abis)}${commit}.apk`;
}

/** `npx expo prebuild` arguments; `--no-clean` keeps android/ (and Gradle's cache) unless asked. */
export function prebuildArgs(clean: boolean): string[] {
  return [
    'expo',
    'prebuild',
    '--platform',
    'android',
    '--no-install',
    ...(clean ? [] : ['--no-clean']),
  ];
}

/**
 * Gradle project property that switches the release build to the upload key
 * (`UPLOAD_SIGNING_FLAG` in plugins/withUploadSigning.js; a test keeps them equal).
 */
export const UPLOAD_SIGNING_FLAG = 'skillforgeUploadSigning';

/**
 * The Gradle wrapper (file name in android/) and its arguments: a release APK with these ABIs, or
 * (`aab`) a release App Bundle signed with the upload key.
 */
export function gradleCommand(
  platform: NodeJS.Platform,
  abis: readonly Abi[],
  aab = false,
): { command: string; args: string[] } {
  return {
    command: platform === 'win32' ? 'gradlew.bat' : 'gradlew',
    args: [
      aab ? 'bundleRelease' : 'assembleRelease',
      '--no-daemon',
      `-PreactNativeArchitectures=${abis.join(',')}`,
      ...(aab ? [`-P${UPLOAD_SIGNING_FLAG}=true`] : []),
    ],
  };
}

/** Where Gradle writes the release App Bundle, relative to the repo root. */
export const GRADLE_AAB_PATH = [
  'android',
  'app',
  'build',
  'outputs',
  'bundle',
  'release',
  'app-release.aab',
];

/** `SkillForge-0.8.0-vc8-d18a142.aab`; the commit is left out when unknown. */
export function aabFileName(parts: {
  version: string;
  versionCode: number;
  commit?: string;
}): string {
  const commit = parts.commit ? `-${parts.commit}` : '';
  return `SkillForge-${parts.version}-vc${parts.versionCode}${commit}.aab`;
}

// --- Upload key (PLAN 7.1–7.2, ADR-047, ADR-066) ----------------------------------------------

/**
 * SHA-256 of the upload key's certificate (created by the user in PLAN 7.1, kept outside the
 * repo). Play only accepts bundles signed with it; Play App Signing re-signs them for devices.
 * A lost key is reset through Play Console support, after which this digest changes.
 */
export const UPLOAD_SIGNER_SHA256 =
  '027d806ef6ca05e3453c700c1bd9f4349f6b58f8a4ffe7658ec9e275f585725d';

/** The Gradle properties the upload signing config reads (plugins/withUploadSigning.js). */
export const UPLOAD_PROPERTIES = [
  'SKILLFORGE_UPLOAD_STORE_FILE',
  'SKILLFORGE_UPLOAD_STORE_PASSWORD',
  'SKILLFORGE_UPLOAD_KEY_ALIAS',
  'SKILLFORGE_UPLOAD_KEY_PASSWORD',
] as const;

/**
 * The upload properties neither `~/.gradle/gradle.properties` (`gradleProperties`, its text) nor
 * an `ORG_GRADLE_PROJECT_<name>` environment variable sets. Only names are read, never values.
 */
export function missingUploadProperties(
  gradleProperties: string,
  env: Readonly<Record<string, string | undefined>>,
): string[] {
  const keys = new Set(
    gradleProperties
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('!'))
      .map((line) => line.split(/[=:]/, 1)[0]?.trim() ?? ''),
  );
  return UPLOAD_PROPERTIES.filter((name) => !keys.has(name) && !env[`ORG_GRADLE_PROJECT_${name}`]);
}

/** The SHA-256 digests in `keytool -printcert` output (lower case hex, no colons, in order). */
export function parseKeytoolDigests(output: string): string[] {
  return [...output.matchAll(/SHA256:\s*((?:[0-9A-Fa-f]{2}:){31}[0-9A-Fa-f]{2})/g)].map((match) =>
    (match[1] ?? '').replace(/:/g, '').toLowerCase(),
  );
}

/** `undefined` when the bundle is signed with the upload key only, else what is wrong. */
export function uploadSignerProblem(digests: readonly string[]): string | undefined {
  if (digests.length === 0) return 'keytool printed no signer certificate';
  const others = digests.filter((digest) => digest !== UPLOAD_SIGNER_SHA256);
  if (others.length === 0) return undefined;
  return (
    `the bundle is signed with ${others.join(', ')}, not the upload key ` +
    `${UPLOAD_SIGNER_SHA256}. Play Console rejects it.`
  );
}

/**
 * Where to look for `keytool`, in order: JAVA_HOME, Android Studio's bundled JDK (its default
 * install location), then plain `keytool` on PATH.
 */
export function keytoolCandidates(
  env: Readonly<Record<string, string | undefined>>,
  platform: NodeJS.Platform,
): string[] {
  const exe = platform === 'win32' ? 'keytool.exe' : 'keytool';
  const path = platform === 'win32' ? win32 : posix;
  const candidates: string[] = [];
  if (env.JAVA_HOME) candidates.push(path.join(env.JAVA_HOME, 'bin', exe));
  if (platform === 'win32') {
    const programFiles = env.ProgramFiles || 'C:\\Program Files';
    candidates.push(win32.join(programFiles, 'Android', 'Android Studio', 'jbr', 'bin', exe));
  } else if (platform === 'darwin') {
    candidates.push('/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool');
  }
  candidates.push(exe);
  return candidates;
}

/** The app's version from app.json (`expo.version`, `expo.android.versionCode`). */
export function appVersion(appJson: unknown): { version: string; versionCode: number } {
  const expo = (appJson as { expo?: { version?: unknown; android?: { versionCode?: unknown } } })
    .expo;
  const version = expo?.version;
  const versionCode = expo?.android?.versionCode;
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error('app.json expo.version must be a non-empty string');
  }
  if (typeof versionCode !== 'number' || !Number.isInteger(versionCode) || versionCode < 1) {
    throw new Error('app.json expo.android.versionCode must be a positive integer');
  }
  return { version, versionCode };
}

/**
 * SHA-256 of the certificate every published SkillForge APK is signed with (the React Native debug
 * keystore that prebuild writes to android/app/debug.keystore; v0.1.0-preview1 onwards, ADR-043).
 * Android installs an update over an existing app only when the signer matches; a different key
 * forces an uninstall, which deletes the user's data. Changing it is a release decision (PLAN 5.3b).
 */
export const RELEASE_SIGNER_SHA256 =
  'fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c';

/** The signer digests from `apksigner verify --print-certs` output (lower case, in order). */
export function parseSignerDigests(output: string): string[] {
  return [...output.matchAll(/certificate SHA-256 digest:\s*([0-9a-fA-F]{64})/g)].map((match) =>
    (match[1] ?? '').toLowerCase(),
  );
}

/** `undefined` when the APK is signed with the release signer only, else what is wrong. */
export function signerProblem(digests: readonly string[]): string | undefined {
  if (digests.length === 0) return 'apksigner printed no signer certificate';
  const others = digests.filter((digest) => digest !== RELEASE_SIGNER_SHA256);
  if (others.length === 0) return undefined;
  return (
    `the APK is signed with ${others.join(', ')}, not the release signer ` +
    `${RELEASE_SIGNER_SHA256}. Phones with an earlier SkillForge can't update to it without ` +
    `uninstalling, which deletes their data (ADR-043).`
  );
}

/**
 * `apksigner` from the newest installed build-tools (folder names like "36.0.0"), or undefined.
 * `.bat` on Windows.
 */
export function apksignerPath(
  sdkDir: string,
  buildToolsVersions: readonly string[],
  platform: NodeJS.Platform,
): string | undefined {
  const numeric = (version: string) => version.split(/[.-]/).map((part) => Number(part) || 0);
  const newest = [...buildToolsVersions]
    .filter((version) => /^\d/.test(version))
    .sort((a, b) => {
      const [left, right] = [numeric(a), numeric(b)];
      for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
        const diff = (left[i] ?? 0) - (right[i] ?? 0);
        if (diff !== 0) return diff;
      }
      return 0;
    })
    .at(-1);
  if (!newest) return undefined;
  const path = platform === 'win32' ? win32 : posix;
  return path.join(
    sdkDir,
    'build-tools',
    newest,
    platform === 'win32' ? 'apksigner.bat' : 'apksigner',
  );
}
