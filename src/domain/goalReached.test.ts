import { ALL_NODES, NODE_BY_ID } from '@/data/skills';

import { goalsReachedIn, nextGoalOptions } from './goalReached';
import type { ProgressMap } from './progression';
import type { NodeProgress } from './types';

const passed = (nodeId: string): NodeProgress => ({
  nodeId,
  xp: 1000,
  level: 5,
  trialPassed: true,
  trialPassedAt: 1,
  firstTrainedAt: 1,
});

/** Progress with the Trial of `ids` passed. */
const progressOf = (...ids: string[]): ProgressMap =>
  Object.fromEntries(ids.map((id) => [id, passed(id)]));

const exercise = (nodeId: string, trialPassed: boolean) => ({
  nodeId,
  sets: 3,
  outcome: 'success' as const,
  units: 10,
  xp: 10,
  trialAttempted: true,
  trialPassed,
});

describe('goalsReachedIn (PLAN 7.8 FB-9)', () => {
  it('lists the goals whose Trial the session passed, directly or implied, in goal order', () => {
    const result = {
      exercises: [exercise('pull_up', true), exercise('squat', false)],
      trialsImplied: ['dead_hang'],
    };
    expect(goalsReachedIn(result, ['dead_hang', 'squat', 'pull_up', 'l_sit'])).toEqual([
      'dead_hang',
      'pull_up',
    ]);
  });

  it('is empty without a passed Trial, a goal, or the implied list (older results)', () => {
    expect(goalsReachedIn({ exercises: [exercise('pull_up', false)] }, ['pull_up'])).toEqual([]);
    expect(goalsReachedIn({ exercises: [exercise('pull_up', true)] }, [])).toEqual([]);
    expect(goalsReachedIn({ exercises: [exercise('pull_up', true)] }, ['squat'])).toEqual([]);
  });
});

describe('nextGoalOptions (PLAN 7.8 FB-11)', () => {
  const ids = (goalId: string, progress: ProgressMap = {}, goals: string[] = []) =>
    nextGoalOptions(ALL_NODES, progress, goalId, goals).map((option) => option.node.id);

  it('offers the skills that build directly on the goal: own branch, then open, then easiest', () => {
    const options = nextGoalOptions(ALL_NODES, progressOf('pull_up', 'dead_hang'), 'pull_up');
    expect(options.map((option) => option.node.id)).toEqual([
      'l_pull_up',
      'chest_to_bar_pull_up',
      'tuck_front_lever',
      'tuck_ice_cream_maker',
      'tuck_human_flag',
    ]);
    for (const option of options) {
      expect(
        option.node.prerequisites.some((p) => p.kind === 'hard' && p.nodeId === 'pull_up'),
      ).toBe(true);
    }
    expect(options[0]).toMatchObject({ sameBranch: true, stillNeeds: [] });
    // Across branches: what it still needs besides the reached goal, by name.
    const tuck = options.find((option) => option.node.id === 'tuck_front_lever');
    expect(tuck).toMatchObject({ sameBranch: false, stillNeeds: ['Hollow body hold'] });
  });

  it('leaves out proficient skills and the current goals', () => {
    expect(ids('pull_up', progressOf('pull_up', 'l_pull_up'))).not.toContain('l_pull_up');
    expect(ids('pull_up', {}, ['chest_to_bar_pull_up'])).not.toContain('chest_to_bar_pull_up');
  });

  it('is empty at the end of a path and for an unknown goal', () => {
    expect(NODE_BY_ID.has('one_arm_chin_up')).toBe(true);
    expect(ids('one_arm_chin_up')).toEqual([]);
    expect(ids('nope')).toEqual([]);
  });
});
