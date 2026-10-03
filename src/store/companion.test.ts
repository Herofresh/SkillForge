import { makeSession } from '@/data/testFixtures';
import { ACCESSORIES } from '@/data/companion/accessories';
import { ALL_NODES } from '@/data/skills';
import { insertSession } from '@/db/sessionRepository';
import { getSetting } from '@/db/settingsRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import {
  companionLoadout,
  parseCompanionSettings,
  sessionAccessoryUnlocks,
} from '@/domain/companion';
import { EMPTY_OVERLAY } from '@/domain/overlay';
import type { AccessoryDefinition, LoggedSession } from '@/domain/types';
import { MS_PER_DAY } from '@/lib/time';

import { COMPANION_SETTING, createAppStore, type AppStore } from './appStore';

const DAY0 = 1_790_000_000_000;
const NOW = DAY0 + 10 * MS_PER_DAY;

/** Accessories that unlock within a few test sessions. */
const TEST_ITEMS: AccessoryDefinition[] = [
  { id: 'band', name: 'Band', slot: 'head', rule: { kind: 'rank', rank: 'Novice' } },
  { id: 'cap', name: 'Cap', slot: 'head', rule: { kind: 'sessions', count: 1 } },
  { id: 'cloak', name: 'Cloak', slot: 'cloak', rule: { kind: 'sessions', count: 2 } },
  { id: 'aura', name: 'Aura', slot: 'aura', rule: { kind: 'streak', count: 2 } },
  { id: 'crown', name: 'Crown', slot: 'head', rule: { kind: 'rank', rank: 'Legend' } },
];

/** 3 × 20 s dead hangs on `day` (days after DAY0). */
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
  accessories: readonly AccessoryDefinition[] = TEST_ITEMS,
): AppStore {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    newId: () => `id-${++ids}`,
    accessories,
  });
  store.getState().loadAll();
  return store;
}

const stored = (test: TestDatabase) =>
  parseCompanionSettings(getSetting(test.db, COMPANION_SETTING), TEST_ITEMS);

describe('the companion in the store (PLAN 6.10)', () => {
  it('gives a new hero the starting headband on the first load', async () => {
    const test = await openTestDatabase();
    const { companion } = storeFor(test).getState();
    expect(companion.unlocks).toEqual({ band: { at: NOW } });
    expect(companionLoadout(TEST_ITEMS, companion)).toEqual({ head: 'band' });
    expect(stored(test).unlocks).toEqual(companion.unlocks);
    test.close();
  });

  it('stamps accessories with the session that earned them, for the summary', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    store.getState().logSession(hang('s2', 1));
    const { companion } = store.getState();
    expect(sessionAccessoryUnlocks(TEST_ITEMS, companion.unlocks, 's1')).toEqual(['cap']);
    expect(sessionAccessoryUnlocks(TEST_ITEMS, companion.unlocks, 's2')).toEqual(['cloak', 'aura']);
    expect(companionLoadout(TEST_ITEMS, companion)).toEqual({
      head: 'cap',
      cloak: 'cloak',
      aura: 'aura',
    });
    test.close();
  });

  it('keeps the hero’s choices: wear, clear, look, seen; and survives a restart', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    expect(() => store.getState().equipAccessory('head', 'crown')).toThrow(/not earned/);
    store.getState().equipAccessory('head', 'band');
    store.getState().equipAccessory('cloak', null);
    store.getState().setCompanionLook({ skin: 'tan' });
    store.getState().setCompanionLook({ outfit: 'crimson' });
    store.getState().markAccessoriesSeen();
    const reloaded = storeFor(test).getState().companion;
    expect(reloaded.equipped).toEqual({ head: 'band', cloak: null });
    expect(reloaded.look).toEqual({ skin: 'tan', outfit: 'crimson' });
    expect([...reloaded.seen].sort()).toEqual(['band', 'cap']);
    test.close();
  });

  it('upgrade: an existing history earns its accessories on the first load', async () => {
    const test = await openTestDatabase();
    // History written by an older app version: no hero_companion setting yet.
    insertSession(test.db, hang('old1', 0));
    insertSession(test.db, hang('old2', 1));
    const { companion } = storeFor(test).getState();
    expect(Object.keys(companion.unlocks).sort()).toEqual(['aura', 'band', 'cap', 'cloak']);
    expect(Object.values(companion.unlocks).every((unlock) => unlock.at === NOW)).toBe(true);
    expect(companionLoadout(TEST_ITEMS, companion)).toEqual({
      head: 'cap',
      cloak: 'cloak',
      aura: 'aura',
    });
    test.close();
  });

  it('keeps earned accessories when the tree no longer gives the facts', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    store.getState().logSession(hang('s2', 1));
    expect(store.getState().saveOverlay({ ...EMPTY_OVERLAY, hidden: ['dead_hang'] })).toEqual([]);
    expect(Object.keys(store.getState().companion.unlocks)).toHaveLength(4);
    test.close();
  });

  it('travels with a backup and is earned again from an older one', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    store.getState().setCompanionLook({ hair: 'red' });
    const { text } = store.getState().exportBackup();

    const other = await openTestDatabase();
    const restored = storeFor(other);
    expect(restored.getState().importBackup(text).status).toBe('imported');
    expect(restored.getState().companion.look).toEqual({ hair: 'red' });
    expect(restored.getState().companion.unlocks.cap).toEqual({ at: DAY0, sessionId: 's1' });

    const backup = JSON.parse(text);
    delete backup.settings[COMPANION_SETTING];
    const third = await openTestDatabase();
    const fromOld = storeFor(third);
    expect(fromOld.getState().importBackup(JSON.stringify(backup)).status).toBe('imported');
    expect(Object.keys(fromOld.getState().companion.unlocks).sort()).toEqual(['band', 'cap']);
    test.close();
    other.close();
    third.close();
  });

  it('runs on the real accessory list', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test, ACCESSORIES);
    store.getState().logSession(hang('s1', 0));
    expect(Object.keys(store.getState().companion.unlocks)).toEqual(['rope_headband']);
    test.close();
  });
});
