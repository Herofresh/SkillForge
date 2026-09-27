/**
 * Rebuilds all derived progress from the logged history (PLAN 2.6, ADR-008).
 *
 * `applySession` is the one reducer step: it takes the engine state before a session and returns the
 * state after it plus a summary for the UI (XP, level-ups, Trials, unlocks). Logging a new session
 * applies it once (incremental); a rebuild after a formula change or an import folds it over the
 * whole chronological history (`recompute`). Both paths run the same code, so they cannot disagree.
 */
import type { NodeLookup } from './safeguards';
import {
  addNodeXp,
  emptyProgress,
  evaluateTrial,
  newlyUnlocked,
  passTrial,
  resolveTree,
  trialBlockReason,
  type TrialBlockReason,
} from './progression';
import type { ExerciseNode, LoggedSession, LoggedSet, NodeProgress, Outcome } from './types';
import { exerciseXp, isSessionComplete, nextStreak, sessionXp, type SessionXp } from './xp';

export interface EngineState {
  /** Progress per node id (the `node_progress` cache). */
  progress: Readonly<Record<string, NodeProgress>>;
  /** Character XP: all exercise XP plus session bonuses. */
  totalXp: number;
  streak: number;
  lastSessionAt?: number;
  /** Start of the latest session with straight-arm work (for the 48 h rule, ADR-010). */
  lastStraightArmSessionAt?: number;
}

export const INITIAL_ENGINE_STATE: EngineState = { progress: {}, totalXp: 0, streak: 0 };

export interface ExerciseResult {
  nodeId: string;
  outcome: Outcome;
  units: number;
  xp: number;
  trialAttempted: boolean;
  trialPassed: boolean;
  /** Why a Trial attempt did not count, if it was blocked. */
  trialBlocked?: TrialBlockReason;
}

export interface SessionResult {
  sessionId: string;
  exercises: ExerciseResult[];
  xp: SessionXp;
  streak: number;
  levelUps: { nodeId: string; from: number; to: number }[];
  /** Nodes that were locked before the session and are not after it. */
  unlocked: string[];
}

/** Replay order: by start time, ties broken by session id, so the order never depends on input. */
export function compareSessions(a: LoggedSession, b: LoggedSession): number {
  if (a.startedAt !== b.startedAt) return a.startedAt - b.startedAt;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Whether `session` can be applied on top of `state`. A session older than the last applied one
 * (e.g. from an import) changes the past, so the caller must run `recompute` instead.
 */
export function canApplyIncrementally(state: EngineState, session: LoggedSession): boolean {
  return state.lastSessionAt === undefined || session.startedAt >= state.lastSessionAt;
}

/** Sets of known nodes grouped per node, in set order; groups ordered by their first set. */
function groupSets(sets: readonly LoggedSet[], lookup: NodeLookup): Map<string, LoggedSet[]> {
  const ordered = [...sets].sort((a, b) => a.setIndex - b.setIndex || a.timestamp - b.timestamp);
  const groups = new Map<string, LoggedSet[]>();
  for (const set of ordered) {
    if (!lookup.has(set.nodeId)) continue; // hidden or removed node: its sets no longer count
    const group = groups.get(set.nodeId);
    if (group) group.push(set);
    else groups.set(set.nodeId, [set]);
  }
  return groups;
}

function applySessionWith(
  state: EngineState,
  session: LoggedSession,
  nodes: readonly ExerciseNode[],
  lookup: NodeLookup,
): { state: EngineState; result: SessionResult } {
  const statusBefore = resolveTree(nodes, state.progress);
  const progress: Record<string, NodeProgress> = { ...state.progress };
  const exercises: ExerciseResult[] = [];
  const levelUps: SessionResult['levelUps'] = [];
  const groups = groupSets(session.sets, lookup);

  for (const [nodeId, sets] of groups) {
    const node = lookup.get(nodeId) as ExerciseNode; // groupSets keeps known nodes only
    const before = state.progress[nodeId];
    const earned = exerciseXp(sets, node.ogLevel);
    let next = addNodeXp(before ?? emptyProgress(nodeId), node, earned.xp, sets[0].timestamp);

    const trialSets = sets.filter((set) => set.isTrial);
    let trialBlocked: TrialBlockReason | undefined;
    let trialPassed = false;
    if (trialSets.length > 0) {
      const trialAt = Math.max(...trialSets.map((set) => set.timestamp));
      const status = statusBefore.get(nodeId);
      trialBlocked = status ? trialBlockReason(node, status, before, trialAt) : 'locked';
      if (trialBlocked === undefined && evaluateTrial(node, trialSets)) {
        next = passTrial(next, node, trialAt);
        trialPassed = true;
      }
    }

    progress[nodeId] = next;
    const from = before?.level ?? emptyProgress(nodeId).level;
    if (next.level > from) levelUps.push({ nodeId, from, to: next.level });
    exercises.push({
      nodeId,
      outcome: earned.outcome,
      units: earned.units,
      xp: earned.xp,
      trialAttempted: trialSets.length > 0,
      trialPassed,
      ...(trialBlocked ? { trialBlocked } : {}),
    });
  }

  const knownSets = [...groups.values()].flat();
  const streak = nextStreak(state.streak, state.lastSessionAt, session.startedAt);
  const xp = sessionXp(
    exercises.map((exercise) => exercise.xp),
    isSessionComplete(knownSets),
    streak,
  );
  const hasStraightArm = knownSets.some((set) => lookup.get(set.nodeId)?.straightArm);

  const lastStraightArmSessionAt = hasStraightArm
    ? session.startedAt
    : state.lastStraightArmSessionAt;

  const nextState: EngineState = {
    progress,
    totalXp: state.totalXp + xp.total,
    streak,
    lastSessionAt: session.startedAt,
    ...(lastStraightArmSessionAt !== undefined ? { lastStraightArmSessionAt } : {}),
  };
  const unlocked = newlyUnlocked(statusBefore, resolveTree(nodes, progress));
  return {
    state: nextState,
    result: { sessionId: session.id, exercises, xp, streak, levelUps, unlocked },
  };
}

/** Applies one logged session to `state` (the incremental path). */
export function applySession(
  state: EngineState,
  session: LoggedSession,
  nodes: readonly ExerciseNode[],
): { state: EngineState; result: SessionResult } {
  return applySessionWith(state, session, nodes, new Map(nodes.map((node) => [node.id, node])));
}

/**
 * Rebuilds the engine state from the full history: sessions are sorted chronologically and folded
 * through the same step as `applySession`. Deterministic for the same nodes and history.
 */
export function recompute(
  nodes: readonly ExerciseNode[],
  sessions: readonly LoggedSession[],
): { state: EngineState; results: SessionResult[] } {
  const lookup: NodeLookup = new Map(nodes.map((node) => [node.id, node]));
  let state = INITIAL_ENGINE_STATE;
  const results: SessionResult[] = [];
  for (const session of [...sessions].sort(compareSessions)) {
    const step = applySessionWith(state, session, nodes, lookup);
    state = step.state;
    results.push(step.result);
  }
  return { state, results };
}
