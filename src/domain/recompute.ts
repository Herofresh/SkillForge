/**
 * Rebuilds all derived progress from the logged history (PLAN 2.6, ADR-008, ADR-021, ADR-023).
 *
 * History has two kinds of entries: logged sessions and user actions (`self_unlock`). Each has one
 * reducer step: `applySession` and `applyUserAction` take the engine state before the entry and
 * return the state after it plus a summary for the UI (XP, level-ups, Trials, unlocks, advisory
 * warnings). Logging an entry applies it once (incremental); a rebuild after a formula change or an
 * import folds the steps over the whole chronological history (`recompute`). Both paths run the same
 * code, so they cannot disagree.
 *
 * Nothing is blocked (ADR-023): Trials count on every node, safeguard violations and unmet
 * prerequisites only produce `SafeguardWarning`s.
 */
import {
  addNodeXp,
  emptyProgress,
  evaluateTrial,
  newlyUnlocked,
  nodeUseWarnings,
  passTrial,
  resolveTree,
  selfUnlock,
} from './progression';
import { prerequisitesWarning, sessionSafeguardWarnings } from './safeguards';
import type {
  ExerciseNode,
  LoggedSession,
  LoggedSet,
  NodeLookup,
  NodeProgress,
  Outcome,
  SafeguardWarning,
  UserAction,
  UserActionKind,
} from './types';
import { exerciseXp, isSessionComplete, nextStreak, sessionXp, type SessionXp } from './xp';

/** One entry of the logged history. */
export type HistoryEntry = LoggedSession | UserAction;

/** Where an entry sits in replay order: by time, then actions before sessions, then by id. */
export interface HistoryPosition {
  at: number;
  rank: number;
  id: string;
}

/** At the same time, a user action (e.g. unlocking a node) replays before a session that uses it. */
const ACTION_RANK = 0;
const SESSION_RANK = 1;

export interface EngineState {
  /** Progress per node id (the `node_progress` cache). */
  progress: Readonly<Record<string, NodeProgress>>;
  /** Character XP: all exercise XP plus session bonuses. */
  totalXp: number;
  streak: number;
  lastSessionAt?: number;
  /** Start of the latest session with straight-arm work (for the 48 h rule, ADR-010). */
  lastStraightArmSessionAt?: number;
  /** Replay position of the last applied entry (for `canApplyIncrementally`). */
  lastApplied?: HistoryPosition;
}

export const INITIAL_ENGINE_STATE: EngineState = { progress: {}, totalXp: 0, streak: 0 };

export interface ExerciseResult {
  nodeId: string;
  outcome: Outcome;
  units: number;
  xp: number;
  trialAttempted: boolean;
  trialPassed: boolean;
}

export interface SessionResult {
  sessionId: string;
  exercises: ExerciseResult[];
  xp: SessionXp;
  streak: number;
  levelUps: { nodeId: string; from: number; to: number }[];
  /** Nodes that were locked before the session and are not after it. */
  unlocked: string[];
  /** Advisory warnings (safeguards, unmet prerequisites) for the summary; never blocking. */
  warnings: SafeguardWarning[];
}

export interface UserActionResult {
  actionId: string;
  kind: UserActionKind;
  nodeId: string;
  /** Nodes that were locked before the action and are not after it. */
  unlocked: string[];
  warnings: SafeguardWarning[];
}

function isUserAction(entry: HistoryEntry): entry is UserAction {
  return 'kind' in entry;
}

export function historyPosition(entry: HistoryEntry): HistoryPosition {
  return isUserAction(entry)
    ? { at: entry.at, rank: ACTION_RANK, id: entry.id }
    : { at: entry.startedAt, rank: SESSION_RANK, id: entry.id };
}

function comparePositions(a: HistoryPosition, b: HistoryPosition): number {
  if (a.at !== b.at) return a.at - b.at;
  if (a.rank !== b.rank) return a.rank - b.rank;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Replay order, so the result never depends on the input order. */
export function compareHistory(a: HistoryEntry, b: HistoryEntry): number {
  return comparePositions(historyPosition(a), historyPosition(b));
}

/**
 * Whether `entry` can be applied on top of `state`. An entry that replays before the last applied
 * one (e.g. from an import) changes the past, so the caller must run `recompute` instead.
 */
export function canApplyIncrementally(state: EngineState, entry: HistoryEntry): boolean {
  return (
    state.lastApplied === undefined ||
    comparePositions(historyPosition(entry), state.lastApplied) > 0
  );
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
  const warnings: SafeguardWarning[] = [];
  const groups = groupSets(session.sets, lookup);

  for (const [nodeId, sets] of groups) {
    const node = lookup.get(nodeId) as ExerciseNode; // groupSets keeps known nodes only
    const before = state.progress[nodeId];
    const earned = exerciseXp(sets, node.ogLevel);
    let next = addNodeXp(before ?? emptyProgress(nodeId), node, earned.xp, sets[0].timestamp);

    const trialSets = sets.filter((set) => set.isTrial);
    const trialAt =
      trialSets.length > 0 ? Math.max(...trialSets.map((set) => set.timestamp)) : undefined;
    const status = statusBefore.get(nodeId);
    if (status) warnings.push(...nodeUseWarnings(node, status, before, lookup, trialAt));

    let trialPassed = false;
    if (trialAt !== undefined && !before?.trialPassed && evaluateTrial(node, trialSets)) {
      next = passTrial(next, node, trialAt);
      trialPassed = true;
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
    });
  }

  const knownSets = [...groups.values()].flat();
  warnings.push(
    ...sessionSafeguardWarnings(
      knownSets,
      lookup,
      state.lastStraightArmSessionAt,
      session.startedAt,
    ),
  );
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
    lastApplied: historyPosition(session),
  };
  const unlocked = newlyUnlocked(statusBefore, resolveTree(nodes, progress));
  return {
    state: nextState,
    result: { sessionId: session.id, exercises, xp, streak, levelUps, unlocked, warnings },
  };
}

function applyUserActionWith(
  state: EngineState,
  action: UserAction,
  nodes: readonly ExerciseNode[],
  lookup: NodeLookup,
): { state: EngineState; result: UserActionResult } {
  const base = { actionId: action.id, kind: action.kind, nodeId: action.nodeId };
  const lastApplied = historyPosition(action);
  const node = lookup.get(action.nodeId);
  if (!node) {
    // Hidden or removed node: the action no longer does anything.
    return { state: { ...state, lastApplied }, result: { ...base, unlocked: [], warnings: [] } };
  }
  const statusBefore = resolveTree(nodes, state.progress);
  const before = state.progress[node.id] ?? emptyProgress(node.id);
  const progress = { ...state.progress, [node.id]: selfUnlock(before, action.at) };
  const warning = prerequisitesWarning(node, statusBefore.get(node.id)?.unmetHard ?? [], lookup);
  return {
    state: { ...state, progress, lastApplied },
    result: {
      ...base,
      unlocked: newlyUnlocked(statusBefore, resolveTree(nodes, progress)),
      warnings: warning ? [warning] : [],
    },
  };
}

const lookupOf = (nodes: readonly ExerciseNode[]): NodeLookup =>
  new Map(nodes.map((node) => [node.id, node]));

/** Applies one logged session to `state` (the incremental path). */
export function applySession(
  state: EngineState,
  session: LoggedSession,
  nodes: readonly ExerciseNode[],
): { state: EngineState; result: SessionResult } {
  return applySessionWith(state, session, nodes, lookupOf(nodes));
}

/** Applies one user action (e.g. `self_unlock`) to `state` (the incremental path). */
export function applyUserAction(
  state: EngineState,
  action: UserAction,
  nodes: readonly ExerciseNode[],
): { state: EngineState; result: UserActionResult } {
  return applyUserActionWith(state, action, nodes, lookupOf(nodes));
}

/**
 * Rebuilds the engine state from the full history: sessions and user actions are sorted into replay
 * order (`compareHistory`) and folded through the same steps as `applySession` / `applyUserAction`.
 * Deterministic for the same nodes and history. `results` holds one entry per session and
 * `actionResults` one per action, each in replay order.
 */
export function recompute(
  nodes: readonly ExerciseNode[],
  sessions: readonly LoggedSession[],
  actions: readonly UserAction[] = [],
): { state: EngineState; results: SessionResult[]; actionResults: UserActionResult[] } {
  const lookup = lookupOf(nodes);
  let state = INITIAL_ENGINE_STATE;
  const results: SessionResult[] = [];
  const actionResults: UserActionResult[] = [];
  const history: HistoryEntry[] = [...sessions, ...actions].sort(compareHistory);
  for (const entry of history) {
    if (isUserAction(entry)) {
      const step = applyUserActionWith(state, entry, nodes, lookup);
      state = step.state;
      actionResults.push(step.result);
    } else {
      const step = applySessionWith(state, entry, nodes, lookup);
      state = step.state;
      results.push(step.result);
    }
  }
  return { state, results, actionResults };
}
