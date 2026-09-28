import { StyleSheet } from 'react-native';

import { unlockedByTrial } from '@/domain/assessment';
import { formatPerformance } from '@/domain/format';
import { PROFICIENT_LEVEL } from '@/domain/progression';
import type { SessionResult } from '@/domain/recompute';
import type { ExerciseNode, SetPerformance } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

import { Spacing } from '../theme';
import { BURST_TITLES, LevelUpBurst, NumberStepper, PixelFrame, PixelText } from '../ui';

type SetsProps = {
  node: ExerciseNode;
  results: readonly SetPerformance[];
  onStep: (index: number, steps: number) => void;
  /** Shown under the steppers while warnings still wait for their "I understand". */
  pendingNote?: string;
};

/** "Your result": one stepper per Trial set (ids `trial-set-<n>`). */
export function TrialSetsPanel({ node, results, onStep, pendingNote }: SetsProps) {
  return (
    <PixelFrame contentStyle={styles.gap}>
      <PixelText variant="label" tone="rune" accessibilityRole="header">
        Your result
      </PixelText>
      {results.map((result, index) => (
        <NumberStepper
          key={index}
          label={`Set ${index + 1}`}
          valueText={formatPerformance(node.metric, result)}
          onDecrement={() => onStep(index, -1)}
          onIncrement={() => onStep(index, 1)}
          decrementDisabled={result.value <= 0}
          testID={`trial-set-${index}`}
        />
      ))}
      {pendingNote !== undefined && (
        <PixelText variant="small" tone="textMuted">
          {pendingNote}
        </PixelText>
      )}
    </PixelFrame>
  );
}

type OutcomeProps = {
  node: ExerciseNode;
  outcome: SessionResult;
  standard: string;
};

/** Whether the Trial passed (with the test-out burst) and what it unlocked. */
export function TrialOutcome({ node, outcome, standard }: OutcomeProps) {
  const nodes = useAppStore((state) => state.nodes);
  const passed = trialPassedIn(outcome);
  const unlockedNames = unlockedByTrial(outcome, node.id).map(
    (id) => nodes.find((entry) => entry.id === id)?.name ?? id,
  );
  return (
    <>
      {passed ? (
        <PixelFrame variant="rune" testID="trial-passed">
          <LevelUpBurst title={BURST_TITLES.testedOut} subtitle={node.name} />
          <PixelText align="center">
            {`${node.name} is now proficient (level ${PROFICIENT_LEVEL}). Its successors are open to train.`}
          </PixelText>
        </PixelFrame>
      ) : (
        <PixelFrame variant="gold" testID="trial-not-passed">
          <PixelText>
            {`Not quite the standard yet (${standard}). Your sets count as training, so the XP is yours. Try the Trial again after a few sessions.`}
          </PixelText>
        </PixelFrame>
      )}
      {unlockedNames.length > 0 && (
        <PixelFrame variant="parchment" contentStyle={styles.gap}>
          <PixelText variant="heading" tone="textOnParchment" accessibilityRole="header">
            Unlocked
          </PixelText>
          {unlockedNames.map((name) => (
            <PixelText key={name} tone="textOnParchment">
              {`• ${name}`}
            </PixelText>
          ))}
        </PixelFrame>
      )}
    </>
  );
}

/** Whether a logged Trial passed (for titles and icons around `TrialOutcome`). */
export function trialPassedIn(outcome: SessionResult): boolean {
  return outcome.exercises.some((exercise) => exercise.trialPassed);
}

/** The note under the steppers while warnings are unacknowledged. */
export const ACKNOWLEDGE_TO_LOG_NOTE =
  'Read and acknowledge the notes above to log the Trial. It is your call.';

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
});
