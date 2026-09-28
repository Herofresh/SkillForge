/**
 * The Tree tab's Map mode (PLAN 5.1, ADR-037): the whole tree as a "constellation" graph. Pure.
 *
 * - **Layout** (`mapLayout`) depends only on the node list, so screens compute it once per tree
 *   (memoized on `state.nodes`). It is a small layered DAG layout, drawn left to right like a
 *   tech tree: a node's **layer** (its column) is the longest chain of hard prerequisites leading
 *   to it, and each **branch** is a horizontal lane. Nodes of one branch in the same layer stack
 *   as rows inside the lane (in `chainOrder`), so the lane is as tall as its widest layer.
 * - **Edges** are the hard prerequisites (what the column view chains and links, ADR-033), routed
 *   as orthogonal elbows: out of the prerequisite's right side, down or up in the gap just before
 *   the target's layer, into the target's left side. Vertical runs live in the layer gaps, so they
 *   never cross a node. Edges into the same node spread out so they stay apart.
 * - **State** (`mapTiles`) reuses the column view's `treeTile`, so a map node and a column tile show
 *   the same state; an edge is lit when that prerequisite is met (by the node or an alternative).
 */
import { nodesInBranch } from './branch';
import type { ProgressMap } from './progression';
import { treeTile, type TreeTile } from './treeView';
import { BRANCHES, type Branch, type ExerciseNode, type NodeLookup } from './types';

/** The two Tree tab modes (remembered in the `tree_view_mode` setting). */
export const TREE_MODES = ['columns', 'map'] as const;
export type TreeMode = (typeof TREE_MODES)[number];
export const DEFAULT_TREE_MODE: TreeMode = 'columns';

/** A stored mode setting, or the default for anything else (unset, old or broken values). */
export function parseTreeMode(value: unknown): TreeMode {
  return TREE_MODES.find((mode) => mode === value) ?? DEFAULT_TREE_MODE;
}

/** Map geometry in dp (content coordinates, before zoom). */
export interface MapDims {
  nodeWidth: number;
  nodeHeight: number;
  /** Horizontal gap between two layers (the edges bend here). */
  layerGap: number;
  /** Vertical gap between two rows of one lane. */
  rowGap: number;
  /** Height of a lane's title strip above its first row. */
  laneHeader: number;
  /** Vertical gap between two lanes. */
  laneGap: number;
  /** Empty border around the whole map. */
  margin: number;
  /** Distance between edges that end in the same node. */
  edgeSpread: number;
}

export const MAP_DIMS: MapDims = {
  nodeWidth: 136,
  nodeHeight: 84,
  layerGap: 56,
  rowGap: 16,
  laneHeader: 32,
  laneGap: 24,
  margin: 24,
  edgeSpread: 8,
};

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapNodePlacement extends Rect {
  id: string;
  branch: Branch;
  layer: number;
  /** Row inside its lane (0 = top). */
  row: number;
}

export interface MapLane extends Rect {
  branch: Branch;
  /** Rows of nodes in the lane. */
  rows: number;
}

export interface MapEdge {
  /** `edgeKey(from, to)`. */
  key: string;
  /** The prerequisite. */
  from: string;
  /** The node that needs it. */
  to: string;
  /** The two nodes sit in different branches. */
  crossBranch: boolean;
  /** The elbow route from the prerequisite's right side to the target's left side. */
  points: Point[];
}

export interface MapLayout {
  width: number;
  height: number;
  layers: number;
  nodes: MapNodePlacement[];
  /** Placement by node id. */
  byId: ReadonlyMap<string, MapNodePlacement>;
  /** One lane per branch that has nodes, in `BRANCHES` order. */
  lanes: MapLane[];
  edges: MapEdge[];
}

export const edgeKey = (from: string, to: string): string => `${from}>${to}`;

const hardPrerequisiteIds = (node: ExerciseNode, lookup: NodeLookup): string[] => [
  ...new Set(
    node.prerequisites
      .filter((prerequisite) => prerequisite.kind === 'hard' && lookup.has(prerequisite.nodeId))
      .map((prerequisite) => prerequisite.nodeId),
  ),
];

/**
 * Each node's layer: 0 without hard prerequisites in the tree, else one more than its deepest hard
 * prerequisite. The validator rejects cycles; a cycle that got in anyway is cut where it closes.
 */
export function nodeLayers(nodes: readonly ExerciseNode[]): Map<string, number> {
  const lookup: NodeLookup = new Map(nodes.map((node) => [node.id, node]));
  const layers = new Map<string, number>();
  const visiting = new Set<string>();
  const layerOf = (id: string): number => {
    const known = layers.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return -1; // a cycle: ignore the edge that closes it
    visiting.add(id);
    const node = lookup.get(id) as ExerciseNode;
    const deepest = Math.max(-1, ...hardPrerequisiteIds(node, lookup).map(layerOf));
    visiting.delete(id);
    const layer = deepest + 1;
    layers.set(id, layer);
    return layer;
  };
  nodes.forEach((node) => layerOf(node.id));
  return layers;
}

/** The map layout of a tree (see the module comment). Depends only on `nodes`. */
export function mapLayout(nodes: readonly ExerciseNode[], dims: MapDims = MAP_DIMS): MapLayout {
  const lookup: NodeLookup = new Map(nodes.map((node) => [node.id, node]));
  const layers = nodeLayers(nodes);
  const layerCount = nodes.length === 0 ? 0 : Math.max(...layers.values()) + 1;
  const layerPitch = dims.nodeWidth + dims.layerGap;
  const rowPitch = dims.nodeHeight + dims.rowGap;

  const placements: MapNodePlacement[] = [];
  const lanes: MapLane[] = [];
  let y = dims.margin;
  for (const branch of BRANCHES) {
    const column = nodesInBranch(nodes, branch);
    if (column.length === 0) continue;
    const rowsUsed = new Map<number, number>();
    const laneTop = y;
    const rowsTop = laneTop + dims.laneHeader;
    for (const node of column) {
      const layer = layers.get(node.id) as number;
      const row = rowsUsed.get(layer) ?? 0;
      rowsUsed.set(layer, row + 1);
      placements.push({
        id: node.id,
        branch,
        layer,
        row,
        x: dims.margin + layer * layerPitch,
        y: rowsTop + row * rowPitch,
        width: dims.nodeWidth,
        height: dims.nodeHeight,
      });
    }
    const rows = Math.max(...rowsUsed.values());
    const height = dims.laneHeader + rows * rowPitch - dims.rowGap;
    lanes.push({ branch, rows, x: 0, y: laneTop, width: 0, height });
    y = laneTop + height + dims.laneGap;
  }

  const width =
    layerCount === 0 ? 2 * dims.margin : 2 * dims.margin + layerCount * layerPitch - dims.layerGap;
  const height = lanes.length === 0 ? 2 * dims.margin : y - dims.laneGap + dims.margin;
  lanes.forEach((lane) => {
    lane.width = width;
  });
  const byId = new Map(placements.map((placement) => [placement.id, placement]));

  const edges: MapEdge[] = [];
  for (const target of placements) {
    const node = lookup.get(target.id) as ExerciseNode;
    const sources = hardPrerequisiteIds(node, lookup)
      .map((id) => byId.get(id) as MapNodePlacement)
      .filter((source) => source.layer < target.layer)
      // Top to bottom, so the spread edges don't cross each other at the target.
      .sort((a, b) => a.y - b.y || a.x - b.x);
    sources.forEach((source, index) => {
      const offset = (index - (sources.length - 1) / 2) * dims.edgeSpread;
      const startY = source.y + source.height / 2;
      const endY = target.y + target.height / 2 + offset;
      const bendX = target.x - dims.layerGap / 2 + offset;
      edges.push({
        key: edgeKey(source.id, target.id),
        from: source.id,
        to: target.id,
        crossBranch: source.branch !== target.branch,
        points: [
          { x: source.x + source.width, y: startY },
          { x: bendX, y: startY },
          { x: bendX, y: endY },
          { x: target.x, y: endY },
        ],
      });
    });
  }

  return { width, height, layers: layerCount, nodes: placements, byId, lanes, edges };
}

/** What the map shows of the user's progress: a tile per node and which edges are lit. */
export interface MapState {
  tiles: ReadonlyMap<string, TreeTile>;
  /** Edge keys whose prerequisite is met. */
  metEdges: ReadonlySet<string>;
}

/** The column view's tile for every node (no "chain above": the map draws edges instead). */
export function mapTiles(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
  goals: readonly string[],
): MapState {
  const lookup: NodeLookup = new Map(nodes.map((node) => [node.id, node]));
  const tiles = new Map<string, TreeTile>();
  const metEdges = new Set<string>();
  for (const node of nodes) {
    const tile = treeTile(node, progress, lookup, goals);
    tiles.set(node.id, tile);
    tile.links
      .filter((link) => link.met)
      .forEach((link) => metEdges.add(edgeKey(link.node.id, node.id)));
  }
  return { tiles, metEdges };
}

/** The smallest rect around `ids`' placements, or `undefined` when none of them is on the map. */
export function boundsOf(layout: MapLayout, ids: Iterable<string>): Rect | undefined {
  const rects = [...ids]
    .map((id) => layout.byId.get(id))
    .filter((rect): rect is MapNodePlacement => rect !== undefined);
  if (rects.length === 0) return undefined;
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** What "focus" centers on: the goals, else what can be trained now, else the tree's roots. */
export type MapFocus = 'goals' | 'frontier' | 'roots';

/** The nodes the map opens on and "Focus" returns to (see `MapFocus`), and which kind they are. */
export function mapFocus(
  layout: MapLayout,
  state: MapState,
  goals: readonly string[],
): { kind: MapFocus; ids: string[] } {
  const goalIds = goals.filter((id) => layout.byId.has(id));
  if (goalIds.length > 0) return { kind: 'goals', ids: goalIds };
  const frontier = [...state.tiles.values()]
    .filter((tile) => tile.state === 'available' || tile.state === 'training')
    .map((tile) => tile.node.id);
  if (frontier.length > 0) return { kind: 'frontier', ids: frontier };
  return {
    kind: 'roots',
    ids: layout.nodes.filter((node) => node.layer === 0).map((node) => node.id),
  };
}

/**
 * An axis-aligned route (like a `MapEdge`'s points) as rects of `thickness` dp centered on it, one
 * per segment, each stretched by half the thickness at both ends so the corners are square. The map
 * draws edges with these plain views: a single SVG the size of the whole map would need a bitmap
 * too large for Android to draw.
 */
export function routeRects(points: readonly Point[], thickness: number): Rect[] {
  const half = thickness / 2;
  return points.slice(1).map((end, index) => {
    const start = points[index];
    const left = Math.min(start.x, end.x) - half;
    const top = Math.min(start.y, end.y) - half;
    return {
      x: left,
      y: top,
      width: Math.abs(end.x - start.x) + thickness,
      height: Math.abs(end.y - start.y) + thickness,
    };
  });
}
