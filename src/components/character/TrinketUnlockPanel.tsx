import { StyleSheet, View } from 'react-native';

import { ACCESSORY_BY_ID } from '@/data/companion/accessories';

import { Spacing } from '../theme';
import { BURST_TITLES, LevelUpBurst, PixelFrame, PixelText } from '../ui';

import { companionRuleText, SLOT_LABELS } from './companionText';

type Props = {
  /** The accessories the session earned (`sessionAccessoryUnlocks`). */
  accessoryIds: readonly string[];
  /** Plays the NEW TRINKET! burst (the fresh summary); off for history. */
  celebrate: boolean;
  playKey: string;
};

/**
 * The companion accessories a session earned (PLAN 6.10): a NEW TRINKET! burst, then one line per
 * accessory with its slot and what earned it. The companion wears a new item in a slot the hero
 * never chose for on its own; the customize sheet changes it. Renders nothing without any.
 */
export function TrinketUnlockPanel({ accessoryIds, celebrate, playKey }: Props) {
  const items = accessoryIds.flatMap((id) => {
    const item = ACCESSORY_BY_ID.get(id);
    return item ? [item] : [];
  });
  if (items.length === 0) return null;
  return (
    <PixelFrame variant="gold" contentStyle={styles.gap} testID="summary-trinkets">
      {celebrate ? (
        <LevelUpBurst
          title={BURST_TITLES.newTrinket}
          subtitle={items[0].name}
          playKey={`${playKey}-trinket`}
        />
      ) : (
        <PixelText variant="label" tone="gold" accessibilityRole="header">
          Trinkets earned
        </PixelText>
      )}
      {items.map((item) => (
        <View
          key={item.id}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${item.name}, ${SLOT_LABELS[item.slot]}. ${companionRuleText(item.rule)}`}
          testID={`summary-trinket-${item.id}`}>
          <PixelText variant="heading">{item.name}</PixelText>
          <PixelText variant="label" tone="textMuted">
            {`${SLOT_LABELS[item.slot]} · ${companionRuleText(item.rule)}`}
          </PixelText>
        </View>
      ))}
      <PixelText variant="small" tone="textMuted">
        See it on your companion in the Character tab.
      </PixelText>
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
});
