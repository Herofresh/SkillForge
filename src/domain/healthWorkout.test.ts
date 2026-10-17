import { makeNode } from '@/data/testFixtures';

import {
  HEALTH_MIN_DURATION_MS,
  HEALTH_NOTES_MAX,
  HEALTH_WORKOUT_TITLE,
  healthWorkout,
  parseHealthConnectEnabled,
  workoutNotes,
} from './healthWorkout';
import type { LoggedSet, Metric, NodeLookup, SetPerformance } from './types';

const NODES = [
  makeNode({ id: 'pull_up', name: 'Pull-up' }),
  makeNode({ id: 'plank', name: 'Plank', metric: 'hold_s' }),
  makeNode({ id: 'negative', name: 'Negative pull-up', metric: 'eccentric_s' }),
];
const LOOKUP: NodeLookup = new Map(NODES.map((node) => [node.id, node]));

let index = 0;
const set = (
  nodeId: string,
  metric: Metric,
  actual: SetPerformance,
  isTrial = false,
): LoggedSet => ({
  sessionId: 's',
  nodeId,
  setIndex: index++,
  metric,
  prescribed: actual,
  actual,
  isTrial,
  timestamp: 0,
});

beforeEach(() => {
  index = 0;
});

describe('workoutNotes', () => {
  it('lists each exercise with its sets in the order first trained', () => {
    const sets = [
      set('pull_up', 'reps', { value: 5 }),
      set('plank', 'hold_s', { value: 30 }),
      set('pull_up', 'reps', { value: 5 }),
      set('plank', 'hold_s', { value: 25 }),
      set('pull_up', 'reps', { value: 4 }),
      set('negative', 'eccentric_s', { value: 5, reps: 3 }),
    ];
    expect(workoutNotes(sets, LOOKUP, 120)).toBe(
      [
        '3 exercises, 6 sets, +120 XP',
        'Pull-up: 5, 5, 4 reps',
        'Plank: 30, 25 s',
        'Negative pull-up: 3 × 5 s lowerings',
      ].join('\n'),
    );
  });

  it('leaves out sets logged as 0, marks Trials and names unknown nodes by id', () => {
    const sets = [
      set('pull_up', 'reps', { value: 0 }),
      set('plank', 'hold_s', { value: 0 }),
      set('plank', 'hold_s', { value: 40 }, true),
      set('gone', 'reps', { value: 3 }),
    ];
    expect(workoutNotes(sets, LOOKUP)).toBe(
      ['2 exercises, 2 sets', 'Plank (Trial): 40 s', 'gone: 3 reps'].join('\n'),
    );
  });

  it('cuts long notes with an ellipsis', () => {
    const many = Array.from({ length: 400 }, () => set('pull_up', 'reps', { value: 10 }));
    const notes = workoutNotes(many, LOOKUP);
    expect(notes).toHaveLength(HEALTH_NOTES_MAX);
    expect(notes.endsWith('…')).toBe(true);
  });
});

describe('healthWorkout', () => {
  it('runs from the start to the end of the session with a stable id', () => {
    const session = {
      id: 'abc',
      startedAt: 1_000_000,
      sets: [set('pull_up', 'reps', { value: 5 })],
    };
    const workout = healthWorkout(session, 1_000_000 + 30 * 60_000, LOOKUP, 50);
    expect(workout).toEqual({
      clientId: 'skillforge-abc',
      startMs: 1_000_000,
      endMs: 1_000_000 + 30 * 60_000,
      title: HEALTH_WORKOUT_TITLE,
      notes: '1 exercise, 1 set, +50 XP\nPull-up: 5 reps',
    });
  });

  it('lasts at least a minute', () => {
    const session = { id: 'quick', startedAt: 5_000, sets: [] };
    expect(healthWorkout(session, 5_000, LOOKUP).endMs).toBe(5_000 + HEALTH_MIN_DURATION_MS);
  });
});

describe('parseHealthConnectEnabled', () => {
  it('is on only when stored as true', () => {
    expect(parseHealthConnectEnabled(true)).toBe(true);
    expect(parseHealthConnectEnabled(undefined)).toBe(false);
    expect(parseHealthConnectEnabled('true')).toBe(false);
    expect(parseHealthConnectEnabled(false)).toBe(false);
  });
});
