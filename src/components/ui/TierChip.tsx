import { StyleSheet, View } from 'react-native';

import type { Tier } from '@/domain/types';
import { k, t } from '@/i18n';

import { Colors, Spacing, TierColors } from '../theme';

import { PixelFrame } from './PixelFrame';
import { PixelText } from './PixelText';

/** Display names of the tiers (the domain names them, the UI words them); translated where shown. */
export const TIER_LABELS: Readonly<Record<Tier, string>> = {
  beginner: k('Beginner'),
  intermediate: k('Intermediate'),
  advanced: k('Advanced'),
  elite: k('Elite'),
};

type Props = {
  tier: Tier;
  testID?: string;
};

/** A small tier tag in the tier's color. */
export function TierChip({ tier, testID }: Props) {
  const color = TierColors[tier];
  const label = t(TIER_LABELS[tier]);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={t('{tier} tier', { tier: label })}
      style={styles.wrapper}>
      <PixelFrame
        frame={{ lines: [Colors.ink, color], fill: Colors.surface }}
        shadow={false}
        padding={Spacing.xs}>
        <PixelText variant="label" color={color} style={styles.text}>
          {label}
        </PixelText>
      </PixelFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  text: {
    paddingHorizontal: Spacing.xs,
  },
});
