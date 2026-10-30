import { StyleSheet, View } from 'react-native';

import type { BattleBlock } from '@/domain/battleView';
import type { ActiveSession } from '@/domain/train';
import { k, t } from '@/i18n';

import { Spacing } from '../theme';
import { SetTimerPanel } from '../timer/SetTimerPanel';
import { PixelText } from '../ui';
import { ExerciseCard } from './ExerciseCard';
import { FoeRow } from './FoeRow';

type Props = {
  blocks: BattleBlock[];
  session: ActiveSession;
  /** Warnings wait for their "I understand": the foes wait too. */
  disabled: boolean;
  pendingNote?: string;
  onTap: (key: string, slot: number) => void;
  onLongPress: (key: string, slot: number) => void;
  /** Opens the info sheet of a node. */
  onInfo: (nodeId: string) => void;
  /** Opens the swap sheet of exercise `key` (FB-16). */
  onSwap: (key: string, name: string) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
};

const TAP_HELP = k(
  'Tap a monster to beat its set at the target; tap it again for one rep fewer. Long press to enter an exact number or edit a set. Holds: tap to start the timer, tap again to stop.',
);

/**
 * The Battle view of the live session (PLAN 7.9, ADR-071): every exercise as a card with its sets as
 * a row of monsters, by block, each with its "i". A tap logs a set (`tapTrainingFoe`); a running
 * hold shows its timer under the row, and its Stop logs the seconds held.
 */
export function BattleBoard({
  blocks,
  session,
  disabled,
  pendingNote,
  onTap,
  onLongPress,
  onInfo,
  onSwap,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
}: Props) {
  return (
    <View style={styles.gap} testID="battle-board">
      <PixelText variant="small" tone="textMuted">
        {pendingNote ?? t(TAP_HELP)}
      </PixelText>
      {blocks.map((block, index) => (
        <View key={`${block.kind}-${index}`} style={styles.gap}>
          <PixelText variant="label" tone="gold" accessibilityRole="header">
            {block.label}
          </PixelText>
          {block.exercises.map((entry) => {
            const { key } = entry.exercise;
            const timer = session.timer?.exerciseKey === key ? session.timer : undefined;
            return (
              <ExerciseCard
                key={key}
                exercise={entry.exercise}
                highlighted={timer !== undefined}
                onInfo={() => onInfo(entry.exercise.nodeId)}
                onSwap={() => onSwap(key, entry.exercise.name)}
                testID={`battle-${key}`}>
                <FoeRow
                  foes={entry}
                  onTap={(slot) => onTap(key, slot)}
                  onLongPress={(slot) => onLongPress(key, slot)}
                  disabled={disabled}
                  testID={`battle-${key}-foes`}
                />
                {timer && (
                  <SetTimerPanel
                    metric={entry.metric}
                    targetSec={entry.target.value}
                    timer={timer}
                    onStart={() => onTap(key, entry.nextSlot)}
                    onStop={() => onTap(key, entry.nextSlot)}
                    onPause={onPauseTimer}
                    onResume={onResumeTimer}
                    onReset={onResetTimer}
                    testID={`battle-${key}-timer`}
                  />
                )}
              </ExerciseCard>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
});
