/**
 * What the Tree tab (PLAN 4.2) and the node detail (PLAN 4.3) show, derived from the user's tree and
 * progress. Pure: screens call these and only render the result.
 *
 * - A branch is a column of tiles in `chainOrder` (`nodesInBranch`). When a node needs the node right
 *   above it (a hard prerequisite in the same branch), the column draws a chain between the two;
 *   every other hard prerequisite (another branch, or further up the column) is a linked chip.
 * - A locked legendary node is shown as a silhouette (`legendary` tile state).
 * - Prerequisites list the alternatives that also satisfy them (ADR-019) and which node met them.
 */
import { compareCodeUnits } from '@/lib/compare';

import { nodesInBranch } from './branch';
import { nodeAttributes } from './character';
import {
  nodeLevelProgress,
  prerequisiteSatisfiedBy,
  resolveNode,
  type NodeLevelProgress,
  type NodeStatus,
  type ProgressMap,
} from './progression';
import {
  BRANCHES,
  type Attribute,
  type Branch,
  type ExerciseNode,
  type LoggedSession,
  type LoggedSet,
  type NodeLookup,
  type NodeState,
  type Prerequisite,
} from './types';

/** A node state as a tile shows it: the engine states plus the legendary silhouette. */
export const TILE_STATES = [
  'legendary',
  'locked',
  'available',
  'training',
  'proficient',
  'mastered',
] as const;
export type TileState = (typeof TILE_STATES)[number];

/** How many past sessions the node detail lists. */
export const NODE_HISTORY_LIMIT = 5;

const lookupOf = (nodes: readonly ExerciseNode[]): NodeLookup =>
  new Map(nodes.map((node) => [node.id, node]));

/** The tile state: a locked legendary node is a silhouette, everything else its engine state. */
export function tileState(node: Pick<ExerciseNode, 'legendary'>, state: NodeState): TileState {
  return node.legendary && state === 'locked' ? 'legendary' : state;
}

export interface NodeRef {
  id: string;
  name: string;
  branch: Branch;
}

const refOf = (node: ExerciseNode): NodeRef => ({
  id: node.id,
  name: node.name,
  branch: node.branch,
});

export interface PrerequisiteView {
  prerequisite: Prerequisite;
  /** The prerequisite node (its id and branch; the name falls back to the id if it is missing). */
  node: NodeRef;
  met: boolean;
  /** The node that meets it: the prerequisite itself or one of its alternatives. */
  satisfiedBy?: NodeRef;
  /** Nodes that satisfy the prerequisite as well (the prerequisite node's `alternatives`). */
  alternatives: NodeRef[];
  /** The prerequisite node sits in another branch than the node that needs it. */
  crossBranch: boolean;
}

/** Every prerequisite of `node` with its state, hard ones first (then in authored order). */
export function prerequisiteViews(
  node: ExerciseNode,
  progress: ProgressMap,
  lookup: NodeLookup,
): PrerequisiteView[] {
  const views = node.prerequisites.map((prerequisite): PrerequisiteView => {
    const target = lookup.get(prerequisite.nodeId);
    const satisfiedId = prerequisiteSatisfiedBy(prerequisite, progress, lookup);
    const satisfier = satisfiedId !== undefined ? lookup.get(satisfiedId) : undefined;
    return {
      prerequisite,
      node: target
        ? refOf(target)
        : { id: prerequisite.nodeId, name: prerequisite.nodeId, branch: node.branch },
      met: satisfiedId !== undefined,
      ...(satisfier ? { satisfiedBy: refOf(satisfier) } : {}),
      alternatives: (target?.alternatives ?? [])
        .map((id) => lookup.get(id))
        .filter((entry): entry is ExerciseNode => entry !== undefined)
        .map(refOf),
      crossBranch: target !== undefined && target.branch !== node.branch,
    };
  });
  const rank = (view: PrerequisiteView) => (view.prerequisite.kind === 'hard' ? 0 : 1);
  return views
    .map((view, index) => ({ view, index }))
    .sort((a, b) => rank(a.view) - rank(b.view) || a.index - b.index)
    .map(({ view }) => view);
}

export interface TreeTile {
  node: ExerciseNode;
  status: NodeStatus;
  state: TileState;
  level: NodeLevelProgress;
  isGoal: boolean;
  /** The node needs the tile right above it (a hard prerequisite): the column draws a chain. */
  chainAbove?: { met: boolean };
  /** The other hard prerequisites (other branches, or further up the column): linked chips. */
  links: PrerequisiteView[];
}

/** One tile for a node (also used by the node detail header). */
export function treeTile(
  node: ExerciseNode,
  progress: ProgressMap,
  lookup: NodeLookup,
  goals: readonly string[],
  above?: ExerciseNode,
): TreeTile {
  const status = resolveNode(node, progress, lookup);
  const hard = prerequisiteViews(node, progress, lookup).filter(
    (view) => view.prerequisite.kind === 'hard',
  );
  const chain = above ? hard.find((view) => view.node.id === above.id) : undefined;
  return {
    node,
    status,
    state: tileState(node, status.state),
    level: nodeLevelProgress(node, progress[node.id]),
    isGoal: goals.includes(node.id),
    ...(chain ? { chainAbove: { met: chain.met } } : {}),
    links: hard.filter((view) => view !== chain),
  };
}

/** The column of one branch: its nodes in `chainOrder` as tiles. */
export function branchColumn(
  nodes: readonly ExerciseNode[],
  branch: Branch,
  progress: ProgressMap,
  goals: readonly string[],
): TreeTile[] {
  const lookup = lookupOf(nodes);
  const column = nodesInBranch(nodes, branch);
  return column.map((node, index) =>
    treeTile(node, progress, lookup, goals, index > 0 ? column[index - 1] : undefined),
  );
}

export interface BranchSummary {
  total: number;
  /** Not locked (available, training, proficient or mastered). */
  open: number;
  /** Proficient or mastered. */
  proficient: number;
  goals: number;
}

export function branchSummary(tiles: readonly TreeTile[]): BranchSummary {
  const count = (keep: (tile: TreeTile) => boolean) => tiles.filter(keep).length;
  return {
    total: tiles.length,
    open: count((tile) => tile.state !== 'locked' && tile.state !== 'legendary'),
    proficient: count((tile) => tile.state === 'proficient' || tile.state === 'mastered'),
    goals: count((tile) => tile.isGoal),
  };
}

/** The branch the Tree tab opens on: the first goal's branch, else the first branch. */
export function defaultBranch(nodes: readonly ExerciseNode[], goals: readonly string[]): Branch {
  const lookup = lookupOf(nodes);
  for (const id of goals) {
    const node = lookup.get(id);
    if (node) return node.branch;
  }
  return BRANCHES[0];
}

/** The sets of one node in one past session. */
export interface NodeSessionLog {
  sessionId: string;
  at: number;
  /** Some of the sets were a Trial attempt. */
  isTrial: boolean;
  sets: LoggedSet[];
}

/** The node's most recent sessions (newest first, at most `limit`), with its sets in order. */
export function nodeHistory(
  sessions: readonly LoggedSession[],
  nodeId: string,
  limit: number = NODE_HISTORY_LIMIT,
): NodeSessionLog[] {
  return sessions
    .map((session): NodeSessionLog | undefined => {
      const sets = session.sets
        .filter((set) => set.nodeId === nodeId)
        .sort((a, b) => a.setIndex - b.setIndex);
      if (sets.length === 0) return undefined;
      return {
        sessionId: session.id,
        at: session.startedAt,
        isTrial: sets.some((set) => set.isTrial),
        sets,
      };
    })
    .filter((entry): entry is NodeSessionLog => entry !== undefined)
    .sort((a, b) => b.at - a.at || compareCodeUnits(b.sessionId, a.sessionId))
    .slice(0, limit);
}

/** Everything the node detail shows about one node (PLAN 4.3). */
export interface NodeDetail {
  tile: TreeTile;
  /** All prerequisites (hard first), with alternatives. */
  prerequisites: PrerequisiteView[];
  /** What the node trains (`nodeAttributes`). */
  attributes: Attribute[];
  history: NodeSessionLog[];
}

/** The node detail for `nodeId`, or `undefined` when the tree has no such node. */
export function nodeDetail(
  nodes: readonly ExerciseNode[],
  nodeId: string,
  progress: ProgressMap,
  goals: readonly string[],
  sessions: readonly LoggedSession[],
): NodeDetail | undefined {
  const lookup = lookupOf(nodes);
  const node = lookup.get(nodeId);
  if (!node) return undefined;
  return {
    tile: treeTile(node, progress, lookup, goals),
    prerequisites: prerequisiteViews(node, progress, lookup),
    attributes: nodeAttributes(node),
    history: nodeHistory(sessions, nodeId),
  };
}
