/**
 * How the class sheet words a class rule and the hero's progress on it (PLAN 6.9). The domain
 * gives the numbers (`ruleParts`); the words live here, next to the attribute labels.
 */
import { formatOgLevel } from '@/domain/format';
import type { RequirementPart } from '@/domain/classes';
import { ATTRIBUTES, type ClassRule } from '@/domain/types';

import { ATTRIBUTE_LABELS } from '../node/AttributeChips';

/** What a rule needs in one short line, e.g. "Push 25 and Pull 25", "20 sessions", "Rank Adept". */
export function requirementText(rule: ClassRule): string {
  switch (rule.kind) {
    case 'start':
      return 'Every hero starts here';
    case 'stats': {
      const parts = ATTRIBUTES.filter((attribute) => rule.points[attribute] !== undefined).map(
        (attribute) => `${ATTRIBUTE_LABELS[attribute]} ${rule.points[attribute]}`,
      );
      return parts.length <= 2
        ? parts.join(' and ')
        : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
    }
    case 'sessions':
      return `${rule.count} sessions logged`;
    case 'rank':
      return `Rank ${rule.rank}`;
  }
}

/**
 * Where the hero stands on one part, e.g. "Push 12 / 30", "4 / 20 sessions", "You are Novice · branch
 * median Foundation · Adept at OG 6" (worded like the rank crest's hint).
 */
export function partText(part: RequirementPart): string {
  switch (part.kind) {
    case 'attribute':
      return `${ATTRIBUTE_LABELS[part.attribute]} ${part.current} / ${part.target}`;
    case 'sessions':
      return `${part.current} / ${part.target} sessions`;
    case 'rank':
      return `You are ${part.currentRank} · branch median ${formatOgLevel(part.current)} · ${part.rank} at ${formatOgLevel(part.target)}`;
  }
}
