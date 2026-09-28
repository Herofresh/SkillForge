import { ALL_NODES } from '@/data/skills';
import { makeChain, makeNode } from '@/data/testFixtures';

import { PROFICIENT_LEVEL, xpForLevel } from './progression';
import {
  boundsOf,
  DEFAULT_TREE_MODE,
  edgeKey,
  MAP_DIMS,
  mapFocus,
  mapLayout,
  mapTiles,
  nodeLayers,
  parseTreeMode,
  routeRects,
} from './treeMap';
import { treeTile } from './treeView';
import type { NodeProgress } from './types';

const proficient = (nodeId: string): NodeProgress => ({
  nodeId,
  xp: xpForLevel(PROFICIENT_LEVEL, 0),
  level: PROFICIENT_LEVEL,
  trialPassed: true,
  firstTrainedAt: 1,
});

const [deadHang, negative, pullUp] = makeChain();
const hollow = makeNode({ id: 'hollow_hold', branch: 'core', chainOrder: 10, ogLevel: 0 });
const scapPull = makeNode({
  id: 'scap_pull',
  chainOrder: 15,
  ogLevel: 0,
  prerequisites: [{ nodeId: 'dead_hang', minLevel: 5, kind: 'hard' }],
});
const lever = makeNode({
  id: 'tuck_lever',
  branch: 'front_lever',
  chainOrder: 10,
  ogLevel: 4,
  legendary: true,
  straightArm: true,
  prerequisites: [
    { nodeId: 'pull_up', minLevel: 5, kind: 'hard' },
    { nodeId: 'hollow_hold', minLevel: 5, kind: 'hard' },
    { nodeId: 'pull_up_negative', minLevel: 3, kind: 'recommended' },
  ],
});
const NODES = [lever, pullUp, hollow, scapPull, negative, deadHang];

describe('parseTreeMode', () => {
  it('reads the stored mode and falls back to columns', () => {
    expect(parseTreeMode('map')).toBe('map');
    expect(parseTreeMode('columns')).toBe('columns');
    expect(DEFAULT_TREE_MODE).toBe('columns');
    expect(parseTreeMode(undefined)).toBe('columns');
    expect(parseTreeMode('graph')).toBe('columns');
    expect(parseTreeMode(3)).toBe('columns');
  });
});

describe('nodeLayers', () => {
  it('is the longest chain of hard prerequisites (recommended ones do not count)', () => {
    const layers = nodeLayers(NODES);
    expect(Object.fromEntries(layers)).toEqual({
      dead_hang: 0,
      hollow_hold: 0,
      scap_pull: 1,
      pull_up_negative: 1,
      pull_up: 2,
      tuck_lever: 3,
    });
  });

  it('ignores prerequisites that are not in the tree and survives a cycle', () => {
    const a = makeNode({
      id: 'a',
      prerequisites: [
        { nodeId: 'b', minLevel: 5, kind: 'hard' },
        { nodeId: 'gone', minLevel: 5, kind: 'hard' },
      ],
    });
    const b = makeNode({ id: 'b', prerequisites: [{ nodeId: 'a', minLevel: 5, kind: 'hard' }] });
    const layers = nodeLayers([a, b]);
    expect(layers.size).toBe(2);
    expect([...layers.values()].sort()).toEqual([0, 1]);
  });
});

describe('mapLayout', () => {
  const layout = mapLayout(NODES);
  const at = (id: string) => layout.byId.get(id)!;

  it('puts layers left to right and branches in lanes in BRANCHES order', () => {
    expect(layout.layers).toBe(4);
    expect(layout.lanes.map((lane) => lane.branch)).toEqual(['v_pull', 'front_lever', 'core']);
    expect(at('dead_hang').x).toBe(MAP_DIMS.margin);
    expect(at('pull_up').x).toBe(MAP_DIMS.margin + 2 * (MAP_DIMS.nodeWidth + MAP_DIMS.layerGap));
    expect(at('tuck_lever').y).toBeGreaterThan(at('pull_up').y);
    expect(at('hollow_hold').y).toBeGreaterThan(at('tuck_lever').y);
  });

  it('stacks same-layer nodes of a lane as rows in chain order', () => {
    // scap_pull (chainOrder 15) and pull_up_negative (20) are both layer 1 in v_pull.
    expect(at('scap_pull').row).toBe(0);
    expect(at('pull_up_negative').row).toBe(1);
    expect(at('pull_up_negative').y - at('scap_pull').y).toBe(
      MAP_DIMS.nodeHeight + MAP_DIMS.rowGap,
    );
    expect(layout.lanes[0].rows).toBe(2);
    expect(layout.lanes[1].rows).toBe(1);
  });

  it('keeps nodes inside the map and lanes apart', () => {
    for (const node of layout.nodes) {
      expect(node.x + node.width).toBeLessThanOrEqual(layout.width - MAP_DIMS.margin);
      expect(node.y + node.height).toBeLessThanOrEqual(layout.height - MAP_DIMS.margin);
    }
    for (let i = 1; i < layout.lanes.length; i++) {
      const above = layout.lanes[i - 1];
      expect(layout.lanes[i].y).toBe(above.y + above.height + MAP_DIMS.laneGap);
    }
  });

  it('draws one elbow per hard prerequisite, bending in the gap before the target', () => {
    expect(layout.edges.map((edge) => edge.key).sort()).toEqual(
      [
        edgeKey('dead_hang', 'pull_up_negative'),
        edgeKey('dead_hang', 'scap_pull'),
        edgeKey('pull_up_negative', 'pull_up'),
        edgeKey('pull_up', 'tuck_lever'),
        edgeKey('hollow_hold', 'tuck_lever'),
      ].sort(),
    );
    const edge = layout.edges.find((entry) => entry.key === edgeKey('pull_up', 'tuck_lever'))!;
    expect(edge.crossBranch).toBe(true);
    const [start, bendA, bendB, end] = edge.points;
    expect(start.x).toBe(at('pull_up').x + MAP_DIMS.nodeWidth);
    expect(end.x).toBe(at('tuck_lever').x);
    expect(bendA.x).toBe(bendB.x);
    expect(bendA.x).toBeGreaterThan(end.x - MAP_DIMS.layerGap);
    expect(bendA.x).toBeLessThan(end.x);
  });

  it('spreads edges that end in the same node', () => {
    const into = layout.edges.filter((edge) => edge.to === 'tuck_lever');
    expect(into).toHaveLength(2);
    const [upper, lower] = into.map((edge) => edge.points[3].y);
    expect(lower - upper).toBe(MAP_DIMS.edgeSpread);
    expect(into[0].points[1].x).not.toBe(into[1].points[1].x);
  });

  it('lays out the full dataset without overlaps', () => {
    const full = mapLayout(ALL_NODES);
    expect(full.nodes).toHaveLength(ALL_NODES.length);
    const seen = new Set(full.nodes.map((node) => `${node.x},${node.y}`));
    expect(seen.size).toBe(ALL_NODES.length);
    expect(full.edges.every((edge) => full.byId.has(edge.from) && full.byId.has(edge.to))).toBe(
      true,
    );
    const hardEdges = ALL_NODES.flatMap((node) =>
      node.prerequisites.filter((prerequisite) => prerequisite.kind === 'hard'),
    ).length;
    expect(full.edges.length).toBe(hardEdges);
  });

  it('handles an empty tree', () => {
    const empty = mapLayout([]);
    expect(empty.nodes).toEqual([]);
    expect(empty.width).toBe(2 * MAP_DIMS.margin);
  });
});

describe('mapTiles', () => {
  it('reuses the column tile and lights the met edges', () => {
    const state = mapTiles(NODES, { dead_hang: proficient('dead_hang') }, ['pull_up']);
    const lookup = new Map(NODES.map((node) => [node.id, node]));
    expect(state.tiles.get('pull_up')).toEqual(treeTile(pullUp, {}, lookup, ['pull_up']));
    expect(state.tiles.get('pull_up')!.isGoal).toBe(true);
    expect(state.tiles.get('tuck_lever')!.state).toBe('legendary');
    expect([...state.metEdges].sort()).toEqual(
      [edgeKey('dead_hang', 'pull_up_negative'), edgeKey('dead_hang', 'scap_pull')].sort(),
    );
  });
});

describe('boundsOf and mapFocus', () => {
  const layout = mapLayout(NODES);

  it('boxes the given nodes and ignores unknown ids', () => {
    const a = layout.byId.get('dead_hang')!;
    const b = layout.byId.get('pull_up')!;
    expect(boundsOf(layout, ['dead_hang', 'pull_up', 'gone'])).toEqual({
      x: a.x,
      y: a.y,
      width: b.x + b.width - a.x,
      height: b.y + b.height - a.y,
    });
    expect(boundsOf(layout, ['gone'])).toBeUndefined();
  });

  it('focuses the goals, else the frontier, else the roots', () => {
    const state = mapTiles(NODES, {}, []);
    expect(mapFocus(layout, state, ['pull_up', 'gone'])).toEqual({
      kind: 'goals',
      ids: ['pull_up'],
    });
    const frontier = mapFocus(layout, state, ['gone']);
    expect(frontier.kind).toBe('frontier');
    expect(frontier.ids.sort()).toEqual(['dead_hang', 'hollow_hold']);
    const allLocked = mapTiles([lever], {}, []);
    expect(mapFocus(mapLayout([lever]), allLocked, [])).toEqual({
      kind: 'roots',
      ids: ['tuck_lever'],
    });
  });
});

describe('routeRects', () => {
  it('turns an elbow into one square-cornered rect per segment', () => {
    const rects = routeRects(
      [
        { x: 0, y: 10 },
        { x: 20, y: 10 },
        { x: 20, y: 0 },
        { x: 30, y: 0 },
      ],
      4,
    );
    expect(rects).toEqual([
      { x: -2, y: 8, width: 24, height: 4 },
      { x: 18, y: -2, width: 4, height: 14 },
      { x: 18, y: -2, width: 14, height: 4 },
    ]);
  });
});
