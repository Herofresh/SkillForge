import { Stack, useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { draftChanged } from '@/domain/nodeEditor';
import type { ExerciseNode } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

import { stackHeaderOptions } from '../stackHeader';
import { Spacing } from '../theme';
import { PixelButton, PixelModal, PixelText, Screen } from '../ui';

import { NodeEditorForm } from './NodeEditorForm';

type Props = {
  /** The draft to start from (`nodeDraft` or `newNodeDraft`); read once. */
  initial: ExerciseNode;
  title: string;
  saveLabel: string;
  /** Called with the saved node's id (a new node's `user_` id) once the overlay is stored. */
  onSaved: (nodeId: string) => void;
  onCancel: () => void;
};

/**
 * The editor screen body shared by "Edit progression" and "Add custom exercise" (PLAN 4.7): the
 * form with live validation (`nodeDraftIssues` on every change) and a Save that is only enabled
 * while the tree would stay valid. The store refuses a broken tree anyway (`saveOverlay`).
 * Leaving with unsaved changes (back, Cancel, header) asks first (PLAN 5.2, ADR-038).
 */
export function NodeEditorBody({ initial, title, saveLabel, onSaved, onCancel }: Props) {
  const nodes = useAppStore((state) => state.nodes);
  const nodeDraftIssues = useAppStore((state) => state.nodeDraftIssues);
  const saveNodeDraft = useAppStore((state) => state.saveNodeDraft);
  const [draft, setDraft] = useState(initial);
  const [touched, setTouched] = useState(false);
  const issues = useMemo(() => nodeDraftIssues(draft), [nodeDraftIssues, draft]);
  const custom = draft.source === 'user';
  const navigation = useNavigation();
  const dirty = draftChanged(initial, draft);
  /** Set once saved or discarded, so the navigation that follows isn't stopped. */
  const leavingRef = useRef(false);
  const [pendingLeave, setPendingLeave] = useState<(() => void) | undefined>(undefined);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (leavingRef.current || !dirty) return;
        event.preventDefault();
        const action = event.data.action;
        setPendingLeave(() => () => navigation.dispatch(action));
      }),
    [navigation, dirty],
  );

  const change = (next: ExerciseNode) => {
    setDraft(next);
    setTouched(true);
  };
  const save = () => {
    const result = saveNodeDraft(draft);
    if (result.issues.length === 0) {
      leavingRef.current = true;
      onSaved(result.nodeId);
    }
  };
  const discard = () => {
    leavingRef.current = true;
    const leave = pendingLeave;
    setPendingLeave(undefined);
    leave?.();
  };

  return (
    <>
      <Stack.Screen options={stackHeaderOptions(title)} />
      <Screen testID="node-editor">
        <PixelText variant="small" tone="textMuted">
          {custom
            ? 'Your own exercise. It is checked like the built-in tree: no loops, every prerequisite must exist.'
            : 'Your changes are kept on top of the built-in tree; "Reset to default" on the skill brings it back.'}
        </PixelText>
        <NodeEditorForm
          draft={draft}
          onChange={change}
          issues={issues}
          nodes={nodes}
          custom={custom}
        />
        <View style={styles.footer}>
          <PixelText
            variant="small"
            tone={issues.length > 0 ? 'danger' : 'success'}
            accessibilityLiveRegion="polite"
            testID="editor-status">
            {issues.length > 0
              ? `${issues.length} ${issues.length === 1 ? 'problem' : 'problems'} to fix before saving.`
              : touched
                ? 'The tree stays valid with these changes.'
                : 'No changes yet.'}
          </PixelText>
          <PixelButton
            label={saveLabel}
            icon="check"
            onPress={save}
            disabled={issues.length > 0}
            testID="editor-save"
          />
          <PixelButton
            label="Cancel"
            variant="secondary"
            onPress={onCancel}
            testID="editor-cancel"
          />
        </View>
      </Screen>
      <PixelModal
        visible={pendingLeave !== undefined}
        title="Discard changes?"
        onClose={() => setPendingLeave(undefined)}
        closeLabel="Keep editing"
        testID="editor-discard-dialog">
        <PixelText>
          Your changes to this exercise are not saved. Leave and throw them away?
        </PixelText>
        <PixelButton
          label="Discard changes"
          variant="danger"
          icon="cross"
          onPress={discard}
          testID="editor-discard"
        />
      </PixelModal>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: Spacing.sm,
  },
});
