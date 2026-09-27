import { makeSet } from '@/data/testFixtures';
import {
  classifyOutcome,
  COMPLETION_BONUS_RATIO,
  difficultyMult,
  exerciseXp,
  isSessionComplete,
  meetsTarget,
  nextStreak,
  OUTCOME_MULT,
  sessionXp,
  setUnits,
  STREAK_BONUS_MAX,
  STREAK_MAX_GAP_MS,
  streakBonusRatio,
} from '@/domain/xp';

describe('setUnits', () => {
  it('normalizes 1 rep = 2 s hold = 3 s eccentric', () => {
    expect(setUnits('reps', { value: 8 })).toBe(8);
    expect(setUnits('hold_s', { value: 20 })).toBe(10);
    expect(setUnits('eccentric_s', { value: 6, reps: 3 })).toBe(6);
  });

  it('treats a missing rep count as one lowering or rep', () => {
    expect(setUnits('eccentric_s', { value: 9 })).toBe(3);
    expect(setUnits('load_xbw', { value: 1.5 })).toBe(1.5);
  });

  it('scales load_xbw reps by the bodyweight multiple', () => {
    expect(setUnits('load_xbw', { value: 1.2, reps: 3 })).toBeCloseTo(3.6);
  });

  it('ignores the reps field for reps and holds, and clamps negatives', () => {
    expect(setUnits('reps', { value: 5, reps: 10 })).toBe(5);
    expect(setUnits('hold_s', { value: -4 })).toBe(0);
  });
});

describe('meetsTarget', () => {
  it('compares values', () => {
    expect(meetsTarget('reps', { value: 8 }, { value: 8 })).toBe(true);
    expect(meetsTarget('hold_s', { value: 9 }, { value: 10 })).toBe(false);
  });

  it('also requires the rep count for eccentric and loaded sets', () => {
    expect(meetsTarget('eccentric_s', { value: 5, reps: 3 }, { value: 5, reps: 3 })).toBe(true);
    expect(meetsTarget('eccentric_s', { value: 6, reps: 2 }, { value: 5, reps: 3 })).toBe(false);
    expect(meetsTarget('load_xbw', { value: 1.2, reps: 3 }, { value: 1.2, reps: 3 })).toBe(true);
  });
});

describe('difficultyMult', () => {
  it('grows with ogLevel', () => {
    expect(difficultyMult(0)).toBe(1);
    expect(difficultyMult(4)).toBe(2);
    expect(difficultyMult(17)).toBe(5.25);
    for (let level = 1; level <= 17; level++) {
      expect(difficultyMult(level)).toBeGreaterThan(difficultyMult(level - 1));
    }
  });
});

describe('classifyOutcome', () => {
  const node = 'push_up';

  it('is success when every set meets its prescription', () => {
    expect(
      classifyOutcome([
        makeSet({ nodeId: node }),
        makeSet({ nodeId: node, actual: { value: 10 } }),
      ]),
    ).toBe('success');
  });

  it('is partial when at least half of the prescribed units were done', () => {
    const sets = [
      makeSet({ nodeId: node }),
      makeSet({ nodeId: node, actual: { value: 4 } }),
      makeSet({ nodeId: node, actual: { value: 0 } }),
    ];
    expect(classifyOutcome(sets)).toBe('partial'); // 12 of 24
  });

  it('caps each set at its prescription so one big set cannot hide skipped ones', () => {
    const sets = [
      makeSet({ nodeId: node, actual: { value: 30 } }),
      makeSet({ nodeId: node, actual: { value: 0 } }),
      makeSet({ nodeId: node, actual: { value: 0 } }),
    ];
    expect(classifyOutcome(sets)).toBe('failed'); // counts 8 of 24
  });

  it('is failed for no sets', () => {
    expect(classifyOutcome([])).toBe('failed');
  });
});

describe('exerciseXp', () => {
  it('is units × difficulty × outcome', () => {
    const sets = [1, 2, 3].map(() => makeSet({ nodeId: 'push_up' }));
    expect(exerciseXp(sets, 4)).toEqual({ outcome: 'success', units: 24, xp: 48 });
  });

  it('still grants XP for a failed exercise', () => {
    const sets = [
      makeSet({ nodeId: 'pull_up', actual: { value: 2 } }),
      makeSet({ nodeId: 'pull_up', actual: { value: 1 } }),
    ];
    const result = exerciseXp(sets, 2); // 3 of 16 units
    expect(result.outcome).toBe('failed');
    expect(result.xp).toBe(Math.round(3 * 1.5 * OUTCOME_MULT.failed));
    expect(result.xp).toBeGreaterThan(0);
  });
});

describe('session bonuses', () => {
  it('detects a complete session', () => {
    expect(isSessionComplete([makeSet({ nodeId: 'a' })])).toBe(true);
    expect(isSessionComplete([makeSet({ nodeId: 'a', actual: { value: 0 } })])).toBe(false);
    expect(isSessionComplete([])).toBe(false);
  });

  it('continues a streak within the gap and restarts after it', () => {
    expect(nextStreak(0, undefined, 1000)).toBe(1);
    expect(nextStreak(3, 0, STREAK_MAX_GAP_MS)).toBe(4);
    expect(nextStreak(3, 0, STREAK_MAX_GAP_MS + 1)).toBe(1);
  });

  it('caps the streak bonus', () => {
    expect(streakBonusRatio(1)).toBe(0);
    expect(streakBonusRatio(3)).toBeCloseTo(0.1);
    expect(streakBonusRatio(100)).toBe(STREAK_BONUS_MAX);
  });

  it('adds completion and streak bonuses to exercise XP', () => {
    expect(sessionXp([60, 40], true, 3)).toEqual({
      exerciseXp: 100,
      completionBonus: 100 * COMPLETION_BONUS_RATIO,
      streakBonus: 10,
      total: 120,
    });
    expect(sessionXp([60, 40], false, 1)).toEqual({
      exerciseXp: 100,
      completionBonus: 0,
      streakBonus: 0,
      total: 100,
    });
  });
});
