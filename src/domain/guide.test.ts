import { HERO_CLASSES } from '@/data/classes';
import { ACCESSORIES } from '@/data/companion/accessories';

import { RANK_BRANCHES } from './character';
import { CONTENT_MAX_DAYS, WAITING_MAX_DAYS } from './companion';
import {
  buildGuide,
  GUIDE,
  GUIDE_TOPICS,
  guideEntry,
  guideFacts,
  guideNumber,
  isGuideTopic,
  type GuideEntry,
  type GuideFacts,
} from './guide';
import { PROFICIENT_LEVEL } from './progression';
import {
  MIN_WEEKS_AT_LEVEL,
  STRAIGHT_ARM_REST_HOURS,
  STRAIGHT_ARM_SESSION_BUDGET_S,
} from './safeguards';
import { CLASS_CHALLENGE_BONUS_XP, STREAK_BONUS_MAX } from './xp';

/** Every text of an entry, summary first. */
const textsOf = (entry: GuideEntry): string[] => [entry.title, entry.summary, ...entry.more];

/**
 * Numbers as the text writes them: digits (with decimals) and tier numerals (I, II, III …), which
 * the guide derives from numbers too.
 */
const NUMBER = /\d+(?:\.\d+)?|\b[IVX]+\b/g;

/** Every number in `facts` changed (n → 10 n + 7), whatever the nesting. */
function perturb<T>(value: T): T {
  if (typeof value === 'number') return (value * 10 + 7) as T;
  if (Array.isArray(value)) return value.map((item: unknown) => perturb(item)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, perturb(item)]),
    ) as T;
  }
  return value;
}

/**
 * The numbers of `real` that stay the same in `changed` (the guide built from perturbed facts):
 * typed into the text instead of built from a constant. Also fails when the words differ.
 */
function handWrittenNumbers(real: GuideEntry[], changed: GuideEntry[]): string[] {
  const found: string[] = [];
  real.forEach((entry, index) => {
    const otherTexts = textsOf(changed[index]);
    textsOf(entry).forEach((text, textIndex) => {
      const otherText = otherTexts[textIndex];
      // The words around the numbers stay the same …
      expect(otherText.replace(NUMBER, '#')).toBe(text.replace(NUMBER, '#'));
      // … and not one number does.
      const otherNumbers = otherText.match(NUMBER) ?? [];
      (text.match(NUMBER) ?? []).forEach((number, numberIndex) => {
        if (number === otherNumbers[numberIndex]) found.push(`${entry.id}: "${number}"`);
      });
    });
  });
  return found;
}

describe('the guide', () => {
  it('has one entry per topic, in order, each with a title, a short summary and details', () => {
    expect(GUIDE.map((entry) => entry.id)).toEqual([...GUIDE_TOPICS]);
    for (const entry of GUIDE) {
      expect(entry.title.length).toBeGreaterThan(0);
      // 1–3 sentences: a sentence ends with ". ", "! " or "? " (or the end of the text).
      const sentences = entry.summary.split(/[.!?](?:\s|$)/).filter((part) => part.trim());
      expect(sentences.length).toBeGreaterThanOrEqual(1);
      expect(sentences.length).toBeLessThanOrEqual(3);
      expect(entry.more.length).toBeGreaterThan(0);
      for (const text of textsOf(entry)) {
        expect(text).not.toMatch(/undefined|NaN|Infinity|\[object/);
        expect(text).toBe(text.trim());
      }
    }
  });

  it('writes no number by hand: every number changes when the facts change', () => {
    expect(handWrittenNumbers(buildGuide(guideFacts()), buildGuide(perturb(guideFacts())))).toEqual(
      [],
    );
  });

  it('would catch a number typed into the text', () => {
    const typed = (facts: GuideFacts) =>
      buildGuide(facts).map((entry) =>
        entry.id === 'xp' ? { ...entry, summary: `${entry.summary} Level 2 is close.` } : entry,
      );
    expect(handWrittenNumbers(typed(guideFacts()), typed(perturb(guideFacts())))).toEqual([
      'xp: "2"',
    ]);
  });

  it('uses the real constants', () => {
    const text = (id: (typeof GUIDE_TOPICS)[number]) => textsOf(guideEntry(id)).join('\n');
    expect(text('safeguards')).toContain(`${MIN_WEEKS_AT_LEVEL} weeks`);
    expect(text('safeguards')).toContain(`${STRAIGHT_ARM_SESSION_BUDGET_S} s`);
    expect(text('safeguards')).toContain(`${STRAIGHT_ARM_REST_HOURS} h`);
    expect(text('skills')).toContain(`level ${PROFICIENT_LEVEL}`);
    expect(text('ranks')).toContain(`${RANK_BRANCHES.length} rank branches`);
    expect(text('ranks')).toContain('7 of the 12 branches');
    expect(text('ranks')).toContain('Acrobatics and Mobility');
    expect(text('ranks')).toContain('Novice OG 0, Apprentice OG 2, Adept OG 6');
    expect(text('streak')).toContain(`+${STREAK_BONUS_MAX * 100} %`);
    expect(text('streak')).toContain('72 h');
    expect(text('challenge')).toContain(`+${CLASS_CHALLENGE_BONUS_XP} XP`);
    expect(text('companion')).toContain(`for ${CONTENT_MAX_DAYS} days`);
    expect(text('companion')).toContain(`up to day ${WAITING_MAX_DAYS}`);
    expect(text('companion')).toContain(`${ACCESSORIES.length} accessories`);
    expect(text('companion')).toContain('tier III');
    expect(text('classes')).toContain(`${HERO_CLASSES.length} of them`);
    expect(text('classes')).toContain('Warrior: Push 30 / 120 / 300');
    expect(text('generator')).toContain('15 to 90 min');
    expect(text('generator')).toContain('your last 5 sessions');
    expect(text('generator')).toContain('up to 5 per exercise');
    expect(text('generator')).toContain('balance and mobility work');
    expect(text('xp')).toContain('1 + 0.25 × its OG level');
  });

  it('formats numbers with at most two decimals', () => {
    expect(guideNumber(10.000000000000009)).toBe('10');
    expect(guideNumber(0.25)).toBe('0.25');
    expect(guideNumber(72)).toBe('72');
  });

  it('knows its topics', () => {
    expect(isGuideTopic('ranks')).toBe(true);
    expect(isGuideTopic('nope')).toBe(false);
    expect(isGuideTopic(3)).toBe(false);
  });

  it('only formats: the same facts give the same guide', () => {
    const facts: GuideFacts = guideFacts();
    expect(buildGuide(facts)).toEqual(GUIDE);
  });
});
