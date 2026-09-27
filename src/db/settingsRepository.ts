import { asc, eq } from 'drizzle-orm';

import type { AppDb } from './database';
import { settings } from './schema';

/** A stored setting, or `undefined` when it was never set. Values are JSON. */
export function getSetting(db: AppDb, key: string): unknown {
  return db.select().from(settings).where(eq(settings.key, key)).get()?.value;
}

export function setSetting(db: AppDb, key: string, value: unknown): void {
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } })
    .run();
}

/** Every stored setting by key. */
export function listSettings(db: AppDb): Record<string, unknown> {
  return Object.fromEntries(
    db
      .select()
      .from(settings)
      .orderBy(asc(settings.key))
      .all()
      .map((row) => [row.key, row.value]),
  );
}
