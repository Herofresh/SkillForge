import { makeNode } from '@/data/testFixtures';

import type { AttributeValues } from './character';
import {
  classFacts,
  classLadder,
  classSettingsToRaw,
  classTier,
  classTitle,
  EMPTY_CLASS_SETTINGS,
  isNewClassTier,
  mergeClassUnlocks,
  parseClassSettings,
  reachedTier,
  ruleFraction,
  ruleMet,
  ruleParts,
  seenAllTiers,
  sessionClassTierUps,
  tierNumeral,
  wornClass,
  type ClassFacts,
  type ClassSettings,
} from './classes';
import { PROFICIENT_LEVEL, xpForLevel } from './progression';
import type { ClassDefinition } from './types';

const attributes = (values: Partial<AttributeValues> = {}): AttributeValues => ({
  push: 0,
  pull: 0,
  core: 0,
  legs: 0,
  balance: 0,
  mobility: 0,
  ...values,
});

const facts = (overrides: Partial<ClassFacts> = {}): ClassFacts => ({
  attributes: attributes(),
  sessions: 0,
  rank: 'Novice',
  medianOgLevel: 0,
  ...overrides,
});

const RECRUIT: ClassDefinition = {
  id: 'recruit',
  name: 'Recruit',
  tiers: [{ name: 'Recruit', rule: { kind: 'start' } }],
};
const WARRIOR: ClassDefinition = {
  id: 'warrior',
  name: 'Warrior',
  tiers: [
    { name: 'Warrior', rule: { kind: 'stats', points: { push: 30 } } },
    { name: 'Veteran', rule: { kind: 'stats', points: { push: 120 } } },
    { name: 'Warlord', rule: { kind: 'stats', points: { push: 300 } } },
  ],
};
const PALADIN: ClassDefinition = {
  id: 'paladin',
  name: 'Paladin',
  tiers: [
    { name: 'Paladin', rule: { kind: 'stats', points: { push: 25, pull: 25 } } },
    { name: 'Crusader', rule: { kind: 'stats', points: { push: 100, pull: 100 } } },
  ],
};
const BERSERKER: ClassDefinition = {
  id: 'berserker',
  name: 'Berserker',
  tiers: [{ name: 'Berserker', rule: { kind: 'sessions', count: 20 } }],
};
const SORCERER: ClassDefinition = {
  id: 'sorcerer',
  name: 'Sorcerer',
  tiers: [{ name: 'Sorcerer', rule: { kind: 'rank', rank: 'Adept' } }],
};
const CLASSES = [RECRUIT, WARRIOR, PALADIN, BERSERKER, SORCERER];

describe('classFacts', () => {
  it('reads attributes, rank and the session count from the engine state', () => {
    const node = makeNode({ id: 'push_up', ogLevel: 0, patterns: ['horizontal_push'] });
    const progress = {
      push_up: {
        nodeId: 'push_up',
        xp: xpForLevel(PROFICIENT_LEVEL, 0),
        level: PROFICIENT_LEVEL,
        trialPassed: true,
      },
    };
    const result = classFacts([node], { progress, totalXp: 50 }, 3);
    expect(result.attributes.push).toBe(5);
    expect(result.sessions).toBe(3);
    expect(result.rank).toBe('Novice');
  });
});

describe('ruleParts / ruleMet', () => {
  it('needs every listed attribute at its flat threshold', () => {
    const rule = PALADIN.tiers[0].rule;
    expect(ruleMet(rule, facts({ attributes: attributes({ push: 25, pull: 24 }) }))).toBe(false);
    expect(ruleMet(rule, facts({ attributes: attributes({ push: 25, pull: 25 }) }))).toBe(true);
    const parts = ruleParts(rule, facts({ attributes: attributes({ push: 50, pull: 10 }) }));
    expect(parts).toEqual([
      { kind: 'attribute', attribute: 'push', current: 50, target: 25, met: true, fraction: 1 },
      { kind: 'attribute', attribute: 'pull', current: 10, target: 25, met: false, fraction: 0.4 },
    ]);
    expect(ruleFraction(parts)).toBeCloseTo(0.7);
  });

  it('is monotonic: more points never un-meet a stats rule (one area far ahead is fine)', () => {
    const rule = WARRIOR.tiers[0].rule;
    expect(ruleMet(rule, facts({ attributes: attributes({ push: 30, pull: 900 }) }))).toBe(true);
    expect(ruleMet(rule, facts({ attributes: attributes({ push: 31, pull: 900 }) }))).toBe(true);
  });

  it('counts sessions and compares ranks', () => {
    expect(ruleMet(BERSERKER.tiers[0].rule, facts({ sessions: 19 }))).toBe(false);
    expect(ruleMet(BERSERKER.tiers[0].rule, facts({ sessions: 20 }))).toBe(true);
    const rank = SORCERER.tiers[0].rule;
    expect(ruleMet(rank, facts({ rank: 'Apprentice', medianOgLevel: 3 }))).toBe(false);
    expect(ruleMet(rank, facts({ rank: 'Master', medianOgLevel: 9 }))).toBe(true);
    const [part] = ruleParts(rank, facts({ rank: 'Apprentice', medianOgLevel: 3 }));
    expect(part).toMatchObject({ kind: 'rank', rank: 'Adept', current: 3, target: 6 });
    expect(part.fraction).toBe(0.5);
  });

  it('always meets the start rule', () => {
    expect(ruleParts({ kind: 'start' }, facts())).toEqual([]);
    expect(ruleMet({ kind: 'start' }, facts())).toBe(true);
  });
});

describe('reachedTier', () => {
  it('counts tiers from I and stops at the first missed one', () => {
    expect(reachedTier(WARRIOR, facts())).toBe(0);
    expect(reachedTier(WARRIOR, facts({ attributes: attributes({ push: 130 }) }))).toBe(2);
    expect(reachedTier(WARRIOR, facts({ attributes: attributes({ push: 999 }) }))).toBe(3);
    expect(reachedTier(RECRUIT, facts())).toBe(1);
  });
});

describe('mergeClassUnlocks', () => {
  it('adds newly reached tiers with their source and reports them', () => {
    const first = mergeClassUnlocks(CLASSES, {}, facts({ attributes: attributes({ push: 130 }) }), {
      at: 10,
      sessionId: 's1',
    });
    expect(first.gained).toEqual([
      { classId: 'warrior', tier: 1 },
      { classId: 'warrior', tier: 2 },
    ]);
    expect(first.unlocks).toEqual({
      warrior: [
        { at: 10, sessionId: 's1' },
        { at: 10, sessionId: 's1' },
      ],
    });
    // The starting class is never stored; it is always tier I.
    expect(first.unlocks.recruit).toBeUndefined();
  });

  it('never removes a reached tier, even when the numbers drop later', () => {
    const unlocks = { warrior: [{ at: 10 }, { at: 20 }] };
    const merged = mergeClassUnlocks(CLASSES, unlocks, facts(), { at: 30 });
    expect(merged.gained).toEqual([]);
    expect(merged.unlocks).toBe(unlocks);
  });

  it('keeps the first time of a tier and adds only the new ones', () => {
    const merged = mergeClassUnlocks(
      CLASSES,
      { warrior: [{ at: 10 }] },
      facts({ attributes: attributes({ push: 120 }) }),
      { at: 50, sessionId: 's5' },
    );
    expect(merged.unlocks.warrior).toEqual([{ at: 10 }, { at: 50, sessionId: 's5' }]);
    expect(sessionClassTierUps(CLASSES, merged.unlocks, 's5')).toEqual([
      { classId: 'warrior', tier: 2 },
    ]);
  });
});

describe('titles and tiers', () => {
  it('names the tier the hero has, the class name while locked', () => {
    expect(classTitle(WARRIOR, 0)).toBe('Warrior');
    expect(classTitle(WARRIOR, 2)).toBe('Veteran');
    expect(classTitle(WARRIOR, 9)).toBe('Warlord');
    expect(tierNumeral(1)).toBe('I');
    expect(tierNumeral(3)).toBe('III');
  });

  it('gives the starting class tier I and caps stored tiers at the tier count', () => {
    expect(classTier(RECRUIT, {})).toBe(1);
    expect(classTier(BERSERKER, { berserker: [{ at: 1 }, { at: 2 }] })).toBe(1);
  });
});

describe('wornClass', () => {
  it('wears the selected class while it is unlocked, else the starting class', () => {
    const settings: ClassSettings = {
      selected: 'warrior',
      unlocks: { warrior: [{ at: 1 }, { at: 2 }] },
      seen: {},
    };
    expect(wornClass(CLASSES, settings)).toEqual({ classId: 'warrior', tier: 2 });
    expect(wornClass(CLASSES, { ...settings, unlocks: {} })).toEqual({
      classId: 'recruit',
      tier: 1,
    });
    expect(wornClass(CLASSES, EMPTY_CLASS_SETTINGS)).toEqual({ classId: 'recruit', tier: 1 });
  });
});

describe('NEW badges', () => {
  it('marks reached tiers until the sheet was opened', () => {
    const settings: ClassSettings = { unlocks: { warrior: [{ at: 1 }] }, seen: {} };
    expect(isNewClassTier(WARRIOR, settings)).toBe(true);
    expect(isNewClassTier(RECRUIT, settings)).toBe(false);
    const seen = seenAllTiers(CLASSES, settings);
    expect(seen).toEqual({ warrior: 1 });
    expect(isNewClassTier(WARRIOR, { ...settings, seen })).toBe(false);
    const tierUp = { unlocks: { warrior: [{ at: 1 }, { at: 2 }] }, seen };
    expect(isNewClassTier(WARRIOR, tierUp)).toBe(true);
  });
});

describe('parseClassSettings / classSettingsToRaw', () => {
  it('round-trips the stored form', () => {
    const settings: ClassSettings = {
      selected: 'warrior',
      unlocks: { warrior: [{ at: 5, sessionId: 's1' }, { at: 9 }] },
      seen: { warrior: 1 },
    };
    const raw = JSON.parse(JSON.stringify(classSettingsToRaw(settings)));
    expect(raw.version).toBe(1);
    expect(parseClassSettings(raw, CLASSES)).toEqual(settings);
  });

  it('reads anything broken as the empty state, or drops the broken parts', () => {
    expect(parseClassSettings(undefined, CLASSES)).toEqual(EMPTY_CLASS_SETTINGS);
    expect(parseClassSettings('warrior', CLASSES)).toEqual(EMPTY_CLASS_SETTINGS);
    expect(
      parseClassSettings(
        {
          selected: 'necromancer',
          unlocks: {
            necromancer: [{ at: 1 }],
            recruit: [{ at: 1 }],
            warrior: [{ at: 1 }, { at: 'later' }, { at: 3 }],
            berserker: [{ at: 1 }, { at: 2 }],
            paladin: 'yes',
          },
          seen: { warrior: 1, paladin: -1, ghost: 2 },
        },
        CLASSES,
      ),
    ).toEqual({
      unlocks: { warrior: [{ at: 1 }], berserker: [{ at: 1 }] },
      seen: { warrior: 1 },
    });
  });
});

describe('classLadder', () => {
  it('lists every class with its tier, status and the next tier to reach', () => {
    const settings: ClassSettings = {
      selected: 'warrior',
      unlocks: { warrior: [{ at: 1 }] },
      seen: { warrior: 1 },
    };
    const rows = classLadder(
      CLASSES,
      facts({ attributes: attributes({ push: 60, pull: 5 }), sessions: 4 }),
      settings,
    );
    expect(rows.map((row) => row.classId)).toEqual(CLASSES.map((entry) => entry.id));
    const [recruit, warrior, paladin, berserker] = rows;
    expect(recruit).toMatchObject({ status: 'unlocked', tier: 1, title: 'Recruit', isNew: false });
    expect(recruit.next).toBeUndefined();
    expect(warrior).toMatchObject({ status: 'worn', tier: 1, title: 'Warrior', tierCount: 3 });
    expect(warrior.next).toMatchObject({ tier: 2, title: 'Veteran', fraction: 0.5 });
    expect(paladin).toMatchObject({ status: 'locked', tier: 0, title: 'Paladin' });
    expect(paladin.next?.parts.map((entry) => entry.met)).toEqual([true, false]);
    expect(berserker.next?.fraction).toBe(0.2);
  });
});
