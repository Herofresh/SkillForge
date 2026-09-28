import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ALL_NODES } from '@/data/skills';
import { getActiveSession } from '@/db/activeSessionRepository';
import { listStoredSessions } from '@/db/sessionRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { warningKey } from '@/domain/train';
import { MS_PER_SECOND } from '@/lib/time';

import { createAppStore, type AppStore } from './appStore';

const NOW = 1_790_000_000_000;

let ids = 0;
let clock = NOW;
function storeFor(test: TestDatabase): AppStore {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => clock,
    newId: () => `id-${++ids}`,
  });
  store.getState().loadAll();
  return store;
}

let tempDir: string;
beforeEach(() => {
  clock = NOW;
  tempDir = mkdtempSync(join(tmpdir(), 'skillforge-train-'));
});
afterEach(() => rmSync(tempDir, { recursive: true, force: true }));

/** Logs every planned set of the current exercise as prescribed. */
function logCurrentExercise(store: AppStore): string {
  const session = store.getState().activeSession;
  const key = session?.currentKey;
  const exercise = session?.exercises.find((entry) => entry.key === key);
  if (!exercise || !key) throw new Error('no current exercise');
  for (let set = 0; set < exercise.sets; set++) {
    clock += MS_PER_SECOND;
    store.getState().logTrainingSet(key, exercise.target);
  }
  return exercise.nodeId;
}

describe('Train flow in the store', () => {
  it('plans, edits, trains and finishes a session into history with XP', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    const plan = store.getState().planTraining('home', 30);
    expect(plan.exercises.length).toBeGreaterThan(2);
    expect(store.getState().trainPlan).toBe(plan);
    expect(store.getState().trainWarnings()).toEqual([]);

    // Swap the first exercise that has an alternative, and remove the core exercise.
    const swappable = plan.exercises.find(
      (exercise) => store.getState().swapOptions(exercise.key).length > 0,
    );
    if (!swappable) throw new Error('expected a swappable exercise');
    const [option] = store.getState().swapOptions(swappable.key);
    store.getState().swapPlanExercise(swappable.key, option.id);
    const swapped = store.getState().trainPlan?.exercises.find((e) => e.key === swappable.key);
    expect(swapped).toMatchObject({ nodeId: option.id, swappedFrom: swappable.nodeId });
    const core = plan.exercises.find((exercise) => exercise.block === 'core');
    if (core) store.getState().removePlanExercise(core.key);

    const session = store.getState().startTraining();
    expect(store.getState().trainPlan).toBeUndefined();
    expect(getActiveSession(test.db)).toEqual(session);

    const first = logCurrentExercise(store);
    const result = store.getState().finishTraining();
    expect(result?.xp.total).toBeGreaterThan(0);
    expect(result?.exercises.map((exercise) => exercise.nodeId)).toEqual([first]);
    expect(store.getState().activeSession).toBeUndefined();
    expect(store.getState().trainSummary?.result).toBe(result);
    expect(getActiveSession(test.db)).toBeUndefined();
    const stored = listStoredSessions(test.db);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ id: session.id, equipmentProfileId: 'home', endedAt: clock });
    expect(store.getState().engine.totalXp).toBe(result?.xp.total);

    store.getState().dismissTrainSummary();
    expect(store.getState().trainSummary).toBeUndefined();
    test.close();
  });

  it('resumes the live session after a restart', async () => {
    const path = join(tempDir, 'app.db');
    const first = await openTestDatabase(path);
    const store = storeFor(first);
    store.getState().planTraining('home', 30);
    store.getState().startTraining();
    const key = store.getState().activeSession?.currentKey ?? '';
    store.getState().logTrainingSet(key, { value: 3 }, 'partial');
    const before = store.getState().activeSession;
    first.close();

    const second = await openTestDatabase(path);
    const reopened = storeFor(second);
    expect(reopened.getState().activeSession).toEqual(before);
    expect(reopened.getState().activeSession?.sets).toHaveLength(1);
    expect(reopened.getState().sessions).toEqual([]);
    second.close();
  });

  it('times a set, keeps the timer across a restart and stores the duration (PLAN 5.4)', async () => {
    const path = join(tempDir, 'app.db');
    const first = await openTestDatabase(path);
    const store = storeFor(first);
    store.getState().planTraining('home', 30);
    store.getState().startTraining();
    const key = store.getState().activeSession?.currentKey ?? '';
    store.getState().logTrainingSet(key, { value: 3 });
    expect(store.getState().activeSession?.restEndsAt).toBeDefined();

    const next = store.getState().activeSession?.currentKey ?? '';
    store.getState().startTrainingTimer(next);
    expect(store.getState().activeSession?.restEndsAt).toBeUndefined();
    expect(store.getState().activeSession?.timer).toEqual({ exerciseKey: next, startedAt: clock });
    first.close();

    // The app is killed mid-set; the timer comes back with its start time.
    const second = await openTestDatabase(path);
    const reopened = storeFor(second);
    expect(reopened.getState().activeSession?.timer).toEqual({
      exerciseKey: next,
      startedAt: clock,
    });
    const exercise = reopened.getState().activeSession?.exercises.find((e) => e.key === next);
    clock += 45 * MS_PER_SECOND;
    const measured = reopened.getState().stopTrainingTimer();
    expect(measured).toBe(exercise?.metric === 'hold_s' ? 42 : 45);
    expect(reopened.getState().stopTrainingTimer()).toBe(measured);
    clock += 5 * MS_PER_SECOND;
    reopened.getState().logTrainingSet(next, exercise?.target ?? { value: 1 });
    const logged = reopened.getState().activeSession?.sets.at(-1);
    expect(logged?.durationSec).toBe(measured);
    expect(reopened.getState().activeSession?.timer).toBeUndefined();

    reopened.getState().startTrainingTimer(next);
    reopened.getState().resetTrainingTimer();
    expect(reopened.getState().activeSession?.timer).toBeUndefined();
    expect(reopened.getState().stopTrainingTimer()).toBeUndefined();

    reopened.getState().finishTraining();
    const [stored] = listStoredSessions(second.db);
    expect(stored.sets.find((set) => set.nodeId === exercise?.nodeId)?.durationSec).toBe(measured);
    expect(reopened.getState().sessions[0]).toMatchObject({ id: stored.id, endedAt: clock });
    second.close();
  });

  it('records the timed durations of a Trial', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().logTrial('dead_hang', [{ value: 31 }, { value: 30 }, { value: 30 }], [31]);
    const [stored] = listStoredSessions(test.db);
    expect(stored.sets.map((set) => set.durationSec)).toEqual([31, undefined, undefined]);
    test.close();
  });

  it('skips, adds, rests and abandons without logging anything', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().planTraining('home', 30);
    store.getState().startTraining();
    const state = () => store.getState();
    const firstKey = state().activeSession?.currentKey ?? '';
    state().skipTrainingExercise(firstKey);
    expect(state().activeSession?.currentKey).not.toBe(firstKey);

    const [option] = state().addTrainingOptions();
    state().addTrainingExercise(option.id);
    const added = state().activeSession?.exercises.at(-1);
    expect(added).toMatchObject({ nodeId: option.id, block: 'added' });

    state().selectTrainingExercise(added?.key ?? '');
    state().logTrainingSet(added?.key ?? '', { value: 5 }, 'failed');
    expect(state().activeSession?.sets[0].actual.value).toBe(0);
    expect(state().activeSession?.restEndsAt).toBeDefined();
    state().skipTrainingRest();
    expect(state().activeSession?.restEndsAt).toBeUndefined();

    state().abandonTraining();
    expect(state().activeSession).toBeUndefined();
    expect(getActiveSession(test.db)).toBeUndefined();
    expect(listStoredSessions(test.db)).toEqual([]);
    test.close();
  });

  it('finishing without a logged set logs nothing', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().planTraining('home', 30);
    store.getState().startTraining();
    expect(store.getState().finishTraining()).toBeUndefined();
    expect(store.getState().activeSession).toBeUndefined();
    expect(listStoredSessions(test.db)).toEqual([]);
    test.close();
  });

  it('warns about straight-arm work added on top and remembers the acknowledgement', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    store.getState().planTraining('home', 30);
    store.getState().addTrainingExercise('planche_lean');
    store.getState().addTrainingExercise('tuck_front_lever');
    store.getState().startTraining();
    const leanKey = store
      .getState()
      .activeSession?.exercises.find((exercise) => exercise.nodeId === 'planche_lean')?.key;
    // Log a long extra hold so the session goes over the straight-arm budget.
    for (let set = 0; set < 4; set++) {
      store.getState().logTrainingSet(leanKey ?? '', { value: 30 });
    }
    const warnings = store.getState().trainWarnings();
    const budget = warnings.find((warning) => warning.code === 'straight_arm_budget');
    expect(budget).toBeDefined();
    if (!budget) return;
    store.getState().acknowledgeTrainWarning(warningKey(budget));
    expect(store.getState().activeSession?.acknowledged).toContain(warningKey(budget));
    const result = store.getState().finishTraining();
    expect(result?.warnings.map((warning) => warning.code)).toContain('straight_arm_budget');
    test.close();
  });

  it('an import deletes the draft', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    const backup = store.getState().exportBackup().text;
    store.getState().planTraining('home', 30);
    store.getState().startTraining();
    expect(store.getState().importBackup(backup).status).toBe('imported');
    expect(store.getState().activeSession).toBeUndefined();
    test.close();
  });
});
