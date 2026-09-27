/**
 * The Train flow's session in progress (PLAN 4.4, ADR-034): one row, the whole `ActiveSession` as
 * JSON, validated with `parseActiveSession` when read back. A row that no longer parses (e.g. from a
 * newer app version) reads as no session; it is overwritten by the next save.
 */
import { eq } from 'drizzle-orm';

import { parseActiveSession, type ActiveSession } from '@/domain/train';

import type { AppDb } from './database';
import { activeSession } from './schema';

/** The table holds one row with this id. */
const ACTIVE_SESSION_ROW_ID = 1;

export function getActiveSession(db: AppDb): ActiveSession | undefined {
  const row = db
    .select()
    .from(activeSession)
    .where(eq(activeSession.id, ACTIVE_SESSION_ROW_ID))
    .get();
  return row ? parseActiveSession(row.body) : undefined;
}

export function saveActiveSession(db: AppDb, session: ActiveSession, now: number): void {
  const row = { updatedAt: now, body: session };
  db.insert(activeSession)
    .values({ id: ACTIVE_SESSION_ROW_ID, ...row })
    .onConflictDoUpdate({ target: activeSession.id, set: row })
    .run();
}

export function clearActiveSession(db: AppDb): void {
  db.delete(activeSession).run();
}
