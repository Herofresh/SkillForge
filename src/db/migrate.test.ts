import { DEFAULT_EQUIPMENT_PROFILES } from '@/domain/equipment';

import { deleteEquipmentProfile, listEquipmentProfiles } from './equipmentProfileRepository';
import { META_KEYS, getMeta, setMeta } from './metaRepository';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import { migrateDatabase, SCHEMA_VERSION } from './migrate';
import migrations from './migrations/migrations';
import { getProfile } from './profileRepository';
import { insertSession, listSessions } from './sessionRepository';
import {
  openTestDatabase,
  openUnmigrated,
  TEST_SEED_TIME,
  type TestDatabase,
} from './testing/testDatabase';

const TABLES = [
  'equipment_profiles',
  'goals',
  'meta',
  'node_progress',
  'profile',
  'session_sets',
  'sessions',
  'settings',
  'user_actions',
];

function tableNames(test: TestDatabase): string[] {
  return (
    test.sqlite.raw
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all() as { name: string }[]
  ).map((row) => row.name);
}

describe('migrateDatabase', () => {
  it('creates every table and records the schema version', async () => {
    const test = await openTestDatabase();
    expect(tableNames(test)).toEqual(expect.arrayContaining(TABLES));
    expect(getMeta(test.db, META_KEYS.schemaVersion)).toBe(String(SCHEMA_VERSION));
    expect(SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
    test.close();
  });

  it('seeds the Home and Park profiles and the hero profile on the first run', async () => {
    const test = await openTestDatabase();
    expect(listEquipmentProfiles(test.db)).toEqual(DEFAULT_EQUIPMENT_PROFILES);
    expect(listEquipmentProfiles(test.db).map((profile) => profile.name)).toEqual(['Home', 'Park']);
    expect(getProfile(test.db)).toEqual({ createdAt: TEST_SEED_TIME });
    test.close();
  });

  it('is idempotent and never re-seeds a default the user deleted', async () => {
    const test = await openTestDatabase();
    insertSession(test.db, { id: 's1', startedAt: 1, sets: [] });
    deleteEquipmentProfile(test.db, 'home');
    await migrateDatabase(test.db, TEST_SEED_TIME + 1);
    expect(listEquipmentProfiles(test.db).map((profile) => profile.id)).toEqual(['park']);
    expect(listSessions(test.db)).toHaveLength(1);
    expect(getProfile(test.db)?.createdAt).toBe(TEST_SEED_TIME);
    test.close();
  });

  it('refuses a database from a newer app version and leaves it unchanged', async () => {
    const test = await openTestDatabase();
    insertSession(test.db, { id: 's1', startedAt: 1, sets: [] });
    setMeta(test.db, META_KEYS.schemaVersion, String(SCHEMA_VERSION + 1));
    await expect(migrateDatabase(test.db, TEST_SEED_TIME)).rejects.toThrow(/newer|only knows/);
    expect(getMeta(test.db, META_KEYS.schemaVersion)).toBe(String(SCHEMA_VERSION + 1));
    expect(listSessions(test.db)).toHaveLength(1);
    test.close();
  });

  it('upgrades a v0.1.0 database (3 migrations) with its data intact (PLAN 5.4, 5.7)', async () => {
    const test = openUnmigrated();
    const V0_1_0_MIGRATIONS = 3;
    const entries = migrations.journal.entries.slice(0, V0_1_0_MIGRATIONS);
    const old = Object.fromEntries(
      Object.entries(migrations.migrations).slice(0, V0_1_0_MIGRATIONS),
    ) as typeof migrations.migrations;
    await migrate(test.db, { journal: { ...migrations.journal, entries }, migrations: old });
    // A set as v0.1.0 wrote it: no duration_sec column yet.
    test.sqlite.raw.exec(
      "INSERT INTO sessions (id, started_at, ended_at) VALUES ('old', 1000, 2000);" +
        'INSERT INTO session_sets (session_id, set_index, node_id, metric, prescribed_value, ' +
        "actual_value, is_trial, timestamp) VALUES ('old', 0, 'dead_hang', 'hold_s', 30, 31, 0, 1500);",
    );

    await migrateDatabase(test.db, TEST_SEED_TIME);
    expect(getMeta(test.db, META_KEYS.schemaVersion)).toBe(String(SCHEMA_VERSION));
    expect(listSessions(test.db)).toEqual([
      {
        id: 'old',
        startedAt: 1000,
        sets: [
          {
            sessionId: 'old',
            setIndex: 0,
            nodeId: 'dead_hang',
            metric: 'hold_s',
            prescribed: { value: 30 },
            actual: { value: 31 },
            isTrial: false,
            timestamp: 1500,
          },
        ],
      },
    ]);
    test.close();
  });

  it('turns on foreign keys for every connection', () => {
    const test = openUnmigrated();
    expect(test.sqlite.raw.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 });
    test.close();
  });
});
