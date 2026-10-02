import { makeChain, makeNode } from '@/data/testFixtures';
import { formatIssue } from '@/data/validate';
import {
  EMPTY_OVERLAY,
  applyOverlay,
  exportOverlay,
  importOverlay,
  resolveOrderClashes,
  warningsForNode,
} from '@/domain/overlay';
import type { ExerciseNode, ProgressionOverlay } from '@/domain/types';

const base = makeChain(); // dead_hang -> pull_up_negative -> pull_up

function overlay(changes: Partial<ProgressionOverlay>): ProgressionOverlay {
  return { ...EMPTY_OVERLAY, ...changes };
}

function byId(nodes: ExerciseNode[], id: string): ExerciseNode | undefined {
  return nodes.find((node) => node.id === id);
}

const userNode = makeNode({
  id: 'user_band_pull_up',
  name: 'Band-assisted pull-up',
  source: 'user',
  chainOrder: 25,
  ogLevel: 2,
  sourceUrls: [],
  equipment: [['bar', 'bands']],
  prerequisites: [{ nodeId: 'pull_up_negative', minLevel: 3, kind: 'hard' }],
});

describe('applyOverlay', () => {
  it('returns the base unchanged for an empty overlay', () => {
    expect(applyOverlay(base, EMPTY_OVERLAY)).toEqual({ nodes: base, issues: [], warnings: [] });
  });

  it('adds a user node', () => {
    const { nodes, issues } = applyOverlay(base, overlay({ added: [userNode] }));
    expect(issues).toEqual([]);
    expect(byId(nodes, 'user_band_pull_up')).toMatchObject({ source: 'user' });
    expect(nodes).toHaveLength(4);
  });

  it("edits a core node's trial and keeps id and source", () => {
    const edited = overlay({ edited: { pull_up: { trial: { sets: 3, target: 10 } } } });
    const { nodes, issues } = applyOverlay(base, edited);
    expect(issues).toEqual([]);
    expect(byId(nodes, 'pull_up')).toMatchObject({
      id: 'pull_up',
      source: 'core',
      trial: { sets: 3, target: 10 },
    });
    expect(byId(base, 'pull_up')?.trial).toEqual({ sets: 3, target: 8 }); // base untouched
  });

  it('hides a node and routes its dependents to its own prerequisites', () => {
    const { nodes, issues } = applyOverlay(base, overlay({ hidden: ['pull_up_negative'] }));
    expect(issues).toEqual([]);
    expect(byId(nodes, 'pull_up_negative')).toBeUndefined();
    const pullUp = byId(nodes, 'pull_up');
    expect(pullUp?.prerequisites).toEqual([{ nodeId: 'dead_hang', minLevel: 5, kind: 'hard' }]);
    expect(pullUp?.regressionId).toBeUndefined(); // the regression was hidden and had none itself
  });

  it('rejects an overlay that creates a cycle and keeps the base', () => {
    const cyclic = overlay({
      edited: { dead_hang: { prerequisites: [{ nodeId: 'pull_up', minLevel: 5, kind: 'hard' }] } },
    });
    const { nodes, issues } = applyOverlay(base, cyclic);
    expect(nodes).toEqual(base);
    expect(issues.map(formatIssue)).toEqual([
      expect.stringMatching(/^overlay: .*: prerequisites form a cycle: /),
    ]);
  });

  it('rejects a dangling prerequisite on a user node', () => {
    const dangling = {
      ...userNode,
      prerequisites: [{ nodeId: 'pull_upp', minLevel: 5, kind: 'hard' as const }],
    };
    const { nodes, issues } = applyOverlay(base, overlay({ added: [dangling] }));
    expect(nodes).toEqual(base);
    expect(issues.map(formatIssue)).toEqual([
      "overlay: user_band_pull_up: prerequisite 'pull_upp' does not exist",
    ]);
  });

  it('rejects unknown edited/hidden ids, core-looking user ids and id clashes', () => {
    const bad = overlay({
      added: [
        { ...userNode, id: 'band_pull_up' },
        { ...userNode, id: 'pull_up', chainOrder: 26 },
      ],
      edited: { ghost: { name: 'Ghost' } },
      hidden: ['phantom'],
    });
    const messages = applyOverlay(base, bad).issues.map(formatIssue);
    expect(messages).toEqual(
      expect.arrayContaining([
        'overlay: ghost: edited node does not exist in the built-in matrix',
        'overlay: phantom: hidden node does not exist in the built-in matrix',
        "overlay: band_pull_up: added nodes need an id starting with 'user_'",
        "overlay: pull_up: id 'pull_up' is used more than once",
      ]),
    );
  });

  it('applies an og_level below the node above as a warning (user autonomy, ADR-052)', () => {
    const { nodes, issues, warnings } = applyOverlay(
      base,
      overlay({ edited: { pull_up: { ogLevel: 1 } } }),
    );
    expect(issues).toEqual([]);
    expect(byId(nodes, 'pull_up')?.ogLevel).toBe(1);
    expect(warnings.map(formatIssue)).toEqual([
      expect.stringMatching(/^overlay: pull_up: og_level 1 is lower/),
    ]);
  });
});

describe('order clashes after a content update (ADR-052)', () => {
  /** A built-in node an update put at the order the user node already had. */
  const newCore = makeNode({
    id: 'band_negative',
    chainOrder: 25,
    ogLevel: 2,
    prerequisites: [{ nodeId: 'pull_up_negative', minLevel: 3, kind: 'hard' }],
  });
  const updated = [...base, newCore];
  const columnOf = (nodes: ExerciseNode[]) =>
    [...nodes].sort((a, b) => a.chainOrder - b.chainOrder).map((node) => node.id);

  it('puts the user node right after the built-in node with its order', () => {
    const { nodes, issues } = applyOverlay(updated, overlay({ added: [userNode] }));
    expect(issues).toEqual([]);
    expect(byId(nodes, 'band_negative')?.chainOrder).toBe(25); // built-in nodes keep theirs
    expect(byId(nodes, 'user_band_pull_up')?.chainOrder).toBe(27.5); // halfway to pull_up (30)
    expect(columnOf(nodes)).toEqual([
      'dead_hang',
      'pull_up_negative',
      'band_negative',
      'user_band_pull_up',
      'pull_up',
    ]);
  });

  it('orders several clashing user nodes by id after the built-in node', () => {
    const second = { ...userNode, id: 'user_a_second', name: 'Second' };
    const { nodes, issues } = applyOverlay(updated, overlay({ added: [userNode, second] }));
    expect(issues).toEqual([]);
    expect(columnOf(nodes).slice(2, 5)).toEqual([
      'band_negative',
      'user_a_second',
      'user_band_pull_up',
    ]);
    expect(byId(nodes, 'user_a_second')?.chainOrder).toBe(27.5);
    expect(byId(nodes, 'user_band_pull_up')?.chainOrder).toBe(28.75);
  });

  it('breaks an id tie by code unit, the same on every engine (not localeCompare)', () => {
    // localeCompare puts 'user_a_b' first (Node's ICU: '_' before digits); code units put '9' first.
    const digit = { ...userNode, id: 'user_a9', name: 'Digit' };
    const underscore = { ...userNode, id: 'user_a_b', name: 'Underscore' };
    const { nodes, issues } = applyOverlay(updated, overlay({ added: [underscore, digit] }));
    expect(issues).toEqual([]);
    expect(columnOf(nodes).slice(2, 5)).toEqual(['band_negative', 'user_a9', 'user_a_b']);

    // Upper case sorts before lower case by code unit; localeCompare does the opposite.
    const upper = { ...userNode, id: 'user_B' };
    const lower = { ...userNode, id: 'user_a' };
    const placed = new Set([upper.id, lower.id]);
    const resolved = resolveOrderClashes([...updated, lower, upper], placed);
    expect(byId(resolved, 'user_B')?.chainOrder).toBe(27.5);
    expect(byId(resolved, 'user_a')?.chainOrder).toBe(28.75);
  });

  it('moves a clash at the end of the column one step after the last node', () => {
    const last = { ...userNode, chainOrder: 30, ogLevel: 3 };
    const { nodes, issues } = applyOverlay(base, overlay({ added: [last] }));
    expect(issues).toEqual([]);
    expect(byId(nodes, last.id)?.chainOrder).toBe(31);
  });

  it('resolves a built-in node the user moved onto an order the update now uses', () => {
    const moved = overlay({ edited: { pull_up_negative: { chainOrder: 25 } } });
    const { nodes, issues } = applyOverlay(updated, moved);
    expect(issues).toEqual([]);
    expect(byId(nodes, 'pull_up_negative')?.chainOrder).toBe(27.5);
    expect(moved.edited.pull_up_negative.chainOrder).toBe(25); // stored overlay untouched
  });

  it('still reports two built-in nodes with one order', () => {
    const broken = [...base, { ...newCore, chainOrder: 20 }];
    const { issues } = applyOverlay(broken, EMPTY_OVERLAY);
    expect(issues.map(formatIssue)).toContainEqual(
      expect.stringMatching(/order 20 is also used by/),
    );
  });
});

describe('warningsForNode (ADR-052)', () => {
  const warnings = [
    { nodeId: 'user_late', message: "og_level 1 is lower than 'user_early' (og_level 3), …" },
    { nodeId: 'user_elsewhere', message: "og_level 1 is lower than 'pull_up' (og_level 4), …" },
  ];

  it("keeps the warnings reported on the node or naming it, not other nodes' advice", () => {
    expect(warningsForNode(warnings, 'user_late')).toEqual([warnings[0]]);
    expect(warningsForNode(warnings, 'user_early')).toEqual([warnings[0]]);
    expect(warningsForNode(warnings, 'user_elsewhere')).toEqual([warnings[1]]);
    expect(warningsForNode(warnings, 'user_ear')).toEqual([]); // a whole id, not a prefix
  });

  it('finds a drop between two user nodes from either side', () => {
    const early = { ...userNode, id: 'user_early', chainOrder: 22, ogLevel: 3 };
    const late = { ...userNode, id: 'user_late', chainOrder: 24, ogLevel: 2 };
    const result = applyOverlay(base, overlay({ added: [early, late] }));
    expect(result.issues).toEqual([]);
    expect(warningsForNode(result.warnings, 'user_late')).toHaveLength(1);
    expect(warningsForNode(result.warnings, 'user_early')).toHaveLength(1);
    expect(warningsForNode(result.warnings, 'dead_hang')).toEqual([]);
  });
});

describe('exportOverlay / importOverlay', () => {
  const full = overlay({
    added: [userNode],
    edited: { pull_up: { trial: { sets: 3, target: 10 }, cues: [] } },
    hidden: ['dead_hang'],
  });

  it.each(['yaml', 'json'] as const)('round-trips through %s', (format) => {
    const text = exportOverlay(full, format);
    expect(importOverlay(text)).toEqual({ overlay: full, issues: [] });
  });

  it('writes readable YAML in the content file format', () => {
    const text = exportOverlay(full);
    expect(text).toContain('format: skillforge-progression-overlay');
    expect(text).toContain('id: user_band_pull_up');
    expect(text).toContain('branch: v_pull');
    expect(text).toContain('- bar + bands');
  });

  it('reports bad text without returning an overlay', () => {
    expect(importOverlay('format: [').overlay).toBeUndefined();
    const result = importOverlay('format: something-else\nversion: 1\nextra: 1\n');
    expect(result.overlay).toBeUndefined();
    expect(result.issues.map(formatIssue)).toEqual([
      "overlay: unknown field 'extra' (allowed: format, version, added, edited, hidden)",
      "overlay: 'format' must be 'skillforge-progression-overlay'",
    ]);
  });

  it('loads an overlay saved before descriptions existed (version 1, PLAN 6.2)', () => {
    const old = exportOverlay(full)
      .replace(/^ {4}description: .*\n/m, '')
      .replace('version: 2', 'version: 1');
    expect(old).toContain('version: 1');
    expect(old).not.toContain('description:');
    const result = importOverlay(old);
    expect(result.issues).toEqual([]);
    const added = result.overlay?.added[0];
    expect(added?.description).toBe('');
    expect(applyOverlay(base, result.overlay ?? EMPTY_OVERLAY).issues).toEqual([]);
  });

  it('refuses an overlay from a newer app version', () => {
    const newer = exportOverlay(full).replace('version: 2', 'version: 3');
    expect(importOverlay(newer).issues.map(formatIssue)).toEqual([
      'overlay: was made by a newer SkillForge (overlay version 3; this app reads up to 2). ' +
        'Update the app, then import it again.',
    ]);
  });

  it('reports field problems in added nodes and edits', () => {
    const text = [
      'format: skillforge-progression-overlay',
      'version: 1',
      'added:',
      '  - id: user_x',
      '    name: X',
      'edited:',
      '  pull_up:',
      '    metric: laps',
    ].join('\n');
    const messages = importOverlay(text).issues.map(formatIssue);
    expect(messages).toContain("overlay: user_x: is missing 'branch'");
    expect(messages).toContain(
      "overlay: pull_up: metric 'laps' is not allowed; use one of: reps, hold_s, eccentric_s, load_xbw",
    );
  });
});

describe('straight-arm safeguard rule for overlays (ADR-036)', () => {
  // A built-in straight-arm node outside the three straight-arm branches (like manna, human flag).
  const flagBase = [
    ...base,
    makeNode({
      id: 'tuck_flag',
      branch: 'dynamic',
      straightArm: true,
      isSkill: true,
      metric: 'hold_s',
      workingRange: { min: 5, max: 10 },
      trial: { sets: 3, target: 10 },
      patterns: ['straight_arm_pull'],
    }),
  ];

  it('rejects clearing straight_arm on a built-in straight-arm node', () => {
    const { nodes, issues } = applyOverlay(
      flagBase,
      overlay({ edited: { tuck_flag: { straightArm: false } } }),
    );
    expect(nodes).toEqual(flagBase);
    expect(issues.map(formatIssue)).toEqual([
      'overlay: tuck_flag: is a built-in straight-arm skill: straight_arm stays true so its tendon safeguards apply',
    ]);
  });

  it('rejects moving a built-in straight-arm node to another branch', () => {
    const { issues } = applyOverlay(
      flagBase,
      overlay({ edited: { tuck_flag: { branch: 'core', chainOrder: 99 } } }),
    );
    expect(issues.map(formatIssue)).toEqual([
      "overlay: tuck_flag: is a built-in straight-arm skill and stays in the 'dynamic' branch",
    ]);
  });

  it('allows other edits and keeping the flag and branch as they are', () => {
    const { issues, nodes } = applyOverlay(
      flagBase,
      overlay({
        edited: {
          tuck_flag: { straightArm: true, branch: 'dynamic', trial: { sets: 3, target: 8 } },
        },
      }),
    );
    expect(issues).toEqual([]);
    expect(byId(nodes, 'tuck_flag')).toMatchObject({ straightArm: true, branch: 'dynamic' });
  });

  it('lets a non-straight-arm built-in node become straight-arm', () => {
    const { issues } = applyOverlay(base, overlay({ edited: { pull_up: { straightArm: true } } }));
    expect(issues).toEqual([]);
  });
});
