/**
 * The character sheet (PLAN 2.4, ADR-018, ADR-023): character level from total XP, the six attributes
 * ("base stats"), the rank title and the push/pull balance warning. All values are derived from node
 * progress and total XP.
 *
 * Attributes: every trained node pays into every attribute it trains (`nodeAttributes`: derived
 * from its patterns through the one `PATTERN_ATTRIBUTES` mapping, or the node's own `trains`). A node
 * contributes `difficultyMult(ogLevel) × node level`, so harder and more-trained nodes count more.
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
  type LevelProgress,
  type NodeProgress,
  type Pattern,
  type RankTitle,
} from './types';
import { difficultyMult } from './xp';

export const CHARACTER_MAX_LEVEL = 99;
/** Character XP from level 1 to 2; each further level costs `CHARACTER_XP_GROWTH` × more. */
export const CHARACTER_XP_BASE = 100;
export const CHARACTER_XP_GROWTH = 1.1;
export const CHARACTER_LEVEL_THRESHOLDS: readonly number[] = geometricThresholds(
  CHARACTER_XP_BASE,
  CHARACTER_XP_GROWTH,
  CHARACTER_MAX_LEVEL,
);

/**
 * The single pattern → attribute mapping (ADR-023). Straight-arm work also trains the core (planche
 * = push + core, front lever = pull + core). `explosive` adds nothing on its own; explosive nodes
 * also carry the pattern they train (e.g. `vertical_pull`).
 */
export const PATTERN_ATTRIBUTES: Readonly<Record<Pattern, readonly Attribute[]>> = {
  horizontal_push: ['push'],
  vertical_push: ['push'],
  vertical_pull: ['pull'],
  horizontal_pull: ['pull'],
  straight_arm_push: ['push', 'core'],
  straight_arm_pull: ['pull', 'core'],
  squat: ['legs'],
  hinge: ['legs'],
  core: ['core'],
  balance: ['balance'],
  mobility: ['mobility'],
  explosive: [],
};

/** Lowest median branch ogLevel for each rank, highest first. Adept+ follow the tiers (ADR-007). */
export const RANK_MIN_MEDIAN_OG_LEVEL: readonly { rank: RankTitle; min: number }[] = [
  { rank: 'Legend', min: ELITE_MIN_OG_LEVEL },
  { rank: 'Master', min: ADVANCED_MIN_OG_LEVEL },
  { rank: 'Adept', min: INTERMEDIATE_MIN_OG_LEVEL },
  { rank: 'Apprentice', min: 2 },
  { rank: 'Novice', min: 0 },
];

/**
 * The balance warning fires when the highest proficient ogLevel among push nodes and among pull
 * nodes differ by more than this many OG levels.
 */
export const PUSH_PULL_MAX_GAP = 2;

export type AttributeValues = Record<Attribute, number>;

const zeroAttributes = (): AttributeValues =>
  Object.fromEntries(ATTRIBUTES.map((attribute) => [attribute, 0])) as AttributeValues;

export function characterLevel(totalXp: number): number {
  return levelForThresholds(totalXp, CHARACTER_LEVEL_THRESHOLDS);
}

/** Attributes `node` trains: its `trains` override, else derived from its patterns (in ATTRIBUTES order). */
export function nodeAttributes(node: Pick<ExerciseNode, 'patterns' | 'trains'>): Attribute[] {
  const trained = new Set<Attribute>(
    node.trains ?? node.patterns.flatMap((pattern) => PATTERN_ATTRIBUTES[pattern]),
  );
  return ATTRIBUTES.filter((attribute) => trained.has(attribute));
}

/**
 * Attribute points one node adds to each attribute it trains: `difficultyMult(ogLevel) × level`
 * once it was trained or tested out (XP > 0), else 0. The level is capped at 5 until the Trial.
 */
export function nodeContribution(node: ExerciseNode, progress: NodeProgress | undefined): number {
  if (!progress || progress.xp <= 0) return 0;
  return difficultyMult(node.ogLevel) * progress.level;
}

/** Each attribute is the rounded sum of the contributions of every node that trains it. */
export function computeAttributes(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
): AttributeValues {
  const sums = zeroAttributes();
  for (const node of nodes) {
    const points = nodeContribution(node, progress[node.id]);
    if (points === 0) continue;
    for (const attribute of nodeAttributes(node)) sums[attribute] += points;
  }
  for (const attribute of ATTRIBUTES) sums[attribute] = Math.round(sums[attribute]);
  return sums;
}

/** Highest ogLevel of a proficient (Trial passed) node that trains each attribute; 0 when none. */
export function attributePeakOgLevels(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
): AttributeValues {
  const peaks = zeroAttributes();
  for (const node of nodes) {
    if (!progress[node.id]?.trialPassed) continue;
    for (const attribute of nodeAttributes(node)) {
      peaks[attribute] = Math.max(peaks[attribute], node.ogLevel);
    }
  }
  return peaks;
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

export function rankForMedianOgLevel(medianOgLevel: number): RankTitle {
  const match = RANK_MIN_MEDIAN_OG_LEVEL.find(({ min }) => medianOgLevel >= min);
  return match?.rank ?? 'Novice';
}

/** Push/pull imbalance from the attribute peak ogLevels (`attributePeakOgLevels`). */
export function hasPushPullImbalance(peakOgLevels: Readonly<AttributeValues>): boolean {
  return Math.abs(peakOgLevels.push - peakOgLevels.pull) > PUSH_PULL_MAX_GAP;
}

export interface Character {
  totalXp: number;
  level: number;
  /** Attribute points (`computeAttributes`). */
  attributes: AttributeValues;
  /** Highest proficient ogLevel per attribute (`attributePeakOgLevels`); input of the balance warning. */
  peakOgLevels: AttributeValues;
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
  const peakOgLevels = attributePeakOgLevels(nodes, progress);
  const medianOgLevel = median(BRANCHES.map((branch) => branchLevels[branch]));
  return {
    totalXp,
    level: characterLevel(totalXp),
    attributes: computeAttributes(nodes, progress),
    peakOgLevels,
    medianOgLevel,
    rank: rankForMedianOgLevel(medianOgLevel),
    pushPullWarning: hasPushPullImbalance(peakOgLevels),
  };
}

/** Character level and the progress towards the next one (for the XP bar). */
export function characterLevelProgress(totalXp: number): LevelProgress {
  const level = characterLevel(totalXp);
  if (level >= CHARACTER_MAX_LEVEL) {
    return { level, xpIntoLevel: 0, xpForLevel: 0, fraction: 1 };
  }
  const floor = CHARACTER_LEVEL_THRESHOLDS[level - 1];
  const next = CHARACTER_LEVEL_THRESHOLDS[level];
  const xpIntoLevel = totalXp - floor;
  const xpForLevel = next - floor;
  return { level, xpIntoLevel, xpForLevel, fraction: xpIntoLevel / xpForLevel };
}
