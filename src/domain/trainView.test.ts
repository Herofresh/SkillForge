import { makeNode } from '@/data/testFixtures';

import { formatCountdown, formatPrescription, formatRest } from './format';
import type { SessionResult } from './recompute';
import { logSessionSet, replaceExercise, sessionPlan, startSession } from './train';
import { blockViews, liveView, summaryView } from './trainView';
import type { NodeLookup, WorkoutPlan } from './types';

const NODES = [
  makeNode({ id: 'pull_up', name: 'Pull-up' }),
  makeNode({ id: 'squat', name: 'Squat', patterns: ['squat'] }),
  makeNode({ id: 'lean', name: 'Planche lean', metric: 'hold_s', straightArm: true }),
  makeNode({ id: 'chin_up', name: 'Chin-up' }),
];
const LOOKUP: NodeLookup = new Map(NODES.map((node) => [node.id, node]));

const WORKOUT: WorkoutPlan = {
  blocks: [
    {
      kind: 'skill',
      exercises: [
        {
          nodeId: 'lean',
          sets: 3,
          target: { value: 20 },
          metric: 'hold_s',
          restSec: 180,
          isTrial: true,
          substitutedFrom: 'gone',
        },
      ],
    },
    {
      kind: 'strength',
      exercises: [
        { nodeId: 'pull_up', sets: 3, target: { value: 5 }, metric: 'reps', restSec: 90 },
        { nodeId: 'squat', sets: 3, target: { value: 8 }, metric: 'reps', restSec: 90 },
      ],
    },
  ],
  estimatedMinutes: 20,
  warnings: [],
  notes: [],
};

describe('format helpers for the Train flow', () => {
  it('formats prescriptions, countdowns and rest', () => {
    expect(formatPrescription('reps', 3, { value: 8 })).toBe('3 × 8 reps');
    expect(formatCountdown(65)).toBe('1:05');
    expect(formatCountdown(-3)).toBe('0:00');
    expect(formatCountdown(0.2)).toBe('0:01');
    expect(formatRest(90)).toBe('90 s rest');
    expect(formatRest(180)).toBe('3 min rest');
    expect(formatRest(150)).toBe('150 s rest');
  });
});

describe('Train view models', () => {
  it('groups the plan into blocks with names, prescriptions and markers', () => {
    const plan = replaceExercise(sessionPlan(WORKOUT, 'home', 30), 'e1', {
      nodeId: 'chin_up',
      sets: 3,
      target: { value: 5 },
      metric: 'reps',
      restSec: 180,
    });
    const blocks = blockViews(plan.exercises, LOOKUP);
    expect(blocks.map((block) => [block.label, block.exercises.length])).toEqual([
      ['Skill', 1],
      ['Strength', 2],
    ]);
    expect(blocks[0].exercises[0]).toMatchObject({
      name: 'Planche lean',
      prescription: '3 × 20 s',
      rest: '3 min rest',
      isTrial: true,
      straightArm: true,
      substitutedFromName: 'gone',
      setsLogged: 0,
      done: false,
    });
    expect(blocks[1].exercises[0]).toMatchObject({
      name: 'Chin-up',
      swappedFromName: 'Pull-up',
      pairedWithName: 'Squat',
      rest: '90 s rest',
    });
  });

  it('shows the current exercise with its logged sets and a suggestion', () => {
    let session = startSession(sessionPlan(WORKOUT, 'home', 30), 's', 0);
    session = logSessionSet(session, 'e0', { value: 15 }, 1);
    const view = liveView(session, LOOKUP);
    expect(view.current).toMatchObject({
      setNumber: 2,
      plannedSets: 3,
      metric: 'hold_s',
      suggested: { value: 15 },
      sets: [{ index: 0, text: '15 s', outcome: 'partial' }],
    });
    expect(view.counts.setsLogged).toBe(1);
    expect(view.blocks[0].exercises[0].setsLogged).toBe(1);
  });

  it('suggests the target before the first set and has no current when all is done', () => {
    const session = startSession(sessionPlan(WORKOUT, 'home', 30), 's', 0);
    expect(liveView(session, LOOKUP).current?.suggested).toEqual({ value: 20 });
    expect(liveView({ ...session, currentKey: undefined }, LOOKUP).current).toBeUndefined();
  });

  it('names everything in the summary', () => {
    const result: SessionResult = {
      sessionId: 's',
      exercises: [
        {
          nodeId: 'pull_up',
          outcome: 'success',
          units: 15,
          xp: 20,
          trialAttempted: false,
          trialPassed: false,
        },
      ],
      xp: { exerciseXp: 20, completionBonus: 2, streakBonus: 1, total: 23 },
      streak: 2,
      levelUps: [{ nodeId: 'pull_up', from: 1, to: 2 }],
      unlocked: ['chin_up', 'missing'],
      warnings: [],
    };
    expect(summaryView(result, NODES)).toEqual({
      totalXp: 23,
      exerciseXp: 20,
      completionBonus: 2,
      streakBonus: 1,
      streak: 2,
      exercises: [
        {
          nodeId: 'pull_up',
          name: 'Pull-up',
          outcome: 'success',
          outcomeLabel: 'Success',
          xp: 20,
          trialAttempted: false,
          trialPassed: false,
        },
      ],
      levelUps: [{ nodeId: 'pull_up', name: 'Pull-up', from: 1, to: 2 }],
      unlocked: [
        { nodeId: 'chin_up', name: 'Chin-up' },
        { nodeId: 'missing', name: 'missing' },
      ],
      warnings: [],
    });
  });
});
