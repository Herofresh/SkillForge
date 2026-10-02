/**
 * The rank ladder (PLAN 6.7, ADR-054): every rank from Novice to Legend, which ones the hero has
 * reached and what each locked one needs. Pure view model over the one rank rule in `character.ts`
 * (`RANK_MIN_MEDIAN_OG_LEVEL`, `RANK_BRANCHES`, `rankMedianOgLevel`): no threshold is copied here.
 */
import {
  RANK_BRANCHES,
  RANK_MIN_MEDIAN_OG_LEVEL,
  rankForMedianOgLevel,
  rankMedianOgLevel,
} from './character';
import { formatOgLevel } from './format';
import type { Branch, RankTitle } from './types';

/** `current` is the hero's rank, `next` the one right above it; both of the others explain themselves. */
export type RankStepStatus = 'reached' | 'current' | 'next' | 'locked';

/** A rank branch and its peak: the highest ogLevel of a proficient node in it (0 when none). */
export interface BranchPeak {
  branch: Branch;
  ogLevel: number;
}

export interface RankLadderStep {
  rank: RankTitle;
  /** The rank median this rank needs (from `RANK_MIN_MEDIAN_OG_LEVEL`). */
  minMedianOgLevel: number;
  status: RankStepStatus;
  /** Rank branches whose peak is at or above `minMedianOgLevel`. */
  branchesAtLevel: number;
  /**
   * More rank branches that, brought up to `minMedianOgLevel`, surely give this rank
   * (`branchesForRank - branchesAtLevel`); 0 once the rank is reached.
   */
  branchesToGo: number;
  /** Rank branches still below `minMedianOgLevel`, closest first; empty once the rank is reached. */
  branchesBelow: BranchPeak[];
}

export interface RankLadder {
  rank: RankTitle;
  medianOgLevel: number;
  /** How many branches count towards the rank (`RANK_BRANCHES`). */
  rankBranchCount: number;
  /** Branches at a rank's level that always give the rank: {@link branchesForMedian}. */
  branchesForRank: number;
  /** Lowest rank first. */
  steps: RankLadderStep[];
}

/**
 * How many of `count` values must be at least `m` so that their median is at least `m`, whatever
 * the other values are: more than half of them. With an even count the median is the mean of the
 * two middle values, so a high middle value can sometimes make up for a lower one and the rank
 * comes with one branch fewer; this count is the one that always works.
 */
export function branchesForMedian(count: number): number {
  return Math.floor(count / 2) + 1;
}

/** The ladder for the given branch peaks (`branchOgLevels`). */
export function rankLadder(branchLevels: Readonly<Record<Branch, number>>): RankLadder {
  const medianOgLevel = rankMedianOgLevel(branchLevels);
  const rank = rankForMedianOgLevel(medianOgLevel);
  const branchesForRank = branchesForMedian(RANK_BRANCHES.length);
  const peaks: BranchPeak[] = RANK_BRANCHES.map((branch) => ({
    branch,
    ogLevel: branchLevels[branch],
  }));
  // RANK_MIN_MEDIAN_OG_LEVEL is highest first; the ladder climbs from the lowest rank.
  const ranks = [...RANK_MIN_MEDIAN_OG_LEVEL].reverse();
  const currentIndex = ranks.findIndex((entry) => entry.rank === rank);
  const steps = ranks.map(({ rank: stepRank, min }, index): RankLadderStep => {
    const reached = index <= currentIndex;
    const branchesAtLevel = peaks.filter((peak) => peak.ogLevel >= min).length;
    return {
      rank: stepRank,
      minMedianOgLevel: min,
      status: statusOf(index, currentIndex),
      branchesAtLevel,
      branchesToGo: reached ? 0 : Math.max(0, branchesForRank - branchesAtLevel),
      // Stable sort: equal peaks keep the RANK_BRANCHES order.
      branchesBelow: reached
        ? []
        : peaks.filter((peak) => peak.ogLevel < min).sort((a, b) => b.ogLevel - a.ogLevel),
    };
  });
  return {
    rank,
    medianOgLevel,
    rankBranchCount: RANK_BRANCHES.length,
    branchesForRank,
    steps,
  };
}

function statusOf(index: number, currentIndex: number): RankStepStatus {
  if (index < currentIndex) return 'reached';
  if (index === currentIndex) return 'current';
  return index === currentIndex + 1 ? 'next' : 'locked';
}

/** What a rank needs, e.g. "Branch median OG 6"; the lowest rank (median 0) is where everyone starts. */
export function rankRequirement(step: Pick<RankLadderStep, 'minMedianOgLevel'>): string {
  return step.minMedianOgLevel <= 0
    ? 'Where every hero starts'
    : `Branch median ${formatOgLevel(step.minMedianOgLevel)}`;
}

/**
 * How far a rank above the hero's is, e.g. "3 of 7 branches at OG 6 or higher · 4 to go"; empty
 * for a reached rank.
 */
export function rankProgressText(
  step: Pick<RankLadderStep, 'minMedianOgLevel' | 'branchesAtLevel' | 'branchesToGo' | 'status'>,
  branchesForRank: number,
): string {
  if (step.status === 'reached' || step.status === 'current') return '';
  const atLevel = Math.min(step.branchesAtLevel, branchesForRank);
  return (
    `${atLevel} of ${branchesForRank} branches at ${formatOgLevel(step.minMedianOgLevel)} or ` +
    `higher · ${step.branchesToGo} to go`
  );
}
