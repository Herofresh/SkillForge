import { makeSession, makeSet } from '@/data/testFixtures';
import type { LoggedSession, NodeProgress, UserAction } from '@/domain/types';

import {
  deleteEquipmentProfile,
  insertEquipmentProfile,
  listEquipmentProfiles,
  updateEquipmentProfile,
} from './equipmentProfileRepository';
import { listGoals, replaceGoals } from './goalRepository';
import { clearNodeProgress, readNodeProgress, replaceNodeProgress } from './nodeProgressRepository';
import { getProfile, setHeroName } from './profileRepository';
import { insertSession, listSessions } from './sessionRepository';
import { getSetting, setSetting } from './settingsRepository';
import { openTestDatabase, TEST_SEED_TIME, type TestDatabase } from './testing/testDatabase';
import { insertUserAction, listUserActions } from './userActionRepository';

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
  });
});
