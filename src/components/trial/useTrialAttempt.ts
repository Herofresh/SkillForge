import { useState } from 'react';

import { defaultTrialResults, stepTrialResult } from '@/domain/assessment';
import { formatTrial } from '@/domain/format';
import type { SessionResult } from '@/domain/recompute';
import {
  measuredSeconds,
  pauseTimer as paused,
  resumeTimer as resumed,
  stopTimer as stopped,
  timedPerformance,
  timerModeFor,
  type SetTimer,
} from '@/domain/setTimer';
import type { ExerciseNode, SetPerformance } from '@/domain/types';
import { currentTime } from '@/lib/time';
import { useAppStore } from '@/store/useAppStore';

import { useAcknowledgements } from '../SafeguardWarningList';

/**
 * The state of one Trial attempt on `node` (onboarding assessment and node detail): the advisory
 * warnings to acknowledge (frozen when the form opens, so they don't change under the user after
 * logging), one result per set, the optional exercise timer per set (PLAN 5.4; screen state only),
 * and `log`, which records the attempt (with the measured durations) through the store.
 */
export function useTrialAttempt(node: ExerciseNode) {
  const logTrial = useAppStore((state) => state.logTrial);
  const testOutWarnings = useAppStore((state) => state.testOutWarnings);
  const [warnings] = useState(() => testOutWarnings(node.id));
  const acknowledgements = useAcknowledgements(warnings.length);
  const [results, setResults] = useState<SetPerformance[]>(() => defaultTrialResults(node));
  const [outcome, setOutcome] = useState<SessionResult | undefined>();
  const [timers, setTimers] = useState<readonly (SetTimer | undefined)[]>([]);
  const mode = timerModeFor(node.metric);

  const step = (index: number, steps: number) =>
    setResults((current) =>
      current.map((result, at) => (at === index ? stepTrialResult(node, result, steps) : result)),
    );
  const withTimer = (index: number, timer: SetTimer | undefined) =>
    setTimers((current) => results.map((_, at) => (at === index ? timer : current[at])));
  /** Starts set `index`'s timer; one that still runs on another set is stopped first. */
  const startTimer = (index: number) => {
    const running = timers.findIndex((timer) => timer && timer.stoppedAt === undefined);
    if (running >= 0 && running !== index) stopTimer(running);
    withTimer(index, { startedAt: currentTime() });
  };
  /** Stops set `index`'s timer; a hold's result becomes the seconds held. */
  const stopTimer = (index: number) => {
    const timer = timers[index];
    if (!timer || timer.stoppedAt !== undefined) return;
    const at = currentTime();
    const seconds = measuredSeconds(timer, mode, at);
    withTimer(index, stopped(timer, at));
    setResults((current) =>
      current.map((result, i) =>
        i === index ? timedPerformance(node.metric, result, seconds) : result,
      ),
    );
  };
  /** Pauses / resumes set `index`'s timer (PLAN 5.8); the pause is not measured. */
  const pauseTimer = (index: number) => {
    const timer = timers[index];
    if (timer) withTimer(index, paused(timer, currentTime()));
  };
  const resumeTimer = (index: number) => {
    const timer = timers[index];
    if (timer) withTimer(index, resumed(timer, currentTime()));
  };
  const resetTimer = (index: number) => withTimer(index, undefined);
  const log = () => {
    const at = currentTime();
    const durations = results.map((_, index) => {
      const timer = timers[index];
      return timer ? measuredSeconds(timer, mode, at) : undefined;
    });
    setOutcome(logTrial(node.id, results, durations));
  };

  return {
    warnings,
    ...acknowledgements,
    results,
    step,
    timers,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    outcome,
    log,
    standard: formatTrial(node.metric, node.trial),
  };
}
