/** Time unit constants. Timestamps in SkillForge are milliseconds since the Unix epoch. */
export const MS_PER_SECOND = 1000;
export const MS_PER_HOUR = 60 * 60 * MS_PER_SECOND;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MS_PER_WEEK = 7 * MS_PER_DAY;

/** The wall clock, for UI event handlers (the store takes its own injectable clock). */
export const currentTime = (): number => Date.now();

/** Days from Monday for `Date.getDay()` (0 = Sunday … 6 = Saturday). */
const daysSinceMonday = (day: number): number => (day + 6) % 7;
const DAYS_PER_WEEK = 7;

/**
 * The calendar week around `at` in the device's time zone: Monday 00:00 (inclusive) to the next
 * Monday 00:00 (exclusive). Calendar arithmetic, so a week with a DST change is 167 or 169 hours
 * long (weekly class challenge, PLAN 6.9b).
 */
export function localWeekBounds(at: number): { start: number; end: number } {
  const start = new Date(at);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysSinceMonday(start.getDay()));
  const end = new Date(start);
  end.setDate(end.getDate() + DAYS_PER_WEEK);
  return { start: start.getTime(), end: end.getTime() };
}

/**
 * Whether two timestamps fall on the same calendar day in the device's time zone (the widget's
 * "trained today", PLAN 6.6).
 */
export function isSameLocalDay(a: number, b: number): boolean {
  const first = new Date(a);
  const second = new Date(b);
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

/** Midnight (local time) of the day `at` falls on. */
function localMidnight(at: number): number {
  const date = new Date(at);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Calendar days from `from` to `to` in the device's time zone: 0 on the same day, 1 for
 * yesterday → today, whatever the hours (the companion's mood, PLAN 6.10). Rounded, so a
 * daylight-saving day of 23 or 25 hours still counts as one.
 */
export function localDaysBetween(from: number, to: number): number {
  return Math.round((localMidnight(to) - localMidnight(from)) / MS_PER_DAY);
}
