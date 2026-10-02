/**
 * Upgrade safety of saved overlays (PLAN 6.3c, ADR-052, ADR-043): an overlay that was valid
 * against the dataset of an older release must still apply to the current dataset, with every
 * user node in the tree. The old trees are rebuilt from `RELEASED_POSITIONS`.
 */
import { ALL_NODES, NODE_BY_ID } from '@/data/skills';
import { RELEASED_POSITIONS } from '@/data/skills/releasedPositions';
import { validateNodes } from '@/data/validate';

import { newCustomNode, placeAfter } from './nodeEditor';
import { EMPTY_OVERLAY, applyOverlay, overlayFromRaw, overlayToRaw } from './overlay';
import { withNode } from './overlayEdit';
import type { Branch, ExerciseNode, ProgressionOverlay } from './types';

const RELEASES = Object.keys(RELEASED_POSITIONS);

/** The built-in tree of `release`: today's nodes at their old place, links to newer nodes cut. */
function releasedTree(release: string): ExerciseNode[] {
  const positions = RELEASED_POSITIONS[release];
  const ids = new Set(positions.map(([id]) => id));
  return positions.map(([id, branch, chainOrder, ogLevel]) => {
    const node = NODE_BY_ID.get(id);
    if (!node) throw new Error(`'${id}' of ${release} is missing today (ids are stable forever)`);
    const old: ExerciseNode = {
      ...node,
      branch,
      chainOrder,
      ogLevel,
      prerequisites: node.prerequisites.filter((prereq) => ids.has(prereq.nodeId)),
      alternatives: node.alternatives.filter((alternative) => ids.has(alternative)),
    };
    if (old.regressionId !== undefined && !ids.has(old.regressionId)) delete old.regressionId;
    return old;
  });
}

/** A user node as the editor made it in `tree`: placed after `afterId`, gated on it. */
function customNodeAfter(
  tree: readonly ExerciseNode[],
  branch: Branch,
  afterId: string | undefined,
  id: string,
): ExerciseNode {
  const node = newCustomNode(tree, branch, afterId);
  const placed = afterId === undefined ? placeAfter(node, tree, undefined) : node;
  return {
    ...placed,
    id,
    name: `My step ${id}`,
    description: 'A step the user added between two built-in nodes.',
    prerequisites:
      afterId === undefined ? [] : [{ nodeId: afterId, minLevel: 5, kind: 'recommended' }],
  };
}

/** The old app's check: straight `validateNodes` on the merged tree, all rules errors. */
function validInOldApp(tree: readonly ExerciseNode[], overlay: ProgressionOverlay): boolean {
  const merged = tree.map((node) => ({ ...node, ...overlay.edited[node.id] }));
  return validateNodes([...merged, ...overlay.added]).length === 0;
}

/** Built-in ids of `branch` in `tree`, in column order. */
function column(tree: readonly ExerciseNode[], branch: Branch): string[] {
  return tree
    .filter((node) => node.branch === branch)
    .sort((a, b) => a.chainOrder - b.chainOrder)
    .map((node) => node.id);
}

describe.each(RELEASES)('overlays saved on %s', (release) => {
  const oldTree = releasedTree(release);
  const branches = [...new Set(oldTree.map((node) => node.branch))];

  it('rebuilds a valid old tree', () => {
    expect(validateNodes(oldTree)).toEqual([]);
  });

  describe('regression: user nodes where 6.3a/6.3b later put built-in nodes', () => {
    // After tuck_front_lever (order 10) and before advanced_tuck_front_lever (20): order 15, which
    // tuck_front_lever_raise took in 6.3b. After straddle_front_lever: order 45 = half_lay (og 7).
    // After advanced_tuck_planche: order 45 = tuck_planche_push_up. After straddle_planche: order
    // 55, now behind advanced_tuck_planche_push_up (53, og 8) with og 7.
    const added = [
      customNodeAfter(oldTree, 'front_lever', 'tuck_front_lever', 'user_tuck_lever_pulses'),
      customNodeAfter(oldTree, 'front_lever', 'straddle_front_lever', 'user_straddle_raises'),
      customNodeAfter(oldTree, 'planche', 'advanced_tuck_planche', 'user_adv_tuck_leans'),
      customNodeAfter(oldTree, 'planche', 'straddle_planche', 'user_straddle_leans'),
    ];
    const overlay: ProgressionOverlay = {
      ...EMPTY_OVERLAY,
      added,
      edited: { tuck_planche: { ogLevel: 5, cues: ['My own cue.'] } },
    };

    it('was valid in the old app and would fail its strict check today', () => {
      expect(validInOldApp(oldTree, overlay)).toBe(true);
      expect(added.map((node) => node.chainOrder)).toEqual([15, 45, 45, 55]);
      expect(validInOldApp(ALL_NODES, overlay)).toBe(false); // the bug the fix removes
    });

    it('applies cleanly to the current dataset with every user node in the tree', () => {
      const { nodes, issues, warnings } = applyOverlay(ALL_NODES, overlay);
      expect(issues).toEqual([]);
      expect(column(nodes, 'front_lever').slice(0, 3)).toEqual([
        'tuck_front_lever',
        'tuck_front_lever_raise',
        'user_tuck_lever_pulses',
      ]);
      expect(column(nodes, 'front_lever')).toContain('user_straddle_raises');
      expect(column(nodes, 'planche').slice(4, 6)).toEqual([
        'tuck_planche_push_up',
        'user_adv_tuck_leans',
      ]);
      // An og_level below a new built-in node above it is advice, not an error.
      expect(warnings.map((warning) => warning.nodeId).sort()).toEqual([
        'user_straddle_leans',
        'user_straddle_raises',
      ]);
    });

    it('keeps the stored overlay as it was (no rewrite on load)', () => {
      const stored = overlayToRaw(overlay);
      applyOverlay(ALL_NODES, overlay);
      expect(overlayToRaw(overlay)).toEqual(stored);
      expect(overlayFromRaw(stored).overlay).toEqual(overlay);
    });
  });

  it('keeps every user node position a user could have chosen valid', () => {
    const failures: string[] = [];
    for (const branch of branches) {
      for (const afterId of [undefined, ...column(oldTree, branch)]) {
        const node = customNodeAfter(oldTree, branch, afterId, `user_after_${afterId ?? 'top'}`);
        const overlay: ProgressionOverlay = { ...EMPTY_OVERLAY, added: [node] };
        if (!validInOldApp(oldTree, overlay)) {
          failures.push(`${branch}/${afterId}: invalid in the old app`);
          continue;
        }
        const { nodes, issues } = applyOverlay(ALL_NODES, overlay);
        const placed = nodes.find((entry) => entry.id === node.id);
        if (issues.length > 0 || !placed) {
          failures.push(`${branch}/${afterId}: ${issues.map((issue) => issue.message).join('; ')}`);
          continue;
        }
        // Still between its old neighbours.
        const order = (id: string) => nodes.find((entry) => entry.id === id)?.chainOrder ?? 0;
        const oldColumn = column(oldTree, branch);
        const nextId = oldColumn[afterId === undefined ? 0 : oldColumn.indexOf(afterId) + 1];
        if (afterId !== undefined && !(placed.chainOrder > order(afterId))) {
          failures.push(`${branch}/${afterId}: not after ${afterId}`);
        }
        if (nextId !== undefined && !(placed.chainOrder < order(nextId))) {
          failures.push(`${branch}/${afterId}: not before ${nextId}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('keeps every move of a built-in node a user could have made valid', () => {
    const failures: string[] = [];
    for (const branch of branches) {
      const ids = column(oldTree, branch);
      for (const movedId of ids) {
        const moved = oldTree.find((node) => node.id === movedId)!;
        for (const afterId of [undefined, ...ids.filter((id) => id !== movedId)]) {
          const overlay = withNode(EMPTY_OVERLAY, oldTree, placeAfter(moved, oldTree, afterId));
          if (!validInOldApp(oldTree, overlay)) continue; // the old app refused it: never saved
          const { issues } = applyOverlay(ALL_NODES, overlay);
          if (issues.length > 0) {
            failures.push(
              `${movedId} after ${afterId}: ${issues.map((i) => i.message).join('; ')}`,
            );
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
