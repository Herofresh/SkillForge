/** Radix for compact ids (digits + lowercase letters). */
const ID_RADIX = 36;
const RANDOM_ID_LENGTH = 8;

/**
 * A new unique-enough id for locally created records (sessions, user actions, profiles): the time in
 * base 36 plus random characters. There is one writer (this device), so no coordination is needed.
 */
export function createId(now: number = Date.now()): string {
  const random = Math.random()
    .toString(ID_RADIX)
    .slice(2, 2 + RANDOM_ID_LENGTH)
    .padEnd(RANDOM_ID_LENGTH, '0');
  return `${now.toString(ID_RADIX)}-${random}`;
}
