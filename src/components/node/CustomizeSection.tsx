import { useRouter } from 'expo-router';
import { useState } from 'react';

import { editorIssueText } from '@/domain/nodeEditor';
import type { CustomizationKind } from '@/domain/overlayEdit';
import type { ExerciseNode, ValidationIssue } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

import { IssueNotes } from '../editor/IssueNotes';
import { PixelButton, PixelModal, PixelText } from '../ui';

import { DetailSection } from './DetailSection';

type Props = {
  node: ExerciseNode;
  /** How the user's overlay changes this node, if it does. */
  customization: CustomizationKind | undefined;
};

type Confirm = 'reset' | 'hide' | 'delete';

const INTRO: Readonly<Record<'added' | 'edited' | 'none', string>> = {
  added: 'Your own exercise. Change it, add one after it, or delete it.',
  edited: 'You changed this exercise. Reset it to go back to the built-in standards.',
  none: 'Make it fit your training: standards, prerequisites, equipment, cues. Or add your own exercise after it.',
};

/**
 * "Your tree" on the node detail (PLAN 4.7): edit the progression, add a custom exercise after
 * this one, reset an edited node, hide a built-in node or delete a custom one (each confirmed).
 * The overlay changes go through the store, which never saves a broken tree.
 */
export function CustomizeSection({ node, customization }: Props) {
  const router = useRouter();
  const nodes = useAppStore((state) => state.nodes);
  const resetNode = useAppStore((state) => state.resetNode);
  const setNodeHidden = useAppStore((state) => state.setNodeHidden);
  const [confirm, setConfirm] = useState<Confirm | undefined>();
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const custom = node.source === 'user';

  const run = (action: () => ValidationIssue[], leave: boolean) => {
    setConfirm(undefined);
    const result = action();
    setIssues(result);
    if (result.length === 0 && leave) router.back();
  };

  return (
    <DetailSection title="Your tree" icon="quill" variant="arcane" testID="detail-customize">
      <PixelText variant="small">
        {INTRO[customization === 'added' || customization === 'edited' ? customization : 'none']}
      </PixelText>
      <PixelButton
        label="Edit progression"
        icon="quill"
        variant="secondary"
        onPress={() =>
          router.push({ pathname: '/node/[nodeId]/edit', params: { nodeId: node.id } })
        }
        testID="edit-progression"
      />
      <PixelButton
        label="Add exercise after this"
        icon="rune"
        variant="secondary"
        onPress={() =>
          router.push({
            pathname: '/progressions/new',
            params: { branch: node.branch, after: node.id },
          })
        }
        testID="add-exercise-after"
      />
      {customization === 'edited' && (
        <PixelButton
          label="Reset to default"
          icon="potion"
          variant="secondary"
          onPress={() => setConfirm('reset')}
          testID="reset-node"
        />
      )}
      {custom ? (
        <PixelButton
          label="Delete exercise"
          icon="cross"
          variant="secondary"
          onPress={() => setConfirm('delete')}
          testID="delete-node"
        />
      ) : (
        <PixelButton
          label="Hide exercise"
          icon="cross"
          variant="secondary"
          onPress={() => setConfirm('hide')}
          testID="hide-node"
        />
      )}
      <IssueNotes
        messages={issues.map((issue) => editorIssueText(issue, node.id, nodes))}
        title="Not changed: the tree would break"
        testID="customize-issues"
      />

      <PixelModal
        visible={confirm === 'reset'}
        title="Reset to default?"
        onClose={() => setConfirm(undefined)}
        closeLabel="Keep my changes"
        testID="reset-dialog">
        <PixelText>{`${node.name} goes back to the built-in standards, prerequisites, equipment and cues.`}</PixelText>
        <PixelButton
          label="Reset"
          variant="danger"
          onPress={() => run(() => resetNode(node.id), false)}
          testID="reset-confirm"
        />
      </PixelModal>
      <PixelModal
        visible={confirm === 'hide'}
        title={`Hide ${node.name}?`}
        onClose={() => setConfirm(undefined)}
        closeLabel="Keep it"
        testID="hide-dialog">
        <PixelText>
          It leaves the tree and your workouts. Skills that need it then need what it needed. Its
          logged sets stay in your history and count again if you show it (My progressions in
          Settings).
        </PixelText>
        <PixelButton
          label="Hide"
          variant="danger"
          onPress={() => run(() => setNodeHidden(node.id, true), true)}
          testID="hide-confirm"
        />
      </PixelModal>
      <PixelModal
        visible={confirm === 'delete'}
        title={`Delete ${node.name}?`}
        onClose={() => setConfirm(undefined)}
        closeLabel="Keep it"
        testID="delete-dialog">
        <PixelText>
          Your exercise leaves the tree. Its logged sets stay in your history but no longer count.
        </PixelText>
        <PixelButton
          label="Delete"
          variant="danger"
          onPress={() => run(() => resetNode(node.id), true)}
          testID="delete-confirm"
        />
      </PixelModal>
    </DetailSection>
  );
}
