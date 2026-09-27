import {
  formatLevelProgress,
  formatOgLevel,
  formatPerformance,
  formatShortDate,
  formatTrial,
  formatWorkingRange,
  spokenOgLevel,
} from './format';

describe('formatPerformance', () => {
  it('words every metric', () => {
    expect(formatPerformance('reps', { value: 8 })).toBe('8 reps');
    expect(formatPerformance('reps', { value: 1 })).toBe('1 rep');
    expect(formatPerformance('hold_s', { value: 30 })).toBe('30 s');
    expect(formatPerformance('eccentric_s', { value: 5, reps: 3 })).toBe('3 × 5 s lowerings');
    expect(formatPerformance('eccentric_s', { value: 5 })).toBe('1 × 5 s lowering');
    expect(formatPerformance('load_xbw', { value: 0.5, reps: 5 })).toBe('5 reps at 0.50× BW');
  });
});

describe('formatTrial', () => {
  it('words a Trial standard', () => {
    expect(formatTrial('reps', { sets: 3, target: 8 })).toBe('3 sets of 8 reps');
    expect(formatTrial('hold_s', { sets: 1, target: 60 })).toBe('1 set of 60 s');
    expect(formatTrial('eccentric_s', { sets: 3, target: 5, reps: 3 })).toBe(
      '3 sets of 3 × 5 s lowerings',
    );
  });
});

describe('OG level labels', () => {
  it('calls level 0 a foundation node instead of "OG 0"', () => {
    expect(formatOgLevel(0)).toBe('Foundation');
    expect(spokenOgLevel(0)).toBe('foundation');
  });

  it('shows other levels as OG n', () => {
    expect(formatOgLevel(5)).toBe('OG 5');
    expect(spokenOgLevel(5)).toBe('OG level 5');
  });
});

describe('formatWorkingRange', () => {
  it('words every metric', () => {
    expect(formatWorkingRange('reps', { min: 5, max: 8 })).toBe('5–8 reps');
    expect(formatWorkingRange('reps', { min: 1, max: 1 })).toBe('1 rep');
    expect(formatWorkingRange('hold_s', { min: 10, max: 30 })).toBe('10–30 s');
    expect(formatWorkingRange('eccentric_s', { min: 3, max: 6 })).toBe('3–6 s lowerings');
    expect(formatWorkingRange('load_xbw', { min: 0.1, max: 0.3 })).toBe('0.10–0.30× BW');
  });
});

describe('formatShortDate', () => {
  it('shows day, month and year in local time', () => {
    expect(formatShortDate(new Date(2026, 8, 27, 18, 30).getTime())).toBe('27 Sep 2026');
    expect(formatShortDate(new Date(2027, 0, 3).getTime())).toBe('3 Jan 2027');
  });
});

describe('formatLevelProgress', () => {
  const base = {
    level: 3,
    xpIntoLevel: 12,
    xpForLevel: 36,
    fraction: 1 / 3,
    capped: false,
    banked: 0,
  };
  it('shows XP, the Trial cap and the max level', () => {
    expect(formatLevelProgress(base)).toBe('12 / 36 XP');
    expect(formatLevelProgress({ ...base, level: 5, capped: true })).toBe('Trial ready');
    expect(formatLevelProgress({ ...base, level: 10, xpIntoLevel: 0, xpForLevel: 0 })).toBe('Max');
  });
});
