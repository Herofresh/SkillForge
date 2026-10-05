import { median } from '@/lib/median';

import {
  RANK_BRANCHES,
  RANK_MIN_MEDIAN_OG_LEVEL,
  NON_RANK_BRANCHES,
  rankForMedianOgLevel,
  rankMedianOgLevel,
} from './character';
import {
  branchesForMedian,
  rankLadder,
  rankProgressText,
  rankRequirement,
  type RankLadderStep,
} from './rankLadder';
import { BRANCHES, RANK_TITLES, type Branch } from './types';

const levels = (overrides: Partial<Record<Branch, number>> = {}): Record<Branch, number> => ({
  ...(Object.fromEntries(BRANCHES.map((branch) => [branch, 0])) as Record<Branch, number>),
  ...overrides,
});

/** The first `count` rank branches at `ogLevel`, the rest at 0. */
const firstAt = (count: number, ogLevel: number): Record<Branch, number> =>
  levels(Object.fromEntries(RANK_BRANCHES.slice(0, count).map((branch) => [branch, ogLevel])));

const minOf = (rank: string): number =>
  RANK_MIN_MEDIAN_OG_LEVEL.find((entry) => entry.rank === rank)?.min ?? NaN;

const stepOf = (steps: readonly RankLadderStep[], rank: string): RankLadderStep => {
  const step = steps.find((entry) => entry.rank === rank);
  if (!step) throw new Error(`no step ${rank}`);
  return step;
};

describe('branchesForMedian', () => {
  it('is more than half of the values', () => {
    expect(branchesForMedian(1)).toBe(1);
    expect(branchesForMedian(5)).toBe(3);
    expect(branchesForMedian(12)).toBe(7);
  });

  it('always lifts the median to the level, and one branch fewer does not when the rest are 0', () => {
    const count = RANK_BRANCHES.length;
    const needed = branchesForMedian(count);
    for (const { min } of RANK_MIN_MEDIAN_OG_LEVEL.filter((entry) => entry.min > 0)) {
      const values = (atLevel: number) =>
        Array.from({ length: count }, (_, index) => (index < atLevel ? min : 0));
      expect(median(values(needed))).toBeGreaterThanOrEqual(min);
      expect(median(values(needed - 1))).toBeLessThan(min);
    }
  });
});

describe('rankLadder', () => {
  it('lists every rank lowest first with the thresholds of the rank rule', () => {
    const ladder = rankLadder(levels());
    expect(ladder.steps.map((step) => step.rank)).toEqual([...RANK_TITLES]);
    for (const step of ladder.steps) expect(step.minMedianOgLevel).toBe(minOf(step.rank));
    expect(ladder.rankBranchCount).toBe(RANK_BRANCHES.length);
    expect(ladder.branchesForRank).toBe(branchesForMedian(RANK_BRANCHES.length));
  });

  it('starts a new hero at Novice with Apprentice next and the rest locked', () => {
    const ladder = rankLadder(levels());
    expect(ladder.rank).toBe('Novice');
    expect(ladder.medianOgLevel).toBe(0);
    expect(ladder.steps.map((step) => step.status)).toEqual([
      'current',
      'next',
      'locked',
      'locked',
      'locked',
    ]);
    const apprentice = stepOf(ladder.steps, 'Apprentice');
    expect(apprentice.branchesAtLevel).toBe(0);
    expect(apprentice.branchesToGo).toBe(ladder.branchesForRank);
    expect(apprentice.branchesBelow).toHaveLength(RANK_BRANCHES.length);
  });

  it('agrees with the rank rule of character.ts', () => {
    for (const ogLevel of [0, 1, 2, 5, 6, 8, 9, 12, 13, 16]) {
      for (const count of [0, 6, 7, 12]) {
        const branchLevels = firstAt(count, ogLevel);
        const ladder = rankLadder(branchLevels);
        const expected = rankForMedianOgLevel(
          median(RANK_BRANCHES.map((branch) => branchLevels[branch])),
        );
        expect(ladder.rank).toBe(expected);
        expect(ladder.steps.find((step) => step.status === 'current')?.rank).toBe(expected);
      }
    }
  });

  it('marks the ranks below the current one reached and counts what the next one needs', () => {
    // 7 branches at Tier 6 → median 6 → Adept; Master needs Tier 9.
    const branchLevels = firstAt(branchesForMedian(RANK_BRANCHES.length), minOf('Adept'));
    branchLevels.handstand = minOf('Master');
    branchLevels.core = 3;
    const ladder = rankLadder(branchLevels);
    expect(ladder.rank).toBe('Adept');
    expect(ladder.steps.map((step) => step.status)).toEqual([
      'reached',
      'reached',
      'current',
      'next',
      'locked',
    ]);
    const master = stepOf(ladder.steps, 'Master');
    const atMaster = RANK_BRANCHES.filter((branch) => branchLevels[branch] >= minOf('Master'));
    expect(master.branchesAtLevel).toBe(atMaster.length);
    expect(master.branchesToGo).toBe(ladder.branchesForRank - atMaster.length);
    // Closest first: the branches at Tier 6, then core at 3, then the zeros.
    const below = master.branchesBelow.map((peak) => peak.ogLevel);
    expect(below).toEqual([...below].sort((a, b) => b - a));
    expect(master.branchesBelow).toHaveLength(RANK_BRANCHES.length - atMaster.length);
    expect(master.branchesBelow.map((peak) => peak.branch)).not.toContain('handstand');
    const reached = ladder.steps.filter(
      (entry) => entry.status === 'reached' || entry.status === 'current',
    );
    for (const step of reached) {
      expect(step.branchesToGo).toBe(0);
      expect(step.branchesBelow).toEqual([]);
    }
  });

  it('matches the rank rule and never overstates the progress for random peaks', () => {
    // Seeded Park-Miller generator so the cases are the same on every run.
    let seed = 47;
    const next = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let run = 0; run < 500; run += 1) {
      const branchLevels = levels(
        Object.fromEntries(BRANCHES.map((branch) => [branch, Math.floor(next() * 17)])),
      );
      const medianOgLevel = median(RANK_BRANCHES.map((branch) => branchLevels[branch]));
      const ladder = rankLadder(branchLevels);
      expect(rankMedianOgLevel(branchLevels)).toBe(medianOgLevel);
      expect(ladder.medianOgLevel).toBe(medianOgLevel);
      expect(ladder.rank).toBe(rankForMedianOgLevel(medianOgLevel));
      for (const step of ladder.steps) {
        const reached = step.status === 'reached' || step.status === 'current';
        expect(reached).toBe(medianOgLevel >= step.minMedianOgLevel);
        // A rank not yet reached always has at least one branch to go.
        if (!reached) {
          expect(step.branchesAtLevel).toBeLessThan(ladder.branchesForRank);
          expect(step.branchesToGo).toBeGreaterThan(0);
        }
      }
    }
  });

  it('leaves acrobatics and mobility out of the ladder', () => {
    const ladder = rankLadder(levels({ acrobatics: 16, mobility: 16 }));
    expect(ladder.rank).toBe('Novice');
    for (const step of ladder.steps) {
      for (const branch of NON_RANK_BRANCHES) {
        expect(step.branchesBelow.map((peak) => peak.branch)).not.toContain(branch);
      }
    }
  });

  it('has nothing above Legend', () => {
    const ladder = rankLadder(firstAt(RANK_BRANCHES.length, minOf('Legend')));
    expect(ladder.rank).toBe('Legend');
    expect(ladder.steps.at(-1)?.status).toBe('current');
    expect(ladder.steps.some((step) => step.status === 'next' || step.status === 'locked')).toBe(
      false,
    );
  });
});

describe('ladder texts', () => {
  it('names what a rank needs', () => {
    expect(rankRequirement({ minMedianOgLevel: 0 })).toBe('Where every hero starts');
    expect(rankRequirement({ minMedianOgLevel: 6 })).toBe('Branch median Tier 6');
  });

  it('says how far a rank above is, and nothing for a reached one', () => {
    const ladder = rankLadder(firstAt(3, 6));
    const adept = stepOf(ladder.steps, 'Adept');
    expect(rankProgressText(adept, ladder.branchesForRank)).toBe(
      `3 of ${ladder.branchesForRank} branches at Tier 6 or higher · ${ladder.branchesForRank - 3} to go`,
    );
    expect(rankProgressText(stepOf(ladder.steps, 'Novice'), ladder.branchesForRank)).toBe('');
  });
});
