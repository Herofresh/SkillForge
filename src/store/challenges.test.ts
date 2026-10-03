import { HERO_CLASSES } from '@/data/classes';
import { makeSession } from '@/data/testFixtures';
import { ALL_NODES } from '@/data/skills';
import { insertSession } from '@/db/sessionRepository';
import { getSetting, setSetting } from '@/db/settingsRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { challengePinsToRaw, parseChallengePins, weeklyChallenges } from '@/domain/challenges';
import { recompute } from '@/domain/recompute';
import type { ClassDefinition, LoggedSession } from '@/domain/types';
import { CLASS_CHALLENGE_BONUS_XP } from '@/domain/xp';
import { localWeekBounds, MS_PER_DAY } from '@/lib/time';

import { CHALLENGE_SETTING, createAppStore, type AppStore } from './appStore';

/** Monday 21 September 2026, 12:00 local time: days 0–6 are one calendar week. */
const DAY0 = new Date(2026, 8, 21, 12).getTime();
const NOW = DAY0 + 10 * MS_PER_DAY;

/** Recruit (2 sessions a week) and a class the first session unlocks (3 sessions a week). */
const TEST_CLASSES: ClassDefinition[] = [
  {
    id: 'recruit',
    name: 'Recruit',
    tiers: [{ name: 'Recruit', rule: { kind: 'start' } }],
    challenge: { goal: { kind: 'sessions' }, targets: [2] },
  },
  {
    id: 'regular',
    name: 'Regular',
    tiers: [
      { name: 'Regular', rule: { kind: 'sessions', count: 1 } },
      { name: 'Veteran', rule: { kind: 'sessions', count: 50 } },
      { name: 'Legend', rule: { kind: 'sessions', count: 60 } },
    ],
    challenge: { goal: { kind: 'sessions' }, targets: [3, 3, 3] },
  },
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

const bonuses = (store: AppStore): number[] =>
  store.getState().sessions.map((s) => store.getState().sessionResults[s.id].xp.challengeBonus);

describe('weekly class challenges in the store', () => {
  it('pins nothing before the first session, then the worn class at the first session', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    expect(store.getState().challengePins).toEqual([]);
    expect(getSetting(test.db, CHALLENGE_SETTING)).toBeUndefined();

    const first = store.getState().logSession(hang('s1', 0));
    const pins = [{ ...localWeekBounds(DAY0), classId: 'recruit', tier: 1 }];
    expect(store.getState().challengePins).toEqual(pins);
    expect(parseChallengePins(getSetting(test.db, CHALLENGE_SETTING))).toEqual(pins);
    expect(first.challenge).toMatchObject({ gained: 1, count: 1, target: 2, completed: false });

    const second = store.getState().logSession(hang('s2', 2));
    expect(second.challenge).toMatchObject({ count: 2, completed: true });
    expect(second.xp.challengeBonus).toBe(CLASS_CHALLENGE_BONUS_XP);
    test.close();
  });

  it('switching classes mid-week keeps the week and pays one bonus (no farming)', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0)); // pins the Recruit, unlocks Regular
    store.getState().selectClass('regular');
    store.getState().logSession(hang('s2', 1)); // Recruit's 2 / 2: bonus
    store.getState().logSession(hang('s3', 2)); // would be Regular's 3 / 3: still the Recruit's week
    store.getState().selectClass('recruit');
    store.getState().selectClass('regular');
    store.getState().logSession(hang('s4', 3));
    expect(store.getState().challengePins.map((pin) => pin.classId)).toEqual(['recruit']);
    expect(bonuses(store)).toEqual([0, CLASS_CHALLENGE_BONUS_XP, 0, 0]);

    // Next week: the worn Regular's challenge.
    store.getState().logSession(hang('n1', 7));
    store.getState().logSession(hang('n2', 8));
    store.getState().logSession(hang('n3', 9));
    expect(store.getState().challengePins.map((pin) => pin.classId)).toEqual([
      'recruit',
      'regular',
    ]);
    expect(bonuses(store).slice(4)).toEqual([0, 0, CLASS_CHALLENGE_BONUS_XP]);
    test.close();
  });

  it('recomputes the bonuses from history and the pins after a restart (ADR-008)', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    store.getState().logSession(hang('s2', 1));
    const before = store.getState().engine;
    const restarted = storeFor(test).getState();
    expect(restarted.engine).toEqual(before);
    const pure = recompute(
      ALL_NODES,
      restarted.sessions,
      [],
      weeklyChallenges(restarted.challengePins, TEST_CLASSES),
    );
    expect(restarted.engine).toEqual(pure.state);
    expect(pure.state.totalXp).toBe(
      recompute(ALL_NODES, restarted.sessions).state.totalXp + CLASS_CHALLENGE_BONUS_XP,
    );
    test.close();
  });

  it('upgrade: history from before the update gets no challenge until the next session', async () => {
    const test = await openTestDatabase();
    insertSession(test.db, hang('old1', 0));
    insertSession(test.db, hang('old2', 1));
    const store = storeFor(test);
    expect(store.getState().challengePins).toEqual([]);
    expect(bonuses(store)).toEqual([0, 0]);
    const totalBefore = store.getState().engine.totalXp;
    expect(totalBefore).toBe(recompute(ALL_NODES, store.getState().sessions).state.totalXp);

    // The first session after the update pins this week; the week's earlier sessions count too.
    const result = store.getState().logSession(hang('new', 2));
    expect(result.challenge).toMatchObject({ count: 3, completed: false });
    expect(bonuses(store)).toEqual([0, CLASS_CHALLENGE_BONUS_XP, 0]);
    expect(storeFor(test).getState().engine).toEqual(store.getState().engine);
    test.close();
  });

  it('travels with a backup; an older backup without the setting imports without bonuses', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(hang('s1', 0));
    store.getState().logSession(hang('s2', 1));
    const { text } = store.getState().exportBackup();
    const backup = JSON.parse(text);
    expect(backup.schemaVersion).toBe(3);
    expect(parseChallengePins(backup.settings[CHALLENGE_SETTING])).toEqual(
      store.getState().challengePins,
    );

    const other = await openTestDatabase();
    const restored = storeFor(other);
    expect(restored.getState().importBackup(text).status).toBe('imported');
    expect(restored.getState().engine).toEqual(store.getState().engine);

    delete backup.settings[CHALLENGE_SETTING];
    const third = await openTestDatabase();
    const fromOld = storeFor(third);
    expect(fromOld.getState().importBackup(JSON.stringify(backup)).status).toBe('imported');
    expect(fromOld.getState().challengePins).toEqual([]);
    expect(bonuses(fromOld)).toEqual([0, 0]);
    test.close();
    other.close();
    third.close();
  });

  it('ignores a broken setting and keeps logging', async () => {
    const test = await openTestDatabase();
    setSetting(test.db, CHALLENGE_SETTING, { version: 1, pins: [{ start: 'x' }] });
    const store = storeFor(test);
    expect(store.getState().challengePins).toEqual([]);
    store.getState().logSession(hang('s1', 0));
    expect(parseChallengePins(getSetting(test.db, CHALLENGE_SETTING))).toHaveLength(1);
    expect(getSetting(test.db, CHALLENGE_SETTING)).toEqual(
      challengePinsToRaw(store.getState().challengePins),
    );
    test.close();
  });

  it('runs on the real class list: the Recruit challenge is two sessions', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test, HERO_CLASSES);
    store.getState().logSession(hang('s1', 0));
    const result = store.getState().logSession(hang('s2', 3));
    expect(result.challenge).toMatchObject({ count: 2, target: 2, completed: true });
    expect(result.xp.challengeBonus).toBe(CLASS_CHALLENGE_BONUS_XP);
    test.close();
  });
});
