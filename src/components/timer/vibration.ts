import { Vibration } from 'react-native';

import type { TimerCue } from '@/domain/setTimer';

/** A short buzz (ms). */
export const SHORT_BUZZ_MS = 200;
/** A long buzz (ms). */
export const LONG_BUZZ_MS = 400;
/** The pause between the buzzes of one pattern (ms). */
export const BUZZ_GAP_MS = 150;

/**
 * The vibration per timer cue (PLAN 5.4 / 5.8, ADR-040 / ADR-044), as Android patterns in ms (wait,
 * buzz, pause, buzz, …): one short buzz at "go", two long buzzes at the hold target, three short
 * buzzes when the rest is over. They differ so the user can tell them apart without looking.
 */
export const CUE_VIBRATIONS: Readonly<Record<TimerCue, readonly number[]>> = {
  go: [0, SHORT_BUZZ_MS],
  target: [0, LONG_BUZZ_MS, BUZZ_GAP_MS, LONG_BUZZ_MS],
  rest_end: [0, SHORT_BUZZ_MS, BUZZ_GAP_MS, SHORT_BUZZ_MS, BUZZ_GAP_MS, SHORT_BUZZ_MS],
};

/** Vibrates the pattern of `cue`; no cue, no buzz. */
export function buzz(cue: TimerCue | undefined): void {
  if (cue) Vibration.vibrate([...CUE_VIBRATIONS[cue]]);
}
