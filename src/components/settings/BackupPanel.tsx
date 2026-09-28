import { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import { backupIssueLines } from '@/domain/backup';
import type { ValidationIssue } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

import { DetailSection } from '../node/DetailSection';
import { Spacing } from '../theme';
import { PixelButton, PixelFrame, PixelIcon, PixelModal, PixelText } from '../ui';

/** What the last export/import attempt ended in, shown under the buttons. */
type Outcome =
  | { kind: 'exported' }
  | { kind: 'imported'; fileName: string }
  | { kind: 'undone' }
  | { kind: 'canceled' }
  | { kind: 'rejected'; issues: ValidationIssue[] }
  | { kind: 'error'; message: string };

type Dialog = 'import' | 'undo';

const errorText = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong.';

/**
 * Backups (PLAN 4.6, ADR-028): export all data to the share sheet; import a backup after a clear
 * "replaces all your data" confirmation (issues of a rejected file listed, nothing changed); undo
 * the last import from its safety copy. The flows themselves live in the store.
 */
export function BackupPanel() {
  const shareBackup = useAppStore((state) => state.shareBackup);
  const importBackupFromFile = useAppStore((state) => state.importBackupFromFile);
  const undoLastImport = useAppStore((state) => state.undoLastImport);
  const lastImport = useAppStore((state) => state.lastImport);
  const sessionInProgress = useAppStore((state) => state.activeSession !== undefined);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog | undefined>();
  const [outcome, setOutcome] = useState<Outcome | undefined>();

  const run = async (action: () => Promise<Outcome> | Outcome) => {
    setDialog(undefined);
    // Android re-focuses the last text field (and its keyboard) when the share sheet or the file
    // picker returns: blur it before leaving.
    Keyboard.dismiss();
    setBusy(true);
    try {
      setOutcome(await action());
    } catch (error) {
      setOutcome({ kind: 'error', message: errorText(error) });
    } finally {
      setBusy(false);
    }
  };

  const exportData = () =>
    run(async () => {
      await shareBackup();
      return { kind: 'exported' };
    });

  const importData = () =>
    run(async () => {
      const result = await importBackupFromFile();
      if (result.status === 'imported') {
        return { kind: 'imported', fileName: result.safetyCopy.fileName };
      }
      if (result.status === 'rejected') return { kind: 'rejected', issues: result.issues };
      return { kind: 'canceled' };
    });

  const undo = () =>
    run(() => {
      const result = undoLastImport();
      return result.status === 'imported'
        ? { kind: 'undone' }
        : { kind: 'rejected', issues: result.issues };
    });

  return (
    <DetailSection title="Backup" icon="scroll" testID="settings-backup">
      <PixelText variant="small" tone="textMuted">
        Your data lives only on this phone. Export a backup now and then, e.g. to your Drive.
      </PixelText>
      <PixelButton
        label="Export backup"
        onPress={exportData}
        disabled={busy}
        testID="export-backup"
      />
      <PixelButton
        label="Import backup"
        variant="secondary"
        onPress={() => setDialog('import')}
        disabled={busy}
        testID="import-backup"
      />
      {lastImport && (
        <PixelButton
          label="Undo last import"
          variant="secondary"
          icon="potion"
          onPress={() => setDialog('undo')}
          disabled={busy}
          testID="undo-import"
        />
      )}
      {outcome && <OutcomeNote outcome={outcome} />}

      <PixelModal
        visible={dialog === 'import'}
        title="Replace all data?"
        onClose={() => setDialog(undefined)}
        closeLabel="Cancel"
        testID="import-dialog">
        <PixelText>
          This replaces all your data: hero, goals, equipment, every logged session and your tree
          changes.
          {sessionInProgress ? ' The session in progress is discarded too.' : ''}
        </PixelText>
        <PixelText variant="small" tone="textMuted">
          A safety copy of your current data is saved first, so you can undo the import.
        </PixelText>
        <PixelButton
          label="Choose file and replace"
          variant="danger"
          onPress={importData}
          testID="import-confirm"
        />
      </PixelModal>

      <PixelModal
        visible={dialog === 'undo'}
        title="Undo the import?"
        onClose={() => setDialog(undefined)}
        closeLabel="Cancel"
        testID="undo-dialog">
        <PixelText>
          Your data goes back to how it was before the last import. The imported data is replaced (a
          safety copy of it is saved too).
        </PixelText>
        <PixelButton label="Undo import" variant="danger" onPress={undo} testID="undo-confirm" />
      </PixelModal>
    </DetailSection>
  );
}

function outcomeText(outcome: Exclude<Outcome, { kind: 'rejected' }>): string {
  switch (outcome.kind) {
    case 'exported':
      return 'Backup handed to the share sheet.';
    case 'imported':
      return `Backup imported. Your previous data was saved as ${outcome.fileName}.`;
    case 'undone':
      return 'Import undone: your previous data is back.';
    case 'canceled':
      return 'No file chosen. Nothing changed.';
    case 'error':
      return outcome.message;
  }
}

function OutcomeNote({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === 'rejected') {
    const { lines, more } = backupIssueLines(outcome.issues);
    return (
      <PixelFrame variant="danger" contentStyle={styles.gap} testID="import-rejected">
        <View style={styles.row} accessibilityLiveRegion="polite">
          <PixelIcon name="alert" />
          <PixelText variant="heading" tone="ember" style={styles.flex}>
            This file can’t be imported
          </PixelText>
        </View>
        <PixelText variant="small">Nothing was changed. What is wrong with it:</PixelText>
        {lines.map((line, index) => (
          <PixelText key={index} variant="small">
            {`• ${line}`}
          </PixelText>
        ))}
        {more > 0 && (
          <PixelText variant="small" tone="textMuted">
            {`… and ${more} more`}
          </PixelText>
        )}
      </PixelFrame>
    );
  }
  const isError = outcome.kind === 'error';
  return (
    <View style={styles.row} accessibilityLiveRegion="polite" testID={`backup-${outcome.kind}`}>
      <PixelIcon name={isError ? 'alert' : 'check'} />
      <PixelText variant="small" tone={isError ? 'danger' : 'success'} style={styles.flex}>
        {outcomeText(outcome)}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
