import { Stack, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { ChallengeProgressPanel } from '@/components/character/ChallengeProgressPanel';
import { ClassUnlockPanel } from '@/components/character/ClassUnlockPanel';
import { CompanionVictory } from '@/components/character/CompanionVictory';
import { TrinketUnlockPanel } from '@/components/character/TrinketUnlockPanel';
import { SafeguardWarningList, useAcknowledgements } from '@/components/SafeguardWarningList';
import { stackHeaderOptions } from '@/components/stackHeader';
import { SessionResultPanels } from '@/components/train/SessionResultPanels';
import { EmptyState, PixelButton, PixelText, Screen } from '@/components/ui';
import { HERO_CLASSES } from '@/data/classes';
import { ACCESSORIES } from '@/data/companion/accessories';
import { sessionClassTierUps, wornClass } from '@/domain/classes';
import { sessionAccessoryUnlocks } from '@/domain/companion';
import { summaryView, type SummaryView } from '@/domain/trainView';
import type { HealthWriteState } from '@/store/appStore';
import { useAppStore } from '@/store/useAppStore';

/**
 * The session summary (PLAN 4.4): total XP with its bonuses, XP and outcome per exercise, level-ups
 * and unlocks with the pixel burst, the streak, the hero classes it unlocked or raised a tier
 * (PLAN 6.9, CLASS UNLOCKED! / TIER UP!, with "Wear"), the weekly class challenge's progress (PLAN
 * 6.9b, CHALLENGE COMPLETE! when this session finished it), the companion trinkets it earned (PLAN
 * 6.10, NEW TRINKET!) and the companion's victory pose, and the advisory warnings the session raised
 * (ADR-023), each acknowledged before "Done". With Health Connect on (PLAN 7.10), one line says
 * whether the workout was added.
 */
export default function SessionSummaryScreen() {
  const summary = useAppStore((state) => state.trainSummary);
  const nodes = useAppStore((state) => state.nodes);
  const progress = useAppStore((state) => state.engine.progress);
  const session = useAppStore((state) =>
    state.sessions.find((entry) => entry.id === state.trainSummary?.sessionId),
  );
  const view = useMemo(
    () => (summary ? summaryView(summary.result, nodes, session, progress) : undefined),
    [summary, nodes, session, progress],
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
  const classes = useAppStore((state) => state.classes);
  const companion = useAppStore((state) => state.companion);
  const selectClass = useAppStore((state) => state.selectClass);
  const challengePins = useAppStore((state) => state.challengePins);
  const tierUps = useMemo(
    () => sessionClassTierUps(HERO_CLASSES, classes.unlocks, playKey),
    [classes.unlocks, playKey],
  );
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
        <ClassUnlockPanel
          tierUps={tierUps}
          wornClassId={wornClass(HERO_CLASSES, classes).classId}
          celebrate
          playKey={playKey}
          onWear={selectClass}
        />
        <ChallengeProgressPanel
          {...(view.challenge ? { step: view.challenge } : {})}
          pins={challengePins}
          bonus={view.challengeBonus}
          celebrate
          playKey={playKey}
        />
        <TrinketUnlockPanel
          accessoryIds={sessionAccessoryUnlocks(ACCESSORIES, companion.unlocks, playKey)}
          celebrate
          playKey={playKey}
        />
        <CompanionVictory />
        <HealthWriteLine sessionId={playKey} />

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

const HEALTH_WRITE_TEXT: Readonly<Record<HealthWriteState, string>> = {
  writing: 'Adding the workout to Health Connect…',
  added: 'Added to Health Connect.',
  no_permission:
    'Not added to Health Connect: SkillForge may no longer write exercise. Turn it on again in Settings → Health Connect.',
  failed: 'Couldn’t add the workout to Health Connect. Your session is saved here.',
};

/** How writing this session to Health Connect went (only when it is turned on). */
function HealthWriteLine({ sessionId }: { sessionId: string }) {
  const write = useAppStore((state) => state.healthWrite);
  if (write?.sessionId !== sessionId) return null;
  return (
    <PixelText
      variant="small"
      tone={write.state === 'added' ? 'success' : write.state === 'writing' ? 'textMuted' : 'ember'}
      testID="summary-health-connect">
      {HEALTH_WRITE_TEXT[write.state]}
    </PixelText>
  );
}
