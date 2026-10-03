import { Pressable, StyleSheet, View } from 'react-native';

import { tierNumeral, type ClassRow } from '@/domain/classes';

import { Colors, PIXEL, Spacing } from '../theme';
import { PixelFrame, PixelText } from '../ui';

import { ClassEmblem, classColor } from './ClassEmblem';

type Props = {
  /** The worn class. */
  row: ClassRow;
  /** Classes with a reached tier the hero hasn't seen yet. */
  newCount: number;
  onPress: () => void;
  testID?: string;
};

/** "Warrior · tier II of III", or "Starting class" for a class with one tier. */
export function classTierLine(row: Pick<ClassRow, 'name' | 'tier' | 'tierCount'>): string {
  if (row.tierCount <= 1) return 'Starting class';
  return `${row.name} · tier ${tierNumeral(row.tier)} of ${tierNumeral(row.tierCount)}`;
}

/** The small gold "NEW" tag (also used in the class sheet). */
export function NewBadge({ label = 'NEW', testID }: { label?: string; testID?: string }) {
  return (
    <PixelFrame
      frame={{ lines: [Colors.ink, Colors.goldLight], fill: Colors.gold }}
      shadow={false}
      padding={PIXEL * 2}
      testID={testID}>
      <PixelText variant="label" color={Colors.textOnGold}>
        {label}
      </PixelText>
    </PixelFrame>
  );
}

/**
 * The worn hero class on the Character tab (PLAN 6.9): its emblem in the tier frame, the tier's
 * title in the class color and the tier line. A button that opens the class sheet; a NEW tag
 * while a reached tier is unseen.
 */
export function ClassBanner({ row, newCount, onPress, testID }: Props) {
  const line = classTierLine(row);
  const label =
    `Class: ${row.title}. ${line}.` +
    (newCount > 0 ? ` ${newCount} new ${newCount === 1 ? 'class tier' : 'class tiers'}.` : '');
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Shows every class, what each needs, and lets you pick the one to wear">
      {() => (
        <View style={styles.row}>
          <ClassEmblem classId={row.classId} tier={row.tier} />
          <View style={styles.text}>
            <PixelText variant="label" tone="textMuted">
              Class
            </PixelText>
            <PixelText variant="title" color={classColor(row.classId)} testID={`${testID}-title`}>
              {row.title}
            </PixelText>
            <PixelText variant="small" tone="textMuted">
              {line}
            </PixelText>
            <PixelText variant="label" tone="rune">
              See all classes
            </PixelText>
          </View>
          {newCount > 0 && <NewBadge label={`${newCount} NEW`} testID={`${testID}-new`} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  text: {
    flex: 1,
  },
});
