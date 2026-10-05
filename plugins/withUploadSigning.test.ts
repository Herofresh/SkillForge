import { applyUploadSigning, UPLOAD_PROPERTIES, UPLOAD_SIGNING_FLAG } from './withUploadSigning';

/** The parts of Expo SDK 57's android/app/build.gradle the plugin edits. */
const TEMPLATE = `android {
    namespace 'at.skillforge.app'
    defaultConfig {
        applicationId 'at.skillforge.app'
        versionCode 7
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
            minifyEnabled enableMinifyInReleaseBuilds
        }
    }
}
`;

describe('withUploadSigning', () => {
  const result = applyUploadSigning(TEMPLATE);

  it('adds an upload signing config read from the four Gradle properties', () => {
    expect(result).toMatch(/signingConfigs \{\s*\/\/ SkillForge upload signing[\s\S]*upload \{/);
    for (const property of UPLOAD_PROPERTIES) expect(result).toContain(property);
    expect(result).toContain('storeFile file(SKILLFORGE_UPLOAD_STORE_FILE)');
    // Asked for upload signing without the properties: fail, never fall back to the debug key.
    expect(result).toContain('throw new GradleException');
  });

  it('signs release builds with the upload key only when the build asks for it', () => {
    const release = result.slice(result.indexOf('release {'));
    expect(release).toContain(
      `signingConfig project.hasProperty('${UPLOAD_SIGNING_FLAG}') ? signingConfigs.upload : signingConfigs.debug`,
    );
    // Debug builds and the default release (build:apk) keep the debug key (ADR-043).
    const debug = result.slice(result.indexOf('buildTypes {'), result.indexOf('release {'));
    expect(debug).toContain('signingConfig signingConfigs.debug');
  });

  it('adds native debug symbols to the App Bundle', () => {
    expect(result).toMatch(/defaultConfig \{\s*ndk \{\s*debugSymbolLevel 'SYMBOL_TABLE'/);
  });

  it('is idempotent and keeps the rest of the file', () => {
    expect(applyUploadSigning(result)).toBe(result);
    expect(result).toContain("storeFile file('debug.keystore')");
    expect(result).toContain('minifyEnabled enableMinifyInReleaseBuilds');
    expect(result).toContain('versionCode 7');
  });

  it('fails loudly when the template no longer has an anchor', () => {
    expect(() => applyUploadSigning('android {\n}\n')).toThrow(/signingConfigs block/);
    const noRelease = TEMPLATE.replace(/release \{[\s\S]*?\n {8}\}/, '');
    expect(() => applyUploadSigning(noRelease)).toThrow(/release signingConfig/);
  });
});
