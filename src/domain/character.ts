/**
 * The character sheet (PLAN 2.4, ADR-018): character level from total XP, the six attributes, the rank
 * title and the push/pull balance warning. All values are derived from node progress and total XP.
 */
import { geometricThresholds, levelForThresholds } from '@/lib/curve';
import { median } from '@/lib/median';

import type { ProgressMap } from './progression';
import { ADVANCED_MIN_OG_LEVEL, ELITE_MIN_OG_LEVEL, INTERMEDIATE_MIN_OG_LEVEL } from './tier';
import {
  ATTRIBUTES,
  BRANCHES,
  type Attribute,
  type Branch,
  type ExerciseNode,
  type RankTitle,
} from './types';

export const CHARACTER_MAX_LEVEL = 99;
/** Character XP from level 1 to 2; each further level costs `CHARACTER_XP_GROWTH` × more. */
export const CHARACTER_XP_BASE = 100;
export const CHARACTER_XP_GROWTH = 1.1;
export const CHARACTER_LEVEL_THRESHOLDS: readonly number[] = geometricThresholds(
  CHARACTER_XP_BASE,
  CHARACTER_XP_GROWTH,
  CHARACTER_MAX_LEVEL,
);

/** The single branch → attribute mapping. Every branch feeds exactly one attribute. */
export const ATTRIBUTE_BRANCHES: Readonly<Record<Attribute, readonly Branch[]>> = {
  push: ['h_push', 'v_push', 'planche'],
  pull: ['v_pull', 'h_pull', 'front_lever', 'back_lever'],
  core: ['core'],
  legs: ['legs'],
  balance: ['handstand', 'dynamic'],
  mobility: ['flexibility'],
};

/** Lowest median branch ogLevel for each rank, highest first. Adept+ follow the tiers (ADR-007). */
export const RANK_MIN_MEDIAN_OG_LEVEL: readonly { rank: RankTitle; min: number }[] = [
  { rank: 'Legend', min: ELITE_MIN_OG_LEVEL },
  { rank: 'Master', min: ADVANCED_MIN_OG_LEVEL },
  { rank: 'Adept', min: INTERMEDIATE_MIN_OG_LEVEL },
  { rank: 'Apprentice', min: 2 },
  { rank: 'Novice', min: 0 },
];

/** The balance warning fires when push and pull differ by more than this many OG levels. */
export const PUSH_PULL_MAX_GAP = 2;

export function characterLevel(totalXp: number): number {
  return levelForThresholds(totalXp, CHARACTER_LEVEL_THRESHOLDS);
}

/** Highest ogLevel of a proficient (Trial passed) node in each branch; 0 when there is none. */
export function branchOgLevels(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
): Record<Branch, number> {
  const levels = Object.fromEntries(BRANCHES.map((branch) => [branch, 0])) as Record<
    Branch,
    number
  >;
  for (const node of nodes) {
    if (!progress[node.id]?.trialPassed) continue;
    levels[node.branch] = Math.max(levels[node.branch], node.ogLevel);
  }
  return levels;
}

/** Each attribute is the highest proficient ogLevel across its branches. */
export function attributesFromBranches(
  branchLevels: Readonly<Record<Branch, number>>,
): Record<Attribute, number> {
  const entries = ATTRIBUTES.map(
    (attribute) =>
      [
        attribute,
        Math.max(0, ...ATTRIBUTE_BRANCHES[attribute].map((b) => branchLevels[b])),
      ] as const,
  );
  return Object.fromEntries(entries) as Record<Attribute, number>;
}

export function rankForMedianOgLevel(medianOgLevel: number): RankTitle {
  const match = RANK_MIN_MEDIAN_OG_LEVEL.find(({ min }) => medianOgLevel >= min);
  return match?.rank ?? 'Novice';
}

export function hasPushPullImbalance(attributes: Readonly<Record<Attribute, number>>): boolean {
  return Math.abs(attributes.push - attributes.pull) > PUSH_PULL_MAX_GAP;
}

export interface Character {
  totalXp: number;
  level: number;
  attributes: Record<Attribute, number>;
  /** Median over all 12 branches of the branch's highest proficient ogLevel. */
  medianOgLevel: number;
  rank: RankTitle;
  pushPullWarning: boolean;
}

export function computeCharacter(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
  totalXp: number,
): Character {
  const branchLevels = branchOgLevels(nodes, progress);
  const attributes = attributesFromBranches(branchLevels);
  const medianOgLevel = median(BRANCHES.map((branch) => branchLevels[branch]));
  return {
    totalXp,
    level: characterLevel(totalXp),
    attributes,
    medianOgLevel,
    rank: rankForMedianOgLevel(medianOgLevel),
    pushPullWarning: hasPushPullImbalance(attributes),
  };
}
