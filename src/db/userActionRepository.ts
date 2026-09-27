/** User actions (`self_unlock`, ADR-023): history next to the sessions, replayed by `recompute`. */
import { asc } from 'drizzle-orm';

import { USER_ACTION_KINDS, type UserAction } from '@/domain/types';

import type { AppDb } from './database';
import { oneOf } from './rowGuards';
import { userActions } from './schema';

export function insertUserAction(db: AppDb, action: UserAction): void {
  db.insert(userActions).values(action).run();
}

/** Every user action, oldest first. */
export function listUserActions(db: AppDb): UserAction[] {
  return db
    .select()
    .from(userActions)
    .orderBy(asc(userActions.at), asc(userActions.id))
    .all()
    .map((row) => ({
      id: row.id,
      kind: oneOf(USER_ACTION_KINDS, row.kind, 'user_actions.kind'),
      nodeId: row.nodeId,
      at: row.at,
    }));
}
