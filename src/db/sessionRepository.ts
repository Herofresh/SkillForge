/**
 * Logged sessions and their sets: the source of truth for all progress (ADR-008, ADR-021). Rows of
 * `session_sets` map 1:1 to `LoggedSet`; `prescribed`/`actual` are stored as flat columns.
 */
import { asc } from 'drizzle-orm';

import {
  METRICS,
  type LoggedSession,
  type LoggedSet,
  type SessionDetails,
  type SetPerformance,
  type StoredSession,
} from '@/domain/types';

import type { AppDb } from './database';
import { oneOf, optional } from './rowGuards';
import { sessionSets, sessions } from './schema';

type SetRow = typeof sessionSets.$inferSelect;

function toPerformance(value: number, reps: number | null): SetPerformance {
  const optionalReps = optional(reps);
  return optionalReps === undefined ? { value } : { value, reps: optionalReps };
}

function toLoggedSet(row: SetRow): LoggedSet {
  const durationSec = optional(row.durationSec);
  return {
    sessionId: row.sessionId,
    nodeId: row.nodeId,
    setIndex: row.setIndex,
    metric: oneOf(METRICS, row.metric, 'session_sets.metric'),
    prescribed: toPerformance(row.prescribedValue, row.prescribedReps),
    actual: toPerformance(row.actualValue, row.actualReps),
    isTrial: row.isTrial,
    timestamp: row.timestamp,
    ...(durationSec !== undefined ? { durationSec } : {}),
  };
}

function toSetRow(set: LoggedSet, sessionId: string): SetRow {
  return {
    sessionId,
    setIndex: set.setIndex,
    nodeId: set.nodeId,
    metric: set.metric,
    prescribedValue: set.prescribed.value,
    prescribedReps: set.prescribed.reps ?? null,
    actualValue: set.actual.value,
    actualReps: set.actual.reps ?? null,
    isTrial: set.isTrial,
    timestamp: set.timestamp,
    durationSec: set.durationSec ?? null,
  };
}

/**
 * Stores a session and all its sets in one transaction. Every set must belong to the session.
 * Throws (and stores nothing) if the id or a set index already exists.
 */
export function insertSession(
  db: AppDb,
  session: LoggedSession,
  details: SessionDetails = {},
): void {
  const foreign = session.sets.find((set) => set.sessionId !== session.id);
  if (foreign) {
    throw new Error(`Set ${foreign.setIndex} belongs to session '${foreign.sessionId}'`);
  }
  db.transaction((tx) => {
    tx.insert(sessions)
      .values({
        id: session.id,
        startedAt: session.startedAt,
        endedAt: details.endedAt ?? null,
        equipmentProfileId: details.equipmentProfileId ?? null,
      })
      .run();
    if (session.sets.length > 0) {
      tx.insert(sessionSets)
        .values(session.sets.map((set) => toSetRow(set, session.id)))
        .run();
    }
  });
}

/** Every logged session with its sets (in set order) and stored details, oldest first. */
export function listStoredSessions(db: AppDb): StoredSession[] {
  const setsBySession = new Map<string, LoggedSet[]>();
  const setRows = db
    .select()
    .from(sessionSets)
    .orderBy(asc(sessionSets.sessionId), asc(sessionSets.setIndex))
    .all();
  for (const row of setRows) {
    const list = setsBySession.get(row.sessionId);
    if (list) list.push(toLoggedSet(row));
    else setsBySession.set(row.sessionId, [toLoggedSet(row)]);
  }
  return db
    .select()
    .from(sessions)
    .orderBy(asc(sessions.startedAt), asc(sessions.id))
    .all()
    .map((row) => {
      const endedAt = optional(row.endedAt);
      const equipmentProfileId = optional(row.equipmentProfileId);
      return {
        id: row.id,
        startedAt: row.startedAt,
        sets: setsBySession.get(row.id) ?? [],
        ...(endedAt !== undefined ? { endedAt } : {}),
        ...(equipmentProfileId !== undefined ? { equipmentProfileId } : {}),
      };
    });
}

/** Every logged session with its sets (in set order), oldest first: the engine's history. */
export function listSessions(db: AppDb): LoggedSession[] {
  return listStoredSessions(db).map(({ id, startedAt, sets }) => ({ id, startedAt, sets }));
}
