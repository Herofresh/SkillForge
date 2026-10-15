import { makeNode } from '@/data/testFixtures';
import { MS_PER_SECOND } from '@/lib/time';

import {
  battleView,
  DEFAULT_TRAINING_VIEW,
  foeSetLabel,
  monsterOf,
  parseTrainingView,
  tapFoe,
  type FoeTap,
} from './battleView';
import { exerciseSets, sessionPlan, startSession, type ActiveSession } from './train';
import type { NodeLookup, WorkoutPlan } from './types';

const NODES = [
  makeNode({ id: 'pull_up', name: 'Pull-up' }),
  makeNode({ id: 'squat', name: 'Squat', branch: 'legs', patterns: ['squat'] }),
  makeNode({ id: 'lean', name: 'Planche lean', branch: 'planche', metric: 'hold_s' }),
  makeNode({ id: 'negative', name: 'Negative', metric: 'eccentric_s' }),
];
const LOOKUP: NodeLookup = new Map(NODES.map((node) => [node.id, node]));

const WORKOUT: WorkoutPlan = {
  blocks: [
    {
      kind: 'skill',
      exercises: [
        { nodeId: 'lean', sets: 2, target: { value: 20 }, metric: 'hold_s', restSec: 180 },
      ],
    },
    {
      kind: 'strength',
      exercises: [
        { nodeId: 'pull_up', sets: 3, target: { value: 5 }, metric: 'reps', restSec: 90 },
        { nodeId: 'squat', sets: 2, target: { value: 8 }, metric: 'reps', restSec: 90 },
      ],
    },
    {
      kind: 'core',
      exercises: [
        {
          nodeId: 'negative',
          sets: 1,
          target: { value: 5, reps: 3 },
          metric: 'eccentric_s',
          restSec: 60,
        },
      ],
    },
  ],
  estimatedMinutes: 20,
  restPace: 1,
  warnings: [],
  notes: [],
};

const fresh = (): ActiveSession => startSession(sessionPlan(WORKOUT, 'home', 30), 's', 0);
/** e0 lean (hold), e1 pull-up, e2 squat, e3 negative. */
const sessionOf = (tap: FoeTap): ActiveSession => {
  if (!('session' in tap)) throw new Error('expected a session');
  return tap.session;
};
const tap = (session: ActiveSession, key: string, slot: number, at = 1000) =>
  sessionOf(tapFoe(session, key, slot, at));

describe('training view setting', () => {
  it('reads Classic or Battle, anything else as the default', () => {
    expect(parseTrainingView('battle')).toBe('battle');
    expect(parseTrainingView('classic')).toBe('classic');
    expect(parseTrainingView(undefined)).toBe(DEFAULT_TRAINING_VIEW);
    expect(parseTrainingView('arena')).toBe('classic');
  });
});

describe('battleView', () => {
  it('shows every exercise as fresh foes of its branch, by block', () => {
    const blocks = battleView(fresh(), LOOKUP);
    expect(blocks.map((block) => [block.label, block.exercises.length])).toEqual([
      ['Skill', 1],
      ['Strength', 2],
      ['Core', 1],
    ]);
    const [lean] = blocks[0].exercises;
    expect(lean.monster).toBe('golem');
    expect(lean.foes.map((foe) => [foe.state, foe.count, foe.hp])).toEqual([
      ['fresh', '20s', 1],
      ['fresh', '20s', 1],
    ]);
    expect(blocks[1].exercises.map((entry) => entry.monster)).toEqual(['bat', 'goblin']);
    expect(blocks[1].exercises[0].foes[0].spoken).toBe(
      'Set 1 of 3, Bat, not fought yet, target 5 reps',
    );
  });

  it('shows logged sets, extra sets and the fighting hold', () => {
    let session = tap(fresh(), 'e1', 0);
    session = tap(session, 'e1', 1);
    session = tap(tap(tap(session, 'e1', 1), 'e1', 1), 'e1', 1); // 5 → 2
    session = tap(tap(tap(session, 'e1', 2), 'e1', 3), 'e0', 0);
    const [lean] = battleView(session, LOOKUP)[0].exercises;
    expect(lean.foes[0].state).toBe('fighting');
    const pull = battleView(session, LOOKUP)[1].exercises[0];
    expect(pull.foes.map((foe) => [foe.state, foe.count, foe.extra])).toEqual([
      ['defeated', '5', false],
      ['wounded', '2', false],
      ['defeated', '5', false],
      ['defeated', '5', true],
    ]);
    expect(pull.foes[1].hp).toBeCloseTo(0.6);
    expect(pull.foes[1].damage).toBe('-2');
    expect(pull.foes[3].spoken).toBe('Extra set 4, Bat, defeated, 5 reps');
    expect(pull.nextSlot).toBe(4);
  });

  it('gives unknown nodes a slime', () => {
    expect(monsterOf(LOOKUP, 'gone')).toBe('slime');
    expect(foeSetLabel(2, 3)).toBe('Set 3 of 3');
    expect(foeSetLabel(3, 3)).toBe('Extra set 4');
  });
});

describe('tapFoe', () => {
  it('logs the target, counts down and removes below zero', () => {
    let session = tap(fresh(), 'e1', 2); // any fresh foe fights the next set
    expect(exerciseSets(session, 'e1').map((set) => set.actual)).toEqual([{ value: 5 }]);
    expect(session.restEndsAt).toBe(1000 + 90 * MS_PER_SECOND);
    for (let left = 4; left >= 0; left--) {
      session = tap(session, 'e1', 0);
      expect(exerciseSets(session, 'e1')[0].actual).toEqual({ value: left });
    }
    session = tap(session, 'e1', 0);
    expect(exerciseSets(session, 'e1')).toEqual([]);
  });

  it('counts lowerings down for eccentric sets', () => {
    let session = tap(fresh(), 'e3', 0);
    expect(exerciseSets(session, 'e3')[0].actual).toEqual({ value: 5, reps: 3 });
    session = tap(session, 'e3', 0);
    expect(exerciseSets(session, 'e3')[0].actual).toEqual({ value: 5, reps: 2 });
  });

  it('starts a hold, logs the seconds held on the second tap and edits a logged hold', () => {
    let session = tap(fresh(), 'e0', 0, 1000);
    expect(session.timer).toEqual({ exerciseKey: 'e0', startedAt: 1000 });
    expect(exerciseSets(session, 'e0')).toEqual([]);
    // 3 s get ready, then 25 s held.
    session = tap(session, 'e0', 0, 1000 + 28 * MS_PER_SECOND);
    const [set] = exerciseSets(session, 'e0');
    expect(set.actual).toEqual({ value: 25 });
    expect(set.durationSec).toBe(25);
    expect(session.timer).toBeUndefined();
    expect(tapFoe(session, 'e0', 0, 5000)).toEqual({ edit: set.setIndex });
  });

  it('leaves the session alone for an unknown exercise', () => {
    const session = fresh();
    expect(tap(session, 'e9', 0)).toBe(session);
  });
});
