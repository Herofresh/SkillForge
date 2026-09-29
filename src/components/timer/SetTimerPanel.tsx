import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatClock } from '@/domain/format';
import {
  formatTimerClock,
  readTimer,
  spokenTimer,
  timerCaption,
  timerCue,
  timerModeFor,
  type SeenReading,
  type SetTimer,
  type TimerMode,
  type TimerPhase,
} from '@/domain/setTimer';
import type { Metric } from '@/domain/types';

import { Spacing } from '../theme';
import { PixelButton, PixelFrame, PixelIcon, PixelText, useNow } from '../ui';
import { buzz } from './vibration';

type Props = {
  metric: Metric;
  /** The set's target seconds (the hold countdown starts from it; ignored by the stopwatch). */
  targetSec: number;
  /** The timer of this set, running or stopped; `undefined` = not started. */
  timer?: SetTimer;
  onStart: () => void;
  onStop: () => void;
  /** Pause / resume a running timer (PLAN 5.8). */
  onPause: () => void;
  onResume: () => void;
  /** Cancel a running timer or reset a stopped one (the set is then logged untimed). */
  onReset: () => void;
  /** Prefix of the test ids (`<prefix>-start`, `-clock`, `-stop`, `-pause`, `-resume`, `-reset`). */
  testID: string;
};

/** Keeps the screen on while mounted (only rendered while a timer runs). */
function KeepAwake() {
  useKeepAwake();
  return null;
}

/**
 * The exercise timer of one set (PLAN 5.4, ADR-040): "Start hold" (get ready, buzz at "go", count
 * down from the target, buzz, count on past it) or "Start set" (a stopwatch), then Pause / Resume
 * (PLAN 5.8, ADR-044), Stop / Done, and Cancel / Reset. Optional: the set can always be logged without it. The readings come from `setTimer.ts`;
 * this only renders them and keeps the screen awake while it runs.
 */
export function SetTimerPanel({
  metric,
  targetSec,
  timer,
  onStart,
  onStop,
  onPause,
  onResume,
  onReset,
  testID,
}: Props) {
  const mode = timerModeFor(metric);
  if (!timer) {
    return (
      <PixelButton
        label={mode === 'hold' ? 'Start hold' : 'Start set'}
        icon="hourglass"
        variant="secondary"
        onPress={onStart}
        accessibilityHint={
          mode === 'hold'
            ? `Counts down from ${targetSec} seconds after a short get-ready`
            : 'Starts a stopwatch for this set'
        }
        testID={`${testID}-start`}
      />
    );
  }
  // Keyed by the start and the paused time, so the clock begins fresh for every timer and resume.
  return (
    <TimerReadout
      key={`${timer.startedAt}-${timer.pausedMs ?? 0}`}
      mode={mode}
      targetSec={targetSec}
      timer={timer}
      onStop={onStop}
      onPause={onPause}
      onResume={onResume}
      onReset={onReset}
      testID={testID}
    />
  );
}

type ReadoutProps = Pick<
  Props,
  'targetSec' | 'onStop' | 'onPause' | 'onResume' | 'onReset' | 'testID'
> & {
  mode: TimerMode;
  timer: SetTimer;
};

/**
 * A started timer: caption, clock and Pause / Resume, Stop / Done, Cancel; or what it measured and
 * Reset.
 */
function TimerReadout({
  mode,
  targetSec,
  timer,
  onStop,
  onPause,
  onResume,
  onReset,
  testID,
}: ReadoutProps) {
  const running = timer.stoppedAt === undefined;
  const ticking = running && timer.pausedAt === undefined;
  const now = useNow(ticking);
  const reading = readTimer(timer, mode, targetSec, now);
  const lastSeen = useRef<SeenReading<TimerPhase> | undefined>(undefined);

  // Buzz at "go" and at the target, only as the screen sees the moment pass (ADR-044).
  useEffect(() => {
    if (!ticking) {
      lastSeen.current = undefined;
      return;
    }
    if (mode === 'hold') buzz(timerCue(lastSeen.current, reading.phase, now));
    lastSeen.current = { value: reading.phase, at: now };
  }, [mode, ticking, reading.phase, now]);

  const stopLabel = mode === 'hold' ? 'Stop' : 'Done';
  const clock = reading.running ? formatTimerClock(reading) : formatClock(reading.durationSec);
  const overtime = reading.running && reading.phase === 'overtime';
  return (
    <PixelFrame variant={overtime ? 'gold' : 'rune'} contentStyle={styles.gap} testID={testID}>
      {ticking && <KeepAwake />}
      <View style={styles.row}>
        <PixelIcon name="hourglass" />
        <PixelText variant="label" tone={overtime ? 'gold' : 'rune'} style={styles.caption}>
          {timerCaption(reading)}
        </PixelText>
        <PixelText
          variant="display"
          accessibilityLabel={spokenTimer(reading)}
          testID={`${testID}-clock`}>
          {clock}
        </PixelText>
      </View>
      {reading.running ? (
        <>
          <View style={styles.row}>
            {reading.paused ? (
              <PixelButton
                label="Resume"
                icon="hourglass"
                variant="secondary"
                onPress={onResume}
                accessibilityHint="Runs the timer on from where it was paused"
                testID={`${testID}-resume`}
                style={styles.half}
              />
            ) : (
              <PixelButton
                label="Pause"
                variant="secondary"
                onPress={onPause}
                accessibilityHint="Stops the clock until you resume; the pause is not counted"
                testID={`${testID}-pause`}
                style={styles.half}
              />
            )}
            {reading.phase !== 'get_ready' && (
              <PixelButton
                label={stopLabel}
                icon="check"
                onPress={onStop}
                accessibilityHint={
                  mode === 'hold'
                    ? 'Puts the seconds held into the result'
                    : 'Keeps the time for this set'
                }
                testID={`${testID}-stop`}
                style={styles.half}
              />
            )}
          </View>
          <PixelButton
            label="Cancel"
            variant="secondary"
            onPress={onReset}
            accessibilityHint="Throws this timer away"
            testID={`${testID}-reset`}
          />
        </>
      ) : (
        <PixelButton
          label="Reset timer"
          variant="secondary"
          onPress={onReset}
          accessibilityHint="Clears the measured time; the set is logged without it"
          testID={`${testID}-reset`}
        />
      )}
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  caption: {
    flex: 1,
  },
  half: {
    flex: 1,
  },
});
