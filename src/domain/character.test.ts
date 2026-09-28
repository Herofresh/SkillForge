import { makeNode, makeSession } from '@/data/testFixtures';
import { ALL_NODES } from '@/data/skills';
import {
  attributePeakOgLevels,
  CHARACTER_LEVEL_THRESHOLDS,
  characterLevel,
  characterLevelProgress,
  CHARACTER_MAX_LEVEL,
  computeAttributes,
  computeCharacter,
  hasPushPullImbalance,
  nodeAttributes,
  nodeContribution,
  PATTERN_ATTRIBUTES,
  RANK_BRANCHES,
  rankForMedianOgLevel,
} from '@/domain/character';
import { emptyProgress, selfUnlock, xpForLevel, type ProgressMap } from '@/domain/progression';
import { recompute } from '@/domain/recompute';
import { ATTRIBUTES, BRANCHES, PATTERNS, type NodeProgress } from '@/domain/types';
import { difficultyMult } from '@/domain/xp';
import { MS_PER_DAY } from '@/lib/time';

const passed = (...ids: string[]): ProgressMap =>
  Object.fromEntries(
    ids.map((id) => [id, { ...emptyProgress(id), xp: 1, level: 5, trialPassed: true }]),
  );

const trainedTo = (nodeId: string, level: number): NodeProgress => ({
  ...emptyProgress(nodeId),
  xp: xpForLevel(level, 0),
  level,
  firstTrainedAt: 0,
});

const planche = makeNode({
  id: 'tuck_planche',
  branch: 'planche',
  ogLevel: 5,
  metric: 'hold_s',
  workingRange: { min: 10, max: 30 },
  trial: { sets: 3, target: 10 },
  straightArm: true,
  patterns: ['straight_arm_push'],
});
const pushUp = makeNode({
  id: 'push_up',
  branch: 'h_push',
  ogLevel: 1,
  patterns: ['horizontal_push'],
});
const frontLever = makeNode({
  id: 'front_lever',
  branch: 'front_lever',
  ogLevel: 9,
  straightArm: true,
  patterns: ['straight_arm_pull'],
});

describe('characterLevel', () => {
  it('starts at 1 and rises with total XP', () => {
    expect(characterLevel(0)).toBe(1);
    expect(characterLevel(CHARACTER_LEVEL_THRESHOLDS[1] - 1)).toBe(1);
    expect(characterLevel(CHARACTER_LEVEL_THRESHOLDS[1])).toBe(2);
    expect(characterLevel(CHARACTER_LEVEL_THRESHOLDS[9])).toBe(10);
  });
});

describe('what a node trains', () => {
  it('maps every pattern, and every node of the dataset trains at least one attribute', () => {
    expect(Object.keys(PATTERN_ATTRIBUTES).sort()).toEqual([...PATTERNS].sort());
    for (const node of ALL_NODES) expect(nodeAttributes(node).length).toBeGreaterThan(0);
  });

  it('derives several attributes from the patterns, in attribute order', () => {
    expect(nodeAttributes(planche)).toEqual(['push', 'core']);
    expect(nodeAttributes(frontLever)).toEqual(['pull', 'core']);
    expect(nodeAttributes({ patterns: ['balance', 'vertical_push'] })).toEqual(['push', 'balance']);
    expect(nodeAttributes({ patterns: ['explosive', 'vertical_pull'] })).toEqual(['pull']);
  });

  it('lets the node override the derivation with trains', () => {
    expect(nodeAttributes({ patterns: ['core'], trains: ['push', 'core'] })).toEqual([
      'push',
      'core',
    ]);
    const lSit = ALL_NODES.find((node) => node.id === 'l_sit');
    expect(lSit && nodeAttributes(lSit)).toEqual(['push', 'core']);
  });

  it('covers every attribute somewhere in the dataset', () => {
    const covered = new Set(ALL_NODES.flatMap((node) => nodeAttributes(node)));
    expect([...covered].sort()).toEqual([...ATTRIBUTES].sort());
  });
});

describe('attribute points', () => {
  it('weights a node by difficulty and level; untrained and self-unlocked-only nodes add nothing', () => {
    expect(nodeContribution(planche, undefined)).toBe(0);
    expect(nodeContribution(planche, selfUnlock(emptyProgress(planche.id), 0))).toBe(0);
    expect(nodeContribution(planche, trainedTo(planche.id, 3))).toBe(difficultyMult(5) * 3);
  });

  it('lets harder and more-trained nodes contribute more', () => {
    const same = (level: number) => ({
      push_up: trainedTo('push_up', level),
      tuck_planche: trainedTo('tuck_planche', level),
    });
    const points = (progress: ProgressMap) => computeAttributes([pushUp, planche], progress);
    const pushUpOnly = computeAttributes([pushUp], same(4)).push;
    const plancheOnly = computeAttributes([planche], same(4)).push;
    expect(plancheOnly).toBeGreaterThan(pushUpOnly);
    expect(points(same(5)).push).toBeGreaterThan(points(same(4)).push);
    expect(points(same(4))).toEqual({
      push: Math.round(4 * (difficultyMult(1) + difficultyMult(5))),
      pull: 0,
      core: Math.round(4 * difficultyMult(5)),
      legs: 0,
      balance: 0,
      mobility: 0,
    });
  });

  it('raises both push and core when the user trains planche', () => {
    const hold = (id: string, day: number) =>
      makeSession(id, day * MS_PER_DAY, [
        {
          nodeId: 'tuck_planche',
          count: 3,
          metric: 'hold_s',
          prescribed: { value: 10 },
          actual: { value: 10 },
        },
      ]);
    const tree = [pushUp, planche, frontLever];
    const before = computeCharacter(tree, {}, 0).attributes;
    const { state } = recompute(tree, [hold('a', 0), hold('b', 3)]);
    const after = computeCharacter(tree, state.progress, state.totalXp).attributes;
    expect(before.push).toBe(0);
    expect(after.push).toBeGreaterThan(0);
    expect(after.core).toBe(after.push);
    expect(after.pull).toBe(0);
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
  const zero = { push: 0, pull: 0, core: 0, legs: 0, balance: 0, mobility: 0 };

  it('warns only when the peak gap exceeds 2', () => {
    expect(hasPushPullImbalance({ ...zero, push: 5, pull: 3 })).toBe(false);
    expect(hasPushPullImbalance({ ...zero, push: 6, pull: 3 })).toBe(true);
    expect(hasPushPullImbalance({ ...zero, push: 1, pull: 4 })).toBe(true);
  });

  it('takes the highest proficient ogLevel per attribute from every node that trains it', () => {
    const peaks = attributePeakOgLevels([pushUp, planche, frontLever], {
      ...passed('push_up', 'tuck_planche'),
      front_lever: trainedTo('front_lever', 3),
    });
    expect(peaks).toEqual({ ...zero, push: 5, core: 5 }); // front lever not proficient
  });
});

describe('computeCharacter', () => {
  it('is a Novice at level 1 with no progress', () => {
    expect(computeCharacter(ALL_NODES, {}, 0)).toEqual({
      totalXp: 0,
      level: 1,
      attributes: { push: 0, pull: 0, core: 0, legs: 0, balance: 0, mobility: 0 },
      peakOgLevels: { push: 0, pull: 0, core: 0, legs: 0, balance: 0, mobility: 0 },
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
        patterns: branch === 'planche' ? ['straight_arm_push'] : ['mobility'],
      }),
    );
    nodes.push(makeNode({ id: 'row', branch: 'h_pull', chainOrder: 20, ogLevel: 2 }));
    const ids = nodes.map((node) => node.id);
    const character = computeCharacter(nodes, passed(...ids), 500);
    expect(character.medianOgLevel).toBe(2.5);
    expect(character.rank).toBe('Apprentice');
    expect(character.peakOgLevels.push).toBe(9);
    expect(character.peakOgLevels.pull).toBe(2);
    expect(character.pushPullWarning).toBe(true);
    expect(character.level).toBe(characterLevel(500));
  });

  it('leaves acrobatics out of the rank median, so adding the branch cannot lower a rank', () => {
    expect(RANK_BRANCHES).toHaveLength(BRANCHES.length - 1);
    expect(RANK_BRANCHES).not.toContain('acrobatics');
    // Six rank branches at OG 2, six at OG 0: median 1 whether or not acrobatics is proficient.
    const nodes = RANK_BRANCHES.map((branch, index) =>
      makeNode({ id: `n_${branch}`, branch, ogLevel: index < 6 ? 2 : 0, patterns: ['mobility'] }),
    );
    const roll = makeNode({ id: 'roll', branch: 'acrobatics', ogLevel: 6, patterns: ['balance'] });
    const rolled = [...nodes, roll];
    const ids = rolled.map((node) => node.id);
    expect(computeCharacter(nodes, passed(...ids.slice(0, -1)), 0).medianOgLevel).toBe(1);
    // Counted as a 13th branch, the median would have risen to 2.
    const withRoll = computeCharacter(rolled, passed(...ids), 0);
    expect(withRoll.medianOgLevel).toBe(1);
    // It still pays into its attributes.
    expect(withRoll.peakOgLevels.balance).toBe(6);
  });
});

describe('characterLevelProgress', () => {
  it('starts at level 1 with an empty bar', () => {
    expect(characterLevelProgress(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForLevel: 100,
      fraction: 0,
    });
  });

  it('measures the progress inside the current level', () => {
    const floor = CHARACTER_LEVEL_THRESHOLDS[1];
    const step = CHARACTER_LEVEL_THRESHOLDS[2] - floor;
    const progress = characterLevelProgress(floor + step / 2);
    expect(progress.level).toBe(2);
    expect(progress.fraction).toBeCloseTo(0.5);
  });

  it('is full at the max level', () => {
    const top = CHARACTER_LEVEL_THRESHOLDS[CHARACTER_MAX_LEVEL - 1];
    expect(characterLevelProgress(top + 1)).toMatchObject({
      level: CHARACTER_MAX_LEVEL,
      fraction: 1,
    });
  });
});
