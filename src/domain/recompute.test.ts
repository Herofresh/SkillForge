import { makeChain, makeNode, makeSession } from '@/data/testFixtures';
import { ALL_NODES } from '@/data/skills';
import { bankedXp, PROFICIENT_LEVEL, resolveTree, xpForLevel } from '@/domain/progression';
import {
  applySession,
  canApplyIncrementally,
  INITIAL_ENGINE_STATE,
  recompute,
  type EngineState,
} from '@/domain/recompute';
import { MIN_WEEKS_AT_LEVEL } from '@/domain/safeguards';
import type { LoggedSession } from '@/domain/types';
import { MS_PER_DAY, MS_PER_WEEK } from '@/lib/time';

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
const nodes = [deadHang, negative, pullUp, lever];

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
    expect(state.progress.dead_hang).toMatchObject({
      level: PROFICIENT_LEVEL,
      xp: xpForLevel(PROFICIENT_LEVEL, 0),
      trialPassed: true,
    });
  });

  it('does not count a Trial on a locked node, but keeps the XP', () => {
    const attempt = makeSession('p', 0, [{ nodeId: 'pull_up', count: 3, isTrial: true }]);
    const { state, results } = recompute(nodes, [attempt]);
    expect(results[0].exercises[0]).toMatchObject({ trialPassed: false, trialBlocked: 'locked' });
    expect(state.progress.pull_up.trialPassed).toBe(false);
    expect(state.progress.pull_up.xp).toBeGreaterThan(0);
  });

  it('blocks a straight-arm Trial before 6 weeks and allows it after', () => {
    const start = leverSession('l0', 0);
    const early = leverSession('l1', (MIN_WEEKS_AT_LEVEL * MS_PER_WEEK) / 2, true);
    const blocked = recompute(nodes, [start, early]);
    expect(blocked.results[1].exercises[0]).toMatchObject({
      trialPassed: false,
      trialBlocked: 'straight_arm_min_weeks',
    });
    expect(blocked.state.progress.tuck_front_lever.trialPassed).toBe(false);

    const late = leverSession('l2', MIN_WEEKS_AT_LEVEL * MS_PER_WEEK, true);
    const opened = recompute(nodes, [start, early, late]);
    expect(opened.results[2].exercises[0].trialPassed).toBe(true);
    expect(opened.state.lastStraightArmSessionAt).toBe(MIN_WEEKS_AT_LEVEL * MS_PER_WEEK);
  });

  it('blocks a straight-arm test-out on the first session', () => {
    const { results } = recompute(nodes, [leverSession('l', 0, true)]);
    expect(results[0].exercises[0].trialBlocked).toBe('straight_arm_min_weeks');
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

  it('equals applying the sessions one by one', () => {
    let state: EngineState = INITIAL_ENGINE_STATE;
    for (const session of history) {
      expect(canApplyIncrementally(state, session)).toBe(true);
      state = applySession(state, session, nodes).state;
    }
    expect(recompute(nodes, history).state).toEqual(state);
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
});
