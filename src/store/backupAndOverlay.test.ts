import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { makeNode, makeSession } from '@/data/testFixtures';
import { ALL_NODES } from '@/data/skills';
import { formatIssue } from '@/data/validate';
import { readNodeProgress } from '@/db/nodeProgressRepository';
import { getOverlay, saveOverlay } from '@/db/overlayRepository';
import { setHeroName } from '@/db/profileRepository';
import { setSetting } from '@/db/settingsRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { readUserData } from '@/db/userDataRepository';
import { BACKUP_SCHEMA_VERSION, serializeBackup } from '@/domain/backup';
import { EMPTY_OVERLAY } from '@/domain/overlay';
import type { LoggedSession, ProgressionOverlay, UserData } from '@/domain/types';
import { MS_PER_DAY } from '@/lib/time';

import { createAppStore, type AppStore, type BackupFiles } from './appStore';

const DAY0 = 1_790_000_000_000;
const NOW = DAY0 + 10 * MS_PER_DAY;

/** A floor-only core hold placed before `hollow_hold`, reachable from day one. */
const userNode = makeNode({
  id: 'user_dead_bug_hold',
  name: 'Dead bug hold',
  source: 'user',
  branch: 'core',
  chainOrder: 5,
  ogLevel: 0,
  metric: 'hold_s',
  workingRange: { min: 10, max: 30 },
  trial: { sets: 3, target: 30 },
  patterns: ['core'],
  equipment: [['floor']],
  sourceUrls: [],
});
const withUserNode: ProgressionOverlay = { ...EMPTY_OVERLAY, added: [userNode] };

const holdSession = (id: string, day: number, nodeId: string): LoggedSession =>
  makeSession(id, DAY0 + day * MS_PER_DAY, [
    { nodeId, count: 3, metric: 'hold_s', prescribed: { value: 20 }, actual: { value: 20 } },
  ]);

/** In-memory file access that records what the store asked for. */
function fakeFiles(picked?: string) {
  const saved: { fileName: string; text: string }[] = [];
  const shared: { fileName: string; text: string }[] = [];
  const deletions: number[] = [];
  const filesLeft: string[] = [];
  let failSave = false;
  const files: BackupFiles = {
    share: async (fileName, text) => {
      shared.push({ fileName, text });
    },
    pick: async () => picked,
    saveSafetyCopy: (fileName, text) => {
      if (failSave) throw new Error('disk full');
      saved.push({ fileName, text });
      return `file:///backups/${fileName}`;
    },
    deleteAppFiles: () => {
      deletions.push(saved.length);
      saved.length = 0;
      return filesLeft;
    },
  };
  return {
    files,
    saved,
    shared,
    deletions,
    failSaves: () => (failSave = true),
    leaveFiles: (names: string[]) => filesLeft.push(...names),
  };
}

let ids = 0;
function storeFor(test: TestDatabase, files?: BackupFiles): AppStore {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    newId: () => `id-${++ids}`,
    ...(files ? { files } : {}),
  });
  store.getState().loadAll();
  return store;
}

/** A store with some of every kind of user data. */
function fillWithData(test: TestDatabase, store: AppStore): void {
  const state = store.getState();
  expect(state.saveOverlay(withUserNode)).toEqual([]);
  store.getState().setGoals(['user_dead_bug_hold', 'pull_up']);
  const gym = store.getState().createEquipmentProfile('Gym', ['bar', 'rings', 'floor']);
  store.getState().logSession(holdSession('s1', 0, 'dead_hang'), {
    endedAt: DAY0 + 3_600_000,
    equipmentProfileId: gym.id,
  });
  store.getState().logSession(holdSession('s2', 2, 'user_dead_bug_hold'));
  store.getState().selfUnlock('muscle_up_negative');
  store.getState().logSession(holdSession('s3', 4, 'hollow_hold'));
  setHeroName(test.db, 'Ada');
  setSetting(test.db, 'units', { weight: 'kg' });
  store.getState().loadAll();
}

let tempDir: string;
beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'skillforge-backup-'));
});
afterEach(() => rmSync(tempDir, { recursive: true, force: true }));

describe('stored overlay (PLAN 3.4)', () => {
  it('applies the stored overlay to the tree used by the engine', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    expect(store.getState().saveOverlay(withUserNode)).toEqual([]);
    const state = store.getState();
    expect(state.overlay).toEqual(withUserNode);
    expect(state.nodes.map((node) => node.id)).toContain('user_dead_bug_hold');
    expect(state.nodes).toHaveLength(ALL_NODES.length + 1);
    expect(getOverlay(test.db)).toMatchObject({ overlay: withUserNode, revision: 1 });
    test.close();
  });

  it('rejects an overlay that makes a cycle, returns the issues and writes nothing', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    const cyclic: ProgressionOverlay = {
      ...EMPTY_OVERLAY,
      edited: {
        dead_hang: { prerequisites: [{ nodeId: 'pull_up', minLevel: 1, kind: 'hard' }] },
      },
    };
    const issues = store.getState().saveOverlay(cyclic);
    expect(issues.map(formatIssue)).toEqual(
      expect.arrayContaining([expect.stringMatching(/cycle/)]),
    );
    expect(getOverlay(test.db)).toBeUndefined();
    expect(store.getState().overlay).toEqual(EMPTY_OVERLAY);
    expect(store.getState().nodes).toEqual(ALL_NODES);
    test.close();
  });

  it('an overlay-added user_ node is trainable by the generator after a restart', async () => {
    const path = join(tempDir, 'app.db');
    const first = await openTestDatabase(path);
    const store = storeFor(first);
    expect(store.getState().saveOverlay(withUserNode)).toEqual([]);
    store.getState().setGoals(['user_dead_bug_hold']);
    first.close();

    const reopened = await openTestDatabase(path);
    const restarted = storeFor(reopened).getState();
    expect(restarted.goals).toEqual(['user_dead_bug_hold']);
    const plan = restarted.generateWorkout('home', 45, 1);
    const planned = plan.blocks.flatMap((block) => block.exercises.map((item) => item.nodeId));
    expect(planned).toContain('user_dead_bug_hold');

    const result = storeFor(reopened)
      .getState()
      .logSession(holdSession('s1', 9, 'user_dead_bug_hold'));
    expect(result.exercises.map((exercise) => exercise.nodeId)).toEqual(['user_dead_bug_hold']);
    expect(readNodeProgress(reopened.db).user_dead_bug_hold?.xp).toBeGreaterThan(0);
    reopened.close();
  });

  it('keeps a stored overlay that no longer fits the tree and falls back to the built-in tree', async () => {
    const test = await openTestDatabase();
    // As if an app update had removed a node the user edited.
    saveOverlay(test.db, { ...EMPTY_OVERLAY, edited: { retired_node: { name: 'Old' } } }, 1);
    const state = storeFor(test).getState();
    expect(state.nodes).toEqual(ALL_NODES);
    expect(state.overlayIssues.map(formatIssue)).toEqual([
      'overlay: retired_node: edited node does not exist in the built-in matrix',
    ]);
    expect(getOverlay(test.db)).toBeDefined();
    test.close();
  });

  it('starts on the built-in tree when the stored overlay row cannot be read (regression: boot dead end)', async () => {
    const test = await openTestDatabase();
    saveOverlay(test.db, withUserNode, 1);
    // As if a newer app version had written an overlay format this version doesn't know.
    test.sqlite.raw.exec(`UPDATE progression_overlay SET body = '{"format":"nope"}'`);
    const state = storeFor(test).getState();
    expect(state.loaded).toBe(true);
    expect(state.nodes).toEqual(ALL_NODES);
    expect(state.overlay).toEqual(EMPTY_OVERLAY);
    expect(state.overlayIssues).toEqual([]);
    expect(state.overlayUnreadable.length).toBeGreaterThan(0);
    const row = test.sqlite.raw.prepare('SELECT body FROM progression_overlay').get() as {
      body: string;
    };
    expect(row.body).toBe('{"format":"nope"}'); // kept, never deleted on load
    test.close();
  });
});

describe('backup export/import (PLAN 3.3)', () => {
  it('export -> wipe -> import reproduces the identical recomputed state', async () => {
    const original = await openTestDatabase();
    const source = storeFor(original);
    fillWithData(original, source);
    const { fileName, text } = source.getState().exportBackup();
    expect(fileName).toMatch(/^skillforge-backup-.*\.json$/);
    const before = source.getState();
    expect(before.engine.totalXp).toBeGreaterThan(0);

    // Wipe: a brand-new install.
    const fresh = await openTestDatabase();
    const { files, saved } = fakeFiles();
    const target = storeFor(fresh, files);
    expect(target.getState().engine.totalXp).toBe(0);
    const result = target.getState().importBackup(text);
    expect(result.status).toBe('imported');

    const after = target.getState();
    expect(after.engine).toEqual(before.engine);
    expect(after.nodes).toEqual(before.nodes);
    expect(after.overlay).toEqual(before.overlay);
    expect(after.sessions).toEqual(before.sessions);
    expect(after.userActions).toEqual(before.userActions);
    expect(after.goals).toEqual(before.goals);
    expect(after.equipmentProfiles).toEqual(before.equipmentProfiles);
    expect(after.profile).toEqual({ heroName: 'Ada', createdAt: before.profile?.createdAt });
    expect(readUserData(fresh.db)).toEqual(readUserData(original.db));
    expect(readNodeProgress(fresh.db)).toEqual(readNodeProgress(original.db));
    expect(target.getState().exportBackup().text).toBe(text);

    // The fresh install's own (seeded) data was saved first.
    expect(saved).toHaveLength(1);
    expect(saved[0].fileName).toMatch(/^skillforge-before-import-.*\.json$/);
    expect(JSON.parse(saved[0].text).equipmentProfiles).toHaveLength(2);
    original.close();
    fresh.close();
  });

  it('replaces existing data and can go back with the safety copy', async () => {
    const test = await openTestDatabase();
    const { files, saved } = fakeFiles();
    const store = storeFor(test, files);
    fillWithData(test, store);
    const mine = store.getState().exportBackup().text;
    const engineBefore = store.getState().engine;

    const empty: UserData = {
      goals: [],
      equipmentProfiles: [],
      sessions: [],
      userActions: [],
      overlay: EMPTY_OVERLAY,
      settings: {},
    };
    const result = store.getState().importBackup(serializeBackup(empty, NOW));
    expect(result).toEqual({
      status: 'imported',
      safetyCopy: {
        fileName: saved[0].fileName,
        text: mine,
        location: `file:///backups/${saved[0].fileName}`,
      },
    });
    expect(store.getState().sessions).toEqual([]);
    expect(store.getState().engine.totalXp).toBe(0);
    expect(store.getState().nodes).toEqual(ALL_NODES);

    expect(store.getState().importBackup(saved[0].text).status).toBe('imported');
    expect(store.getState().engine).toEqual(engineBefore);
    test.close();
  });

  it('undoes the last import from its safety copy', async () => {
    const test = await openTestDatabase();
    const { files } = fakeFiles();
    const store = storeFor(test, files);
    fillWithData(test, store);
    const engineBefore = store.getState().engine;
    expect(store.getState().lastImport).toBeUndefined();
    expect(() => store.getState().undoLastImport()).toThrow(/No import/);

    const empty: UserData = {
      goals: [],
      equipmentProfiles: [],
      sessions: [],
      userActions: [],
      overlay: EMPTY_OVERLAY,
      settings: {},
    };
    const imported = store.getState().importBackup(serializeBackup(empty, NOW));
    expect(imported.status).toBe('imported');
    expect(store.getState().lastImport?.text).toBe(
      imported.status === 'imported' ? imported.safetyCopy.text : undefined,
    );
    expect(store.getState().undoLastImport().status).toBe('imported');
    expect(store.getState().engine).toEqual(engineBefore);
    expect(store.getState().lastImport).toBeUndefined();
    test.close();
  });

  it('rejects malformed and newer files with readable errors and writes nothing', async () => {
    const test = await openTestDatabase();
    const { files, saved } = fakeFiles();
    const store = storeFor(test, files);
    fillWithData(test, store);
    const before = readUserData(test.db);
    const document = JSON.parse(store.getState().exportBackup().text) as Record<string, unknown>;

    const newer = store
      .getState()
      .importBackup(JSON.stringify({ ...document, schemaVersion: BACKUP_SCHEMA_VERSION + 1 }));
    expect(newer.status).toBe('rejected');
    if (newer.status === 'rejected') {
      expect(newer.issues.map(formatIssue)).toEqual([
        expect.stringMatching(/newer SkillForge .*Update the app/),
      ]);
    }

    const sessions = document.sessions as { sets: Record<string, unknown>[] }[];
    sessions[0].sets[0].metric = 'furlongs';
    const malformed = store.getState().importBackup(JSON.stringify(document));
    expect(malformed.status).toBe('rejected');
    if (malformed.status === 'rejected') {
      expect(malformed.issues.map(formatIssue)).toEqual([
        "backup: sessions[0].sets[0].metric: must be one of reps, hold_s, eccentric_s, load_xbw, got 'furlongs'",
      ]);
    }
    expect(store.getState().importBackup('not json').status).toBe('rejected');

    expect(saved).toEqual([]);
    expect(readUserData(test.db)).toEqual(before);
    test.close();
  });

  it('changes nothing when the safety copy cannot be written', async () => {
    const test = await openTestDatabase();
    const { files, failSaves } = fakeFiles();
    const store = storeFor(test, files);
    fillWithData(test, store);
    const before = readUserData(test.db);
    const empty = serializeBackup({ ...before, sessions: [], userActions: [] }, NOW);
    failSaves();
    expect(() => store.getState().importBackup(empty)).toThrow(/disk full/);
    expect(readUserData(test.db)).toEqual(before);
    test.close();
  });

  it('shares the export and imports a picked file through the file access', async () => {
    const test = await openTestDatabase();
    const source = storeFor(test);
    fillWithData(test, source);
    const { text } = source.getState().exportBackup();

    const other = await openTestDatabase();
    const picking = fakeFiles(text);
    const store = storeFor(other, picking.files);
    await store.getState().shareBackup();
    expect(picking.shared).toHaveLength(1);
    expect(picking.shared[0].fileName).toMatch(/^skillforge-backup-/);
    expect((await store.getState().importBackupFromFile()).status).toBe('imported');
    expect(store.getState().engine).toEqual(source.getState().engine);

    const canceled = storeFor(other, fakeFiles(undefined).files);
    expect(await canceled.getState().importBackupFromFile()).toEqual({ status: 'canceled' });
    await expect(storeFor(other).getState().shareBackup()).rejects.toThrow(/no file access/);
    test.close();
    other.close();
  });
});

describe('delete all my data (PLAN 7.0b)', () => {
  it('wipes everything, keeps the defaults and goes back to onboarding', async () => {
    const test = await openTestDatabase();
    const { files, saved, deletions } = fakeFiles();
    const store = storeFor(test, files);
    fillWithData(test, store);
    store.getState().completeOnboarding();
    expect(store.getState().importBackup(store.getState().exportBackup().text).status).toBe(
      'imported',
    );
    store.getState().planTraining('home', 30);
    store.getState().startTraining();
    expect(store.getState().activeSession).toBeDefined();
    expect(saved).toHaveLength(1);

    expect(store.getState().deleteAllData()).toEqual({ filesLeft: [] });

    const state = store.getState();
    expect(deletions).toEqual([1]);
    expect(state.sessions).toEqual([]);
    expect(state.userActions).toEqual([]);
    expect(state.goals).toEqual([]);
    expect(state.overlay).toEqual(EMPTY_OVERLAY);
    expect(state.nodes).toEqual(ALL_NODES);
    expect(state.engine.totalXp).toBe(0);
    expect(state.equipmentProfiles.map((profile) => profile.name)).toEqual(['Home', 'Park']);
    expect(state.profile).toEqual({ createdAt: NOW });
    expect(state.onboardingCompletedAt).toBeUndefined();
    expect(state.activeSession).toBeUndefined();
    expect(state.trainPlan).toBeUndefined();
    expect(state.lastImport).toBeUndefined();
    expect(state.dataResets).toBe(1);
    expect(readNodeProgress(test.db)).toEqual({});
    // The settings are the ones a fresh install's first load writes (e.g. the starting gear).
    const fresh = await openTestDatabase(undefined, NOW);
    storeFor(fresh);
    expect(readUserData(test.db).settings).toEqual(readUserData(fresh.db).settings);
    expect(readUserData(test.db).settings).not.toHaveProperty('onboarding_completed_at');
    fresh.close();

    // A restart finds the same fresh state.
    const restarted = storeFor(test).getState();
    expect(restarted.onboardingCompletedAt).toBeUndefined();
    expect(restarted.activeSession).toBeUndefined();
    expect(restarted.sessions).toEqual([]);
    test.close();
  });

  it('reports the files it could not delete and still wipes the data', async () => {
    const test = await openTestDatabase();
    const { files, leaveFiles } = fakeFiles();
    const store = storeFor(test, files);
    fillWithData(test, store);
    leaveFiles(['widget-snapshot.json']);
    expect(store.getState().deleteAllData()).toEqual({ filesLeft: ['widget-snapshot.json'] });
    expect(store.getState().sessions).toEqual([]);
    test.close();
  });

  it('works without file access (the database part alone)', async () => {
    const test = await openTestDatabase();
    const store = storeFor(test);
    fillWithData(test, store);
    expect(store.getState().deleteAllData()).toEqual({ filesLeft: [] });
    expect(readUserData(test.db).sessions).toEqual([]);
    test.close();
  });
});
