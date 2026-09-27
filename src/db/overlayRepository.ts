/**
 * The user's progression overlay (ADR-016, PLAN 3.4): one current overlay, stored in the
 * `overlayToRaw` shape and read back through the same `overlayFromRaw` checks as a shared file.
 * Whether it fits the tree is the store's job (`applyOverlay`); this module only stores and loads.
 */
import { eq } from 'drizzle-orm';

import { formatIssue } from '@/data/validate';
import { overlayFromRaw, overlayToRaw } from '@/domain/overlay';
import type { ProgressionOverlay } from '@/domain/types';

import type { AppDb } from './database';
import { progressionOverlay } from './schema';

/** The table holds one row with this id. */
const OVERLAY_ROW_ID = 1;

export interface StoredOverlay {
  overlay: ProgressionOverlay;
  /** 1 for the first save, +1 for every save after it. */
  revision: number;
  savedAt: number;
}

/** The stored overlay, or `undefined` when the user never saved one. Throws on a corrupt row. */
export function getOverlay(db: AppDb): StoredOverlay | undefined {
  const row = db
    .select()
    .from(progressionOverlay)
    .where(eq(progressionOverlay.id, OVERLAY_ROW_ID))
    .get();
  if (!row) return undefined;
  const { overlay, issues } = overlayFromRaw(row.body);
  if (!overlay) {
    throw new Error(`The stored overlay cannot be read: ${issues.map(formatIssue).join('; ')}`);
  }
  return { overlay, revision: row.revision, savedAt: row.savedAt };
}

/** Replaces the current overlay and bumps its revision. Call only with an overlay that applies. */
export function saveOverlay(db: AppDb, overlay: ProgressionOverlay, now: number): void {
  const revision = (getOverlay(db)?.revision ?? 0) + 1;
  const row = { revision, savedAt: now, body: overlayToRaw(overlay) };
  db.insert(progressionOverlay)
    .values({ id: OVERLAY_ROW_ID, ...row })
    .onConflictDoUpdate({ target: progressionOverlay.id, set: row })
    .run();
}

export function clearOverlay(db: AppDb): void {
  db.delete(progressionOverlay).run();
}
