/**
 * How a weekly class challenge reads (PLAN 6.9b). The domain gives the goal and the numbers
 * (`src/domain/challenges.ts`); the words live here, next to the class words.
 */
import { ATTRIBUTE_WORDS } from '@/domain/characterView';
import type { ChallengeGoal } from '@/domain/types';
import { k, t } from '@/i18n';

/** "push and pull" from a list of attributes. */
function attributeList(goal: Extract<ChallengeGoal, { kind: 'sessions_training' }>): string {
  const names = goal.attributes.map((attribute) => t(ATTRIBUTE_WORDS[attribute]));
  return names.length === 1
    ? names[0]
    : t('{a} and {b}', { a: names.slice(0, -1).join(', '), b: names[names.length - 1] });
}

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** The challenge in one line, e.g. "Pull work in 3 sessions", "4 mobility exercises". */
export function challengeGoalText(goal: ChallengeGoal, target: number): string {
  switch (goal.kind) {
    case 'sessions':
      return target === 1 ? t('Train in 1 session') : t('Train in {n} sessions', { n: target });
    case 'complete_sessions':
      return target === 1
        ? t('Finish 1 session without skipping a set')
        : t('Finish {n} sessions without skipping a set', { n: target });
    case 'sessions_training': {
      const attributes = capitalize(attributeList(goal));
      return target === 1
        ? t('{attributes} work in 1 session', { attributes })
        : t('{attributes} work in {n} sessions', { attributes, n: target });
    }
    case 'exercises_training': {
      const attribute = t(ATTRIBUTE_WORDS[goal.attribute]);
      return target === 1
        ? t('1 {attribute} exercise', { attribute })
        : t('{n} {attribute} exercises', { n: target, attribute });
    }
    case 'trial_attempts':
      return target === 1 ? t('Attempt 1 Trial') : t('Attempt {n} Trials', { n: target });
  }
}

/** Progress, e.g. "2 / 3 sessions" (the count shown at most at the target). */
export function challengeCountText(goal: ChallengeGoal, count: number, target: number): string {
  const n = Math.min(count, target);
  switch (goal.kind) {
    case 'sessions':
    case 'complete_sessions':
    case 'sessions_training':
      return target === 1
        ? t('{n} / 1 session', { n })
        : t('{n} / {target} sessions', { n, target });
    case 'exercises_training':
      return target === 1
        ? t('{n} / 1 exercise', { n })
        : t('{n} / {target} exercises', { n, target });
    case 'trial_attempts':
      return target === 1 ? t('{n} / 1 Trial', { n }) : t('{n} / {target} Trials', { n, target });
  }
}

/** The small print every challenge carries (ADR-058); shown through `t`. */
export const CHALLENGE_FINE_PRINT = k(
  'Optional: missing it costs nothing. Straight-arm skill work (planche, levers) never counts.',
);
