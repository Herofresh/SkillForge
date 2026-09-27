/**
 * XP rules (PLAN 2.1, ADR-018). Every XP constant lives here; tune them here only.
 *
 * Pipeline: a set's volume is normalized to units (`setUnits`), the sets of one node in one session
 * form an exercise whose outcome is judged against the prescription (`classifyOutcome`), and the
 * exercise earns `units × difficultyMult(ogLevel) × outcomeMult` (`exerciseXp`). A session adds a
 * completion bonus and a streak bonus on top (`sessionXp`).
 */
import { MS_PER_HOUR } from '@/lib/time';

import type { LoggedSet, Metric, Outcome, SetPerformance } from './types';

/** 1 unit = 1 rep = 2 s of hold = 3 s of eccentric lowering. */
export const HOLD_SECONDS_PER_UNIT = 2;
export const ECCENTRIC_SECONDS_PER_UNIT = 3;
/**
 * `load_xbw`: 1 unit = 1 rep at 1× bodyweight, so a set is `reps × load` units
 * (3 reps at 1.2×BW = 3.6 units). Load scales the reps linearly, like a heavier variation would.
 */
export const LOAD_UNITS_PER_BODYWEIGHT_REP = 1;

/** difficultyMult = 1 + 0.25 × ogLevel: 1.0 at a foundation node, 2.0 at OG 4, 5.25 at OG 17. */
export const DIFFICULTY_BASE = 1;
export const DIFFICULTY_PER_OG_LEVEL = 0.25;

export const OUTCOME_MULT: Readonly<Record<Outcome, number>> = {
  success: 1.0,
  partial: 0.6,
  failed: 0.3,
};
/** An exercise is `partial` (not `failed`) when it reached at least this share of prescribed units. */
export const PARTIAL_MIN_RATIO = 0.5;

/** Completion bonus: +10 % of the session's exercise XP when no set was skipped. */
export const COMPLETION_BONUS_RATIO = 0.1;
/** Sessions at most 72 h apart continue a streak (rest days are part of training). */
export const STREAK_MAX_GAP_MS = 72 * MS_PER_HOUR;
/** Streak bonus: +5 % per consecutive session after the first, at most +25 %. */
export const STREAK_BONUS_PER_SESSION = 0.05;
export const STREAK_BONUS_MAX = 0.25;

const repsOf = (performance: SetPerformance): number => performance.reps ?? 1;

/** Normalized volume of one set (see the unit constants above). Negative input counts as 0. */
export function setUnits(metric: Metric, performance: SetPerformance): number {
  const value = Math.max(0, performance.value);
  switch (metric) {
    case 'reps':
      return value;
    case 'hold_s':
      return value / HOLD_SECONDS_PER_UNIT;
    case 'eccentric_s':
      return (repsOf(performance) * value) / ECCENTRIC_SECONDS_PER_UNIT;
    case 'load_xbw':
      return repsOf(performance) * value * LOAD_UNITS_PER_BODYWEIGHT_REP;
  }
}

/**
 * Whether `actual` meets `target`: the value is reached and, for `eccentric_s` and `load_xbw`, so is
 * the number of lowerings or reps. Shared by outcome classification and Trial evaluation.
 */
export function meetsTarget(
  metric: Metric,
  actual: SetPerformance,
  target: SetPerformance,
): boolean {
  if (actual.value < target.value) return false;
  if (metric === 'eccentric_s' || metric === 'load_xbw') {
    return repsOf(actual) >= repsOf(target);
  }
  return true;
}

export function difficultyMult(ogLevel: number): number {
  return DIFFICULTY_BASE + DIFFICULTY_PER_OG_LEVEL * Math.max(0, ogLevel);
}

/**
 * Judges one exercise (the sets of one node in one session) against its prescription:
 * - `success`: every set met its prescribed target;
 * - `partial`: not all did, but the achieved units (each set counted up to its prescription) reach
 *   `PARTIAL_MIN_RATIO` of the prescribed units;
 * - `failed`: anything less, including no sets.
 */
export function classifyOutcome(sets: readonly LoggedSet[]): Outcome {
  if (sets.length === 0) return 'failed';
  if (sets.every((set) => meetsTarget(set.metric, set.actual, set.prescribed))) return 'success';
  let prescribedUnits = 0;
  let achievedUnits = 0;
  for (const set of sets) {
    const prescribed = setUnits(set.metric, set.prescribed);
    prescribedUnits += prescribed;
    achievedUnits += Math.min(setUnits(set.metric, set.actual), prescribed);
  }
  if (prescribedUnits === 0) return 'partial';
  return achievedUnits / prescribedUnits >= PARTIAL_MIN_RATIO ? 'partial' : 'failed';
}

export interface ExerciseXp {
  outcome: Outcome;
  /** Units actually performed (not capped at the prescription). */
  units: number;
  /** Rounded to a whole number. */
  xp: number;
}

/** XP of one exercise: `units × difficultyMult(ogLevel) × outcomeMult`. A failed attempt still earns XP. */
export function exerciseXp(sets: readonly LoggedSet[], ogLevel: number): ExerciseXp {
  const outcome = classifyOutcome(sets);
  const units = sets.reduce((sum, set) => sum + setUnits(set.metric, set.actual), 0);
  const xp = Math.round(units * difficultyMult(ogLevel) * OUTCOME_MULT[outcome]);
  return { outcome, units, xp };
}

/** A session is complete when it has sets and none was skipped (`actual.value > 0`). */
export function isSessionComplete(sets: readonly LoggedSet[]): boolean {
  return sets.length > 0 && sets.every((set) => set.actual.value > 0);
}

/**
 * Streak length including the session starting at `startedAt`: one more than `previousStreak` when
 * the previous session started at most `STREAK_MAX_GAP_MS` earlier, otherwise 1.
 */
export function nextStreak(
  previousStreak: number,
  previousSessionAt: number | undefined,
  startedAt: number,
): number {
  if (previousSessionAt === undefined) return 1;
  return startedAt - previousSessionAt <= STREAK_MAX_GAP_MS ? previousStreak + 1 : 1;
}

export function streakBonusRatio(streak: number): number {
  return Math.min(STREAK_BONUS_MAX, STREAK_BONUS_PER_SESSION * Math.max(0, streak - 1));
}

export interface SessionXp {
  /** Sum of exercise XP (this is also what the nodes receive). */
  exerciseXp: number;
  completionBonus: number;
  streakBonus: number;
  /** Character XP earned: exercise XP + both bonuses. */
  total: number;
}

/** Session XP = exercise XP + completion bonus + streak bonus (bonuses rounded to whole XP). */
export function sessionXp(
  exerciseXps: readonly number[],
  complete: boolean,
  streak: number,
): SessionXp {
  const base = exerciseXps.reduce((sum, xp) => sum + xp, 0);
  const completionBonus = complete ? Math.round(base * COMPLETION_BONUS_RATIO) : 0;
  const streakBonus = Math.round(base * streakBonusRatio(streak));
  return {
    exerciseXp: base,
    completionBonus,
    streakBonus,
    total: base + completionBonus + streakBonus,
  };
}
