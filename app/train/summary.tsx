import { Stack, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SafeguardWarningList, useAcknowledgements } from '@/components/SafeguardWarningList';
import { stackHeaderOptions } from '@/components/stackHeader';
import { Spacing, TOUCH_TARGET } from '@/components/theme';
import {
  EmptyState,
  LevelUpBurst,
  PixelButton,
  PixelFrame,
  PixelIcon,
  PixelText,
  Screen,
} from '@/components/ui';
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
        <PixelFrame variant="rune">
          <LevelUpBurst title="QUEST COMPLETE" subtitle="Session logged" playKey={playKey} />
          <PixelText variant="display" align="center" testID="summary-total-xp">
            {`+${view.totalXp} XP`}
          </PixelText>
          <PixelText variant="small" tone="textMuted" align="center">
            {`${view.exerciseXp} from exercises · +${view.completionBonus} completion · +${view.streakBonus} streak`}
          </PixelText>
        </PixelFrame>

        <PixelFrame variant="gold" contentStyle={styles.gap} testID="summary-streak">
          <View style={styles.row}>
            <PixelIcon name="flame" />
            <PixelText variant="heading">
              {`Streak: ${view.streak} ${view.streak === 1 ? 'session' : 'sessions'}`}
            </PixelText>
          </View>
        </PixelFrame>

        {view.levelUps.length > 0 && (
          <PixelFrame variant="rune" contentStyle={styles.gap} testID="summary-level-ups">
            <LevelUpBurst title="LEVEL UP!" subtitle={view.levelUps[0].name} playKey={playKey} />
            {view.levelUps.map((levelUp) => (
              <PixelText key={levelUp.nodeId}>
                {`${levelUp.name}: LV ${levelUp.from} → ${levelUp.to}`}
              </PixelText>
            ))}
          </PixelFrame>
        )}

        {view.unlocked.length > 0 && (
          <PixelFrame variant="rune" contentStyle={styles.gap} testID="summary-unlocked">
            <LevelUpBurst title="UNLOCKED!" subtitle={view.unlocked[0].name} playKey={playKey} />
            {view.unlocked.map((node) => (
              <Pressable
                key={node.nodeId}
                onPress={() => openNode(node.nodeId)}
                accessibilityRole="link"
                accessibilityLabel={`Open ${node.name}`}
                style={styles.link}>
                <PixelIcon name="rune" />
                <PixelText tone="rune">{node.name}</PixelText>
              </Pressable>
            ))}
          </PixelFrame>
        )}

        <PixelFrame variant="parchment" contentStyle={styles.gap} testID="summary-exercises">
          <PixelText variant="label" tone="textOnParchment" accessibilityRole="header">
            Exercises
          </PixelText>
          {view.exercises.map((exercise) => (
            <View key={exercise.nodeId} style={styles.exercise}>
              <View style={styles.exerciseText}>
                <PixelText tone="textOnParchment">{exercise.name}</PixelText>
                <PixelText variant="small" tone="textOnParchment">
                  {exercise.outcomeLabel +
                    (exercise.trialPassed
                      ? ' · Trial passed'
                      : exercise.trialAttempted
                        ? ' · Trial not passed yet'
                        : '')}
                </PixelText>
              </View>
              <PixelText variant="heading" tone="textOnParchment">
                {`+${exercise.xp} XP`}
              </PixelText>
            </View>
          ))}
        </PixelFrame>

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

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  link: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseText: {
    flex: 1,
  },
});
