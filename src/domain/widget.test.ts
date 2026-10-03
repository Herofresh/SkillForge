import { makeChain, makeNode } from '@/data/testFixtures';
import { MS_PER_HOUR } from '@/lib/time';

import { computeCharacter } from './character';
import { PROFICIENT_LEVEL, xpForLevel } from './progression';
import { INITIAL_ENGINE_STATE } from './recompute';
import type { NodeProgress } from './types';
import {
  parseWidgetSnapshot,
  topAttributes,
  WIDGET_DEEP_LINK,
  WIDGET_SNAPSHOT_VERSION,
  widgetSnapshot,
  widgetView,
  type WidgetSnapshot,
} from './widget';
import { STREAK_MAX_GAP_MS } from './xp';

const proficient = (nodeId: string, ogLevel = 0): NodeProgress => ({
  nodeId,
  xp: xpForLevel(PROFICIENT_LEVEL, ogLevel),
  level: PROFICIENT_LEVEL,
  trialPassed: true,
  firstTrainedAt: 1,
});

/** Local times (the widget's "today" is the device's calendar day). */
const at = (day: number, hour: number, minute = 0): number =>
  new Date(2026, 9, day, hour, minute).getTime();

const snapshot = (overrides: Partial<WidgetSnapshot> = {}): WidgetSnapshot => ({
  version: WIDGET_SNAPSHOT_VERSION,
  level: 4,
  rank: 'Apprentice',
  streak: 3,
  lastSessionAt: at(2, 18),
  topAttributes: [{ attribute: 'pull', value: 12 }],
  ...overrides,
});

describe('topAttributes', () => {
  it('lists the strongest attributes with points, ties in ATTRIBUTES order', () => {
    expect(topAttributes({ push: 5, pull: 9, core: 5, legs: 0, balance: 1, mobility: 2 })).toEqual([
      { attribute: 'pull', value: 9 },
      { attribute: 'push', value: 5 },
      { attribute: 'core', value: 5 },
    ]);
  });

  it('leaves out attributes without points', () => {
    expect(topAttributes({ push: 0, pull: 0, core: 0, legs: 0, balance: 0, mobility: 3 })).toEqual([
      { attribute: 'mobility', value: 3 },
    ]);
  });
});

describe('widgetSnapshot', () => {
  it('describes a new hero', () => {
    expect(widgetSnapshot({ nodes: makeChain(), engine: INITIAL_ENGINE_STATE })).toEqual({
      version: WIDGET_SNAPSHOT_VERSION,
      level: 1,
      rank: 'Novice',
      streak: 0,
      topAttributes: [],
      heroClass: { id: 'recruit', tier: 1 },
      companion: { loadout: {}, weapon: { classId: 'recruit', upgraded: false }, look: {} },
    });
  });

  it('carries what the companion wears and the worn class weapon (PLAN 6.10)', () => {
    const classes = {
      selected: 'warrior',
      unlocks: { warrior: [{ at: 1 }, { at: 2 }, { at: 3 }] },
      seen: {},
    };
    const companion = {
      unlocks: { rope_headband: { at: 1 }, iron_helm: { at: 2 }, hooded_cloak: { at: 3 } },
      equipped: { cloak: null },
      look: { skin: 'copper' },
      seen: [],
    };
    const result = widgetSnapshot({
      nodes: makeChain(),
      engine: { ...INITIAL_ENGINE_STATE, lastSessionAt: at(2, 18) },
      classes,
      companion,
    });
    expect(result.companion).toEqual({
      loadout: { head: 'iron_helm' },
      weapon: { classId: 'warrior', upgraded: true },
      look: { skin: 'copper' },
    });
    // The mood is decided when the widget draws.
    expect(widgetView(result, at(2, 20))).toMatchObject({
      companion: { mood: 'happy', moodTitle: 'Fired up' },
    });
    expect(widgetView(result, at(12, 9))).toMatchObject({ companion: { mood: 'sad' } });
    expect(parseWidgetSnapshot(JSON.stringify(result))).toEqual(result);
  });

  it('carries the worn class and its tier (PLAN 6.9)', () => {
    const classes = { selected: 'warrior', unlocks: { warrior: [{ at: 1 }, { at: 2 }] }, seen: {} };
    const result = widgetSnapshot({ nodes: makeChain(), engine: INITIAL_ENGINE_STATE, classes });
    expect(result.heroClass).toEqual({ id: 'warrior', tier: 2 });
    expect(widgetView(result, at(2, 12))).toMatchObject({
      heroClass: { id: 'warrior', title: 'Veteran' },
    });
  });

  it('takes level, rank and attributes from computeCharacter', () => {
    const nodes = [
      makeNode({ id: 'planche', branch: 'planche', ogLevel: 8, patterns: ['straight_arm_push'] }),
    ];
    const engine = {
      ...INITIAL_ENGINE_STATE,
      progress: { planche: proficient('planche', 8) },
      totalXp: 150,
      streak: 2,
      lastSessionAt: 42,
    };
    const character = computeCharacter(nodes, engine.progress, engine.totalXp);
    const result = widgetSnapshot({ nodes, engine });
    expect(result).toMatchObject({
      level: character.level,
      rank: character.rank,
      streak: 2,
      lastSessionAt: 42,
    });
    expect(result.topAttributes).toEqual(topAttributes(character.attributes));
    expect(result.topAttributes[0].attribute).toBe('push');
  });

  it('survives a JSON round trip', () => {
    const value = snapshot();
    expect(parseWidgetSnapshot(JSON.stringify(value))).toEqual(value);
  });
});

describe('widgetView', () => {
  it('shows the first-run state without a snapshot', () => {
    expect(widgetView(undefined, at(2, 12))).toEqual({ kind: 'empty', deepLink: WIDGET_DEEP_LINK });
  });

  it('is "trained today" on the day of the last session', () => {
    const view = widgetView(snapshot({ lastSessionAt: at(2, 7) }), at(2, 23, 59));
    expect(view).toMatchObject({
      kind: 'hero',
      trainedToday: true,
      status: 'Trained today',
      streak: 3,
      level: 4,
      rank: 'Apprentice',
      deepLink: WIDGET_DEEP_LINK,
    });
  });

  it('flips to "not yet" after local midnight, keeping the streak', () => {
    const view = widgetView(snapshot({ lastSessionAt: at(2, 23, 30) }), at(3, 0, 1));
    expect(view).toMatchObject({ trainedToday: false, status: 'Not yet today', streak: 3 });
  });

  it('drops the streak once the next session could no longer extend it (activeStreak)', () => {
    const last = at(2, 18);
    expect(widgetView(snapshot({ lastSessionAt: last }), last + STREAK_MAX_GAP_MS)).toMatchObject({
      streak: 3,
    });
    expect(
      widgetView(snapshot({ lastSessionAt: last }), last + STREAK_MAX_GAP_MS + MS_PER_HOUR),
    ).toMatchObject({ streak: 0, trainedToday: false });
  });

  it('is "not yet" for a hero who never trained', () => {
    expect(widgetView(snapshot({ lastSessionAt: undefined, streak: 0 }), at(2, 12))).toMatchObject({
      trainedToday: false,
      streak: 0,
    });
  });
});

describe('parseWidgetSnapshot', () => {
  it('reads a snapshot written before classes (no heroClass) and drops an unknown class', () => {
    const { heroClass: _dropped, ...old } = snapshot({ heroClass: { id: 'monk', tier: 1 } });
    expect(parseWidgetSnapshot(JSON.stringify(old))).toEqual(old);
    expect(widgetView(old, at(2, 12))).not.toHaveProperty('heroClass');
    const unknown = { ...old, heroClass: { id: 'necromancer', tier: 1 } };
    expect(parseWidgetSnapshot(JSON.stringify(unknown))).toEqual(old);
    const known = { ...old, heroClass: { id: 'monk', tier: 3 } };
    expect(parseWidgetSnapshot(JSON.stringify(known))).toEqual(known);
  });

  it.each([
    ['no file', undefined],
    ['broken JSON', '{"version":'],
    ['another version', JSON.stringify({ ...snapshot(), version: 99 })],
    ['an unknown rank', JSON.stringify({ ...snapshot(), rank: 'Emperor' })],
    ['a negative level', JSON.stringify({ ...snapshot(), level: -1 })],
    ['a bad attribute', JSON.stringify({ ...snapshot(), topAttributes: [{ attribute: 'x' }] })],
    ['an array', '[]'],
  ])('ignores %s', (_label, text) => {
    expect(parseWidgetSnapshot(text)).toBeUndefined();
  });

  it('reads a snapshot written before the companion, and drops a broken companion', () => {
    const old = snapshot();
    expect(widgetView(old, at(2, 12))).not.toHaveProperty('companion');
    const broken = { ...old, companion: { loadout: {}, weapon: { classId: 'necromancer' } } };
    expect(parseWidgetSnapshot(JSON.stringify(broken))).toEqual(old);
    const misplaced = {
      ...old,
      companion: {
        loadout: { head: 'hooded_cloak', cloak: 'hooded_cloak', aura: 'gone' },
        weapon: { classId: 'monk', upgraded: 'yes' },
        look: { skin: 4, hair: 'red' },
      },
    };
    expect(parseWidgetSnapshot(JSON.stringify(misplaced))?.companion).toEqual({
      loadout: { cloak: 'hooded_cloak' },
      weapon: { classId: 'monk', upgraded: false },
      look: { hair: 'red' },
    });
  });

  it('keeps a snapshot without the optional fields', () => {
    const value = snapshot({ lastSessionAt: undefined });
    delete value.lastSessionAt;
    expect(parseWidgetSnapshot(JSON.stringify(value))).toEqual(value);
  });

  it('reads an older file that still has heroName and drops the name', () => {
    const value = snapshot();
    expect(parseWidgetSnapshot(JSON.stringify({ ...value, heroName: 'Aria' }))).toEqual(value);
  });
});
