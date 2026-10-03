/**
 * How a weekly class challenge reads (PLAN 6.9b). The domain gives the goal and the numbers
 * (`src/domain/challenges.ts`); the words live here, next to the class words.
 */
import type { ChallengeGoal } from '@/domain/types';

import { ATTRIBUTE_LABELS } from '../node/AttributeChips';

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

/** "push and pull" from a list of attributes. */
function attributeList(goal: Extract<ChallengeGoal, { kind: 'sessions_training' }>): string {
  const names = goal.attributes.map((attribute) => ATTRIBUTE_LABELS[attribute].toLowerCase());
  return names.length <= 2
    ? names.join(' and ')
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** The challenge in one line, e.g. "Pull work in 3 sessions", "4 mobility exercises". */
export function challengeGoalText(goal: ChallengeGoal, target: number): string {
  switch (goal.kind) {
    case 'sessions':
      return `Train in ${plural(target, 'session', 'sessions')}`;
    case 'complete_sessions':
      return `Finish ${plural(target, 'session', 'sessions')} without skipping a set`;
    case 'sessions_training':
      return `${capitalize(attributeList(goal))} work in ${plural(target, 'session', 'sessions')}`;
    case 'exercises_training':
      return plural(
        target,
        `${ATTRIBUTE_LABELS[goal.attribute].toLowerCase()} exercise`,
        `${ATTRIBUTE_LABELS[goal.attribute].toLowerCase()} exercises`,
      );
    case 'trial_attempts':
      return `Attempt ${plural(target, 'Trial', 'Trials')}`;
  }
}

/** What is counted, for "2 / 3 sessions". */
function unitOf(goal: ChallengeGoal, target: number): string {
  switch (goal.kind) {
    case 'sessions':
    case 'complete_sessions':
    case 'sessions_training':
      return target === 1 ? 'session' : 'sessions';
    case 'exercises_training':
      return target === 1 ? 'exercise' : 'exercises';
    case 'trial_attempts':
      return target === 1 ? 'Trial' : 'Trials';
  }
}

/** Progress, e.g. "2 / 3 sessions" (the count shown at most at the target). */
export function challengeCountText(goal: ChallengeGoal, count: number, target: number): string {
  return `${Math.min(count, target)} / ${target} ${unitOf(goal, target)}`;
}

/** The small print every challenge carries (ADR-058). */
export const CHALLENGE_FINE_PRINT =
  'Optional: missing it costs nothing. Straight-arm skill work (planche, levers) never counts.';
