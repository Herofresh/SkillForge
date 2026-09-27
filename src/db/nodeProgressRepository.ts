/**
 * The `node_progress` CACHE (ADR-008). It is written from `recompute`'s `EngineState.progress` and
 * can be deleted at any time: the store rebuilds it from `session_sets` and `user_actions`.
 */
import type { NodeProgress } from '@/domain/types';

import type { AppDb } from './database';
import { nodeProgress } from './schema';

type Row = typeof nodeProgress.$inferSelect;

function toRow(progress: NodeProgress): Row {
  return {
    nodeId: progress.nodeId,
    xp: progress.xp,
    level: progress.level,
    trialPassed: progress.trialPassed,
    trialPassedAt: progress.trialPassedAt ?? null,
    firstTrainedAt: progress.firstTrainedAt ?? null,
    lastTrainedAt: progress.lastTrainedAt ?? null,
    selfUnlockedAt: progress.selfUnlockedAt ?? null,
  };
}

function toProgress(row: Row): NodeProgress {
  const progress: NodeProgress = {
    nodeId: row.nodeId,
    xp: row.xp,
    level: row.level,
    trialPassed: row.trialPassed,
  };
  if (row.trialPassedAt !== null) progress.trialPassedAt = row.trialPassedAt;
  if (row.firstTrainedAt !== null) progress.firstTrainedAt = row.firstTrainedAt;
  if (row.lastTrainedAt !== null) progress.lastTrainedAt = row.lastTrainedAt;
  if (row.selfUnlockedAt !== null) progress.selfUnlockedAt = row.selfUnlockedAt;
  return progress;
}

/** Replaces the whole cache with `progress` in one transaction. */
export function replaceNodeProgress(
  db: AppDb,
  progress: Readonly<Record<string, NodeProgress>>,
): void {
  const rows = Object.values(progress).map(toRow);
  db.transaction((tx) => {
    tx.delete(nodeProgress).run();
    if (rows.length > 0) tx.insert(nodeProgress).values(rows).run();
  });
}

/** The cached progress by node id. */
export function readNodeProgress(db: AppDb): Record<string, NodeProgress> {
  const result: Record<string, NodeProgress> = {};
  for (const row of db.select().from(nodeProgress).all()) result[row.nodeId] = toProgress(row);
  return result;
}

export function clearNodeProgress(db: AppDb): void {
  db.delete(nodeProgress).run();
}
