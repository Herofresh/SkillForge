/**
 * On-demand workout generator (PLAN 2.5, ADR-005, ADR-006, ADR-023, ADR-024). Pure: every input is
 * a parameter (`WorkoutRequest`), including the time and a seed, so the same request gives the same
 * plan. The plan is the app's base suggestion; the user may swap, remove or add anything (ADR-023).
 *
 * Steps:
 * 1. **Frontier** (`goalFrontier`): for each goal, walk its unmet hard prerequisites down to the
 *    nodes the user can train now (available, training or self-unlocked). Alternatives satisfy
 *    prerequisites (ADR-019, via `resolveTree`), and a trainable alternative stands in for a locked
 *    prerequisite. A goal without unmet prerequisites trains itself.
 * 2. **Candidates**: the frontier plus every available/training node the user has not outgrown.
 *    Nodes the equipment profile can't do are substituted by an alternative (same pattern, closest
 *    ogLevel) or dropped. Nodes with a pattern trained less than 48 h ago are skipped, and so is all
 *    straight-arm work when the last straight-arm session is less than 48 h ago (ADR-010).
 * 3. **Scoring** (`scoreCandidate`): goal-path weight (critical path first) + days since the
 *    pattern was trained + push/pull deficit + stagnation bonus + a little for harder nodes.
 * 4. **Trial day** (ADR-025): when the best-ranked straight-arm candidate with a due Trial exists,
 *    that Trial is the session's only straight-arm work; its sets don't count against the budget.
 * 5. **Slots**: fixed prep, then skill, paired strength, core and cool-down slots, filled greedily
 *    best score first while they fit the time and the straight-arm budget; warm-up ramp sets last.
 * 6. **Prescription** (`prescribe`): double progression inside the working range from the last
 *    performance; the Trial once the top of the range is reached (for straight-arm nodes only
 *    after `MIN_WEEKS_AT_LEVEL` weeks).
 *
 * The generator's suggestions always respect the advisory safeguards (AGENT.md §5); the warnings
 * that still apply (e.g. a self-unlocked node's prerequisites) are attached to the plan.
 */
import { clamp } from '@/lib/clamp';
import { hashString } from '@/lib/hash';
import { MS_PER_DAY, MS_PER_HOUR } from '@/lib/time';

import {
  attributePeakOgLevels,
  computeAttributes,
  hasPushPullImbalance,
  nodeAttributes,
  type AttributeValues,
} from './character';
import { resolveTree, type NodeStatus } from './progression';
import { compareHistory } from './recompute';
import {
  isStraightArmRested,
  lastStraightArmSessionAt,
  isTrialOpenBySafeguards,
  MIN_WEEKS_AT_LEVEL,
  prerequisitesWarning,
  remainingStraightArmBudget,
  sessionSafeguardWarnings,
  STRAIGHT_ARM_REST_HOURS,
  STRAIGHT_ARM_SESSION_BUDGET_S,
  straightArmSecondsUsed,
  trialOpensAt,
  trialWarnings,
} from './safeguards';
import type {
  EquipmentTag,
  ExerciseNode,
  LoggedSession,
  LoggedSet,
  Metric,
  NodeLookup,
  NodeProgress,
  NodeState,
  Pattern,
  PlannedExercise,
  SafeguardWarning,
  SetPerformance,
  WorkoutBlock,
  WorkoutBlockKind,
  WorkoutPlan,
  WorkoutRequest,
} from './types';
import { WORKOUT_BLOCK_KINDS } from './types';
import { classifyOutcome } from './xp';

// --- Scoring (ADR-024) ------------------------------------------------------------------------

/** Every frontier node of a goal gets this much, per goal it leads to. */
export const GOAL_BASE_WEIGHT = 50;
/** Plus up to this much for being on the goal's critical (longest remaining) path. */
export const CRITICAL_PATH_WEIGHT = 30;
/** Points per day since the node's most recently trained pattern, up to `RECENCY_MAX_DAYS`. */
export const RECENCY_POINTS_PER_DAY = 5;
export const RECENCY_MAX_DAYS = 7;
/** Up to this much for a node that trains the weaker of push and pull (by attribute points). */
export const BALANCE_WEIGHT = 20;
/** For a node whose best set has not improved over its last `STAGNATION_SESSIONS` sessions. */
export const STAGNATION_BONUS = 10;
export const STAGNATION_SESSIONS = 3;
/** Points per ogLevel, so the harder of two otherwise equal nodes wins (train at your edge). */
export const OG_LEVEL_POINTS = 1;

// --- Recovery ---------------------------------------------------------------------------------

/** A movement pattern trained less than this long ago is skipped (ADR-006). */
export const PATTERN_REST_HOURS = 48;
/** Low-fatigue patterns that can be practised daily; they never trigger the 48 h skip. */
export const RECOVERY_EXEMPT_PATTERNS: readonly Pattern[] = ['balance', 'mobility'];
/**
 * Sets of one node in one session count as working sets (pattern recency, last performance,
 * stagnation) from this many on; the one-set warm-up items do not. Also the fewest sets a trimmed
 * working exercise keeps.
 */
export const MIN_WORKING_SETS = 2;

// --- Slots ------------------------------------------------------------------------------------

/** Fixed prep at the start of every session, when the tree has them and the profile allows. */
export const WARM_UP_PREP_IDS: readonly string[] = ['wrist_prep', 'shoulder_dislocate'];
/** Easier variations (the `regressionId`) of the day's main exercises added to the warm-up. */
export const WARM_UP_MAX_RAMP = 2;
export const WARM_UP_SETS = 1;
/** Skill slots: the first takes any skill, the second only goal (frontier) skills. */
export const SKILL_SLOTS = 2;
/**
 * Paired strength slots (docs/research/progressions.md → Structure): pull + legs, push + hinge,
 * row + push. Each side takes the best candidate that has one of its patterns.
 */
export const STRENGTH_PAIRS: readonly (readonly [readonly Pattern[], readonly Pattern[]])[] = [
  [['vertical_pull'], ['squat']],
  [['vertical_push', 'horizontal_push'], ['hinge']],
  [['horizontal_pull'], ['horizontal_push', 'vertical_push']],
];

// --- Prescription and time --------------------------------------------------------------------

export const WORKING_SETS = 3;
/** Double progression: how much the per-set target grows after a fully successful session. */
export const PROGRESSION_STEP: Readonly<Record<Metric, number>> = {
  reps: 1,
  hold_s: 5,
  eccentric_s: 1,
  load_xbw: 0.05,
};
/** Rest after each set: inside a pair (alternate the two exercises), otherwise, and warm-up. */
export const PAIR_REST_SEC = 90;
export const SINGLE_REST_SEC = 180;
export const WARM_UP_REST_SEC = 30;
/** Time estimate: seconds per rep and per exercise for setting up. */
export const SECONDS_PER_REP = 3;
export const TRANSITION_SEC = 30;

const TRAINABLE_FILL_STATES: readonly NodeState[] = ['available', 'training'];
const TARGET_DECIMALS = 100;

// --- Small helpers ----------------------------------------------------------------------------

const lookupOf = (nodes: readonly ExerciseNode[]): NodeLookup =>
  new Map(nodes.map((node) => [node.id, node]));

const usesRepCount = (metric: Metric): boolean => metric === 'eccentric_s' || metric === 'load_xbw';

const roundTarget = (value: number): number =>
  Math.round(value * TARGET_DECIMALS) / TARGET_DECIMALS;

const patternLabel = (pattern: Pattern): string => pattern.replace(/_/g, ' ');

/** Whether one equipment option (an AND-set of tags) of `node` fits the profile (ADR-005). */
export function isDoableWith(node: ExerciseNode, equipment: readonly EquipmentTag[]): boolean {
  return node.equipment.some((option) => option.every((tag) => equipment.includes(tag)));
}

/**
 * The equipment substitute for `node` (ADR-005): among its `alternatives` that the profile can do
 * and that share its main pattern, an unlocked one first, then the closest ogLevel, then by id.
 */
export function substituteFor(
  node: ExerciseNode,
  equipment: readonly EquipmentTag[],
  lookup: NodeLookup,
  statuses: ReadonlyMap<string, NodeStatus>,
): ExerciseNode | undefined {
  const mainPattern = node.patterns[0];
  const options = node.alternatives
    .map((id) => lookup.get(id))
    .filter((alt): alt is ExerciseNode => alt !== undefined)
    .filter((alt) => isDoableWith(alt, equipment) && alt.patterns.includes(mainPattern));
  const lockedRank = (alt: ExerciseNode) => (statuses.get(alt.id)?.state === 'locked' ? 1 : 0);
  options.sort(
    (a, b) =>
      lockedRank(a) - lockedRank(b) ||
      Math.abs(a.ogLevel - node.ogLevel) - Math.abs(b.ogLevel - node.ogLevel) ||
      (a.id < b.id ? -1 : 1),
  );
  return options[0];
}

// --- Frontier ---------------------------------------------------------------------------------

/**
 * Goal-path weight per frontier node id. For each goal, its unmet hard prerequisites are walked
 * down to trainable nodes; each one gets `GOAL_BASE_WEIGHT` plus `CRITICAL_PATH_WEIGHT` × (its
 * distance to the goal / the longest distance of that goal's frontier), so the start of the
 * critical path comes first. Weights add up over goals (shared prerequisites count more). Unknown
 * and mastered goals are ignored.
 */
export function goalFrontier(
  goals: readonly string[],
  lookup: NodeLookup,
  statuses: ReadonlyMap<string, NodeStatus>,
): Map<string, number> {
  const weights = new Map<string, number>();
  const isTrainable = (id: string) => {
    const state = statuses.get(id)?.state;
    return state !== undefined && state !== 'locked';
  };
  // A locked prerequisite is also met by a trainable alternative (ADR-019): train that one.
  const standIn = (id: string) =>
    isTrainable(id) ? id : (lookup.get(id)?.alternatives.find(isTrainable) ?? id);

  for (const goal of new Set(goals)) {
    const goalStatus = statuses.get(goal);
    if (!goalStatus || goalStatus.state === 'mastered') continue;
    const depth = new Map<string, number>();
    const frontier = new Set<string>();
    const visit = (id: string, distance: number) => {
      const status = statuses.get(id);
      if (!status || (depth.get(id) ?? -1) >= distance) return;
      depth.set(id, distance);
      if (status.state !== 'locked') {
        frontier.add(id);
        return;
      }
      for (const prereq of status.unmetHard) visit(standIn(prereq.nodeId), distance + 1);
    };
    visit(goal, 0);
    const longest = Math.max(0, ...[...frontier].map((id) => depth.get(id) ?? 0));
    for (const id of frontier) {
      const pathShare = longest === 0 ? 1 : (depth.get(id) ?? 0) / longest;
      const weight = GOAL_BASE_WEIGHT + CRITICAL_PATH_WEIGHT * pathShare;
      weights.set(id, (weights.get(id) ?? 0) + weight);
    }
  }
  return weights;
}

// --- History ----------------------------------------------------------------------------------

/** Working sets (≥ `MIN_WORKING_SETS` of one node) per session, sessions in replay order. */
function workingSetsBySession(
  sessions: readonly LoggedSession[],
): { startedAt: number; byNode: Map<string, LoggedSet[]> }[] {
  return [...sessions].sort(compareHistory).map((session) => {
    const byNode = new Map<string, LoggedSet[]>();
    for (const set of session.sets) {
      const list = byNode.get(set.nodeId);
      if (list) list.push(set);
      else byNode.set(set.nodeId, [set]);
    }
    for (const [nodeId, sets] of byNode) {
      if (sets.length < MIN_WORKING_SETS) byNode.delete(nodeId);
    }
    return { startedAt: session.startedAt, byNode };
  });
}

type WorkingHistory = ReturnType<typeof workingSetsBySession>;

/** Start of the latest session with working sets of each pattern. */
function patternLastTrained(history: WorkingHistory, lookup: NodeLookup): Map<Pattern, number> {
  const last = new Map<Pattern, number>();
  for (const session of history) {
    for (const nodeId of session.byNode.keys()) {
      for (const pattern of lookup.get(nodeId)?.patterns ?? []) {
        last.set(pattern, Math.max(last.get(pattern) ?? session.startedAt, session.startedAt));
      }
    }
  }
  return last;
}

/** The working sets of `node` in its latest session with any (same metric only). */
function lastPerformance(node: ExerciseNode, history: WorkingHistory): LoggedSet[] | undefined {
  for (let index = history.length - 1; index >= 0; index--) {
    const sets = history[index].byNode.get(node.id)?.filter((set) => set.metric === node.metric);
    if (sets && sets.length > 0) return sets;
  }
  return undefined;
}

/** Best set of the node's last `STAGNATION_SESSIONS` sessions did not improve, below the range top. */
function isStalled(node: ExerciseNode, history: WorkingHistory): boolean {
  const bests = history
    .map((session) => session.byNode.get(node.id)?.filter((set) => set.metric === node.metric))
    .filter((sets): sets is LoggedSet[] => sets !== undefined && sets.length > 0)
    .map((sets) => Math.max(...sets.map((set) => set.actual.value)));
  if (bests.length < STAGNATION_SESSIONS) return false;
  const recent = bests.slice(-STAGNATION_SESSIONS);
  const latest = recent[recent.length - 1];
  return latest <= recent[0] && latest < node.workingRange.max;
}

// --- Scoring ----------------------------------------------------------------------------------

export interface ScoreContext {
  goalWeights: ReadonlyMap<string, number>;
  patternLast: ReadonlyMap<Pattern, number>;
  attributes: Readonly<AttributeValues>;
  now: number;
}

/** Share by which `own` lags behind `other` (0 when it doesn't, 1 when `own` is 0). */
function deficitRatio(own: number, other: number): number {
  const top = Math.max(own, other);
  return top === 0 ? 0 : Math.max(0, other - own) / top;
}

/** Days since the most recently trained of the node's patterns, capped; never trained = the cap. */
export function daysSincePatterns(
  node: ExerciseNode,
  patternLast: ReadonlyMap<Pattern, number>,
  now: number,
): number {
  const times = node.patterns
    .map((pattern) => patternLast.get(pattern))
    .filter((at): at is number => at !== undefined);
  if (times.length === 0) return RECENCY_MAX_DAYS;
  return clamp((now - Math.max(...times)) / MS_PER_DAY, 0, RECENCY_MAX_DAYS);
}

/** Whether a non-exempt pattern of `node` was trained less than `PATTERN_REST_HOURS` ago. */
export function isRecovering(
  node: ExerciseNode,
  patternLast: ReadonlyMap<Pattern, number>,
  now: number,
): boolean {
  return node.patterns.some((pattern) => {
    if (RECOVERY_EXEMPT_PATTERNS.includes(pattern)) return false;
    const at = patternLast.get(pattern);
    return at !== undefined && now - at < PATTERN_REST_HOURS * MS_PER_HOUR;
  });
}

/**
 * Score of training `node` today (without the stagnation bonus, which needs history):
 * goal-path weight of `goalNodeId` (the node before substitution) + recency + push/pull deficit +
 * ogLevel points.
 */
export function scoreCandidate(
  node: ExerciseNode,
  goalNodeId: string,
  context: ScoreContext,
): number {
  const trained = nodeAttributes(node);
  const { push, pull } = context.attributes;
  const balance =
    (trained.includes('push') ? deficitRatio(push, pull) : 0) +
    (trained.includes('pull') ? deficitRatio(pull, push) : 0);
  return (
    (context.goalWeights.get(goalNodeId) ?? 0) +
    RECENCY_POINTS_PER_DAY * daysSincePatterns(node, context.patternLast, context.now) +
    BALANCE_WEIGHT * balance +
    OG_LEVEL_POINTS * node.ogLevel
  );
}

// --- Prescription -----------------------------------------------------------------------------

export interface Prescription {
  sets: number;
  target: SetPerformance;
  isTrial: boolean;
  /** The top of the range is reached but the straight-arm Trial clock is still running. */
  trialDeferredUntil?: number;
}

const withRepCount = (node: ExerciseNode, value: number): SetPerformance =>
  usesRepCount(node.metric) ? { value, reps: node.trial.reps ?? 1 } : { value };

/** Working sets at the top of the range (a Trial that does not fit falls back to this). */
const topOfRange = (node: ExerciseNode): Prescription => ({
  sets: WORKING_SETS,
  target: withRepCount(node, node.workingRange.max),
  isTrial: false,
});

/**
 * Double progression from the last performance (ADR-024). Without history: `WORKING_SETS` × the
 * bottom of the range. After a fully successful session: the weakest set + `PROGRESSION_STEP`,
 * else the weakest set again, always inside the working range. Once every set reached the top of
 * the range and the Trial is not passed yet, the Trial is prescribed, for a straight-arm node only
 * when `isTrialOpenBySafeguards` (ADR-010).
 */
export function prescribe(
  node: ExerciseNode,
  progress: NodeProgress | undefined,
  lastSets: readonly LoggedSet[] | undefined,
  now: number,
): Prescription {
  const { min, max } = node.workingRange;
  if (!lastSets || lastSets.length === 0) {
    return { sets: WORKING_SETS, target: withRepCount(node, min), isTrial: false };
  }
  const weakest = Math.min(...lastSets.map((set) => set.actual.value));
  if (weakest >= max && !progress?.trialPassed) {
    if (isTrialOpenBySafeguards(node, progress, now)) {
      return {
        sets: node.trial.sets,
        target: withRepCount(node, node.trial.target),
        isTrial: true,
      };
    }
    return { ...topOfRange(node), trialDeferredUntil: trialOpensAt(node, progress) };
  }
  const next =
    classifyOutcome(lastSets) === 'success' ? weakest + PROGRESSION_STEP[node.metric] : weakest;
  return {
    sets: WORKING_SETS,
    target: withRepCount(node, roundTarget(clamp(next, min, max))),
    isTrial: false,
  };
}

// --- Time and straight-arm load ---------------------------------------------------------------

function workSeconds(metric: Metric, target: SetPerformance): number {
  const reps = target.reps ?? 1;
  switch (metric) {
    case 'reps':
      return target.value * SECONDS_PER_REP;
    case 'hold_s':
      return target.value;
    case 'eccentric_s':
      return reps * target.value;
    case 'load_xbw':
      return reps * SECONDS_PER_REP;
  }
}

/** Estimated seconds for one exercise: setup + each set's work and the rest after it. */
export function exerciseSeconds(exercise: PlannedExercise): number {
  return (
    TRANSITION_SEC +
    exercise.sets * (workSeconds(exercise.metric, exercise.target) + exercise.restSec)
  );
}

/** The plan's exercises as the sets they would log, performed exactly as prescribed. */
export function plannedSets(exercises: readonly PlannedExercise[], at: number): LoggedSet[] {
  const sets: LoggedSet[] = [];
  for (const exercise of exercises) {
    for (let index = 0; index < exercise.sets; index++) {
      sets.push({
        sessionId: 'plan',
        nodeId: exercise.nodeId,
        setIndex: sets.length,
        metric: exercise.metric,
        prescribed: exercise.target,
        actual: exercise.target,
        isTrial: exercise.isTrial ?? false,
        timestamp: at,
      });
    }
  }
  return sets;
}

/** All exercises of a plan's blocks, in block order. */
export function planExercises(plan: Pick<WorkoutPlan, 'blocks'>): PlannedExercise[] {
  return plan.blocks.flatMap((block) => block.exercises);
}

// --- Slot filling -----------------------------------------------------------------------------

interface Candidate {
  /** What is trained (after equipment substitution). */
  node: ExerciseNode;
  substitutedFrom?: string;
  score: number;
  tieBreak: number;
  stalled: boolean;
  fromGoal: boolean;
}

type Matcher = (node: ExerciseNode) => boolean;

interface SlotDef {
  kind: WorkoutBlockKind;
  /** One matcher per exercise; two make a pair. */
  sides: Matcher[];
  goalOnly?: boolean;
}

const isSkillNode: Matcher = (node) => node.isSkill || node.straightArm;
const isStrengthWith =
  (patterns: readonly Pattern[]): Matcher =>
  (node) =>
    !isSkillNode(node) && node.patterns.some((pattern) => patterns.includes(pattern));

const SLOT_DEFS: readonly SlotDef[] = [
  ...Array.from({ length: SKILL_SLOTS }, (_, index): SlotDef => ({
    kind: 'skill',
    sides: [isSkillNode],
    goalOnly: index > 0,
  })),
  ...STRENGTH_PAIRS.map(([a, b]): SlotDef => ({
    kind: 'strength',
    sides: [isStrengthWith(a), isStrengthWith(b)],
  })),
  { kind: 'core', sides: [isStrengthWith(['core'])] },
  // Mobility is trained after the session, and only when a goal needs it.
  { kind: 'cool_down', sides: [isStrengthWith(['mobility'])], goalOnly: true },
];

const compareCandidates = (a: Candidate, b: Candidate): number =>
  b.score - a.score || a.tieBreak - b.tieBreak || (a.node.id < b.node.id ? -1 : 1);

interface Builder {
  request: WorkoutRequest;
  lookup: NodeLookup;
  history: WorkingHistory;
  blocks: Map<number, WorkoutBlock>;
  usedIds: Set<string>;
  seconds: number;
  notes: string[];
}

const allExercises = (builder: Builder): PlannedExercise[] =>
  [...builder.blocks.values()].flatMap((block) => block.exercises);

/** Budgeted straight-arm seconds of `exercises` (a straight-arm Trial is exempt, ADR-025). */
const budgetedSeconds = (builder: Builder, exercises: readonly PlannedExercise[]): number =>
  straightArmSecondsUsed(plannedSets(exercises, builder.request.now), builder.lookup);

const straightArmSecondsLeft = (builder: Builder): number =>
  remainingStraightArmBudget(
    plannedSets(allExercises(builder), builder.request.now),
    builder.lookup,
  );

/** Straight-arm seconds of one set of `exercise` (0 for bent-arm nodes). */
function straightArmSecondsPerSet(builder: Builder, exercise: PlannedExercise): number {
  return budgetedSeconds(builder, [{ ...exercise, sets: 1 }]);
}

/** `prescribe` for `node` from the request's progress and the node's last performance. */
function prescribeFrom(
  node: ExerciseNode,
  request: WorkoutRequest,
  history: WorkingHistory,
): Prescription {
  return prescribe(node, request.progress[node.id], lastPerformance(node, history), request.now);
}

function toExercise(
  candidate: Candidate,
  prescription: Prescription,
  restSec: number,
): PlannedExercise {
  return {
    nodeId: candidate.node.id,
    sets: prescription.sets,
    target: prescription.target,
    metric: candidate.node.metric,
    restSec,
    ...(prescription.isTrial ? { isTrial: true } : {}),
    ...(candidate.substitutedFrom ? { substitutedFrom: candidate.substitutedFrom } : {}),
  };
}

/**
 * The prescribed exercise for `candidate`, fitted to the straight-arm budget left (fewer sets; a
 * straight-arm Trial is exempt, ADR-025). `undefined` when not even one set fits.
 */
function fitExercise(
  builder: Builder,
  candidate: Candidate,
  restSec: number,
  saLeft: number,
): { exercise: PlannedExercise; notes: string[] } | undefined {
  const { node } = candidate;
  const notes: string[] = [];
  const prescription = prescribeFrom(node, builder.request, builder.history);
  let exercise = toExercise(candidate, prescription, restSec);
  const perSet = straightArmSecondsPerSet(builder, exercise);
  if (perSet > 0 && exercise.sets * perSet > saLeft) {
    const maxSets = Math.floor(saLeft / perSet);
    if (maxSets < 1) return undefined;
    exercise = { ...exercise, sets: Math.min(exercise.sets, maxSets) };
  }
  if (prescription.trialDeferredUntil !== undefined) {
    const days = Math.ceil((prescription.trialDeferredUntil - builder.request.now) / MS_PER_DAY);
    notes.push(
      Number.isFinite(days)
        ? `${node.name}: top of the range reached. Its Trial is recommended in ${days} days ` +
            `(${MIN_WEEKS_AT_LEVEL} weeks of straight-arm training first).`
        : `${node.name}: its Trial is recommended after ${MIN_WEEKS_AT_LEVEL} weeks of training.`,
    );
  }
  if (candidate.stalled) {
    notes.push(
      `${node.name} has not improved in ${STAGNATION_SESSIONS} sessions, so it gets priority today.`,
    );
  }
  return { exercise, notes };
}

/** A copy with at most `MIN_WORKING_SETS` sets; a Trial becomes working sets at the range top. */
function reduced(builder: Builder, exercise: PlannedExercise): PlannedExercise {
  const sets = Math.min(exercise.sets, MIN_WORKING_SETS);
  if (!exercise.isTrial) return { ...exercise, sets };
  const node = builder.lookup.get(exercise.nodeId) as ExerciseNode; // plan ids come from the tree
  return {
    nodeId: exercise.nodeId,
    sets,
    target: topOfRange(node).target,
    metric: exercise.metric,
    restSec: exercise.restSec,
    ...(exercise.substitutedFrom ? { substitutedFrom: exercise.substitutedFrom } : {}),
  };
}

/**
 * Adds `exercises` as one block if they fit the time left (else trimmed to fewer sets). A trimmed
 * straight-arm Trial becomes budgeted working sets, so the budget is checked again.
 */
function tryAddBlock(
  builder: Builder,
  slotIndex: number,
  kind: WorkoutBlockKind,
  exercises: PlannedExercise[],
  notes: string[],
): boolean {
  const budget = builder.request.availableMinutes * 60;
  const seconds = (list: PlannedExercise[]) => list.reduce((s, e) => s + exerciseSeconds(e), 0);
  let chosen = exercises;
  if (builder.seconds + seconds(chosen) > budget) {
    chosen = exercises.map((exercise) => reduced(builder, exercise));
    if (builder.seconds + seconds(chosen) > budget) return false;
    if (
      budgetedSeconds(builder, [...allExercises(builder), ...chosen]) >
      STRAIGHT_ARM_SESSION_BUDGET_S
    ) {
      return false;
    }
  }
  builder.blocks.set(slotIndex, { kind, exercises: chosen });
  builder.seconds += seconds(chosen);
  for (const exercise of chosen) builder.usedIds.add(exercise.nodeId);
  builder.notes.push(...notes);
  return true;
}

/** Fills one slot with its best unused candidates that fit; `false` when nothing was added. */
function fillSlot(
  builder: Builder,
  slotIndex: number,
  def: SlotDef,
  candidates: readonly Candidate[],
): boolean {
  const pool = (side: Matcher) =>
    candidates.filter(
      (c) => side(c.node) && !builder.usedIds.has(c.node.id) && (!def.goalOnly || c.fromGoal),
    );
  if (def.sides.length === 1) {
    for (const candidate of pool(def.sides[0])) {
      const fitted = fitExercise(
        builder,
        candidate,
        SINGLE_REST_SEC,
        straightArmSecondsLeft(builder),
      );
      if (!fitted) continue;
      if (tryAddBlock(builder, slotIndex, def.kind, [fitted.exercise], fitted.notes)) return true;
    }
    return false;
  }
  const picked: Candidate[] = [];
  for (const side of def.sides) {
    const next = pool(side).find((c) => !picked.includes(c));
    if (next) picked.push(next);
  }
  if (picked.length === 0) return false;
  const restSec = picked.length > 1 ? PAIR_REST_SEC : SINGLE_REST_SEC;
  const fitted = picked.map((c) =>
    fitExercise(builder, c, restSec, straightArmSecondsLeft(builder)),
  );
  if (fitted.some((f) => f === undefined)) return false;
  const list = fitted as { exercise: PlannedExercise; notes: string[] }[];
  return tryAddBlock(
    builder,
    slotIndex,
    def.kind,
    list.map((f) => f.exercise),
    list.flatMap((f) => f.notes),
  );
}

function warmUpExercise(node: ExerciseNode): PlannedExercise {
  return {
    nodeId: node.id,
    sets: WARM_UP_SETS,
    target: withRepCount(node, node.workingRange.min),
    metric: node.metric,
    restSec: WARM_UP_REST_SEC,
  };
}

/** Adds `node` to the warm-up block if it fits the time left. */
function addToWarmUp(builder: Builder, node: ExerciseNode): void {
  const exercise = warmUpExercise(node);
  const cost = exerciseSeconds(exercise);
  if (builder.seconds + cost > builder.request.availableMinutes * 60) return;
  const block = builder.blocks.get(WARM_UP_SLOT) ?? { kind: 'warm_up', exercises: [] };
  block.exercises.push(exercise);
  builder.blocks.set(WARM_UP_SLOT, block);
  builder.seconds += cost;
  builder.usedIds.add(node.id);
}

/** The warm-up block sits before every slot. */
const WARM_UP_SLOT = -1;

// --- Entry point ------------------------------------------------------------------------------

/** Nodes the user has moved past: a node that depends on them (prerequisite or regression) is in use. */
function outgrownIds(
  nodes: readonly ExerciseNode[],
  statuses: ReadonlyMap<string, NodeStatus>,
): Set<string> {
  const outgrown = new Set<string>();
  for (const node of nodes) {
    const state = statuses.get(node.id)?.state;
    if (state === undefined || state === 'locked' || state === 'available') continue;
    for (const prereq of node.prerequisites) outgrown.add(prereq.nodeId);
    if (node.regressionId) outgrown.add(node.regressionId);
  }
  return outgrown;
}

/**
 * Suggests one session for `request` (ADR-006, ADR-024). Deterministic: the same request (including
 * `now` and `seed`) gives the same plan.
 */
export function generateWorkout(request: WorkoutRequest): WorkoutPlan {
  const { nodes, progress, equipment, now } = request;
  const lookup = lookupOf(nodes);
  const statuses = resolveTree(nodes, progress);
  const history = workingSetsBySession(request.recentSessions);
  const goalWeights = goalFrontier(request.goals, lookup, statuses);
  const context: ScoreContext = {
    goalWeights,
    patternLast: patternLastTrained(history, lookup),
    attributes: computeAttributes(nodes, progress),
    now,
  };
  const lastStraightArmAt = lastStraightArmSessionAt(request.recentSessions, lookup);
  const straightArmRested = isStraightArmRested(lastStraightArmAt, now);
  const notes: string[] = [];

  for (const goal of request.goals) {
    if (!lookup.has(goal)) notes.push(`Goal '${goal}' is not in your skill tree and was skipped.`);
  }

  // Candidates: the frontier first, then everything trainable the user has not outgrown.
  const outgrown = outgrownIds(nodes, statuses);
  const fill = nodes
    .filter((node) => TRAINABLE_FILL_STATES.includes(statuses.get(node.id)?.state ?? 'locked'))
    .filter((node) => !outgrown.has(node.id))
    .map((node) => node.id);
  const baseIds = [...new Set([...goalWeights.keys(), ...fill])];
  const candidates = new Map<string, Candidate>();
  const recovering = new Set<Pattern>();
  let skippedStraightArm = false;
  for (const id of baseIds) {
    const original = lookup.get(id) as ExerciseNode; // ids come from the tree
    const fromGoal = goalWeights.has(id);
    const node = isDoableWith(original, equipment)
      ? original
      : substituteFor(original, equipment, lookup, statuses);
    if (!node) {
      if (fromGoal) {
        notes.push(
          `${original.name} is on the way to your goal but needs equipment this profile doesn't ` +
            'have, and no alternative fits.',
        );
      }
      continue;
    }
    if (node.straightArm && !straightArmRested) {
      skippedStraightArm = true;
      continue;
    }
    if (isRecovering(node, context.patternLast, now)) {
      for (const pattern of node.patterns) {
        if (!RECOVERY_EXEMPT_PATTERNS.includes(pattern)) recovering.add(pattern);
      }
      continue;
    }
    const stalled = isStalled(node, history);
    const candidate: Candidate = {
      node,
      ...(node.id !== id ? { substitutedFrom: id } : {}),
      score: scoreCandidate(node, id, context) + (stalled ? STAGNATION_BONUS : 0),
      tieBreak: hashString(`${request.seed}:${node.id}`),
      stalled,
      fromGoal,
    };
    const existing = candidates.get(node.id);
    if (!existing || compareCandidates(candidate, existing) < 0) candidates.set(node.id, candidate);
  }
  const sorted = [...candidates.values()].sort(compareCandidates);
  // Trial day (ADR-025): the best-ranked straight-arm candidate whose Trial is due (top of the range,
  // `isTrialOpenBySafeguards`, rested) is the session's only straight-arm work.
  const trialDay = sorted.find(
    (c) => c.node.straightArm && prescribeFrom(c.node, request, history).isTrial,
  );
  const ranked = trialDay ? sorted.filter((c) => !c.node.straightArm || c === trialDay) : sorted;

  const builder: Builder = {
    request,
    lookup,
    history,
    blocks: new Map(),
    usedIds: new Set(),
    seconds: 0,
    notes,
  };

  // Fixed prep first, so it is always part of the session.
  for (const id of WARM_UP_PREP_IDS) {
    const node = lookup.get(id);
    if (node && isDoableWith(node, equipment)) addToWarmUp(builder, node);
  }

  // Slots, best candidate first, while they fit the time and the straight-arm budget.
  const open = new Set(SLOT_DEFS.keys());
  const mainOrder: string[] = [];
  while (open.size > 0) {
    let best: { index: number; score: number } | undefined;
    for (const index of open) {
      const def = SLOT_DEFS[index];
      const top = ranked.find(
        (c) =>
          !builder.usedIds.has(c.node.id) &&
          (!def.goalOnly || c.fromGoal) &&
          def.sides.some((side) => side(c.node)),
      );
      if (!top) continue;
      if (!best || top.score > best.score) best = { index, score: top.score };
    }
    if (!best) break;
    open.delete(best.index);
    if (fillSlot(builder, best.index, SLOT_DEFS[best.index], ranked)) {
      mainOrder.push(...(builder.blocks.get(best.index)?.exercises.map((e) => e.nodeId) ?? []));
    }
  }

  // Warm-up ramp: easier variations of the day's main exercises (never straight-arm: the budget).
  let ramps = 0;
  for (const id of mainOrder) {
    if (ramps >= WARM_UP_MAX_RAMP) break;
    const regression = lookup.get(lookup.get(id)?.regressionId ?? '');
    if (
      !regression ||
      regression.straightArm ||
      builder.usedIds.has(regression.id) ||
      statuses.get(regression.id)?.state === 'locked' ||
      !isDoableWith(regression, equipment)
    ) {
      continue;
    }
    const before = builder.seconds;
    addToWarmUp(builder, regression);
    if (builder.seconds > before) ramps++;
  }

  const blocks = [...builder.blocks.entries()]
    .sort(
      ([a, blockA], [b, blockB]) =>
        WORKOUT_BLOCK_KINDS.indexOf(blockA.kind) - WORKOUT_BLOCK_KINDS.indexOf(blockB.kind) ||
        a - b,
    )
    .map(([, block]) => block);
  const exercises = blocks.flatMap((block) => block.exercises);

  for (const exercise of exercises) {
    if (!exercise.substitutedFrom) continue;
    const from = lookup.get(exercise.substitutedFrom)?.name ?? exercise.substitutedFrom;
    const to = lookup.get(exercise.nodeId)?.name ?? exercise.nodeId;
    notes.push(`${to} replaces ${from}, which needs equipment this profile doesn't have.`);
  }
  if (recovering.size > 0) {
    const list = [...recovering].map(patternLabel).join(', ');
    notes.push(`Resting ${list}: trained less than ${PATTERN_REST_HOURS} h ago.`);
  }
  const trialDayExercise = exercises.find(
    (exercise) => exercise.isTrial && lookup.get(exercise.nodeId)?.straightArm,
  );
  if (trialDayExercise) {
    const name = lookup.get(trialDayExercise.nodeId)?.name ?? trialDayExercise.nodeId;
    notes.push(
      `Trial day: ${name}'s Trial is today's only straight-arm work. Its sets don't count against ` +
        `the ~${STRAIGHT_ARM_SESSION_BUDGET_S} s straight-arm budget; extra straight-arm work on ` +
        'top of it is not recommended.',
    );
  }
  if (skippedStraightArm) {
    notes.push(
      `No straight-arm work today: your last straight-arm session was less than ` +
        `${STRAIGHT_ARM_REST_HOURS} h ago.`,
    );
  }
  const peaks = attributePeakOgLevels(nodes, progress);
  if (hasPushPullImbalance(peaks)) {
    const weaker = peaks.push < peaks.pull ? 'push' : 'pull';
    notes.push(`Your push and pull levels are far apart, so ${weaker} work gets priority.`);
  }

  return {
    blocks,
    estimatedMinutes: Math.ceil(builder.seconds / 60),
    warnings: planWarnings(exercises, lookup, statuses, request, lastStraightArmAt),
    notes,
  };
}

/**
 * Advisory warnings that still apply to the plan: unmet prerequisites of self-unlocked or
 * substituted nodes, and (as a guard) any safeguard the suggestion would break, which by
 * construction is none.
 */
function planWarnings(
  exercises: readonly PlannedExercise[],
  lookup: NodeLookup,
  statuses: ReadonlyMap<string, NodeStatus>,
  request: WorkoutRequest,
  lastStraightArmAt: number | undefined,
): SafeguardWarning[] {
  const warnings: SafeguardWarning[] = [];
  for (const exercise of exercises) {
    const node = lookup.get(exercise.nodeId) as ExerciseNode;
    const prerequisites = prerequisitesWarning(
      node,
      statuses.get(node.id)?.unmetHard ?? [],
      lookup,
    );
    if (prerequisites) warnings.push(prerequisites);
    if (exercise.isTrial) {
      warnings.push(...trialWarnings(node, request.progress[node.id], request.now));
    }
  }
  warnings.push(
    ...sessionSafeguardWarnings(
      plannedSets(exercises, request.now),
      lookup,
      lastStraightArmAt,
      request.now,
    ),
  );
  return warnings;
}
