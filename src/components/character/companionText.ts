/**
 * How the companion's customize sheet words slots, unlock rules and progress (PLAN 6.10). The
 * domain gives the numbers (`companionRuleProgress`); the words live here.
 */
import { HERO_CLASS_BY_ID } from '@/data/classes';
import { tierNumeral } from '@/domain/classes';
import type { RuleProgress } from '@/domain/companion';
import { RANK_TITLES, type CompanionRule, type CompanionSlot } from '@/domain/types';

export const SLOT_LABELS: Readonly<Record<CompanionSlot, string>> = {
  head: 'Head',
  cloak: 'Cloak & back',
  body: 'Body',
  hands: 'Hands & arms',
  aura: 'Aura & emblem',
};

const className = (classId: string) => HERO_CLASS_BY_ID.get(classId)?.name ?? classId;

/** What earns an accessory, e.g. "Rank Adept", "Warrior class, tier III", "50 sessions". */
export function companionRuleText(rule: CompanionRule): string {
  switch (rule.kind) {
    case 'sessions':
      return `${rule.count} sessions logged`;
    case 'level':
      return `Character level ${rule.level}`;
    case 'rank':
      return `Rank ${rule.rank}`;
    case 'class':
      return `${className(rule.classId)} class, tier ${tierNumeral(rule.tier)}`;
    case 'streak':
      return `A streak of ${rule.count} sessions`;
    case 'trials':
      return rule.count === 1 ? 'Pass your first Trial' : `Pass ${rule.count} Trials`;
    case 'eliteTrial':
      return 'Pass the Trial of an elite (legendary) skill';
  }
}

/** Where the hero stands, e.g. "Level 4 / 10", "Novice now", "Tier I / III". */
export function companionProgressText(rule: CompanionRule, progress: RuleProgress): string {
  switch (rule.kind) {
    case 'sessions':
      return `${progress.current} / ${progress.target} sessions`;
    case 'level':
      return `Level ${progress.current} / ${progress.target}`;
    case 'rank':
      return `${RANK_TITLES[progress.current]} now`;
    case 'class':
      return progress.current === 0
        ? 'Not unlocked yet'
        : `Tier ${tierNumeral(progress.current)} now`;
    case 'streak':
      return `Best streak ${progress.current} / ${progress.target}`;
    case 'trials':
      return `${progress.current} / ${progress.target} Trials`;
    case 'eliteTrial':
      return 'Not yet';
  }
}
