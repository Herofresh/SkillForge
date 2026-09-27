import { eq } from 'drizzle-orm';

import type { AppDb } from './database';
import { meta } from './schema';

/** Keys of the `meta` table. */
export const META_KEYS = {
  /** Number of migrations applied, written after every successful migration run. */
  schemaVersion: 'schema_version',
  /** Set once the first-run defaults (hero profile, Home and Park) have been written. */
  defaultsSeededAt: 'defaults_seeded_at',
} as const;
export type MetaKey = (typeof META_KEYS)[keyof typeof META_KEYS];

export function getMeta(db: AppDb, key: MetaKey): string | undefined {
  return db.select().from(meta).where(eq(meta.key, key)).get()?.value;
}

export function setMeta(db: AppDb, key: MetaKey, value: string): void {
  db.insert(meta)
    .values({ key, value })
    .onConflictDoUpdate({ target: meta.key, set: { value } })
    .run();
}
