/**
 * The exercise timer (PLAN 5.4, ADR-040): a hold countdown for `hold_s` sets and a stopwatch for
 * every other metric, so the user needs no separate clock app.
 *
 * - Hold: a short get-ready countdown, then a countdown from the set's target seconds; at the target
 *   the phone signals and the clock keeps counting up past it ("+7 s"). The measured value is the
 *   whole seconds held, overtime included (the get-ready time is not part of it).
 * - Stopwatch: counts up from the start; the measured value is the whole seconds since the start.
 *
 * A timer is timestamps (`startedAt`, `stoppedAt`, `pausedAt`) plus the paused time so far
 * (`pausedMs`), never a ticking counter, so it survives backgrounding and an app kill, paused or
 * not: every reading is computed from the clock at `now` (PLAN 5.8, ADR-044). Pure.
 */
import { MS_PER_SECOND } from '@/lib/time';

import { formatClock } from './format';
import type { Metric, SetPerformance } from './types';

/** Seconds of "get ready" before a hold countdown starts. */
export const GET_READY_SECONDS = 3;

export const TIMER_MODES = ['hold', 'stopwatch'] as const;
export type TimerMode = (typeof TIMER_MODES)[number];

/** Holds count down from the target; reps, eccentrics and weighted sets use a stopwatch. */
export function timerModeFor(metric: Metric): TimerMode {
  return metric === 'hold_s' ? 'hold' : 'stopwatch';
}

/**
 * A started timer (ms since the Unix epoch); `stoppedAt` is set once the user stopped it. While it
 * is paused, `pausedAt` is the moment of the pause; `pausedMs` is the time of the pauses already
 * resumed. Timers from before 5.8 have neither and read as never paused.
 */
export interface SetTimer {
  startedAt: number;
  stoppedAt?: number;
  pausedAt?: number;
  pausedMs?: number;
}

/** Whether the timer is paused (a stopped timer is not). */
export function isPaused(timer: SetTimer): boolean {
  return timer.stoppedAt === undefined && timer.pausedAt !== undefined;
}

/** Pauses a running timer at `at`; a paused or stopped one is returned as it is. */
export function pauseTimer(timer: SetTimer, at: number): SetTimer {
  if (timer.stoppedAt !== undefined || timer.pausedAt !== undefined) return timer;
  return { ...timer, pausedAt: Math.max(at, timer.startedAt) };
}

/** Resumes a paused timer at `at`: the pause is added to `pausedMs`. Others are returned as they are. */
export function resumeTimer(timer: SetTimer, at: number): SetTimer {
  if (!isPaused(timer) || timer.pausedAt === undefined) return timer;
  const { pausedAt, ...rest } = timer;
  return { ...rest, pausedMs: (timer.pausedMs ?? 0) + Math.max(0, at - pausedAt) };
}

/**
 * Stops the timer at `at` (never before its start). A paused timer stops at its pause, so the time
 * it spent paused is not measured. A stopped timer is returned as it is.
 */
export function stopTimer(timer: SetTimer, at: number): SetTimer {
  if (timer.stoppedAt !== undefined) return timer;
  const { pausedAt, ...rest } = timer;
  return { ...rest, stoppedAt: pausedAt ?? Math.max(at, timer.startedAt) };
}

/**
 * - `get_ready`: the hold's lead-in; `holding`: counting down to the target; `overtime`: past the
 *   target, counting up; `running`: a stopwatch.
 */
export const TIMER_PHASES = ['get_ready', 'holding', 'overtime', 'running'] as const;
export type TimerPhase = (typeof TIMER_PHASES)[number];

export interface TimerReading {
  mode: TimerMode;
  phase: TimerPhase;
  /** False once the timer is stopped (the reading is then frozen at `stoppedAt`). */
  running: boolean;
  /** True while a running timer is paused (the reading is then frozen at `pausedAt`). */
  paused: boolean;
  /**
   * The whole seconds the clock shows: get-ready seconds left, hold seconds left, seconds past the
   * target, or the stopwatch's elapsed seconds.
   */
  seconds: number;
  /** What the timer measured so far: whole seconds held (hold) or elapsed (stopwatch). */
  durationSec: number;
}

/** Whole seconds between two timestamps, rounded down (0 when `to` is before `from`). */
export function elapsedSeconds(from: number, to: number): number {
  return Math.max(0, Math.floor((to - from) / MS_PER_SECOND));
}

const GET_READY_MS = GET_READY_SECONDS * MS_PER_SECOND;

/** The timer's state at `now` (or at its stop). `targetSec` is the set's target (holds only). */
export function readTimer(
  timer: SetTimer,
  mode: TimerMode,
  targetSec: number,
  now: number,
): TimerReading {
  const end = timer.stoppedAt ?? timer.pausedAt ?? now;
  const running = timer.stoppedAt === undefined;
  const paused = isPaused(timer);
  const state = { mode, running, paused };
  // The paused time is not timer time.
  const elapsedMs = Math.max(0, end - timer.startedAt - (timer.pausedMs ?? 0));
  if (mode === 'stopwatch') {
    const seconds = Math.floor(elapsedMs / MS_PER_SECOND);
    return { ...state, phase: 'running', seconds, durationSec: seconds };
  }
  if (elapsedMs < GET_READY_MS) {
    const seconds = Math.ceil((GET_READY_MS - elapsedMs) / MS_PER_SECOND);
    return { ...state, phase: 'get_ready', seconds, durationSec: 0 };
  }
  const heldMs = elapsedMs - GET_READY_MS;
  const durationSec = Math.floor(heldMs / MS_PER_SECOND);
  const targetMs = Math.max(0, targetSec) * MS_PER_SECOND;
  if (heldMs < targetMs) {
    const seconds = Math.ceil((targetMs - heldMs) / MS_PER_SECOND);
    return { ...state, phase: 'holding', seconds, durationSec };
  }
  const seconds = Math.floor((heldMs - targetMs) / MS_PER_SECOND);
  return { ...state, phase: 'overtime', seconds, durationSec };
}

/** What the timer measured when it stopped, or at `at` while it still runs (whole seconds). */
export function measuredSeconds(timer: SetTimer, mode: TimerMode, at: number): number {
  // The target only changes the phase, never the measured seconds.
  return readTimer(timer, mode, 0, at).durationSec;
}

/**
 * The moments the phone signals (PLAN 5.8, ADR-044): `go` when a hold's get-ready ends, `target`
 * when the hold reaches its target, `rest_end` when the rest countdown reaches zero.
 */
export const TIMER_CUES = ['go', 'target', 'rest_end'] as const;
export type TimerCue = (typeof TIMER_CUES)[number];

/**
 * The longest gap between two screen readings that still signals (the screen reads once a second).
 * A longer gap means the app was in the background when the moment passed: no late buzz on return.
 */
export const CUE_MAX_GAP_MS = 2.5 * MS_PER_SECOND;

/** What the screen showed last: the timer phase (or the rest seconds left) and when. */
export interface SeenReading<T> {
  value: T;
  at: number;
}

/**
 * The cue for a hold's phase step from `previous` to `next` at `now` (the phases of one running,
 * unpaused timer, as the screen saw them), or `undefined`: `go` when the get-ready ends, `target`
 * when the hold reaches its target (a step over both at once gives `go` only).
 */
export function timerCue(
  previous: SeenReading<TimerPhase> | undefined,
  next: TimerPhase,
  now: number,
): TimerCue | undefined {
  if (!previous || now - previous.at > CUE_MAX_GAP_MS) return undefined;
  if (previous.value === 'get_ready' && (next === 'holding' || next === 'overtime')) return 'go';
  if (previous.value === 'holding' && next === 'overtime') return 'target';
  return undefined;
}

/** The cue for the rest countdown going from `previous` to `next` seconds left at `now`, if any. */
export function restCue(
  previous: SeenReading<number> | undefined,
  next: number,
  now: number,
): TimerCue | undefined {
  if (!previous || now - previous.at > CUE_MAX_GAP_MS) return undefined;
  return previous.value > 0 && next <= 0 ? 'rest_end' : undefined;
}

/** The clock text: "3" (get ready), "0:27" (left / elapsed) or "+7 s" (past the target). */
export function formatTimerClock(reading: TimerReading): string {
  switch (reading.phase) {
    case 'get_ready':
      return String(reading.seconds);
    case 'overtime':
      return `+${reading.seconds} s`;
    case 'holding':
    case 'running':
      return formatClock(reading.seconds);
  }
}

/** The caption over the clock, e.g. "Get ready", "Hold", "Target reached", "Paused", "Held", "Time". */
export function timerCaption(reading: TimerReading): string {
  if (!reading.running) return reading.mode === 'hold' ? 'Held' : 'Time';
  if (reading.paused) return 'Paused';
  switch (reading.phase) {
    case 'get_ready':
      return 'Get ready';
    case 'holding':
      return 'Hold';
    case 'overtime':
      return 'Target reached';
    case 'running':
      return 'Time';
  }
}

const seconds = (n: number): string => `${n} ${n === 1 ? 'second' : 'seconds'}`;

/** The timer for screen readers, e.g. "Hold: 27 seconds left" or "Target reached: 7 seconds over". */
export function spokenTimer(reading: TimerReading): string {
  if (!reading.running) return `${timerCaption(reading)}: ${seconds(reading.durationSec)}`;
  if (reading.paused) return `Paused, ${spokenTimer({ ...reading, paused: false })}`;
  switch (reading.phase) {
    case 'get_ready':
      return `Get ready: ${seconds(reading.seconds)}`;
    case 'holding':
      return `Hold: ${seconds(reading.seconds)} left`;
    case 'overtime':
      return `Target reached: ${seconds(reading.seconds)} over`;
    case 'running':
      return `Time: ${seconds(reading.seconds)}`;
  }
}

/** The sum of the measured set durations, or `undefined` when no set was timed. */
export function totalDurationSec(sets: readonly { durationSec?: number }[]): number | undefined {
  const timed = sets.filter((set) => set.durationSec !== undefined);
  return timed.length === 0
    ? undefined
    : timed.reduce((sum, set) => sum + (set.durationSec ?? 0), 0);
}

/**
 * The stepper value after a timer stopped: a hold's result becomes the seconds held (overtime
 * included); other metrics keep what the user entered (their time is only recorded).
 */
export function timedPerformance(
  metric: Metric,
  entered: SetPerformance,
  measuredSec: number,
): SetPerformance {
  return timerModeFor(metric) === 'hold' ? { ...entered, value: measuredSec } : entered;
}
