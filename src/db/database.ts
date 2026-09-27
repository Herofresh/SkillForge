/**
 * The Drizzle database type and factory (ADR-026). The app opens its file with `openAppDatabase`
 * (`openAppDatabase.ts`); tests pass a Node-backed client (`testing/nodeSqliteClient.ts`) to the
 * same factory, so both run the real Drizzle expo-sqlite driver.
 */
import { drizzle } from 'drizzle-orm/expo-sqlite/driver';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { SQLiteDatabase, SQLiteRunResult } from 'expo-sqlite';

import * as schema from './schema';

export type AppSchema = typeof schema;

/** The database or a transaction on it; every repository function takes one. */
export type AppDb = BaseSQLiteDatabase<'sync', SQLiteRunResult, AppSchema>;

/** Wraps an open expo-sqlite connection. Turns on foreign keys (off by default in SQLite). */
export function createDatabase(client: SQLiteDatabase): AppDb {
  client.execSync('PRAGMA foreign_keys = ON;');
  return drizzle(client, { schema });
}
