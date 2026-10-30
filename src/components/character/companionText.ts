/**
 * How the companion's customize sheet words slots, unlock rules and progress (PLAN 6.10). The
 * domain gives the numbers (`companionRuleProgress`); the words live here.
 */
import { HERO_CLASS_BY_ID } from '@/data/classes';
import { tierNumeral } from '@/domain/classes';
import type { RuleProgress } from '@/domain/companion';
import { rankLabel } from '@/domain/rankLadder';
import { RANK_TITLES, type CompanionRule, type CompanionSlot } from '@/domain/types';
import { k, t } from '@/i18n';

/** Shown through `t(SLOT_LABELS[slot])`. */
export const SLOT_LABELS: Readonly<Record<CompanionSlot, string>> = {
  head: k('Head'),
  cloak: k('Cloak & back'),
  body: k('Body'),
  hands: k('Hands & arms'),
  aura: k('Aura & emblem'),
};

const className = (classId: string) => {
  const name = HERO_CLASS_BY_ID.get(classId)?.name;
  return name === undefined ? classId : t(name);
};

/** What earns an accessory, e.g. "Rank Adept", "Warrior class, tier III", "50 sessions". */
export function companionRuleText(rule: CompanionRule): string {
  switch (rule.kind) {
    case 'sessions':
      return t('{n} sessions logged', { n: rule.count });
    case 'level':
      return t('Character level {level}', { level: rule.level });
    case 'rank':
      return t('Rank {rank}', { rank: rankLabel(rule.rank) });
    case 'class':
      return t('{name} class, tier {tier}', {
        name: className(rule.classId),
        tier: tierNumeral(rule.tier),
      });
    case 'streak':
      return t('A streak of {n} sessions', { n: rule.count });
    case 'trials':
      return rule.count === 1
        ? t('Pass your first Trial')
        : t('Pass {n} Trials', { n: rule.count });
    case 'eliteTrial':
      return t('Pass the Trial of an elite (legendary) skill');
  }
}

/** Where the hero stands, e.g. "Level 4 / 10", "Novice now", "Tier I / III". */
export function companionProgressText(rule: CompanionRule, progress: RuleProgress): string {
  switch (rule.kind) {
    case 'sessions':
      return t('{current} / {target} sessions', {
        current: progress.current,
        target: progress.target,
      });
    case 'level':
      return t('Level {current} / {target}', {
        current: progress.current,
        target: progress.target,
      });
    case 'rank':
      return t('{rank} now', { rank: rankLabel(RANK_TITLES[progress.current]) });
    case 'class':
      return progress.current === 0
        ? t('Not unlocked yet')
        : t('Tier {tier} now', { tier: tierNumeral(progress.current) });
    case 'streak':
      return t('Best streak {current} / {target}', {
        current: progress.current,
        target: progress.target,
      });
    case 'trials':
      return t('{current} / {target} Trials', {
        current: progress.current,
        target: progress.target,
      });
    case 'eliteTrial':
      return t('Not yet');
  }
}
