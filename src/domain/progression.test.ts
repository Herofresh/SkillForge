import { makeChain, makeNode, makeSet } from '@/data/testFixtures';
import {
  addNodeXp,
  bankedXp,
  BASE_NODE_LEVEL_THRESHOLDS,
  emptyProgress,
  evaluateTrial,
  isPrerequisiteMet,
  MAX_NODE_LEVEL,
  newlyUnlocked,
  nodeLevel,
  passTrial,
  PROFICIENT_LEVEL,
  resolveNode,
  resolveTree,
  trialBlockReason,
  xpForLevel,
  type ProgressMap,
} from '@/domain/progression';
import { MIN_WEEKS_AT_LEVEL } from '@/domain/safeguards';
import type { NodeProgress } from '@/domain/types';
import { difficultyMult } from '@/domain/xp';
import { MS_PER_WEEK } from '@/lib/time';

const progressAt = (nodeId: string, level: number, trialPassed: boolean): NodeProgress => ({
  nodeId,
  xp: xpForLevel(level, 0),
  level,
  trialPassed,
  firstTrainedAt: 0,
});

describe('XP curve', () => {
  it('has 10 levels with rising step costs', () => {
    expect(BASE_NODE_LEVEL_THRESHOLDS).toHaveLength(MAX_NODE_LEVEL);
    expect(BASE_NODE_LEVEL_THRESHOLDS[0]).toBe(0);
    for (let i = 2; i < MAX_NODE_LEVEL; i++) {
      const step = BASE_NODE_LEVEL_THRESHOLDS[i] - BASE_NODE_LEVEL_THRESHOLDS[i - 1];
      const previous = BASE_NODE_LEVEL_THRESHOLDS[i - 1] - BASE_NODE_LEVEL_THRESHOLDS[i - 2];
      expect(step).toBeGreaterThan(previous);
    }
  });

  it('scales with the node difficulty', () => {
    expect(xpForLevel(5, 0)).toBe(BASE_NODE_LEVEL_THRESHOLDS[4]);
    expect(xpForLevel(5, 4)).toBe(Math.round(BASE_NODE_LEVEL_THRESHOLDS[4] * difficultyMult(4)));
    expect(xpForLevel(0, 0)).toBe(0);
    expect(xpForLevel(99, 0)).toBe(BASE_NODE_LEVEL_THRESHOLDS[MAX_NODE_LEVEL - 1]);
  });
});

describe('nodeLevel and banked XP', () => {
  const node = makeNode({ id: 'push_up', ogLevel: 0 });
  const t5 = xpForLevel(PROFICIENT_LEVEL, 0);
  const t8 = xpForLevel(8, 0);

  it('climbs with XP and is capped at level 5 until the Trial', () => {
    expect(nodeLevel(0, false, 0)).toBe(1);
    expect(nodeLevel(t5 - 1, false, 0)).toBe(4);
    expect(nodeLevel(t5, false, 0)).toBe(5);
    expect(nodeLevel(t8, false, 0)).toBe(5);
    expect(nodeLevel(t8, true, 0)).toBe(8);
    expect(nodeLevel(1e9, true, 0)).toBe(MAX_NODE_LEVEL);
  });

  it('banks XP beyond the cap and applies it when the Trial passes', () => {
    const capped = addNodeXp(emptyProgress(node.id), node, t8, 1000);
    expect(capped.level).toBe(5);
    expect(bankedXp(capped, node)).toBe(t8 - t5);
    const passed = passTrial(capped, node, 2000);
    expect(passed).toMatchObject({ level: 8, xp: t8, trialPassed: true, trialPassedAt: 2000 });
    expect(bankedXp(passed, node)).toBe(0);
  });

  it('lifts a test-out to exactly level 5', () => {
    const passed = passTrial(emptyProgress(node.id), node, 5);
    expect(passed).toMatchObject({ level: 5, xp: t5, trialPassed: true });
  });

  it('records the first and last training time', () => {
    const once = addNodeXp(emptyProgress(node.id), node, 10, 500);
    const twice = addNodeXp(once, node, 10, 900);
    expect(twice).toMatchObject({ xp: 20, firstTrainedAt: 500, lastTrainedAt: 900 });
  });
});

describe('evaluateTrial', () => {
  const node = makeNode({ id: 'pull_up', trial: { sets: 3, target: 8 } });
  const trialSet = (value: number) =>
    makeSet({ nodeId: 'pull_up', isTrial: true, actual: { value } });

  it('passes when enough Trial sets reach the target', () => {
    expect(evaluateTrial(node, [trialSet(8), trialSet(9), trialSet(8)])).toBe(true);
    expect(evaluateTrial(node, [trialSet(8), trialSet(7), trialSet(8), trialSet(8)])).toBe(true);
  });

  it('fails with too few passing sets, non-Trial sets or another node', () => {
    expect(evaluateTrial(node, [trialSet(8), trialSet(7), trialSet(8)])).toBe(false);
    const regular = makeSet({ nodeId: 'pull_up', actual: { value: 10 } });
    expect(evaluateTrial(node, [trialSet(8), trialSet(8), regular])).toBe(false);
    const other = makeSet({ nodeId: 'chin_up', isTrial: true, actual: { value: 10 } });
    expect(evaluateTrial(node, [trialSet(8), trialSet(8), other])).toBe(false);
  });

  it('checks lowerings per set for eccentric Trials', () => {
    const negative = makeNode({
      id: 'neg',
      metric: 'eccentric_s',
      trial: { sets: 1, target: 5, reps: 3 },
    });
    const set = (value: number, reps: number) =>
      makeSet({ nodeId: 'neg', metric: 'eccentric_s', isTrial: true, actual: { value, reps } });
    expect(evaluateTrial(negative, [set(5, 3)])).toBe(true);
    expect(evaluateTrial(negative, [set(5, 2)])).toBe(false);
    expect(evaluateTrial(negative, [set(4, 3)])).toBe(false);
  });

  it('ignores sets logged in another metric', () => {
    const hold = makeSet({
      nodeId: 'pull_up',
      metric: 'hold_s',
      isTrial: true,
      actual: { value: 30 },
    });
    expect(evaluateTrial({ ...node, trial: { sets: 1, target: 8 } }, [hold])).toBe(false);
  });
});

describe('prerequisites and node states', () => {
  const [deadHang, negative, pullUp] = makeChain();
  const nodes = [deadHang, negative, pullUp];
  const lookup = new Map(nodes.map((node) => [node.id, node]));

  it('needs the Trial passed for a level-5 prerequisite', () => {
    const prereq = negative.prerequisites[0];
    expect(isPrerequisiteMet(prereq, {}, lookup)).toBe(false);
    expect(
      isPrerequisiteMet(prereq, { dead_hang: progressAt('dead_hang', 5, false) }, lookup),
    ).toBe(false);
    expect(isPrerequisiteMet(prereq, { dead_hang: progressAt('dead_hang', 5, true) }, lookup)).toBe(
      true,
    );
  });

  it('accepts a lower minLevel without a Trial', () => {
    const prereq = { nodeId: 'dead_hang', minLevel: 3, kind: 'hard' as const };
    expect(
      isPrerequisiteMet(prereq, { dead_hang: progressAt('dead_hang', 3, false) }, lookup),
    ).toBe(true);
    expect(
      isPrerequisiteMet(prereq, { dead_hang: progressAt('dead_hang', 2, false) }, lookup),
    ).toBe(false);
  });

  it("lets a prerequisite's alternative satisfy it", () => {
    const parallel = makeNode({ id: 'parallel_bar_dip', alternatives: ['straight_bar_dip'] });
    const straight = makeNode({ id: 'straight_bar_dip', alternatives: ['parallel_bar_dip'] });
    const altLookup = new Map([parallel, straight].map((node) => [node.id, node]));
    const prereq = { nodeId: 'parallel_bar_dip', minLevel: 5, kind: 'hard' as const };
    const progress = { straight_bar_dip: progressAt('straight_bar_dip', 5, true) };
    expect(isPrerequisiteMet(prereq, progress, altLookup)).toBe(true);
  });

  it('derives locked → available → training → proficient → mastered', () => {
    expect(resolveNode(negative, {}, lookup)).toEqual({
      state: 'locked',
      unmetHard: negative.prerequisites,
      warnings: [],
    });
    const base: ProgressMap = { dead_hang: progressAt('dead_hang', 5, true) };
    expect(resolveNode(negative, base, lookup).state).toBe('available');
    const training = { ...base, pull_up_negative: progressAt('pull_up_negative', 3, false) };
    expect(resolveNode(negative, training, lookup).state).toBe('training');
    const proficient = { ...base, pull_up_negative: progressAt('pull_up_negative', 7, true) };
    expect(resolveNode(negative, proficient, lookup).state).toBe('proficient');
    const mastered = { ...base, pull_up_negative: progressAt('pull_up_negative', 10, true) };
    expect(resolveNode(negative, mastered, lookup).state).toBe('mastered');
  });

  it('turns unmet recommended prerequisites into warnings, not locks', () => {
    const pike = makeNode({
      id: 'pike_push_up',
      prerequisites: [{ nodeId: 'dead_hang', minLevel: 5, kind: 'recommended' }],
    });
    const status = resolveNode(pike, {}, lookup);
    expect(status.state).toBe('available');
    expect(status.warnings).toEqual(pike.prerequisites);
  });

  it('lists nodes that became unlocked', () => {
    const before = resolveTree(nodes, {});
    const after = resolveTree(nodes, { dead_hang: progressAt('dead_hang', 5, true) });
    expect(newlyUnlocked(before, after)).toEqual(['pull_up_negative']);
  });
});

describe('trialBlockReason', () => {
  const [deadHang, negative] = makeChain();
  const lookup = new Map([deadHang, negative].map((node) => [node.id, node]));
  const lever = makeNode({ id: 'tuck_front_lever', straightArm: true, metric: 'hold_s' });

  it('allows a test-out from an available node', () => {
    const status = resolveNode(deadHang, {}, lookup);
    expect(trialBlockReason(deadHang, status, undefined, 0)).toBeUndefined();
  });

  it('blocks locked nodes and passed Trials', () => {
    expect(trialBlockReason(negative, resolveNode(negative, {}, lookup), undefined, 0)).toBe(
      'locked',
    );
    const passed = progressAt('dead_hang', 5, true);
    const status = resolveNode(deadHang, { dead_hang: passed }, lookup);
    expect(trialBlockReason(deadHang, status, passed, 0)).toBe('already_passed');
  });

  it('blocks a straight-arm Trial before the minimum weeks', () => {
    const status = resolveNode(lever, {}, new Map([[lever.id, lever]]));
    const progress = { ...emptyProgress(lever.id), firstTrainedAt: 0 };
    expect(trialBlockReason(lever, status, undefined, 0)).toBe('straight_arm_min_weeks');
    expect(trialBlockReason(lever, status, progress, MS_PER_WEEK)).toBe('straight_arm_min_weeks');
    expect(trialBlockReason(lever, status, progress, MIN_WEEKS_AT_LEVEL * MS_PER_WEEK)).toBe(
      undefined,
    );
  });
});
