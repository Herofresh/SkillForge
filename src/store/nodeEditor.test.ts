import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { getOverlay, saveOverlay } from '@/db/overlayRepository';
import {
  addPrerequisite,
  DESCRIPTION_MISSING_MESSAGE,
  setDescription,
  setName,
  stepTrial,
} from '@/domain/nodeEditor';
import { EMPTY_OVERLAY, exportOverlay } from '@/domain/overlay';
import type { ProgressionOverlay } from '@/domain/types';

import { createAppStore, type AppStore, type BackupFiles } from './appStore';

const NOW = 1_790_000_000_000;

function storeFor(test: TestDatabase, files?: BackupFiles): AppStore {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    ...(files ? { files } : {}),
  });
  store.getState().loadAll();
  return store;
}

let test: TestDatabase;
beforeEach(async () => {
  test = await openTestDatabase();
});
afterEach(() => test.close());

/** A saved custom node "Towel hang" after Dead hang that needs Dead hang. */
function addTowelHang(store: AppStore): string {
  const state = store.getState();
  const draft = addPrerequisite(
    setDescription(
      setName(state.newNodeDraft('v_pull', 'dead_hang'), 'Towel hang'),
      'A dead hang gripping a towel thrown over the bar. ',
    ),
    'dead_hang',
  );
  expect(state.nodeDraftIssues(draft)).toEqual([]);
  const { nodeId, issues } = state.saveNodeDraft(draft);
  expect(issues).toEqual([]);
  return nodeId;
}

describe('node editor (PLAN 4.7)', () => {
  it('adds a custom node with a prerequisite; it is in the tree after a reload', () => {
    const store = storeFor(test);
    const nodeId = addTowelHang(store);
    expect(nodeId).toBe('user_towel_hang');
    const node = store.getState().nodes.find((entry) => entry.id === nodeId);
    expect(node).toMatchObject({
      source: 'user',
      branch: 'v_pull',
      prerequisites: [{ nodeId: 'dead_hang', minLevel: 5, kind: 'hard' }],
    });
    expect(
      storeFor(test)
        .getState()
        .nodes.some((entry) => entry.id === nodeId),
    ).toBe(true);
    // A second one with the same name gets its own id.
    expect(addTowelHang(store)).toBe('user_towel_hang_2');
  });

  it('asks a custom node for a description and stores it trimmed (PLAN 6.2)', () => {
    const store = storeFor(test);
    const state = store.getState();
    const draft = setName(state.newNodeDraft('v_pull', 'dead_hang'), 'Towel hang');
    const missing = [{ nodeId: '', message: DESCRIPTION_MISSING_MESSAGE }];
    expect(state.nodeDraftIssues(draft)).toEqual(missing);
    expect(state.saveNodeDraft(draft).issues).toEqual(missing);
    expect(store.getState().overlay.added).toEqual([]);
    const nodeId = addTowelHang(store);
    expect(store.getState().nodes.find((node) => node.id === nodeId)?.description).toBe(
      'A dead hang gripping a towel thrown over the bar.',
    );
  });

  it('keeps a custom node saved before descriptions existed and asks for one on its next save', () => {
    const store = storeFor(test);
    const nodeId = addTowelHang(store);
    const saved = store.getState().overlay;
    // The row as v0.3.0 wrote it: overlayToRaw leaves an empty description out.
    saveOverlay(
      test.db,
      { ...saved, added: saved.added.map((node) => ({ ...node, description: '' })) },
      NOW,
    );
    const reloaded = storeFor(test).getState();
    const old = reloaded.nodes.find((node) => node.id === nodeId);
    expect(old?.description).toBe('');
    if (!old) throw new Error('custom node lost');
    expect(reloaded.nodeDraftIssues(old)).toEqual([
      { nodeId, message: DESCRIPTION_MISSING_MESSAGE },
    ]);
  });

  it('edits the description of a built-in node and never clears it', () => {
    const store = storeFor(test);
    const pullUp = store.getState().nodeDraft('pull_up');
    if (!pullUp) throw new Error('pull_up missing');
    const edited = setDescription(pullUp, 'My own words.');
    expect(store.getState().saveNodeDraft(edited).issues).toEqual([]);
    expect(store.getState().overlay.edited).toEqual({ pull_up: { description: 'My own words.' } });
    const cleared = store.getState().nodeDraftIssues(setDescription(pullUp, ''));
    expect(cleared.map((issue) => issue.message)).toEqual([
      expect.stringMatching(/^description is missing/),
    ]);
  });

  it('shows a cycle as an issue and never saves it', () => {
    const store = storeFor(test);
    addTowelHang(store);
    const state = store.getState();
    const deadHang = state.nodeDraft('dead_hang');
    if (!deadHang) throw new Error('dead_hang missing');
    const cyclic = addPrerequisite(deadHang, 'user_towel_hang');
    const issues = state.nodeDraftIssues(cyclic);
    expect(issues.map((issue) => issue.message)).toEqual([expect.stringMatching(/cycle/)]);
    expect(state.saveNodeDraft(cyclic).issues).toEqual(issues);
    expect(store.getState().overlay.edited).toEqual({});
  });

  it('edits a built-in node as a difference and resets it to the default', () => {
    const store = storeFor(test);
    const pullUp = store.getState().nodeDraft('pull_up');
    if (!pullUp) throw new Error('pull_up missing');
    expect(store.getState().saveNodeDraft(stepTrial(pullUp, 'target', 2)).issues).toEqual([]);
    expect(store.getState().overlay.edited).toEqual({
      pull_up: { trial: { ...pullUp.trial, target: pullUp.trial.target + 2 } },
    });
    expect(store.getState().resetNode('pull_up')).toEqual([]);
    expect(store.getState().overlay).toEqual(EMPTY_OVERLAY);
    expect(store.getState().nodes.find((node) => node.id === 'pull_up')?.trial).toEqual(
      pullUp.trial,
    );
  });

  it('keeps built-in straight-arm nodes straight-arm (ADR-036)', () => {
    const store = storeFor(test);
    const manna = store.getState().nodeDraft('manna');
    if (!manna?.straightArm) throw new Error('manna should be a straight-arm node');
    const issues = store.getState().saveNodeDraft({ ...manna, straightArm: false }).issues;
    expect(issues.map((issue) => issue.message)).toEqual([
      expect.stringMatching(/straight_arm stays true/),
    ]);
  });

  it('hides a built-in node and shows it again; deletes a custom node', () => {
    const store = storeFor(test);
    expect(store.getState().setNodeHidden('jump_pull_up', true)).toEqual([]);
    expect(store.getState().nodes.some((node) => node.id === 'jump_pull_up')).toBe(false);
    expect(store.getState().setNodeHidden('jump_pull_up', false)).toEqual([]);
    expect(store.getState().nodes.some((node) => node.id === 'jump_pull_up')).toBe(true);
    const nodeId = addTowelHang(store);
    expect(() => store.getState().setNodeHidden(nodeId, true)).toThrow(/built-in/);
    expect(store.getState().resetNode(nodeId)).toEqual([]);
    expect(store.getState().overlay.added).toEqual([]);
  });

  it('starts a built-in draft from the node with its edit, not the hidden rerouting', () => {
    const store = storeFor(test);
    store.getState().setNodeHidden('scapular_pull', true);
    const jump = store.getState().nodeDraft('jump_pull_up');
    expect(jump?.prerequisites.map((prereq) => prereq.nodeId)).toContain('scapular_pull');
    expect(store.getState().nodeDraft('ghost')).toBeUndefined();
  });
});

describe('shared progressions (PLAN 4.8)', () => {
  const shared: ProgressionOverlay = {
    ...EMPTY_OVERLAY,
    edited: { pull_up: { cues: ['From a friend'] } },
    hidden: ['jump_pull_up'],
  };

  it('exports the overlay as YAML to the share sheet', async () => {
    const shares: { fileName: string; text: string; mimeType?: string }[] = [];
    const files: BackupFiles = {
      share: async (fileName, text, options) => {
        shares.push({ fileName, text, mimeType: options?.mimeType });
      },
      pick: async () => undefined,
      saveSafetyCopy: () => 'unused',
    };
    const store = storeFor(test, files);
    addTowelHang(store);
    await store.getState().shareOverlay();
    expect(shares).toHaveLength(1);
    expect(shares[0].fileName).toMatch(/^skillforge-progressions-.*\.yaml$/);
    expect(shares[0].mimeType).toBe('text/plain');
    expect(shares[0].text).toContain('id: user_towel_hang');
    expect(store.getState().exportOverlay().text).toBe(shares[0].text);
  });

  it('previews an import, then merges it and keeps my own changes', () => {
    const store = storeFor(test);
    addTowelHang(store);
    const text = exportOverlay(shared);
    const read = store.getState().previewOverlayImport(text);
    if (read.status !== 'ready') throw new Error('expected a readable overlay');
    expect(read.preview.issues).toEqual([]);
    expect(read.preview.changes.map((change) => [change.nodeId, change.kind])).toEqual([
      ['pull_up', 'edited'],
      ['jump_pull_up', 'hidden'],
    ]);
    expect(store.getState().overlay.hidden).toEqual([]); // preview writes nothing
    expect(store.getState().importOverlay(text)).toEqual([]);
    const overlay = getOverlay(test.db)?.overlay;
    expect(overlay?.added.map((node) => node.id)).toEqual(['user_towel_hang']);
    expect(overlay?.edited).toEqual(shared.edited);
    expect(overlay?.hidden).toEqual(['jump_pull_up']);
  });

  it('rejects unreadable text and a merge that breaks the tree, saving nothing', () => {
    const store = storeFor(test);
    const unreadable = store.getState().previewOverlayImport('format: nope');
    expect(unreadable.status).toBe('unreadable');
    expect(store.getState().importOverlay('format: nope').length).toBeGreaterThan(0);
    const broken = exportOverlay({
      ...EMPTY_OVERLAY,
      edited: { dead_hang: { prerequisites: [{ nodeId: 'pull_up', minLevel: 5, kind: 'hard' }] } },
    });
    const read = store.getState().previewOverlayImport(broken);
    expect(read.status === 'ready' && read.preview.issues.length).toBe(1);
    expect(store.getState().importOverlay(broken)).toHaveLength(1);
    expect(getOverlay(test.db)).toBeUndefined();
  });
});
