import { makeChain, makeNode } from '@/data/testFixtures';
import { EMPTY_OVERLAY, applyOverlay } from '@/domain/overlay';
import {
  customizationOf,
  customizedNodeIds,
  describeOverlayEntry,
  mergeOverlays,
  nodeEditFor,
  overlayEntries,
  overlayImportPreview,
  withHidden,
  withNode,
  withoutNodeChanges,
} from '@/domain/overlayEdit';
import type { ExerciseNode, ProgressionOverlay } from '@/domain/types';

const base = makeChain(); // dead_hang -> pull_up_negative -> pull_up
const pullUp = base[2];

const userNode = makeNode({
  id: 'user_towel_hang',
  name: 'Towel hang',
  source: 'user',
  chainOrder: 15,
  ogLevel: 1,
  sourceUrls: [],
  prerequisites: [{ nodeId: 'dead_hang', minLevel: 5, kind: 'hard' }],
});

const overlay = (changes: Partial<ProgressionOverlay>): ProgressionOverlay => ({
  ...EMPTY_OVERLAY,
  ...changes,
});

describe('nodeEditFor', () => {
  it('keeps only the fields that differ from the built-in node', () => {
    const edited: ExerciseNode = { ...pullUp, trial: { sets: 3, target: 10 }, cues: ['Chin up'] };
    expect(nodeEditFor(pullUp, edited)).toEqual({
      trial: { sets: 3, target: 10 },
      cues: ['Chin up'],
    });
    expect(nodeEditFor(pullUp, { ...pullUp })).toEqual({});
  });

  it('stores the derived attributes when a node that sets trains goes back to auto', () => {
    const lSit = makeNode({ id: 'l_sit', patterns: ['core'], trains: ['core', 'push'] });
    const auto = { ...lSit };
    delete auto.trains;
    expect(nodeEditFor(lSit, auto)).toEqual({ trains: ['core'] });
  });
});

describe('withNode / withoutNodeChanges / withHidden', () => {
  it('stores a built-in edit as a difference and drops it when it equals the default', () => {
    const edited = withNode(EMPTY_OVERLAY, base, { ...pullUp, cues: ['Chin up'] });
    expect(edited.edited).toEqual({ pull_up: { cues: ['Chin up'] } });
    expect(withNode(edited, base, { ...pullUp }).edited).toEqual({});
  });

  it('adds a user node, then replaces it by id', () => {
    const added = withNode(EMPTY_OVERLAY, base, userNode);
    expect(added.added).toEqual([userNode]);
    const renamed = withNode(added, base, { ...userNode, name: 'Towel grip hang' });
    expect(renamed.added).toEqual([{ ...userNode, name: 'Towel grip hang' }]);
  });

  it('throws for an unknown core node', () => {
    expect(() => withNode(EMPTY_OVERLAY, base, makeNode({ id: 'ghost' }))).toThrow(/built-in/);
  });

  it('resets a node: edit, hidden flag and user node removed', () => {
    const full = overlay({
      added: [userNode],
      edited: { pull_up: { cues: ['x'] } },
      hidden: ['pull_up', 'dead_hang'],
    });
    expect(withoutNodeChanges(full, 'pull_up')).toEqual(
      overlay({ added: [userNode], hidden: ['dead_hang'] }),
    );
    expect(withoutNodeChanges(full, 'user_towel_hang').added).toEqual([]);
  });

  it('hides and shows a node once', () => {
    const hidden = withHidden(withHidden(EMPTY_OVERLAY, 'dead_hang', true), 'dead_hang', true);
    expect(hidden.hidden).toEqual(['dead_hang']);
    expect(withHidden(hidden, 'dead_hang', false).hidden).toEqual([]);
  });

  it('customizationOf tells added, edited and hidden apart', () => {
    const full = overlay({
      added: [userNode],
      edited: { pull_up: { cues: ['x'] } },
      hidden: ['dead_hang'],
    });
    expect(customizationOf(full, 'user_towel_hang')).toBe('added');
    expect(customizationOf(full, 'pull_up')).toBe('edited');
    expect(customizationOf(full, 'dead_hang')).toBe('hidden');
    expect(customizationOf(full, 'pull_up_negative')).toBeUndefined();
    expect([...customizedNodeIds(full)]).toEqual(['user_towel_hang', 'pull_up']);
  });
});

describe('overlayEntries', () => {
  it('lists user nodes, edits with their fields and hidden nodes', () => {
    const full = overlay({
      added: [userNode],
      edited: { pull_up: { trial: { sets: 3, target: 10 }, cues: ['x'] } },
      hidden: ['pull_up_negative'],
    });
    expect(overlayEntries(full, base)).toEqual([
      { nodeId: 'user_towel_hang', name: 'Towel hang', kind: 'added', fields: [] },
      { nodeId: 'pull_up', name: 'pull_up', kind: 'edited', fields: ['Trial', 'cues'] },
      { nodeId: 'pull_up_negative', name: 'pull_up_negative', kind: 'hidden', fields: [] },
    ]);
    expect(overlayEntries(full, base).map(describeOverlayEntry)).toEqual([
      'Your own exercise',
      'Changed: Trial, cues',
      'Hidden from the tree',
    ]);
  });
});

describe('mergeOverlays / overlayImportPreview', () => {
  const mine = overlay({
    added: [userNode],
    edited: { pull_up: { cues: ['mine'] }, dead_hang: { cues: ['keep'] } },
  });
  const shared = overlay({
    added: [{ ...userNode, name: 'Shared towel hang' }],
    edited: { pull_up: { cues: ['theirs'] } },
    hidden: ['pull_up_negative'],
  });

  it('lets the shared entries win per node and keeps the rest of mine', () => {
    expect(mergeOverlays(mine, shared)).toEqual({
      added: [{ ...userNode, name: 'Shared towel hang' }],
      edited: { pull_up: { cues: ['theirs'] }, dead_hang: { cues: ['keep'] } },
      hidden: ['pull_up_negative'],
    });
  });

  it('previews what changes, what replaces mine, and a valid merged tree', () => {
    const preview = overlayImportPreview(base, mine, shared);
    expect(preview.issues).toEqual([]);
    expect(
      preview.changes.map(({ nodeId, kind, replacesYours }) => [nodeId, kind, replacesYours]),
    ).toEqual([
      ['user_towel_hang', 'added', true],
      ['pull_up', 'edited', true],
      ['pull_up_negative', 'hidden', false],
    ]);
    expect(applyOverlay(base, preview.merged).issues).toEqual([]);
  });

  it('reports the issues of a merge that breaks the tree', () => {
    const cyclic = overlay({
      edited: {
        dead_hang: { prerequisites: [{ nodeId: 'user_towel_hang', minLevel: 5, kind: 'hard' }] },
      },
    });
    const preview = overlayImportPreview(base, mine, cyclic);
    expect(preview.issues.map((issue) => issue.message)).toEqual([expect.stringMatching(/cycle/)]);
  });
});
