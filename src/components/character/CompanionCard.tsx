import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { COMPANION_ANIMATIONS } from '@/data/companion';
import { FRAME_MS } from '@/lib/figureAnimation';

import { Colors, PIXEL, Spacing } from '../theme';
import { PixelButton, PixelFrame, PixelText } from '../ui';

import { NewBadge } from './ClassBanner';
import { CompanionSprite } from './CompanionSprite';
import type { CompanionView } from './useCompanion';

/** How long a tap's wave lasts: one loop of the wave animation. */
const WAVE_MS = COMPANION_ANIMATIONS.wave.reduce((sum, frame) => sum + frame.hold, 0) * FRAME_MS;

type Props = {
  view: CompanionView;
  onCustomize: () => void;
  testID?: string;
};

/**
 * The companion on the Character tab (PLAN 6.10): the hero as a small pixel character idling in
 * its mood, the mood in words, the class weapon it carries and a Customize button (with a NEW tag
 * for unseen accessories). Tapping it makes it wave. Its mood never costs anything: it only
 * changes the pose and the line.
 */
export function CompanionCard({ view, onCustomize, testID = 'companion' }: Props) {
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    if (!waving) return;
    const timer = setTimeout(() => setWaving(false), WAVE_MS);
    return () => clearTimeout(timer);
  }, [waving]);

  return (
    <PixelFrame contentStyle={styles.gap} testID={testID}>
      <PixelText variant="label" tone="rune" accessibilityRole="header">
        Companion
      </PixelText>
      <View style={styles.row}>
        <Pressable
          onPress={() => setWaving(true)}
          accessibilityRole="button"
          accessibilityLabel={`Your companion, ${view.title.toLowerCase()}. ${view.line}`}
          accessibilityHint="Your companion waves at you"
          testID={`${testID}-sprite`}
          style={styles.stage}>
          <CompanionSprite
            animation={waving ? 'wave' : view.mood}
            outfit={view.outfit}
            look={view.look}
            scale={4}
          />
        </Pressable>
        <View style={styles.text}>
          <PixelText variant="title" tone="gold" testID={`${testID}-mood`}>
            {view.title}
          </PixelText>
          <PixelText variant="small" testID={`${testID}-line`}>
            {view.line}
          </PixelText>
          <PixelText variant="label" tone="textMuted" testID={`${testID}-weapon`}>
            {view.weaponName}
          </PixelText>
        </View>
      </View>
      <View style={styles.row}>
        <PixelButton
          label="Customize"
          icon="helmet"
          variant="secondary"
          onPress={onCustomize}
          style={styles.flex}
          testID={`${testID}-customize`}
        />
        {view.newCount > 0 && <NewBadge label={`${view.newCount} NEW`} testID={`${testID}-new`} />}
      </View>
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
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
  flex: {
    flex: 1,
  },
});
