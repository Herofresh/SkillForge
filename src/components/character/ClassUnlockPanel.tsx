import { StyleSheet, View } from 'react-native';

import { HERO_CLASS_BY_ID } from '@/data/classes';
import { classTitle, tierNumeral, type ClassTierUp } from '@/domain/classes';

import { Spacing } from '../theme';
import { BURST_TITLES, LevelUpBurst, PixelButton, PixelFrame, PixelText } from '../ui';

import { ClassEmblem, classColor } from './ClassEmblem';

type Props = {
  /** The class tiers the session reached (`sessionClassTierUps`). */
  tierUps: readonly ClassTierUp[];
  /** The class the hero wears now (no "Wear" button for it). */
  wornClassId: string;
  /** Plays the CLASS UNLOCKED! / TIER UP! burst (the fresh summary); off for history. */
  celebrate: boolean;
  playKey: string;
  /** Wear a class from here; omit to show no buttons. */
  onWear?: (classId: string) => void;
};

/**
 * The hero classes a session unlocked or raised a tier (PLAN 6.9): a CLASS UNLOCKED! burst (TIER
 * UP! when every one is a higher tier), then one line per class at its highest new tier, with a
 * button to wear it. Renders nothing when the session reached no class tier.
 */
export function ClassUnlockPanel({ tierUps, wornClassId, celebrate, playKey, onWear }: Props) {
  // One line per class: its highest tier reached in this session.
  const highest = new Map<string, number>();
  for (const { classId, tier } of tierUps) {
    highest.set(classId, Math.max(tier, highest.get(classId) ?? 0));
  }
  const lines = [...highest].flatMap(([classId, tier]) => {
    const heroClass = HERO_CLASS_BY_ID.get(classId);
    return heroClass
      ? [{ classId, tier, title: classTitle(heroClass, tier), name: heroClass.name }]
      : [];
  });
  if (lines.length === 0) return null;
  const anyNew = lines.some((line) =>
    tierUps.some((up) => up.classId === line.classId && up.tier === 1),
  );
  const burstTitle = anyNew ? BURST_TITLES.classUnlocked : BURST_TITLES.classTierUp;
  return (
    <PixelFrame variant="arcane" contentStyle={styles.gap} testID="summary-classes">
      {celebrate ? (
        <LevelUpBurst title={burstTitle} subtitle={lines[0].title} playKey={`${playKey}-class`} />
      ) : (
        <PixelText variant="label" tone="arcane" accessibilityRole="header">
          {anyNew ? 'Classes unlocked' : 'Class tiers reached'}
        </PixelText>
      )}
      {lines.map((line) => (
        <View key={line.classId} style={styles.gap}>
          <View
            style={styles.row}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${line.title}: ${line.name} tier ${tierNumeral(line.tier)}`}
            testID={`summary-class-${line.classId}`}>
            <ClassEmblem classId={line.classId} tier={line.tier} />
            <View style={styles.text}>
              <PixelText variant="heading" color={classColor(line.classId)}>
                {line.title}
              </PixelText>
              <PixelText variant="label" tone="textMuted">
                {line.tier === 1
                  ? `${line.name} class unlocked`
                  : `${line.name} · tier ${tierNumeral(line.tier)}`}
              </PixelText>
            </View>
          </View>
          {onWear && line.classId !== wornClassId && (
            <PixelButton
              label={`Wear ${line.title}`}
              icon="helmet"
              variant="secondary"
              onPress={() => onWear(line.classId)}
              testID={`summary-class-${line.classId}-wear`}
            />
          )}
        </View>
      ))}
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
  text: {
    flex: 1,
  },
});
