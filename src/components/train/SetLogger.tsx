import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { stepTrialResult } from '@/domain/assessment';
import { formatPerformance } from '@/domain/format';
import type { SetMark } from '@/domain/train';
import type { CurrentExerciseView } from '@/domain/trainView';
import type { ExerciseNode, SetPerformance } from '@/domain/types';

import { Spacing } from '../theme';
import { NumberStepper, PixelButton, PixelIcon, PixelText } from '../ui';

type Props = {
  node: ExerciseNode;
  current: CurrentExerciseView;
  onLog: (entered: SetPerformance, mark: SetMark) => void;
  /** Warnings wait for their "I understand": the note says so and the buttons wait. */
  pendingNote?: string;
};

const OUTCOME_ICONS = { success: 'check', partial: 'alert', failed: 'cross' } as const;

/**
 * Logging one set of the current exercise: a stepper that starts at the suggestion (last result or
 * the target), then "Log set", or mark it partial / failed. Mount it with a key per set so the
 * stepper starts fresh.
 */
export function SetLogger({ node, current, onLog, pendingNote }: Props) {
  const [entered, setEntered] = useState<SetPerformance>(current.suggested);
  const waiting = pendingNote !== undefined;
  const setLabel =
    current.setNumber > current.plannedSets
      ? `Extra set ${current.setNumber}`
      : `Set ${current.setNumber} of ${current.plannedSets}`;
  return (
    <View style={styles.gap}>
      {current.sets.map((set) => (
        <View key={set.index} style={styles.logged} testID={`logged-set-${set.index}`}>
          <PixelIcon name={OUTCOME_ICONS[set.outcome]} label={set.outcome} />
          <PixelText variant="small">{`Set ${set.index + 1}: ${set.text}`}</PixelText>
        </View>
      ))}
      <PixelText variant="label" tone="rune" testID="set-label">
        {setLabel}
      </PixelText>
      <PixelText variant="small" tone="textMuted">
        {`Target: ${formatPerformance(current.metric, current.target)}`}
      </PixelText>
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
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  half: {
    flex: 1,
  },
});
