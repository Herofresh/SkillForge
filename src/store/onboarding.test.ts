import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ALL_NODES } from '@/data/skills';
import { getProfile } from '@/db/profileRepository';
import { listSessions } from '@/db/sessionRepository';
import { getSetting } from '@/db/settingsRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { defaultTrialResults } from '@/domain/assessment';
import { MAX_GOALS } from '@/domain/onboarding';
import type { ExerciseNode } from '@/domain/types';
import { MS_PER_HOUR } from '@/lib/time';

import { createAppStore, ONBOARDING_COMPLETED_SETTING, type AppStore } from './appStore';

const NOW = 1_790_000_000_000;
const node = (id: string): ExerciseNode =>
  ALL_NODES.find((entry) => entry.id === id) as ExerciseNode;

let ids = 0;
function storeFor(test: TestDatabase, clock = { now: NOW }): AppStore {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => clock.now,
    newId: () => `id-${++ids}`,
  });
  store.getState().loadAll();
  return store;
}

let tempDir: string;
beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'skillforge-onboarding-'));
});
afterEach(() => rmSync(tempDir, { recursive: true, force: true }));

describe('onboarding store actions', () => {
  it('starts not onboarded and remembers completion across a restart', async () => {
    const path = join(tempDir, 'app.db');
    const first = await openTestDatabase(path);
    const store = storeFor(first);
    expect(store.getState().onboardingCompletedAt).toBeUndefined();
    store.getState().completeOnboarding();
    expect(store.getState().onboardingCompletedAt).toBe(NOW);
    expect(getSetting(first.db, ONBOARDING_COMPLETED_SETTING)).toBe(NOW);
    first.close();

    const second = await openTestDatabase(path);
    expect(storeFor(second).getState().onboardingCompletedAt).toBe(NOW);
    second.close();
  });

  it('stores a normalized hero name and refuses a blank one', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().setHeroName('  Aria   Stormhand ');
    expect(store.getState().profile?.heroName).toBe('Aria Stormhand');
    expect(getProfile(test.db)?.heroName).toBe('Aria Stormhand');
    expect(() => store.getState().setHeroName('   ')).toThrow('name');
    expect(store.getState().profile?.heroName).toBe('Aria Stormhand');
    test.close();
  });

  it('toggles goals up to the maximum', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    const picks = ['pull_up', 'l_sit', 'pistol_squat', 'tuck_planche', 'muscle_up_negative'];
    expect(picks).toHaveLength(MAX_GOALS);
    for (const id of picks) expect(store.getState().toggleGoal(id)).toBe(true);
    expect(store.getState().toggleGoal('front_lever')).toBe(false);
    expect(store.getState().goals).toEqual(picks);
    expect(store.getState().toggleGoal('l_sit')).toBe(true);
    expect(store.getState().goals).toEqual(picks.filter((id) => id !== 'l_sit'));
    expect(() => store.getState().toggleGoal('nope')).toThrow('Unknown node');
    test.close();
  });

  it('logTrial tests a node out and persists the Trial session', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    const result = store.getState().logTrial('dead_hang', defaultTrialResults(node('dead_hang')));
    expect(result.exercises[0]).toMatchObject({ nodeId: 'dead_hang', trialPassed: true });
    expect(result.unlocked).toContain('scapular_pull');
    expect(store.getState().engine.progress.dead_hang.trialPassed).toBe(true);
    const [stored] = listSessions(test.db);
    expect(stored.sets).toHaveLength(3);
    expect(stored.sets.every((set) => set.isTrial)).toBe(true);
    test.close();
  });

  it('logTrial below the standard only logs training', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    const result = store.getState().logTrial('pull_up', [{ value: 8 }, { value: 5 }, { value: 3 }]);
    expect(result.exercises[0].trialPassed).toBe(false);
    expect(store.getState().engine.progress.pull_up.trialPassed).toBe(false);
    test.close();
  });

  it('never blocks a straight-arm test-out and lists its warnings first (ADR-023)', async () => {
    const test = await openTestDatabase();
    const clock = { now: NOW };
    const store = storeFor(test, clock);
    const before = store.getState().testOutWarnings('german_hang');
    expect(before.map((warning) => warning.code)).toEqual([
      'prerequisites_unmet',
      'straight_arm_min_weeks',
    ]);

    const result = store
      .getState()
      .logTrial('german_hang', defaultTrialResults(node('german_hang')));
    expect(result.exercises[0].trialPassed).toBe(true);
    expect(result.warnings.map((warning) => warning.code)).toContain('straight_arm_min_weeks');

    clock.now = NOW + MS_PER_HOUR;
    const next = store.getState().testOutWarnings('tuck_back_lever');
    expect(next.map((warning) => warning.code)).toContain('straight_arm_rest');
    test.close();
  });
});

describe('replayOnboarding (PLAN 5.10)', () => {
  it('re-opens the flow with every piece of data kept, and finishing again resets nothing', async () => {
    const path = join(tempDir, 'replay.db');
    const first = await openTestDatabase(path);
    const clock = { now: NOW };
    const store = storeFor(first, clock);
    store.getState().setHeroName('Aria');
    store.getState().toggleGoal('pull_up');
    store.getState().logTrial('dead_hang', defaultTrialResults(node('dead_hang')));
    store.getState().completeOnboarding();
    const profiles = store.getState().equipmentProfiles;
    const sessionIds = store.getState().sessions.map((session) => session.id);

    clock.now = NOW + MS_PER_HOUR;
    store.getState().replayOnboarding();
    expect(store.getState().onboardingCompletedAt).toBeUndefined();
    // The stored completion stays: nothing is written by the replay itself.
    expect(getSetting(first.db, ONBOARDING_COMPLETED_SETTING)).toBe(NOW);
    // The steps start from the current data.
    expect(store.getState().profile?.heroName).toBe('Aria');
    expect(store.getState().goals).toEqual(['pull_up']);
    expect(store.getState().equipmentProfiles).toEqual(profiles);
    expect(store.getState().engine.progress.dead_hang.trialPassed).toBe(true);

    // A test-out during the replay is one more ordinary Trial session.
    store.getState().logTrial('pull_up', defaultTrialResults(node('pull_up')));
    expect(listSessions(first.db).map((session) => session.id)).toEqual([
      ...sessionIds,
      expect.any(String),
    ]);
    const trialId = store.getState().sessions.at(-1)!.id;
    expect(store.getState().sessionResults[trialId]).toBeDefined();

    store.getState().completeOnboarding();
    expect(store.getState().onboardingCompletedAt).toBe(NOW);
    expect(getSetting(first.db, ONBOARDING_COMPLETED_SETTING)).toBe(NOW);
    expect(store.getState().goals).toEqual(['pull_up']);
    expect(store.getState().equipmentProfiles).toEqual(profiles);
    expect(listSessions(first.db)).toHaveLength(sessionIds.length + 1);
    first.close();
  });

  it('ends with a restart: the stored completion opens the tabs again', async () => {
    const path = join(tempDir, 'replay-restart.db');
    const first = await openTestDatabase(path);
    const store = storeFor(first);
    store.getState().completeOnboarding();
    store.getState().replayOnboarding();
    first.close();

    const second = await openTestDatabase(path);
    expect(storeFor(second).getState().onboardingCompletedAt).toBe(NOW);
    second.close();
  });
});
