import { MS_PER_SECOND } from '@/lib/time';

import {
  CUE_MAX_GAP_MS,
  elapsedSeconds,
  formatTimerClock,
  GET_READY_SECONDS,
  isPaused,
  measuredSeconds,
  pauseTimer,
  readTimer,
  restCue,
  resumeTimer,
  spokenTimer,
  stopTimer,
  timedPerformance,
  timerCaption,
  timerCue,
  timerModeFor,
  totalDurationSec,
} from './setTimer';

const START = 1_790_000_000_000;
const at = (seconds: number) => START + seconds * MS_PER_SECOND;
const READY = GET_READY_SECONDS;

describe('timerModeFor', () => {
  it('counts holds down and times every other metric with a stopwatch', () => {
    expect(timerModeFor('hold_s')).toBe('hold');
    expect(timerModeFor('reps')).toBe('stopwatch');
    expect(timerModeFor('eccentric_s')).toBe('stopwatch');
    expect(timerModeFor('load_xbw')).toBe('stopwatch');
  });
});

describe('readTimer: hold', () => {
  const timer = { startedAt: START };

  it('starts with the get-ready countdown', () => {
    expect(readTimer(timer, 'hold', 30, at(0))).toEqual({
      mode: 'hold',
      phase: 'get_ready',
      running: true,
      paused: false,
      seconds: 3,
      durationSec: 0,
    });
    expect(readTimer(timer, 'hold', 30, at(2.5)).seconds).toBe(1);
  });

  it('counts down from the target after the get-ready time', () => {
    expect(readTimer(timer, 'hold', 30, at(READY))).toMatchObject({
      phase: 'holding',
      seconds: 30,
      durationSec: 0,
    });
    expect(readTimer(timer, 'hold', 30, at(READY + 2.4))).toMatchObject({
      phase: 'holding',
      seconds: 28,
      durationSec: 2,
    });
  });

  it('counts up past the target, the overtime included in the measured seconds', () => {
    expect(readTimer(timer, 'hold', 30, at(READY + 30))).toMatchObject({
      phase: 'overtime',
      seconds: 0,
      durationSec: 30,
    });
    expect(readTimer(timer, 'hold', 30, at(READY + 37.9))).toMatchObject({
      phase: 'overtime',
      seconds: 7,
      durationSec: 37,
    });
  });

  it('freezes at the stop and survives any "now" (timestamps, not ticks)', () => {
    const stopped = { startedAt: START, stoppedAt: at(READY + 12.7) };
    const reading = readTimer(stopped, 'hold', 30, at(10_000));
    expect(reading).toMatchObject({ running: false, phase: 'holding', durationSec: 12 });
    // A reading long after a restart is the same as right away.
    expect(readTimer({ startedAt: START }, 'hold', 30, at(READY + 600)).durationSec).toBe(600);
  });

  it('treats a clock before the start as zero', () => {
    expect(readTimer(timer, 'hold', 30, at(-5)).phase).toBe('get_ready');
    expect(readTimer(timer, 'hold', 30, at(-5)).seconds).toBe(READY);
  });
});

describe('readTimer: stopwatch', () => {
  it('counts whole seconds up from the start', () => {
    expect(readTimer({ startedAt: START }, 'stopwatch', 8, at(42.9))).toEqual({
      mode: 'stopwatch',
      phase: 'running',
      running: true,
      paused: false,
      seconds: 42,
      durationSec: 42,
    });
  });
});

describe('measuredSeconds', () => {
  it('is the held seconds for a hold and the elapsed seconds otherwise', () => {
    expect(measuredSeconds({ startedAt: START }, 'hold', at(READY + 20))).toBe(20);
    expect(measuredSeconds({ startedAt: START }, 'hold', at(1))).toBe(0);
    expect(measuredSeconds({ startedAt: START }, 'stopwatch', at(20))).toBe(20);
    expect(measuredSeconds({ startedAt: START, stoppedAt: at(5) }, 'stopwatch', at(99))).toBe(5);
  });
});

describe('pause and resume (PLAN 5.8)', () => {
  it('freezes the reading while paused and leaves the pause out after resuming', () => {
    const paused = pauseTimer({ startedAt: START }, at(READY + 10));
    expect(paused).toEqual({ startedAt: START, pausedAt: at(READY + 10) });
    expect(isPaused(paused)).toBe(true);
    const frozen = readTimer(paused, 'hold', 30, at(READY + 500));
    expect(frozen).toMatchObject({ running: true, paused: true, phase: 'holding', seconds: 20 });
    expect(frozen.durationSec).toBe(10);

    const resumed = resumeTimer(paused, at(READY + 70));
    expect(resumed).toEqual({ startedAt: START, pausedMs: 60 * MS_PER_SECOND });
    expect(isPaused(resumed)).toBe(false);
    expect(readTimer(resumed, 'hold', 30, at(READY + 75))).toMatchObject({
      paused: false,
      phase: 'holding',
      durationSec: 15,
    });
    // A second pause adds up with the first.
    const twice = resumeTimer(pauseTimer(resumed, at(READY + 80)), at(READY + 90));
    expect(twice.pausedMs).toBe(70 * MS_PER_SECOND);
    expect(measuredSeconds(twice, 'hold', at(READY + 100))).toBe(30);
  });

  it('pauses the stopwatch and the get-ready the same way', () => {
    const paused = pauseTimer({ startedAt: START }, at(1));
    expect(readTimer(paused, 'hold', 30, at(50))).toMatchObject({ phase: 'get_ready', seconds: 2 });
    const stopwatch = resumeTimer(pauseTimer({ startedAt: START }, at(20)), at(80));
    expect(readTimer(stopwatch, 'stopwatch', 0, at(85)).seconds).toBe(25);
  });

  it('stops a paused timer at its pause', () => {
    const stopped = stopTimer(pauseTimer({ startedAt: START }, at(12)), at(99));
    expect(stopped).toEqual({ startedAt: START, stoppedAt: at(12) });
    expect(isPaused(stopped)).toBe(false);
    expect(measuredSeconds(stopped, 'stopwatch', at(200))).toBe(12);
  });

  it('ignores pausing a paused or stopped timer and resuming a running one', () => {
    const paused = pauseTimer({ startedAt: START }, at(5));
    expect(pauseTimer(paused, at(9))).toBe(paused);
    const stopped = stopTimer({ startedAt: START }, at(5));
    expect(stopped).toEqual({ startedAt: START, stoppedAt: at(5) });
    expect(stopTimer(stopped, at(9))).toBe(stopped);
    expect(pauseTimer(stopped, at(9))).toBe(stopped);
    const running = { startedAt: START };
    expect(resumeTimer(running, at(9))).toBe(running);
    // Clocks before the start or the pause count as no time.
    expect(pauseTimer(running, at(-5)).pausedAt).toBe(START);
    expect(resumeTimer(paused, at(1)).pausedMs).toBe(0);
    expect(stopTimer(running, at(-5)).stoppedAt).toBe(START);
  });

  it('reads a timer from before 5.8 (no pause fields) as never paused', () => {
    expect(isPaused({ startedAt: START })).toBe(false);
    expect(readTimer({ startedAt: START }, 'stopwatch', 0, at(10)).paused).toBe(false);
  });
});

describe('timerCue and restCue (PLAN 5.8)', () => {
  const NOW = at(100);
  function seen<T>(value: T, msAgo = MS_PER_SECOND) {
    return { value, at: NOW - msAgo };
  }

  it('buzzes at "go" and at the target', () => {
    expect(timerCue(seen('get_ready' as const), 'holding', NOW)).toBe('go');
    expect(timerCue(seen('get_ready' as const), 'overtime', NOW)).toBe('go');
    expect(timerCue(seen('holding' as const), 'overtime', NOW)).toBe('target');
  });

  it('stays quiet without a step, without an earlier reading, or on a stopwatch', () => {
    expect(timerCue(undefined, 'overtime', NOW)).toBeUndefined();
    expect(timerCue(seen('holding' as const), 'holding', NOW)).toBeUndefined();
    expect(timerCue(seen('overtime' as const), 'overtime', NOW)).toBeUndefined();
    expect(timerCue(seen('get_ready' as const), 'get_ready', NOW)).toBeUndefined();
    expect(timerCue(seen('running' as const), 'running', NOW)).toBeUndefined();
  });

  it('buzzes when the rest reaches zero, once', () => {
    expect(restCue(seen(1), 0, NOW)).toBe('rest_end');
    expect(restCue(seen(0), 0, NOW)).toBeUndefined();
    expect(restCue(seen(5), 4, NOW)).toBeUndefined();
    expect(restCue(undefined, 0, NOW)).toBeUndefined();
  });

  it('stays quiet when the moment passed while the app was away', () => {
    expect(timerCue(seen('holding' as const, CUE_MAX_GAP_MS), 'overtime', NOW)).toBe('target');
    expect(timerCue(seen('holding' as const, CUE_MAX_GAP_MS + 1), 'overtime', NOW)).toBeUndefined();
    expect(restCue(seen(3, 60 * MS_PER_SECOND), 0, NOW)).toBeUndefined();
  });
});

describe('timer text', () => {
  const hold = (seconds: number, stoppedAt?: number) =>
    readTimer({ startedAt: START, ...(stoppedAt ? { stoppedAt } : {}) }, 'hold', 30, at(seconds));

  it('formats the clock per phase', () => {
    expect(formatTimerClock(hold(0))).toBe('3');
    expect(formatTimerClock(hold(READY + 3))).toBe('0:27');
    expect(formatTimerClock(hold(READY + 37))).toBe('+7 s');
    expect(formatTimerClock(readTimer({ startedAt: START }, 'stopwatch', 0, at(65)))).toBe('1:05');
  });

  it('captions and speaks each phase', () => {
    expect(timerCaption(hold(0))).toBe('Get ready');
    expect(timerCaption(hold(READY + 3))).toBe('Hold');
    expect(timerCaption(hold(READY + 37))).toBe('Target reached');
    expect(timerCaption(hold(0, at(READY + 37)))).toBe('Held');
    expect(timerCaption(readTimer({ startedAt: START }, 'stopwatch', 0, at(1)))).toBe('Time');
    expect(spokenTimer(hold(0))).toBe('Get ready: 3 seconds');
    expect(spokenTimer(hold(READY + 29))).toBe('Hold: 1 second left');
    expect(spokenTimer(hold(READY + 37))).toBe('Target reached: 7 seconds over');
    expect(spokenTimer(hold(0, at(READY + 37)))).toBe('Held: 37 seconds');
  });

  it('captions and speaks a paused timer', () => {
    const paused = readTimer(pauseTimer({ startedAt: START }, at(READY + 3)), 'hold', 30, at(99));
    expect(timerCaption(paused)).toBe('Paused');
    expect(formatTimerClock(paused)).toBe('0:27');
    expect(spokenTimer(paused)).toBe('Paused, Hold: 27 seconds left');
  });
});

describe('timedPerformance', () => {
  it('puts the held seconds into a hold result and leaves other metrics as entered', () => {
    expect(timedPerformance('hold_s', { value: 30 }, 37)).toEqual({ value: 37 });
    expect(timedPerformance('reps', { value: 8 }, 42)).toEqual({ value: 8 });
    expect(timedPerformance('eccentric_s', { value: 5, reps: 3 }, 42)).toEqual({
      value: 5,
      reps: 3,
    });
  });
});

describe('elapsedSeconds and totalDurationSec', () => {
  it('rounds elapsed time down and never goes negative', () => {
    expect(elapsedSeconds(START, at(61.9))).toBe(61);
    expect(elapsedSeconds(START, at(-3))).toBe(0);
  });

  it('adds up the timed sets only', () => {
    expect(totalDurationSec([{ durationSec: 30 }, {}, { durationSec: 12 }])).toBe(42);
    expect(totalDurationSec([{}, {}])).toBeUndefined();
    expect(totalDurationSec([{ durationSec: 0 }])).toBe(0);
  });
});
