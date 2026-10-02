/**
 * The optional onboarding assessment (PLAN 4.1, ADR-023, ADR-031): "I can already do this". The user
 * logs a Trial result for any node; a passed Trial is a test-out (proficient at once), including
 * straight-arm and locked nodes. The safeguards are advisory: `testOutWarnings` lists what to show
 * and acknowledge first, nothing here blocks.
 */
import { compareCodeUnits } from '@/lib/compare';

import { PROGRESSION_STEP } from './generator';
import { nodeUseWarnings, resolveNode, type ProgressMap } from './progression';
import type { SessionResult } from './recompute';
import { sessionSafeguardWarnings } from './safeguards';
import type {
  ExerciseNode,
  LoggedSession,
  LoggedSet,
  NodeLookup,
  SafeguardWarning,
  SetPerformance,
} from './types';

/** How many path nodes the assessment suggests testing ("a handful"). */
export const MAX_ASSESSMENT_ANCHORS = 6;
/** How many search results the assessment shows at most. */
export const MAX_SEARCH_RESULTS = 8;

const lookupOf = (nodes: readonly ExerciseNode[]): NodeLookup =>
  new Map(nodes.map((node) => [node.id, node]));

/** Easiest first: ogLevel, then branch column position, then id (stable across runs). */
function byDifficulty(a: ExerciseNode, b: ExerciseNode): number {
  return a.ogLevel - b.ogLevel || a.chainOrder - b.chainOrder || compareCodeUnits(a.id, b.id);
}

/** The goals and every node they need through hard prerequisites (transitively). */
export function goalPathNodes(
  nodes: readonly ExerciseNode[],
  goals: readonly string[],
): ExerciseNode[] {
  const lookup = lookupOf(nodes);
  const seen = new Set<string>();
  const stack = goals.filter((id) => lookup.has(id));
  while (stack.length > 0) {
    const id = stack.pop() as string;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const prereq of lookup.get(id)?.prerequisites ?? []) {
      if (prereq.kind === 'hard' && lookup.has(prereq.nodeId)) stack.push(prereq.nodeId);
    }
  }
  return nodes.filter((node) => seen.has(node.id)).sort(byDifficulty);
}

/**
 * A handful of anchor nodes on the goal paths, spread evenly from the easiest to the hardest (which
 * includes the easiest path node and the hardest goal). Depends only on the tree and the goals, so
 * the list stays put while the user tests nodes out.
 */
export function assessmentAnchors(
  nodes: readonly ExerciseNode[],
  goals: readonly string[],
  count: number = MAX_ASSESSMENT_ANCHORS,
): ExerciseNode[] {
  const path = goalPathNodes(nodes, goals);
  if (path.length <= count) return path;
  if (count <= 0) return [];
  if (count === 1) return [path[path.length - 1]];
  const picked = new Set<number>();
  for (let i = 0; i < count; i++) picked.add(Math.round((i * (path.length - 1)) / (count - 1)));
  return [...picked].sort((a, b) => a - b).map((index) => path[index]);
}

/**
 * Nodes whose name or id contains `query` (case-insensitive), names starting with it first, then
 * easiest first. An empty query finds nothing.
 */
export function searchNodes(
  nodes: readonly ExerciseNode[],
  query: string,
  limit: number = MAX_SEARCH_RESULTS,
): ExerciseNode[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return [];
  const matches = nodes.filter(
    (node) => node.name.toLowerCase().includes(needle) || node.id.includes(needle),
  );
  const starts = (node: ExerciseNode) => (node.name.toLowerCase().startsWith(needle) ? 0 : 1);
  return matches.sort((a, b) => starts(a) - starts(b) || byDifficulty(a, b)).slice(0, limit);
}

/** The Trial standard as one result per set: what the result form starts with. */
export function defaultTrialResults(node: ExerciseNode): SetPerformance[] {
  const { sets, target, reps } = node.trial;
  return Array.from({ length: sets }, () =>
    reps !== undefined ? { value: target, reps } : { value: target },
  );
}

/**
 * Changes one set result by `steps` steps of the node's metric (`PROGRESSION_STEP`), never below 0.
 * Load values are rounded to the step to avoid floating-point noise.
 */
export function stepTrialResult(
  node: ExerciseNode,
  result: SetPerformance,
  steps: number,
): SetPerformance {
  const step = PROGRESSION_STEP[node.metric];
  const raw = Math.max(0, result.value + steps * step);
  const value = Math.round(raw / step) * step;
  return { ...result, value: Number(value.toFixed(2)) };
}

/** A Trial attempt as a session to log: one `isTrial` set per result, prescribed = the standard. */
export function trialSession(
  node: ExerciseNode,
  results: readonly SetPerformance[],
  sessionId: string,
  at: number,
  /** Per set, the seconds the exercise timer measured (PLAN 5.4); unset for untimed sets. */
  durations: readonly (number | undefined)[] = [],
): LoggedSession {
  const { target, reps } = node.trial;
  const prescribed: SetPerformance =
    reps !== undefined ? { value: target, reps } : { value: target };
  const sets: LoggedSet[] = results.map((actual, setIndex) => ({
    sessionId,
    nodeId: node.id,
    setIndex,
    metric: node.metric,
    prescribed,
    actual,
    isTrial: true,
    timestamp: at + setIndex,
    ...(durations[setIndex] !== undefined ? { durationSec: durations[setIndex] } : {}),
  }));
  return { id: sessionId, startedAt: at, sets };
}

/**
 * Everything to show (and acknowledge) before logging a Trial on `node` at `at` (ADR-023): unmet
 * prerequisites of a locked node, the straight-arm Trial clock, and the session-wide straight-arm
 * rules (48 h rest; the Trial itself is exempt from the budget, ADR-025). Advisory only.
 */
export function testOutWarnings(
  node: ExerciseNode,
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
  lastStraightArmSessionAt: number | undefined,
  at: number,
): SafeguardWarning[] {
  const lookup = lookupOf(nodes);
  const status = resolveNode(node, progress, lookup);
  const attempt = trialSession(node, defaultTrialResults(node), 'preview', at);
  return [
    ...nodeUseWarnings(node, status, progress[node.id], lookup, at),
    ...sessionSafeguardWarnings(attempt.sets, lookup, lastStraightArmSessionAt, at),
  ];
}

/**
 * The nodes a Trial on `nodeId` opened, without the node itself (a locked node that was tested out
 * is "unlocked" too, but the screen already celebrates it).
 */
export function unlockedByTrial(result: Pick<SessionResult, 'unlocked'>, nodeId: string): string[] {
  return result.unlocked.filter((id) => id !== nodeId);
}
