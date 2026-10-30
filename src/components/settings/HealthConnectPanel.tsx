import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { k, t } from '@/i18n';
import type { HealthConnectEnableResult, HealthConnectStatus } from '@/store/appStore';
import { useAppStore } from '@/store/useAppStore';

import { DetailSection } from '../node/DetailSection';
import { Spacing } from '../theme';
import { PixelButton, PixelText } from '../ui';

/** Health Connect on Google Play (Android 13 and older install it from there). */
const HEALTH_CONNECT_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';

const WHAT_IS_WRITTEN = k(
  'Adds every workout you finish to Health Connect as a calisthenics session, with a note of what you did (“Pull-up: 5, 5, 4 reps”). SkillForge reads nothing from it.',
);

const STATUS_TEXT: Readonly<Record<Exclude<HealthConnectStatus, 'available'>, string>> = {
  not_installed: k(
    'Health Connect isn’t on this phone yet. Install it from Google Play, then come back.',
  ),
  needs_update: k('Health Connect needs an update from Google Play first.'),
  unsupported: k('Health Connect isn’t available in this version of the app.'),
};

const ENABLE_TEXT: Readonly<Record<Exclude<HealthConnectEnableResult, 'enabled'>, string>> = {
  denied: k(
    'SkillForge wasn’t allowed to write exercise. Turn it on again to choose, or allow it in Health Connect.',
  ),
  ...STATUS_TEXT,
};

/**
 * Settings → Health Connect (PLAN 7.10, ADR-072): off by default. Turning it on asks Android for
 * the permission to write exercise; from then on every finished session is written. Turning it off
 * only stops writing; the permission and the written workouts are managed in Health Connect.
 */
export function HealthConnectPanel() {
  const enabled = useAppStore((state) => state.healthConnectEnabled);
  const readStatus = useAppStore((state) => state.healthConnectStatus);
  const enable = useAppStore((state) => state.enableHealthConnect);
  const disable = useAppStore((state) => state.disableHealthConnect);
  const openSettings = useAppStore((state) => state.openHealthConnectSettings);
  const [status, setStatus] = useState<HealthConnectStatus | undefined>();
  const [note, setNote] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    readStatus()
      .then((value) => live && setStatus(value))
      .catch(() => live && setStatus('unsupported'));
    return () => {
      live = false;
    };
  }, [readStatus]);

  const turnOn = async () => {
    setBusy(true);
    try {
      const result = await enable();
      setNote(result === 'enabled' ? undefined : t(ENABLE_TEXT[result]));
      if (result !== 'enabled' && result !== 'denied') setStatus(result);
    } catch {
      setNote(t('Health Connect didn’t respond. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DetailSection title="Health Connect" icon="heart" testID="settings-health-connect">
      <PixelText variant="small" tone="textMuted">
        {t(WHAT_IS_WRITTEN)}
      </PixelText>
      {enabled && (
        <PixelText tone="success" testID="health-connect-on">
          {t('On: finished workouts are added to Health Connect.')}
        </PixelText>
      )}
      {status !== undefined && status !== 'available' && (
        <PixelText variant="small" testID="health-connect-status">
          {t(STATUS_TEXT[status])}
        </PixelText>
      )}
      {note !== undefined && (
        <PixelText variant="small" tone="ember" testID="health-connect-note">
          {note}
        </PixelText>
      )}
      <View style={styles.gap}>
        {(status === 'not_installed' || status === 'needs_update') && (
          <PixelButton
            label={status === 'needs_update' ? t('Update Health Connect') : t('Get Health Connect')}
            variant="secondary"
            onPress={() => void Linking.openURL(HEALTH_CONNECT_STORE_URL).catch(() => undefined)}
            testID="health-connect-install"
          />
        )}
        {enabled ? (
          <>
            <PixelButton
              label={t('Open Health Connect')}
              variant="secondary"
              onPress={openSettings}
              accessibilityHint={t('Permissions and the workouts SkillForge added')}
              testID="health-connect-open"
            />
            <PixelButton
              label={t('Stop adding workouts')}
              variant="secondary"
              onPress={disable}
              testID="health-connect-off"
            />
          </>
        ) : (
          status === 'available' && (
            <PixelButton
              label={t('Add workouts to Health Connect')}
              icon="heart"
              onPress={() => void turnOn()}
              disabled={busy}
              accessibilityHint={t('Asks Android for permission to write exercise')}
              testID="health-connect-on-button"
            />
          )
        )}
      </View>
    </DetailSection>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
});
