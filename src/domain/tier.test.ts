import { tierForOgLevel } from '@/domain/tier';

describe('tierForOgLevel', () => {
  it.each([
    [0, 'beginner'],
    [5, 'beginner'],
    [6, 'intermediate'],
    [8, 'intermediate'],
    [9, 'advanced'],
    [12, 'advanced'],
    [13, 'elite'],
    [17, 'elite'],
  ])('maps ogLevel %i to %s', (level, tier) => {
    expect(tierForOgLevel(level)).toBe(tier);
  });
});
