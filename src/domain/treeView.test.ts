import { ALL_NODES } from '@/data/skills';
import { makeChain, makeNode, makeSet } from '@/data/testFixtures';

import { PROFICIENT_LEVEL, xpForLevel } from './progression';
import {
  branchColumn,
  branchSummary,
  defaultBranch,
  nodeDetail,
  nodeHistory,
  prerequisiteViews,
  tileState,
  NODE_HISTORY_LIMIT,
} from './treeView';
import type { LoggedSession, NodeProgress } from './types';

const proficient = (nodeId: string, ogLevel = 0): NodeProgress => ({
  nodeId,
  xp: xpForLevel(PROFICIENT_LEVEL, ogLevel),
  level: PROFICIENT_LEVEL,
  trialPassed: true,
  firstTrainedAt: 1,
});

describe('tileState', () => {
  it('shows a locked legendary node as a silhouette', () => {
    expect(tileState({ legendary: true }, 'locked')).toBe('legendary');
    expect(tileState({ legendary: true }, 'available')).toBe('available');
    expect(tileState({}, 'locked')).toBe('locked');
    expect(tileState({}, 'mastered')).toBe('mastered');
  });
});

describe('branchColumn', () => {
  const [deadHang, negative, pullUp] = makeChain();
  const hollow = makeNode({ id: 'hollow_hold', branch: 'core', ogLevel: 0 });
  const lever = makeNode({
    id: 'tuck_lever',
    chainOrder: 40,
    ogLevel: 4,
    legendary: true,
    prerequisites: [
      { nodeId: 'pull_up', minLevel: 5, kind: 'hard' },
      { nodeId: 'hollow_hold', minLevel: 5, kind: 'hard' },
      { nodeId: 'dead_hang', minLevel: 5, kind: 'hard' },
      { nodeId: 'pull_up_negative', minLevel: 3, kind: 'recommended' },
    ],
  });
  const nodes = [lever, pullUp, hollow, negative, deadHang];

  it('orders the column and links each node to the one above it', () => {
    const tiles = branchColumn(nodes, 'v_pull', { dead_hang: proficient('dead_hang') }, [
      'pull_up',
    ]);
    expect(tiles.map((tile) => tile.node.id)).toEqual([
      'dead_hang',
      'pull_up_negative',
      'pull_up',
      'tuck_lever',
    ]);
    expect(tiles.map((tile) => tile.state)).toEqual([
      'proficient',
      'available',
      'locked',
      'legendary',
    ]);
    expect(tiles[0].chainAbove).toBeUndefined();
    expect(tiles[1].chainAbove).toEqual({ met: true });
    expect(tiles[2].chainAbove).toEqual({ met: false });
    expect(tiles[2].isGoal).toBe(true);
    expect(tiles[0].isGoal).toBe(false);
  });

  it('turns the other hard prerequisites into linked chips', () => {
    const tiles = branchColumn(nodes, 'v_pull', { dead_hang: proficient('dead_hang') }, []);
    const links = tiles[3].links;
    expect(tiles[3].chainAbove).toEqual({ met: false });
    expect(links.map((link) => [link.node.id, link.crossBranch, link.met])).toEqual([
      ['hollow_hold', true, false],
      ['dead_hang', false, true],
    ]);
  });

  it('summarises the branch', () => {
    const tiles = branchColumn(nodes, 'v_pull', { dead_hang: proficient('dead_hang') }, [
      'pull_up',
    ]);
    expect(branchSummary(tiles)).toEqual({ total: 4, open: 2, proficient: 1, goals: 1 });
  });

  it('builds every branch of the real dataset', () => {
    const count = [...new Set(ALL_NODES.map((node) => node.branch))]
      .map((branch) => branchColumn(ALL_NODES, branch, {}, []).length)
      .reduce((sum, n) => sum + n, 0);
    expect(count).toBe(ALL_NODES.length);
  });
});

describe('prerequisiteViews', () => {
  const parallel = makeNode({
    id: 'parallel_bar_dip',
    branch: 'v_push',
    alternatives: ['straight_bar_dip'],
  });
  const straight = makeNode({
    id: 'straight_bar_dip',
    name: 'Straight bar dip',
    branch: 'v_push',
    alternatives: ['parallel_bar_dip'],
  });
  const flag = makeNode({
    id: 'flag',
    branch: 'dynamic',
    prerequisites: [
      { nodeId: 'side_plank', minLevel: 5, kind: 'recommended' },
      { nodeId: 'parallel_bar_dip', minLevel: 5, kind: 'hard' },
    ],
  });
  const plank = makeNode({ id: 'side_plank', branch: 'core' });
  const lookup = new Map([parallel, straight, flag, plank].map((node) => [node.id, node]));

  it('lists hard ones first with their alternatives and what met them', () => {
    const views = prerequisiteViews(
      flag,
      { straight_bar_dip: proficient('straight_bar_dip') },
      lookup,
    );
    expect(views.map((view) => view.node.id)).toEqual(['parallel_bar_dip', 'side_plank']);
    expect(views[0]).toMatchObject({
      met: true,
      satisfiedBy: { id: 'straight_bar_dip', name: 'Straight bar dip' },
      alternatives: [{ id: 'straight_bar_dip' }],
      crossBranch: true,
    });
    expect(views[1]).toMatchObject({ met: false, alternatives: [] });
    expect(views[1].satisfiedBy).toBeUndefined();
  });
});

describe('defaultBranch', () => {
  it("opens on the first goal's branch", () => {
    expect(defaultBranch(ALL_NODES, ['nope', 'tuck_planche', 'pull_up'])).toBe('planche');
    expect(defaultBranch(ALL_NODES, [])).toBe('h_push');
  });
});

describe('nodeHistory', () => {
  const session = (id: string, startedAt: number, nodeIds: string[], isTrial = false) =>
    ({
      id,
      startedAt,
      sets: nodeIds.map((nodeId, setIndex) =>
        makeSet({ nodeId, sessionId: id, setIndex, isTrial, timestamp: startedAt + setIndex }),
      ),
    }) satisfies LoggedSession;

  it('lists the newest sessions with only the node sets', () => {
    const sessions = [
      session('a', 100, ['pull_up', 'squat', 'pull_up']),
      session('b', 300, ['squat']),
      session('c', 200, ['pull_up'], true),
    ];
    const history = nodeHistory(sessions, 'pull_up');
    expect(history.map((entry) => [entry.sessionId, entry.isTrial, entry.sets.length])).toEqual([
      ['c', true, 1],
      ['a', false, 2],
    ]);
    expect(history[1].sets.map((set) => set.setIndex)).toEqual([0, 2]);
  });

  it(`keeps at most ${NODE_HISTORY_LIMIT} sessions`, () => {
    const sessions = Array.from({ length: 8 }, (_, i) => session(`s${i}`, i * 10, ['pull_up']));
    const history = nodeHistory(sessions, 'pull_up');
    expect(history).toHaveLength(NODE_HISTORY_LIMIT);
    expect(history[0].sessionId).toBe('s7');
  });
});

describe('nodeDetail', () => {
  it('bundles the tile, prerequisites, attributes and history', () => {
    const detail = nodeDetail(ALL_NODES, 'tuck_front_lever', {}, ['tuck_front_lever'], []);
    expect(detail?.tile.state).toBe('locked');
    expect(detail?.tile.isGoal).toBe(true);
    expect(detail?.prerequisites.map((view) => view.node.id)).toEqual([
      'pull_up',
      'dead_hang',
      'hollow_hold',
    ]);
    expect(detail?.attributes).toEqual(['pull', 'core']);
    expect(detail?.history).toEqual([]);
    expect(nodeDetail(ALL_NODES, 'nope', {}, [], [])).toBeUndefined();
  });
});
