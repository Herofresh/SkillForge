import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { ChallengeProgressPanel } from '@/components/character/ChallengeProgressPanel';
import { ClassUnlockPanel } from '@/components/character/ClassUnlockPanel';
import { stackHeaderOptions } from '@/components/stackHeader';
import { Spacing } from '@/components/theme';
import { SessionResultPanels } from '@/components/train/SessionResultPanels';
import { EmptyState, PixelFrame, PixelText, Screen } from '@/components/ui';
import { HERO_CLASSES } from '@/data/classes';
import { sessionClassTierUps, wornClass } from '@/domain/classes';
import { formatShortDate } from '@/domain/format';
import { summaryView } from '@/domain/trainView';
import { useAppStore } from '@/store/useAppStore';

/**
 * A past session (PLAN 4.5), opened from the Character tab's history or a node detail's history
 * (PLAN 5.10): the same panels as the Train summary (XP, streak, level-ups, unlocks, exercises,
 * the class tiers it reached, PLAN 6.9, its weekly class challenge progress, PLAN 6.9b),
 * without the bursts, and its advisory notes as plain text (they were acknowledged when the session
 * was logged). An unknown or missing id shows "Session not found".
 */
export default function PastSessionScreen() {
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : undefined;
  const router = useRouter();
  const session = useAppStore((state) => state.sessions.find((entry) => entry.id === sessionId));
  const result = useAppStore((state) =>
    sessionId === undefined ? undefined : state.sessionResults[sessionId],
  );
  const nodes = useAppStore((state) => state.nodes);
  const classes = useAppStore((state) => state.classes);
  const challengePins = useAppStore((state) => state.challengePins);
  const tierUps = useMemo(
    () =>
      sessionId === undefined ? [] : sessionClassTierUps(HERO_CLASSES, classes.unlocks, sessionId),
    [classes.unlocks, sessionId],
  );
  const view = useMemo(
    () => (result ? summaryView(result, nodes, session) : undefined),
    [result, nodes, session],
  );

  if (!session || !view) {
    return (
      <Screen centered>
        <Stack.Screen options={stackHeaderOptions('Session')} />
        <EmptyState icon="scroll" title="Session not found" message="It is not in your log." />
      </Screen>
    );
  }
  const date = formatShortDate(session.startedAt);
  return (
    <>
      <Stack.Screen options={stackHeaderOptions(date)} />
      <Screen testID="past-session">
        <SessionResultPanels
          view={view}
          celebrate={false}
          playKey={session.id}
          subtitle={`Session of ${date}`}
          onOpenNode={(nodeId) => router.push({ pathname: '/node/[nodeId]', params: { nodeId } })}
        />
        <ClassUnlockPanel
          tierUps={tierUps}
          wornClassId={wornClass(HERO_CLASSES, classes).classId}
          celebrate={false}
          playKey={session.id}
        />
        <ChallengeProgressPanel
          {...(view.challenge ? { step: view.challenge } : {})}
          pins={challengePins}
          bonus={view.challengeBonus}
          celebrate={false}
          playKey={session.id}
        />
        {view.warnings.length > 0 && (
          <PixelFrame variant="stone" contentStyle={styles.gap} testID="past-session-notes">
            <PixelText variant="label" tone="ember" accessibilityRole="header">
              Safeguard notes
            </PixelText>
            {view.warnings.map((warning) => (
              <PixelText key={`${warning.code}-${warning.nodeId ?? ''}`} variant="small">
                {warning.message}
              </PixelText>
            ))}
          </PixelFrame>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
});
