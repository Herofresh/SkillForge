import { compareCodeUnits } from '@/lib/compare';

describe('compareCodeUnits', () => {
  it('orders by code unit, not by locale', () => {
    expect(compareCodeUnits('user_B', 'user_a')).toBe(-1); // localeCompare: 1
    expect(compareCodeUnits('user_a9', 'user_a_b')).toBe(-1); // localeCompare: 1
    expect(compareCodeUnits('user_a_b', 'user_ab')).toBe(-1);
  });

  it('is 0 for equal strings and antisymmetric', () => {
    expect(compareCodeUnits('pull_up', 'pull_up')).toBe(0);
    expect(compareCodeUnits('user_a', 'user_B')).toBe(1);
  });
});
