import { useState } from 'react';

import { stepTrialResult } from '@/domain/assessment';
import { formatPerformance } from '@/domain/format';
import type { ExerciseNode, Metric, SetPerformance } from '@/domain/types';

import { NumberStepper, PixelButton, PixelModal, PixelText } from '../ui';

type Props = {
  node: ExerciseNode;
  metric: Metric;
  target: SetPerformance;
  /** "Set 3 of 5" or "Extra set 6". */
  setLabel: string;
  onLog: (entered: SetPerformance) => void;
  onClose: () => void;
};

/**
 * The Battle view's long press on a fresh foe (PLAN 7.9, ADR-071): log the next set with the
 * stepper, for more reps than the target or an exact number. Starts at the target; the outcome
 * follows from the number, as for a tap.
 */
export function LogSetSheet({ node, metric, target, setLabel, onLog, onClose }: Props) {
  const [entered, setEntered] = useState<SetPerformance>(target);
  return (
    <PixelModal
      visible
      title={setLabel}
      onClose={onClose}
      closeLabel="Cancel"
      testID="log-set-sheet">
      <PixelText variant="small" tone="textMuted">
        {`${node.name} · Target: ${formatPerformance(metric, target)}`}
      </PixelText>
      <NumberStepper
        label="Did"
        valueText={formatPerformance(metric, entered)}
        onDecrement={() => setEntered((value) => stepTrialResult(node, value, -1))}
        onIncrement={() => setEntered((value) => stepTrialResult(node, value, 1))}
        decrementDisabled={entered.value <= 0}
        testID="log-set-sheet-stepper"
      />
      <PixelButton
        label="Log set"
        icon="check"
        onPress={() => onLog(entered)}
        accessibilityHint="Logs the set as entered"
        testID="log-set-sheet-log"
      />
    </PixelModal>
  );
}
