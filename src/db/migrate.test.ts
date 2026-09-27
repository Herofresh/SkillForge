import { DEFAULT_EQUIPMENT_PROFILES } from '@/domain/equipment';

import { deleteEquipmentProfile, listEquipmentProfiles } from './equipmentProfileRepository';
import { META_KEYS, getMeta, setMeta } from './metaRepository';
import { migrateDatabase, SCHEMA_VERSION } from './migrate';
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

  it('turns on foreign keys for every connection', () => {
    const test = openUnmigrated();
    expect(test.sqlite.raw.prepare('PRAGMA foreign_keys').get()).toEqual({ foreign_keys: 1 });
    test.close();
  });
});
