import { makeNode, makeSession, makeSet } from '@/data/testFixtures';
import { EMPTY_OVERLAY } from '@/domain/overlay';
import type {
  LoggedSession,
  NodeProgress,
  ProgressionOverlay,
  UserAction,
  UserData,
} from '@/domain/types';

import {
  deleteEquipmentProfile,
  insertEquipmentProfile,
  listEquipmentProfiles,
  updateEquipmentProfile,
} from './equipmentProfileRepository';
import { listGoals, replaceGoals } from './goalRepository';
import { clearNodeProgress, readNodeProgress, replaceNodeProgress } from './nodeProgressRepository';
import { clearOverlay, getOverlay, saveOverlay } from './overlayRepository';
import { getProfile, setHeroName } from './profileRepository';
import { insertSession, listSessions, listStoredSessions } from './sessionRepository';
import { getSetting, listSettings, setSetting } from './settingsRepository';
import { openTestDatabase, TEST_SEED_TIME, type TestDatabase } from './testing/testDatabase';
import { insertUserAction, listUserActions } from './userActionRepository';
import { readUserData, replaceUserData } from './userDataRepository';

let test: TestDatabase;
beforeEach(async () => {
  test = await openTestDatabase();
});
afterEach(() => test.close());

const eccentricSession: LoggedSession = {
  id: 's-ecc',
  startedAt: 5_000,
  sets: [
    makeSet({
      sessionId: 's-ecc',
      nodeId: 'pull_up_negative',
      setIndex: 0,
      metric: 'eccentric_s',
      prescribed: { value: 5, reps: 3 },
      actual: { value: 4.5, reps: 3 },
      isTrial: true,
      timestamp: 5_010,
    }),
    makeSet({
      sessionId: 's-ecc',
      nodeId: 'dead_hang',
      setIndex: 1,
      metric: 'hold_s',
      prescribed: { value: 30 },
      actual: { value: 0 },
      timestamp: 5_020,
    }),
  ],
};

describe('session repository', () => {
  it('round-trips sessions and sets exactly (optional reps, trials, skipped sets)', () => {
    const later = makeSession('s-reps', 9_000, [{ nodeId: 'pull_up', count: 3 }]);
    insertSession(test.db, later, { endedAt: 9_999, equipmentProfileId: 'home' });
    insertSession(test.db, eccentricSession);
    expect(listSessions(test.db)).toEqual([eccentricSession, later]);
    expect(listStoredSessions(test.db)).toEqual([
      eccentricSession,
      { ...later, endedAt: 9_999, equipmentProfileId: 'home' },
    ]);
  });

  it('stores nothing when a set index repeats (one transaction)', () => {
    const broken: LoggedSession = {
      id: 's-bad',
      startedAt: 1,
      sets: [
        makeSet({ sessionId: 's-bad', nodeId: 'pull_up', setIndex: 0 }),
        makeSet({ sessionId: 's-bad', nodeId: 'pull_up', setIndex: 0 }),
      ],
    };
    expect(() => insertSession(test.db, broken)).toThrow();
    expect(listSessions(test.db)).toEqual([]);
  });

  it('rejects sets of another session and a duplicate session id', () => {
    const foreign = { ...eccentricSession, id: 'other' };
    expect(() => insertSession(test.db, foreign)).toThrow(/belongs to session/);
    insertSession(test.db, eccentricSession);
    expect(() => insertSession(test.db, eccentricSession)).toThrow();
    expect(listSessions(test.db)).toEqual([eccentricSession]);
  });

  it('rejects a corrupt metric when reading', () => {
    insertSession(test.db, eccentricSession);
    test.sqlite.raw.exec("UPDATE session_sets SET metric = 'furlongs' WHERE set_index = 0");
    expect(() => listSessions(test.db)).toThrow(/furlongs/);
  });
});

describe('user action repository', () => {
  it('round-trips self-unlocks in time order', () => {
    const late: UserAction = { id: 'a2', kind: 'self_unlock', nodeId: 'pull_up', at: 20 };
    const early: UserAction = {
      id: 'a1',
      kind: 'self_unlock',
      nodeId: 'muscle_up_negative',
      at: 10,
    };
    insertUserAction(test.db, late);
    insertUserAction(test.db, early);
    expect(listUserActions(test.db)).toEqual([early, late]);
  });
});

describe('goal repository', () => {
  it('keeps the priority order and replaces the whole list', () => {
    replaceGoals(test.db, ['tuck_planche', 'pull_up', 'tuck_planche']);
    expect(listGoals(test.db)).toEqual(['tuck_planche', 'pull_up']);
    replaceGoals(test.db, ['l_sit']);
    expect(listGoals(test.db)).toEqual(['l_sit']);
    replaceGoals(test.db, []);
    expect(listGoals(test.db)).toEqual([]);
  });
});

describe('equipment profile repository', () => {
  it('creates, updates and deletes profiles after the seeded ones', () => {
    insertEquipmentProfile(test.db, { id: 'gym', name: 'Gym', tags: ['bar', 'rings'] });
    updateEquipmentProfile(test.db, 'gym', { name: 'Big gym', tags: ['bar', 'rings', 'box'] });
    expect(listEquipmentProfiles(test.db).map((profile) => profile.id)).toEqual([
      'home',
      'park',
      'gym',
    ]);
    expect(listEquipmentProfiles(test.db)[2]).toEqual({
      id: 'gym',
      name: 'Big gym',
      tags: ['bar', 'rings', 'box'],
    });
    deleteEquipmentProfile(test.db, 'gym');
    expect(listEquipmentProfiles(test.db).map((profile) => profile.id)).toEqual(['home', 'park']);
  });
});

describe('node progress cache', () => {
  it('round-trips progress with and without optional timestamps', () => {
    const progress: Record<string, NodeProgress> = {
      pull_up: {
        nodeId: 'pull_up',
        xp: 133.5,
        level: 5,
        trialPassed: true,
        trialPassedAt: 30,
        firstTrainedAt: 10,
        lastTrainedAt: 30,
      },
      muscle_up_negative: {
        nodeId: 'muscle_up_negative',
        xp: 0,
        level: 1,
        trialPassed: false,
        selfUnlockedAt: 5,
      },
    };
    replaceNodeProgress(test.db, progress);
    expect(readNodeProgress(test.db)).toEqual(progress);
    replaceNodeProgress(test.db, { muscle_up_negative: progress.muscle_up_negative });
    expect(readNodeProgress(test.db)).toEqual({ muscle_up_negative: progress.muscle_up_negative });
    clearNodeProgress(test.db);
    expect(readNodeProgress(test.db)).toEqual({});
  });
});

describe('profile and settings', () => {
  it('stores the hero name and JSON settings', () => {
    setHeroName(test.db, 'Ada');
    expect(getProfile(test.db)).toEqual({ heroName: 'Ada', createdAt: TEST_SEED_TIME });
    expect(getSetting(test.db, 'units')).toBeUndefined();
    setSetting(test.db, 'units', { weight: 'kg' });
    setSetting(test.db, 'units', { weight: 'lb' });
    expect(getSetting(test.db, 'units')).toEqual({ weight: 'lb' });
    setSetting(test.db, 'haptics', false);
    expect(listSettings(test.db)).toEqual({ haptics: false, units: { weight: 'lb' } });
  });
});

const userNode = makeNode({
  id: 'user_ring_row',
  source: 'user',
  branch: 'h_pull',
  chainOrder: 1,
  ogLevel: 0,
  sourceUrls: [],
  equipment: [['rings']],
  patterns: ['horizontal_pull'],
});
const overlay: ProgressionOverlay = {
  added: [userNode],
  edited: { pull_up: { trial: { sets: 3, target: 10 } } },
  hidden: ['band_row'],
};

describe('overlay repository', () => {
  it('stores one current overlay, counts revisions and survives a clear', () => {
    expect(getOverlay(test.db)).toBeUndefined();
    saveOverlay(test.db, overlay, 100);
    expect(getOverlay(test.db)).toEqual({ overlay, revision: 1, savedAt: 100 });
    saveOverlay(test.db, EMPTY_OVERLAY, 200);
    expect(getOverlay(test.db)).toEqual({ overlay: EMPTY_OVERLAY, revision: 2, savedAt: 200 });
    clearOverlay(test.db);
    expect(getOverlay(test.db)).toBeUndefined();
  });

  it('refuses to read a corrupt row instead of guessing', () => {
    saveOverlay(test.db, overlay, 100);
    test.sqlite.raw.exec(`UPDATE progression_overlay SET body = '{"format":"nope"}'`);
    expect(() => getOverlay(test.db)).toThrow(/stored overlay cannot be read/);
  });
});

describe('user data repository', () => {
  const imported: UserData = {
    profile: { heroName: 'Grace', createdAt: 42 },
    goals: ['pull_up'],
    equipmentProfiles: [{ id: 'rings', name: 'Rings', tags: ['rings', 'bar'] }],
    sessions: [{ ...eccentricSession, endedAt: 6_000, equipmentProfileId: 'rings' }],
    userActions: [{ id: 'a1', kind: 'self_unlock', nodeId: 'pull_up', at: 10 }],
    overlay,
    settings: { units: 'metric' },
  };

  it('replaces everything and reads it back identically', () => {
    insertSession(test.db, makeSession('old', 1, [{ nodeId: 'dead_hang', count: 1 }]));
    replaceGoals(test.db, ['l_sit']);
    setSetting(test.db, 'stale', 1);
    replaceNodeProgress(test.db, {
      dead_hang: { nodeId: 'dead_hang', xp: 5, level: 1, trialPassed: false },
    });

    replaceUserData(test.db, imported, 500);
    expect(readUserData(test.db)).toEqual(imported);
    expect(readNodeProgress(test.db)).toEqual({}); // the cache is rebuilt by the store
  });

  it('writes nothing when one row fails (one transaction)', () => {
    const before = readUserData(test.db);
    const broken: UserData = {
      ...imported,
      sessions: [...imported.sessions, imported.sessions[0]], // duplicate primary key
    };
    expect(() => replaceUserData(test.db, broken, 500)).toThrow();
    expect(readUserData(test.db)).toEqual(before);
  });
});
