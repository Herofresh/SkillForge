import { buildMatrix, branchFilePath, renderReviewSheet } from '@/data/progressionBuild';
import {
  nodeEditFromRaw,
  nodeEditToRaw,
  nodeFromRaw,
  nodeToRaw,
  parseBranchFile,
} from '@/data/progressionFormat';
import { makeNode } from '@/data/testFixtures';
import { formatIssue } from '@/data/validate';
import { BRANCHES } from '@/domain/types';

const FILE = 'content/progressions/v_pull.yaml';

const PULL_UP_YAML = `
branch: v_pull
nodes:
  - id: dead_hang
    name: Dead hang
    description: Hanging from a bar with straight arms.
    order: 10
    og_level: 0
    metric: hold_s
    working_range: { min: 10, max: 30 }
    trial: { sets: 3, target: 30 }
    patterns: [vertical_pull]
    equipment:
      - bar
      - rings
    sources:
      - https://example.org/rr
  - id: pull_up
    name: Pull-up
    description: "Pulling the chin over the bar: the basic pull."
    order: 20
    og_level: 2
    metric: reps
    working_range: { min: 5, max: 8 }
    trial: { sets: 3, target: 8 }
    prerequisites:
      - node: dead_hang
        level: 5
      - node: hollow_hold
        level: 3
        kind: recommended
        note: helps the body line
    patterns: [vertical_pull]
    equipment:
      - bar
      - rings + bands
    cues: [Chin over the bar]
    sources: [https://example.org/rr]
    verify: level inferred
    review:
      status: coach_reviewed
      notes: Looks good.
`;

function messages(result: { issues: { file?: string; nodeId?: string; message: string }[] }) {
  return result.issues.map(formatIssue);
}

describe('parseBranchFile', () => {
  it('reads nodes and fills defaults', () => {
    const { branch, nodes, issues } = parseBranchFile(PULL_UP_YAML, FILE);
    expect(issues).toEqual([]);
    expect(branch).toBe('v_pull');
    expect(nodes[0]).toEqual({
      id: 'dead_hang',
      branch: 'v_pull',
      name: 'Dead hang',
      description: 'Hanging from a bar with straight arms.',
      chainOrder: 10,
      ogLevel: 0,
      metric: 'hold_s',
      workingRange: { min: 10, max: 30 },
      trial: { sets: 3, target: 30 },
      prerequisites: [],
      straightArm: false,
      isSkill: false,
      patterns: ['vertical_pull'],
      equipment: [['bar'], ['rings']],
      alternatives: [],
      cues: [],
      sourceUrls: ['https://example.org/rr'],
      source: 'core',
      review: { status: 'draft' },
    });
    expect(nodes[1]).toMatchObject({
      prerequisites: [
        { nodeId: 'dead_hang', minLevel: 5, kind: 'hard' },
        { nodeId: 'hollow_hold', minLevel: 3, kind: 'recommended', note: 'helps the body line' },
      ],
      equipment: [['bar'], ['rings', 'bands']],
      verify: 'level inferred',
      review: { status: 'coach_reviewed', notes: 'Looks good.' },
    });
  });

  it('reports YAML syntax errors with a line number', () => {
    const result = parseBranchFile('branch: v_pull\nnodes:\n  - id: [oops\n', FILE);
    expect(result.issues).toHaveLength(1);
    expect(formatIssue(result.issues[0])).toMatch(
      /^content\/progressions\/v_pull.yaml: YAML syntax: .*line/,
    );
  });

  it('reports field problems with the file and node id', () => {
    const broken = PULL_UP_YAML.replace('metric: reps', 'metric: repetitions')
      .replace('og_level: 2', 'og_level: two')
      .replace('    cues:', '    cuess:')
      .replace('rings + bands', 'rings + trampoline');
    expect(messages(parseBranchFile(broken, FILE))).toEqual([
      `${FILE}: pull_up: unknown field 'cuess' (check the spelling; see content/progressions/README.md)`,
      `${FILE}: pull_up: og_level must be a number, got 'two'`,
      `${FILE}: pull_up: metric 'repetitions' is not allowed; use one of: reps, hold_s, eccentric_s, load_xbw`,
      `${FILE}: pull_up: equipment #2: equipment 'trampoline' is not allowed; use one of: floor, wall, bar, dip_bars, parallettes, bands, rings, pole, box`,
    ]);
  });

  it('reports missing required fields', () => {
    const result = parseBranchFile(
      'branch: v_pull\nnodes:\n  - id: pull_up\n    name: Pull-up\n',
      FILE,
    );
    expect(messages(result)).toEqual(
      ['order', 'og_level', 'metric', 'working_range', 'trial', 'patterns', 'equipment'].map(
        (key) => `${FILE}: pull_up: is missing '${key}'`,
      ),
    );
  });

  it('rejects a per-node branch in a branch file and an unknown file branch', () => {
    const perNode = PULL_UP_YAML.replace(
      '  - id: pull_up\n',
      '  - id: pull_up\n    branch: h_pull\n',
    );
    expect(messages(parseBranchFile(perNode, FILE))).toEqual([
      `${FILE}: pull_up: 'branch' is set by the file, remove it from the node`,
      `${FILE}: pull_up: unknown field 'branch' (check the spelling; see content/progressions/README.md)`,
    ]);
    expect(messages(parseBranchFile('branch: arms\nnodes: []\n', FILE))[0]).toMatch(
      /branch 'arms' is not allowed/,
    );
  });
});

describe('nodeToRaw / nodeFromRaw', () => {
  it('round-trips a full node and leaves defaults out', () => {
    const node = makeNode({
      id: 'user_ring_row',
      source: 'user',
      alternatives: [],
      regressionId: 'incline_row',
      equipment: [['rings'], ['bar', 'bands']],
      prerequisites: [{ nodeId: 'incline_row', minLevel: 5, kind: 'recommended', note: 'x' }],
    });
    const raw = nodeToRaw(node, true);
    expect(raw).not.toHaveProperty('alternatives');
    expect(raw).not.toHaveProperty('straight_arm');
    expect(raw).not.toHaveProperty('review'); // draft is the default
    expect(raw.equipment).toEqual(['rings', 'bar + bands']);
    const back = nodeFromRaw(raw, { file: 'overlay', source: 'user' });
    expect(back.issues).toEqual([]);
    expect(back.value).toEqual(node);
  });

  it('round-trips the optional trains list and rejects unknown attributes', () => {
    const node = makeNode({
      id: 'user_l_sit',
      source: 'user',
      patterns: ['core'],
      trains: ['core', 'push'],
    });
    const raw = nodeToRaw(node, true);
    expect(raw.trains).toEqual(['core', 'push']);
    expect(nodeFromRaw(raw, { file: 'overlay', source: 'user' }).value).toEqual(node);
    expect(nodeToRaw(makeNode({ id: 'user_x', source: 'user' }), true)).not.toHaveProperty(
      'trains',
    );
    const bad = { ...raw, trains: ['arms'] };
    expect(nodeFromRaw(bad, { file: 'overlay', source: 'user' }).issues.map(formatIssue)).toEqual([
      "overlay: user_l_sit: trains #1: attribute 'arms' is not allowed; use one of: push, pull, core, legs, balance, mobility",
    ]);
  });

  it('leaves an empty description out and reads a missing one as empty (old overlays)', () => {
    const node = makeNode({ id: 'user_old', source: 'user', description: '' });
    const raw = nodeToRaw(node, true);
    expect(raw).not.toHaveProperty('description');
    expect(nodeFromRaw(raw, { file: 'overlay', source: 'user' })).toEqual({
      value: node,
      issues: [],
    });
    const described = nodeToRaw(makeNode({ id: 'user_new', source: 'user' }), true);
    expect(described.description).toBe('What user_new looks like.');
    expect(Object.keys(described).slice(0, 4)).toEqual(['id', 'branch', 'name', 'description']);
  });

  it('rejects a description that is not text', () => {
    const raw = {
      ...nodeToRaw(makeNode({ id: 'user_a', source: 'user' }), true),
      description: [1],
    };
    expect(nodeFromRaw(raw, { file: 'overlay', source: 'user' }).issues.map(formatIssue)).toEqual([
      'overlay: user_a: description must be some text, got a list',
    ]);
  });

  it('requires branch when the context has none', () => {
    const raw = nodeToRaw(makeNode({ id: 'user_a', source: 'user' }), false);
    expect(nodeFromRaw(raw, { file: 'overlay', source: 'user' }).issues.map(formatIssue)).toEqual([
      "overlay: user_a: is missing 'branch'",
    ]);
  });
});

describe('nodeEditFromRaw / nodeEditToRaw', () => {
  it('reads an edited description', () => {
    expect(nodeEditFromRaw({ description: ' New text. ' }, 'overlay', 'pull_up')).toEqual({
      value: { description: 'New text.' },
      issues: [],
    });
  });

  it('keeps only the given fields, including cleared lists', () => {
    const edit = { trial: { sets: 3, target: 10 }, prerequisites: [], branch: 'core' as const };
    const raw = nodeEditToRaw(edit);
    expect(raw).toEqual({ branch: 'core', trial: { sets: 3, target: 10 }, prerequisites: [] });
    expect(nodeEditFromRaw(raw, 'overlay', 'pull_up')).toEqual({ value: edit, issues: [] });
  });
});

describe('buildMatrix', () => {
  const emptyFiles = () =>
    BRANCHES.map((branch) => ({
      path: branchFilePath(branch),
      text: `branch: ${branch}\nnodes: []\n`,
    }));

  it('attaches the file to graph issues and reports missing or misnamed files', () => {
    const files = emptyFiles().filter((file) => !file.path.endsWith('/legs.yaml'));
    const vPull = files.find((file) => file.path === FILE);
    if (!vPull) throw new Error('fixture');
    vPull.text = PULL_UP_YAML;
    files.push({ path: 'content/progressions/arms.yaml', text: 'branch: h_push\nnodes: []\n' });
    const hPush = files.find((file) => file.path.endsWith('/h_push.yaml'));
    if (!hPush) throw new Error('fixture');
    hPush.text = 'branch: v_push\nnodes: []\n';

    expect(messages(buildMatrix(files))).toEqual([
      "content/progressions/h_push.yaml: says 'branch: v_push' but the file name differs",
      'content/progressions/arms.yaml: unexpected file; branch files are named after a branch ' +
        `(${BRANCHES.join(', ')})`,
      'content/progressions/legs.yaml: file is missing',
      `${FILE}: pull_up: prerequisite 'hollow_hold' does not exist`,
    ]);
  });

  it('reports a built-in node without a description', () => {
    const files = emptyFiles();
    const vPull = files.find((file) => file.path === FILE);
    if (!vPull) throw new Error('fixture');
    vPull.text = PULL_UP_YAML.replace(/ {6}- node: hollow_hold\n.*\n.*\n.*\n/, '').replace(
      '    description: Hanging from a bar with straight arms.\n',
      '',
    );
    expect(messages(buildMatrix(files))).toEqual([
      `${FILE}: dead_hang: description is missing: 1–3 plain sentences on what the exercise looks like`,
    ]);
  });

  it('sorts nodes by branch, then order', () => {
    const files = emptyFiles();
    const vPull = files.find((file) => file.path === FILE);
    if (!vPull) throw new Error('fixture');
    vPull.text = PULL_UP_YAML.replace(/ {6}- node: hollow_hold\n.*\n.*\n.*\n/, '');
    const result = buildMatrix(files);
    expect(messages(result)).toEqual([]);
    expect(result.nodes.map((node) => node.id)).toEqual(['dead_hang', 'pull_up']);
  });
});

describe('renderReviewSheet', () => {
  it('has one table per branch with an empty coach notes column', () => {
    const sheet = renderReviewSheet([
      makeNode({ id: 'pull_up', name: 'Pull | up', verify: 'check level' }),
    ]);
    expect(sheet).toContain('## Vertical pull (`v_pull`)');
    expect(sheet).toContain('| Coach notes |');
    expect(sheet).toContain('**Pull \\| up** `pull_up`');
    expect(sheet).toContain('⚠ check level');
    expect(sheet).toContain('| Description |');
    expect(sheet).toContain('| What pull_up looks like. |');
    expect(sheet.match(/_No nodes yet._/g)).toHaveLength(BRANCHES.length - 1);
  });

  it('shows what each node trains and marks a trains override', () => {
    const sheet = renderReviewSheet([
      makeNode({ id: 'front_lever', branch: 'front_lever', patterns: ['straight_arm_pull'] }),
      makeNode({ id: 'l_sit', branch: 'core', patterns: ['core'], trains: ['core', 'push'] }),
    ]);
    expect(sheet).toContain('| Trains |');
    expect(sheet).toContain('| pull, core |');
    expect(sheet).toContain('| push, core * |');
  });
});
