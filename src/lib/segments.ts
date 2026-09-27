import { clamp } from './clamp';

/**
 * How many of `count` bar segments to light for a fill of `fraction` (0–1). A bar is only full at
 * 100 % and only empty at 0 %: any progress lights at least one segment and anything short of done
 * leaves at least one dark, so a segmented XP bar never hides a small gain or fakes a level-up.
 */
export function litSegments(fraction: number, count: number): number {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError(`litSegments: count must be a positive integer, got ${count}`);
  }
  if (!(fraction > 0)) return 0; // also catches NaN
  if (fraction >= 1) return count;
  if (count === 1) return 0;
  return clamp(Math.floor(fraction * count), 1, count - 1);
}
