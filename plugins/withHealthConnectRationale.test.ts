import type { AndroidManifest } from 'expo/config-plugins';

import {
  applyHealthConnectRationale,
  PRIVACY_POLICY_URL,
  RATIONALE_ACTION,
  rationaleActivitySource,
} from './withHealthConnectRationale';

const action = (name: string) => ({ action: [{ $: { 'android:name': name } }] });

/** A manifest as react-native-health-connect's plugin leaves it (both entries on MainActivity). */
function libraryManifest(): AndroidManifest {
  return {
    manifest: {
      $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
      application: [
        {
          $: { 'android:name': '.MainApplication' },
          activity: [
            {
              $: { 'android:name': '.MainActivity' },
              'intent-filter': [action('android.intent.action.MAIN'), action(RATIONALE_ACTION)],
            },
          ],
          'activity-alias': [
            {
              $: {
                'android:name': 'ViewPermissionUsageActivity',
                'android:targetActivity': '.MainActivity',
              },
            },
          ],
        },
      ],
    },
  } as unknown as AndroidManifest;
}

const application = (manifest: AndroidManifest) => {
  const [app] = manifest.manifest.application ?? [];
  if (!app) throw new Error('expected an application');
  return app;
};

describe('withHealthConnectRationale', () => {
  it('moves the privacy policy link from the main activity to the rationale activity', () => {
    const manifest = applyHealthConnectRationale(libraryManifest());
    const [main, rationale] = application(manifest).activity!;
    expect(main['intent-filter']).toEqual([action('android.intent.action.MAIN')]);
    expect(rationale.$['android:name']).toBe('.HealthPermissionsRationaleActivity');
    expect(rationale['intent-filter']).toEqual([action(RATIONALE_ACTION)]);
    const aliases = application(manifest)['activity-alias']!;
    expect(aliases).toHaveLength(1);
    expect(aliases[0]?.$?.['android:targetActivity']).toBe('.HealthPermissionsRationaleActivity');
  });

  it('is idempotent and works without the library plugin', () => {
    const once = applyHealthConnectRationale(libraryManifest());
    const twice = applyHealthConnectRationale(structuredClone(once));
    expect(twice).toEqual(once);
    const bare = libraryManifest();
    delete application(bare)['activity-alias'];
    expect(application(applyHealthConnectRationale(bare))['activity-alias']).toHaveLength(1);
  });

  it('opens the privacy policy and closes', () => {
    const source = rationaleActivitySource('at.skillforge.app');
    expect(source).toContain('package at.skillforge.app');
    expect(source).toContain(PRIVACY_POLICY_URL);
    expect(source).toContain('finish()');
    expect(PRIVACY_POLICY_URL).toMatch(/\/privacy\/#health-connect$/);
  });
});
