import { litSegments } from './segments';

describe('litSegments', () => {
  it('is empty at 0 and full at 1 (and beyond)', () => {
    expect(litSegments(0, 10)).toBe(0);
    expect(litSegments(-0.5, 10)).toBe(0);
    expect(litSegments(Number.NaN, 10)).toBe(0);
    expect(litSegments(1, 10)).toBe(10);
    expect(litSegments(1.7, 10)).toBe(10);
  });

  it('floors partial progress', () => {
    expect(litSegments(0.55, 10)).toBe(5);
    expect(litSegments(0.3, 8)).toBe(2);
  });

  it('lights one segment for any gain and never shows full before 100 %', () => {
    expect(litSegments(0.01, 10)).toBe(1);
    expect(litSegments(0.999, 10)).toBe(9);
  });

  it('treats a single segment as done-or-not', () => {
    expect(litSegments(0.9, 1)).toBe(0);
    expect(litSegments(1, 1)).toBe(1);
  });

  it('rejects a non-positive or fractional count', () => {
    expect(() => litSegments(0.5, 0)).toThrow(RangeError);
    expect(() => litSegments(0.5, 2.5)).toThrow(RangeError);
  });
});
