/**
 * The user's progression overlay (ADR-016, PLAN 3.4): one current overlay, stored in the
 * `overlayToRaw` shape and read back through the same `overlayFromRaw` checks as a shared file.
 * Whether it fits the tree is the store's job (`applyOverlay`); this module only stores and loads.
 */
import { eq, sql } from 'drizzle-orm';

import { EMPTY_OVERLAY, overlayFromRaw, overlayToRaw } from '@/domain/overlay';
import type { ProgressionOverlay, ValidationIssue } from '@/domain/types';

import type { AppDb } from './database';
import { progressionOverlay } from './schema';

/** The table holds one row with this id. */
const OVERLAY_ROW_ID = 1;

export interface StoredOverlay {
  overlay: ProgressionOverlay;
  /** 1 for the first save, +1 for every save after it. */
  revision: number;
  savedAt: number;
  /**
   * Set when the stored row no longer reads (PLAN 7.0a): `overlay` is then empty, so the app still
   * starts on the built-in tree, and the row itself is left as it is.
   */
  unreadable?: ValidationIssue[];
}

/** The stored overlay, or `undefined` when the user never saved one. Never throws on a bad row. */
export function getOverlay(db: AppDb): StoredOverlay | undefined {
  // The body is read as plain text so that broken JSON is reported like any other bad row instead
  // of throwing inside the JSON column's decoder.
  const row = db
    .select({
      revision: progressionOverlay.revision,
      savedAt: progressionOverlay.savedAt,
      body: sql<string>`${progressionOverlay.body}`,
    })
    .from(progressionOverlay)
    .where(eq(progressionOverlay.id, OVERLAY_ROW_ID))
    .get();
  if (!row) return undefined;
  const { overlay, issues } = overlayFromRaw(parseBody(row.body));
  const stored = { revision: row.revision, savedAt: row.savedAt };
  if (!overlay) return { ...stored, overlay: EMPTY_OVERLAY, unreadable: issues };
  return { ...stored, overlay };
}

/** The stored JSON, or `undefined` (which `overlayFromRaw` reports) when it isn't JSON. */
function parseBody(body: string): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return undefined;
  }
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
