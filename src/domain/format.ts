/**
 * Plain-language text for prescriptions and Trials (shared by onboarding, node detail and the Train
 * flow). Pure, so the wording is tested once and screens never build it themselves.
 */
import { k, t } from '@/i18n';

import type { NodeLevelProgress } from './progression';
import type { Metric, SetPerformance, Trial, WorkingRange } from './types';
import type { XpShareKind } from './xp';

/** Load values are shown with two decimals (0.05 × BW steps). */
const LOAD_DECIMALS = 2;

/** One set, e.g. "8 reps", "30 s", "3 × 5 s lowerings", "5 reps at 0.50× BW". */
export function formatPerformance(metric: Metric, performance: SetPerformance): string {
  const reps = performance.reps ?? 1;
  switch (metric) {
    case 'reps':
      return performance.value === 1
        ? t('{n} rep', { n: performance.value })
        : t('{n} reps', { n: performance.value });
    case 'hold_s':
      return t('{n} s', { n: performance.value });
    case 'eccentric_s':
      return reps === 1
        ? t('{reps} × {n} s lowering', { reps, n: performance.value })
        : t('{reps} × {n} s lowerings', { reps, n: performance.value });
    case 'load_xbw': {
      const load = performance.value.toFixed(LOAD_DECIMALS);
      return reps === 1
        ? t('{reps} rep at {load}× BW', { reps, load })
        : t('{reps} reps at {load}× BW', { reps, load });
    }
  }
}

/** A Trial standard, e.g. "3 sets of 8 reps" or "3 sets of 30 s". */
export function formatTrial(metric: Metric, trial: Trial): string {
  const perSet = formatPerformance(metric, {
    value: trial.target,
    ...(trial.reps !== undefined ? { reps: trial.reps } : {}),
  });
  return trial.sets === 1
    ? t('1 set of {perSet}', { perSet })
    : t('{sets} sets of {perSet}', { sets: trial.sets, perSet });
}

/** The unit shown next to a stepper for the metric's main value. */
export const METRIC_UNITS: Readonly<Record<Metric, string>> = {
  reps: k('reps'),
  hold_s: 's',
  eccentric_s: 's',
  load_xbw: '× BW',
};

/** What a metric measures, as the node editor names it (PLAN 4.7). */
export const METRIC_LABELS: Readonly<Record<Metric, string>> = {
  reps: k('Reps'),
  hold_s: k('Hold'),
  eccentric_s: k('Slow lowering'),
  load_xbw: k('Weighted'),
};

/** OG level 0 marks a foundation node below the OG2 chart (see the progressions overview). */
export const FOUNDATION_OG_LEVEL = 0;

/**
 * The OG level as a short tag: "Foundation" for level 0, else "Tier 5". The UI calls the
 * Overcoming Gravity level "tier" (ADR-065); `ogLevel` stays the internal name. Not to be confused
 * with the Beginner–Elite band of `tierForOgLevel` or the hero class tiers I–III.
 */
export function formatOgLevel(ogLevel: number): string {
  return ogLevel === FOUNDATION_OG_LEVEL ? t('Foundation') : t('Tier {n}', { n: ogLevel });
}

/** The OG level for screen readers: "foundation" for level 0, else "tier 5". */
export function spokenOgLevel(ogLevel: number): string {
  return ogLevel === FOUNDATION_OG_LEVEL ? t('foundation') : t('tier {n}', { n: ogLevel });
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
      return range.max === 1 ? t('{n} rep', { n: span }) : t('{n} reps', { n: span });
    case 'hold_s':
      return t('{n} s', { n: span });
    case 'eccentric_s':
      return t('{n} s lowerings', { n: span });
    case 'load_xbw':
      return t('{n}× BW', { n: span });
  }
}

const MONTHS = [
  k('Jan'),
  k('Feb'),
  k('Mar'),
  k('Apr'),
  k('May'),
  k('Jun'),
  k('Jul'),
  k('Aug'),
  k('Sep'),
  k('Oct'),
  k('Nov'),
  k('Dec'),
] as const;

/** A day in the device's time zone, e.g. "27 Sep 2026" (history lists). */
export function formatShortDate(at: number): string {
  const date = new Date(at);
  return `${date.getDate()} ${t(MONTHS[date.getMonth()])} ${date.getFullYear()}`;
}

/**
 * What a passed Trial also counted for (PLAN 7.8 FB-7): "It also counts for Pull-up negative and Dead
 * hang: they are proficient now."
 */
export function trialAlsoCountsText(names: readonly string[]): string {
  const list =
    names.length <= 1
      ? (names[0] ?? '')
      : t('{list} and {last}', {
          list: names.slice(0, -1).join(', '),
          last: names[names.length - 1],
        });
  return names.length === 1
    ? t('It also counts for {list}: it is proficient now.', { list })
    : t('It also counts for {list}: they are proficient now.', { list });
}

/** The marker of a node stuck at level 5 until its Trial (ADR-004, PLAN 7.8 FB-4). */
export const TRIAL_NEEDED_LABEL = k('Trial needed');

/** What a node stuck at the cap needs, with the XP banked beyond it ("… 12 XP banked."). */
export function trialNeededNote(banked = 0): string {
  return banked > 0
    ? t('Level 5 reached: pass the Trial to keep levelling. {banked} XP banked.', { banked })
    : t('Level 5 reached: pass the Trial to keep levelling.');
}

/**
 * When a Standard plan offers the Trial of a node stuck at the cap (FB-12): once every set of its
 * last session reached the top of the working range (`rangeTop`, e.g. "12 reps"), or in a
 * Challenging session right away (ADR-074).
 */
export function trialPlannedNote(rangeTop: string): string {
  return t(
    'Its Trial is planned once every set reaches {rangeTop}, or right away in a Challenging session.',
    { rangeTop },
  );
}

/** The summary's note on an exercise that earned a share of its XP (ADR-078); none for full XP. */
export function xpShareNote(share: XpShareKind | undefined): string | undefined {
  switch (share) {
    case 'warm_up':
      return t('Warm-up: half XP');
    case 'cool_down':
      return t('Cool-down: half XP');
    default:
      return undefined;
  }
}

/** The value next to a node's XP bar: "34 / 60 XP", "Trial ready" at the cap, "Max" at level 10. */
export function formatLevelProgress(progress: NodeLevelProgress): string {
  if (progress.capped) return t('Trial ready');
  if (progress.xpForLevel === 0) return t('Max');
  return t('{xp} / {total} XP', { xp: progress.xpIntoLevel, total: progress.xpForLevel });
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
    return t('{n} min rest', { n: seconds / SECONDS_PER_MINUTE });
  }
  return t('{n} s rest', { n: seconds });
}

/** Shown for a user node saved before descriptions existed (PLAN 6.2, ADR-049). */
export const NO_DESCRIPTION_TEXT = k('No description yet. Edit this exercise to add one.');

/** A node's description, or `NO_DESCRIPTION_TEXT` when it has none. */
export function formatDescription(description: string): string {
  return description.trim() === '' ? t(NO_DESCRIPTION_TEXT) : description;
}
