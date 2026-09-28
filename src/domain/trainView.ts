/**
 * View models of the Train flow (PLAN 4.4): what the plan preview, the live session and the summary
 * show, built from the session model (`train.ts`), the tree and a `SessionResult`. Pure, so screens
 * only render; the wording comes from `format.ts`.
 */
import { formatClock, formatPerformance, formatPrescription, formatRest } from './format';
import type { SessionResult } from './recompute';
import { elapsedSeconds, totalDurationSec } from './setTimer';
import {
  exerciseSets,
  isExerciseDone,
  sessionCounts,
  setOutcome,
  type ActiveSession,
  type SessionBlockKind,
  type SessionCounts,
  type SessionExercise,
} from './train';
import type {
  ExerciseNode,
  LoggedSet,
  Metric,
  NodeLookup,
  Outcome,
  SafeguardWarning,
  SetPerformance,
  StoredSession,
} from './types';

export const BLOCK_LABELS: Readonly<Record<SessionBlockKind, string>> = {
  warm_up: 'Warm-up',
  skill: 'Skill',
  strength: 'Strength',
  core: 'Core',
  cool_down: 'Cool-down',
  added: 'Added by you',
};

export const OUTCOME_LABELS: Readonly<Record<Outcome, string>> = {
  success: 'Success',
  partial: 'Partial',
  failed: 'Failed',
};

const nameOf = (lookup: NodeLookup, id: string): string => lookup.get(id)?.name ?? id;

/** One exercise as a card or row. */
export interface ExerciseView {
  key: string;
  nodeId: string;
  name: string;
  block: SessionBlockKind;
  /** Planned number of sets. */
  sets: number;
  prescription: string;
  rest: string;
  isTrial: boolean;
  straightArm: boolean;
  /** The node the user swapped out for this one. */
  swappedFromName?: string;
  /** The node the generator replaced because of the equipment (ADR-005). */
  substitutedFromName?: string;
  /** Name of the other exercise of its strength pair. */
  pairedWithName?: string;
  skipped: boolean;
  /** Live session only (0 / false in the preview). */
  setsLogged: number;
  done: boolean;
}

export function exerciseView(
  exercise: SessionExercise,
  lookup: NodeLookup,
  exercises: readonly SessionExercise[],
  session?: ActiveSession,
): ExerciseView {
  const partner = exercises.find((entry) => entry.key === exercise.pairKey);
  return {
    key: exercise.key,
    nodeId: exercise.nodeId,
    name: nameOf(lookup, exercise.nodeId),
    block: exercise.block,
    sets: exercise.sets,
    prescription: formatPrescription(exercise.metric, exercise.sets, exercise.target),
    rest: formatRest(exercise.restSec),
    isTrial: exercise.isTrial ?? false,
    straightArm: lookup.get(exercise.nodeId)?.straightArm ?? false,
    ...(exercise.swappedFrom !== undefined
      ? { swappedFromName: nameOf(lookup, exercise.swappedFrom) }
      : {}),
    ...(exercise.substitutedFrom !== undefined
      ? { substitutedFromName: nameOf(lookup, exercise.substitutedFrom) }
      : {}),
    ...(partner ? { pairedWithName: nameOf(lookup, partner.nodeId) } : {}),
    skipped: exercise.skipped ?? false,
    setsLogged: session ? exerciseSets(session, exercise.key).length : 0,
    done: session ? isExerciseDone(session, exercise) : false,
  };
}

/** A run of exercises of the same block kind, in session order. */
export interface BlockView {
  kind: SessionBlockKind;
  label: string;
  exercises: ExerciseView[];
}

export function blockViews(
  exercises: readonly SessionExercise[],
  lookup: NodeLookup,
  session?: ActiveSession,
): BlockView[] {
  const blocks: BlockView[] = [];
  for (const exercise of exercises) {
    const view = exerciseView(exercise, lookup, exercises, session);
    const last = blocks[blocks.length - 1];
    if (last && last.kind === exercise.block) last.exercises.push(view);
    else
      blocks.push({ kind: exercise.block, label: BLOCK_LABELS[exercise.block], exercises: [view] });
  }
  return blocks;
}

/** A logged set's result with its measured time, e.g. "8 reps · 0:42" (untimed: "8 reps"). */
export function loggedSetText(set: Pick<LoggedSet, 'metric' | 'actual' | 'durationSec'>): string {
  const result = formatPerformance(set.metric, set.actual);
  return set.durationSec === undefined ? result : `${result} · ${formatClock(set.durationSec)}`;
}

/** One logged set in the live card: "Set 2 · 8 reps · Success". */
export interface LoggedSetView {
  index: number;
  text: string;
  outcome: Outcome;
}

/** The exercise being trained now. */
export interface CurrentExerciseView {
  exercise: ExerciseView;
  metric: Metric;
  target: SetPerformance;
  /** 1-based number of the set to log next (can go past the plan: an extra set). */
  setNumber: number;
  plannedSets: number;
  sets: LoggedSetView[];
  /** What the steppers start at: the last logged result of this exercise, else the target. */
  suggested: SetPerformance;
}

export interface LiveView {
  current?: CurrentExerciseView;
  blocks: BlockView[];
  counts: SessionCounts;
  /** Logged / planned sets, 0–1 (the session bar). */
  setsFraction: number;
}

export function liveView(session: ActiveSession, lookup: NodeLookup): LiveView {
  const blocks = blockViews(session.exercises, lookup, session);
  const exercise = session.exercises.find((entry) => entry.key === session.currentKey);
  let current: CurrentExerciseView | undefined;
  if (exercise) {
    const sets = exerciseSets(session, exercise.key);
    const lastDone = [...sets].reverse().find((set) => set.actual.value > 0);
    current = {
      exercise: exerciseView(exercise, lookup, session.exercises, session),
      metric: exercise.metric,
      target: exercise.target,
      setNumber: sets.length + 1,
      plannedSets: exercise.sets,
      sets: sets.map((set, index) => ({
        index,
        text: loggedSetText(set),
        outcome: setOutcome(set),
      })),
      suggested: lastDone?.actual ?? exercise.target,
    };
  }
  const counts = sessionCounts(session);
  return {
    ...(current ? { current } : {}),
    blocks,
    counts,
    setsFraction:
      counts.setsPlanned === 0 ? 0 : Math.min(1, counts.setsLogged / counts.setsPlanned),
  };
}

/** The summary after finishing (PLAN 4.4). */
export interface SummaryView {
  totalXp: number;
  exerciseXp: number;
  completionBonus: number;
  streakBonus: number;
  streak: number;
  exercises: {
    nodeId: string;
    name: string;
    outcome: Outcome;
    outcomeLabel: string;
    xp: number;
    trialAttempted: boolean;
    trialPassed: boolean;
    /** The exercise's timed sets added up ("2:15"); unset when no set was timed. */
    time?: string;
  }[];
  /** Start to finish ("42:10"); unset when unknown or under a second (e.g. a quick Trial). */
  sessionTime?: string;
  levelUps: { nodeId: string; name: string; from: number; to: number }[];
  unlocked: { nodeId: string; name: string }[];
  warnings: SafeguardWarning[];
}

/** Whole seconds from start to finish of a stored session; `undefined` without an end. */
export function sessionDurationSec(session: StoredSession): number | undefined {
  return session.endedAt === undefined
    ? undefined
    : elapsedSeconds(session.startedAt, session.endedAt);
}

/**
 * The summary of `result`. With the stored `session` it also shows the time per exercise (its
 * timed sets) and the session's total time (PLAN 5.4).
 */
export function summaryView(
  result: SessionResult,
  nodes: readonly ExerciseNode[],
  session?: StoredSession,
): SummaryView {
  const lookup: NodeLookup = new Map(nodes.map((node) => [node.id, node]));
  const exerciseTime = (nodeId: string): { time?: string } => {
    const seconds = session
      ? totalDurationSec(session.sets.filter((set) => set.nodeId === nodeId))
      : undefined;
    return seconds === undefined ? {} : { time: formatClock(seconds) };
  };
  const total = session ? sessionDurationSec(session) : undefined;
  return {
    totalXp: result.xp.total,
    exerciseXp: result.xp.exerciseXp,
    completionBonus: result.xp.completionBonus,
    streakBonus: result.xp.streakBonus,
    streak: result.streak,
    exercises: result.exercises.map((exercise) => ({
      nodeId: exercise.nodeId,
      name: nameOf(lookup, exercise.nodeId),
      outcome: exercise.outcome,
      outcomeLabel: OUTCOME_LABELS[exercise.outcome],
      xp: exercise.xp,
      trialAttempted: exercise.trialAttempted,
      trialPassed: exercise.trialPassed,
      ...exerciseTime(exercise.nodeId),
    })),
    ...(total !== undefined && total > 0 ? { sessionTime: formatClock(total) } : {}),
    levelUps: result.levelUps.map((levelUp) => ({
      ...levelUp,
      name: nameOf(lookup, levelUp.nodeId),
    })),
    unlocked: result.unlocked.map((nodeId) => ({ nodeId, name: nameOf(lookup, nodeId) })),
    warnings: result.warnings,
  };
}
