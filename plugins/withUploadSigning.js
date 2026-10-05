/**
 * Config plugin (PLAN 7.2, ADR-066): Play signing and native debug symbols for the generated
 * android/app/build.gradle, so `expo prebuild --clean` can't lose them.
 *
 * - An `upload` signing config that reads the upload key from Gradle project properties
 *   (`~/.gradle/gradle.properties` or `ORG_GRADLE_PROJECT_*` environment variables, never the repo):
 *   SKILLFORGE_UPLOAD_STORE_FILE, SKILLFORGE_UPLOAD_STORE_PASSWORD, SKILLFORGE_UPLOAD_KEY_ALIAS,
 *   SKILLFORGE_UPLOAD_KEY_PASSWORD.
 * - The release build type uses it only when the build passes `-PskillforgeUploadSigning`
 *   (`npm run build:aab`); otherwise it keeps the debug key, so `npm run build:apk` still makes
 *   APKs that update over every earlier GitHub release (ADR-043). Asked for upload signing without
 *   the properties, Gradle stops instead of falling back to the debug key.
 * - `ndk { debugSymbolLevel 'SYMBOL_TABLE' }`, so the App Bundle carries native debug symbols
 *   (Play Console warns about every upload without them).
 *
 * The transforms are pure string functions (tested in withUploadSigning.test.ts); each one fails
 * loudly when the Expo template changes so much that its anchor is gone.
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const UPLOAD_PROPERTIES = [
  'SKILLFORGE_UPLOAD_STORE_FILE',
  'SKILLFORGE_UPLOAD_STORE_PASSWORD',
  'SKILLFORGE_UPLOAD_KEY_ALIAS',
  'SKILLFORGE_UPLOAD_KEY_PASSWORD',
];
const UPLOAD_SIGNING_FLAG = 'skillforgeUploadSigning';
const MARKER = '// SkillForge upload signing (plugins/withUploadSigning.js)';

const UPLOAD_SIGNING_CONFIG = `
        ${MARKER}
        upload {
            if (project.hasProperty('${UPLOAD_SIGNING_FLAG}')) {
                def missing = ${JSON.stringify(UPLOAD_PROPERTIES).replace(/"/g, "'")}.findAll { !project.hasProperty(it) }
                if (!missing.isEmpty()) {
                    throw new GradleException("Upload signing needs " + missing.join(', ') + " in ~/.gradle/gradle.properties (PLAN 7.1)")
                }
                storeFile file(SKILLFORGE_UPLOAD_STORE_FILE)
                storePassword SKILLFORGE_UPLOAD_STORE_PASSWORD
                keyAlias SKILLFORGE_UPLOAD_KEY_ALIAS
                keyPassword SKILLFORGE_UPLOAD_KEY_PASSWORD
            }
        }`;

const RELEASE_SIGNING = `signingConfig project.hasProperty('${UPLOAD_SIGNING_FLAG}') ? signingConfigs.upload : signingConfigs.debug`;

const DEBUG_SYMBOLS = `
        ndk {
            debugSymbolLevel 'SYMBOL_TABLE'
        }`;

function replaceOnce(contents, pattern, replacement, what) {
  if (!pattern.test(contents)) {
    throw new Error(`withUploadSigning: could not find ${what} in android/app/build.gradle`);
  }
  return contents.replace(pattern, replacement);
}

/** Adds the upload signing config, release signing switch and debug symbols. Idempotent. */
function applyUploadSigning(contents) {
  if (contents.includes(MARKER)) return contents;
  let result = replaceOnce(
    contents,
    /(signingConfigs\s*\{)/,
    `$1${UPLOAD_SIGNING_CONFIG}`,
    'the signingConfigs block',
  );
  result = replaceOnce(
    result,
    /(release\s*\{[^}]*?)signingConfig signingConfigs\.debug/,
    `$1${RELEASE_SIGNING}`,
    'the release signingConfig',
  );
  result = replaceOnce(
    result,
    /(defaultConfig\s*\{)/,
    `$1${DEBUG_SYMBOLS}`,
    'the defaultConfig block',
  );
  return result;
}

const withUploadSigning = (config) =>
  withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') {
      throw new Error('withUploadSigning: only a Groovy build.gradle is supported');
    }
    mod.modResults.contents = applyUploadSigning(mod.modResults.contents);
    return mod;
  });

module.exports = withUploadSigning;
module.exports.applyUploadSigning = applyUploadSigning;
module.exports.UPLOAD_PROPERTIES = UPLOAD_PROPERTIES;
module.exports.UPLOAD_SIGNING_FLAG = UPLOAD_SIGNING_FLAG;
