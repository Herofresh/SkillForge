import { StyleSheet, View } from 'react-native';

import { HEALTH_DISCLAIMER, HEALTH_DISCLAIMER_TITLE } from '@/data/notices';

import { Spacing } from './theme';
import { PixelFrame, PixelIcon, PixelText } from './ui';

/**
 * The health disclaimer as a short framed notice (PLAN 7.0b, ADR-064): onboarding step 1 and
 * Settings → About. Informational only, no extra tap.
 */
export function HealthNotice({ testID = 'health-notice' }: { testID?: string }) {
  return (
    <View testID={testID}>
      <PixelFrame variant="gold" contentStyle={styles.gap}>
        <View style={styles.header}>
          <PixelIcon name="shield" />
          <PixelText variant="label" tone="gold" accessibilityRole="header">
            {HEALTH_DISCLAIMER_TITLE}
          </PixelText>
        </View>
        <PixelText variant="small">{HEALTH_DISCLAIMER}</PixelText>
      </PixelFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
