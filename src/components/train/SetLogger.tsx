import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { stepTrialResult } from '@/domain/assessment';
import { formatPerformance } from '@/domain/format';
import { measuredSeconds, timedPerformance, timerModeFor, type SetTimer } from '@/domain/setTimer';
import type { SetMark } from '@/domain/train';
import type { CurrentExerciseView, LoggedSetView } from '@/domain/trainView';
import type { ExerciseNode, SetPerformance } from '@/domain/types';

import { Colors, Spacing, TOUCH_TARGET } from '../theme';
import { SetTimerPanel } from '../timer/SetTimerPanel';
import { NumberStepper, PixelButton, PixelIcon, PixelText } from '../ui';

type Props = {
  node: ExerciseNode;
  current: CurrentExerciseView;
  onLog: (entered: SetPerformance, mark: SetMark) => void;
  /** Warnings wait for their "I understand": the note says so and the buttons wait. */
  pendingNote?: string;
  /** The exercise timer of this set (PLAN 5.4), running or stopped; `undefined` = not started. */
  timer?: SetTimer;
  onStartTimer: () => void;
  /** Stops the timer and returns what it measured (whole seconds). */
  onStopTimer: () => number | undefined;
  onResetTimer: () => void;
  /** Opens the edit sheet of a logged set (PLAN 5.9); without it the lines are plain text. */
  onEditSet?: (set: LoggedSetView) => void;
};

const OUTCOME_ICONS = { success: 'check', partial: 'alert', failed: 'cross' } as const;

/**
 * Logging one set of the current exercise: the optional exercise timer, a stepper that starts at the
 * suggestion (last result or the target; for a hold stopped by the timer, the seconds held), then
 * "Log set", or mark it partial / failed. Tapping a logged set's line edits it (`onEditSet`). Mount
 * it with a key per set so the stepper starts fresh.
 */
export function SetLogger({
  node,
  current,
  onLog,
  pendingNote,
  timer,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onEditSet,
}: Props) {
  const [entered, setEntered] = useState<SetPerformance>(() =>
    timer?.stoppedAt !== undefined
      ? timedPerformance(
          current.metric,
          current.suggested,
          measuredSeconds(timer, timerModeFor(current.metric), timer.stoppedAt),
        )
      : current.suggested,
  );
  const stopTimer = () => {
    const seconds = onStopTimer();
    if (seconds !== undefined)
      setEntered((value) => timedPerformance(current.metric, value, seconds));
  };
  const waiting = pendingNote !== undefined;
  const setLabel =
    current.setNumber > current.plannedSets
      ? `Extra set ${current.setNumber}`
      : `Set ${current.setNumber} of ${current.plannedSets}`;
  return (
    <View style={styles.gap}>
      {current.sets.map((set) => {
        const text = `Set ${set.index + 1}: ${set.text}`;
        const line = (
          <>
            <PixelIcon name={OUTCOME_ICONS[set.outcome]} label={set.outcome} />
            <PixelText variant="small" style={styles.lineText}>
              {text}
            </PixelText>
          </>
        );
        if (!onEditSet) {
          return (
            <View key={set.index} style={styles.logged} testID={`logged-set-${set.index}`}>
              {line}
            </View>
          );
        }
        return (
          <Pressable
            key={set.index}
            onPress={() => onEditSet(set)}
            accessibilityRole="button"
            accessibilityLabel={`${text}, ${set.outcome}`}
            accessibilityHint="Edit or delete this set"
            testID={`logged-set-${set.index}`}
            style={({ pressed }) => [styles.logged, styles.editable, pressed && styles.pressed]}>
            {line}
            <PixelIcon name="quill" />
          </Pressable>
        );
      })}
      <PixelText variant="label" tone="rune" testID="set-label">
        {setLabel}
      </PixelText>
      <PixelText variant="small" tone="textMuted">
        {`Target: ${formatPerformance(current.metric, current.target)}`}
      </PixelText>
      <SetTimerPanel
        metric={current.metric}
        targetSec={current.target.value}
        timer={timer}
        onStart={onStartTimer}
        onStop={stopTimer}
        onReset={onResetTimer}
        testID="set-timer"
      />
      <NumberStepper
        label="Did"
        valueText={formatPerformance(current.metric, entered)}
        onDecrement={() => setEntered((value) => stepTrialResult(node, value, -1))}
        onIncrement={() => setEntered((value) => stepTrialResult(node, value, 1))}
        decrementDisabled={entered.value <= 0}
        testID="set-stepper"
      />
      {waiting && (
        <PixelText variant="small" tone="textMuted">
          {pendingNote}
        </PixelText>
      )}
      <PixelButton
        label="Log set"
        icon="check"
        onPress={() => onLog(entered, 'done')}
        disabled={waiting}
        accessibilityHint="Logs the set as entered"
        testID="log-set"
      />
      <View style={styles.row}>
        <PixelButton
          label="Partial"
          variant="secondary"
          onPress={() => onLog(entered, 'partial')}
          disabled={waiting}
          accessibilityHint="Logs the set as short of the target"
          testID="log-set-partial"
          style={styles.half}
        />
        <PixelButton
          label="Failed"
          variant="secondary"
          onPress={() => onLog(entered, 'failed')}
          disabled={waiting}
          accessibilityHint="Logs the set as not done"
          testID="log-set-failed"
          style={styles.half}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  logged: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  editable: {
    minHeight: TOUCH_TARGET,
  },
  pressed: {
    backgroundColor: Colors.surfaceRaised,
  },
  lineText: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
});
