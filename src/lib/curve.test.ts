import { geometricThresholds, levelForThresholds } from '@/lib/curve';

describe('geometricThresholds', () => {
  it('starts at 0 and grows geometrically', () => {
    expect(geometricThresholds(20, 1.5, 4)).toEqual([0, 20, 50, 95]);
  });

  it('supports a flat curve and a single level', () => {
    expect(geometricThresholds(10, 1, 3)).toEqual([0, 10, 20]);
    expect(geometricThresholds(10, 2, 1)).toEqual([0]);
  });

  it('rejects bad parameters', () => {
    expect(() => geometricThresholds(0, 1.5, 3)).toThrow(RangeError);
    expect(() => geometricThresholds(10, 0.9, 3)).toThrow(RangeError);
    expect(() => geometricThresholds(10, 1.5, 0)).toThrow(RangeError);
    expect(() => geometricThresholds(10, 1.5, 2.5)).toThrow(RangeError);
  });
});

describe('levelForThresholds', () => {
  const thresholds = [0, 20, 50, 95];

  it.each([
    [0, 1],
    [19, 1],
    [20, 2],
    [49.9, 2],
    [50, 3],
    [95, 4],
    [10_000, 4],
  ])('value %d is level %i', (value, level) => {
    expect(levelForThresholds(value, thresholds)).toBe(level);
  });
});
