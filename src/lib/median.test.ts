import { median } from '@/lib/median';

describe('median', () => {
  it('takes the middle value of an odd list', () => {
    expect(median([5, 1, 3])).toBe(3);
  });

  it('averages the two middle values of an even list', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('does not mutate the input and rejects an empty list', () => {
    const values = [3, 1, 2];
    median(values);
    expect(values).toEqual([3, 1, 2]);
    expect(() => median([])).toThrow(RangeError);
  });
});
