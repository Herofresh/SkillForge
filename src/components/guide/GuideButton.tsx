import { useState } from 'react';

import { guideEntry, type GuideTopic } from '@/domain/guide';

import { InfoButton } from '../node/InfoButton';

import { GuideSheet } from './GuideSheet';

type Props = {
  topic: GuideTopic;
  /** Defaults to `guide-<topic>`; its sheet gets `<testID>-sheet`. */
  testID?: string;
};

/**
 * The "i" next to a game system (PLAN 6.10c): tapping it opens the guide's short summary of that
 * system ({@link GuideSheet}). Optional and quiet: a small button in a 48 dp touch target that
 * never opens anything on its own.
 */
export function GuideButton({ topic, testID = `guide-${topic}` }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <InfoButton
        name={guideEntry(topic).title}
        onPress={() => setOpen(true)}
        hint="Explains how it works"
        testID={testID}
      />
      {open && (
        <GuideSheet topic={topic} onClose={() => setOpen(false)} testID={`${testID}-sheet`} />
      )}
    </>
  );
}
