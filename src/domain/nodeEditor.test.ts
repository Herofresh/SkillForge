import { makeChain, makeNode } from '@/data/testFixtures';
import {
  addCue,
  addEquipmentOption,
  addPrerequisite,
  clearTrains,
  customNodeId,
  draftChanged,
  editorIssueText,
  issueSection,
  issuesBySection,
  newCustomNode,
  NEW_NODE_ID,
  nodeAbove,
  placeAfter,
  prerequisiteOptions,
  removeCue,
  removeEquipmentOption,
  removePrerequisite,
  setMetric,
  setName,
  stepOgLevel,
  stepPrerequisiteLevel,
  stepTrial,
  stepWorkingRange,
  toggleEquipmentTag,
  togglePrerequisiteKind,
  toggleTrains,
  MAX_NODE_NAME_LENGTH,
} from '@/domain/nodeEditor';
import type { ExerciseNode } from '@/domain/types';

const chain = makeChain(); // dead_hang (10, og 0) -> pull_up_negative (20, og 2) -> pull_up (30, og 2)
const lever = makeNode({
  id: 'tuck_lever',
  branch: 'front_lever',
  straightArm: true,
  isSkill: true,
  metric: 'hold_s',
  ogLevel: 4,
  patterns: ['straight_arm_pull'],
});
const nodes = [...chain, lever];

describe('customNodeId', () => {
  it('builds a unique user_ snake_case id from the name', () => {
    expect(customNodeId('Towel Hang!', [])).toBe('user_towel_hang');
    expect(customNodeId('Towel hang', ['user_towel_hang', 'user_towel_hang_2'])).toBe(
      'user_towel_hang_3',
    );
    expect(customNodeId('  ***  ', [])).toBe('user_exercise');
  });
});

describe('newCustomNode / placeAfter', () => {
  it('starts at the end of the branch from the last node, without prerequisites', () => {
    const draft = newCustomNode(nodes, 'v_pull');
    expect(draft).toMatchObject({
      id: NEW_NODE_ID,
      source: 'user',
      branch: 'v_pull',
      chainOrder: 40,
      ogLevel: 2,
      metric: 'reps',
      workingRange: { min: 5, max: 8 },
      trial: { sets: 3, target: 8 },
      prerequisites: [],
      straightArm: false,
      patterns: ['vertical_pull'],
      equipment: [['bar']],
      sourceUrls: [],
    });
  });

  it('goes between two nodes with the OG level clamped to fit the chain', () => {
    const draft = newCustomNode(nodes, 'v_pull', 'dead_hang');
    expect(draft.chainOrder).toBe(15);
    expect(draft.ogLevel).toBe(0);
    expect(nodeAbove(draft, nodes)?.id).toBe('dead_hang');
    const moved = placeAfter({ ...draft, ogLevel: 9 }, nodes, 'dead_hang');
    expect(moved.ogLevel).toBe(2); // not above pull_up_negative below it
  });

  it('goes to the end when the node to follow is not in the branch', () => {
    expect(newCustomNode(nodes, 'v_pull', 'tuck_lever').chainOrder).toBe(40);
  });

  it('goes to the top of the branch', () => {
    const top = placeAfter(newCustomNode(nodes, 'v_pull'), nodes, undefined);
    expect(top.chainOrder).toBe(5);
    expect(nodeAbove(top, nodes)).toBeUndefined();
  });

  it('throws for a node that is not in the branch', () => {
    expect(() => placeAfter(newCustomNode(nodes, 'v_pull'), nodes, 'tuck_lever')).toThrow();
  });

  it('is straight-arm in a straight-arm branch (keeps the safeguards)', () => {
    const draft = newCustomNode(nodes, 'front_lever');
    expect(draft).toMatchObject({ straightArm: true, metric: 'hold_s', isSkill: true });
    expect(draft.trial).toEqual({ sets: 3, target: 30 });
  });
});

describe('draft edits', () => {
  const draft: ExerciseNode = { ...chain[2], cues: [] };

  it('names and metrics', () => {
    expect(setName(draft, 'x'.repeat(99)).name).toHaveLength(MAX_NODE_NAME_LENGTH);
    const eccentric = setMetric(draft, 'eccentric_s');
    expect(eccentric.trial).toEqual({ sets: 3, target: 6, reps: 3 });
    expect(setMetric(draft, 'reps')).toBe(draft);
    expect(stepOgLevel(draft, -9).ogLevel).toBe(0);
  });

  it('steps standards on the metric step and never to zero', () => {
    expect(stepWorkingRange(draft, 'max', 2).workingRange).toEqual({ min: 5, max: 10 });
    expect(stepWorkingRange(draft, 'min', -9).workingRange.min).toBe(1);
    expect(stepTrial(draft, 'target', -1).trial.target).toBe(7);
    expect(stepTrial(draft, 'sets', -5).trial.sets).toBe(1);
    const load = {
      ...draft,
      metric: 'load_xbw' as const,
      trial: { sets: 3, target: 0.3, reps: 5 },
    };
    expect(stepTrial(load, 'target', 1).trial.target).toBe(0.35);
    expect(stepTrial(load, 'reps', 1).trial.reps).toBe(6);
  });

  it('prerequisites: add once, toggle kind, level in 1–10, remove', () => {
    const added = addPrerequisite(addPrerequisite(draft, 'dead_hang'), 'dead_hang');
    expect(added.prerequisites.filter((p) => p.nodeId === 'dead_hang')).toEqual([
      { nodeId: 'dead_hang', minLevel: 5, kind: 'hard' },
    ]);
    expect(togglePrerequisiteKind(added, 'dead_hang').prerequisites.at(-1)?.kind).toBe(
      'recommended',
    );
    expect(stepPrerequisiteLevel(added, 'dead_hang', 20).prerequisites.at(-1)?.minLevel).toBe(10);
    expect(stepPrerequisiteLevel(added, 'dead_hang', -20).prerequisites.at(-1)?.minLevel).toBe(1);
    expect(removePrerequisite(added, 'dead_hang').prerequisites).toEqual(draft.prerequisites);
  });

  it('equipment options', () => {
    const two = addEquipmentOption(draft);
    expect(two.equipment).toEqual([['bar'], ['floor']]);
    expect(toggleEquipmentTag(two, 0, 'bands').equipment[0]).toEqual(['bar', 'bands']);
    expect(toggleEquipmentTag(two, 0, 'bar').equipment[0]).toEqual([]);
    expect(removeEquipmentOption(two, 0).equipment).toEqual([['floor']]);
  });

  it('cues: trimmed, no empty or duplicate ones', () => {
    const one = addCue(draft, '  Chin over the bar ');
    expect(one.cues).toEqual(['Chin over the bar']);
    expect(addCue(one, 'Chin over the bar')).toBe(one);
    expect(addCue(one, '   ')).toBe(one);
    expect(removeCue(one, 0).cues).toEqual([]);
  });

  it('trains: starts from the current attributes, clears back to derived', () => {
    const withCore = toggleTrains(draft, 'core', ['pull']);
    expect(withCore.trains).toEqual(['pull', 'core']);
    expect(toggleTrains(withCore, 'pull', []).trains).toEqual(['core']);
    expect(clearTrains(withCore).trains).toBeUndefined();
  });
});

describe('prerequisiteOptions', () => {
  it('offers the branch column without the draft and listed nodes, or search matches', () => {
    const draft = {
      ...chain[2],
      prerequisites: [{ nodeId: 'dead_hang', minLevel: 5, kind: 'hard' as const }],
    };
    expect(prerequisiteOptions(nodes, draft, '').map((node) => node.id)).toEqual([
      'pull_up_negative',
    ]);
    expect(prerequisiteOptions(nodes, draft, 'lever').map((node) => node.id)).toEqual([
      'tuck_lever',
    ]);
  });
});

describe('issues in the editor', () => {
  it('maps validator messages to editor sections', () => {
    const section = (message: string) => issueSection({ message });
    expect(section('prerequisites form a cycle: a -> b -> a')).toBe('prerequisites');
    expect(section('trial target 3 is below the working_range minimum 5')).toBe('standards');
    expect(section('has an empty equipment option')).toBe('equipment');
    expect(section('trains must list at least one attribute')).toBe('trains');
    expect(section('og_level 1 is lower than ...')).toBe('position');
    expect(section('is a built-in straight-arm skill and stays in the x branch')).toBe('position');
    expect(section('name must not be empty')).toBe('name');
    expect(section('something new')).toBe('other');
  });

  it('groups issue texts by section', () => {
    const grouped = issuesBySection(
      [
        { nodeId: 'x', message: 'name must not be empty' },
        { nodeId: 'x', message: 'has an empty equipment option' },
      ],
      'x',
      [],
    );
    expect(grouped.name).toEqual(['name must not be empty']);
    expect(grouped.equipment).toEqual(['has an empty equipment option']);
    expect(grouped.other).toEqual([]);
  });

  it('prefixes issues about other nodes with their name', () => {
    const named = [makeNode({ id: 'dead_hang', name: 'Dead hang' })];
    expect(editorIssueText({ nodeId: 'x', message: 'bad' }, 'x', named)).toBe('bad');
    expect(editorIssueText({ nodeId: 'dead_hang', message: 'cycle' }, 'x', named)).toBe(
      'Dead hang: cycle',
    );
  });
});

describe('draftChanged', () => {
  const initial: ExerciseNode = { ...chain[2], cues: ['Lock the elbows'] };

  it('is false for the untouched draft and for an edit undone by hand', () => {
    expect(draftChanged(initial, initial)).toBe(false);
    expect(draftChanged(initial, removeCue(addCue(initial, 'Squeeze'), 1))).toBe(false);
  });

  it('is true once anything differs', () => {
    expect(draftChanged(initial, setName(initial, 'Renamed'))).toBe(true);
    expect(draftChanged(initial, addCue(initial, 'Squeeze'))).toBe(true);
  });
});
