import { makeChain, makeNode, makeSession } from '@/data/testFixtures';
import { formatIssue } from '@/data/validate';

import {
  backupIssueLines,
  BACKUP_FORMAT,
  BACKUP_SCHEMA_VERSION,
  backupFileName,
  parseBackup,
  serializeBackup,
} from './backup';
import { EMPTY_OVERLAY, exportOverlay } from './overlay';
import type { UserData } from './types';

const base = makeChain(); // dead_hang -> pull_up_negative -> pull_up
const EXPORTED_AT = 1_790_000_000_000;

const userNode = makeNode({
  id: 'user_band_pull_up',
  source: 'user',
  chainOrder: 25,
  ogLevel: 2,
  sourceUrls: [],
  equipment: [['bar', 'bands']],
  prerequisites: [{ nodeId: 'pull_up_negative', minLevel: 3, kind: 'hard' }],
});

const data: UserData = {
  profile: { heroName: 'Ada', createdAt: 1_000 },
  goals: ['pull_up', 'user_band_pull_up'],
  equipmentProfiles: [
    { id: 'home', name: 'Home', tags: ['floor', 'bar'] },
    { id: 'gym', name: 'Gym', tags: ['rings'] },
  ],
  sessions: [
    { ...makeSession('s1', 2_000, [{ nodeId: 'dead_hang', count: 2 }]), endedAt: 2_500 },
    {
      ...makeSession('s2', 3_000, [
        {
          nodeId: 'pull_up_negative',
          count: 1,
          metric: 'eccentric_s',
          prescribed: { value: 5, reps: 3 },
          actual: { value: 4.5, reps: 3 },
          isTrial: true,
        },
      ]),
      equipmentProfileId: 'deleted_profile',
    },
  ],
  userActions: [{ id: 'a1', kind: 'self_unlock', nodeId: 'pull_up', at: 2_700 }],
  overlay: { added: [userNode], edited: { pull_up: { name: 'Strict pull-up' } }, hidden: [] },
  settings: { units: { weight: 'kg' }, onboarded: true },
};

/** The serialized document as an object, to break one field at a time. */
function documentOf(userData: UserData = data): Record<string, unknown> {
  return JSON.parse(serializeBackup(userData, EXPORTED_AT)) as Record<string, unknown>;
}

function parseDocument(document: unknown) {
  return parseBackup(JSON.stringify(document), base);
}

function messages(document: unknown): string[] {
  return parseDocument(document).issues.map(formatIssue);
}

describe('serializeBackup / parseBackup', () => {
  it('round-trips all user data exactly', () => {
    const text = serializeBackup(data, EXPORTED_AT);
    const parsed = parseBackup(text, base);
    expect(parsed.issues).toEqual([]);
    expect(parsed.exportedAt).toBe(EXPORTED_AT);
    expect(parsed.data).toEqual(data);
    expect(serializeBackup(parsed.data as UserData, EXPORTED_AT)).toBe(text);
  });

  it('writes the header and leaves the implied sessionId out of the sets', () => {
    const document = documentOf();
    expect(document).toMatchObject({
      format: BACKUP_FORMAT,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: EXPORTED_AT,
    });
    const [first] = document.sessions as { sets: Record<string, unknown>[] }[];
    expect(first.sets[0]).not.toHaveProperty('sessionId');
  });

  it('round-trips a fresh install without profile, overlay or settings', () => {
    const empty: UserData = {
      goals: [],
      equipmentProfiles: [],
      sessions: [],
      userActions: [],
      overlay: EMPTY_OVERLAY,
      settings: {},
    };
    expect(parseBackup(serializeBackup(empty, EXPORTED_AT), base).data).toEqual(empty);
  });
});

describe('parseBackup rejects', () => {
  it('text that is not JSON', () => {
    const result = parseBackup('{"format": "skillforge-backup",', base);
    expect(result.data).toBeUndefined();
    expect(result.issues.map(formatIssue)).toEqual([
      expect.stringMatching(/^backup: The file is not valid JSON/),
    ]);
  });

  it('other JSON, an overlay file and a missing format', () => {
    expect(messages([1, 2])).toEqual([expect.stringMatching(/not a SkillForge backup/)]);
    expect(messages({ ...documentOf(), format: 'something-else' })).toEqual([
      expect.stringMatching(/not a SkillForge backup/),
    ]);
    const overlayText = exportOverlay(EMPTY_OVERLAY, 'json');
    expect(parseBackup(overlayText, base).issues.map(formatIssue)).toEqual([
      expect.stringMatching(/progression overlay, not a backup/),
    ]);
  });

  it('a backup from a newer app version, with an explanation', () => {
    const result = parseDocument({ ...documentOf(), schemaVersion: BACKUP_SCHEMA_VERSION + 1 });
    expect(result.data).toBeUndefined();
    expect(result.issues.map(formatIssue)).toEqual([
      `backup: The backup was made by a newer SkillForge (backup version ${
        BACKUP_SCHEMA_VERSION + 1
      }; this app reads up to ${BACKUP_SCHEMA_VERSION}). Update the app, then import it again. ` +
        'Nothing was changed.',
    ]);
    expect(messages({ ...documentOf(), schemaVersion: '1' })).toEqual([
      expect.stringMatching(/'schemaVersion' must be a whole number/),
    ]);
  });

  it('bad fields, naming the path of each one', () => {
    const document = documentOf();
    const sessions = document.sessions as Record<string, unknown>[];
    const sets = sessions[1].sets as Record<string, unknown>[];
    sets[0].metric = 'furlongs';
    sets[0].actual = { value: -1 };
    sessions[0].startedAt = 'yesterday';
    (document.equipmentProfiles as Record<string, unknown>[])[1].tags = ['rings', 'jetpack'];
    (document.userActions as Record<string, unknown>[])[0].kind = 'self_destruct';
    document.profile = { createdAt: 1, nickname: 'x' };
    document.extra = true;
    delete document.goals;

    const result = parseDocument(document);
    expect(result.data).toBeUndefined();
    expect(result.issues.map(formatIssue)).toEqual(
      expect.arrayContaining([
        "backup: unknown field 'extra' (allowed: format, schemaVersion, exportedAt, profile, goals, equipmentProfiles, sessions, userActions, overlay, settings)",
        expect.stringMatching(/^backup: profile: unknown field 'nickname'/),
        'backup: goals: must be a list, got nothing',
        "backup: equipmentProfiles[1].tags[1]: must be one of floor, wall, bar, dip_bars, parallettes, bands, rings, pole, box, got 'jetpack'",
        "backup: sessions[0].startedAt: must be a whole number of at least 0, got 'yesterday'",
        "backup: sessions[1].sets[0].metric: must be one of reps, hold_s, eccentric_s, load_xbw, got 'furlongs'",
        'backup: sessions[1].sets[0].actual.value: must be a number of at least 0, got -1',
        "backup: userActions[0].kind: must be one of self_unlock, got 'self_destruct'",
      ]),
    );
    expect(result.issues).toHaveLength(8);
  });

  it('repeated ids and set indexes', () => {
    const duplicated: UserData = {
      ...data,
      sessions: [...data.sessions, data.sessions[0]],
      userActions: [...data.userActions, ...data.userActions],
      equipmentProfiles: [...data.equipmentProfiles, data.equipmentProfiles[0]],
      goals: ['pull_up', 'pull_up'],
    };
    const document = documentOf(duplicated);
    const sets = (document.sessions as { sets: Record<string, unknown>[] }[])[0].sets;
    sets[1].setIndex = 0;
    expect(messages(document)).toEqual([
      "backup: goals[1]: goal 'pull_up' is used more than once",
      "backup: equipmentProfiles[2]: id 'home' is used more than once",
      "backup: sessions[0].sets[1]: setIndex '0' is used more than once",
      "backup: sessions[2]: id 's1' is used more than once",
      "backup: userActions[1]: id 'a1' is used more than once",
    ]);
  });

  it('an overlay that makes a cycle, and goals that are not in the tree', () => {
    const cyclic: UserData = {
      ...data,
      goals: ['pull_up'],
      overlay: {
        ...EMPTY_OVERLAY,
        edited: {
          dead_hang: { prerequisites: [{ nodeId: 'pull_up', minLevel: 1, kind: 'hard' }] },
        },
      },
    };
    const result = parseBackup(serializeBackup(cyclic, EXPORTED_AT), base);
    expect(result.data).toBeUndefined();
    expect(result.issues.map(formatIssue)).toEqual([
      expect.stringMatching(/^backup: .*overlay: .*cycle/),
    ]);

    const missingGoal: UserData = { ...data, goals: ['user_gone'] };
    expect(messages(documentOf(missingGoal))).toEqual([
      "backup: goals[0]: 'user_gone' is not a node in the tree",
    ]);
  });

  it('keeps history on nodes that are not in the tree (the engine ignores them)', () => {
    const history: UserData = {
      ...data,
      sessions: [makeSession('old', 1, [{ nodeId: 'retired_node', count: 1 }])],
      userActions: [{ id: 'a9', kind: 'self_unlock', nodeId: 'retired_node', at: 1 }],
    };
    expect(parseBackup(serializeBackup(history, EXPORTED_AT), base).data).toEqual(history);
  });
});

describe('backupFileName', () => {
  it('uses a UTC timestamp without colons', () => {
    expect(backupFileName(Date.UTC(2026, 8, 27, 8, 30, 5, 123))).toBe(
      'skillforge-backup-2026-09-27T08-30-05Z.json',
    );
    expect(backupFileName(0, 'before-import')).toBe('before-import-1970-01-01T00-00-00Z.json');
  });
});

describe('backupIssueLines', () => {
  it('drops the backup label and caps the list', () => {
    const issues = Array.from({ length: 7 }, (_, index) => ({
      file: 'backup',
      message: `sessions[${index}].id: must be a string`,
    }));
    const { lines, more } = backupIssueLines([...issues, { file: 'overlay', message: 'bad' }], 5);
    expect(lines).toHaveLength(5);
    expect(lines[0]).toBe('sessions[0].id: must be a string');
    expect(more).toBe(3);
    expect(backupIssueLines([{ file: 'overlay', nodeId: 'x', message: 'bad' }]).lines).toEqual([
      'overlay: x: bad',
    ]);
  });
});
