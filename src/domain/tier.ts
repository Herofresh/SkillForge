import type { Tier } from './types';

/** Lowest ogLevel of each tier above beginner (ADR-007). Beginner covers 0–5. */
export const INTERMEDIATE_MIN_OG_LEVEL = 6;
export const ADVANCED_MIN_OG_LEVEL = 9;
export const ELITE_MIN_OG_LEVEL = 13;

/** Tier is derived from ogLevel, never stored, so the two can't disagree. */
export function tierForOgLevel(ogLevel: number): Tier {
  if (ogLevel >= ELITE_MIN_OG_LEVEL) return 'elite';
  if (ogLevel >= ADVANCED_MIN_OG_LEVEL) return 'advanced';
  if (ogLevel >= INTERMEDIATE_MIN_OG_LEVEL) return 'intermediate';
  return 'beginner';
}
