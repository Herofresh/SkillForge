import { openDatabaseSync } from 'expo-sqlite';

import { createDatabase, type AppDb } from './database';

/** File name of the app database in the app's private storage. Never change it (user data). */
export const DATABASE_NAME = 'skillforge.db';

/** Opens (or creates) the on-device database. Run `migrateDatabase` before reading from it. */
export function openAppDatabase(): AppDb {
  return createDatabase(openDatabaseSync(DATABASE_NAME));
}
