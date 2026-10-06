/**
 * A backup from every published release imports into today's app (PLAN 7.3): moving from a GitHub
 * APK to the Play build is export → uninstall → install from Play → import, so each release's
 * backup file must load with all its data.
 *
 * The fixtures in `fixtures/` were written by each release's own `serializeBackup` (and, from
 * v0.6.0, its own class / challenge / companion setting serializers), run from the release tag's
 * `src/` with the same data: a hero, two goals (one of them a user node), the default equipment
 * profiles, two sessions (timed sets from v0.2.0), a self-unlock, an overlay with a user node and
 * an edit, and the settings that release stored. Releases whose files are byte-identical share one
 * fixture.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase } from '@/db/testing/testDatabase';
import { BACKUP_SCHEMA_VERSION, parseBackup } from '@/domain/backup';

import { createAppStore } from './appStore';

const NOW = 1_790_000_000_000;

interface ReleaseBackup {
  release: string;
  fixture: string;
  schemaVersion: number;
  /** Sets carry `durationSec` (schemaVersion 2). */
  durations: boolean;
  /** The overlay's user node carries a description (schemaVersion 3). */
  description: boolean;
  /** The class, challenge and companion settings (v0.6.0). */
  heroSettings: boolean;
  /** The companion look's body and hair style (v0.7.0). */
  body: boolean;
}

const RELEASES: readonly ReleaseBackup[] = [
  {
    release: 'v0.1.0-preview1',
    fixture: 'backup-v0.1.0.json',
    schemaVersion: 1,
    durations: false,
    description: false,
    heroSettings: false,
    body: false,
  },
  {
    release: 'v0.2.0',
    fixture: 'backup-v0.2.0.json',
    schemaVersion: 2,
    durations: true,
    description: false,
    heroSettings: false,
    body: false,
  },
  {
    release: 'v0.3.0',
    fixture: 'backup-v0.2.0.json',
    schemaVersion: 2,
    durations: true,
    description: false,
    heroSettings: false,
    body: false,
  },
  {
    release: 'v0.4.0',
    fixture: 'backup-v0.4.0.json',
    schemaVersion: 3,
    durations: true,
    description: true,
    heroSettings: false,
    body: false,
  },
  {
    release: 'v0.5.0',
    fixture: 'backup-v0.4.0.json',
    schemaVersion: 3,
    durations: true,
    description: true,
    heroSettings: false,
    body: false,
  },
  {
    release: 'v0.6.0',
    fixture: 'backup-v0.6.0.json',
    schemaVersion: 3,
    durations: true,
    description: true,
    heroSettings: true,
    body: false,
  },
  {
    release: 'v0.7.0',
    fixture: 'backup-v0.7.0.json',
    schemaVersion: 3,
    durations: true,
    description: true,
    heroSettings: true,
    body: true,
  },
];

const USER_NODE = 'user_heavy_pull_up';

const readFixture = (name: string) => readFileSync(join(__dirname, 'fixtures', name), 'utf8');

describe('backups from every release import (PLAN 7.3)', () => {
  it.each(RELEASES)('$release (schemaVersion $schemaVersion)', async (release) => {
    const text = readFixture(release.fixture);
    expect(JSON.parse(text).schemaVersion).toBe(release.schemaVersion);

    const test = await openTestDatabase();
    const store = createAppStore({ db: test.db, baseNodes: ALL_NODES, now: () => NOW });
    store.getState().loadAll();
    expect(store.getState().importBackup(text).status).toBe('imported');
    const state = store.getState();

    expect(state.profile?.heroName).toBe('Aria');
    expect(state.goals).toEqual(['pull_up', USER_NODE]);
    expect(state.equipmentProfiles.map((profile) => profile.id)).toEqual(['home', 'park']);
    expect(state.userActions).toHaveLength(1);
    expect(state.overlayIssues).toEqual([]);
    const userNode = state.nodes.find((node) => node.id === USER_NODE);
    expect(userNode?.source).toBe('user');
    expect(userNode?.description).toBe(
      release.description ? 'My own step after the last pull-up.' : '',
    );
    expect(state.nodes.find((node) => node.id === 'pull_up')?.name).toBe('Strict pull-up');

    expect(state.sessions).toHaveLength(2);
    const durations = state.sessions.flatMap((session) =>
      session.sets.flatMap((set) => (set.durationSec === undefined ? [] : [set.durationSec])),
    );
    expect(durations).toEqual(release.durations ? [31, 30] : []);
    expect(state.engine.totalXp).toBeGreaterThan(0);

    expect(state.treeMode).toBe('map');
    expect(state.onboardingCompletedAt).toEqual(expect.any(Number));
    if (release.heroSettings) {
      expect(state.classes.selected).toBe('warrior');
      expect(state.challengePins).toHaveLength(1);
      expect(state.companion.equipped.head).toBe('rope_headband');
      expect(state.companion.look.skin).toBe('tan');
    }
    expect(state.companion.look.body).toBe(release.body ? 'woman' : undefined);

    // The next export is today's layout and reads back.
    const again = state.exportBackup().text;
    expect(JSON.parse(again).schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(parseBackup(again, ALL_NODES).issues).toEqual([]);
    test.close();
  });
});
