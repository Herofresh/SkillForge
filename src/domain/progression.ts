/**
 * Node levels, Trials, node states and unlocks (PLAN 2.2, ADR-004, ADR-019).
 *
 * - Levels 1–10 on a rising XP curve, scaled by the node's difficulty so a node takes about as many
 *   sessions to level no matter its ogLevel (harder nodes earn more XP per unit).
 * - Level `PROFICIENT_LEVEL` (5) is a cap until the Trial is passed. XP beyond the cap is banked
 *   (kept in `xp`) and counts as soon as the Trial is passed.
 * - Passing a Trial on any node (test-out) lifts the node to at least level 5 (ADR-023). Nothing
 *   blocks a Trial: the ADR-010 safeguards and unmet prerequisites only produce warnings.
 * - A user can unlock a locked node themselves (`self_unlock`, ADR-023); it then counts as unlocked.
 * - A hard prerequisite is met when its node, or one of that node's `alternatives`, reaches
 *   `minLevel`. Reaching level 5 or more for a prerequisite needs the Trial passed (Proficient).
 */
import { geometricThresholds, levelForThresholds } from '@/lib/curve';

import { prerequisitesWarning, trialWarnings } from './safeguards';
import type {
  ExerciseNode,
  LoggedSet,
  NodeLookup,
  NodeProgress,
  NodeState,
  Prerequisite,
  SafeguardWarning,
} from './types';
import { difficultyMult, meetsTarget } from './xp';

export const MAX_NODE_LEVEL = 10;
export const PROFICIENT_LEVEL = 5;
/** XP from level 1 to 2 on a foundation node; each further level costs `NODE_XP_GROWTH` × more. */
export const NODE_XP_BASE = 20;
export const NODE_XP_GROWTH = 1.35;

/** Cumulative XP per level (index = level − 1) at difficultyMult 1: [0, 20, 47, 83, 133, …]. */
export const BASE_NODE_LEVEL_THRESHOLDS: readonly number[] = geometricThresholds(
  NODE_XP_BASE,
  NODE_XP_GROWTH,
  MAX_NODE_LEVEL,
);

/** Node progress by node id. Nodes without an entry have no history. */
export type ProgressMap = Readonly<Record<string, NodeProgress>>;

/** Cumulative node XP needed to reach `level` on a node of `ogLevel`. */
export function xpForLevel(level: number, ogLevel: number): number {
  const index = Math.min(Math.max(level, 1), MAX_NODE_LEVEL) - 1;
  return Math.round(BASE_NODE_LEVEL_THRESHOLDS[index] * difficultyMult(ogLevel));
}

function levelThresholds(ogLevel: number): number[] {
  return BASE_NODE_LEVEL_THRESHOLDS.map((_, index) => xpForLevel(index + 1, ogLevel));
}

/** Node level from total node XP, capped at `PROFICIENT_LEVEL` until the Trial is passed. */
export function nodeLevel(xp: number, trialPassed: boolean, ogLevel: number): number {
  const level = levelForThresholds(xp, levelThresholds(ogLevel));
  return trialPassed ? level : Math.min(level, PROFICIENT_LEVEL);
}

/** XP earned beyond the level-5 cap that is waiting for the Trial. 0 once the Trial is passed. */
export function bankedXp(progress: NodeProgress, node: ExerciseNode): number {
  if (progress.trialPassed) return 0;
  return Math.max(0, progress.xp - xpForLevel(PROFICIENT_LEVEL, node.ogLevel));
}

export function emptyProgress(nodeId: string): NodeProgress {
  return { nodeId, xp: 0, level: 1, trialPassed: false };
}

/** Adds node XP from sets logged at `at`, recording the training times. */
export function addNodeXp(
  progress: NodeProgress,
  node: ExerciseNode,
  xp: number,
  at: number,
): NodeProgress {
  const total = progress.xp + xp;
  return {
    ...progress,
    xp: total,
    level: nodeLevel(total, progress.trialPassed, node.ogLevel),
    firstTrainedAt: progress.firstTrainedAt ?? at,
    lastTrainedAt: Math.max(progress.lastTrainedAt ?? at, at),
  };
}

/** Records a `self_unlock` at `at`; the earliest self-unlock is kept. */
export function selfUnlock(progress: NodeProgress, at: number): NodeProgress {
  return { ...progress, selfUnlockedAt: Math.min(progress.selfUnlockedAt ?? at, at) };
}

/**
 * Marks the Trial passed at `at`. Banked XP now counts; a test-out (below level 5) is lifted to
 * exactly level 5.
 */
export function passTrial(progress: NodeProgress, node: ExerciseNode, at: number): NodeProgress {
  const xp = Math.max(progress.xp, xpForLevel(PROFICIENT_LEVEL, node.ogLevel));
  return {
    ...progress,
    xp,
    trialPassed: true,
    trialPassedAt: at,
    level: nodeLevel(xp, true, node.ogLevel),
  };
}

/**
 * Whether `sets` contain a passed Trial for `node`: at least `trial.sets` Trial sets of the node's
 * metric, each reaching `trial.target` (and `trial.reps` lowerings or reps where the metric uses them).
 */
export function evaluateTrial(node: ExerciseNode, sets: readonly LoggedSet[]): boolean {
  const target = { value: node.trial.target, reps: node.trial.reps };
  const passedSets = sets.filter(
    (set) =>
      set.isTrial &&
      set.nodeId === node.id &&
      set.metric === node.metric &&
      meetsTarget(node.metric, set.actual, target),
  );
  return passedSets.length >= node.trial.sets;
}

/**
 * A node counts for a prerequisite at `minLevel` once it was trained or its Trial passed (a
 * self-unlocked, untrained node does not); level 5+ also needs the Trial passed.
 */
function reachesLevel(progress: NodeProgress | undefined, minLevel: number): boolean {
  if (!progress) return false;
  if (progress.firstTrainedAt === undefined && !progress.trialPassed) return false;
  if (minLevel >= PROFICIENT_LEVEL && !progress.trialPassed) return false;
  return progress.level >= minLevel;
}

/** Met when the prerequisite node or one of its `alternatives` reaches `minLevel` (ADR-019). */
export function isPrerequisiteMet(
  prerequisite: Prerequisite,
  progress: ProgressMap,
  nodes: NodeLookup,
): boolean {
  const candidates = [prerequisite.nodeId, ...(nodes.get(prerequisite.nodeId)?.alternatives ?? [])];
  return candidates.some((id) => reachesLevel(progress[id], prerequisite.minLevel));
}

export interface NodeStatus {
  state: NodeState;
  /**
   * Hard prerequisites that are not met yet. A non-proficient node with unmet ones is locked unless
   * the user unlocked it themselves.
   */
  unmetHard: Prerequisite[];
  /** The user unlocked the node themselves (`self_unlock`, ADR-023). */
  selfUnlocked: boolean;
  /** Recommended prerequisites that are not met: shown as warnings, never locking. */
  warnings: Prerequisite[];
}

/**
 * State of one node. A passed Trial keeps a node proficient even if a prerequisite changes later; a
 * self-unlock keeps it out of `locked`.
 */
export function resolveNode(
  node: ExerciseNode,
  progress: ProgressMap,
  nodes: NodeLookup,
): NodeStatus {
  const unmet = node.prerequisites.filter((prereq) => !isPrerequisiteMet(prereq, progress, nodes));
  const unmetHard = unmet.filter((prereq) => prereq.kind === 'hard');
  const warnings = unmet.filter((prereq) => prereq.kind === 'recommended');
  const own = progress[node.id];
  const selfUnlocked = own?.selfUnlockedAt !== undefined;
  let state: NodeState;
  if (own?.trialPassed) state = own.level >= MAX_NODE_LEVEL ? 'mastered' : 'proficient';
  else if (unmetHard.length > 0 && !selfUnlocked) state = 'locked';
  else if (own?.firstTrainedAt !== undefined) state = 'training';
  else state = 'available';
  return { state, unmetHard, selfUnlocked, warnings };
}

/** States of every node, keyed by id. */
export function resolveTree(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
): Map<string, NodeStatus> {
  const lookup: NodeLookup = new Map(nodes.map((node) => [node.id, node]));
  return new Map(nodes.map((node) => [node.id, resolveNode(node, progress, lookup)]));
}

/** Ids of nodes that were locked in `before` and are not in `after` (the "Unlocked!" list). */
export function newlyUnlocked(
  before: ReadonlyMap<string, NodeStatus>,
  after: ReadonlyMap<string, NodeStatus>,
): string[] {
  const ids: string[] = [];
  for (const [id, status] of after) {
    if (before.get(id)?.state === 'locked' && status.state !== 'locked') ids.push(id);
  }
  return ids;
}

/**
 * Advisory warnings for using `node` (ADR-023): training it while it is locked, and, when `trialAt`
 * is given, a Trial attempt or test-out at that time (ADR-010 straight-arm clock). Never a block.
 * The engine uses it for logged sets; the UI calls it before an attempt to show what to acknowledge.
 */
export function nodeUseWarnings(
  node: ExerciseNode,
  status: NodeStatus,
  progress: NodeProgress | undefined,
  nodes: NodeLookup,
  trialAt?: number,
): SafeguardWarning[] {
  const warnings: SafeguardWarning[] = [];
  const prerequisites =
    status.state === 'locked' ? prerequisitesWarning(node, status.unmetHard, nodes) : undefined;
  if (prerequisites) warnings.push(prerequisites);
  if (trialAt !== undefined && !progress?.trialPassed) {
    warnings.push(...trialWarnings(node, progress, trialAt));
  }
  return warnings;
}
