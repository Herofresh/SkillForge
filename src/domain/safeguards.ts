/**
 * Tendon safeguards for straight-arm nodes (PLAN 2.3, ADR-010). Connective tissue adapts far slower
 * than muscle, so these rules slow straight-arm progress down on purpose. AGENT.md §5: never remove
 * them to make progress faster.
 *
 * Pure checks for the progression engine, the generator and the UI:
 * - a straight-arm node's Trial opens only after `MIN_WEEKS_AT_LEVEL` weeks of training on it;
 * - a session holds at most `STRAIGHT_ARM_SESSION_BUDGET_S` seconds of straight-arm work;
 * - straight-arm sessions are at least `STRAIGHT_ARM_REST_HOURS` apart.
 */
import { MS_PER_HOUR, MS_PER_WEEK } from '@/lib/time';

import type { ExerciseNode, LoggedSession, LoggedSet, NodeProgress } from './types';
import { HOLD_SECONDS_PER_UNIT, setUnits } from './xp';

/** Weeks between the first logged set on a straight-arm node and the opening of its Trial. */
export const MIN_WEEKS_AT_LEVEL = 6;
/** Straight-arm work per session, in hold seconds (non-hold sets count 2 s per unit). */
export const STRAIGHT_ARM_SESSION_BUDGET_S = 60;
/** Minimum rest between two sessions that contain straight-arm work. */
export const STRAIGHT_ARM_REST_HOURS = 48;

export type NodeLookup = ReadonlyMap<string, ExerciseNode>;

/**
 * When the node's Trial opens: `undefined` (no gate) for a bent-arm node, `Infinity` for a
 * straight-arm node that was never trained, else the first training time + `MIN_WEEKS_AT_LEVEL`.
 */
export function trialOpensAt(
  node: ExerciseNode,
  progress: Pick<NodeProgress, 'firstTrainedAt'> | undefined,
): number | undefined {
  if (!node.straightArm) return undefined;
  const first = progress?.firstTrainedAt;
  return first === undefined ? Infinity : first + MIN_WEEKS_AT_LEVEL * MS_PER_WEEK;
}

/** Whether the safeguards allow a Trial attempt on `node` at time `now`. */
export function isTrialOpenBySafeguards(
  node: ExerciseNode,
  progress: Pick<NodeProgress, 'firstTrainedAt'> | undefined,
  now: number,
): boolean {
  const opensAt = trialOpensAt(node, progress);
  return opensAt === undefined || now >= opensAt;
}

/** Straight-arm load of one set in hold seconds; 0 for sets of bent-arm or unknown nodes. */
export function straightArmSeconds(set: LoggedSet, nodes: NodeLookup): number {
  if (!nodes.get(set.nodeId)?.straightArm) return 0;
  return setUnits(set.metric, set.actual) * HOLD_SECONDS_PER_UNIT;
}

export function straightArmSecondsUsed(sets: readonly LoggedSet[], nodes: NodeLookup): number {
  return sets.reduce((sum, set) => sum + straightArmSeconds(set, nodes), 0);
}

/** Straight-arm hold seconds still allowed in a session that already contains `sets`. */
export function remainingStraightArmBudget(sets: readonly LoggedSet[], nodes: NodeLookup): number {
  return Math.max(0, STRAIGHT_ARM_SESSION_BUDGET_S - straightArmSecondsUsed(sets, nodes));
}

/** Start time of the latest session that contains any straight-arm set, if any. */
export function lastStraightArmSessionAt(
  sessions: readonly LoggedSession[],
  nodes: NodeLookup,
): number | undefined {
  let latest: number | undefined;
  for (const session of sessions) {
    if (!session.sets.some((set) => nodes.get(set.nodeId)?.straightArm)) continue;
    if (latest === undefined || session.startedAt > latest) latest = session.startedAt;
  }
  return latest;
}

/** Whether straight-arm work may be scheduled at `now` given the last straight-arm session. */
export function isStraightArmRested(lastSessionAt: number | undefined, now: number): boolean {
  return (
    lastSessionAt === undefined || now - lastSessionAt >= STRAIGHT_ARM_REST_HOURS * MS_PER_HOUR
  );
}
