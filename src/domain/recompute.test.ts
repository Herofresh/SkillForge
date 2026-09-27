import { makeChain, makeNode, makeSession } from '@/data/testFixtures';
import { ALL_NODES } from '@/data/skills';
import { bankedXp, PROFICIENT_LEVEL, resolveTree, xpForLevel } from '@/domain/progression';
import {
  applySession,
  applyUserAction,
  canApplyIncrementally,
  compareHistory,
  INITIAL_ENGINE_STATE,
  recompute,
  type EngineState,
  type HistoryEntry,
} from '@/domain/recompute';
import { MIN_WEEKS_AT_LEVEL, STRAIGHT_ARM_REST_HOURS } from '@/domain/safeguards';
import type { LoggedSession, UserAction } from '@/domain/types';
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_WEEK } from '@/lib/time';

const [deadHang, negative, pullUp] = makeChain();
const lever = makeNode({
  id: 'tuck_front_lever',
  branch: 'front_lever',
  ogLevel: 4,
  metric: 'hold_s',
  workingRange: { min: 5, max: 15 },
  trial: { sets: 3, target: 10 },
  straightArm: true,
  patterns: ['straight_arm_pull'],
});
const advancedLever = makeNode({
  id: 'advanced_tuck_front_lever',
  branch: 'front_lever',
  chainOrder: 20,
  ogLevel: 5,
  metric: 'hold_s',
  workingRange: { min: 5, max: 15 },
  trial: { sets: 3, target: 10 },
  prerequisites: [{ nodeId: 'tuck_front_lever', minLevel: 5, kind: 'hard' }],
  straightArm: true,
  patterns: ['straight_arm_pull'],
});
const nodes = [deadHang, negative, pullUp, lever, advancedLever];

/** 3 × 8 reps of dead_hang (og 0): exactly 24 node XP. */
const training = (id: string, day: number, isTrial = false) =>
  makeSession(id, day * MS_PER_DAY, [{ nodeId: 'dead_hang', count: 3, isTrial }]);
const leverSession = (id: string, at: number, isTrial = false) =>
  makeSession(id, at, [
    {
      nodeId: 'tuck_front_lever',
      count: 3,
      metric: 'hold_s',
      prescribed: { value: 10 },
      actual: { value: 10 },
      isTrial,
    },
  ]);
const unlockAction = (id: string, nodeId: string, at: number): UserAction => ({
  id,
  kind: 'self_unlock',
  nodeId,
  at,
});
const codes = (warnings: readonly { code: string }[]) => warnings.map((warning) => warning.code);

describe('recompute scenarios', () => {
  it('grants XP for a failed session', () => {
    const failed = makeSession('f', 0, [{ nodeId: 'dead_hang', count: 3, actual: { value: 1 } }]);
    const { state, results } = recompute(nodes, [failed]);
    expect(results[0].exercises[0].outcome).toBe('failed');
    expect(results[0].exercises[0].xp).toBeGreaterThan(0);
    expect(state.progress.dead_hang.xp).toBeGreaterThan(0);
    expect(state.totalXp).toBeGreaterThan(0);
  });

  it('caps at level 5 until the Trial passes, then applies the banked XP', () => {
    const history = Array.from({ length: 9 }, (_, i) => training(`t${i}`, i * 2));
    const capped = recompute(nodes, history).state;
    expect(capped.progress.dead_hang).toMatchObject({ xp: 216, level: PROFICIENT_LEVEL });
    expect(bankedXp(capped.progress.dead_hang, deadHang)).toBe(216 - xpForLevel(5, 0));

    const { state, result } = applySession(capped, training('trial', 20, true), nodes);
    expect(result.exercises[0]).toMatchObject({ trialAttempted: true, trialPassed: true });
    expect(state.progress.dead_hang).toMatchObject({ xp: 240, level: 6, trialPassed: true });
    expect(result.levelUps).toEqual([{ nodeId: 'dead_hang', from: 5, to: 6 }]);
  });

  it('unlocks successors when the Trial passes', () => {
    const { state, results } = recompute(nodes, [training('a', 0), training('b', 2, true)]);
    expect(results[0].unlocked).toEqual([]);
    expect(results[1].unlocked).toEqual(['pull_up_negative']);
    const tree = resolveTree(nodes, state.progress);
    expect(tree.get('pull_up_negative')?.state).toBe('available');
    expect(tree.get('pull_up')?.state).toBe('locked');
  });

  it('tests out of an available node straight to level 5', () => {
    const { state, results } = recompute(nodes, [training('x', 0, true)]);
    expect(results[0].exercises[0].trialPassed).toBe(true);
    expect(results[0].warnings).toEqual([]);
    expect(state.progress.dead_hang).toMatchObject({
      level: PROFICIENT_LEVEL,
      xp: xpForLevel(PROFICIENT_LEVEL, 0),
      trialPassed: true,
    });
  });

  it('does not re-pass a Trial that is already passed', () => {
    const first = recompute(nodes, [training('x', 0, true)]).state;
    const { state, result } = applySession(first, training('y', 2, true), nodes);
    expect(result.exercises[0]).toMatchObject({ trialAttempted: true, trialPassed: false });
    expect(state.progress.dead_hang.trialPassedAt).toBe(first.progress.dead_hang.trialPassedAt);
  });

  it('counts a Trial on a locked node (test-out anywhere) with an info warning', () => {
    const attempt = makeSession('p', 0, [{ nodeId: 'pull_up', count: 3, isTrial: true }]);
    const { state, results } = recompute(nodes, [attempt]);
    expect(results[0].exercises[0]).toMatchObject({ trialAttempted: true, trialPassed: true });
    expect(state.progress.pull_up).toMatchObject({ level: PROFICIENT_LEVEL, trialPassed: true });
    expect(results[0].warnings).toEqual([
      expect.objectContaining({ code: 'prerequisites_unmet', nodeId: 'pull_up', severity: 'info' }),
    ]);
    expect(resolveTree(nodes, state.progress).get('pull_up')?.state).toBe('proficient');
  });

  it('passes a straight-arm test-out on day 1, unlocks its successor and warns', () => {
    const { state, results } = recompute(nodes, [leverSession('l', 0, true)]);
    expect(results[0].exercises[0]).toMatchObject({ trialAttempted: true, trialPassed: true });
    expect(state.progress.tuck_front_lever).toMatchObject({
      level: PROFICIENT_LEVEL,
      trialPassed: true,
    });
    expect(results[0].unlocked).toEqual(['advanced_tuck_front_lever']);
    expect(results[0].warnings).toEqual([
      expect.objectContaining({
        code: 'straight_arm_min_weeks',
        nodeId: 'tuck_front_lever',
        severity: 'warning',
      }),
    ]);
  });

  it('counts an early straight-arm Trial with a warning, and warns no more after 6 weeks', () => {
    const start = leverSession('l0', 0);
    const early = leverSession('l1', (MIN_WEEKS_AT_LEVEL * MS_PER_WEEK) / 2, true);
    const warned = recompute(nodes, [start, early]);
    expect(warned.results[1].exercises[0].trialPassed).toBe(true);
    expect(codes(warned.results[1].warnings)).toEqual(['straight_arm_min_weeks']);

    const late = leverSession('l2', MIN_WEEKS_AT_LEVEL * MS_PER_WEEK, true);
    const clean = recompute(nodes, [start, late]);
    expect(clean.results[1].exercises[0].trialPassed).toBe(true);
    expect(clean.results[1].warnings).toEqual([]);
    expect(clean.state.lastStraightArmSessionAt).toBe(MIN_WEEKS_AT_LEVEL * MS_PER_WEEK);
  });

  it('warns about the straight-arm budget and the 48 h rule but keeps all the XP', () => {
    const big = (id: string, at: number) =>
      makeSession(id, at, [
        {
          nodeId: 'tuck_front_lever',
          count: 4,
          metric: 'hold_s',
          prescribed: { value: 20 },
          actual: { value: 20 },
        },
      ]);
    const soon = (STRAIGHT_ARM_REST_HOURS - 1) * MS_PER_HOUR;
    const { state, results } = recompute(nodes, [big('a', 0), big('b', soon)]);
    expect(codes(results[0].warnings)).toEqual(['straight_arm_budget']);
    expect(codes(results[1].warnings)).toEqual(['straight_arm_budget', 'straight_arm_rest']);
    expect(results[1].exercises[0].xp).toBe(results[0].exercises[0].xp);
    expect(state.progress.tuck_front_lever.xp).toBe(2 * results[0].exercises[0].xp);
  });

  it('self-unlocks a node with unmet prerequisites so it can be trained', () => {
    const { state, results, actionResults } = recompute(
      nodes,
      [makeSession('s', MS_PER_DAY, [{ nodeId: 'pull_up', count: 3 }])],
      [unlockAction('u', 'pull_up', 0)],
    );
    expect(actionResults).toEqual([
      {
        actionId: 'u',
        kind: 'self_unlock',
        nodeId: 'pull_up',
        unlocked: ['pull_up'],
        warnings: [expect.objectContaining({ code: 'prerequisites_unmet', severity: 'info' })],
      },
    ]);
    expect(results[0].warnings).toEqual([]); // acknowledged at the unlock, not repeated
    expect(state.progress.pull_up.selfUnlockedAt).toBe(0);
    const tree = resolveTree(nodes, state.progress);
    expect(tree.get('pull_up')).toMatchObject({ state: 'training', selfUnlocked: true });
    expect(tree.get('pull_up_negative')?.state).toBe('locked');
  });

  it('ignores a self-unlock of a node that is no longer in the tree', () => {
    const { state, actionResults } = recompute(nodes, [], [unlockAction('u', 'gone', 0)]);
    expect(state.progress).toEqual({});
    expect(actionResults[0]).toMatchObject({ unlocked: [], warnings: [] });
  });
});

describe('recompute determinism', () => {
  const history: LoggedSession[] = [
    training('a', 0),
    leverSession('b', MS_PER_DAY),
    training('c', 2, true),
    makeSession('d', 3 * MS_PER_DAY, [
      { nodeId: 'pull_up_negative', count: 3, actual: { value: 5 } },
      { nodeId: 'dead_hang', count: 2, actual: { value: 0 } },
      { nodeId: 'unknown_node', count: 2 },
    ]),
    training('e', 10),
    leverSession('f', 50 * MS_PER_DAY, true),
    makeSession('g', 50 * MS_PER_DAY, [{ nodeId: 'pull_up_negative', count: 3, isTrial: true }]),
  ];
  const actions: UserAction[] = [
    unlockAction('u1', 'pull_up', 4 * MS_PER_DAY),
    unlockAction('u2', 'advanced_tuck_front_lever', 5 * MS_PER_DAY),
  ];
  const withUnlocked = makeSession('h', 11 * MS_PER_DAY, [
    { nodeId: 'pull_up', count: 3 },
    { nodeId: 'advanced_tuck_front_lever', count: 1, metric: 'hold_s', actual: { value: 5 } },
  ]);

  it('equals applying the sessions one by one', () => {
    let state: EngineState = INITIAL_ENGINE_STATE;
    for (const session of history) {
      expect(canApplyIncrementally(state, session)).toBe(true);
      state = applySession(state, session, nodes).state;
    }
    expect(recompute(nodes, history).state).toEqual(state);
  });

  it('equals applying sessions and self-unlocks one by one', () => {
    const sessions = [...history, withUnlocked];
    const entries: HistoryEntry[] = [...sessions, ...actions].sort(compareHistory);
    let state: EngineState = INITIAL_ENGINE_STATE;
    for (const entry of entries) {
      expect(canApplyIncrementally(state, entry)).toBe(true);
      state =
        'kind' in entry
          ? applyUserAction(state, entry, nodes).state
          : applySession(state, entry, nodes).state;
    }
    const full = recompute(nodes, sessions, actions);
    expect(full.state).toEqual(state);
    expect(full.state.progress.pull_up.selfUnlockedAt).toBe(4 * MS_PER_DAY);
    expect(full.actionResults.map((result) => result.actionId)).toEqual(['u1', 'u2']);
    expect(recompute(nodes, [...sessions].reverse(), [...actions].reverse())).toEqual(full);
  });

  it('replays a self-unlock before a session at the same time', () => {
    const at = 5 * MS_PER_DAY;
    const session = makeSession('same', at, [{ nodeId: 'pull_up', count: 3 }]);
    const action = unlockAction('zzz', 'pull_up', at);
    expect(compareHistory(action, session)).toBeLessThan(0);
    const afterSession = applySession(INITIAL_ENGINE_STATE, session, nodes).state;
    expect(canApplyIncrementally(afterSession, action)).toBe(false); // needs a recompute
    expect(recompute(nodes, [session], [action]).results[0].warnings).toEqual([]);
  });

  it('does not depend on the input order', () => {
    const shuffled = [
      history[5],
      history[2],
      history[6],
      history[0],
      history[4],
      history[3],
      history[1],
    ];
    expect(recompute(nodes, shuffled)).toEqual(recompute(nodes, history));
    expect(recompute(nodes, history)).toEqual(recompute(nodes, history));
  });

  it('rejects an older session for incremental application', () => {
    const { state } = recompute(nodes, history);
    expect(canApplyIncrementally(state, training('old', 1))).toBe(false);
  });

  it('adds streak and completion bonuses only to character XP', () => {
    const { state, results } = recompute(nodes, [training('a', 0), training('b', 2)]);
    expect(results[1].streak).toBe(2);
    expect(results[1].xp.streakBonus).toBeGreaterThan(0);
    expect(results[1].xp.completionBonus).toBeGreaterThan(0);
    expect(state.progress.dead_hang.xp).toBe(48);
    expect(state.totalXp).toBe(results[0].xp.total + results[1].xp.total);
  });

  it('runs over the real dataset', () => {
    const real = [
      makeSession('r1', 0, [{ nodeId: 'wall_push_up', count: 3, isTrial: true }]),
      makeSession('r2', MS_PER_DAY, [{ nodeId: 'incline_push_up', count: 3 }]),
    ];
    const { state, results } = recompute(ALL_NODES, real);
    expect(state.progress.wall_push_up.trialPassed).toBe(true);
    expect(results[0].unlocked).toContain('incline_push_up');
  });

  it('lets a real straight-arm node be tested out on day 1', () => {
    const planche = ALL_NODES.find((node) => node.id === 'tuck_planche');
    expect(planche?.straightArm).toBe(true);
    const trial = planche?.trial ?? { sets: 0, target: 0 };
    const session = makeSession('p', 0, [
      {
        nodeId: 'tuck_planche',
        count: trial.sets,
        metric: planche?.metric,
        prescribed: { value: trial.target },
        actual: { value: trial.target },
        isTrial: true,
      },
    ]);
    const { state, results } = recompute(ALL_NODES, [session]);
    expect(state.progress.tuck_planche.trialPassed).toBe(true);
    expect(codes(results[0].warnings)).toContain('straight_arm_min_weeks');
  });
});
