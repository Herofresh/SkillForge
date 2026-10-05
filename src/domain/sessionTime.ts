/**
 * How long a planned session takes (PLAN 6.15, ADR-063): the per-set work, the prescribed rest and
 * the user's own rest pace. Pure; the generator plans with it and the plan preview shows it.
 *
 * Rest pace: the live session lets the user skip or shorten every rest (ADR-034), so a plan that
 * assumes the full rest can be far longer than the session the user actually trains. The pace is
 * the median of "rest actually taken ÷ rest prescribed" over the latest sessions, read from the
 * logged sets' timestamps; the plan then counts `restSec × pace` per set.
 */
import { clamp } from '@/lib/clamp';
import { MS_PER_SECOND } from '@/lib/time';

import { compareHistory } from './recompute';
import type {
  LoggedSession,
  LoggedSet,
  Metric,
  NodeLookup,
  PlannedExercise,
  SetPerformance,
} from './types';

/**
 * Rest after each set: inside a pair (alternate the two exercises), otherwise, in the warm-up and
 * in the cool-down (stretches and mobility, ADR-063; it was the single rest before).
 */
export const PAIR_REST_SEC = 90;
export const SINGLE_REST_SEC = 180;
export const WARM_UP_REST_SEC = 30;
export const COOL_DOWN_REST_SEC = 30;
/** Time estimate: seconds per rep and per exercise for setting up. */
export const SECONDS_PER_REP = 3;
export const TRANSITION_SEC = 30;

/** The rest pace of a user who rests exactly as prescribed (and of a user without history). */
export const DEFAULT_REST_PACE = 1;
/** The pace is measured over this many latest sessions that have measurable rests. */
export const PACE_SESSIONS = 5;
/** With fewer measured rests than this, the plan counts the prescribed rest. */
export const PACE_MIN_RESTS = 4;
/** The measured pace is kept inside these bounds (logging all sets at the end reads as ~0). */
export const PACE_MIN = 0.2;
export const PACE_MAX = 1.5;

/** Estimated seconds of work for one set of `target`. */
export function workSeconds(metric: Metric, target: SetPerformance): number {
  const reps = target.reps ?? 1;
  switch (metric) {
    case 'reps':
      return target.value * SECONDS_PER_REP;
    case 'hold_s':
      return target.value;
    case 'eccentric_s':
      return reps * target.value;
    case 'load_xbw':
      return reps * SECONDS_PER_REP;
  }
}

/** Estimated seconds of one set of `exercise` with the rest after it, at `pace`. */
export function setSeconds(exercise: PlannedExercise, pace: number = DEFAULT_REST_PACE): number {
  return workSeconds(exercise.metric, exercise.target) + exercise.restSec * pace;
}

/** Estimated seconds for one exercise: setup + each set's work and the rest after it, at `pace`. */
export function exerciseSeconds(
  exercise: PlannedExercise,
  pace: number = DEFAULT_REST_PACE,
): number {
  return TRANSITION_SEC + exercise.sets * setSeconds(exercise, pace);
}

/** Estimated whole minutes of `exercises` at `pace`. */
export function estimateMinutes(
  exercises: readonly PlannedExercise[],
  pace: number = DEFAULT_REST_PACE,
): number {
  const seconds = exercises.reduce((sum, exercise) => sum + exerciseSeconds(exercise, pace), 0);
  return Math.ceil(seconds / 60);
}

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * The rest the generator prescribed before `sets[index]`, read from the set order: the same node
 * again is a single exercise (`SINGLE_REST_SEC`), alternating with a partner is a pair
 * (`PAIR_REST_SEC`). Anything else is a change of exercise (rest + setup), not measured.
 */
function prescribedRestBefore(sets: readonly LoggedSet[], index: number): number | undefined {
  const previous = sets[index - 1];
  const current = sets[index];
  if (current.nodeId === previous.nodeId) return SINGLE_REST_SEC;
  const alternates =
    sets[index - 2]?.nodeId === current.nodeId || sets[index + 1]?.nodeId === previous.nodeId;
  return alternates ? PAIR_REST_SEC : undefined;
}

/**
 * Not measured: Trial sets (a test-out or the onboarding assessment logs them all at once) and
 * mobility work (its rest was the single rest before 6.15 and is the cool-down rest since, so the
 * set order alone can't tell which one was prescribed).
 */
const isMeasured = (set: LoggedSet, lookup: NodeLookup): boolean =>
  !set.isTrial && !(lookup.get(set.nodeId)?.patterns.includes('mobility') ?? false);

/** "Rest taken ÷ rest prescribed" for every measurable rest of `session`. */
function restRatios(session: LoggedSession, lookup: NodeLookup): number[] {
  const sets = [...session.sets].sort((a, b) => a.setIndex - b.setIndex);
  const ratios: number[] = [];
  for (let index = 1; index < sets.length; index++) {
    if (!isMeasured(sets[index], lookup)) continue;
    const prescribed = prescribedRestBefore(sets, index);
    if (prescribed === undefined) continue;
    const current = sets[index];
    const gap = (current.timestamp - sets[index - 1].timestamp) / MS_PER_SECOND;
    const work = current.durationSec ?? workSeconds(current.metric, current.actual);
    ratios.push(Math.max(0, gap - work) / prescribed);
  }
  return ratios;
}

/**
 * The user's rest pace from `sessions`: the median rest ratio over the latest `PACE_SESSIONS`
 * sessions with measurable rests, inside [`PACE_MIN`, `PACE_MAX`]. `DEFAULT_REST_PACE` with fewer
 * than `PACE_MIN_RESTS` measured rests.
 */
export function restPace(sessions: readonly LoggedSession[], lookup: NodeLookup): number {
  const measured = [...sessions]
    .sort(compareHistory)
    .map((session) => restRatios(session, lookup))
    .filter((ratios) => ratios.length > 0)
    .slice(-PACE_SESSIONS)
    .flat();
  if (measured.length < PACE_MIN_RESTS) return DEFAULT_REST_PACE;
  return clamp(median(measured), PACE_MIN, PACE_MAX);
}
