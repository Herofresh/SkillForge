import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GuideButton } from '@/components/guide/GuideButton';
import { ExerciseInfoSheet } from '@/components/node/ExerciseInfoSheet';
import { stackHeaderOptions } from '@/components/stackHeader';
import { Spacing } from '@/components/theme';
import { ExerciseCard } from '@/components/train/ExerciseCard';
import { NodeOptionSheet } from '@/components/train/NodeOptionSheet';
import { TrainWarningList } from '@/components/train/TrainWarningList';
import { EmptyState, PixelButton, PixelFrame, PixelText, Screen } from '@/components/ui';
import { allAcknowledged, planMinutes } from '@/domain/train';
import { blockViews } from '@/domain/trainView';
import { useAppStore } from '@/store/useAppStore';

type Sheet =
  { kind: 'swap'; key: string; name: string } | { kind: 'add' } | { kind: 'info'; nodeId: string };

/**
 * The plan preview (PLAN 4.4): the generated session by block with sets × target, rest, Trial and
 * swap/substitution markers, the generator's notes and the advisory warnings (ADR-023). The user may
 * swap an exercise for another of the same pattern, remove or add one, or tap its "i" for what it
 * is and its cues (PLAN 6.2), or the header's "i" for how the plan is made (PLAN 6.10c); "Start session" goes ahead
 * once the warnings are acknowledged.
 */
export default function PlanPreviewScreen() {
  const router = useRouter();
  const plan = useAppStore((state) => state.trainPlan);
  const nodes = useAppStore((state) => state.nodes);
  const profiles = useAppStore((state) => state.equipmentProfiles);
  const trainWarnings = useAppStore((state) => state.trainWarnings);
  const acknowledge = useAppStore((state) => state.acknowledgeTrainWarning);
  const swapOptions = useAppStore((state) => state.swapOptions);
  const swap = useAppStore((state) => state.swapPlanExercise);
  const remove = useAppStore((state) => state.removePlanExercise);
  const addOptions = useAppStore((state) => state.addTrainingOptions);
  const add = useAppStore((state) => state.addTrainingExercise);
  const startTraining = useAppStore((state) => state.startTraining);
  const [sheet, setSheet] = useState<Sheet | undefined>();

  const lookup = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const blocks = useMemo(() => (plan ? blockViews(plan.exercises, lookup) : []), [plan, lookup]);
  // Derived from the plan in the store; recomputed on every render (swap, add, remove).
  const warnings = trainWarnings();
  const infoNode = sheet?.kind === 'info' ? lookup.get(sheet.nodeId) : undefined;

  if (!plan) {
    return (
      <Screen centered>
        <Stack.Screen options={stackHeaderOptions('Your plan')} />
        <EmptyState icon="scroll" title="No plan" message="Plan a session on the Train tab." />
      </Screen>
    );
  }

  const profileName =
    profiles.find((profile) => profile.id === plan.equipmentProfileId)?.name ?? 'Equipment';
  const acknowledged = allAcknowledged(warnings, plan.acknowledged);
  const empty = plan.exercises.length === 0;
  const start = () => {
    startTraining();
    router.replace('/train/session');
  };

  return (
    <>
      <Stack.Screen options={stackHeaderOptions('Your plan')} />
      <Screen testID="plan-preview">
        <PixelFrame variant="raised" contentStyle={styles.gap}>
          <PixelText variant="label" tone="rune">
            {`${profileName} · ${plan.minutes} min`}
          </PixelText>
          <View style={styles.header}>
            <PixelText variant="title" accessibilityRole="header" style={styles.action}>
              Today&apos;s quest
            </PixelText>
            <GuideButton topic="generator" />
          </View>
          <PixelText variant="small" tone="textMuted" testID="plan-estimate">
            {`${plan.exercises.length} exercises · about ${planMinutes(plan.exercises, plan.restPace)} min`}
          </PixelText>
        </PixelFrame>

        <TrainWarningList
          warnings={warnings}
          acknowledged={plan.acknowledged}
          onAcknowledge={acknowledge}
          testIDPrefix="plan-warning"
        />

        {plan.notes.length > 0 && (
          <PixelFrame variant="parchment" contentStyle={styles.gap} testID="plan-notes">
            <PixelText variant="label" tone="textOnParchment" accessibilityRole="header">
              Notes
            </PixelText>
            {plan.notes.map((note) => (
              <PixelText key={note} variant="small" tone="textOnParchment">
                {`• ${note}`}
              </PixelText>
            ))}
          </PixelFrame>
        )}

        {blocks.map((block, blockIndex) => (
          <View key={`${block.kind}-${blockIndex}`} style={styles.gap}>
            <PixelText variant="label" tone="gold" accessibilityRole="header">
              {block.label}
            </PixelText>
            {block.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.key}
                exercise={exercise}
                onInfo={() => setSheet({ kind: 'info', nodeId: exercise.nodeId })}
                testID={`plan-${exercise.key}`}>
                <View style={styles.actions}>
                  <PixelButton
                    label="Swap"
                    variant="secondary"
                    onPress={() =>
                      setSheet({ kind: 'swap', key: exercise.key, name: exercise.name })
                    }
                    accessibilityLabel={`Swap ${exercise.name}`}
                    testID={`swap-${exercise.key}`}
                    style={styles.action}
                  />
                  <PixelButton
                    label="Remove"
                    variant="secondary"
                    onPress={() => remove(exercise.key)}
                    accessibilityLabel={`Remove ${exercise.name}`}
                    testID={`remove-${exercise.key}`}
                    style={styles.action}
                  />
                </View>
              </ExerciseCard>
            ))}
          </View>
        ))}

        {empty && (
          <EmptyState icon="scroll" title="Empty plan" message="Add an exercise to start." />
        )}

        <PixelButton
          label="Add exercise"
          icon="rune"
          variant="secondary"
          onPress={() => setSheet({ kind: 'add' })}
          testID="plan-add"
        />
        {!acknowledged && (
          <PixelText variant="small" tone="textMuted">
            Read and acknowledge the notes above to start. It is your call.
          </PixelText>
        )}
        <PixelButton
          label="Start session"
          icon="sword"
          onPress={start}
          disabled={!acknowledged || empty}
          testID="start-session"
        />
      </Screen>
      {sheet?.kind === 'swap' && (
        <NodeOptionSheet
          title="Swap exercise"
          intro={`Exercises of the same movement as ${sheet.name} that your equipment allows.`}
          options={() => swapOptions(sheet.key)}
          onPick={(nodeId) => {
            swap(sheet.key, nodeId);
            setSheet(undefined);
          }}
          onClose={() => setSheet(undefined)}
          empty="No other exercise of this movement fits your equipment yet."
          testID="swap-sheet"
        />
      )}
      {infoNode && <ExerciseInfoSheet node={infoNode} onClose={() => setSheet(undefined)} />}
      {sheet?.kind === 'add' && (
        <NodeOptionSheet
          title="Add exercise"
          intro="Suggestions from your open skills, or search any skill by name."
          options={(query) => addOptions(query)}
          onPick={(nodeId) => {
            add(nodeId);
            setSheet(undefined);
          }}
          onClose={() => setSheet(undefined)}
          searchable
          empty="Nothing found that your equipment allows."
          testID="add-sheet"
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  action: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
