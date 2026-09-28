import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef } from 'react';
import { StyleSheet, Vibration, View } from 'react-native';

import { formatClock } from '@/domain/format';
import {
  formatTimerClock,
  reachedTarget,
  readTimer,
  spokenTimer,
  timerCaption,
  timerModeFor,
  type SetTimer,
  type TimerMode,
  type TimerPhase,
} from '@/domain/setTimer';
import type { Metric } from '@/domain/types';

import { Spacing } from '../theme';
import { PixelButton, PixelFrame, PixelIcon, PixelText, useNow } from '../ui';

/** Two long buzzes when a hold reaches its target (ms: wait, buzz, pause, buzz). */
const TARGET_VIBRATION = [0, 400, 150, 400];

type Props = {
  metric: Metric;
  /** The set's target seconds (the hold countdown starts from it; ignored by the stopwatch). */
  targetSec: number;
  /** The timer of this set, running or stopped; `undefined` = not started. */
  timer?: SetTimer;
  onStart: () => void;
  onStop: () => void;
  /** Cancel a running timer or reset a stopped one (the set is then logged untimed). */
  onReset: () => void;
  /** Prefix of the test ids (`<prefix>-start`, `-clock`, `-stop`, `-reset`). */
  testID: string;
};

/** Keeps the screen on while mounted (only rendered while a timer runs). */
function KeepAwake() {
  useKeepAwake();
  return null;
}

/**
 * The exercise timer of one set (PLAN 5.4, ADR-040): "Start hold" (get ready, count down from the
 * target, vibrate, count on past it) or "Start set" (a stopwatch), then Stop / Done, and Cancel /
 * Reset. Optional: the set can always be logged without it. The readings come from `setTimer.ts`;
 * this only renders them and keeps the screen awake while it runs.
 */
export function SetTimerPanel({
  metric,
  targetSec,
  timer,
  onStart,
  onStop,
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
  // Keyed by the start, so the clock begins fresh for every timer.
  return (
    <TimerReadout
      key={timer.startedAt}
      mode={mode}
      targetSec={targetSec}
      timer={timer}
      onStop={onStop}
      onReset={onReset}
      testID={testID}
    />
  );
}

type ReadoutProps = Pick<Props, 'targetSec' | 'onStop' | 'onReset' | 'testID'> & {
  mode: TimerMode;
  timer: SetTimer;
};

/** A started timer: caption, clock and Stop / Done / Cancel, or what it measured and Reset. */
function TimerReadout({ mode, targetSec, timer, onStop, onReset, testID }: ReadoutProps) {
  const running = timer.stoppedAt === undefined;
  const now = useNow(running);
  const reading = readTimer(timer, mode, targetSec, now);
  const lastPhase = useRef<TimerPhase | undefined>(reading.phase);

  useEffect(() => {
    const phase = reading.running ? reading.phase : undefined;
    if (phase && reachedTarget(lastPhase.current, phase)) Vibration.vibrate(TARGET_VIBRATION);
    lastPhase.current = phase;
  }, [reading.phase, reading.running]);

  const stopLabel = mode === 'hold' ? 'Stop' : 'Done';
  const clock = reading.running ? formatTimerClock(reading) : formatClock(reading.durationSec);
  const overtime = reading.running && reading.phase === 'overtime';
  return (
    <PixelFrame variant={overtime ? 'gold' : 'rune'} contentStyle={styles.gap} testID={testID}>
      {running && <KeepAwake />}
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
        <View style={styles.row}>
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
          <PixelButton
            label="Cancel"
            variant="secondary"
            onPress={onReset}
            accessibilityHint="Throws this timer away"
            testID={`${testID}-reset`}
            style={styles.half}
          />
        </View>
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
