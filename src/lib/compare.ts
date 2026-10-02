/**
 * Compares two strings by UTF-16 code units, e.g. ids used as a tie-break. Unlike `localeCompare`
 * it gives the same order on every engine and locale (Node in tests, Hermes on Android), so a
 * stored or displayed order never depends on the device. Not for sorting names for people.
 */
export function compareCodeUnits(a: string, b: string): number {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}
