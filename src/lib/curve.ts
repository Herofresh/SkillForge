/**
 * Cumulative thresholds of a geometric level curve: reaching level 1 costs nothing, and each further
 * level costs `growth` times the previous step, starting at `base`. Values are rounded to integers.
 *
 * `geometricThresholds(20, 1.5, 4)` → `[0, 20, 50, 95]` (index = level − 1).
 */
export function geometricThresholds(base: number, growth: number, maxLevel: number): number[] {
  if (base <= 0 || growth < 1 || !Number.isInteger(maxLevel) || maxLevel < 1) {
    throw new RangeError('geometricThresholds: need base > 0, growth >= 1, integer maxLevel >= 1');
  }
  const thresholds = [0];
  let step = base;
  let total = 0;
  for (let level = 2; level <= maxLevel; level++) {
    total += step;
    thresholds.push(Math.round(total));
    step *= growth;
  }
  return thresholds;
}

/** Highest level (1-based) whose threshold `value` has reached. `thresholds` must be ascending. */
export function levelForThresholds(value: number, thresholds: readonly number[]): number {
  let level = 1;
  for (let index = 1; index < thresholds.length; index++) {
    if (value >= thresholds[index]) level = index + 1;
    else break;
  }
  return level;
}
