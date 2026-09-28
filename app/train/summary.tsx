import { Stack, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { SafeguardWarningList, useAcknowledgements } from '@/components/SafeguardWarningList';
import { stackHeaderOptions } from '@/components/stackHeader';
import { SessionResultPanels } from '@/components/train/SessionResultPanels';
import { EmptyState, PixelButton, PixelText, Screen } from '@/components/ui';
import { summaryView, type SummaryView } from '@/domain/trainView';
import { useAppStore } from '@/store/useAppStore';

/**
 * The session summary (PLAN 4.4): total XP with its bonuses, XP and outcome per exercise, level-ups
 * and unlocks with the pixel burst, the streak, and the advisory warnings the session raised
 * (ADR-023), each acknowledged before "Done".
 */
export default function SessionSummaryScreen() {
  const summary = useAppStore((state) => state.trainSummary);
  const nodes = useAppStore((state) => state.nodes);
  const view = useMemo(
    () => (summary ? summaryView(summary.result, nodes) : undefined),
    [summary, nodes],
  );
  if (!summary || !view) {
    return (
      <Screen centered>
        <Stack.Screen options={stackHeaderOptions('Victory')} />
        <EmptyState icon="scroll" title="No summary" message="Finish a session to see one." />
      </Screen>
    );
  }
  return <SummaryBody view={view} playKey={summary.sessionId} />;
}

function SummaryBody({ view, playKey }: { view: SummaryView; playKey: string }) {
  const router = useRouter();
  const dismiss = useAppStore((state) => state.dismissTrainSummary);
  const { acknowledged, acknowledge, allAcknowledged } = useAcknowledgements(view.warnings.length);
  const openNode = (nodeId: string) =>
    router.push({ pathname: '/node/[nodeId]', params: { nodeId } });
  const done = () => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/train');
    dismiss();
  };

  return (
    <>
      <Stack.Screen options={stackHeaderOptions('Victory')} />
      <Screen testID="session-summary">
        <SessionResultPanels
          view={view}
          celebrate
          playKey={playKey}
          subtitle="Session logged"
          onOpenNode={openNode}
        />

        {view.warnings.length > 0 && (
          <PixelText variant="label" tone="ember" accessibilityRole="header">
            Safeguards
          </PixelText>
        )}
        <SafeguardWarningList
          warnings={view.warnings}
          acknowledged={acknowledged}
          onAcknowledge={acknowledge}
          testIDPrefix="summary-warning"
        />
        {!allAcknowledged && (
          <PixelText variant="small" tone="textMuted">
            Read and acknowledge the notes above to close the summary.
          </PixelText>
        )}
        <PixelButton
          label="Done"
          icon="check"
          onPress={done}
          disabled={!allAcknowledged}
          testID="summary-done"
        />
      </Screen>
    </>
  );
}
