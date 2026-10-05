import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { OverlayEntryRow } from '@/components/editor/OverlayEntryRow';
import { IssueNotes } from '@/components/editor/IssueNotes';
import { SharePanel } from '@/components/editor/SharePanel';
import { DetailSection } from '@/components/node/DetailSection';
import { stackHeaderOptions } from '@/components/stackHeader';
import { EmptyState, PixelButton, PixelModal, PixelText, Screen } from '@/components/ui';
import { formatIssue } from '@/data/validate';
import { overlayEntries, type OverlayEntry } from '@/domain/overlayEdit';
import type { ValidationIssue } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * "My progressions" (PLAN 4.7–4.8, ADR-036): every change the user made to the tree (own exercises,
 * edited and hidden built-in ones) with open / reset / show, then sharing: the overlay as YAML to
 * the share sheet, importing someone else's with a preview, and how to suggest it to the project.
 */
export default function ProgressionsScreen() {
  const router = useRouter();
  const overlay = useAppStore((state) => state.overlay);
  const baseNodes = useAppStore((state) => state.baseNodes);
  const overlayIssues = useAppStore((state) => state.overlayIssues);
  const overlayUnreadable = useAppStore((state) => state.overlayUnreadable);
  const resetNode = useAppStore((state) => state.resetNode);
  const setNodeHidden = useAppStore((state) => state.setNodeHidden);
  const entries = useMemo(() => overlayEntries(overlay, baseNodes), [overlay, baseNodes]);
  const [resetting, setResetting] = useState<OverlayEntry | undefined>();
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

  const reset = (entry: OverlayEntry) => {
    setResetting(undefined);
    setIssues(
      entry.kind === 'hidden' ? setNodeHidden(entry.nodeId, false) : resetNode(entry.nodeId),
    );
  };

  return (
    <>
      <Stack.Screen options={stackHeaderOptions('My progressions')} />
      <Screen testID="progressions-screen">
        {overlayUnreadable.length > 0 && (
          <IssueNotes
            title="Your saved changes couldn't be read"
            messages={[
              'The built-in tree is used. The saved changes stay on this device, but your next change to the tree or an import replaces them.',
              ...overlayUnreadable.map(formatIssue),
            ]}
            testID="overlay-unreadable"
          />
        )}
        {overlayIssues.length > 0 && (
          <IssueNotes
            title="Your changes don't fit this version"
            messages={[
              'The built-in tree is used until you fix or reset them. Your changes are kept.',
              ...overlayIssues.map(formatIssue),
            ]}
            testID="overlay-stale"
          />
        )}
        <DetailSection
          title="Your changes"
          icon="quill"
          variant="arcane"
          testID="progressions-list">
          {entries.length === 0 ? (
            <EmptyState
              icon="quill"
              title="No changes yet"
              message="Open a skill and choose Edit progression, or add your own exercise from the tree."
            />
          ) : (
            entries.map((entry) => (
              <OverlayEntryRow
                key={`${entry.kind}-${entry.nodeId}`}
                entry={entry}
                onOpen={
                  entry.kind === 'hidden'
                    ? undefined
                    : () =>
                        router.push({
                          pathname: '/node/[nodeId]',
                          params: { nodeId: entry.nodeId },
                        })
                }
                actionLabel={
                  entry.kind === 'hidden' ? 'Show' : entry.kind === 'added' ? 'Delete' : 'Reset'
                }
                onAction={() => (entry.kind === 'hidden' ? reset(entry) : setResetting(entry))}
              />
            ))
          )}
          <IssueNotes
            messages={issues.map(formatIssue)}
            title="Not changed: the tree would break"
            testID="progressions-issues"
          />
        </DetailSection>

        <SharePanel hasChanges={entries.length > 0} />

        <PixelModal
          visible={resetting !== undefined}
          title={resetting?.kind === 'added' ? `Delete ${resetting.name}?` : 'Reset to default?'}
          onClose={() => setResetting(undefined)}
          closeLabel="Keep it"
          testID="entry-reset-dialog">
          <PixelText>
            {resetting?.kind === 'added'
              ? 'Your exercise leaves the tree. Its logged sets stay in your history but no longer count.'
              : `${resetting?.name ?? ''} goes back to the built-in version.`}
          </PixelText>
          <PixelButton
            label={resetting?.kind === 'added' ? 'Delete' : 'Reset'}
            variant="danger"
            onPress={() => resetting && reset(resetting)}
            testID="entry-reset-confirm"
          />
        </PixelModal>
      </Screen>
    </>
  );
}
