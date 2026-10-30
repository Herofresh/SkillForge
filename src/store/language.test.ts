import { ALL_NODES, NODE_TRANSLATIONS } from '@/data/skills';
import { getSetting } from '@/db/settingsRepository';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { addPrerequisite, setDescription, setName } from '@/domain/nodeEditor';
import { getLocale, setLocale } from '@/i18n';

import { createAppStore, LANGUAGE_SETTING, type AppStore } from './appStore';

const NOW = 1_790_000_000_000;

let test: TestDatabase;
const storeFor = (deviceLocaleTag?: string): AppStore => {
  const store = createAppStore({
    db: test.db,
    baseNodes: ALL_NODES,
    now: () => NOW,
    ...(deviceLocaleTag !== undefined ? { deviceLocaleTag: () => deviceLocaleTag } : {}),
  });
  store.getState().loadAll();
  return store;
};
const nameOf = (store: AppStore, id: string) =>
  store.getState().nodes.find((node) => node.id === id)?.name;

beforeEach(async () => {
  test = await openTestDatabase();
});
afterEach(() => {
  setLocale('en');
  test.close();
});

describe('language (PLAN 7.8 FB-8, ADR-080)', () => {
  it('follows the device by default and localizes the built-in nodes', () => {
    const en = storeFor('en_US');
    expect(en.getState()).toMatchObject({ language: 'system', locale: 'en' });
    expect(nameOf(en, 'pull_up')).toBe('Pull-up');
    const de = storeFor('de_AT');
    expect(de.getState()).toMatchObject({ language: 'system', locale: 'de' });
    expect(getLocale()).toBe('de');
    expect(nameOf(de, 'pull_up')).toBe(NODE_TRANSLATIONS.de?.pull_up?.name);
    expect(nameOf(de, 'pull_up')).not.toBe('Pull-up');
  });

  it('stores the choice, switches at once and survives a reload', () => {
    const store = storeFor('en_US');
    store.getState().setLanguage('de');
    expect(getSetting(test.db, LANGUAGE_SETTING)).toBe('de');
    expect(store.getState()).toMatchObject({ language: 'de', locale: 'de' });
    expect(nameOf(store, 'dead_hang')).toBe(NODE_TRANSLATIONS.de?.dead_hang?.name);
    expect(storeFor('en_US').getState().locale).toBe('de');
    store.getState().setLanguage('en');
    expect(store.getState().locale).toBe('en');
    expect(nameOf(store, 'dead_hang')).toBe('Dead hang');
  });

  it("keeps the user's own nodes and edits as typed, in either language", () => {
    const store = storeFor('de_DE');
    const state = store.getState();
    const draft = addPrerequisite(
      setDescription(
        setName(state.newNodeDraft('v_pull', 'dead_hang'), 'Towel hang'),
        'A hang on a towel.',
      ),
      'dead_hang',
    );
    const { nodeId, issues } = state.saveNodeDraft(draft);
    expect(issues).toEqual([]);
    expect(nameOf(store, nodeId)).toBe('Towel hang');
    // An edited built-in node keeps the user's text whatever the language.
    const pullUp = store.getState().nodeDraft('pull_up')!;
    expect(store.getState().saveNodeDraft(setName(pullUp, 'Mein Klimmzug')).issues).toEqual([]);
    expect(nameOf(store, 'pull_up')).toBe('Mein Klimmzug');
    store.getState().setLanguage('en');
    expect(nameOf(store, 'pull_up')).toBe('Mein Klimmzug');
    expect(nameOf(store, 'dead_hang')).toBe('Dead hang');
  });
});
