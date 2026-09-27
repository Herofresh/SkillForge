/** Median of `values` (mean of the two middle values for an even count). Throws on an empty list. */
export function median(values: readonly number[]): number {
  if (values.length === 0) throw new RangeError('median: needs at least one value');
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
