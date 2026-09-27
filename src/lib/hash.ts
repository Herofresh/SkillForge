const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/**
 * 32-bit FNV-1a hash of `text` as an unsigned integer. Stable across platforms and runs, so it can
 * turn a seed plus a key into a deterministic pseudo-random order (e.g. tie-breaks).
 */
export function hashString(text: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}
