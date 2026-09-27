import { makeChain, makeNode } from '@/data/testFixtures';
import { ALL_NODES, NODE_BY_ID } from '@/data/skills';
import { MS_PER_DAY } from '@/lib/time';

import {
  assessmentAnchors,
  defaultTrialResults,
  goalPathNodes,
  searchNodes,
  stepTrialResult,
  testOutWarnings,
  trialSession,
  unlockedByTrial,
} from './assessment';
import { evaluateTrial } from './progression';
import { applySession, INITIAL_ENGINE_STATE } from './recompute';
import type { ExerciseNode } from './types';

const node = (id: string): ExerciseNode => NODE_BY_ID.get(id) as ExerciseNode;
const NOW = 1_790_000_000_000;

describe('goalPathNodes', () => {
  it('walks hard prerequisites transitively, easiest first', () => {
    const ids = goalPathNodes(makeChain(), ['pull_up']).map((entry) => entry.id);
    expect(ids).toEqual(['dead_hang', 'pull_up_negative', 'pull_up']);
  });

  it('ignores unknown goals and recommended prerequisites', () => {
    const nodes = [
      makeNode({ id: 'a' }),
      makeNode({
        id: 'b',
        chainOrder: 20,
        prerequisites: [{ nodeId: 'a', minLevel: 3, kind: 'recommended' }],
      }),
    ];
    expect(goalPathNodes(nodes, ['b', 'nope']).map((entry) => entry.id)).toEqual(['b']);
  });

  it('covers the cross-branch gates of the real front lever', () => {
    const ids = goalPathNodes(ALL_NODES, ['front_lever']).map((entry) => entry.id);
    expect(ids).toEqual(expect.arrayContaining(['dead_hang', 'hollow_hold', 'pull_up']));
    expect(ids[ids.length - 1]).toBe('front_lever');
  });
});

describe('assessmentAnchors', () => {
  it('returns the whole path when it is short', () => {
    expect(assessmentAnchors(makeChain(), ['pull_up']).map((entry) => entry.id)).toEqual([
      'dead_hang',
      'pull_up_negative',
      'pull_up',
    ]);
  });

  it('spreads a long path evenly and keeps both ends', () => {
    const path = goalPathNodes(ALL_NODES, ['front_lever']);
    const anchors = assessmentAnchors(ALL_NODES, ['front_lever'], 4);
    expect(anchors).toHaveLength(4);
    expect(anchors[0]).toBe(path[0]);
    expect(anchors[3]).toBe(path[path.length - 1]);
  });

  it('handles a count of 0 and 1', () => {
    expect(assessmentAnchors(ALL_NODES, ['front_lever'], 0)).toEqual([]);
    expect(assessmentAnchors(ALL_NODES, ['front_lever'], 1).map((entry) => entry.id)).toEqual([
      'front_lever',
    ]);
  });

  it('is empty without goals', () => {
    expect(assessmentAnchors(ALL_NODES, [])).toEqual([]);
  });
});

describe('searchNodes', () => {
  it('finds by name case-insensitively, prefix matches first', () => {
    const names = searchNodes(ALL_NODES, 'PLANCHE').map((entry) => entry.name);
    expect(names[0]).toBe('Planche lean');
    expect(names).toContain('Pseudo planche push-up');
  });

  it('finds by id and respects the limit', () => {
    expect(searchNodes(ALL_NODES, 'tuck_front').map((entry) => entry.id)).toContain(
      'tuck_front_lever',
    );
    expect(searchNodes(ALL_NODES, 'push', 3)).toHaveLength(3);
  });

  it('finds nothing for an empty query', () => {
    expect(searchNodes(ALL_NODES, '  ')).toEqual([]);
  });
});

describe('Trial results', () => {
  it('defaults to the Trial standard per set', () => {
    expect(defaultTrialResults(node('pull_up'))).toEqual([
      { value: 8 },
      { value: 8 },
      { value: 8 },
    ]);
    expect(defaultTrialResults(node('dip_negative'))[0]).toEqual({ value: 5, reps: 3 });
  });

  it('steps by the metric step and never below 0', () => {
    const hang = node('dead_hang');
    expect(stepTrialResult(hang, { value: 30 }, 1)).toEqual({ value: 35 });
    expect(stepTrialResult(hang, { value: 3 }, -1)).toEqual({ value: 0 });
    const load = makeNode({
      id: 'weighted',
      metric: 'load_xbw',
      trial: { sets: 3, target: 0.5, reps: 5 },
    });
    expect(stepTrialResult(load, { value: 0.1, reps: 5 }, 1)).toEqual({ value: 0.15, reps: 5 });
  });

  it('builds a Trial session that passes the Trial when the standard is met', () => {
    const pullUp = node('pull_up');
    const session = trialSession(pullUp, defaultTrialResults(pullUp), 's1', NOW);
    expect(session.sets).toHaveLength(3);
    expect(session.sets.every((set) => set.isTrial && set.nodeId === 'pull_up')).toBe(true);
    expect(evaluateTrial(pullUp, session.sets)).toBe(true);

    const weaker = trialSession(pullUp, [{ value: 8 }, { value: 8 }, { value: 6 }], 's2', NOW);
    expect(evaluateTrial(pullUp, weaker.sets)).toBe(false);
  });

  it('a logged test-out on a locked node makes it proficient and unlocks successors', () => {
    const pullUp = node('pull_up');
    const session = trialSession(pullUp, defaultTrialResults(pullUp), 's1', NOW);
    const { state, result } = applySession(INITIAL_ENGINE_STATE, session, ALL_NODES);
    expect(state.progress.pull_up.trialPassed).toBe(true);
    expect(result.unlocked).toContain('chest_to_bar_pull_up');
    expect(unlockedByTrial(result, 'pull_up')).toEqual(
      result.unlocked.filter((id) => id !== 'pull_up'),
    );
    expect(unlockedByTrial(result, 'pull_up')).not.toContain('pull_up');
  });
});

describe('testOutWarnings', () => {
  it('is empty for an available bent-arm node', () => {
    expect(testOutWarnings(node('dead_hang'), ALL_NODES, {}, undefined, NOW)).toEqual([]);
  });

  it('explains unmet prerequisites of a locked node', () => {
    const codes = testOutWarnings(node('pull_up'), ALL_NODES, {}, undefined, NOW).map(
      (warning) => warning.code,
    );
    expect(codes).toEqual(['prerequisites_unmet']);
  });

  it('warns about an untrained straight-arm Trial and a recent straight-arm session', () => {
    const warnings = testOutWarnings(node('tuck_planche'), ALL_NODES, {}, NOW - MS_PER_DAY, NOW);
    expect(warnings.map((warning) => warning.code)).toEqual([
      'prerequisites_unmet',
      'straight_arm_min_weeks',
      'straight_arm_rest',
    ]);
    expect(warnings.filter((warning) => warning.severity === 'warning')).toHaveLength(2);
  });

  it('does not flag the budget for the Trial itself (ADR-025)', () => {
    const codes = testOutWarnings(node('german_hang'), ALL_NODES, {}, undefined, NOW).map(
      (warning) => warning.code,
    );
    expect(codes).not.toContain('straight_arm_budget');
  });
});
