import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, PIXEL, Spacing } from '../theme';
import { PixelFrame, PixelText } from '../ui';

import { CompanionSprite } from './CompanionSprite';
import { useCompanion } from './useCompanion';

/**
 * The companion's victory pose on the Train summary (PLAN 6.10): it raises its class weapon in
 * the hero's gear, next to a short cheer.
 */
export function CompanionVictory({ testID = 'summary-companion' }: { testID?: string }) {
  const [now] = useState(() => Date.now());
  const view = useCompanion(now);
  return (
    <PixelFrame testID={testID}>
      <View style={styles.row}>
        <View style={styles.stage}>
          <CompanionSprite animation="victory" outfit={view.outfit} look={view.look} scale={3} />
        </View>
        <View style={styles.text}>
          <PixelText variant="title" tone="gold">
            Victory!
          </PixelText>
          <PixelText variant="small" tone="textMuted">
            Your companion cheers for this session.
          </PixelText>
        </View>
      </View>
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stage: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: PIXEL,
    borderColor: Colors.border,
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
  },
});
