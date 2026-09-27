import { useLocalSearchParams, useRouter } from 'expo-router';

import { NodeRow } from '@/components/NodeRow';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { SafeguardWarningList } from '@/components/SafeguardWarningList';
import {
  ACKNOWLEDGE_TO_LOG_NOTE,
  TrialOutcome,
  TrialSetsPanel,
  trialPassedIn,
} from '@/components/trial/TrialParts';
import { useTrialAttempt } from '@/components/trial/useTrialAttempt';
import { EmptyState, Screen } from '@/components/ui';
import type { ExerciseNode } from '@/domain/types';
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
  const attempt = useTrialAttempt(node);

  if (attempt.outcome) {
    const passed = trialPassedIn(attempt.outcome);
    return (
      <OnboardingScaffold
        step="assessment"
        icon={passed ? 'star' : 'scroll'}
        title={passed ? 'Trial passed' : 'Trial logged'}
        subtitle={node.name}
        next={{ label: 'Done', onPress: () => router.back() }}
        testID="trial-result">
        <TrialOutcome node={node} outcome={attempt.outcome} standard={attempt.standard} />
      </OnboardingScaffold>
    );
  }

  return (
    <OnboardingScaffold
      step="assessment"
      icon="sword"
      title="The Trial"
      subtitle={`Enter what you can do today. The standard is ${attempt.standard}.`}
      onBack={() => router.back()}
      next={{ label: 'Log Trial', onPress: attempt.log, disabled: !attempt.allAcknowledged }}
      testID="trial-form">
      <NodeRow node={node} icon="sword" />
      <SafeguardWarningList
        warnings={attempt.warnings}
        acknowledged={attempt.acknowledged}
        onAcknowledge={attempt.acknowledge}
        testIDPrefix="trial-warning"
      />
      <TrialSetsPanel
        node={node}
        results={attempt.results}
        onStep={attempt.step}
        pendingNote={attempt.allAcknowledged ? undefined : ACKNOWLEDGE_TO_LOG_NOTE}
      />
    </OnboardingScaffold>
  );
}
