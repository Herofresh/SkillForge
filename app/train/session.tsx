import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseInfoSheet } from '@/components/node/ExerciseInfoSheet';
import { stackHeaderOptions } from '@/components/stackHeader';
import { Colors, Frames, Spacing, TOUCH_TARGET } from '@/components/theme';
import { BattleBoard } from '@/components/train/BattleBoard';
import { EditSetSheet } from '@/components/train/EditSetSheet';
import { ExerciseCard } from '@/components/train/ExerciseCard';
import { FoeRow } from '@/components/train/FoeRow';
import { LogSetSheet } from '@/components/train/LogSetSheet';
import { NodeOptionSheet } from '@/components/train/NodeOptionSheet';
import { RestPanel } from '@/components/train/RestPanel';
import { SessionClock } from '@/components/train/SessionClock';
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
import { battleView, exerciseFoes, foeSetLabel } from '@/domain/battleView';
import {
  allAcknowledged,
  exerciseSets,
  type ActiveSession,
  type MoveDirection,
} from '@/domain/train';
import {
  liveView,
  loggedSetViews,
  type ExerciseMoves,
  type ExerciseView,
} from '@/domain/trainView';
import { useAppStore } from '@/store/useAppStore';

type Dialog = 'finish' | 'abandon' | 'add';

const ACKNOWLEDGE_TO_LOG_NOTE = 'Read and acknowledge the notes above to log. It is your call.';

/**
 * The live session (PLAN 4.4): the current exercise with per-set logging (stepper, log / partial /
 * failed; tap a logged set to edit or delete it, PLAN 5.9), the "i" for what the exercise is and
 * its cues without leaving the session (PLAN 6.2), the rest countdown, the whole session
 * as a list to jump around or reorder, skip, add, finish or abandon. Every action goes through the
 * store, which saves the session after each change.
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
  const editSet = useAppStore((state) => state.editTrainingSet);
  const deleteSet = useAppStore((state) => state.deleteTrainingSet);
  const moveExercise = useAppStore((state) => state.moveTrainingExercise);
  const skipExercise = useAppStore((state) => state.skipTrainingExercise);
  const selectExercise = useAppStore((state) => state.selectTrainingExercise);
  const skipRest = useAppStore((state) => state.skipTrainingRest);
  const startTimer = useAppStore((state) => state.startTrainingTimer);
  const stopTimer = useAppStore((state) => state.stopTrainingTimer);
  const pauseTimer = useAppStore((state) => state.pauseTrainingTimer);
  const resumeTimer = useAppStore((state) => state.resumeTrainingTimer);
  const resetTimer = useAppStore((state) => state.resetTrainingTimer);
  const addOptions = useAppStore((state) => state.addTrainingOptions);
  const addExercise = useAppStore((state) => state.addTrainingExercise);
  const finish = useAppStore((state) => state.finishTraining);
  const abandon = useAppStore((state) => state.abandonTraining);
  const insets = useSafeAreaInsets();
  const trainingView = useAppStore((state) => state.trainingView);
  const tapFoe = useAppStore((state) => state.tapTrainingFoe);
  const [dialog, setDialog] = useState<Dialog | undefined>();
  /** The `setIndex` of the logged set being edited. */
  const [editing, setEditing] = useState<number | undefined>();
  /** The exercise whose next set is entered with the stepper (Battle's long press). */
  const [logging, setLogging] = useState<string | undefined>();
  /** The node whose info sheet is open. */
  const [infoId, setInfoId] = useState<string | undefined>();
  const [reordering, setReordering] = useState(false);

  const lookup = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const view = useMemo(() => liveView(session, lookup), [session, lookup]);
  const battle = useMemo(
    () => (trainingView === 'battle' ? battleView(session, lookup) : undefined),
    [trainingView, session, lookup],
  );
  // Derived from the session in the store; recomputed on every render of this screen.
  const warnings = trainWarnings();
  const pending = !allAcknowledged(warnings, session.acknowledged);
  const { current, counts } = view;
  const currentNode = current && lookup.get(current.exercise.nodeId);
  const currentExercise = session.exercises.find((entry) => entry.key === current?.exercise.key);
  const currentFoes =
    current && currentExercise && exerciseFoes(session, currentExercise, lookup, current.exercise);
  const editedExercise = session.exercises.find((entry) =>
    session.sets.some((set) => set.setIndex === editing && set.exerciseKey === entry.key),
  );
  const editedNode = editedExercise && lookup.get(editedExercise.nodeId);
  const editedSet =
    editedExercise &&
    loggedSetViews(session, editedExercise.key).find((set) => set.setIndex === editing);
  const loggingExercise = session.exercises.find((entry) => entry.key === logging);
  const loggingNode = loggingExercise && lookup.get(loggingExercise.nodeId);
  const infoNode = infoId === undefined ? undefined : lookup.get(infoId);

  const onTapFoe = (key: string, slot: number) => {
    const edit = tapFoe(key, slot);
    if (edit !== undefined) setEditing(edit);
  };
  const onLongPressFoe = (key: string, slot: number) => {
    const set = exerciseSets(session, key)[slot];
    if (set) setEditing(set.setIndex);
    else setLogging(key);
  };

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
      <View style={styles.fill}>
        <Screen testID="live-session">
          <PixelFrame variant="raised" contentStyle={styles.gap}>
            <XPBar
              label="Sets"
              fraction={view.setsFraction}
              valueText={`${counts.setsLogged} / ${counts.setsPlanned}`}
              color={Colors.rune}
              testID="session-progress"
            />
            <View style={styles.row}>
              <PixelText variant="small" tone="textMuted" style={styles.rowText}>
                {`${counts.exercisesDone} of ${counts.exercises} exercises done`}
              </PixelText>
              <SessionClock startedAt={session.startedAt} />
            </View>
          </PixelFrame>

          <TrainWarningList
            warnings={warnings}
            acknowledged={session.acknowledged}
            onAcknowledge={acknowledge}
            testIDPrefix="session-warning"
          />

          {!battle && (
            <RestPanel key={session.restEndsAt ?? 'none'} session={session} onSkip={skipRest} />
          )}

          {battle ? (
            <BattleBoard
              blocks={battle}
              session={session}
              disabled={pending}
              pendingNote={pending ? ACKNOWLEDGE_TO_LOG_NOTE : undefined}
              onTap={onTapFoe}
              onLongPress={onLongPressFoe}
              onInfo={setInfoId}
              onPauseTimer={pauseTimer}
              onResumeTimer={resumeTimer}
              onResetTimer={resetTimer}
            />
          ) : current && currentNode ? (
            <ExerciseCard
              exercise={current.exercise}
              highlighted
              onInfo={() => setInfoId(current.exercise.nodeId)}
              testID="current-exercise">
              {currentFoes && (
                <FoeRow key={current.exercise.key} foes={currentFoes} testID="current-foes" />
              )}
              <SetLogger
                key={`${current.exercise.key}-${current.setNumber}`}
                node={currentNode}
                current={current}
                onLog={(entered, mark) => logSet(current.exercise.key, entered, mark)}
                pendingNote={pending ? ACKNOWLEDGE_TO_LOG_NOTE : undefined}
                timer={
                  session.timer?.exerciseKey === current.exercise.key ? session.timer : undefined
                }
                onStartTimer={() => startTimer(current.exercise.key)}
                onStopTimer={stopTimer}
                onPauseTimer={pauseTimer}
                onResumeTimer={resumeTimer}
                onResetTimer={resetTimer}
                onEditSet={(set) => setEditing(set.setIndex)}
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

          {!battle && (
            <View style={styles.gap}>
              <View style={styles.row}>
                <PixelText
                  variant="label"
                  tone="gold"
                  accessibilityRole="header"
                  style={styles.rowText}>
                  This session
                </PixelText>
                <PixelButton
                  label={reordering ? 'Done' : 'Reorder'}
                  variant="secondary"
                  onPress={() => setReordering((value) => !value)}
                  accessibilityLabel={reordering ? 'Done reordering' : 'Reorder exercises'}
                  testID="session-reorder"
                />
              </View>
              {view.blocks.flatMap((block) =>
                block.exercises.map((exercise) => (
                  <SessionRow
                    key={exercise.key}
                    exercise={exercise}
                    blockLabel={block.label}
                    current={exercise.key === session.currentKey}
                    onPress={() => selectExercise(exercise.key)}
                    moves={reordering ? view.moves[exercise.key] : undefined}
                    onMove={(direction) => moveExercise(exercise.key, direction)}
                  />
                )),
              )}
            </View>
          )}

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
        {battle && (
          <RestPanel
            key={session.restEndsAt ?? 'none'}
            session={session}
            onSkip={skipRest}
            compact
            style={[styles.restBar, { paddingBottom: Spacing.sm + insets.bottom }]}
          />
        )}
      </View>

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

      {editedSet && editedExercise && editedNode && (
        <EditSetSheet
          key={editedSet.setIndex}
          node={editedNode}
          metric={editedExercise.metric}
          target={editedExercise.target}
          set={editedSet}
          onSave={(entered, mark) => {
            editSet(editedSet.setIndex, entered, mark);
            setEditing(undefined);
          }}
          onDelete={() => {
            deleteSet(editedSet.setIndex);
            setEditing(undefined);
          }}
          onClose={() => setEditing(undefined)}
        />
      )}

      {loggingExercise && loggingNode && (
        <LogSetSheet
          node={loggingNode}
          metric={loggingExercise.metric}
          target={loggingExercise.target}
          setLabel={foeSetLabel(
            exerciseSets(session, loggingExercise.key).length,
            loggingExercise.sets,
          )}
          onLog={(entered) => {
            logSet(loggingExercise.key, entered);
            setLogging(undefined);
          }}
          onClose={() => setLogging(undefined)}
        />
      )}

      {infoNode && <ExerciseInfoSheet node={infoNode} onClose={() => setInfoId(undefined)} />}

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
  /** Set while reordering: the row shows Up / Down instead of being a button. */
  moves?: ExerciseMoves;
  onMove: (direction: MoveDirection) => void;
};

/** One exercise in the session list: tap to train it now, or move it while reordering. */
function SessionRow({ exercise, blockLabel, current, onPress, moves, onMove }: RowProps) {
  const status = exercise.skipped ? 'Skipped' : `${exercise.setsLogged} / ${exercise.sets}`;
  if (moves) {
    return (
      <View testID={`session-row-${exercise.key}`}>
        <PixelFrame frame={current ? Frames.selected : Frames.stone} padding={Spacing.sm}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <PixelText tone={current ? 'gold' : 'text'}>{exercise.name}</PixelText>
              <PixelText variant="small" tone="textMuted">
                {exercise.pairedWithName ? `${blockLabel} · pair` : blockLabel}
              </PixelText>
            </View>
            <PixelButton
              label="Up"
              variant="secondary"
              onPress={() => onMove(-1)}
              disabled={!moves.up}
              accessibilityLabel={`Move ${exercise.name} up`}
              testID={`move-up-${exercise.key}`}
            />
            <PixelButton
              label="Down"
              variant="secondary"
              onPress={() => onMove(1)}
              disabled={!moves.down}
              accessibilityLabel={`Move ${exercise.name} down`}
              testID={`move-down-${exercise.key}`}
            />
          </View>
        </PixelFrame>
      </View>
    );
  }
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
  fill: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  /**
   * Battle's rest bar under the scrolling board (PLAN 7.9): coming and going it only shortens the
   * view from below, so the monsters never move under the finger.
   */
  restBar: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
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
