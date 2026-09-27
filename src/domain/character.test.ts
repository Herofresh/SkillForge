import { makeNode } from '@/data/testFixtures';
import { ALL_NODES } from '@/data/skills';
import {
  ATTRIBUTE_BRANCHES,
  attributesFromBranches,
  branchOgLevels,
  CHARACTER_LEVEL_THRESHOLDS,
  characterLevel,
  computeCharacter,
  hasPushPullImbalance,
  rankForMedianOgLevel,
} from '@/domain/character';
import { emptyProgress, type ProgressMap } from '@/domain/progression';
import { ATTRIBUTES, BRANCHES, type Branch } from '@/domain/types';

const passed = (...ids: string[]): ProgressMap =>
  Object.fromEntries(ids.map((id) => [id, { ...emptyProgress(id), level: 5, trialPassed: true }]));

const allBranches = (level: number) =>
  Object.fromEntries(BRANCHES.map((branch) => [branch, level])) as Record<Branch, number>;

describe('characterLevel', () => {
  it('starts at 1 and rises with total XP', () => {
    expect(characterLevel(0)).toBe(1);
    expect(characterLevel(CHARACTER_LEVEL_THRESHOLDS[1] - 1)).toBe(1);
    expect(characterLevel(CHARACTER_LEVEL_THRESHOLDS[1])).toBe(2);
    expect(characterLevel(CHARACTER_LEVEL_THRESHOLDS[9])).toBe(10);
  });
});

describe('attributes', () => {
  it('maps every branch to exactly one attribute', () => {
    const mapped = ATTRIBUTES.flatMap((attribute) => ATTRIBUTE_BRANCHES[attribute]);
    expect([...mapped].sort()).toEqual([...BRANCHES].sort());
  });

  it('uses the highest proficient ogLevel per branch group', () => {
    const nodes = [
      makeNode({ id: 'push_up', branch: 'h_push', ogLevel: 2 }),
      makeNode({ id: 'tuck_planche', branch: 'planche', ogLevel: 5 }),
      makeNode({ id: 'pull_up', branch: 'v_pull', ogLevel: 2 }),
      makeNode({ id: 'front_lever', branch: 'front_lever', ogLevel: 7 }),
    ];
    const progress = {
      ...passed('push_up', 'tuck_planche', 'pull_up'),
      front_lever: emptyProgress('front_lever'),
    };
    const levels = branchOgLevels(nodes, progress);
    expect(levels.planche).toBe(5);
    expect(levels.front_lever).toBe(0); // trained but not proficient
    expect(attributesFromBranches(levels)).toEqual({
      push: 5,
      pull: 2,
      core: 0,
      legs: 0,
      balance: 0,
      mobility: 0,
    });
  });
});

describe('rank', () => {
  it.each([
    [0, 'Novice'],
    [1.5, 'Novice'],
    [2, 'Apprentice'],
    [6, 'Adept'],
    [9, 'Master'],
    [13, 'Legend'],
  ])('median %d is %s', (medianLevel, rank) => {
    expect(rankForMedianOgLevel(medianLevel)).toBe(rank);
  });
});

describe('push/pull balance', () => {
  it('warns only when the gap exceeds 2', () => {
    const attributes = attributesFromBranches(allBranches(0));
    expect(hasPushPullImbalance({ ...attributes, push: 5, pull: 3 })).toBe(false);
    expect(hasPushPullImbalance({ ...attributes, push: 6, pull: 3 })).toBe(true);
    expect(hasPushPullImbalance({ ...attributes, push: 1, pull: 4 })).toBe(true);
  });
});

describe('computeCharacter', () => {
  it('is a Novice at level 1 with no progress', () => {
    expect(computeCharacter(ALL_NODES, {}, 0)).toEqual({
      totalXp: 0,
      level: 1,
      attributes: { push: 0, pull: 0, core: 0, legs: 0, balance: 0, mobility: 0 },
      medianOgLevel: 0,
      rank: 'Novice',
      pushPullWarning: false,
    });
  });

  it('takes the median over all branches and flags imbalance', () => {
    const nodes = BRANCHES.map((branch, index) =>
      makeNode({
        id: `n_${branch}`,
        branch,
        ogLevel: branch === 'planche' ? 9 : index < 7 ? 2 : 3,
      }),
    );
    const character = computeCharacter(nodes, passed(...nodes.map((node) => node.id)), 500);
    expect(character.medianOgLevel).toBe(2.5);
    expect(character.rank).toBe('Apprentice');
    expect(character.attributes.push).toBe(9);
    expect(character.pushPullWarning).toBe(true);
    expect(character.level).toBe(characterLevel(500));
  });
});
