import { makeSession } from '@/data/testFixtures';
import { HERO_CLASSES } from '@/data/classes';
import { ALL_NODES } from '@/data/skills';
import { insertSession } from '@/db/sessionRepository';
import { getSetting } from '@/db/settingsRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import {
  isNewClassTier,
  parseClassSettings,
  sessionClassTierUps,
  wornClass,
} from '@/domain/classes';
import { EMPTY_OVERLAY } from '@/domain/overlay';
import type { ClassDefinition, LoggedSession } from '@/domain/types';
import { MS_PER_DAY } from '@/lib/time';

import { CLASS_SETTING, createAppStore, type AppStore } from './appStore';

const DAY0 = 1_790_000_000_000;
const NOW = DAY0 + 10 * MS_PER_DAY;

/** Classes that unlock within a few test sessions. */
const TEST_CLASSES: ClassDefinition[] = [
  { id: 'recruit', name: 'Recruit', tiers: [{ name: 'Recruit', rule: { kind: 'start' } }] },
  {
    id: 'regular',
    name: 'Regular',
    tiers: [
      { name: 'Regular', rule: { kind: 'sessions', count: 1 } },
      { name: 'Veteran', rule: { kind: 'sessions', count: 2 } },
      { name: 'Legend', rule: { kind: 'sessions', count: 3 } },
    ],
  },
  {
    id: 'hanger',
    name: 'Hanger',
    tiers: [
      { name: 'Hanger', rule: { kind: 'stats', points: { pull: 1 } } },
      { name: 'Climber', rule: { kind: 'stats', points: { pull: 900 } } },
      { name: 'Summiteer', rule: { kind: 'stats', points: { pull: 1000 } } },
    ],
  },
];

/** 3 × 20 s dead hangs on `day` (days after DAY0): pull points. */
const hang = (id: string, day: number): LoggedSession =>
  makeSession(id, DAY0 + day * MS_PER_DAY, [
    {
      nodeId: 'dead_hang',
      count: 3,
      metric: 'hold_s',
      prescribed: { value: 20 },
      actual: { value: 20 },
    },
  ]);

let ids = 0;
function storeFor(
  test: TestDatabase,
  classes: readonly ClassDefinition[] = TEST_CLASSES,
): AppStore {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    newId: () => `id-${++ids}`,
    classes,
  });
  store.getState().loadAll();
  return store;
}

const stored = (test: TestDatabase) =>
  parseClassSettings(getSetting(test.db, CLASS_SETTING), TEST_CLASSES);

describe('hero classes in the store', () => {
  it('starts as the starting class with nothing stored', async () => {
    const test = await openTestDatabase();
    const state = storeFor(test).getState();
    expect(wornClass(TEST_CLASSES, state.classes)).toEqual({ classId: 'recruit', tier: 1 });
    expect(state.classes.unlocks).toEqual({});
    expect(getSetting(test.db, CLASS_SETTING)).toBeUndefined();
    test.close();
  });

  it('stores the tiers a session reaches, stamped with that session', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    const { classes } = store.getState();
    expect(sessionClassTierUps(TEST_CLASSES, classes.unlocks, 's1')).toEqual([
      { classId: 'regular', tier: 1 },
      { classId: 'hanger', tier: 1 },
    ]);
    expect(classes.unlocks.regular).toEqual([{ at: DAY0, sessionId: 's1' }]);
    expect(stored(test)).toEqual(classes);

    store.getState().logSession(hang('s2', 2));
    expect(sessionClassTierUps(TEST_CLASSES, store.getState().classes.unlocks, 's2')).toEqual([
      { classId: 'regular', tier: 2 },
    ]);
    test.close();
  });

  it('wears a reached class, remembers it, and refuses a locked one', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    expect(() => store.getState().selectClass('hanger')).toThrow(/not unlocked/);
    expect(() => store.getState().selectClass('necromancer')).toThrow(/Unknown class/);
    store.getState().logSession(hang('s1', 0));
    store.getState().selectClass('hanger');
    expect(wornClass(TEST_CLASSES, store.getState().classes)).toEqual({
      classId: 'hanger',
      tier: 1,
    });
    // A restart reads it back.
    const reloaded = storeFor(test).getState();
    expect(reloaded.classes.selected).toBe('hanger');
    test.close();
  });

  it('shows NEW until the class sheet was opened', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    const regular = TEST_CLASSES[1];
    expect(isNewClassTier(regular, store.getState().classes)).toBe(true);
    store.getState().markClassesSeen();
    expect(isNewClassTier(regular, store.getState().classes)).toBe(false);
    expect(stored(test).seen).toEqual({ regular: 1, hanger: 1 });
    test.close();
  });

  it('upgrade: an existing history unlocks its classes on the first load', async () => {
    const test = await openTestDatabase();
    // History written by an older app version: no hero_classes setting yet.
    insertSession(test.db, hang('old1', 0));
    insertSession(test.db, hang('old2', 2));
    const state = storeFor(test).getState();
    expect(state.classes.unlocks).toEqual({
      regular: [{ at: NOW }, { at: NOW }],
      hanger: [{ at: NOW }],
    });
    expect(isNewClassTier(TEST_CLASSES[1], state.classes)).toBe(true);
    expect(stored(test).unlocks).toEqual(state.classes.unlocks);
    test.close();
  });

  it('keeps a reached tier forever, even when the tree no longer gives the points', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    store.getState().selectClass('hanger');
    // Hiding the trained node drops its pull points (ADR-021), but not the class.
    expect(store.getState().saveOverlay({ ...EMPTY_OVERLAY, hidden: ['dead_hang'] })).toEqual([]);
    const { engine, classes } = store.getState();
    expect(engine.totalXp).toBe(0);
    expect(classes.unlocks.hanger).toHaveLength(1);
    expect(wornClass(TEST_CLASSES, classes).classId).toBe('hanger');
    test.close();
  });

  it('travels with a backup (the setting) and is derived again without one', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    store.getState().selectClass('hanger');
    const { text } = store.getState().exportBackup();
    expect(JSON.parse(text).settings[CLASS_SETTING]).toMatchObject({ selected: 'hanger' });

    const other = await openTestDatabase();
    const restored = storeFor(other);
    expect(restored.getState().importBackup(text).status).toBe('imported');
    expect(restored.getState().classes.selected).toBe('hanger');
    expect(restored.getState().classes.unlocks.hanger).toEqual([{ at: DAY0, sessionId: 's1' }]);

    // An older backup without the setting: the history unlocks the same tiers again.
    const backup = JSON.parse(text);
    delete backup.settings[CLASS_SETTING];
    const third = await openTestDatabase();
    const fromOld = storeFor(third);
    expect(fromOld.getState().importBackup(JSON.stringify(backup)).status).toBe('imported');
    expect(Object.keys(fromOld.getState().classes.unlocks)).toEqual(['regular', 'hanger']);
    expect(fromOld.getState().classes.selected).toBeUndefined();
    test.close();
    other.close();
    third.close();
  });

  it('runs on the real class list', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test, HERO_CLASSES);
    store.getState().logSession(hang('s1', 0));
    // One short session reaches no tier of the real classes.
    expect(store.getState().classes.unlocks).toEqual({});
    expect(wornClass(HERO_CLASSES, store.getState().classes).classId).toBe('recruit');
    test.close();
  });
});
