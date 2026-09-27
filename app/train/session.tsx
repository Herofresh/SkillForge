import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { stackHeaderOptions } from '@/components/stackHeader';
import { Colors, Frames, Spacing, TOUCH_TARGET } from '@/components/theme';
import { ExerciseCard } from '@/components/train/ExerciseCard';
import { NodeOptionSheet } from '@/components/train/NodeOptionSheet';
import { RestPanel } from '@/components/train/RestPanel';
import { SetLogger } from '@/components/train/SetLogger';
import { TrainWarningList } from '@/components/train/TrainWarningList';
import {
  EmptyState,
  PixelButton,
  PixelFrame,
  PixelIcon,
  PixelModal,
  PixelText,
  Screen,
  XPBar,
} from '@/components/ui';
import { allAcknowledged, type ActiveSession } from '@/domain/train';
import { liveView, type ExerciseView } from '@/domain/trainView';
import { useAppStore } from '@/store/useAppStore';

type Dialog = 'finish' | 'abandon' | 'add';

const ACKNOWLEDGE_TO_LOG_NOTE = 'Read and acknowledge the notes above to log. It is your call.';

/**
 * The live session (PLAN 4.4): the current exercise with per-set logging (stepper, log / partial /
 * failed), the rest countdown, the whole session as a list to jump around, skip, add, finish or
 * abandon. Every action goes through the store, which saves the session after each change.
 */
export default function LiveSessionScreen() {
  const session = useAppStore((state) => state.activeSession);
  if (!session) {
    return (
      <Screen centered>
        <Stack.Screen options={stackHeaderOptions('Session')} />
        <EmptyState icon="sword" title="No session" message="Start one on the Train tab." />
      </Screen>
    );
  }
  return <LiveSession session={session} />;
}

function LiveSession({ session }: { session: ActiveSession }) {
  const router = useRouter();
  const nodes = useAppStore((state) => state.nodes);
  const trainWarnings = useAppStore((state) => state.trainWarnings);
  const acknowledge = useAppStore((state) => state.acknowledgeTrainWarning);
  const logSet = useAppStore((state) => state.logTrainingSet);
  const skipExercise = useAppStore((state) => state.skipTrainingExercise);
  const selectExercise = useAppStore((state) => state.selectTrainingExercise);
  const skipRest = useAppStore((state) => state.skipTrainingRest);
  const addOptions = useAppStore((state) => state.addTrainingOptions);
  const addExercise = useAppStore((state) => state.addTrainingExercise);
  const finish = useAppStore((state) => state.finishTraining);
  const abandon = useAppStore((state) => state.abandonTraining);
  const [dialog, setDialog] = useState<Dialog | undefined>();

  const lookup = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const view = useMemo(() => liveView(session, lookup), [session, lookup]);
  // Derived from the session in the store; recomputed on every render of this screen.
  const warnings = trainWarnings();
  const pending = !allAcknowledged(warnings, session.acknowledged);
  const { current, counts } = view;
  const currentNode = current && lookup.get(current.exercise.nodeId);

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/train'));
  const onFinish = () => {
    setDialog(undefined);
    const result = finish();
    if (result) router.replace('/train/summary');
    else leave();
  };
  const onAbandon = () => {
    setDialog(undefined);
    abandon();
    leave();
  };

  return (
    <>
      <Stack.Screen options={stackHeaderOptions('Session')} />
      <Screen testID="live-session">
        <PixelFrame variant="raised" contentStyle={styles.gap}>
          <XPBar
            label="Sets"
            fraction={view.setsFraction}
            valueText={`${counts.setsLogged} / ${counts.setsPlanned}`}
            color={Colors.rune}
            testID="session-progress"
          />
          <PixelText variant="small" tone="textMuted">
            {`${counts.exercisesDone} of ${counts.exercises} exercises done`}
          </PixelText>
        </PixelFrame>

        <TrainWarningList
          warnings={warnings}
          acknowledged={session.acknowledged}
          onAcknowledge={acknowledge}
          testIDPrefix="session-warning"
        />

        <RestPanel key={session.restEndsAt ?? 'none'} session={session} onSkip={skipRest} />

        {current && currentNode ? (
          <ExerciseCard exercise={current.exercise} highlighted testID="current-exercise">
            <SetLogger
              key={`${current.exercise.key}-${current.setNumber}`}
              node={currentNode}
              current={current}
              onLog={(entered, mark) => logSet(current.exercise.key, entered, mark)}
              pendingNote={pending ? ACKNOWLEDGE_TO_LOG_NOTE : undefined}
            />
            <PixelButton
              label="Skip exercise"
              variant="secondary"
              onPress={() => skipExercise(current.exercise.key)}
              testID="skip-exercise"
            />
          </ExerciseCard>
        ) : (
          <PixelFrame variant="gold" testID="all-done">
            <PixelText>
              Every exercise is done or skipped. Finish the session to claim your XP, or add one
              more.
            </PixelText>
          </PixelFrame>
        )}

        <View style={styles.gap}>
          <PixelText variant="label" tone="gold" accessibilityRole="header">
            This session
          </PixelText>
          {view.blocks.flatMap((block) =>
            block.exercises.map((exercise) => (
              <SessionRow
                key={exercise.key}
                exercise={exercise}
                blockLabel={block.label}
                current={exercise.key === session.currentKey}
                onPress={() => selectExercise(exercise.key)}
              />
            )),
          )}
        </View>

        <PixelButton
          label="Add exercise"
          icon="rune"
          variant="secondary"
          onPress={() => setDialog('add')}
          testID="session-add"
        />
        <PixelButton
          label="Finish session"
          icon="star"
          onPress={() => setDialog('finish')}
          testID="finish-session"
        />
        <PixelButton
          label="Abandon"
          variant="danger"
          onPress={() => setDialog('abandon')}
          testID="abandon-session"
        />
      </Screen>

      <PixelModal
        visible={dialog === 'finish'}
        title="Finish session?"
        onClose={() => setDialog(undefined)}
        closeLabel="Keep training"
        testID="finish-dialog">
        <PixelText>
          {counts.setsLogged === 0
            ? 'Nothing is logged yet, so finishing ends the session without saving it.'
            : `${counts.setsLogged} of ${counts.setsPlanned} sets are logged. Missing sets of exercises you started count as skipped; exercises you never started are left out.`}
        </PixelText>
        <PixelButton label="Finish" icon="star" onPress={onFinish} testID="finish-confirm" />
      </PixelModal>

      <PixelModal
        visible={dialog === 'abandon'}
        title="Abandon session?"
        onClose={() => setDialog(undefined)}
        closeLabel="Keep training"
        testID="abandon-dialog">
        <PixelText>Your logged sets are thrown away and earn no XP.</PixelText>
        <PixelButton
          label="Abandon"
          variant="danger"
          onPress={onAbandon}
          testID="abandon-confirm"
        />
      </PixelModal>

      {dialog === 'add' && (
        <NodeOptionSheet
          title="Add exercise"
          intro="Suggestions from your open skills, or search any skill by name."
          options={(query) => addOptions(query)}
          onPick={(nodeId) => {
            addExercise(nodeId);
            setDialog(undefined);
          }}
          onClose={() => setDialog(undefined)}
          searchable
          empty="Nothing found that your equipment allows."
          testID="add-sheet"
        />
      )}
    </>
  );
}

type RowProps = {
  exercise: ExerciseView;
  blockLabel: string;
  current: boolean;
  onPress: () => void;
};

/** One exercise in the session list: tap to train it now. */
function SessionRow({ exercise, blockLabel, current, onPress }: RowProps) {
  const status = exercise.skipped ? 'Skipped' : `${exercise.setsLogged} / ${exercise.sets}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${exercise.name}, ${blockLabel}, ${status}`}
      accessibilityState={{ selected: current }}
      testID={`session-row-${exercise.key}`}>
      {({ pressed }) => (
        <PixelFrame
          frame={current ? Frames.selected : Frames.stone}
          pressed={pressed}
          padding={Spacing.sm}>
          <View style={styles.row}>
            <PixelIcon name={exercise.done ? 'check' : exercise.skipped ? 'cross' : 'sword'} />
            <View style={styles.rowText}>
              <PixelText tone={current ? 'gold' : 'text'}>{exercise.name}</PixelText>
              <PixelText variant="small" tone="textMuted">
                {blockLabel}
              </PixelText>
            </View>
            <PixelText variant="label" tone={exercise.done ? 'success' : 'textMuted'}>
              {status}
            </PixelText>
          </View>
        </PixelFrame>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: TOUCH_TARGET - 2 * Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowText: {
    flex: 1,
  },
});
