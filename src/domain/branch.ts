/** Branch columns of the tree (onboarding goal picker, later the tree tab 4.2). Pure. */
import type { Branch, ExerciseNode } from './types';

/** The nodes of one branch in column order (`chainOrder`, then id). */
export function nodesInBranch(nodes: readonly ExerciseNode[], branch: Branch): ExerciseNode[] {
  return nodes
    .filter((node) => node.branch === branch)
    .sort((a, b) => a.chainOrder - b.chainOrder || a.id.localeCompare(b.id));
}
