/**
 * The app's file access for backups (PLAN 3.3, ADR-028): expo-file-system for files, expo-sharing
 * for the share sheet and expo-document-picker to choose a file. Only I/O lives here; the format and
 * the checks are in `src/domain/backup.ts`, the flow in the store (`shareBackup`,
 * `importBackupFromFile`, `importBackup`). Not used by tests (native modules).
 */
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { BACKUP_MIME_TYPE } from '@/domain/backup';
import { importFileSizeProblem } from '@/lib/importFile';

import type { BackupFiles, ShareOptions } from './appStore';

/** Folder in the app's document directory for the safety copies written before an import. */
export const SAFETY_COPY_FOLDER = 'backups';

/**
 * Any file: Android file providers often report JSON as `application/octet-stream` or `text/plain`,
 * so a strict filter would hide real backups. `parseBackup` rejects anything else with a message.
 */
const PICKABLE_TYPES = '*/*';

async function share(fileName: string, text: string, options: ShareOptions = {}): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing files is not available on this device');
  }
  const file = new File(Paths.cache, fileName);
  file.write(text);
  await Sharing.shareAsync(file.uri, {
    mimeType: options.mimeType ?? BACKUP_MIME_TYPE,
    dialogTitle: options.dialogTitle ?? 'Save your SkillForge backup',
  });
}

async function pick(): Promise<string | undefined> {
  const result = await DocumentPicker.getDocumentAsync({
    type: PICKABLE_TYPES,
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return undefined;
  const asset = result.assets[0];
  const file = new File(asset.uri);
  // Checked before reading: the picker allows any file. The thrown message is shown where the
  // import's other errors are (Settings → Backup, Import progressions).
  const problem = importFileSizeProblem(asset.size ?? file.size);
  if (problem !== undefined) throw new Error(problem);
  return file.text();
}

function saveSafetyCopy(fileName: string, text: string): string {
  const folder = new Directory(Paths.document, SAFETY_COPY_FOLDER);
  folder.create({ idempotent: true, intermediates: true });
  const file = new File(folder, fileName);
  file.write(text);
  return file.uri;
}

export const deviceBackupFiles: BackupFiles = { share, pick, saveSafetyCopy };
