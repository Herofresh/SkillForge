import { makeChain, makeNode } from '@/data/testFixtures';
import { formatIssue } from '@/data/validate';
import { EMPTY_OVERLAY, applyOverlay, exportOverlay, importOverlay } from '@/domain/overlay';
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
    expect(applyOverlay(base, EMPTY_OVERLAY)).toEqual({ nodes: base, issues: [] });
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

  it('rejects an edit that breaks a chain rule', () => {
    const { issues } = applyOverlay(base, overlay({ edited: { pull_up: { ogLevel: 1 } } }));
    expect(issues.map(formatIssue)).toEqual([
      expect.stringMatching(/^overlay: pull_up: og_level 1 is lower/),
    ]);
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
