/**
 * TEST-ONLY: a migrated database on Node's `node:sqlite` through the real Drizzle expo-sqlite driver
 * (ADR-027). Pass a file path to reopen the same database later (an app restart).
 */
import { createDatabase, type AppDb } from '../database';
import { migrateDatabase } from '../migrate';
import { openNodeSqliteClient, type NodeSqliteClient } from './nodeSqliteClient';

/** A fixed first-run time for seeded rows. */
export const TEST_SEED_TIME = 1_790_000_000_000;

export interface TestDatabase {
  db: AppDb;
  sqlite: NodeSqliteClient;
  close(): void;
}

/** Opens without migrating (to test the migration itself). */
export function openUnmigrated(path?: string): TestDatabase {
  const sqlite = openNodeSqliteClient(path);
  return { db: createDatabase(sqlite.client), sqlite, close: sqlite.close };
}

/** Opens and migrates (first run seeds the defaults). */
export async function openTestDatabase(path?: string, now = TEST_SEED_TIME): Promise<TestDatabase> {
  const test = openUnmigrated(path);
  await migrateDatabase(test.db, now);
  return test;
}
