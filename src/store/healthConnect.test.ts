import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import type { HealthWorkout } from '@/domain/healthWorkout';
import { MS_PER_SECOND } from '@/lib/time';

import {
  createAppStore,
  type AppStore,
  type HealthConnectAccess,
  type HealthConnectStatus,
} from './appStore';

const NOW = 1_790_000_000_000;

/** A Health Connect that records what it was asked to do. */
function fakeHealth(
  options: { status?: HealthConnectStatus; grant?: boolean; fail?: boolean } = {},
) {
  let granted = false;
  const written: HealthWorkout[] = [];
  const access: HealthConnectAccess = {
    status: jest.fn(async () => options.status ?? 'available'),
    requestWrite: jest.fn(async () => {
      granted = options.grant ?? true;
      return granted;
    }),
    hasWrite: jest.fn(async () => granted),
    writeWorkout: jest.fn(async (workout: HealthWorkout) => {
      if (options.fail) throw new Error('Health Connect said no');
      written.push(workout);
    }),
    openSettings: jest.fn(),
  };
  return { access, written, revoke: () => (granted = false) };
}

let test: TestDatabase;
let ids = 0;
let clock = NOW;
const storeWith = (health?: HealthConnectAccess): AppStore => {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => clock,
    newId: () => `id-${++ids}`,
    ...(health ? { health } : {}),
  });
  store.getState().loadAll();
  return store;
};

beforeEach(async () => {
  clock = NOW;
  test = await openTestDatabase();
});
afterEach(() => test.close());

/** Trains one set of the first exercise and finishes 20 minutes after the start. */
async function finishOneSet(store: AppStore) {
  store.getState().planTraining('home', 30);
  const session = store.getState().startTraining();
  const [first] = session.exercises;
  clock += MS_PER_SECOND;
  store.getState().logTrainingSet(first.key, first.target);
  clock = NOW + 20 * 60 * MS_PER_SECOND;
  const result = store.getState().finishTraining();
  // Let the background write settle.
  await new Promise((resolve) => setImmediate(resolve));
  return { session, result };
}

describe('Health Connect (PLAN 7.10)', () => {
  it('is off by default and writes nothing', async () => {
    const health = fakeHealth();
    const store = storeWith(health.access);
    expect(store.getState().healthConnectEnabled).toBe(false);
    await finishOneSet(store);
    expect(health.access.writeWorkout).not.toHaveBeenCalled();
    expect(store.getState().healthWrite).toBeUndefined();
  });

  it('turns on after the permission, remembers it and writes every finished session', async () => {
    const health = fakeHealth();
    const store = storeWith(health.access);
    await expect(store.getState().enableHealthConnect()).resolves.toBe('enabled');
    expect(storeWith(health.access).getState().healthConnectEnabled).toBe(true);

    const { session, result } = await finishOneSet(store);
    expect(health.written).toHaveLength(1);
    const [workout] = health.written;
    expect(workout.clientId).toBe(`skillforge-${session.id}`);
    expect(workout.startMs).toBe(session.startedAt);
    expect(workout.endMs).toBe(NOW + 20 * 60 * MS_PER_SECOND);
    expect(workout.notes).toContain(`+${result?.xp.total} XP`);
    expect(store.getState().healthWrite).toEqual({ sessionId: session.id, state: 'added' });
  });

  it('stays off when the permission is denied or Health Connect is missing', async () => {
    const denied = storeWith(fakeHealth({ grant: false }).access);
    await expect(denied.getState().enableHealthConnect()).resolves.toBe('denied');
    expect(denied.getState().healthConnectEnabled).toBe(false);

    const missing = storeWith(fakeHealth({ status: 'not_installed' }).access);
    await expect(missing.getState().enableHealthConnect()).resolves.toBe('not_installed');
    expect(missing.getState().healthConnectEnabled).toBe(false);

    const none = storeWith();
    await expect(none.getState().healthConnectStatus()).resolves.toBe('unsupported');
    await expect(none.getState().enableHealthConnect()).resolves.toBe('unsupported');
  });

  it('reports a revoked permission or a failed write without touching the session', async () => {
    const revoked = fakeHealth();
    const store = storeWith(revoked.access);
    await store.getState().enableHealthConnect();
    revoked.revoke();
    const first = await finishOneSet(store);
    expect(store.getState().healthWrite).toEqual({
      sessionId: first.session.id,
      state: 'no_permission',
    });

    const failing = fakeHealth({ fail: true });
    const other = storeWith(failing.access);
    await other.getState().enableHealthConnect();
    const second = await finishOneSet(other);
    expect(other.getState().healthWrite).toEqual({ sessionId: second.session.id, state: 'failed' });
    expect(other.getState().sessions.some((entry) => entry.id === second.session.id)).toBe(true);
  });

  it('stops writing when turned off', async () => {
    const health = fakeHealth();
    const store = storeWith(health.access);
    await store.getState().enableHealthConnect();
    store.getState().disableHealthConnect();
    expect(storeWith(health.access).getState().healthConnectEnabled).toBe(false);
    await finishOneSet(store);
    expect(health.access.writeWorkout).not.toHaveBeenCalled();
    store.getState().openHealthConnectSettings();
    expect(health.access.openSettings).toHaveBeenCalled();
  });
});
