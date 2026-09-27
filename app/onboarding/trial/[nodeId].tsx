import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { NodeRow } from '@/components/NodeRow';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Spacing } from '@/components/theme';
import {
  EmptyState,
  LevelUpBurst,
  NumberStepper,
  PixelFrame,
  PixelText,
  Screen,
  WarningBanner,
} from '@/components/ui';
import { defaultTrialResults, stepTrialResult, unlockedByTrial } from '@/domain/assessment';
import { formatPerformance, formatTrial } from '@/domain/format';
import { PROFICIENT_LEVEL } from '@/domain/progression';
import type { SessionResult } from '@/domain/recompute';
import type { ExerciseNode, SetPerformance } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * The assessment Trial for one node: shows the standard, the advisory warnings to acknowledge
 * (ADR-023), one stepper per set, then logs it. A passed Trial is a test-out.
 */
export default function TrialScreen() {
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
  const node = useAppStore((state) => state.nodes.find((entry) => entry.id === nodeId));
  if (!node) {
    return (
      <Screen centered>
        <EmptyState icon="potion" title="Unknown skill" message={`No skill '${nodeId}' here.`} />
      </Screen>
    );
  }
  return <TrialForm node={node} />;
}

function TrialForm({ node }: { node: ExerciseNode }) {
  const router = useRouter();
  const logTrial = useAppStore((state) => state.logTrial);
  const nodes = useAppStore((state) => state.nodes);
  const testOutWarnings = useAppStore((state) => state.testOutWarnings);
  // The warnings before the attempt; kept fixed while the user reads and acknowledges them.
  const [warnings] = useState(() => testOutWarnings(node.id));
  const [acknowledged, setAcknowledged] = useState<ReadonlySet<number>>(new Set());
  const [results, setResults] = useState<SetPerformance[]>(() => defaultTrialResults(node));
  const [outcome, setOutcome] = useState<SessionResult | undefined>();
  const allAcknowledged = warnings.every((_, index) => acknowledged.has(index));
  const standard = formatTrial(node.metric, node.trial);

  const step = (index: number, steps: number) =>
    setResults((current) =>
      current.map((result, at) => (at === index ? stepTrialResult(node, result, steps) : result)),
    );

  if (outcome) {
    const passed = outcome.exercises.some((exercise) => exercise.trialPassed);
    const unlockedNames = unlockedByTrial(outcome, node.id).map(
      (id) => nodes.find((entry) => entry.id === id)?.name ?? id,
    );
    return (
      <OnboardingScaffold
        step="assessment"
        icon={passed ? 'star' : 'scroll'}
        title={passed ? 'Trial passed' : 'Trial logged'}
        subtitle={node.name}
        next={{ label: 'Done', onPress: () => router.back() }}
        testID="trial-result">
        {passed ? (
          <PixelFrame variant="rune" testID="trial-passed">
            <LevelUpBurst title="TESTED OUT!" subtitle={node.name} />
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
      </OnboardingScaffold>
    );
  }

  return (
    <OnboardingScaffold
      step="assessment"
      icon="sword"
      title="The Trial"
      subtitle={`Enter what you can do today. The standard is ${standard}.`}
      onBack={() => router.back()}
      next={{
        label: 'Log Trial',
        onPress: () => setOutcome(logTrial(node.id, results)),
        disabled: !allAcknowledged,
      }}
      testID="trial-form">
      <NodeRow node={node} icon="sword" />
      {warnings.map((warning, index) => (
        <WarningBanner
          key={warning.code}
          severity={warning.severity}
          message={warning.message}
          acknowledged={acknowledged.has(index)}
          onAcknowledge={() => setAcknowledged((current) => new Set(current).add(index))}
          testID={`trial-warning-${index}`}
        />
      ))}
      <PixelFrame contentStyle={styles.gap}>
        <PixelText variant="label" tone="rune" accessibilityRole="header">
          Your result
        </PixelText>
        {results.map((result, index) => (
          <NumberStepper
            key={index}
            label={`Set ${index + 1}`}
            valueText={formatPerformance(node.metric, result)}
            onDecrement={() => step(index, -1)}
            onIncrement={() => step(index, 1)}
            decrementDisabled={result.value <= 0}
            testID={`trial-set-${index}`}
          />
        ))}
        {!allAcknowledged && (
          <PixelText variant="small" tone="textMuted">
            Read and acknowledge the notes above to log the Trial. It is your call.
          </PixelText>
        )}
      </PixelFrame>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
});
