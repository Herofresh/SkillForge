import { ALL_NODES } from '@/data/skills';
import { makeNode } from '@/data/testFixtures';
import { MS_PER_SECOND } from '@/lib/time';

import { HOME_EQUIPMENT } from './equipment';
import {
  generateWorkout,
  prescribeExercise,
  workoutWarnings,
  type WorkoutContext,
} from './generator';
import { recompute } from './recompute';
import {
  acknowledgeWarning,
  addExercise,
  addOptions,
  addSessionExercise,
  allAcknowledged,
  canMoveExercise,
  clearSetTimer,
  deleteSessionSet,
  editSessionSet,
  exerciseSets,
  finishedSession,
  isExerciseDone,
  logSessionSet,
  markedPerformance,
  moveExercise,
  nextOpenExercise,
  parseActiveSession,
  pauseSetTimer,
  planMinutes,
  projectedSets,
  removeExercise,
  replaceExercise,
  restSecondsLeft,
  selectExercise,
  sessionCounts,
  sessionPlan,
  setOutcome,
  skipExercise,
  skipRest,
  startSession,
  resumeSetTimer,
  startSetTimer,
  stopSetTimer,
  swapOptions,
  warningKey,
  type ActiveSession,
  type SessionPlan,
} from './train';
import type { PlannedExercise, WorkoutPlan } from './types';

const NOW = 1_790_000_000_000;

const exercise = (nodeId: string, overrides: Partial<PlannedExercise> = {}): PlannedExercise => ({
  nodeId,
  sets: 3,
  target: { value: 8 },
  metric: 'reps',
  restSec: 90,
  ...overrides,
});

/** Warm-up (1 set), a strength pair (3 + 3 sets) and core (2 sets). */
const WORKOUT: WorkoutPlan = {
  blocks: [
    { kind: 'warm_up', exercises: [exercise('wrist_prep', { sets: 1, restSec: 30 })] },
    { kind: 'strength', exercises: [exercise('pull_up'), exercise('squat')] },
    { kind: 'core', exercises: [exercise('hollow_hold', { sets: 2, metric: 'hold_s' })] },
  ],
  estimatedMinutes: 20,
  warnings: [],
  notes: ['a note'],
};

const plan = (): SessionPlan => sessionPlan(WORKOUT, 'home', 30);
const started = (): ActiveSession => startSession(plan(), 's1', NOW);

describe('session plan', () => {
  it('keys the exercises, links strength pairs and keeps the notes', () => {
    const result = plan();
    expect(result.exercises.map((e) => [e.key, e.block, e.pairKey])).toEqual([
      ['e0', 'warm_up', undefined],
      ['e1', 'strength', 'e2'],
      ['e2', 'strength', 'e1'],
      ['e3', 'core', undefined],
    ]);
    expect(result.notes).toEqual(['a note']);
    expect(result.nextKey).toBe(4);
    expect(result.acknowledged).toEqual([]);
  });

  it('estimates the minutes like the generator', () => {
    expect(planMinutes(plan().exercises)).toBeGreaterThan(0);
    expect(planMinutes([])).toBe(0);
  });

  it('removes an exercise and unpairs its partner', () => {
    const result = removeExercise(plan(), 'e1');
    expect(result.exercises.map((e) => e.key)).toEqual(['e0', 'e2', 'e3']);
    expect(result.exercises[1].pairKey).toBeUndefined();
  });

  it('replaces an exercise in place and remembers the first planned node', () => {
    const once = replaceExercise(plan(), 'e1', exercise('chin_up', { restSec: 180 }));
    expect(once.exercises[1]).toMatchObject({
      key: 'e1',
      nodeId: 'chin_up',
      block: 'strength',
      pairKey: 'e2',
      restSec: 90,
      swappedFrom: 'pull_up',
    });
    const twice = replaceExercise(once, 'e1', exercise('ring_row'));
    expect(twice.exercises[1].swappedFrom).toBe('pull_up');
    const back = replaceExercise(twice, 'e1', exercise('pull_up'));
    expect(back.exercises[1].swappedFrom).toBeUndefined();
  });

  it('drops the generator substitution note when swapped', () => {
    const substituted = sessionPlan(
      {
        ...WORKOUT,
        blocks: [{ kind: 'skill', exercises: [exercise('a', { substitutedFrom: 'b' })] }],
      },
      'home',
      30,
    );
    const swapped = replaceExercise(substituted, 'e0', exercise('c', { substitutedFrom: 'x' }));
    expect(swapped.exercises[0].substitutedFrom).toBeUndefined();
    expect(swapped.exercises[0].swappedFrom).toBe('a');
  });

  it('adds an exercise at the end with a new key', () => {
    const result = addExercise(plan(), exercise('dip'));
    expect(result.exercises[4]).toMatchObject({ key: 'e4', block: 'added', nodeId: 'dip' });
    expect(result.nextKey).toBe(5);
  });

  it('acknowledges warnings by key, once', () => {
    const warning = { code: 'straight_arm_rest', message: 'm', severity: 'warning' } as const;
    const key = warningKey(warning);
    expect(key).toBe('straight_arm_rest:');
    const once = acknowledgeWarning(plan(), key);
    expect(acknowledgeWarning(once, key)).toBe(once);
    expect(allAcknowledged([warning], once.acknowledged)).toBe(true);
    expect(allAcknowledged([warning], [])).toBe(false);
    expect(allAcknowledged([], [])).toBe(true);
  });
});

describe('swap and add options', () => {
  const nodes = [
    makeNode({ id: 'pull_up', patterns: ['vertical_pull'], ogLevel: 4, alternatives: ['far'] }),
    makeNode({ id: 'chin_up', patterns: ['vertical_pull'], ogLevel: 3 }),
    makeNode({ id: 'far', patterns: ['vertical_pull'], ogLevel: 9 }),
    makeNode({ id: 'no_bar', patterns: ['vertical_pull'], equipment: [['rings']] }),
    makeNode({
      id: 'locked',
      patterns: ['vertical_pull'],
      prerequisites: [{ nodeId: 'far', minLevel: 5, kind: 'hard' }],
    }),
    makeNode({ id: 'squat', patterns: ['squat'], equipment: [['floor']] }),
  ];
  const context = { nodes, progress: {}, equipment: HOME_EQUIPMENT };
  const onePlan = sessionPlan(
    { ...WORKOUT, blocks: [{ kind: 'strength', exercises: [exercise('pull_up')] }] },
    'home',
    30,
  );

  it('offers trainable, doable nodes of the same pattern, alternatives first', () => {
    expect(swapOptions(onePlan, 'e0', context).map((node) => node.id)).toEqual(['far', 'chin_up']);
  });

  it('offers nothing for an unknown key', () => {
    expect(swapOptions(onePlan, 'nope', context)).toEqual([]);
  });

  it('suggests trainable nodes not in the session, and finds locked ones by name', () => {
    expect(addOptions(onePlan, context).map((node) => node.id)).toEqual([
      'far',
      'chin_up',
      'squat',
    ]);
    expect(addOptions(onePlan, context, 'lock').map((node) => node.id)).toEqual(['locked']);
  });
});

describe('live session', () => {
  it('starts on the first exercise with no sets', () => {
    const session = started();
    expect(session).toMatchObject({ id: 's1', startedAt: NOW, currentKey: 'e0', sets: [] });
  });

  it('logs a set with the prescription, rests and moves on when the exercise is done', () => {
    const session = logSessionSet(started(), 'e0', { value: 8 }, NOW + 1);
    expect(session.sets).toEqual([
      expect.objectContaining({
        sessionId: 's1',
        nodeId: 'wrist_prep',
        setIndex: 0,
        prescribed: { value: 8 },
        actual: { value: 8 },
        isTrial: false,
        exerciseKey: 'e0',
      }),
    ]);
    expect(session.currentKey).toBe('e1');
    expect(session.restEndsAt).toBe(NOW + 1 + 30 * MS_PER_SECOND);
    expect(restSecondsLeft(session, NOW + 1 + 10 * MS_PER_SECOND)).toBe(20);
    expect(restSecondsLeft(skipRest(session), NOW)).toBe(0);
  });

  it('alternates the sets of a strength pair', () => {
    let session = selectExercise(started(), 'e1');
    session = logSessionSet(session, 'e1', { value: 8 }, NOW);
    expect(session.currentKey).toBe('e2');
    session = logSessionSet(session, 'e2', { value: 8 }, NOW);
    expect(session.currentKey).toBe('e1');
  });

  it('skips an exercise, moves on and un-skips it when a set is logged', () => {
    const skipped = skipExercise(started(), 'e0');
    expect(skipped.currentKey).toBe('e1');
    expect(skipped.exercises[0].skipped).toBe(true);
    const logged = logSessionSet(skipped, 'e0', { value: 8 }, NOW);
    expect(logged.exercises[0].skipped).toBeUndefined();
  });

  it('has no current exercise and no rest once everything is done', () => {
    let session = started();
    for (const key of ['e1', 'e2', 'e3']) session = skipExercise(session, key);
    session = logSessionSet(session, 'e0', { value: 8 }, NOW);
    expect(session.currentKey).toBeUndefined();
    expect(session.restEndsAt).toBeUndefined();
    expect(nextOpenExercise(session)).toBeUndefined();
    const added = addSessionExercise(session, exercise('dip'));
    expect(added.currentKey).toBe('e4');
  });

  it('ignores a set for an unknown exercise', () => {
    const session = started();
    expect(logSessionSet(session, 'nope', { value: 1 }, NOW)).toBe(session);
    expect(selectExercise(session, 'nope')).toBe(session);
  });

  it('counts sets and exercises', () => {
    let session = logSessionSet(started(), 'e0', { value: 8 }, NOW);
    session = skipExercise(session, 'e3');
    expect(sessionCounts(session)).toEqual({
      setsLogged: 1,
      setsPlanned: 7,
      exercisesDone: 2,
      exercises: 4,
    });
  });

  it('projects the logged plus the remaining sets', () => {
    let session = logSessionSet(started(), 'e0', { value: 5 }, NOW);
    session = skipExercise(session, 'e3');
    const sets = projectedSets(session, NOW);
    expect(sets).toHaveLength(7);
    expect(sets[0].actual).toEqual({ value: 5 });
    expect(sets.map((set) => set.setIndex)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('finishes into a session: missing sets of started exercises are logged as skipped', () => {
    let session = logSessionSet(started(), 'e0', { value: 8 }, NOW);
    session = logSessionSet(session, 'e1', { value: 6 }, NOW + 1);
    const logged = finishedSession(session, NOW + 2);
    expect(logged.id).toBe('s1');
    expect(logged.startedAt).toBe(NOW);
    expect(logged.sets.map((set) => [set.nodeId, set.actual.value, set.setIndex])).toEqual([
      ['wrist_prep', 8, 0],
      ['pull_up', 6, 1],
      ['pull_up', 0, 2],
      ['pull_up', 0, 3],
    ]);
    expect(logged.sets.every((set) => set.sessionId === 's1')).toBe(true);
    expect('exerciseKey' in logged.sets[0]).toBe(false);
  });

  it('finishes into an empty session when nothing was logged', () => {
    expect(finishedSession(started(), NOW).sets).toEqual([]);
  });
});

describe('set marks', () => {
  it('logs done as entered and failed as 0', () => {
    expect(markedPerformance('reps', 'done', { value: 9 }, { value: 8 })).toEqual({ value: 9 });
    expect(markedPerformance('reps', 'failed', { value: 9 }, { value: 8 })).toEqual({ value: 0 });
  });

  it('logs partial below the target', () => {
    expect(markedPerformance('reps', 'partial', { value: 5 }, { value: 8 })).toEqual({ value: 5 });
    expect(markedPerformance('reps', 'partial', { value: 8 }, { value: 8 })).toEqual({ value: 7 });
    expect(markedPerformance('hold_s', 'partial', { value: 30 }, { value: 30 })).toEqual({
      value: 25,
    });
    expect(
      markedPerformance('eccentric_s', 'partial', { value: 5, reps: 3 }, { value: 5, reps: 3 }),
    ).toEqual({ value: 5, reps: 2 });
    expect(markedPerformance('reps', 'partial', { value: 1 }, { value: 1 })).toEqual({ value: 0 });
  });

  it('judges a logged set like an exercise', () => {
    const session = logSessionSet(started(), 'e0', { value: 5 }, NOW);
    expect(setOutcome(session.sets[0])).toBe('partial');
    expect(exerciseSets(session, 'e0')).toHaveLength(1);
  });
});

describe('exercise timer (PLAN 5.4)', () => {
  const S = MS_PER_SECOND;

  it('starts for an exercise and ends the rest countdown', () => {
    const resting = logSessionSet(started(), 'e0', { value: 8 }, NOW);
    expect(resting.restEndsAt).toBeDefined();
    const timed = startSetTimer(resting, 'e1', NOW + S);
    expect(timed.restEndsAt).toBeUndefined();
    expect(timed.timer).toEqual({ exerciseKey: 'e1', startedAt: NOW + S });
    expect(startSetTimer(resting, 'nope', NOW)).toBe(resting);
  });

  it('gives the logged set the stopwatch time and clears the timer', () => {
    const running = startSetTimer(started(), 'e0', NOW);
    const stopped = stopSetTimer(running, NOW + 42.6 * S);
    expect(stopped.timer?.stoppedAt).toBe(NOW + 42.6 * S);
    expect(stopSetTimer(stopped, NOW + 99 * S)).toBe(stopped);
    const logged = logSessionSet(stopped, 'e0', { value: 8 }, NOW + 50 * S);
    expect(logged.sets[0].durationSec).toBe(42);
    expect(logged.timer).toBeUndefined();
  });

  it('measures a still running timer until the set is logged', () => {
    const running = startSetTimer(started(), 'e0', NOW);
    expect(logSessionSet(running, 'e0', { value: 8 }, NOW + 20 * S).sets[0].durationSec).toBe(20);
  });

  it('measures a hold as the seconds held after the get-ready time', () => {
    const session = selectExercise(started(), 'e3');
    const stopped = stopSetTimer(startSetTimer(session, 'e3', NOW), NOW + 40 * S);
    const logged = logSessionSet(stopped, 'e3', { value: 37 }, NOW + 41 * S);
    expect(logged.sets[0]).toMatchObject({ metric: 'hold_s', durationSec: 37 });
  });

  it('logs untimed sets without a duration and drops another exercise timer', () => {
    const plain = logSessionSet(started(), 'e0', { value: 8 }, NOW);
    expect(plain.sets[0]).not.toHaveProperty('durationSec');
    const other = logSessionSet(startSetTimer(started(), 'e1', NOW), 'e0', { value: 8 }, NOW);
    expect(other.sets[0]).not.toHaveProperty('durationSec');
    expect(other.timer).toBeUndefined();
  });

  it('is cleared by reset, by skipping its exercise and by switching to another one', () => {
    const running = startSetTimer(started(), 'e0', NOW);
    expect(clearSetTimer(running).timer).toBeUndefined();
    expect(skipExercise(running, 'e0').timer).toBeUndefined();
    expect(skipExercise(running, 'e2').timer).toBeDefined();
    expect(selectExercise(running, 'e1').timer).toBeUndefined();
    expect(selectExercise(running, 'e0').timer).toBeDefined();
  });

  it('keeps the timer in the stored draft', () => {
    const running = startSetTimer(started(), 'e0', NOW);
    expect(parseActiveSession(JSON.parse(JSON.stringify(running)))).toEqual(running);
  });

  it('pauses and resumes; the stored draft keeps the pause and the paused time (PLAN 5.8)', () => {
    const running = startSetTimer(started(), 'e0', NOW);
    const paused = pauseSetTimer(running, NOW + 10 * S);
    expect(paused.timer).toEqual({ exerciseKey: 'e0', startedAt: NOW, pausedAt: NOW + 10 * S });
    expect(pauseSetTimer(paused, NOW + 20 * S)).toBe(paused);
    expect(parseActiveSession(JSON.parse(JSON.stringify(paused)))).toEqual(paused);

    const resumed = resumeSetTimer(paused, NOW + 70 * S);
    expect(resumed.timer).toEqual({ exerciseKey: 'e0', startedAt: NOW, pausedMs: 60 * S });
    expect(resumeSetTimer(resumed, NOW + 80 * S)).toBe(resumed);
    expect(parseActiveSession(JSON.parse(JSON.stringify(resumed)))).toEqual(resumed);
    const logged = logSessionSet(resumed, 'e0', { value: 8 }, NOW + 95 * S);
    expect(logged.sets[0].durationSec).toBe(35);
  });

  it('logs a paused timer up to its pause, and stops it there', () => {
    const paused = pauseSetTimer(startSetTimer(started(), 'e0', NOW), NOW + 25 * S);
    expect(logSessionSet(paused, 'e0', { value: 8 }, NOW + 90 * S).sets[0].durationSec).toBe(25);
    expect(stopSetTimer(paused, NOW + 90 * S).timer).toEqual({
      exerciseKey: 'e0',
      startedAt: NOW,
      stoppedAt: NOW + 25 * S,
    });
  });

  it('ignores pause and resume without a timer', () => {
    const session = started();
    expect(pauseSetTimer(session, NOW)).toBe(session);
    expect(resumeSetTimer(session, NOW)).toBe(session);
  });
});

describe('reorder exercises (PLAN 5.9)', () => {
  const keys = (session: SessionPlan) => session.exercises.map((entry) => entry.key);

  it('moves a single exercise past its neighbour and a strength pair as one', () => {
    // e0 warm-up · [e1 e2] strength pair · e3 core
    const session = started();
    expect(keys(moveExercise(session, 'e3', -1))).toEqual(['e0', 'e3', 'e1', 'e2']);
    expect(keys(moveExercise(session, 'e0', 1))).toEqual(['e1', 'e2', 'e0', 'e3']);
    expect(keys(moveExercise(session, 'e2', -1))).toEqual(['e1', 'e2', 'e0', 'e3']);
    expect(keys(moveExercise(session, 'e1', 1))).toEqual(['e0', 'e3', 'e1', 'e2']);
  });

  it('keeps the pair links, the logged sets and the current exercise', () => {
    const session = logSessionSet(started(), 'e0', { value: 8 }, NOW);
    const moved = moveExercise(session, 'e1', 1);
    expect(moved.exercises.find((entry) => entry.key === 'e1')?.pairKey).toBe('e2');
    expect(moved.sets).toBe(session.sets);
    expect(moved.currentKey).toBe(session.currentKey);
  });

  it('does nothing at the ends or for an unknown key', () => {
    const session = started();
    expect(moveExercise(session, 'e0', -1)).toBe(session);
    expect(moveExercise(session, 'e3', 1)).toBe(session);
    expect(moveExercise(session, 'e2', 1)).not.toBe(session);
    expect(moveExercise(session, 'nope', 1)).toBe(session);
    expect(canMoveExercise(session, 'e1', -1)).toBe(true);
    expect(canMoveExercise(session, 'e3', 1)).toBe(false);
  });

  it('moves the former partner alone once the pair is split', () => {
    const unpaired = removeExercise(started(), 'e1');
    expect(keys(moveExercise(unpaired, 'e2', -1))).toEqual(['e2', 'e0', 'e3']);
  });

  it('changes which exercise comes next', () => {
    let session = moveExercise(started(), 'e3', -1);
    session = logSessionSet(session, 'e0', { value: 8 }, NOW);
    expect(session.currentKey).toBe('e3');
  });
});

describe('edit and delete a logged set (PLAN 5.9)', () => {
  /** e0 logged once, then a strength pair set each: setIndex 0 (e0), 1 (e1), 2 (e2). */
  const logged = (): ActiveSession => {
    let session = logSessionSet(started(), 'e0', { value: 8 }, NOW);
    session = startSetTimer(session, 'e1', NOW);
    session = logSessionSet(session, 'e1', { value: 7 }, NOW + 20 * MS_PER_SECOND);
    return logSessionSet(session, 'e2', { value: 6 }, NOW + 40 * MS_PER_SECOND);
  };

  it('changes only the result and keeps the prescription, time stamp and duration', () => {
    const session = logged();
    const edited = editSessionSet(session, 1, { value: 9 });
    expect(edited.sets[1]).toEqual({ ...session.sets[1], actual: { value: 9 } });
    expect(edited.sets[1].durationSec).toBe(20);
    expect(edited.sets[0]).toBe(session.sets[0]);
    expect(edited.currentKey).toBe(session.currentKey);
    expect(editSessionSet(session, 7, { value: 1 })).toBe(session);
  });

  it('keeps setIndex dense and in logging order after a delete', () => {
    const session = deleteSessionSet(logged(), 1);
    expect(session.sets.map((set) => [set.exerciseKey, set.setIndex])).toEqual([
      ['e0', 0],
      ['e2', 1],
    ]);
    expect(sessionCounts(session).setsLogged).toBe(2);
    // e1 has no set left, so it is not trained; e2 gets its two missing sets as skipped.
    expect(finishedSession(session, NOW).sets.map((set) => [set.nodeId, set.setIndex])).toEqual([
      ['wrist_prep', 0],
      ['squat', 1],
      ['squat', 2],
      ['squat', 3],
    ]);
    // Logging after the delete appends at the next position.
    const next = logSessionSet(session, 'e1', { value: 8 }, NOW);
    expect(next.sets.map((set) => set.setIndex)).toEqual([0, 1, 2]);
    expect(deleteSessionSet(session, 5)).toBe(session);
  });

  it('opens a done exercise again and makes it current when nothing else is open', () => {
    let session = started();
    for (const key of ['e1', 'e2', 'e3']) session = skipExercise(session, key);
    session = logSessionSet(session, 'e0', { value: 8 }, NOW);
    expect(session.currentKey).toBeUndefined();
    const reopened = deleteSessionSet(session, 0);
    expect(reopened.currentKey).toBe('e0');
    expect(isExerciseDone(reopened, reopened.exercises[0])).toBe(false);
  });

  it('keeps the current exercise, rest and timer of the ongoing set', () => {
    const session = startSetTimer(logged(), 'e1', NOW + 50 * MS_PER_SECOND);
    const deleted = deleteSessionSet(session, 0);
    expect(deleted.currentKey).toBe(session.currentKey);
    expect(deleted.timer).toEqual(session.timer);
  });

  it('works on a draft from before 5.9 (read back as stored)', () => {
    const old = parseActiveSession(JSON.parse(JSON.stringify(logged())));
    if (!old) throw new Error('expected a draft');
    const changed = moveExercise(
      deleteSessionSet(editSessionSet(old, 0, { value: 3 }), 2),
      'e3',
      -1,
    );
    expect(parseActiveSession(JSON.parse(JSON.stringify(changed)))).toEqual(changed);
  });
});

describe('stored draft', () => {
  it('reads back what it wrote', () => {
    const session = logSessionSet(started(), 'e0', { value: 8 }, NOW);
    expect(parseActiveSession(JSON.parse(JSON.stringify(session)))).toEqual(session);
  });

  it('rejects data of the wrong shape', () => {
    expect(parseActiveSession(undefined)).toBeUndefined();
    expect(parseActiveSession({ ...started(), id: 3 })).toBeUndefined();
    expect(
      parseActiveSession({ ...started(), exercises: [{ ...plan().exercises[0], block: 'x' }] }),
    ).toBeUndefined();
    expect(parseActiveSession({ ...started(), sets: [{ nodeId: 'a' }] })).toBeUndefined();
    expect(parseActiveSession({ ...started(), restEndsAt: 'soon' })).toBeUndefined();
    expect(parseActiveSession({ ...started(), timer: { exerciseKey: 'e0' } })).toBeUndefined();
    expect(
      parseActiveSession({
        ...started(),
        timer: { exerciseKey: 'e0', startedAt: NOW, pausedAt: 'later' },
      }),
    ).toBeUndefined();
    expect(
      parseActiveSession({
        ...started(),
        timer: { exerciseKey: 'e0', startedAt: NOW, pausedMs: '5' },
      }),
    ).toBeUndefined();
    const logged = logSessionSet(started(), 'e0', { value: 8 }, NOW);
    expect(
      parseActiveSession({ ...logged, sets: [{ ...logged.sets[0], durationSec: '1:00' }] }),
    ).toBeUndefined();
  });

  it('reads a draft from before the exercise timer (no timer, no durations)', () => {
    const old = JSON.parse(JSON.stringify(logSessionSet(started(), 'e0', { value: 8 }, NOW)));
    expect(old).not.toHaveProperty('timer');
    expect(old.sets[0]).not.toHaveProperty('durationSec');
    expect(parseActiveSession(old)).toEqual(old);
  });

  it('reads a draft whose timer is from before the pause (5.4 shape)', () => {
    const old = JSON.parse(JSON.stringify(startSetTimer(started(), 'e0', NOW)));
    expect(old.timer).toEqual({ exerciseKey: 'e0', startedAt: NOW });
    expect(parseActiveSession(old)).toEqual(old);
    expect(pauseSetTimer(old, NOW + MS_PER_SECOND).timer?.pausedAt).toBe(NOW + MS_PER_SECOND);
  });
});

describe('generator helpers for edited sessions (real tree)', () => {
  const context: WorkoutContext = {
    nodes: ALL_NODES,
    progress: {},
    recentSessions: [],
    now: NOW,
  };

  it('prescribes a node on its own from its last working sets', () => {
    const node = ALL_NODES.find((entry) => entry.id === 'wall_push_up');
    if (!node) throw new Error('fixture');
    expect(prescribeExercise(node, context)).toEqual({
      nodeId: 'wall_push_up',
      sets: 3,
      target: { value: node.workingRange.min },
      metric: 'reps',
      restSec: 180,
    });
    const history = [
      {
        id: 'h',
        startedAt: NOW - 1000,
        sets: [0, 1, 2].map((setIndex) => ({
          sessionId: 'h',
          nodeId: node.id,
          setIndex,
          metric: node.metric,
          prescribed: { value: node.workingRange.min },
          actual: { value: node.workingRange.min },
          isTrial: false,
          timestamp: NOW - 1000,
        })),
      },
    ];
    const progress = recompute(ALL_NODES, history, []).state.progress;
    expect(
      prescribeExercise(node, { ...context, progress, recentSessions: history }, 90).target,
    ).toEqual({ value: node.workingRange.min + 1 });
  });

  it('warns about straight-arm work the user adds over the budget', () => {
    const plan = generateWorkout({
      ...context,
      goals: [],
      equipment: HOME_EQUIPMENT,
      availableMinutes: 30,
      seed: 0,
    });
    expect(plan.warnings).toEqual([]);
    const lean = ALL_NODES.find((entry) => entry.id === 'planche_lean');
    if (!lean) throw new Error('fixture');
    let session = startSession(sessionPlan(plan, 'home', 30), 's', NOW);
    session = addSessionExercise(session, {
      ...prescribeExercise(lean, context),
      sets: 5,
      target: { value: 30 },
    });
    const warnings = workoutWarnings(session.exercises, projectedSets(session, NOW), context);
    expect(warnings.map((warning) => warning.code)).toContain('straight_arm_budget');
  });
});
