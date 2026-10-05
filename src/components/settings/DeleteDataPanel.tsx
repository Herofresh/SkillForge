import { useState } from 'react';
import { Keyboard } from 'react-native';

import { useAppStore } from '@/store/useAppStore';

import { DetailSection } from '../node/DetailSection';
import { PixelButton, PixelModal, PixelText, WarningBanner } from '../ui';

/** Exactly what "Delete all my data" deletes (the store's `deleteAllData`, ADR-065). */
export const DELETED_DATA_TEXT =
  'This deletes everything SkillForge stored on this phone: your hero and name, every logged ' +
  'session and Trial, goals, equipment profiles, your tree changes, classes, challenges, the ' +
  'companion and all settings, the session in progress, the safety copies from earlier imports, ' +
  'exported files the app kept and the widget’s data.';

const AFTERWARDS_TEXT =
  'The app then starts fresh with the Home and Park profiles, like a new install, and opens the ' +
  'intro. Android’s own device backup may keep an older copy until it next backs up the app.';

/**
 * "Delete all my data" (PLAN 7.0b, ADR-065): a sheet that says exactly what goes, offers an export
 * first, and only enables the destructive button after the user acknowledged that it can't be
 * undone. The wipe itself is the store's `deleteAllData`; the tabs then open onboarding.
 */
export function DeleteDataPanel() {
  const deleteAllData = useAppStore((state) => state.deleteAllData);
  const shareBackup = useAppStore((state) => state.shareBackup);
  const [confirming, setConfirming] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [exportNote, setExportNote] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const close = () => {
    setConfirming(false);
    setAcknowledged(false);
    setExportNote(undefined);
  };

  const exportFirst = async () => {
    Keyboard.dismiss();
    try {
      await shareBackup();
      setExportNote('Backup handed to the share sheet.');
    } catch (exportError) {
      setExportNote(exportError instanceof Error ? exportError.message : 'Export failed.');
    }
  };

  const confirm = () => {
    close();
    try {
      const { filesLeft } = deleteAllData();
      if (filesLeft.length > 0) {
        setError(`Your data is deleted, but these files could not be: ${filesLeft.join(', ')}.`);
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? `${deleteError.message} Your data was not deleted.`
          : 'Something went wrong. Your data was not deleted.',
      );
    }
  };

  return (
    <DetailSection title="Delete data" icon="alert" testID="settings-delete-data">
      <PixelText variant="small" tone="textMuted">
        Erase everything SkillForge stored on this phone and start fresh.
      </PixelText>
      <PixelButton
        label="Delete all my data"
        variant="danger"
        onPress={() => setConfirming(true)}
        testID="delete-data"
      />
      {error !== undefined && (
        <PixelText variant="small" tone="danger" testID="delete-data-error">
          {error}
        </PixelText>
      )}
      <PixelModal
        visible={confirming}
        title="Delete all your data?"
        onClose={close}
        closeLabel="Cancel"
        testID="delete-data-dialog">
        <PixelText>{DELETED_DATA_TEXT}</PixelText>
        <PixelText variant="small" tone="textMuted">
          {AFTERWARDS_TEXT}
        </PixelText>
        <PixelButton
          label="Export backup first"
          icon="scroll"
          variant="secondary"
          onPress={() => void exportFirst()}
          testID="delete-data-export"
        />
        {exportNote !== undefined && (
          <PixelText variant="small" tone="textMuted" accessibilityLiveRegion="polite">
            {exportNote}
          </PixelText>
        )}
        <WarningBanner
          severity="warning"
          title="This can’t be undone"
          message="Without a backup file, nothing of your hero can be brought back."
          acknowledged={acknowledged}
          onAcknowledge={() => setAcknowledged(true)}
          testID="delete-data-warning"
        />
        <PixelButton
          label="Delete everything"
          variant="danger"
          onPress={confirm}
          disabled={!acknowledged}
          testID="delete-data-confirm"
        />
      </PixelModal>
    </DetailSection>
  );
}
