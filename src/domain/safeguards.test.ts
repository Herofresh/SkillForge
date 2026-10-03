import { makeNode, makeSession, makeSet } from '@/data/testFixtures';
import {
  budgetExemptTrialSets,
  hasTendonWarning,
  isStraightArmRested,
  isTrialOpenBySafeguards,
  lastStraightArmSessionAt,
  MIN_WEEKS_AT_LEVEL,
  prerequisitesWarning,
  remainingStraightArmBudget,
  sessionSafeguardWarnings,
  STRAIGHT_ARM_REST_HOURS,
  STRAIGHT_ARM_SESSION_BUDGET_S,
  straightArmSecondsUsed,
  trialOpensAt,
  trialWarnings,
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
const planche = makeNode({
  id: 'tuck_planche',
  branch: 'planche',
  metric: 'hold_s',
  workingRange: { min: 10, max: 30 },
  trial: { sets: 3, target: 30 },
  straightArm: true,
  patterns: ['straight_arm_push'],
});
const nodes = new Map([lever, row, skinTheCat, planche].map((node) => [node.id, node]));
const trialHold = (nodeId: string, value: number) =>
  makeSet({ nodeId, metric: 'hold_s', actual: { value }, isTrial: true });

describe('straight-arm Trial clock (advisory since ADR-023)', () => {
  it('does not gate bent-arm nodes', () => {
    expect(trialOpensAt(row, undefined)).toBeUndefined();
    expect(isTrialOpenBySafeguards(row, undefined, 0)).toBe(true);
  });

  it('does not recommend a Trial on an untrained straight-arm node', () => {
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

  describe('Trial-day exception (ADR-025)', () => {
    const plancheTrial = [1, 2, 3].map(() => trialHold('tuck_planche', 30));

    it("does not count one straight-arm Trial's sets", () => {
      expect(budgetExemptTrialSets(plancheTrial, nodes).size).toBe(3);
      expect(straightArmSecondsUsed(plancheTrial, nodes)).toBe(0);
      expect(remainingStraightArmBudget(plancheTrial, nodes)).toBe(STRAIGHT_ARM_SESSION_BUDGET_S);
    });

    it('still counts other straight-arm work, a second Trial and extra Trial sets', () => {
      const extra = makeSet({
        nodeId: 'tuck_front_lever',
        metric: 'hold_s',
        actual: { value: 10 },
      });
      expect(straightArmSecondsUsed([...plancheTrial, extra], nodes)).toBe(10);
      const secondTrial = [trialHold('tuck_front_lever', 10), trialHold('tuck_front_lever', 10)];
      expect(straightArmSecondsUsed([...plancheTrial, ...secondTrial], nodes)).toBe(20);
      const fourth = trialHold('tuck_planche', 30);
      expect(straightArmSecondsUsed([...plancheTrial, fourth], nodes)).toBe(30);
    });

    it('ignores bent-arm Trials', () => {
      const rowTrial = makeSet({ nodeId: 'incline_row', isTrial: true });
      expect(budgetExemptTrialSets([rowTrial], nodes).size).toBe(0);
    });
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

describe('advisory warnings', () => {
  const restMs = STRAIGHT_ARM_REST_HOURS * MS_PER_HOUR;
  const hold = (value: number) =>
    makeSet({ nodeId: 'tuck_front_lever', metric: 'hold_s', actual: { value } });

  it('warns about an early straight-arm Trial, including a day-1 test-out', () => {
    expect(trialWarnings(row, undefined, 0)).toEqual([]);
    const [untrained] = trialWarnings(lever, undefined, 0);
    expect(untrained).toMatchObject({
      code: 'straight_arm_min_weeks',
      nodeId: 'tuck_front_lever',
      severity: 'warning',
    });
    expect(untrained.message).toContain(`${MIN_WEEKS_AT_LEVEL} weeks`);
    expect(trialWarnings(lever, { firstTrainedAt: 0 }, 1)).toHaveLength(1);
    expect(trialWarnings(lever, { firstTrainedAt: 0 }, MIN_WEEKS_AT_LEVEL * MS_PER_WEEK)).toEqual(
      [],
    );
  });

  it('warns when a session goes over the straight-arm budget', () => {
    const within = [hold(30), hold(30)];
    expect(sessionSafeguardWarnings(within, nodes, undefined, 0)).toEqual([]);
    const over = [...within, hold(1)];
    expect(sessionSafeguardWarnings(over, nodes, undefined, 0)).toEqual([
      expect.objectContaining({ code: 'straight_arm_budget', severity: 'warning' }),
    ]);
  });

  it('ignores the Trial sets but warns about extra straight-arm work in a Trial session', () => {
    const trial = [1, 2, 3].map(() => trialHold('tuck_planche', 30));
    expect(sessionSafeguardWarnings(trial, nodes, undefined, 0)).toEqual([]);
    const withinBudget = [...trial, hold(30), hold(30)];
    expect(sessionSafeguardWarnings(withinBudget, nodes, undefined, 0)).toEqual([]);
    const [over] = sessionSafeguardWarnings([...withinBudget, hold(5)], nodes, undefined, 0);
    expect(over).toMatchObject({ code: 'straight_arm_budget', severity: 'warning' });
    expect(over.message).toContain('65 s of straight-arm work besides the Trial');
  });

  it('keeps the 48 h rule for a Trial session', () => {
    const trial = [trialHold('tuck_planche', 30)];
    expect(sessionSafeguardWarnings(trial, nodes, 0, 1).map((w) => w.code)).toEqual([
      'straight_arm_rest',
    ]);
  });

  it('warns about straight-arm work within the rest period, and only then', () => {
    const codes = (sets: ReturnType<typeof hold>[], last: number | undefined, at: number) =>
      sessionSafeguardWarnings(sets, nodes, last, at).map((w) => w.code);
    expect(codes([hold(10)], 0, restMs - 1)).toEqual(['straight_arm_rest']);
    expect(codes([hold(10)], 0, restMs)).toEqual([]);
    const rowSet = makeSet({ nodeId: 'incline_row' });
    expect(codes([rowSet], 0, 1)).toEqual([]); // no straight-arm work in this session
  });

  it('describes unmet prerequisites as info', () => {
    const prereq = { nodeId: 'incline_row', minLevel: 5, kind: 'hard' as const };
    expect(prerequisitesWarning(lever, [], nodes)).toBeUndefined();
    expect(prerequisitesWarning(lever, [prereq], nodes)).toMatchObject({
      code: 'prerequisites_unmet',
      nodeId: 'tuck_front_lever',
      severity: 'info',
    });
  });
});

describe('hasTendonWarning', () => {
  it('is true for a tendon safeguard and false for the prerequisites note alone', () => {
    const note = { code: 'prerequisites_unmet', message: 'note', severity: 'info' } as const;
    const rest = { code: 'straight_arm_rest', message: 'rest', severity: 'warning' } as const;
    expect(hasTendonWarning([])).toBe(false);
    expect(hasTendonWarning([note])).toBe(false);
    expect(hasTendonWarning([note, rest])).toBe(true);
  });
});
