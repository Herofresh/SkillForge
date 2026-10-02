import { makeChain, makeNode } from '@/data/testFixtures';
import { formatIssue, MAX_DESCRIPTION_LENGTH, validateNodes } from '@/data/validate';
import type { ExerciseNode } from '@/domain/types';

/** Messages of all issues, for readable assertions. */
function messages(nodes: ExerciseNode[]): string[] {
  return validateNodes(nodes).map(formatIssue);
}

/** Replaces the node with `id` in a fresh valid chain. */
function chainWith(id: string, changes: Partial<ExerciseNode>): ExerciseNode[] {
  return makeChain().map((node) => (node.id === id ? { ...node, ...changes } : node));
}

describe('validateNodes', () => {
  it('accepts a valid chain', () => {
    expect(messages(makeChain())).toEqual([]);
  });

  describe('ids', () => {
    it('rejects duplicate ids', () => {
      const nodes = [...makeChain(), makeNode({ id: 'pull_up', chainOrder: 40, ogLevel: 3 })];
      expect(messages(nodes)).toContain("pull_up: id 'pull_up' is used more than once");
    });

    it('rejects ids that are not snake_case', () => {
      expect(messages([makeNode({ id: 'PullUp' })])).toEqual([
        "PullUp: id 'PullUp' must be snake_case (lowercase letters, digits, underscores)",
      ]);
      expect(messages([makeNode({ id: 'pull__up' })])).toHaveLength(1);
    });

    it('requires the user_ prefix exactly for user nodes', () => {
      expect(messages([makeNode({ id: 'my_row', source: 'user' })])).toEqual([
        "my_row: user nodes must have an id starting with 'user_'",
      ]);
      expect(messages([makeNode({ id: 'user_row' })])).toEqual([
        "user_row: ids starting with 'user_' are reserved for user nodes",
      ]);
    });

    it('rejects an empty name and missing patterns', () => {
      expect(messages([makeNode({ id: 'a', name: ' ', patterns: [] })])).toEqual([
        'a: name must not be empty',
        'a: needs at least one pattern',
      ]);
    });
  });

  describe('references', () => {
    it('reports a prerequisite that does not exist, by name', () => {
      const nodes = chainWith('pull_up_negative', {
        prerequisites: [{ nodeId: 'dead_hangg', minLevel: 5, kind: 'hard' }],
      });
      expect(messages(nodes)).toEqual([
        "pull_up_negative: prerequisite 'dead_hangg' does not exist",
      ]);
    });

    it('reports dangling alternatives and regressions', () => {
      const nodes = chainWith('pull_up', { alternatives: ['band_pull_up'], regressionId: 'nope' });
      expect(messages(nodes)).toEqual([
        "pull_up: alternative 'band_pull_up' does not exist",
        "pull_up: regression 'nope' does not exist",
      ]);
    });

    it('rejects self references and duplicate prerequisites', () => {
      const nodes = chainWith('pull_up', {
        prerequisites: [
          { nodeId: 'pull_up', minLevel: 5, kind: 'hard' },
          { nodeId: 'dead_hang', minLevel: 5, kind: 'hard' },
          { nodeId: 'dead_hang', minLevel: 3, kind: 'recommended' },
        ],
      });
      expect(messages(nodes)).toEqual([
        'pull_up: lists itself as a prerequisite',
        "pull_up: prerequisite 'dead_hang' is listed twice",
      ]);
    });

    it('checks prerequisite levels are 1-10', () => {
      const nodes = chainWith('pull_up', {
        prerequisites: [{ nodeId: 'pull_up_negative', minLevel: 11, kind: 'hard' }],
      });
      expect(messages(nodes)).toEqual([
        "pull_up: prerequisite 'pull_up_negative' level 11 must be a whole number from 1 to 10",
      ]);
    });
  });

  describe('cycles', () => {
    it('reports a prerequisite cycle with its path', () => {
      const nodes = chainWith('dead_hang', {
        prerequisites: [{ nodeId: 'pull_up', minLevel: 5, kind: 'recommended' }],
      });
      const cycles = messages(nodes).filter((m) => m.includes('cycle'));
      expect(cycles).toHaveLength(1);
      expect(cycles[0]).toMatch(/prerequisites form a cycle: .*dead_hang.*pull_up/);
    });

    it('accepts a diamond (shared prerequisite, no cycle)', () => {
      const nodes = [
        makeNode({ id: 'a', chainOrder: 10 }),
        makeNode({
          id: 'b',
          chainOrder: 20,
          prerequisites: [{ nodeId: 'a', minLevel: 5, kind: 'hard' }],
        }),
        makeNode({
          id: 'c',
          chainOrder: 30,
          prerequisites: [{ nodeId: 'a', minLevel: 5, kind: 'hard' }],
        }),
        makeNode({
          id: 'd',
          chainOrder: 40,
          prerequisites: [
            { nodeId: 'b', minLevel: 5, kind: 'hard' },
            { nodeId: 'c', minLevel: 5, kind: 'hard' },
          ],
        }),
      ];
      expect(messages(nodes)).toEqual([]);
    });
  });

  describe('chains', () => {
    it('rejects an ogLevel that drops along the chain', () => {
      const nodes = chainWith('pull_up', { ogLevel: 1 });
      expect(messages(nodes)).toEqual([
        "pull_up: og_level 1 is lower than 'pull_up_negative' (og_level 2), which comes before it " +
          'in v_pull; raise it or move the node earlier',
      ]);
    });

    it('rejects a chainOrder used twice in one branch but allows it across branches', () => {
      const clash = chainWith('pull_up', { chainOrder: 20 });
      expect(messages(clash)).toContainEqual(expect.stringMatching(/order 20 is also used by/));
      const otherBranch = [
        ...makeChain(),
        makeNode({ id: 'row', branch: 'h_pull', chainOrder: 10, patterns: ['horizontal_pull'] }),
      ];
      expect(messages(otherBranch)).toEqual([]);
    });

    it('checks ogLevel range and a positive order', () => {
      expect(messages([makeNode({ id: 'a', ogLevel: 18, chainOrder: 0 })])).toEqual([
        'a: og_level 18 must be a whole number from 0 to 17',
        'a: order 0 must be a positive number',
      ]);
    });
  });

  describe('equipment', () => {
    it('needs at least one non-empty option', () => {
      expect(messages([makeNode({ id: 'a', equipment: [] })])).toEqual([
        'a: needs at least one equipment option',
      ]);
      expect(messages([makeNode({ id: 'a', equipment: [['bar'], []] })])).toEqual([
        'a: has an empty equipment option',
      ]);
    });
  });

  describe('working range and trial', () => {
    it('rejects min > max', () => {
      expect(messages([makeNode({ id: 'a', workingRange: { min: 8, max: 5 } })])).toEqual([
        'a: working_range 8-5 must satisfy 0 < min <= max <= 50 for reps',
      ]);
    });

    it('rejects implausible values for the metric', () => {
      const hold = makeNode({
        id: 'a',
        metric: 'hold_s',
        workingRange: { min: 10, max: 30 },
        trial: { sets: 3, target: 600 },
      });
      expect(messages([hold])).toEqual([
        'a: trial target 600 must be above 0 and at most 300 for hold_s',
      ]);
    });

    it('rejects fractional reps and too many sets', () => {
      expect(messages([makeNode({ id: 'a', trial: { sets: 12, target: 7.5 } })])).toEqual([
        'a: trial sets 12 must be a whole number from 1 to 10',
        'a: trial target must be a whole number for reps',
      ]);
    });

    it('rejects a trial below the working range', () => {
      expect(messages([makeNode({ id: 'a', trial: { sets: 3, target: 3 } })])).toEqual([
        'a: trial target 3 is below the working_range minimum 5',
      ]);
    });

    it('requires reps for eccentric and load nodes and forbids them elsewhere', () => {
      const eccentric = makeNode({
        id: 'a',
        metric: 'eccentric_s',
        workingRange: { min: 3, max: 5 },
        trial: { sets: 3, target: 5 },
      });
      expect(messages([eccentric])).toEqual([
        'a: trial needs reps (a whole number from 1 to 50) for eccentric_s',
      ]);
      expect(messages([{ ...eccentric, trial: { sets: 3, target: 5, reps: 3 } }])).toEqual([]);
      const load = makeNode({
        id: 'b',
        metric: 'load_xbw',
        workingRange: { min: 1.1, max: 1.2 },
        trial: { sets: 1, target: 1.2, reps: 1 },
      });
      expect(messages([load])).toEqual([]);
      expect(messages([makeNode({ id: 'c', trial: { sets: 3, target: 8, reps: 2 } })])).toEqual([
        'c: trial reps is only used for eccentric_s and load_xbw nodes',
      ]);
    });
  });

  describe('sources', () => {
    it('requires a source URL for core nodes only', () => {
      expect(messages([makeNode({ id: 'a', sourceUrls: [] })])).toEqual([
        'a: built-in nodes need at least one source URL',
      ]);
      expect(messages([makeNode({ id: 'user_a', source: 'user', sourceUrls: [] })])).toEqual([]);
    });

    it('rejects sources that are not URLs', () => {
      expect(messages([makeNode({ id: 'a', sourceUrls: ['OG2 book'] })])).toEqual([
        "a: source 'OG2 book' is not a http(s) URL",
      ]);
    });
  });

  describe('description (PLAN 6.2, ADR-049)', () => {
    it('requires a description on built-in nodes only', () => {
      expect(messages([makeNode({ id: 'a', description: ' ' })])).toEqual([
        'a: description is missing: 1–3 plain sentences on what the exercise looks like',
      ]);
      // A user node saved before 6.2 has none and must keep loading.
      expect(messages([makeNode({ id: 'user_a', source: 'user', description: '' })])).toEqual([]);
    });

    it('keeps it short', () => {
      const long = 'x'.repeat(MAX_DESCRIPTION_LENGTH + 1);
      expect(messages([makeNode({ id: 'user_a', source: 'user', description: long })])).toEqual([
        `user_a: description is ${long.length} characters; keep it under ${MAX_DESCRIPTION_LENGTH} (1–3 short sentences)`,
      ]);
    });
  });

  describe('trains', () => {
    it('needs at least one trained attribute and no duplicates', () => {
      expect(messages(chainWith('dead_hang', { trains: [] }))).toEqual([
        'dead_hang: trains must list at least one attribute',
      ]);
      expect(messages(chainWith('dead_hang', { trains: ['pull', 'pull'] }))).toEqual([
        'dead_hang: trains lists an attribute more than once',
      ]);
      expect(messages(chainWith('dead_hang', { patterns: ['explosive'] }))).toEqual([
        'dead_hang: its patterns train no attribute; add a pattern or a trains: list',
      ]);
      expect(
        messages(chainWith('dead_hang', { patterns: ['explosive'], trains: ['pull'] })),
      ).toEqual([]);
    });
  });

  describe('straight-arm branches', () => {
    it('requires straightArm in front_lever, back_lever and planche', () => {
      const lever = makeNode({
        id: 'tuck_front_lever',
        branch: 'front_lever',
        metric: 'hold_s',
        workingRange: { min: 10, max: 30 },
        trial: { sets: 3, target: 30 },
      });
      expect(messages([lever])).toEqual([
        "tuck_front_lever: is in the straight-arm branch 'front_lever' but straight_arm is not true",
      ]);
      expect(messages([{ ...lever, straightArm: true }])).toEqual([]);
    });
  });
});

describe('formatIssue', () => {
  it('joins file, node id and message', () => {
    expect(
      formatIssue({ file: 'content/progressions/v_pull.yaml', nodeId: 'pull_up', message: 'boom' }),
    ).toBe('content/progressions/v_pull.yaml: pull_up: boom');
    expect(formatIssue({ message: 'boom' })).toBe('boom');
  });
});
