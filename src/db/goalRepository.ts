import { asc } from 'drizzle-orm';

import type { AppDb } from './database';
import { goals } from './schema';

/** Goal node ids, most important first. */
export function listGoals(db: AppDb): string[] {
  return db
    .select()
    .from(goals)
    .orderBy(asc(goals.position))
    .all()
    .map((row) => row.nodeId);
}

/** Replaces the goal list (duplicates keep their first position). */
export function replaceGoals(db: AppDb, nodeIds: readonly string[]): void {
  const unique = [...new Set(nodeIds)];
  db.transaction((tx) => {
    tx.delete(goals).run();
    if (unique.length > 0) {
      tx.insert(goals)
        .values(unique.map((nodeId, position) => ({ nodeId, position })))
        .run();
    }
  });
}
