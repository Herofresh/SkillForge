import { warningKey } from '@/domain/train';
import type { SafeguardWarning } from '@/domain/types';

import { WarningBanner } from '../ui';

type Props = {
  warnings: readonly SafeguardWarning[];
  /** Keys (`warningKey`) the user acknowledged: stored with the plan or live session. */
  acknowledged: readonly string[];
  onAcknowledge: (key: string) => void;
  /** Each banner gets `${testIDPrefix}-${index}` (and the banner's `-acknowledge` ids). */
  testIDPrefix: string;
};

/**
 * The Train flow's advisory warnings (ADR-023), acknowledged by key: the list changes as the user
 * swaps, adds and logs, and a new warning shows up unacknowledged while old ones keep their answer.
 */
export function TrainWarningList({ warnings, acknowledged, onAcknowledge, testIDPrefix }: Props) {
  return (
    <>
      {warnings.map((warning, index) => {
        const key = warningKey(warning);
        return (
          <WarningBanner
            key={key}
            severity={warning.severity}
            message={warning.message}
            acknowledged={acknowledged.includes(key)}
            onAcknowledge={() => onAcknowledge(key)}
            testID={`${testIDPrefix}-${index}`}
          />
        );
      })}
    </>
  );
}
