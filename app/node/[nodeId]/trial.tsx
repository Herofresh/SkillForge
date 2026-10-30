import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { NodeRow } from '@/components/NodeRow';
import { SafeguardWarningList } from '@/components/SafeguardWarningList';
import { stackHeaderOptions } from '@/components/stackHeader';
import {
  ACKNOWLEDGE_TO_LOG_NOTE,
  TrialOutcome,
  TrialSetsPanel,
} from '@/components/trial/TrialParts';
import { useTrialAttempt } from '@/components/trial/useTrialAttempt';
import { EmptyState, PixelButton, PixelText, Screen } from '@/components/ui';
import type { ExerciseNode } from '@/domain/types';
import { t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';

/**
 * "Attempt Trial" from the node detail (PLAN 4.3): the advisory warnings to acknowledge first
 * (ADR-023), one stepper per set, then the attempt is logged as a Trial session through the store.
 * A passed Trial makes the node proficient (a test-out when it wasn't trained).
 */
export default function NodeTrialScreen() {
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
  const node = useAppStore((state) => state.nodes.find((entry) => entry.id === nodeId));
  if (!node) {
    return (
      <Screen centered>
        <Stack.Screen options={stackHeaderOptions(t('The Trial'))} />
        <EmptyState
          icon="potion"
          title={t('Unknown skill')}
          message={t("No skill '{id}' here.", { id: nodeId })}
        />
      </Screen>
    );
  }
  return <NodeTrialForm node={node} />;
}

function NodeTrialForm({ node }: { node: ExerciseNode }) {
  const router = useRouter();
  const attempt = useTrialAttempt(node);
  return (
    <>
      <Stack.Screen options={stackHeaderOptions(t('The Trial'))} />
      {attempt.outcome ? (
        <Screen testID="node-trial-result">
          <TrialOutcome
            node={node}
            outcome={attempt.outcome}
            standard={attempt.standard}
            onOpenNode={(nodeId) =>
              router.replace({ pathname: '/node/[nodeId]', params: { nodeId } })
            }
          />
          <PixelButton
            label={t('Back to the skill')}
            onPress={() => router.back()}
            testID="trial-done"
          />
        </Screen>
      ) : (
        <Screen testID="node-trial-form">
          <NodeRow node={node} icon="sword" />
          <PixelText tone="textMuted">
            {t('Enter what you did today. The standard is {standard}.', {
              standard: attempt.standard,
            })}
          </PixelText>
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
            timers={attempt.timers}
            onStartTimer={attempt.startTimer}
            onStopTimer={attempt.stopTimer}
            onPauseTimer={attempt.pauseTimer}
            onResumeTimer={attempt.resumeTimer}
            onResetTimer={attempt.resetTimer}
            pendingNote={attempt.allAcknowledged ? undefined : t(ACKNOWLEDGE_TO_LOG_NOTE)}
          />
          <PixelButton
            label={t('Log Trial')}
            icon="sword"
            onPress={attempt.log}
            disabled={!attempt.allAcknowledged}
            testID="log-trial"
          />
        </Screen>
      )}
    </>
  );
}
