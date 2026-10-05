import { makeSession } from '@/data/testFixtures';
import { DEFAULT_EQUIPMENT_PROFILES } from '@/domain/equipment';
import { EMPTY_OVERLAY } from '@/domain/overlay';

import { insertEquipmentProfile } from './equipmentProfileRepository';
import { replaceGoals } from './goalRepository';
import { META_KEYS, getMeta } from './metaRepository';
import { SCHEMA_VERSION, migrateDatabase } from './migrate';
import { saveOverlay } from './overlayRepository';
import { setHeroName } from './profileRepository';
import { insertSession } from './sessionRepository';
import { setSetting } from './settingsRepository';
import { openTestDatabase, TEST_SEED_TIME, type TestDatabase } from './testing/testDatabase';
import { insertUserAction } from './userActionRepository';
import { deleteAllUserData, readUserData } from './userDataRepository';

const WIPE_TIME = TEST_SEED_TIME + 86_400_000;

/** Every table and the rows each holds, straight from SQLite. */
function rowCounts(test: TestDatabase): Record<string, number> {
  const tables = test.sqlite.raw
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all() as { name: string }[];
  return Object.fromEntries(
    tables.map(({ name }) => [
      name,
      (test.sqlite.raw.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get() as { n: number }).n,
    ]),
  );
}

/** Some of every kind of user data, written through the repositories (raw SQL for the caches). */
function fill(test: TestDatabase): void {
  const { db } = test;
  setHeroName(db, 'Ada');
  insertEquipmentProfile(db, { id: 'gym', name: 'Gym', tags: ['bar', 'floor'] }, 2);
  replaceGoals(db, ['pull_up', 'l_sit']);
  insertSession(
    db,
    makeSession('s1', TEST_SEED_TIME + 1000, [
      {
        nodeId: 'dead_hang',
        count: 2,
        metric: 'hold_s',
        prescribed: { value: 20 },
        actual: { value: 20 },
      },
    ]),
    { endedAt: TEST_SEED_TIME + 2000, equipmentProfileId: 'gym' },
  );
  insertUserAction(db, { id: 'a1', kind: 'self_unlock', nodeId: 'muscle_up_negative', at: 5 });
  saveOverlay(db, { ...EMPTY_OVERLAY, edited: { dead_hang: { name: 'Bar hang' } } }, 7);
  setSetting(db, 'onboarding_completed_at', TEST_SEED_TIME);
  setSetting(db, 'hero_companion', { look: { body: 'woman' } });
  test.sqlite.raw.exec(
    "INSERT INTO node_progress (node_id, xp, level, trial_passed) VALUES ('dead_hang', 10, 1, 0)",
  );
  test.sqlite.raw.exec("INSERT INTO active_session (id, updated_at, body) VALUES (1, 9, '{}')");
}

describe('deleteAllUserData (PLAN 7.0b)', () => {
  it('deletes every user row and writes the first-run defaults again', async () => {
    const test = await openTestDatabase();
    fill(test);
    deleteAllUserData(test.db, WIPE_TIME);

    expect(readUserData(test.db)).toEqual({
      profile: { createdAt: WIPE_TIME },
      goals: [],
      equipmentProfiles: DEFAULT_EQUIPMENT_PROFILES,
      sessions: [],
      userActions: [],
      overlay: EMPTY_OVERLAY,
      settings: {},
    });
    expect(rowCounts(test)).toMatchObject({
      sessions: 0,
      session_sets: 0,
      user_actions: 0,
      goals: 0,
      settings: 0,
      progression_overlay: 0,
      node_progress: 0,
      active_session: 0,
      profile: 1,
      equipment_profiles: DEFAULT_EQUIPMENT_PROFILES.length,
    });
    expect(getMeta(test.db, META_KEYS.defaultsSeededAt)).toBe(String(WIPE_TIME));
    test.close();
  });

  it('leaves the schema, its version and the migrations table untouched', async () => {
    const test = await openTestDatabase();
    const before = rowCounts(test);
    fill(test);
    deleteAllUserData(test.db, WIPE_TIME);
    const after = rowCounts(test);

    expect(Object.keys(after)).toEqual(Object.keys(before));
    const migrationTables = Object.keys(after).filter((name) => name.includes('migrations'));
    expect(migrationTables.length).toBeGreaterThan(0);
    for (const name of migrationTables) expect(after[name]).toBe(before[name]);
    expect(after.meta).toBe(before.meta);
    expect(getMeta(test.db, META_KEYS.schemaVersion)).toBe(String(SCHEMA_VERSION));
    test.close();
  });

  it('is not seeded twice by the next app start', async () => {
    const test = await openTestDatabase();
    fill(test);
    deleteAllUserData(test.db, WIPE_TIME);
    await migrateDatabase(test.db, WIPE_TIME + 1);
    expect(readUserData(test.db).equipmentProfiles).toEqual(DEFAULT_EQUIPMENT_PROFILES);
    expect(readUserData(test.db).profile).toEqual({ createdAt: WIPE_TIME });
    test.close();
  });
});
