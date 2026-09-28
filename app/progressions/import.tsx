import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard } from 'react-native';

import { IssueNotes } from '@/components/editor/IssueNotes';
import { OverlayEntryRow } from '@/components/editor/OverlayEntryRow';
import { DetailSection } from '@/components/node/DetailSection';
import { stackHeaderOptions } from '@/components/stackHeader';
import { PixelButton, PixelText, PixelTextInput, Screen } from '@/components/ui';
import { formatIssue } from '@/data/validate';
import { useAppStore } from '@/store/useAppStore';
import type { OverlayTextPreview } from '@/store/appStore';

/**
 * "Import progressions" (PLAN 4.8, ADR-036): paste shared YAML or pick the file, see what it adds,
 * changes and hides (and what replaces your own changes), and import it only when the merged tree
 * is valid. Your other changes stay.
 */
export default function ImportProgressionsScreen() {
  const router = useRouter();
  const previewOverlayImport = useAppStore((state) => state.previewOverlayImport);
  const importOverlay = useAppStore((state) => state.importOverlay);
  const pickOverlayFile = useAppStore((state) => state.pickOverlayFile);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<OverlayTextPreview | undefined>();
  const [failure, setFailure] = useState<string[]>([]);

  const show = (value: string) => {
    Keyboard.dismiss();
    setFailure([]);
    setPreview(value.trim() === '' ? undefined : previewOverlayImport(value));
  };
  const pick = async () => {
    try {
      const picked = await pickOverlayFile();
      if (picked === undefined) return;
      setText(picked);
      show(picked);
    } catch (error) {
      setFailure([error instanceof Error ? error.message : 'The file could not be read.']);
    }
  };
  const confirm = () => {
    const issues = importOverlay(text);
    if (issues.length === 0) router.back();
    else setFailure(issues.map(formatIssue));
  };
  const ready = preview?.status === 'ready' ? preview.preview : undefined;

  return (
    <>
      <Stack.Screen options={stackHeaderOptions('Import progressions')} />
      <Screen testID="import-progressions-screen">
        <PixelText variant="small" tone="textMuted">
          Shared progressions are merged into yours: their exercises and changes replace yours for
          the same skill, everything else of yours stays.
        </PixelText>
        <PixelTextInput
          label="Paste the YAML"
          value={text}
          onChangeText={(value) => {
            setText(value);
            setPreview(undefined);
          }}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="format: skillforge-progression-overlay"
          testID="import-text"
        />
        <PixelButton
          label="Preview"
          icon="scroll"
          onPress={() => show(text)}
          disabled={text.trim() === ''}
          testID="import-preview"
        />
        <PixelButton
          label="Choose file"
          icon="rune"
          variant="secondary"
          onPress={pick}
          testID="import-pick"
        />

        {preview?.status === 'unreadable' && (
          <IssueNotes
            title="This can't be read"
            messages={preview.issues.map(formatIssue)}
            testID="import-unreadable"
          />
        )}
        {ready && (
          <DetailSection title="What changes" icon="quill" variant="arcane" testID="import-changes">
            {ready.changes.length === 0 ? (
              <PixelText variant="small">Nothing: the file has no changes.</PixelText>
            ) : (
              ready.changes.map((change) => (
                <OverlayEntryRow
                  key={`${change.kind}-${change.nodeId}`}
                  entry={change}
                  replacesYours={change.replacesYours}
                />
              ))
            )}
            <IssueNotes
              title="It doesn't fit your tree"
              messages={ready.issues.map(formatIssue)}
              testID="import-issues"
            />
            {ready.issues.length === 0 && ready.changes.length > 0 && (
              <PixelButton
                label="Import"
                icon="check"
                onPress={confirm}
                testID="import-confirm-progressions"
              />
            )}
          </DetailSection>
        )}
        <IssueNotes title="Not imported" messages={failure} testID="import-failed" />
      </Screen>
    </>
  );
}
