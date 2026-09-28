import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ALL_NODES } from '@/data/skills';
import { getSetting, setSetting } from '@/db/settingsRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';

import { createAppStore, TREE_MODE_SETTING, type AppStore } from './appStore';

function storeFor(test: TestDatabase): AppStore {
  const store = createAppStore({ db: test.db, baseNodes: ALL_NODES });
  store.getState().loadAll();
  return store;
}

let tempDir: string;
beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'skillforge-tree-mode-'));
});
afterEach(() => rmSync(tempDir, { recursive: true, force: true }));

describe('tree mode (PLAN 5.1)', () => {
  it('starts on Columns and remembers Map across a restart', async () => {
    const path = join(tempDir, 'app.db');
    const first = await openTestDatabase(path);
    const store = storeFor(first);
    expect(store.getState().treeMode).toBe('columns');
    store.getState().setTreeMode('map');
    expect(store.getState().treeMode).toBe('map');
    expect(getSetting(first.db, TREE_MODE_SETTING)).toBe('map');
    first.close();

    const second = await openTestDatabase(path);
    const reopened = storeFor(second);
    expect(reopened.getState().treeMode).toBe('map');
    reopened.getState().setTreeMode('columns');
    expect(getSetting(second.db, TREE_MODE_SETTING)).toBe('columns');
    second.close();
  });

  it('reads a broken stored value as Columns', async () => {
    const test = await openTestDatabase();
    setSetting(test.db, TREE_MODE_SETTING, 'constellation');
    expect(storeFor(test).getState().treeMode).toBe('columns');
    test.close();
  });
});
