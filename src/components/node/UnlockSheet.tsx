import { useState } from 'react';

import type { ExerciseNode } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

import { SafeguardWarningList, useAcknowledgements } from '../SafeguardWarningList';
import { PixelButton, PixelModal, PixelText } from '../ui';

type Props = {
  node: ExerciseNode;
  onClose: () => void;
  /** Called after the self-unlock was stored. */
  onUnlocked: () => void;
};

/**
 * "Unlock anyway" (ADR-023): the app suggests, the user decides. Shows the unmet prerequisites as
 * an advisory warning to acknowledge, then records a `self_unlock` through the store. Never blocks.
 * Mount it to open it.
 */
export function UnlockSheet({ node, onClose, onUnlocked }: Props) {
  const selfUnlockWarnings = useAppStore((state) => state.selfUnlockWarnings);
  const selfUnlock = useAppStore((state) => state.selfUnlock);
  // Frozen when the sheet opens (it is mounted to open it), so the list doesn't change under the user.
  const [warnings] = useState(() => selfUnlockWarnings(node.id));
  const { acknowledged, acknowledge, allAcknowledged } = useAcknowledgements(warnings.length);

  const confirm = () => {
    selfUnlock(node.id);
    onUnlocked();
  };

  return (
    <PixelModal
      visible
      title="Unlock anyway?"
      onClose={onClose}
      closeLabel="Not now"
      testID="unlock-sheet">
      <PixelText>
        {`${node.name} opens for training now. Its prerequisites stay listed, and you can build up to them whenever you like.`}
      </PixelText>
      <SafeguardWarningList
        warnings={warnings}
        acknowledged={acknowledged}
        onAcknowledge={acknowledge}
        testIDPrefix="unlock-warning"
      />
      <PixelButton
        label="Unlock anyway"
        icon="lock"
        onPress={confirm}
        disabled={!allAcknowledged}
        accessibilityHint={allAcknowledged ? undefined : 'Acknowledge the note above first'}
        testID="unlock-confirm"
      />
    </PixelModal>
  );
}
