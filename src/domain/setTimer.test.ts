import { MS_PER_SECOND } from '@/lib/time';

import {
  elapsedSeconds,
  formatTimerClock,
  GET_READY_SECONDS,
  measuredSeconds,
  reachedTarget,
  readTimer,
  spokenTimer,
  timedPerformance,
  timerCaption,
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

describe('reachedTarget', () => {
  it('signals only on the step from holding to overtime', () => {
    expect(reachedTarget('holding', 'overtime')).toBe(true);
    expect(reachedTarget(undefined, 'overtime')).toBe(false);
    expect(reachedTarget('overtime', 'overtime')).toBe(false);
    expect(reachedTarget('get_ready', 'holding')).toBe(false);
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
