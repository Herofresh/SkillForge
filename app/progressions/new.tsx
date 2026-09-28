import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { NodeEditorBody } from '@/components/editor/NodeEditorBody';
import { BRANCHES, type Branch } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

const isBranch = (value: string | undefined): value is Branch =>
  (BRANCHES as readonly string[]).includes(value ?? '');

/**
 * "Add custom exercise" (PLAN 4.7): a new `user_` node in `branch`, after `after` (default: the
 * end of the column). Saving opens its node detail.
 */
export default function NewExerciseScreen() {
  const params = useLocalSearchParams<{ branch?: string; after?: string }>();
  const router = useRouter();
  const newNodeDraft = useAppStore((state) => state.newNodeDraft);
  const [initial] = useState(() =>
    newNodeDraft(isBranch(params.branch) ? params.branch : BRANCHES[0], params.after),
  );
  return (
    <NodeEditorBody
      initial={initial}
      title="New exercise"
      saveLabel="Add to the tree"
      onSaved={(nodeId) => router.replace({ pathname: '/node/[nodeId]', params: { nodeId } })}
      onCancel={() => router.back()}
    />
  );
}
