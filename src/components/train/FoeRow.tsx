import { ScrollView, StyleSheet } from 'react-native';

import type { ExerciseFoes } from '@/domain/battleView';
import { t } from '@/i18n';

import { Spacing } from '../theme';
import { AddFoeToken, MonsterToken } from './MonsterToken';

type Props = {
  foes: ExerciseFoes;
  /** Tap on foe `slot` (Battle); without it the row only shows (Classic). */
  onTap?: (slot: number) => void;
  /** Long press on foe `slot`: edit a logged set, or log a fresh one with the stepper. */
  onLongPress?: (slot: number) => void;
  disabled?: boolean;
  testID: string;
};

/**
 * An exercise's sets as a row of monsters (PLAN 7.9, ADR-071), scrolling sideways when there are
 * many. With `onTap` the row is the Battle view's logger and ends in a "+" ghost for an extra set.
 */
export function FoeRow({ foes, onTap, onLongPress, disabled = false, testID }: Props) {
  const tapHint =
    foes.metric === 'hold_s'
      ? t('Starts or stops the hold; long press to enter the result')
      : t('Logs the target; long press to enter the result');
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      testID={testID}>
      {foes.foes.map((foe) => (
        <MonsterToken
          key={foe.slot}
          kind={foes.monster}
          foe={foe}
          onPress={onTap && (() => onTap(foe.slot))}
          onLongPress={onLongPress && (() => onLongPress(foe.slot))}
          accessibilityHint={
            foe.actual === undefined
              ? tapHint
              : foes.metric === 'hold_s'
                ? t('Edits the set')
                : t('One rep fewer, below zero it is removed; long press to edit')
          }
          disabled={disabled}
          testID={`${testID}-foe-${foe.slot}`}
        />
      ))}
      {onTap && (
        <AddFoeToken
          onPress={() => onTap(foes.foes.length)}
          disabled={disabled}
          accessibilityLabel={t('Extra set of {name}', { name: foes.exercise.name })}
          testID={`${testID}-add`}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
});
