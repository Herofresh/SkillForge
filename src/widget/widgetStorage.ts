/**
 * Where the app leaves the widget's snapshot (PLAN 6.6, ADR-055): one JSON file in the app's
 * document directory. The widget's background task can run while the app is closed, so it reads
 * this file instead of opening the database and replaying the history. Only I/O lives here; the
 * shape and its checks are in `src/domain/widget.ts`.
 */
import { File, Paths } from 'expo-file-system';

import { parseWidgetSnapshot, type WidgetSnapshot } from '@/domain/widget';

export const WIDGET_SNAPSHOT_FILE = 'widget-snapshot.json';

const snapshotFile = (): File => new File(Paths.document, WIDGET_SNAPSHOT_FILE);

export function writeWidgetSnapshot(snapshot: WidgetSnapshot): void {
  snapshotFile().write(JSON.stringify(snapshot));
}

/** Deletes the snapshot ("Delete all my data", PLAN 7.0b); nothing happens when there is none. */
export function deleteWidgetSnapshot(): void {
  const file = snapshotFile();
  if (file.exists) file.delete();
}

/** The stored snapshot, or `undefined` when there is none yet or it can't be read. */
export async function readWidgetSnapshot(): Promise<WidgetSnapshot | undefined> {
  const file = snapshotFile();
  if (!file.exists) return undefined;
  try {
    return parseWidgetSnapshot(await file.text());
  } catch {
    return undefined;
  }
}
