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
  /** Recreate android/ from scratch (slow, cold Gradle build) instead of applying changes to it. */
  clean: boolean;
  /** Reuse android/ as it is and only run Gradle. */
  skipPrebuild: boolean;
  help: boolean;
}

export const BUILD_USAGE = `Usage: npm run build:apk [-- options]      (arm64-v8a, for phones)
       npm run build:apk:universal          (arm64-v8a + x86_64, also runs on the emulator)

Options:
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
  for (const arg of argv) {
    if (arg === '--universal') {
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
  return { abis: abis ?? [...PHONE_ABIS], clean, skipPrebuild, help };
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

/** The Gradle wrapper (file name in android/) and its arguments for a release APK with these ABIs. */
export function gradleCommand(
  platform: NodeJS.Platform,
  abis: readonly Abi[],
): { command: string; args: string[] } {
  return {
    command: platform === 'win32' ? 'gradlew.bat' : 'gradlew',
    args: ['assembleRelease', '--no-daemon', `-PreactNativeArchitectures=${abis.join(',')}`],
  };
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
