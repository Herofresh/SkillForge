import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { stackHeaderOptions } from '@/components/stackHeader';
import { Spacing } from '@/components/theme';
import { SessionResultPanels } from '@/components/train/SessionResultPanels';
import { EmptyState, PixelFrame, PixelText, Screen } from '@/components/ui';
import { formatShortDate } from '@/domain/format';
import { summaryView } from '@/domain/trainView';
import { useAppStore } from '@/store/useAppStore';

/**
 * A past session (PLAN 4.5), opened from the Character tab's history: the same panels as the
 * Train summary (XP, streak, level-ups, unlocks, exercises), without the bursts, and its advisory
 * notes as plain text (they were acknowledged when the session was logged).
 */
export default function PastSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const session = useAppStore((state) => state.sessions.find((entry) => entry.id === sessionId));
  const result = useAppStore((state) => state.sessionResults[sessionId]);
  const nodes = useAppStore((state) => state.nodes);
  const view = useMemo(() => (result ? summaryView(result, nodes) : undefined), [result, nodes]);

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
