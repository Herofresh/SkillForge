/**
 * Checks for values read back from SQLite. The database is written only by this app, so a failure
 * means corrupt or foreign data: it throws instead of guessing (validate at the boundary, AGENT.md §2).
 */

/** `value` as a member of `allowed`, or an error naming the column. */
export function oneOf<T extends string>(allowed: readonly T[], value: string, column: string): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`Unexpected value '${value}' in column ${column}`);
  }
  return value as T;
}

/** Drops `null` (SQL NULL) so optional domain fields stay absent instead of `null`. */
export function optional<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}
