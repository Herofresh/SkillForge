import { makeNode, makeSession, makeSet } from '@/data/testFixtures';
import {
  isStraightArmRested,
  isTrialOpenBySafeguards,
  lastStraightArmSessionAt,
  MIN_WEEKS_AT_LEVEL,
  remainingStraightArmBudget,
  STRAIGHT_ARM_REST_HOURS,
  STRAIGHT_ARM_SESSION_BUDGET_S,
  straightArmSecondsUsed,
  trialOpensAt,
} from '@/domain/safeguards';
import { MS_PER_HOUR, MS_PER_WEEK } from '@/lib/time';

const lever = makeNode({
  id: 'tuck_front_lever',
  branch: 'front_lever',
  metric: 'hold_s',
  workingRange: { min: 5, max: 15 },
  trial: { sets: 3, target: 10 },
  straightArm: true,
  patterns: ['straight_arm_pull'],
});
const row = makeNode({ id: 'incline_row', branch: 'h_pull', patterns: ['horizontal_pull'] });
const skinTheCat = makeNode({ id: 'skin_the_cat', straightArm: true });
const nodes = new Map([lever, row, skinTheCat].map((node) => [node.id, node]));

describe('straight-arm Trial gate', () => {
  it('does not gate bent-arm nodes', () => {
    expect(trialOpensAt(row, undefined)).toBeUndefined();
    expect(isTrialOpenBySafeguards(row, undefined, 0)).toBe(true);
  });

  it('keeps an untrained straight-arm Trial closed (no test-out)', () => {
    expect(trialOpensAt(lever, undefined)).toBe(Infinity);
    expect(isTrialOpenBySafeguards(lever, {}, Number.MAX_SAFE_INTEGER)).toBe(false);
  });

  it(`opens ${MIN_WEEKS_AT_LEVEL} weeks after the first logged set`, () => {
    const progress = { firstTrainedAt: 1000 };
    const opensAt = 1000 + MIN_WEEKS_AT_LEVEL * MS_PER_WEEK;
    expect(trialOpensAt(lever, progress)).toBe(opensAt);
    expect(isTrialOpenBySafeguards(lever, progress, opensAt - 1)).toBe(false);
    expect(isTrialOpenBySafeguards(lever, progress, opensAt)).toBe(true);
  });
});

describe('straight-arm session budget', () => {
  it('counts hold seconds, and 2 s per unit for other metrics', () => {
    const sets = [
      makeSet({ nodeId: 'tuck_front_lever', metric: 'hold_s', actual: { value: 12 } }),
      makeSet({ nodeId: 'skin_the_cat', actual: { value: 5 } }),
      makeSet({ nodeId: 'incline_row', actual: { value: 10 } }),
      makeSet({ nodeId: 'unknown', actual: { value: 10 } }),
    ];
    expect(straightArmSecondsUsed(sets, nodes)).toBe(22);
    expect(remainingStraightArmBudget(sets, nodes)).toBe(STRAIGHT_ARM_SESSION_BUDGET_S - 22);
  });

  it('never goes below zero', () => {
    const sets = [1, 2, 3, 4].map(() =>
      makeSet({ nodeId: 'tuck_front_lever', metric: 'hold_s', actual: { value: 20 } }),
    );
    expect(remainingStraightArmBudget(sets, nodes)).toBe(0);
  });
});

describe('48 h rule', () => {
  const restMs = STRAIGHT_ARM_REST_HOURS * MS_PER_HOUR;

  it('finds the latest session with straight-arm work', () => {
    const sessions = [
      makeSession('a', 100, [{ nodeId: 'tuck_front_lever', count: 1, metric: 'hold_s' }]),
      makeSession('b', 300, [{ nodeId: 'incline_row', count: 3 }]),
      makeSession('c', 200, [{ nodeId: 'skin_the_cat', count: 1 }]),
    ];
    expect(lastStraightArmSessionAt(sessions, nodes)).toBe(200);
    expect(lastStraightArmSessionAt([sessions[1]], nodes)).toBeUndefined();
  });

  it('allows straight-arm work again after the rest period', () => {
    expect(isStraightArmRested(undefined, 0)).toBe(true);
    expect(isStraightArmRested(0, restMs - 1)).toBe(false);
    expect(isStraightArmRested(0, restMs)).toBe(true);
  });
});
