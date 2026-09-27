import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { makeSession } from '@/data/testFixtures';
import { ALL_NODES } from '@/data/skills';
import { clearNodeProgress, readNodeProgress } from '@/db/nodeProgressRepository';
import { listSessions } from '@/db/sessionRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { generateWorkout } from '@/domain/generator';
import { recompute } from '@/domain/recompute';
import type { LoggedSession } from '@/domain/types';
import { MS_PER_DAY } from '@/lib/time';

import { createAppStore, type AppStore } from './appStore';

const DAY0 = 1_790_000_000_000;
const NOW = DAY0 + 10 * MS_PER_DAY;

/** 3 × 8 reps of `nodeId` on `day` (days after DAY0). */
const session = (id: string, day: number, nodeId = 'dead_hang'): LoggedSession =>
  makeSession(id, DAY0 + day * MS_PER_DAY, [
    { nodeId, count: 3, metric: 'hold_s', prescribed: { value: 20 }, actual: { value: 20 } },
  ]);

let ids = 0;
function storeFor(test: TestDatabase, now = NOW): AppStore {
  const store = createAppStore({
    db: test.db,
    nodes: ALL_NODES,
    now: () => now,
    newId: () => `id-${++ids}`,
  });
  store.getState().loadAll();
  return store;
}

let tempDir: string;
beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'skillforge-store-'));
});
afterEach(() => rmSync(tempDir, { recursive: true, force: true }));

describe('app store', () => {
  it('loads the seeded equipment profiles and an empty history', async () => {
    const test = await openTestDatabase();
    const state = storeFor(test).getState();
    expect(state.loaded).toBe(true);
    expect(state.equipmentProfiles.map((profile) => profile.name)).toEqual(['Home', 'Park']);
    expect(state.sessions).toEqual([]);
    expect(state.engine.totalXp).toBe(0);
    test.close();
  });

  it('logSession persists the sets and matches the pure-domain recompute', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    const history = [session('s1', 0), session('s2', 2), session('s3', 4, 'scapular_pull')];
    const results = history.map((entry) => store.getState().logSession(entry));

    expect(listSessions(test.db)).toEqual(history);
    const pure = recompute(ALL_NODES, history);
    expect(store.getState().engine).toEqual(pure.state);
    expect(results).toEqual(pure.results);
    expect(readNodeProgress(test.db)).toEqual(pure.state.progress);
    test.close();
  });

  it('recomputes when a session is logged into the past', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(session('late', 5));
    const result = store.getState().logSession(session('early', 1));

    const history = [session('early', 1), session('late', 5)];
    const pure = recompute(ALL_NODES, history);
    expect(store.getState().sessions.map((entry) => entry.id)).toEqual(['early', 'late']);
    expect(store.getState().engine).toEqual(pure.state);
    expect(result).toEqual(pure.results[0]);
    test.close();
  });

  it('a self_unlock survives an app restart', async () => {
    const path = join(tempDir, 'app.db');
    const first = await openTestDatabase(path);
    const store = storeFor(first);
    const result = store.getState().selfUnlock('muscle_up_negative');
    expect(result.unlocked).toContain('muscle_up_negative');
    expect(result.warnings.map((warning) => warning.code)).toEqual(['prerequisites_unmet']);
    const before = store.getState().engine;
    first.close();

    const reopened = await openTestDatabase(path);
    const restarted = storeFor(reopened).getState();
    expect(restarted.userActions).toEqual([
      { id: expect.any(String), kind: 'self_unlock', nodeId: 'muscle_up_negative', at: NOW },
    ]);
    expect(restarted.engine.progress.muscle_up_negative?.selfUnlockedAt).toBe(NOW);
    expect(restarted.engine).toEqual(before);
    reopened.close();
  });

  it('rebuilds a deleted node_progress cache identically', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logSession(session('s1', 0));
    store.getState().selfUnlock('pull_up');
    store.getState().logSession(session('s2', 11, 'pull_up'));
    const cached = readNodeProgress(test.db);
    expect(Object.keys(cached).length).toBeGreaterThan(0);

    clearNodeProgress(test.db);
    expect(readNodeProgress(test.db)).toEqual({});
    storeFor(test);
    expect(readNodeProgress(test.db)).toEqual(cached);
    test.close();
  });

  it('stores goals and equipment profile changes', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().setGoals(['tuck_planche', 'pull_up']);
    expect(() => store.getState().setGoals(['not_a_node'])).toThrow(/Unknown node/);
    const gym = store.getState().createEquipmentProfile('  Gym ', ['bar', 'rings', 'bar']);
    expect(gym).toMatchObject({ name: 'Gym', tags: ['bar', 'rings'] });
    store.getState().updateEquipmentProfile(gym.id, { name: 'Gym 2' });
    store.getState().deleteEquipmentProfile('park');
    expect(() => store.getState().createEquipmentProfile(' ', [])).toThrow(/name/);

    const reloaded = storeFor(test).getState();
    expect(reloaded.goals).toEqual(['tuck_planche', 'pull_up']);
    expect(reloaded.equipmentProfiles.map((profile) => profile.name)).toEqual(['Home', 'Gym 2']);
    test.close();
  });

  it('generateWorkout feeds the stored goals, progress, profile and recent sessions', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().setGoals(['pull_up']);
    store.getState().logSession(session('old', -40)); // outside the history window
    store.getState().logSession(session('recent', 8));
    const plan = store.getState().generateWorkout('home', 45, 7);

    const state = store.getState();
    const home = state.equipmentProfiles.find((profile) => profile.id === 'home');
    expect(plan).toEqual(
      generateWorkout({
        nodes: ALL_NODES,
        goals: ['pull_up'],
        progress: state.engine.progress,
        equipment: home?.tags ?? [],
        availableMinutes: 45,
        recentSessions: [session('recent', 8)],
        now: NOW,
        seed: 7,
      }),
    );
    expect(plan.blocks.length).toBeGreaterThan(0);
    expect(() => store.getState().generateWorkout('nowhere', 45)).toThrow(/Unknown equipment/);
    test.close();
  });
});
