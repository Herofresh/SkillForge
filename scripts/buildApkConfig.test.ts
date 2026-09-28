import {
  PHONE_ABIS,
  UNIVERSAL_ABIS,
  abiLabel,
  apkFileName,
  appVersion,
  gradleCommand,
  localPropertiesContent,
  parseBuildArgs,
  prebuildArgs,
  resolveSdkDir,
} from './buildApkConfig';

describe('parseBuildArgs', () => {
  it('defaults to arm64 for phones with an incremental prebuild', () => {
    expect(parseBuildArgs([])).toEqual({
      abis: ['arm64-v8a'],
      clean: false,
      skipPrebuild: false,
      help: false,
    });
  });

  it('builds arm64 + x86_64 with --universal', () => {
    expect(parseBuildArgs(['--universal']).abis).toEqual(['arm64-v8a', 'x86_64']);
  });

  it('accepts an explicit ABI list, trimmed and de-duplicated', () => {
    expect(parseBuildArgs(['--abis=x86_64, arm64-v8a,x86_64']).abis).toEqual([
      'x86_64',
      'arm64-v8a',
    ]);
  });

  it('rejects unknown ABIs, empty lists and unknown options', () => {
    expect(() => parseBuildArgs(['--abis=arm64'])).toThrow('Unknown ABI: arm64');
    expect(() => parseBuildArgs(['--abis='])).toThrow('at least one ABI');
    expect(() => parseBuildArgs(['--release'])).toThrow('Unknown option: --release');
  });

  it('rejects contradictory options', () => {
    expect(() => parseBuildArgs(['--universal', '--abis=x86'])).toThrow('not both');
    expect(() => parseBuildArgs(['--clean', '--skip-prebuild'])).toThrow('not both');
  });

  it('reads --clean, --skip-prebuild and --help', () => {
    expect(parseBuildArgs(['--clean']).clean).toBe(true);
    expect(parseBuildArgs(['--skip-prebuild']).skipPrebuild).toBe(true);
    expect(parseBuildArgs(['-h']).help).toBe(true);
  });
});

describe('abiLabel', () => {
  it('names the two standard sets and joins anything else', () => {
    expect(abiLabel(PHONE_ABIS)).toBe('arm64');
    expect(abiLabel(['x86_64', 'arm64-v8a'])).toBe('universal');
    expect(abiLabel(['arm64-v8a', 'armeabi-v7a'])).toBe('arm64-v8a+armeabi-v7a');
  });
});

describe('resolveSdkDir', () => {
  it('prefers ANDROID_HOME, then ANDROID_SDK_ROOT', () => {
    expect(resolveSdkDir({ ANDROID_HOME: '/a', ANDROID_SDK_ROOT: '/b' }, 'linux', '/h')).toBe('/a');
    expect(resolveSdkDir({ ANDROID_HOME: '', ANDROID_SDK_ROOT: '/b' }, 'linux', '/h')).toBe('/b');
  });

  it("falls back to Android Studio's default location", () => {
    expect(resolveSdkDir({ LOCALAPPDATA: 'C:\\Users\\me\\AppData\\Local' }, 'win32', 'C:\\x')).toBe(
      'C:\\Users\\me\\AppData\\Local\\Android\\Sdk',
    );
    expect(resolveSdkDir({}, 'darwin', '/Users/me')).toBe('/Users/me/Library/Android/sdk');
    expect(resolveSdkDir({}, 'linux', '/home/me')).toBe('/home/me/Android/Sdk');
  });

  it('is undefined on Windows without LOCALAPPDATA', () => {
    expect(resolveSdkDir({}, 'win32', 'C:\\x')).toBeUndefined();
  });
});

describe('localPropertiesContent', () => {
  it('writes sdk.dir with forward slashes', () => {
    expect(localPropertiesContent('C:\\Users\\me\\Android\\Sdk')).toContain(
      'sdk.dir=C:/Users/me/Android/Sdk\n',
    );
  });
});

describe('apkFileName', () => {
  it('includes version, versionCode, ABI label and commit', () => {
    expect(
      apkFileName({ version: '0.1.0', versionCode: 1, abis: UNIVERSAL_ABIS, commit: 'd18a142' }),
    ).toBe('SkillForge-0.1.0-vc1-universal-d18a142.apk');
    expect(apkFileName({ version: '0.1.0', versionCode: 2, abis: PHONE_ABIS })).toBe(
      'SkillForge-0.1.0-vc2-arm64.apk',
    );
  });
});

describe('commands', () => {
  it('keeps android/ unless --clean', () => {
    expect(prebuildArgs(false)).toContain('--no-clean');
    expect(prebuildArgs(true)).not.toContain('--no-clean');
    expect(prebuildArgs(true)).toEqual(
      expect.arrayContaining(['prebuild', '--platform', 'android', '--no-install']),
    );
  });

  it('uses the platform Gradle wrapper with the ABI list', () => {
    expect(gradleCommand('win32', UNIVERSAL_ABIS)).toEqual({
      command: 'gradlew.bat',
      args: ['assembleRelease', '--no-daemon', '-PreactNativeArchitectures=arm64-v8a,x86_64'],
    });
    expect(gradleCommand('linux', PHONE_ABIS).command).toBe('gradlew');
  });
});

describe('appVersion', () => {
  it('reads version and versionCode', () => {
    expect(appVersion({ expo: { version: '0.1.0', android: { versionCode: 3 } } })).toEqual({
      version: '0.1.0',
      versionCode: 3,
    });
  });

  it('rejects a missing version or a bad versionCode', () => {
    expect(() => appVersion({ expo: { android: { versionCode: 1 } } })).toThrow('expo.version');
    expect(() => appVersion({ expo: { version: '1', android: { versionCode: 0 } } })).toThrow(
      'versionCode',
    );
    expect(() => appVersion({ expo: { version: '1' } })).toThrow('versionCode');
  });
});

describe('the real app.json', () => {
  it('is build-ready', () => {
    const appJson = require('../app.json');
    expect(() => appVersion(appJson)).not.toThrow();
    expect(appJson.expo.android.package).toBe('at.skillforge.app');
  });
});
