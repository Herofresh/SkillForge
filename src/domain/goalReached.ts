/**
 * A reached goal and what comes after it (PLAN 7.8 FB-9/10/11, ADR-077): which goals a session
 * reached, and the sensible next goals to offer in their place.
 */
import { compareCodeUnits } from '@/lib/compare';

import { byDifficulty } from './assessment';
import { resolveNode, type ProgressMap } from './progression';
import type { SessionResult } from './recompute';
import type { ExerciseNode, NodeLookup } from './types';

/**
 * The goals `result` reached: a goal is reached when its Trial is passed (a passed Trial also makes
 * every hard prerequisite proficient, ADR-075, so the whole path is done). Counts Trials passed in
 * the session and the ones it implied, in the goals' order.
 */
export function goalsReachedIn(
  result: Pick<SessionResult, 'exercises' | 'trialsImplied'>,
  goals: readonly string[],
): string[] {
  const passed = new Set([
    ...result.exercises.filter((exercise) => exercise.trialPassed).map((e) => e.nodeId),
    ...(result.trialsImplied ?? []),
  ]);
  return goals.filter((goalId) => passed.has(goalId));
}

/** One skill offered as the next goal after a reached one. */
export interface NextGoalOption {
  node: ExerciseNode;
  /** In the reached goal's branch (listed first). */
  sameBranch: boolean;
  /** Names of the other skills it still needs before it opens (empty: open to train now). */
  stillNeeds: string[];
}

/**
 * The next goals to offer after reaching `goalId` (FB-11): every skill that builds directly on it
 * (a hard prerequisite), not proficient yet and not already a goal. The reached goal's own branch
 * comes first, then the ones open to train now, then the easiest (`byDifficulty`). Empty at the end
 * of a path.
 */
export function nextGoalOptions(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
  goalId: string,
  goals: readonly string[] = [],
): NextGoalOption[] {
  const lookup: NodeLookup = new Map(nodes.map((node) => [node.id, node]));
  const goal = lookup.get(goalId);
  if (!goal) return [];
  const nameOf = (id: string) => lookup.get(id)?.name ?? id;
  return nodes
    .filter(
      (node) =>
        node.id !== goalId &&
        !goals.includes(node.id) &&
        node.prerequisites.some((prereq) => prereq.kind === 'hard' && prereq.nodeId === goalId),
    )
    .map((node) => {
      const status = resolveNode(node, progress, lookup);
      return {
        node,
        state: status.state,
        sameBranch: node.branch === goal.branch,
        stillNeeds: status.unmetHard
          .filter((prereq) => prereq.nodeId !== goalId)
          .map((prereq) => nameOf(prereq.nodeId)),
      };
    })
    .filter((option) => option.state !== 'proficient' && option.state !== 'mastered')
    .sort(
      (a, b) =>
        Number(b.sameBranch) - Number(a.sameBranch) ||
        Number(a.stillNeeds.length > 0) - Number(b.stillNeeds.length > 0) ||
        byDifficulty(a.node, b.node) ||
        compareCodeUnits(a.node.id, b.node.id),
    )
    .map(({ node, sameBranch, stillNeeds }) => ({ node, sameBranch, stillNeeds }));
}
