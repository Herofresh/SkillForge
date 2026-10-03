import { makeNode } from '@/data/testFixtures';
import { MS_PER_DAY, MS_PER_HOUR } from '@/lib/time';

import {
  companionFacts,
  companionLoadout,
  companionMood,
  companionRuleMet,
  companionRuleProgress,
  companionSettingsToRaw,
  companionWardrobe,
  EMPTY_COMPANION_SETTINGS,
  equipAccessory,
  loadoutDrawOrder,
  mergeAccessoryUnlocks,
  moodLine,
  newAccessoryCount,
  parseCompanionSettings,
  sessionAccessoryUnlocks,
  type CompanionFacts,
  type CompanionSettings,
} from './companion';
import type { AccessoryDefinition } from './types';

/** Local noon on some day, so "days later" never crosses midnight by accident. */
const NOON = new Date(2026, 9, 3, 12, 0, 0).getTime();

const ITEMS: AccessoryDefinition[] = [
  { id: 'band', name: 'Band', slot: 'head', rule: { kind: 'rank', rank: 'Novice' } },
  { id: 'helm', name: 'Helm', slot: 'head', rule: { kind: 'class', classId: 'warrior', tier: 1 } },
  { id: 'crown', name: 'Crown', slot: 'head', rule: { kind: 'rank', rank: 'Legend' } },
  { id: 'cloak', name: 'Cloak', slot: 'cloak', rule: { kind: 'level', level: 2 } },
  { id: 'aura', name: 'Aura', slot: 'aura', rule: { kind: 'streak', count: 3 } },
  { id: 'medal', name: 'Medal', slot: 'aura', rule: { kind: 'trials', count: 1 } },
  { id: 'star', name: 'Star', slot: 'aura', rule: { kind: 'eliteTrial' } },
  { id: 'scarf', name: 'Scarf', slot: 'cloak', rule: { kind: 'sessions', count: 2 } },
];

const NONE: CompanionFacts = {
  sessions: 0,
  level: 1,
  rank: 'Novice',
  classTiers: {},
  bestStreak: 0,
  trialsPassed: 0,
  eliteTrialPassed: false,
};

describe('companion mood (PLAN 6.10)', () => {
  it('is happy on a training day, content for two rest days, then waiting, then sad', () => {
    const days = (n: number) => NOON + n * MS_PER_DAY;
    expect(companionMood(NOON, NOON + 3 * MS_PER_HOUR)).toBe('happy');
    expect(companionMood(NOON, days(1))).toBe('content');
    expect(companionMood(NOON, days(2))).toBe('content');
    expect(companionMood(NOON, days(3))).toBe('waiting');
    expect(companionMood(NOON, days(5))).toBe('waiting');
    expect(companionMood(NOON, days(6))).toBe('sad');
    // Never worse than sad, however long the break.
    expect(companionMood(NOON, days(400))).toBe('sad');
  });

  it('counts calendar days, not 24-hour blocks', () => {
    const lateEvening = new Date(2026, 9, 3, 23, 30).getTime();
    const nextMorning = new Date(2026, 9, 4, 0, 30).getTime();
    expect(companionMood(lateEvening, nextMorning)).toBe('content');
  });

  it('waits for the first session and cheers up at once after a session', () => {
    expect(companionMood(undefined, NOON)).toBe('waiting');
    const later = NOON + 30 * MS_PER_DAY;
    expect(companionMood(NOON, later)).toBe('sad');
    expect(companionMood(later - MS_PER_HOUR, later)).toBe('happy');
  });

  it('words every mood kindly and always offers a way back', () => {
    expect(moodLine('sad', NOON)).toMatch(/cheers it up/);
    expect(moodLine('waiting', undefined)).toMatch(/first quest/);
    for (const mood of ['happy', 'content', 'waiting', 'sad'] as const) {
      expect(moodLine(mood, NOON)).not.toMatch(/die|sick|lost|lose/i);
    }
  });
});

describe('companion facts and rules', () => {
  it('derives the facts from the engine, the session results and the class tiers', () => {
    const elite = makeNode({ id: 'elite', ogLevel: 14 });
    const easy = makeNode({ id: 'easy', ogLevel: 2 });
    const facts = companionFacts({
      nodes: [elite, easy],
      engine: {
        totalXp: 0,
        progress: {
          easy: { nodeId: 'easy', xp: 10, level: 2, trialPassed: true },
          elite: { nodeId: 'elite', xp: 0, level: 1, trialPassed: false },
        },
      },
      sessionCount: 4,
      sessionResults: { a: { streak: 1 }, b: { streak: 4 }, c: { streak: 1 } },
      classUnlocks: { warrior: [{ at: 1 }, { at: 2 }] },
    });
    expect(facts).toMatchObject({
      sessions: 4,
      level: 1,
      bestStreak: 4,
      trialsPassed: 1,
      eliteTrialPassed: false,
      classTiers: { warrior: 2 },
    });
  });

  it('knows an elite Trial', () => {
    const elite = makeNode({ id: 'elite', ogLevel: 14 });
    const facts = companionFacts({
      nodes: [elite],
      engine: {
        totalXp: 0,
        progress: { elite: { nodeId: 'elite', xp: 0, level: 6, trialPassed: true } },
      },
      sessionCount: 1,
      sessionResults: {},
      classUnlocks: {},
    });
    expect(facts.eliteTrialPassed).toBe(true);
    expect(companionRuleMet({ kind: 'eliteTrial' }, facts)).toBe(true);
  });

  it('checks every rule kind against flat thresholds', () => {
    const facts: CompanionFacts = {
      sessions: 2,
      level: 3,
      rank: 'Adept',
      classTiers: { warrior: 1, monk: 2 },
      bestStreak: 3,
      trialsPassed: 1,
      eliteTrialPassed: false,
    };
    const met = ITEMS.filter((item) => companionRuleMet(item.rule, facts)).map((item) => item.id);
    expect(met).toEqual(['band', 'helm', 'cloak', 'aura', 'medal', 'scarf']);
    expect(companionRuleProgress({ kind: 'level', level: 10 }, facts)).toEqual({
      current: 3,
      target: 10,
      met: false,
    });
    expect(companionRuleProgress({ kind: 'rank', rank: 'Legend' }, facts)).toMatchObject({
      current: 2,
      target: 4,
    });
  });
});

describe('earning accessories', () => {
  it('adds what the facts earn, stamped with the source, and never removes anything', () => {
    const first = mergeAccessoryUnlocks(ITEMS, {}, NONE, { at: 5, sessionId: 's1' });
    expect(first.gained).toEqual(['band']);
    expect(first.unlocks).toEqual({ band: { at: 5, sessionId: 's1' } });

    const second = mergeAccessoryUnlocks(
      ITEMS,
      first.unlocks,
      { ...NONE, sessions: 2, level: 2 },
      { at: 9, sessionId: 's2' },
    );
    expect(second.gained).toEqual(['cloak', 'scarf']);
    expect(sessionAccessoryUnlocks(ITEMS, second.unlocks, 's2')).toEqual(['cloak', 'scarf']);

    // Facts going down (a hidden node) keep what was earned.
    const third = mergeAccessoryUnlocks(ITEMS, second.unlocks, NONE, { at: 11 });
    expect(third.gained).toEqual([]);
    expect(third.unlocks).toBe(second.unlocks);
  });
});

describe('what the companion wears', () => {
  const earned: CompanionSettings = {
    ...EMPTY_COMPANION_SETTINGS,
    unlocks: { band: { at: 1 }, helm: { at: 2 }, cloak: { at: 3 }, scarf: { at: 4 } },
  };

  it('shows the grandest earned item of every slot the hero never chose for', () => {
    expect(companionLoadout(ITEMS, earned)).toEqual({ head: 'helm', cloak: 'scarf' });
  });

  it('keeps an earned choice, an emptied slot, and ignores an unearned choice', () => {
    const settings = { ...earned, equipped: { head: 'band', cloak: null, aura: 'star' } };
    expect(companionLoadout(ITEMS, settings)).toEqual({ head: 'band' });
  });

  it('draws back items first and the head last', () => {
    expect(loadoutDrawOrder({ head: 'helm', aura: 'medal', cloak: 'scarf' })).toEqual([
      'medal',
      'scarf',
      'helm',
    ]);
  });

  it('equips only earned items in their own slot', () => {
    expect(equipAccessory(ITEMS, earned, 'head', 'band').equipped).toEqual({ head: 'band' });
    expect(equipAccessory(ITEMS, earned, 'cloak', null).equipped).toEqual({ cloak: null });
    expect(() => equipAccessory(ITEMS, earned, 'head', 'crown')).toThrow(/not earned/);
    expect(() => equipAccessory(ITEMS, earned, 'cloak', 'band')).toThrow(/not worn on/);
    expect(() => equipAccessory(ITEMS, earned, 'head', 'nope')).toThrow(/Unknown/);
  });

  it('lists every slot with worn, earned and locked items and NEW ones', () => {
    const wardrobe = companionWardrobe(ITEMS, { ...earned, seen: ['band'] }, NONE);
    const head = wardrobe.find((row) => row.slot === 'head');
    expect(head?.worn).toBe('helm');
    expect(head?.items.map((item) => [item.id, item.status, item.isNew])).toEqual([
      ['band', 'earned', false],
      ['helm', 'worn', true],
      ['crown', 'locked', false],
    ]);
    expect(newAccessoryCount({ ...earned, seen: ['band'] })).toBe(3);
  });
});

describe('the stored setting', () => {
  it('round-trips', () => {
    const settings: CompanionSettings = {
      unlocks: { band: { at: 1, sessionId: 's1' }, cloak: { at: 2 } },
      equipped: { head: 'band', cloak: null },
      look: { skin: 'copper', hair: 'red', outfit: 'azure' },
      seen: ['band'],
    };
    expect(parseCompanionSettings(companionSettingsToRaw(settings), ITEMS)).toEqual(settings);
  });

  it('reads anything broken as empty and drops unknown or misplaced entries', () => {
    expect(parseCompanionSettings(undefined, ITEMS)).toEqual(EMPTY_COMPANION_SETTINGS);
    expect(parseCompanionSettings('junk', ITEMS)).toEqual(EMPTY_COMPANION_SETTINGS);
    const parsed = parseCompanionSettings(
      {
        unlocks: { band: { at: 1 }, gone: { at: 2 }, cloak: { at: -1 }, helm: 'x' },
        equipped: { head: 'cloak', cloak: 'scarf', aura: 7 },
        look: { skin: 3, hair: 'red' },
        seen: ['band', 'band', 'gone', 4],
      },
      ITEMS,
    );
    expect(parsed).toEqual({
      unlocks: { band: { at: 1 } },
      equipped: { cloak: 'scarf' },
      look: { hair: 'red' },
      seen: ['band'],
    });
  });
});
