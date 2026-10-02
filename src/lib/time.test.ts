import { isSameLocalDay } from './time';

describe('isSameLocalDay', () => {
  const local = (day: number, hour: number, minute = 0) =>
    new Date(2026, 9, day, hour, minute).getTime();

  it('is true within one local calendar day', () => {
    expect(isSameLocalDay(local(2, 0, 0), local(2, 23, 59))).toBe(true);
  });

  it('is false across local midnight, however close', () => {
    expect(isSameLocalDay(local(2, 23, 59), local(3, 0, 0))).toBe(false);
  });

  it('is false for the same day of another month or year', () => {
    expect(isSameLocalDay(local(2, 12), new Date(2026, 10, 2, 12).getTime())).toBe(false);
    expect(isSameLocalDay(local(2, 12), new Date(2025, 9, 2, 12).getTime())).toBe(false);
  });
});
