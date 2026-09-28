import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { NodeEditorBody } from '@/components/editor/NodeEditorBody';
import { stackHeaderOptions } from '@/components/stackHeader';
import { EmptyState, Screen } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';

/**
 * "Edit progression" (PLAN 4.7): the node's standards, prerequisites, equipment, cues and trained
 * attributes; a user node's name, metric and position too. Saved into the overlay (ADR-036).
 */
export default function EditNodeScreen() {
  const { nodeId } = useLocalSearchParams<{ nodeId: string }>();
  const router = useRouter();
  const nodeDraft = useAppStore((state) => state.nodeDraft);
  // Read once: the draft is the screen's own from here on.
  const [initial] = useState(() => nodeDraft(nodeId));

  if (!initial) {
    return (
      <Screen centered>
        <Stack.Screen options={stackHeaderOptions('Edit')} />
        <EmptyState icon="potion" title="Unknown skill" message={`No skill '${nodeId}' here.`} />
      </Screen>
    );
  }
  return (
    <NodeEditorBody
      initial={initial}
      title={`Edit ${initial.name}`}
      saveLabel="Save changes"
      onSaved={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
