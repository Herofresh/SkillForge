/**
 * Plain-language text for prescriptions and Trials (shared by onboarding, node detail and the Train
 * flow). Pure, so the wording is tested once and screens never build it themselves.
 */
import type { NodeLevelProgress } from './progression';
import type { Metric, SetPerformance, Trial, WorkingRange } from './types';

/** Load values are shown with two decimals (0.05 × BW steps). */
const LOAD_DECIMALS = 2;

/** One set, e.g. "8 reps", "30 s", "3 × 5 s lowerings", "5 reps at 0.50× BW". */
export function formatPerformance(metric: Metric, performance: SetPerformance): string {
  const reps = performance.reps ?? 1;
  switch (metric) {
    case 'reps':
      return `${performance.value} ${performance.value === 1 ? 'rep' : 'reps'}`;
    case 'hold_s':
      return `${performance.value} s`;
    case 'eccentric_s':
      return `${reps} × ${performance.value} s ${reps === 1 ? 'lowering' : 'lowerings'}`;
    case 'load_xbw':
      return `${reps} ${reps === 1 ? 'rep' : 'reps'} at ${performance.value.toFixed(LOAD_DECIMALS)}× BW`;
  }
}

/** A Trial standard, e.g. "3 sets of 8 reps" or "3 sets of 30 s". */
export function formatTrial(metric: Metric, trial: Trial): string {
  const perSet = formatPerformance(metric, {
    value: trial.target,
    ...(trial.reps !== undefined ? { reps: trial.reps } : {}),
  });
  return `${trial.sets} ${trial.sets === 1 ? 'set' : 'sets'} of ${perSet}`;
}

/** The unit shown next to a stepper for the metric's main value. */
export const METRIC_UNITS: Readonly<Record<Metric, string>> = {
  reps: 'reps',
  hold_s: 's',
  eccentric_s: 's',
  load_xbw: '× BW',
};

/** What a metric measures, as the node editor names it (PLAN 4.7). */
export const METRIC_LABELS: Readonly<Record<Metric, string>> = {
  reps: 'Reps',
  hold_s: 'Hold',
  eccentric_s: 'Slow lowering',
  load_xbw: 'Weighted',
};

/** OG level 0 marks a foundation node below the OG2 chart (see the progressions overview). */
export const FOUNDATION_OG_LEVEL = 0;

/**
 * The OG level as a short tag: "Foundation" for level 0, else "Tier 5". The UI calls the
 * Overcoming Gravity level "tier" (ADR-065); `ogLevel` stays the internal name. Not to be confused
 * with the Beginner–Elite band of `tierForOgLevel` or the hero class tiers I–III.
 */
export function formatOgLevel(ogLevel: number): string {
  return ogLevel === FOUNDATION_OG_LEVEL ? 'Foundation' : `Tier ${ogLevel}`;
}

/** The OG level for screen readers: "foundation" for level 0, else "tier 5". */
export function spokenOgLevel(ogLevel: number): string {
  return ogLevel === FOUNDATION_OG_LEVEL ? 'foundation' : `tier ${ogLevel}`;
}

/**
 * A working range, e.g. "5–8 reps", "10–30 s", "3–6 s lowerings" or "0.10–0.30× BW". Equal ends
 * show one value.
 */
export function formatWorkingRange(metric: Metric, range: WorkingRange): string {
  const value = (n: number) => (metric === 'load_xbw' ? n.toFixed(LOAD_DECIMALS) : String(n));
  const span =
    range.min === range.max ? value(range.min) : `${value(range.min)}–${value(range.max)}`;
  switch (metric) {
    case 'reps':
      return `${span} ${range.max === 1 ? 'rep' : 'reps'}`;
    case 'hold_s':
      return `${span} s`;
    case 'eccentric_s':
      return `${span} s lowerings`;
    case 'load_xbw':
      return `${span}× BW`;
  }
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** A day in the device's time zone, e.g. "27 Sep 2026" (history lists). */
export function formatShortDate(at: number): string {
  const date = new Date(at);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** The value next to a node's XP bar: "34 / 60 XP", "Trial ready" at the cap, "Max" at level 10. */
export function formatLevelProgress(progress: NodeLevelProgress): string {
  if (progress.capped) return 'Trial ready';
  if (progress.xpForLevel === 0) return 'Max';
  return `${progress.xpIntoLevel} / ${progress.xpForLevel} XP`;
}

/** A prescription, e.g. "3 × 8 reps" or "1 × 30 s". */
export function formatPrescription(metric: Metric, sets: number, target: SetPerformance): string {
  return `${sets} × ${formatPerformance(metric, target)}`;
}

const SECONDS_PER_MINUTE = 60;

/** A countdown as "m:ss", e.g. "1:05" (negative counts as 0). */
export function formatCountdown(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const rest = whole % SECONDS_PER_MINUTE;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

const MINUTES_PER_HOUR = 60;

/**
 * Elapsed or measured time as a clock, rounded down to whole seconds: "0:42", "12:05", and from an
 * hour on "1:02:05" (set durations, the session clock, session times; PLAN 5.4).
 */
export function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const totalMinutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const secs = String(whole % SECONDS_PER_MINUTE).padStart(2, '0');
  if (totalMinutes < MINUTES_PER_HOUR) return `${totalMinutes}:${secs}`;
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = String(totalMinutes % MINUTES_PER_HOUR).padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
}

/** Rest after each set, e.g. "90 s rest" or "3 min rest" (whole minutes from 2 min on). */
export function formatRest(seconds: number): string {
  if (seconds >= 2 * SECONDS_PER_MINUTE && seconds % SECONDS_PER_MINUTE === 0) {
    return `${seconds / SECONDS_PER_MINUTE} min rest`;
  }
  return `${seconds} s rest`;
}

/** Shown for a user node saved before descriptions existed (PLAN 6.2, ADR-049). */
export const NO_DESCRIPTION_TEXT = 'No description yet. Edit this exercise to add one.';

/** A node's description, or `NO_DESCRIPTION_TEXT` when it has none. */
export function formatDescription(description: string): string {
  return description.trim() === '' ? NO_DESCRIPTION_TEXT : description;
}
