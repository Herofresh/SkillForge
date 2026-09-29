/**
 * The Train flow's session model (PLAN 4.4, ADR-034): the plan the user edits before starting (swap,
 * remove), and the live session that logs sets one by one (skip, add, reorder, rest countdown, edit
 * or delete a logged set) until it is finished into an ordinary `LoggedSession`. Pure: the store
 * persists an `ActiveSession` after every change so an app kill loses nothing, and
 * `finishedSession` hands the history entry to `logSession`.
 *
 * The generator's plan is only a suggestion (ADR-023): the user may swap in any trainable node of the
 * same movement pattern, add any node (even a locked one) and skip anything. Whatever that raises
 * comes back as advisory warnings (`workoutWarnings`), acknowledged by key, never a block.
 */
import { MS_PER_SECOND } from '@/lib/time';

import { searchNodes } from './assessment';
import { exerciseSeconds, isDoableWith, plannedSets, PROGRESSION_STEP } from './generator';
import { resolveTree, type ProgressMap } from './progression';
import {
  measuredSeconds,
  pauseTimer,
  resumeTimer,
  stopTimer,
  timerModeFor,
  type SetTimer,
} from './setTimer';
import {
  WORKOUT_BLOCK_KINDS,
  type EquipmentTag,
  type ExerciseNode,
  type LoggedSession,
  type LoggedSet,
  type Metric,
  type Outcome,
  type PlannedExercise,
  type SafeguardWarning,
  type SetPerformance,
  type WorkoutBlockKind,
  type WorkoutPlan,
} from './types';
import { classifyOutcome, meetsTarget } from './xp';

/** Where an exercise sits: a generator block, or `added` by the user during the session. */
export const SESSION_BLOCK_KINDS = [...WORKOUT_BLOCK_KINDS, 'added'] as const;
export type SessionBlockKind = WorkoutBlockKind | 'added';

/** The session lengths offered by "Train now", in minutes. */
export const SESSION_MINUTES = [30, 45, 60] as const;

/** How many swap or add options a list shows at most. */
export const MAX_SWAP_OPTIONS = 8;
export const MAX_ADD_OPTIONS = 8;

/** One exercise of the session being planned or trained. */
export interface SessionExercise extends PlannedExercise {
  /** Unique within the session (`e0`, `e1`, …); stays the same when the exercise is swapped. */
  key: string;
  block: SessionBlockKind;
  /** The other exercise of a strength pair: the live session alternates their sets. */
  pairKey?: string;
  /** The node the user swapped out for this one (the first one, after several swaps). */
  swappedFrom?: string;
  /** The user skipped it in the live session. */
  skipped?: boolean;
}

/** The plan preview: the generated session, edited by the user before starting it. */
export interface SessionPlan {
  equipmentProfileId: string;
  /** The time the user chose (30/45/60). */
  minutes: number;
  exercises: SessionExercise[];
  /** The generator's notes (substitutions, Trial day, rest). */
  notes: string[];
  /** Keys (`warningKey`) of the warnings the user acknowledged. */
  acknowledged: string[];
  /** The number the next new exercise key gets. */
  nextKey: number;
}

/** A logged set of the live session, with the exercise it belongs to. */
export interface SessionSetLog extends LoggedSet {
  exerciseKey: string;
}

/** A started session: the plan plus what was logged so far (persisted after every change). */
export interface ActiveSession extends SessionPlan {
  id: string;
  startedAt: number;
  /** In logging order; `setIndex` is the position. */
  sets: SessionSetLog[];
  /** The exercise on screen; `undefined` once every exercise is done or skipped. */
  currentKey?: string;
  /** When the rest after the last set ends (ms); `undefined` when not resting. */
  restEndsAt?: number;
  /**
   * The exercise timer of the set being done (PLAN 5.4, ADR-040), running or stopped, until the
   * set is logged. Timestamps only, so it survives an app kill, paused too (5.8). Drafts before
   * 5.4 don't have it; timers before 5.8 have no pause fields.
   */
  timer?: SessionTimer;
}

/** The set timer of exercise `exerciseKey` (the next set to log of that exercise). */
export interface SessionTimer extends SetTimer {
  exerciseKey: string;
}

/** How a set is marked when it is logged. */
export const SET_MARKS = ['done', 'partial', 'failed'] as const;
export type SetMark = (typeof SET_MARKS)[number];

const keyOf = (index: number): string => `e${index}`;

// --- Plan preview -----------------------------------------------------------------------------

/** The generated plan as an editable session plan (pairs linked, keys given out). */
export function sessionPlan(
  plan: WorkoutPlan,
  equipmentProfileId: string,
  minutes: number,
): SessionPlan {
  const exercises: SessionExercise[] = [];
  for (const block of plan.blocks) {
    const first = exercises.length;
    block.exercises.forEach((exercise, index) =>
      exercises.push({ ...exercise, key: keyOf(first + index), block: block.kind }),
    );
    if (block.kind === 'strength' && block.exercises.length === 2) {
      exercises[first].pairKey = keyOf(first + 1);
      exercises[first + 1].pairKey = keyOf(first);
    }
  }
  return {
    equipmentProfileId,
    minutes,
    exercises,
    notes: [...plan.notes],
    acknowledged: [],
    nextKey: exercises.length,
  };
}

/** Estimated whole minutes of the exercises not skipped (same estimate as the generator's). */
export function planMinutes(exercises: readonly SessionExercise[]): number {
  const seconds = exercises
    .filter((exercise) => !exercise.skipped)
    .reduce((sum, exercise) => sum + exerciseSeconds(exercise), 0);
  return Math.ceil(seconds / 60);
}

/** Removes an exercise; its pair partner becomes a single exercise. */
export function removeExercise<T extends SessionPlan>(plan: T, key: string): T {
  return {
    ...plan,
    exercises: plan.exercises
      .filter((exercise) => exercise.key !== key)
      .map(({ pairKey, ...exercise }) =>
        pairKey === undefined || pairKey === key ? exercise : { ...exercise, pairKey },
      ),
  };
}

/**
 * Replaces the exercise `key` with `replacement` (prescribed by `prescribeExercise`), keeping its
 * place, block, pair and rest. `swappedFrom` remembers the node that was planned first.
 */
export function replaceExercise<T extends SessionPlan>(
  plan: T,
  key: string,
  replacement: PlannedExercise,
): T {
  return {
    ...plan,
    exercises: plan.exercises.map((exercise) => {
      if (exercise.key !== key) return exercise;
      const original = exercise.swappedFrom ?? exercise.nodeId;
      const { substitutedFrom: _dropped, ...fresh } = replacement;
      return {
        ...fresh,
        restSec: exercise.restSec,
        key,
        block: exercise.block,
        ...(exercise.pairKey !== undefined ? { pairKey: exercise.pairKey } : {}),
        ...(original !== replacement.nodeId ? { swappedFrom: original } : {}),
      };
    }),
  };
}

/** Adds `exercise` at the end of the plan (block `added`). */
export function addExercise<T extends SessionPlan>(plan: T, exercise: PlannedExercise): T {
  const { substitutedFrom: _dropped, ...fresh } = exercise;
  const added: SessionExercise = { ...fresh, key: keyOf(plan.nextKey), block: 'added' };
  return { ...plan, exercises: [...plan.exercises, added], nextKey: plan.nextKey + 1 };
}

/** What swap and add options are chosen from. */
export interface OptionContext {
  nodes: readonly ExerciseNode[];
  progress: ProgressMap;
  equipment: readonly EquipmentTag[];
}

const nodeIdsIn = (plan: SessionPlan): Set<string> =>
  new Set(plan.exercises.map((exercise) => exercise.nodeId));

/**
 * Nodes that can replace exercise `key`: trainable (not locked), doable with the equipment, sharing
 * the exercise's main movement pattern and not in the session yet. Alternatives of the planned node
 * come first, then the closest ogLevel.
 */
export function swapOptions(
  plan: SessionPlan,
  key: string,
  context: OptionContext,
): ExerciseNode[] {
  const exercise = plan.exercises.find((entry) => entry.key === key);
  const lookup = new Map(context.nodes.map((node) => [node.id, node]));
  const current = exercise && lookup.get(exercise.nodeId);
  if (!exercise || !current) return [];
  const planned = lookup.get(exercise.swappedFrom ?? exercise.substitutedFrom ?? '') ?? current;
  const preferred = new Set([...current.alternatives, ...planned.alternatives, planned.id]);
  const pattern = current.patterns[0];
  const statuses = resolveTree(context.nodes, context.progress);
  const used = nodeIdsIn(plan);
  const rank = (node: ExerciseNode) => (preferred.has(node.id) ? 0 : 1);
  return context.nodes
    .filter(
      (node) =>
        !used.has(node.id) &&
        node.patterns.includes(pattern) &&
        isDoableWith(node, context.equipment) &&
        statuses.get(node.id)?.state !== 'locked',
    )
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        Math.abs(a.ogLevel - current.ogLevel) - Math.abs(b.ogLevel - current.ogLevel) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, MAX_SWAP_OPTIONS);
}

/**
 * Nodes to add to the session. With a `query`: every node doable with the equipment whose name
 * matches (locked ones too: the user decides, a warning explains). Without: the trainable ones,
 * those in training first, then the hardest.
 */
export function addOptions(plan: SessionPlan, context: OptionContext, query = ''): ExerciseNode[] {
  const used = nodeIdsIn(plan);
  const pool = context.nodes.filter(
    (node) => !used.has(node.id) && isDoableWith(node, context.equipment),
  );
  if (query.trim().length > 0) return searchNodes(pool, query, MAX_ADD_OPTIONS);
  const statuses = resolveTree(context.nodes, context.progress);
  const rank = (node: ExerciseNode) => (statuses.get(node.id)?.state === 'training' ? 0 : 1);
  return pool
    .filter((node) => statuses.get(node.id)?.state !== 'locked')
    .sort((a, b) => rank(a) - rank(b) || b.ogLevel - a.ogLevel || a.name.localeCompare(b.name))
    .slice(0, MAX_ADD_OPTIONS);
}

// --- Warnings ---------------------------------------------------------------------------------

/** Stable identity of a warning for its acknowledgement (the message may change with the sets). */
export function warningKey(warning: SafeguardWarning): string {
  return `${warning.code}:${warning.nodeId ?? ''}`;
}

export function acknowledgeWarning<T extends SessionPlan>(plan: T, key: string): T {
  return plan.acknowledged.includes(key)
    ? plan
    : { ...plan, acknowledged: [...plan.acknowledged, key] };
}

/** Whether every warning is acknowledged (the action it gates may go ahead). */
export function allAcknowledged(
  warnings: readonly SafeguardWarning[],
  acknowledged: readonly string[],
): boolean {
  return warnings.every((warning) => acknowledged.includes(warningKey(warning)));
}

// --- Live session -----------------------------------------------------------------------------

/** Starts the session from the (edited) plan; the first exercise is current. */
export function startSession(plan: SessionPlan, id: string, at: number): ActiveSession {
  return { ...plan, id, startedAt: at, sets: [], currentKey: plan.exercises[0]?.key };
}

/** The logged sets of exercise `key`, in order. */
export function exerciseSets(session: ActiveSession, key: string): SessionSetLog[] {
  return session.sets.filter((set) => set.exerciseKey === key);
}

/** Done = all planned sets logged, or skipped. */
export function isExerciseDone(session: ActiveSession, exercise: SessionExercise): boolean {
  return exercise.skipped === true || exerciseSets(session, exercise.key).length >= exercise.sets;
}

/** The first exercise after `afterKey` (wrapping around) that is not done. */
export function nextOpenExercise(session: ActiveSession, afterKey?: string): string | undefined {
  const list = session.exercises;
  const start = afterKey === undefined ? 0 : list.findIndex((e) => e.key === afterKey) + 1;
  for (let step = 0; step < list.length; step++) {
    const exercise = list[(start + step) % list.length];
    if (!isExerciseDone(session, exercise)) return exercise.key;
  }
  return undefined;
}

/**
 * What a mark logs, from the `entered` result: `done` logs it as entered; `failed` logs 0 (the set
 * didn't happen, like a skipped set); `partial` logs it as entered when it is below the target, else
 * one step short of the target (one lowering or rep fewer for eccentric and load sets).
 */
export function markedPerformance(
  metric: Metric,
  mark: SetMark,
  entered: SetPerformance,
  target: SetPerformance,
): SetPerformance {
  if (mark === 'done') return entered;
  if (mark === 'failed') return { ...entered, value: 0 };
  if (!meetsTarget(metric, entered, target)) return entered;
  if (metric === 'eccentric_s' || metric === 'load_xbw') {
    return { ...entered, reps: Math.max(0, (target.reps ?? 1) - 1) };
  }
  const value = Math.max(0, target.value - PROGRESSION_STEP[metric]);
  return { ...entered, value: Number(value.toFixed(2)) };
}

/** A logged set's outcome against its prescription (the exercise rule applied to one set). */
export function setOutcome(set: LoggedSet): Outcome {
  return classifyOutcome([set]);
}

/** The exercise to show after logging a set of `exercise`: its pair partner, itself, or the next. */
function afterLogging(session: ActiveSession, exercise: SessionExercise): string | undefined {
  const partner = session.exercises.find((entry) => entry.key === exercise.pairKey);
  const ownCount = exerciseSets(session, exercise.key).length;
  if (
    partner &&
    !isExerciseDone(session, partner) &&
    exerciseSets(session, partner.key).length <= ownCount
  ) {
    return partner.key;
  }
  if (!isExerciseDone(session, exercise)) return exercise.key;
  return nextOpenExercise(session, exercise.key);
}

/**
 * Logs one set of exercise `key` (prescribed = its target) and starts its rest. Logging a skipped
 * exercise un-skips it. The current exercise moves on to the pair partner or the next open one.
 * A timer of that exercise gives the set its `durationSec` (stopped: as stopped; running: until
 * `at`) and is cleared.
 */
export function logSessionSet(
  session: ActiveSession,
  key: string,
  actual: SetPerformance,
  at: number,
): ActiveSession {
  const exercise = session.exercises.find((entry) => entry.key === key);
  if (!exercise) return session;
  const { timer, ...untimed } = session;
  const timed = timer?.exerciseKey === key ? timer : undefined;
  const set: SessionSetLog = {
    sessionId: session.id,
    nodeId: exercise.nodeId,
    setIndex: session.sets.length,
    metric: exercise.metric,
    prescribed: exercise.target,
    actual,
    isTrial: exercise.isTrial ?? false,
    timestamp: at,
    exerciseKey: key,
    ...(timed ? { durationSec: measuredSeconds(timed, timerModeFor(exercise.metric), at) } : {}),
  };
  const { skipped: _unskipped, ...active } = exercise;
  const next: ActiveSession = {
    // Another exercise's timer is dropped too: the user moved on without logging it.
    ...untimed,
    exercises: session.exercises.map((entry) => (entry.key === key ? active : entry)),
    sets: [...session.sets, set],
  };
  const currentKey = afterLogging(next, active);
  return {
    ...next,
    currentKey,
    restEndsAt: currentKey === undefined ? undefined : at + exercise.restSec * MS_PER_SECOND,
  };
}

/** Skips exercise `key` (what it logged so far stays); the next open one becomes current. */
export function skipExercise(session: ActiveSession, key: string): ActiveSession {
  const next: ActiveSession = {
    ...(session.timer?.exerciseKey === key ? clearSetTimer(session) : session),
    exercises: session.exercises.map((entry) =>
      entry.key === key ? { ...entry, skipped: true } : entry,
    ),
  };
  if (session.currentKey !== key) return next;
  return { ...next, currentKey: nextOpenExercise(next, key), restEndsAt: undefined };
}

/** Adds `exercise` to the live session; it becomes current when every other one is done. */
export function addSessionExercise(
  session: ActiveSession,
  exercise: PlannedExercise,
): ActiveSession {
  const next = addExercise(session, exercise);
  return next.currentKey !== undefined
    ? next
    : { ...next, currentKey: next.exercises[next.exercises.length - 1].key };
}

/** Shows exercise `key` (the user picked it from the list); another exercise's timer is dropped. */
export function selectExercise(session: ActiveSession, key: string): ActiveSession {
  if (!session.exercises.some((entry) => entry.key === key)) return session;
  const kept =
    session.timer && session.timer.exerciseKey !== key ? clearSetTimer(session) : session;
  return { ...kept, currentKey: key };
}

// --- Order and logged sets (PLAN 5.9, ADR-045) -----------------------------------------------

/** One place up (`-1`, earlier in the session) or down (`1`, later). */
export type MoveDirection = -1 | 1;

/** The list as the units that move together: a strength pair (adjacent partners) or one exercise. */
function moveUnits(exercises: readonly SessionExercise[]): SessionExercise[][] {
  const units: SessionExercise[][] = [];
  for (const exercise of exercises) {
    const last = units[units.length - 1];
    const pairsWithLast =
      last?.length === 1 && last[0].pairKey === exercise.key && exercise.pairKey === last[0].key;
    if (pairsWithLast) last.push(exercise);
    else units.push([exercise]);
  }
  return units;
}

/**
 * Moves exercise `key` one place up or down, past the neighbouring exercise (or pair). A strength
 * pair moves as one, so its sets keep alternating. It may cross into another block: the user
 * decides the order. Returns `plan` itself when nothing moves (first / last, unknown key).
 */
export function moveExercise<T extends SessionPlan>(
  plan: T,
  key: string,
  direction: MoveDirection,
): T {
  const units = moveUnits(plan.exercises);
  const from = units.findIndex((unit) => unit.some((exercise) => exercise.key === key));
  const to = from + direction;
  if (from < 0 || to < 0 || to >= units.length) return plan;
  const reordered = [...units];
  [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
  return { ...plan, exercises: reordered.flat() };
}

/** Whether `moveExercise` would move exercise `key` in `direction`. */
export function canMoveExercise(plan: SessionPlan, key: string, direction: MoveDirection): boolean {
  return moveExercise(plan, key, direction) !== plan;
}

/**
 * Replaces the result of the logged set `setIndex` with `actual` (already marked, see
 * `markedPerformance` against the set's `prescribed`). Its prescription, time stamp and measured
 * `durationSec` stay. Unknown index: `session` itself.
 */
export function editSessionSet(
  session: ActiveSession,
  setIndex: number,
  actual: SetPerformance,
): ActiveSession {
  if (!session.sets.some((set) => set.setIndex === setIndex)) return session;
  return {
    ...session,
    sets: session.sets.map((set) => (set.setIndex === setIndex ? { ...set, actual } : set)),
  };
}

/**
 * Deletes the logged set `setIndex`. The later sets move up, so `setIndex` stays the dense position
 * in logging order. Its exercise may be open again: with no current exercise (all were done), the
 * open one becomes current. Rest, timer and the current exercise otherwise stay.
 */
export function deleteSessionSet(session: ActiveSession, setIndex: number): ActiveSession {
  if (!session.sets.some((set) => set.setIndex === setIndex)) return session;
  const next: ActiveSession = {
    ...session,
    sets: session.sets
      .filter((set) => set.setIndex !== setIndex)
      .map((set, index) => ({ ...set, setIndex: index })),
  };
  return next.currentKey !== undefined ? next : { ...next, currentKey: nextOpenExercise(next) };
}

/**
 * Starts the timer for the next set of exercise `key` at `at` (replacing any other timer). Starting
 * it ends the rest countdown: the user is working again.
 */
export function startSetTimer(session: ActiveSession, key: string, at: number): ActiveSession {
  if (!session.exercises.some((entry) => entry.key === key)) return session;
  return { ...skipRest(session), timer: { exerciseKey: key, startedAt: at } };
}

/** Applies `change` to the session's timer; the same session when there is none or nothing changed. */
function withTimer(
  session: ActiveSession,
  change: (timer: SetTimer, at: number) => SetTimer,
  at: number,
): ActiveSession {
  const { timer } = session;
  if (!timer) return session;
  const { exerciseKey, ...clock } = timer;
  const next = change(clock, at);
  return next === clock ? session : { ...session, timer: { ...next, exerciseKey } };
}

/**
 * Stops the running (or paused) timer at `at`; its measurement is kept for the set until it is
 * logged. A paused timer stops at its pause.
 */
export function stopSetTimer(session: ActiveSession, at: number): ActiveSession {
  return withTimer(session, stopTimer, at);
}

/** Pauses the running timer at `at` (PLAN 5.8); the pause is stored with the draft. */
export function pauseSetTimer(session: ActiveSession, at: number): ActiveSession {
  return withTimer(session, pauseTimer, at);
}

/** Resumes the paused timer at `at`; the paused time is left out of what it measures. */
export function resumeSetTimer(session: ActiveSession, at: number): ActiveSession {
  return withTimer(session, resumeTimer, at);
}

/** Throws the timer away (cancel / reset); the set is then logged without a duration. */
export function clearSetTimer(session: ActiveSession): ActiveSession {
  const { timer: _cleared, ...rest } = session;
  return rest;
}

export function skipRest(session: ActiveSession): ActiveSession {
  const { restEndsAt: _ended, ...rest } = session;
  return rest;
}

/** Whole seconds of rest left at `now` (0 when not resting). */
export function restSecondsLeft(session: ActiveSession, now: number): number {
  if (session.restEndsAt === undefined) return 0;
  return Math.max(0, Math.ceil((session.restEndsAt - now) / MS_PER_SECOND));
}

/** The sets still planned (not logged) for the exercises that are not skipped. */
function remainingSets(session: ActiveSession, at: number): LoggedSet[] {
  return session.exercises
    .filter((exercise) => !exercise.skipped)
    .flatMap((exercise) => {
      const left = exercise.sets - exerciseSets(session, exercise.key).length;
      return left > 0 ? plannedSets([{ ...exercise, sets: left }], at) : [];
    });
}

const withoutKey = ({ exerciseKey: _key, ...set }: SessionSetLog): LoggedSet => set;

/**
 * What the session will contain if the user finishes the plan: the logged sets plus the planned
 * rest. Its straight-arm load is what the live warnings check (`workoutWarnings`).
 */
export function projectedSets(session: ActiveSession, at: number): LoggedSet[] {
  return [...session.sets.map(withoutKey), ...remainingSets(session, at)].map((set, setIndex) => ({
    ...set,
    setIndex,
  }));
}

/**
 * The session as the history entry to log at `at`. An exercise with at least one logged set gets
 * its missing planned sets as skipped sets (`actual.value` 0, as the engine expects for the outcome
 * and completion bonus). An exercise without any logged set was not trained and is left out.
 */
export function finishedSession(session: ActiveSession, at: number): LoggedSession {
  const started = new Set(session.sets.map((set) => set.exerciseKey));
  const missing: LoggedSet[] = session.exercises
    .filter((exercise) => started.has(exercise.key))
    .flatMap((exercise) => {
      const left = exercise.sets - exerciseSets(session, exercise.key).length;
      if (left <= 0) return [];
      return plannedSets([{ ...exercise, sets: left }], at).map((set) => ({
        ...set,
        sessionId: session.id,
        actual: { ...set.prescribed, value: 0 },
      }));
    });
  const sets = [...session.sets.map(withoutKey), ...missing].map((set, setIndex) => ({
    ...set,
    setIndex,
  }));
  return { id: session.id, startedAt: session.startedAt, sets };
}

/** Counts for the live header and the finish dialog. */
export interface SessionCounts {
  setsLogged: number;
  /** Planned sets of the exercises not skipped, plus extra sets logged beyond a plan. */
  setsPlanned: number;
  exercisesDone: number;
  exercises: number;
}

export function sessionCounts(session: ActiveSession): SessionCounts {
  const active = session.exercises.filter((exercise) => !exercise.skipped);
  return {
    setsLogged: session.sets.length,
    setsPlanned: active.reduce(
      (sum, exercise) => sum + Math.max(exercise.sets, exerciseSets(session, exercise.key).length),
      0,
    ),
    exercisesDone: session.exercises.filter((exercise) => isExerciseDone(session, exercise)).length,
    exercises: session.exercises.length,
  };
}

// --- Stored draft -----------------------------------------------------------------------------

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isString = (value: unknown): value is string => typeof value === 'string';

function isPerformance(value: unknown): value is SetPerformance {
  return (
    isRecord(value) && isNumber(value.value) && (value.reps === undefined || isNumber(value.reps))
  );
}

function isExercise(value: unknown): value is SessionExercise {
  return (
    isRecord(value) &&
    isString(value.key) &&
    isString(value.nodeId) &&
    isString(value.metric) &&
    isString(value.block) &&
    (SESSION_BLOCK_KINDS as readonly string[]).includes(value.block) &&
    isNumber(value.sets) &&
    isNumber(value.restSec) &&
    isPerformance(value.target)
  );
}

function isSetLog(value: unknown): value is SessionSetLog {
  return (
    isRecord(value) &&
    isString(value.exerciseKey) &&
    isString(value.nodeId) &&
    isString(value.metric) &&
    isNumber(value.setIndex) &&
    isNumber(value.timestamp) &&
    typeof value.isTrial === 'boolean' &&
    isPerformance(value.prescribed) &&
    isPerformance(value.actual) &&
    (value.durationSec === undefined || isNumber(value.durationSec))
  );
}

function isTimer(value: unknown): value is SessionTimer {
  return (
    isRecord(value) &&
    isString(value.exerciseKey) &&
    isNumber(value.startedAt) &&
    (value.stoppedAt === undefined || isNumber(value.stoppedAt)) &&
    (value.pausedAt === undefined || isNumber(value.pausedAt)) &&
    (value.pausedMs === undefined || isNumber(value.pausedMs))
  );
}

/**
 * A stored active session read back (validated at the boundary): `undefined` when the data doesn't
 * have the expected shape, e.g. written by a future app version. Drafts from before the exercise
 * timer (no `timer`, no `durationSec`) and timers from before its pause (no `pausedAt`, no
 * `pausedMs`) parse as they are.
 */
export function parseActiveSession(raw: unknown): ActiveSession | undefined {
  if (
    !isRecord(raw) ||
    !isString(raw.id) ||
    !isNumber(raw.startedAt) ||
    !isString(raw.equipmentProfileId) ||
    !isNumber(raw.minutes) ||
    !isNumber(raw.nextKey) ||
    !Array.isArray(raw.exercises) ||
    !raw.exercises.every(isExercise) ||
    !Array.isArray(raw.sets) ||
    !raw.sets.every(isSetLog) ||
    !Array.isArray(raw.notes) ||
    !raw.notes.every(isString) ||
    !Array.isArray(raw.acknowledged) ||
    !raw.acknowledged.every(isString) ||
    (raw.currentKey !== undefined && !isString(raw.currentKey)) ||
    (raw.restEndsAt !== undefined && !isNumber(raw.restEndsAt)) ||
    (raw.timer !== undefined && !isTimer(raw.timer))
  ) {
    return undefined;
  }
  return raw as unknown as ActiveSession;
}
