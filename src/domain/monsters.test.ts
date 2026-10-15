import {
  BRANCH_MONSTERS,
  foeCount,
  foeDamage,
  foeHp,
  foeState,
  MONSTER_KINDS,
  tapDown,
  tapLogs,
} from './monsters';
import { BRANCHES } from './types';

describe('BRANCH_MONSTERS', () => {
  it('gives every branch a monster and uses every kind', () => {
    for (const branch of BRANCHES) expect(MONSTER_KINDS).toContain(BRANCH_MONSTERS[branch]);
    expect(new Set(Object.values(BRANCH_MONSTERS))).toEqual(new Set(MONSTER_KINDS));
  });
});

describe('foeState and foeHp', () => {
  it('reads a rep set against its target', () => {
    const target = { value: 5 };
    expect(foeState('reps', { value: 7 }, target)).toBe('overkill');
    expect(foeState('reps', { value: 5 }, target)).toBe('defeated');
    expect(foeState('reps', { value: 3 }, target)).toBe('wounded');
    expect(foeState('reps', { value: 0 }, target)).toBe('escaped');
    expect(foeHp('reps', { value: 5 }, target)).toBe(0);
    expect(foeHp('reps', { value: 3 }, target)).toBeCloseTo(0.4);
    expect(foeHp('reps', { value: 0 }, target)).toBe(1);
  });

  it('counts lowerings for eccentric sets', () => {
    const target = { value: 5, reps: 3 };
    expect(foeState('eccentric_s', { value: 5, reps: 3 }, target)).toBe('defeated');
    expect(foeState('eccentric_s', { value: 5, reps: 4 }, target)).toBe('overkill');
    expect(foeState('eccentric_s', { value: 5, reps: 2 }, target)).toBe('wounded');
    expect(foeHp('eccentric_s', { value: 5, reps: 2 }, target)).toBeCloseTo(1 / 3);
  });

  it('reads holds by their seconds', () => {
    expect(foeState('hold_s', { value: 35 }, { value: 30 })).toBe('overkill');
    expect(foeState('hold_s', { value: 20 }, { value: 30 })).toBe('wounded');
  });
});

describe('tapDown', () => {
  it('takes one rep off, then removes the set below zero', () => {
    expect(tapDown('reps', { value: 5 })).toEqual({ value: 4 });
    expect(tapDown('reps', { value: 1 })).toEqual({ value: 0 });
    expect(tapDown('reps', { value: 0 })).toBeUndefined();
  });

  it('takes one lowering or rep off eccentric and load sets', () => {
    expect(tapDown('eccentric_s', { value: 5, reps: 3 })).toEqual({ value: 5, reps: 2 });
    expect(tapDown('load_xbw', { value: 1.2, reps: 1 })).toEqual({ value: 0, reps: 0 });
    expect(tapDown('load_xbw', { value: 0, reps: 0 })).toBeUndefined();
  });

  it('leaves holds to the timer and the edit sheet', () => {
    expect(tapLogs('hold_s')).toBe(false);
    expect(tapLogs('reps')).toBe(true);
  });
});

describe('foeCount and foeDamage', () => {
  it('shows reps, seconds or lowerings', () => {
    expect(foeCount('reps', { value: 8 })).toBe('8');
    expect(foeCount('hold_s', { value: 30 })).toBe('30s');
    expect(foeCount('eccentric_s', { value: 5, reps: 3 })).toBe('3');
    expect(foeDamage('reps', { value: 8 })).toBe('-8');
  });
});
