import {
  UPLOAD_PROPERTIES as PLUGIN_UPLOAD_PROPERTIES,
  UPLOAD_SIGNING_FLAG as PLUGIN_FLAG,
} from '../plugins/withUploadSigning';

import {
  KNOWN_ABIS,
  PHONE_ABIS,
  RELEASE_SIGNER_SHA256,
  UPLOAD_PROPERTIES,
  UPLOAD_SIGNER_SHA256,
  UPLOAD_SIGNING_FLAG,
  aabFileName,
  UNIVERSAL_ABIS,
  abiLabel,
  apksignerPath,
  apkFileName,
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

describe('parseBuildArgs', () => {
  it('defaults to arm64 for phones with an incremental prebuild', () => {
    expect(parseBuildArgs([])).toEqual({
      abis: ['arm64-v8a'],
      clean: false,
      skipPrebuild: false,
      help: false,
      aab: false,
    });
  });

  it('builds an App Bundle with every ABI and a clean prebuild (PLAN 7.2)', () => {
    expect(parseBuildArgs(['--aab'])).toEqual({
      abis: [...KNOWN_ABIS],
      clean: true,
      skipPrebuild: false,
      help: false,
      aab: true,
    });
    expect(() => parseBuildArgs(['--aab', '--universal'])).toThrow('every ABI');
    expect(() => parseBuildArgs(['--aab', '--abis=x86_64'])).toThrow('every ABI');
    expect(() => parseBuildArgs(['--aab', '--skip-prebuild'])).toThrow('clean prebuild');
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

describe('release signer check (ADR-043)', () => {
  const output = [
    'Signer #1 certificate DN: CN=Android Debug, O=Android, C=US',
    `Signer #1 certificate SHA-256 digest: ${RELEASE_SIGNER_SHA256.toUpperCase()}`,
    'Signer #1 certificate SHA-1 digest: 5e8f16062ea3cd2c4a0d547876baa6f38cabf625',
  ].join('\n');

  it('reads the SHA-256 digests from apksigner output', () => {
    expect(parseSignerDigests(output)).toEqual([RELEASE_SIGNER_SHA256]);
    expect(parseSignerDigests('nothing here')).toEqual([]);
  });

  it('accepts the release signer and names any other one', () => {
    expect(signerProblem([RELEASE_SIGNER_SHA256])).toBeUndefined();
    const other = 'ab'.repeat(32);
    expect(signerProblem([other])).toContain(other);
    expect(signerProblem([other])).toContain('deletes their data');
    expect(signerProblem([])).toBe('apksigner printed no signer certificate');
  });

  it('finds apksigner in the newest build-tools', () => {
    expect(apksignerPath('C:\\Sdk', ['34.0.0', '36.0.0', '35.0.1'], 'win32')).toBe(
      'C:\\Sdk\\build-tools\\36.0.0\\apksigner.bat',
    );
    expect(apksignerPath('/sdk', ['9.0.0', '10.0.0'], 'linux')).toBe(
      '/sdk/build-tools/10.0.0/apksigner',
    );
    expect(apksignerPath('/sdk', ['.DS_Store'], 'darwin')).toBeUndefined();
  });
});

describe('App Bundle for Google Play (PLAN 7.2, ADR-066)', () => {
  const keytoolOutput = (digest: string) =>
    `Signer #1:\n\nCertificate #1:\nOwner: CN=SkillForge\nCertificate fingerprints:\n\t SHA1: 12:34\n\t SHA256: ${digest}\nSignature algorithm name: SHA384withRSA\n`;
  const colons = (hex: string) => hex.toUpperCase().match(/../g)?.join(':') ?? '';

  it('runs bundleRelease with the upload signing switch the plugin reads', () => {
    expect(gradleCommand('win32', KNOWN_ABIS, true)).toEqual({
      command: 'gradlew.bat',
      args: [
        'bundleRelease',
        '--no-daemon',
        '-PreactNativeArchitectures=arm64-v8a,armeabi-v7a,x86,x86_64',
        '-PskillforgeUploadSigning=true',
      ],
    });
    expect(gradleCommand('linux', PHONE_ABIS).args).not.toContain('-PskillforgeUploadSigning=true');
    expect(UPLOAD_SIGNING_FLAG).toBe(PLUGIN_FLAG);
    expect([...UPLOAD_PROPERTIES]).toEqual([...PLUGIN_UPLOAD_PROPERTIES]);
  });

  it('names the bundle by version, versionCode and commit', () => {
    expect(aabFileName({ version: '0.8.0', versionCode: 8, commit: 'abc1234' })).toBe(
      'SkillForge-0.8.0-vc8-abc1234.aab',
    );
    expect(aabFileName({ version: '0.8.0', versionCode: 8 })).toBe('SkillForge-0.8.0-vc8.aab');
  });

  it('lists the upload properties neither gradle.properties nor the environment sets', () => {
    const file = [
      '# comment',
      'SKILLFORGE_UPLOAD_STORE_FILE=C:/keys/upload.jks',
      'SKILLFORGE_UPLOAD_KEY_ALIAS : upload',
      'org.gradle.jvmargs=-Xmx4g',
    ].join('\r\n');
    expect(missingUploadProperties(file, {})).toEqual([
      'SKILLFORGE_UPLOAD_STORE_PASSWORD',
      'SKILLFORGE_UPLOAD_KEY_PASSWORD',
    ]);
    expect(
      missingUploadProperties(file, {
        ORG_GRADLE_PROJECT_SKILLFORGE_UPLOAD_STORE_PASSWORD: 'x',
        ORG_GRADLE_PROJECT_SKILLFORGE_UPLOAD_KEY_PASSWORD: 'x',
      }),
    ).toEqual([]);
    expect(missingUploadProperties('', {})).toEqual([...UPLOAD_PROPERTIES]);
  });

  it('reads keytool digests and accepts only the upload key', () => {
    expect(parseKeytoolDigests(keytoolOutput(colons(UPLOAD_SIGNER_SHA256)))).toEqual([
      UPLOAD_SIGNER_SHA256,
    ]);
    expect(uploadSignerProblem([UPLOAD_SIGNER_SHA256])).toBeUndefined();
    expect(uploadSignerProblem([])).toMatch('no signer');
    // The debug key that signs the sideloaded APKs is not the upload key.
    expect(uploadSignerProblem([RELEASE_SIGNER_SHA256])).toMatch(RELEASE_SIGNER_SHA256);
  });

  it('pins the fingerprint of the key created in PLAN 7.1', () => {
    expect(colons(UPLOAD_SIGNER_SHA256)).toBe(
      '02:7D:80:6E:F6:CA:05:E3:45:3C:70:0C:1B:D9:F4:34:9F:6B:58:F8:A4:FF:E7:65:8E:C9:E2:75:F5:85:72:5D',
    );
  });

  it('looks for keytool in JAVA_HOME, then Android Studio, then PATH', () => {
    expect(keytoolCandidates({ JAVA_HOME: 'C:\\jdk' }, 'win32')).toEqual([
      'C:\\jdk\\bin\\keytool.exe',
      'C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\keytool.exe',
      'keytool.exe',
    ]);
    expect(keytoolCandidates({}, 'linux')).toEqual(['keytool']);
  });
});
