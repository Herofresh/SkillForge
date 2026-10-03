import { StyleSheet, View } from 'react-native';

import { hasTendonWarning } from '@/domain/safeguards';
import type { SafeguardWarning } from '@/domain/types';

import { Spacing } from '../theme';
import { PixelText } from '../ui';

import { GuideButton } from './GuideButton';

/**
 * "Why these warnings?" with the guide's "i" (PLAN 6.10c), above a list of advisory warnings when
 * one of them is a tendon safeguard. Nothing for the prerequisites note alone.
 */
export function SafeguardGuideNote({ warnings }: { warnings: readonly SafeguardWarning[] }) {
  if (!hasTendonWarning(warnings)) return null;
  return (
    <View style={styles.row}>
      <PixelText variant="small" tone="textMuted" style={styles.flex}>
        Why these warnings?
      </PixelText>
      <GuideButton topic="safeguards" testID="guide-safeguards-warnings" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
