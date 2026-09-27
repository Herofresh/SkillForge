import { formatPerformance, formatTrial } from './format';

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
