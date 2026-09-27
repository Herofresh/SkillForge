import { ALL_NODES, NODE_BY_ID } from '@/data/skills';
import { makeNode, makeSession, makeSet } from '@/data/testFixtures';
import {
  exerciseSeconds,
  generateWorkout,
  goalFrontier,
  isDoableWith,
  MIN_WORKING_SETS,
  PAIR_REST_SEC,
  planExercises,
  plannedSets,
  prescribe,
  scoreCandidate,
  SINGLE_REST_SEC,
  substituteFor,
  WARM_UP_REST_SEC,
  WORKING_SETS,
  type ScoreContext,
} from '@/domain/generator';
import { resolveTree } from '@/domain/progression';
import { recompute } from '@/domain/recompute';
import { STRAIGHT_ARM_SESSION_BUDGET_S, straightArmSecondsUsed } from '@/domain/safeguards';
import type {
  EquipmentTag,
  ExerciseNode,
  LoggedSession,
  NodeProgress,
  UserAction,
  WorkoutPlan,
  WorkoutRequest,
} from '@/domain/types';
import { MS_PER_DAY, MS_PER_HOUR } from '@/lib/time';

const NOW = Date.UTC(2026, 8, 27, 9);
const daysAgo = (days: number) => NOW - days * MS_PER_DAY;
const HOME: readonly EquipmentTag[] = ['floor', 'wall', 'bar', 'parallettes', 'bands'];
const PARK: readonly EquipmentTag[] = [...HOME, 'dip_bars'];

function node(id: string): ExerciseNode {
  const found = NODE_BY_ID.get(id);
  if (!found) throw new Error(`node '${id}' does not exist`);
  return found;
}

/** A session in which every node's Trial is passed (a test-out). */
function testOutSession(id: string, at: number, nodeIds: readonly string[]): LoggedSession {
  return makeSession(
    id,
    at,
    nodeIds.map((nodeId) => {
      const { trial, metric } = node(nodeId);
      const performance = { value: trial.target, ...(trial.reps ? { reps: trial.reps } : {}) };
      return {
        nodeId,
        count: trial.sets,
        metric,
        prescribed: performance,
        actual: performance,
        isTrial: true,
      };
    }),
  );
}

/** A session with `count` working sets of `value` for one node. */
function workSession(id: string, at: number, nodeId: string, value: number, count = 3) {
  const { metric, trial } = node(nodeId);
  const performance = { value, ...(trial.reps ? { reps: trial.reps } : {}) };
  return makeSession(id, at, [
    { nodeId, count, metric, prescribed: performance, actual: performance },
  ]);
}

const selfUnlock = (nodeId: string, at: number): UserAction => ({
  id: `unlock_${nodeId}`,
  kind: 'self_unlock',
  nodeId,
  at,
});

function request(
  overrides: Partial<WorkoutRequest> & { actions?: readonly UserAction[] } = {},
): WorkoutRequest {
  const { actions = [], ...rest } = overrides;
  const sessions = rest.recentSessions ?? [];
  return {
    nodes: ALL_NODES,
    goals: [],
    progress: recompute(ALL_NODES, sessions, actions).state.progress,
    equipment: HOME,
    availableMinutes: 60,
    recentSessions: sessions,
    now: NOW,
    seed: 1,
    ...rest,
  };
}

const ids = (plan: WorkoutPlan) => planExercises(plan).map((exercise) => exercise.nodeId);
const mainExercises = (plan: WorkoutPlan) =>
  plan.blocks.filter((block) => block.kind !== 'warm_up').flatMap((block) => block.exercises);
const straightArmSeconds = (plan: WorkoutPlan) =>
  straightArmSecondsUsed(plannedSets(planExercises(plan), NOW), NODE_BY_ID);

/** An intermediate user: the basics of every branch tested out a month ago. */
const INTERMEDIATE = [
  testOutSession('base', daysAgo(30), [
    'wall_push_up',
    'incline_push_up',
    'knee_push_up',
    'push_up',
    'support_hold',
    'dip_negative',
    'pike_push_up',
    'dead_hang',
    'scapular_pull',
    'jump_pull_up',
    'pull_up_negative',
    'incline_row',
    'hollow_hold',
    'side_plank',
    'assisted_squat',
    'squat',
    'wrist_prep',
  ]),
];

describe('goalFrontier', () => {
  it('walks a new user from the muscle-up to the start of its pull-up and dip paths', () => {
    const statuses = resolveTree(ALL_NODES, {});
    const frontier = goalFrontier(['strict_bar_muscle_up'], NODE_BY_ID, statuses);
    expect([...frontier.keys()].sort()).toEqual(['dead_hang', 'support_hold']);
    // The pull-up path is the longer (critical) one.
    expect(frontier.get('dead_hang')).toBeGreaterThan(frontier.get('support_hold') ?? 0);
  });

  it('lets a goal without unmet prerequisites train itself, and skips unknown goals', () => {
    const statuses = resolveTree(ALL_NODES, {});
    const frontier = goalFrontier(['dead_hang', 'no_such_node'], NODE_BY_ID, statuses);
    expect([...frontier.keys()]).toEqual(['dead_hang']);
  });

  it('adds the weights of goals that share a prerequisite', () => {
    const statuses = resolveTree(ALL_NODES, {});
    const one = goalFrontier(['pull_up'], NODE_BY_ID, statuses).get('dead_hang') ?? 0;
    const two = goalFrontier(['pull_up', 'tuck_front_lever'], NODE_BY_ID, statuses);
    expect(two.get('dead_hang')).toBeGreaterThan(one);
  });

  it('uses a trainable alternative of a locked prerequisite (ADR-019)', () => {
    const base = makeNode({ id: 'base', ogLevel: 0 });
    const main = makeNode({
      id: 'main_dip',
      chainOrder: 20,
      prerequisites: [{ nodeId: 'base', minLevel: 5, kind: 'hard' }],
      alternatives: ['other_dip'],
    });
    const other = makeNode({ id: 'other_dip', chainOrder: 30, alternatives: ['main_dip'] });
    const goal = makeNode({
      id: 'goal',
      chainOrder: 40,
      prerequisites: [{ nodeId: 'main_dip', minLevel: 5, kind: 'hard' }],
    });
    const nodes = [base, main, other, goal];
    const lookup = new Map(nodes.map((n) => [n.id, n]));
    const frontier = goalFrontier(['goal'], lookup, resolveTree(nodes, {}));
    expect([...frontier.keys()]).toEqual(['other_dip']);
  });
});

describe('equipment', () => {
  it('checks OR-of-AND equipment options', () => {
    expect(isDoableWith(node('wall_handstand_push_up'), ['wall'])).toBe(false);
    expect(isDoableWith(node('wall_handstand_push_up'), ['wall', 'parallettes'])).toBe(true);
    expect(isDoableWith(node('parallel_bar_dip'), HOME)).toBe(false);
  });

  it('substitutes with a doable alternative of the same pattern', () => {
    const statuses = resolveTree(ALL_NODES, {});
    expect(substituteFor(node('parallel_bar_dip'), HOME, NODE_BY_ID, statuses)?.id).toBe(
      'straight_bar_dip',
    );
    expect(substituteFor(node('human_flag'), HOME, NODE_BY_ID, statuses)).toBeUndefined();
  });
});

describe('prescribe (double progression)', () => {
  const pullUp = node('pull_up');
  const sets = (value: number, prescribed = value) => [
    makeSet({ nodeId: 'pull_up', actual: { value }, prescribed: { value: prescribed } }),
    makeSet({
      nodeId: 'pull_up',
      setIndex: 1,
      actual: { value },
      prescribed: { value: prescribed },
    }),
  ];

  it('starts at the bottom of the working range', () => {
    expect(prescribe(pullUp, undefined, undefined, NOW)).toEqual({
      sets: WORKING_SETS,
      target: { value: 5 },
      isTrial: false,
    });
  });

  it('adds a rep after a successful session and repeats after a missed one', () => {
    expect(prescribe(pullUp, undefined, sets(6), NOW).target).toEqual({ value: 7 });
    expect(prescribe(pullUp, undefined, sets(6, 7), NOW).target).toEqual({ value: 6 });
    expect(prescribe(pullUp, undefined, sets(2, 5), NOW).target).toEqual({ value: 5 });
  });

  it('suggests the Trial once the top of the range is reached', () => {
    expect(prescribe(pullUp, undefined, sets(8), NOW)).toEqual({
      sets: 3,
      target: { value: 8 },
      isTrial: true,
    });
    const passed: NodeProgress = { nodeId: 'pull_up', xp: 500, level: 6, trialPassed: true };
    expect(prescribe(pullUp, passed, sets(8), NOW)).toEqual({
      sets: WORKING_SETS,
      target: { value: 8 },
      isTrial: false,
    });
  });

  it('keeps lowerings per set for eccentric nodes', () => {
    expect(prescribe(node('pull_up_negative'), undefined, undefined, NOW).target).toEqual({
      value: 3,
      reps: 3,
    });
  });
});

describe('generateWorkout', () => {
  it('gives a new user with the muscle-up goal pull-up and dip path work first', () => {
    for (const availableMinutes of [30, 45, 60]) {
      const plan = generateWorkout(request({ goals: ['strict_bar_muscle_up'], availableMinutes }));
      const main = mainExercises(plan).map((exercise) => exercise.nodeId);
      expect(main).toEqual(expect.arrayContaining(['dead_hang', 'support_hold']));
    }
    const plan = generateWorkout(request({ goals: ['strict_bar_muscle_up'] }));
    const pairWithDeadHang = plan.blocks.find((block) =>
      block.exercises.some((exercise) => exercise.nodeId === 'dead_hang'),
    );
    expect(pairWithDeadHang?.kind).toBe('strength');
    expect(plan.blocks[0].kind).toBe('warm_up');
    expect(plan.blocks[0].exercises.map((exercise) => exercise.nodeId)).toEqual(
      expect.arrayContaining(['wrist_prep', 'shoulder_dislocate']),
    );
  });

  describe('equipment profiles', () => {
    const dipReady = [testOutSession('dips', daysAgo(20), ['support_hold', 'dip_negative'])];

    it('Home substitutes parallel-bar dips with a Home-doable alternative', () => {
      const plan = generateWorkout(
        request({ goals: ['parallel_bar_dip'], recentSessions: dipReady, equipment: HOME }),
      );
      const dip = planExercises(plan).find((exercise) => exercise.substitutedFrom);
      expect(dip).toMatchObject({
        nodeId: 'straight_bar_dip',
        substitutedFrom: 'parallel_bar_dip',
      });
      expect(ids(plan)).not.toContain('parallel_bar_dip');
      expect(planExercises(plan).every((e) => isDoableWith(node(e.nodeId), HOME))).toBe(true);
      expect(plan.notes.join(' ')).toContain('Straight bar dip replaces');
    });

    it('Park keeps parallel-bar dips', () => {
      const plan = generateWorkout(
        request({ goals: ['parallel_bar_dip'], recentSessions: dipReady, equipment: PARK }),
      );
      const dip = planExercises(plan).find((exercise) => exercise.nodeId === 'parallel_bar_dip');
      expect(dip).toBeDefined();
      expect(dip?.substitutedFrom).toBeUndefined();
    });

    it('drops goal work no alternative can replace, with a note', () => {
      const plan = generateWorkout(
        request({
          goals: ['tuck_human_flag'],
          recentSessions: [
            testOutSession('t', daysAgo(20), ['pull_up', 'parallel_bar_dip', 'side_plank']),
          ],
          equipment: HOME,
        }),
      );
      expect(ids(plan)).not.toContain('tuck_human_flag');
      expect(plan.notes.join(' ')).toContain('needs equipment');
    });
  });

  describe('straight-arm safeguards in the suggestions', () => {
    const levers = [
      workSession('fl1', daysAgo(56), 'tuck_front_lever', 10),
      workSession('pl1', daysAgo(54), 'tuck_planche', 10),
      workSession('fl2', daysAgo(10), 'tuck_front_lever', 30),
      workSession('pl2', daysAgo(8), 'tuck_planche', 30),
    ];
    const unlocks = [
      selfUnlock('tuck_front_lever', daysAgo(57)),
      selfUnlock('tuck_planche', daysAgo(57)),
    ];

    const straightArmOf = (plan: WorkoutPlan) =>
      planExercises(plan).filter((exercise) => node(exercise.nodeId).straightArm);

    it('keeps straight-arm working sets within the ~60 s budget', () => {
      const building = [
        workSession('fl1', daysAgo(56), 'tuck_front_lever', 10),
        workSession('pl1', daysAgo(54), 'tuck_planche', 10),
        workSession('fl2', daysAgo(10), 'tuck_front_lever', 20),
        workSession('pl2', daysAgo(8), 'tuck_planche', 20),
      ];
      const plan = generateWorkout(
        request({
          goals: ['tuck_front_lever', 'tuck_planche'],
          recentSessions: building,
          actions: unlocks,
        }),
      );
      const straight = straightArmOf(plan);
      expect(straight.length).toBeGreaterThan(0);
      expect(straight.some((exercise) => exercise.isTrial)).toBe(false);
      expect(straightArmSeconds(plan)).toBeGreaterThan(0);
      expect(straightArmSeconds(plan)).toBeLessThanOrEqual(STRAIGHT_ARM_SESSION_BUDGET_S);
      expect(plan.warnings.filter((warning) => warning.severity === 'warning')).toEqual([]);
    });

    it('suggests a due 3 × 30 s tuck planche Trial as the only straight-arm work (Trial day)', () => {
      const plan = generateWorkout(
        request({ goals: ['tuck_planche'], recentSessions: levers, actions: unlocks }),
      );
      const straight = straightArmOf(plan);
      expect(straight).toEqual([
        expect.objectContaining({
          nodeId: 'tuck_planche',
          isTrial: true,
          sets: 3,
          target: { value: 30 },
        }),
      ]);
      // tuck_front_lever is trainable and rested too, but not added on top of the Trial.
      expect(ids(plan)).not.toContain('tuck_front_lever');
      expect(straightArmSeconds(plan)).toBe(0); // the Trial's sets are exempt (ADR-025)
      expect(plan.notes.join(' ')).toContain('Trial day: Tuck planche');
      expect(plan.warnings.filter((warning) => warning.severity === 'warning')).toEqual([]);
    });

    it('suggests at most one straight-arm Trial per session', () => {
      const plan = generateWorkout(
        request({
          goals: ['tuck_front_lever', 'tuck_planche'],
          recentSessions: levers,
          actions: unlocks,
        }),
      );
      const straight = straightArmOf(plan);
      expect(straight).toHaveLength(1);
      expect(straight[0]).toMatchObject({ isTrial: true, sets: 3, target: { value: 30 } });
      expect(plan.notes.join(' ')).toContain('Trial day');
      expect(plan.warnings.filter((warning) => warning.severity === 'warning')).toEqual([]);
    });

    it('suggests no straight-arm work within 48 h of the last straight-arm session', () => {
      const recent = [...levers, workSession('fl3', NOW - 24 * MS_PER_HOUR, 'german_hang', 10)];
      const plan = generateWorkout(
        request({
          goals: ['tuck_front_lever', 'tuck_planche'],
          recentSessions: recent,
          actions: [...unlocks, selfUnlock('german_hang', daysAgo(57))],
        }),
      );
      expect(planExercises(plan).some((exercise) => node(exercise.nodeId).straightArm)).toBe(false);
      expect(plan.notes.join(' ')).toContain('No straight-arm work today');
    });

    it('suggests a straight-arm Trial only after the recommended weeks of training', () => {
      const history = (firstDaysAgo: number) => [
        workSession('s1', daysAgo(firstDaysAgo), 'straddle_front_lever', 15),
        workSession('s2', daysAgo(3), 'straddle_front_lever', 15),
      ];
      const make = (firstDaysAgo: number) =>
        generateWorkout(
          request({
            goals: ['straddle_front_lever'],
            recentSessions: history(firstDaysAgo),
            actions: [selfUnlock('straddle_front_lever', daysAgo(60))],
          }),
        );
      const early = planExercises(make(14)).find((e) => e.nodeId === 'straddle_front_lever');
      expect(early).toMatchObject({ target: { value: 15 } });
      expect(early?.isTrial).toBeUndefined();
      expect(make(14).notes.join(' ')).toContain('Trial is recommended in 28 days');

      const later = make(50);
      const trial = planExercises(later).find((e) => e.nodeId === 'straddle_front_lever');
      expect(trial).toMatchObject({ isTrial: true, sets: 3, target: { value: 15 } });
      expect(straightArmOf(later)).toHaveLength(1);
      expect(later.warnings.filter((warning) => warning.severity === 'warning')).toEqual([]);
    });
  });

  it('skips a pattern trained less than 48 h ago', () => {
    const recentSessions = [workSession('yesterday', NOW - 20 * MS_PER_HOUR, 'dead_hang', 20)];
    const plan = generateWorkout(request({ goals: ['strict_bar_muscle_up'], recentSessions }));
    const main = mainExercises(plan);
    expect(main.some((exercise) => node(exercise.nodeId).patterns.includes('vertical_pull'))).toBe(
      false,
    );
    expect(main.map((exercise) => exercise.nodeId)).toContain('support_hold');
    expect(plan.notes.join(' ')).toContain('Resting vertical pull');

    const later = generateWorkout(
      request({
        goals: ['strict_bar_muscle_up'],
        recentSessions: [workSession('before', NOW - 49 * MS_PER_HOUR, 'dead_hang', 20)],
      }),
    );
    expect(mainExercises(later).map((exercise) => exercise.nodeId)).toContain('dead_hang');
  });

  it('respects the time budget and fits more work into more time', () => {
    const counts = [30, 45, 60].map((availableMinutes) => {
      const plan = generateWorkout(
        request({
          goals: ['pull_up', 'pistol_squat'],
          recentSessions: INTERMEDIATE,
          availableMinutes,
        }),
      );
      const seconds = planExercises(plan).reduce((sum, e) => sum + exerciseSeconds(e), 0);
      expect(plan.estimatedMinutes).toBe(Math.ceil(seconds / 60));
      expect(plan.estimatedMinutes).toBeLessThanOrEqual(availableMinutes);
      return planExercises(plan).length;
    });
    expect(counts[0]).toBeLessThanOrEqual(counts[1]);
    expect(counts[1]).toBeLessThanOrEqual(counts[2]);
    expect(counts[2]).toBeGreaterThan(counts[0]);
  });

  it('pairs strength work with 90 s rest and rests ~3 min otherwise', () => {
    const plan = generateWorkout(request({ goals: ['pull_up'], recentSessions: INTERMEDIATE }));
    for (const block of plan.blocks) {
      const expected =
        block.kind === 'warm_up'
          ? WARM_UP_REST_SEC
          : block.kind === 'strength' && block.exercises.length === 2
            ? PAIR_REST_SEC
            : SINGLE_REST_SEC;
      for (const exercise of block.exercises) expect(exercise.restSec).toBe(expected);
    }
    expect(plan.blocks.some((b) => b.kind === 'strength' && b.exercises.length === 2)).toBe(true);
    for (const exercise of mainExercises(plan)) {
      expect(exercise.sets).toBeGreaterThanOrEqual(MIN_WORKING_SETS);
    }
  });

  it('is deterministic for the same inputs and seed', () => {
    const input = request({ goals: ['pull_up', 'l_sit'], recentSessions: INTERMEDIATE, seed: 7 });
    expect(generateWorkout(input)).toEqual(generateWorkout(input));
    const shuffled = { ...input, recentSessions: [...input.recentSessions].reverse() };
    expect(generateWorkout(shuffled)).toEqual(generateWorkout(input));
  });

  it('favours the weaker side of push and pull', () => {
    const pushHeavy = request({
      recentSessions: [
        testOutSession('push', daysAgo(30), [
          'push_up',
          'diamond_push_up',
          'archer_push_up',
          'support_hold',
          'dip_negative',
          'parallel_bar_dip',
          'dead_hang',
        ]),
      ],
    });
    const statuses = resolveTree(ALL_NODES, pushHeavy.progress);
    const plan = generateWorkout(pushHeavy);
    expect(plan.notes.join(' ')).toContain('pull work gets priority');
    const context: ScoreContext = {
      goalWeights: goalFrontier([], NODE_BY_ID, statuses),
      patternLast: new Map(),
      attributes: { push: 60, pull: 10, core: 0, legs: 0, balance: 0, mobility: 0 },
      now: NOW,
    };
    const pull = makeNode({ id: 'p', patterns: ['vertical_pull'] });
    const push = makeNode({ id: 'q', patterns: ['vertical_push'] });
    expect(scoreCandidate(pull, 'p', context)).toBeGreaterThan(scoreCandidate(push, 'q', context));
  });

  it('gives a stalled node priority and repeats its last performance', () => {
    const stalled = (id: string, days: number) =>
      makeSession(id, daysAgo(days), [
        { nodeId: 'pull_up', count: 3, prescribed: { value: 7 }, actual: { value: 6 } },
      ]);
    const recentSessions = [...INTERMEDIATE, stalled('a', 9), stalled('b', 6), stalled('c', 3)];
    const plan = generateWorkout(request({ goals: ['pull_up'], recentSessions }));
    expect(plan.notes.join(' ')).toContain('Pull-up has not improved in 3 sessions');
    expect(planExercises(plan).find((e) => e.nodeId === 'pull_up')?.target).toEqual({ value: 6 });
  });

  it('treats a self-unlocked node as trainable and attaches its prerequisite info', () => {
    const plan = generateWorkout(
      request({
        goals: ['tuck_front_lever'],
        actions: [selfUnlock('tuck_front_lever', daysAgo(1))],
      }),
    );
    expect(ids(plan)).toContain('tuck_front_lever');
    expect(plan.warnings).toContainEqual(
      expect.objectContaining({
        code: 'prerequisites_unmet',
        nodeId: 'tuck_front_lever',
        severity: 'info',
      }),
    );
  });
});
