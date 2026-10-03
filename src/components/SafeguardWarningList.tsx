import { useCallback, useState } from 'react';

import type { SafeguardWarning } from '@/domain/types';

import { SafeguardGuideNote } from './guide/SafeguardGuideNote';
import { WarningBanner } from './ui';

/**
 * Which of `count` advisory warnings the user has acknowledged (ADR-023). Acknowledging only enables
 * the action that follows; it never blocks anything.
 */
export function useAcknowledgements(count: number) {
  const [acknowledged, setAcknowledged] = useState<ReadonlySet<number>>(new Set());
  const acknowledge = useCallback(
    (index: number) => setAcknowledged((current) => new Set(current).add(index)),
    [],
  );
  const allAcknowledged = Array.from({ length: count }, (_, index) => index).every((index) =>
    acknowledged.has(index),
  );
  return { acknowledged, acknowledge, allAcknowledged };
}

type Props = {
  warnings: readonly SafeguardWarning[];
  acknowledged: ReadonlySet<number>;
  onAcknowledge: (index: number) => void;
  /** Each banner gets `${testIDPrefix}-${index}` (and the banner's own `-acknowledge` ids). */
  testIDPrefix: string;
};

/**
 * The advisory warnings before an action, each with its "I understand" (ADR-023), and the guide's
 * "i" when one of them is a tendon safeguard (PLAN 6.10c).
 */
export function SafeguardWarningList({
  warnings,
  acknowledged,
  onAcknowledge,
  testIDPrefix,
}: Props) {
  return (
    <>
      <SafeguardGuideNote warnings={warnings} />
      {warnings.map((warning, index) => (
        <WarningBanner
          key={`${warning.code}-${index}`}
          severity={warning.severity}
          message={warning.message}
          acknowledged={acknowledged.has(index)}
          onAcknowledge={() => onAcknowledge(index)}
          testID={`${testIDPrefix}-${index}`}
        />
      ))}
    </>
  );
}
