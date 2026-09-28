/**
 * The exercise timer (PLAN 5.4, ADR-040): a hold countdown for `hold_s` sets and a stopwatch for
 * every other metric, so the user needs no separate clock app.
 *
 * - Hold: a short get-ready countdown, then a countdown from the set's target seconds; at the target
 *   the phone signals and the clock keeps counting up past it ("+7 s"). The measured value is the
 *   whole seconds held, overtime included (the get-ready time is not part of it).
 * - Stopwatch: counts up from the start; the measured value is the whole seconds since the start.
 *
 * A timer is only two timestamps (`startedAt`, `stoppedAt`), never an accumulated interval, so it
 * survives backgrounding and an app kill: every reading is computed from the clock at `now`. Pure.
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

/** A started timer (ms since the Unix epoch); `stoppedAt` is set once the user stopped it. */
export interface SetTimer {
  startedAt: number;
  stoppedAt?: number;
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
  const end = timer.stoppedAt ?? now;
  const running = timer.stoppedAt === undefined;
  const elapsedMs = Math.max(0, end - timer.startedAt);
  if (mode === 'stopwatch') {
    const seconds = Math.floor(elapsedMs / MS_PER_SECOND);
    return { mode, phase: 'running', running, seconds, durationSec: seconds };
  }
  if (elapsedMs < GET_READY_MS) {
    const seconds = Math.ceil((GET_READY_MS - elapsedMs) / MS_PER_SECOND);
    return { mode, phase: 'get_ready', running, seconds, durationSec: 0 };
  }
  const heldMs = elapsedMs - GET_READY_MS;
  const durationSec = Math.floor(heldMs / MS_PER_SECOND);
  const targetMs = Math.max(0, targetSec) * MS_PER_SECOND;
  if (heldMs < targetMs) {
    const seconds = Math.ceil((targetMs - heldMs) / MS_PER_SECOND);
    return { mode, phase: 'holding', running, seconds, durationSec };
  }
  const seconds = Math.floor((heldMs - targetMs) / MS_PER_SECOND);
  return { mode, phase: 'overtime', running, seconds, durationSec };
}

/** What the timer measured when it stopped, or at `at` while it still runs (whole seconds). */
export function measuredSeconds(timer: SetTimer, mode: TimerMode, at: number): number {
  // The target only changes the phase, never the measured seconds.
  return readTimer(timer, mode, 0, at).durationSec;
}

/** When the phase changes from `previous` to `next`, whether that is the moment to signal the target. */
export function reachedTarget(previous: TimerPhase | undefined, next: TimerPhase): boolean {
  return previous === 'holding' && next === 'overtime';
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

/** The caption over the clock, e.g. "Get ready", "Hold", "Target reached", "Held", "Time". */
export function timerCaption(reading: TimerReading): string {
  if (!reading.running) return reading.mode === 'hold' ? 'Held' : 'Time';
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
