import { useState } from 'react';

import { defaultTrialResults, stepTrialResult } from '@/domain/assessment';
import { formatTrial } from '@/domain/format';
import type { SessionResult } from '@/domain/recompute';
import type { ExerciseNode, SetPerformance } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

import { useAcknowledgements } from '../SafeguardWarningList';

/**
 * The state of one Trial attempt on `node` (onboarding assessment and node detail): the advisory
 * warnings to acknowledge (frozen when the form opens, so they don't change under the user after
 * logging), one result per set, and `log`, which records the attempt through the store.
 */
export function useTrialAttempt(node: ExerciseNode) {
  const logTrial = useAppStore((state) => state.logTrial);
  const testOutWarnings = useAppStore((state) => state.testOutWarnings);
  const [warnings] = useState(() => testOutWarnings(node.id));
  const acknowledgements = useAcknowledgements(warnings.length);
  const [results, setResults] = useState<SetPerformance[]>(() => defaultTrialResults(node));
  const [outcome, setOutcome] = useState<SessionResult | undefined>();

  const step = (index: number, steps: number) =>
    setResults((current) =>
      current.map((result, at) => (at === index ? stepTrialResult(node, result, steps) : result)),
    );
  const log = () => setOutcome(logTrial(node.id, results));

  return {
    warnings,
    ...acknowledgements,
    results,
    step,
    outcome,
    log,
    standard: formatTrial(node.metric, node.trial),
  };
}
