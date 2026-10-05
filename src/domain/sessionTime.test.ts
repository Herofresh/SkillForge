import { NODE_BY_ID } from '@/data/skills';
import {
  DEFAULT_REST_PACE,
  estimateMinutes,
  exerciseSeconds,
  PACE_MAX,
  PACE_MIN,
  PACE_SESSIONS,
  PAIR_REST_SEC,
  restPace,
  SECONDS_PER_REP,
  SINGLE_REST_SEC,
  TRANSITION_SEC,
} from '@/domain/sessionTime';
import type { LoggedSession, LoggedSet, PlannedExercise } from '@/domain/types';
import { MS_PER_DAY, MS_PER_SECOND } from '@/lib/time';

const NOW = Date.UTC(2026, 8, 27, 9);
const REPS = 5;
/** Work of one logged set below: 5 reps. */
const WORK_SEC = REPS * SECONDS_PER_REP;

/**
 * A session at `daysAgo` whose sets (node ids in logging order) are each logged `restSec` + the
 * set's work after the one before.
 */
function session(id: string, daysAgo: number, nodeIds: readonly string[], restSec: number) {
  const startedAt = NOW - daysAgo * MS_PER_DAY;
  const sets: LoggedSet[] = nodeIds.map((nodeId, setIndex) => ({
    sessionId: id,
    nodeId,
    setIndex,
    metric: 'reps',
    prescribed: { value: REPS },
    actual: { value: REPS },
    isTrial: false,
    timestamp: startedAt + setIndex * (restSec + WORK_SEC) * MS_PER_SECOND,
  }));
  return { id, startedAt, sets } satisfies LoggedSession;
}

const single = (restSec: number, id = 's', daysAgo = 1) =>
  session(
    id,
    daysAgo,
    ['pike_push_up', 'pike_push_up', 'pike_push_up', 'pike_push_up', 'pike_push_up'],
    restSec,
  );

describe('time estimate', () => {
  const exercise: PlannedExercise = {
    nodeId: 'pike_push_up',
    sets: 3,
    target: { value: REPS },
    metric: 'reps',
    restSec: PAIR_REST_SEC,
  };

  it('counts setup, work and rest, the rest at the pace', () => {
    expect(exerciseSeconds(exercise)).toBe(TRANSITION_SEC + 3 * (WORK_SEC + PAIR_REST_SEC));
    expect(exerciseSeconds(exercise, 0.5)).toBe(
      TRANSITION_SEC + 3 * (WORK_SEC + PAIR_REST_SEC / 2),
    );
    expect(estimateMinutes([exercise, exercise])).toBe(
      Math.ceil((2 * exerciseSeconds(exercise)) / 60),
    );
  });
});

describe('restPace', () => {
  it('is the prescribed rest without history or with too few measured rests', () => {
    expect(restPace([], NODE_BY_ID)).toBe(DEFAULT_REST_PACE);
    const short = session('short', 1, ['pike_push_up', 'pike_push_up', 'pike_push_up'], 10);
    expect(restPace([short], NODE_BY_ID)).toBe(DEFAULT_REST_PACE);
  });

  it('measures rests between sets of one exercise against the single rest', () => {
    expect(restPace([single(SINGLE_REST_SEC)], NODE_BY_ID)).toBeCloseTo(1);
    expect(restPace([single(SINGLE_REST_SEC / 2)], NODE_BY_ID)).toBeCloseTo(0.5);
  });

  it('measures alternating pair sets against the pair rest', () => {
    const pair = session(
      'pair',
      1,
      ['pull_up', 'squat', 'pull_up', 'squat', 'pull_up', 'squat'],
      PAIR_REST_SEC / 2,
    );
    expect(restPace([pair], NODE_BY_ID)).toBeCloseTo(0.5);
  });

  it('ignores changes of exercise and mobility work', () => {
    const mixed = session(
      'mixed',
      1,
      ['wrist_prep', 'shoulder_dislocate', 'hip_cars', 'hip_cars', 'hip_cars', 'hip_cars', 'squat'],
      5,
    );
    expect(NODE_BY_ID.get('hip_cars')?.patterns).toContain('mobility');
    expect(restPace([mixed, single(SINGLE_REST_SEC)], NODE_BY_ID)).toBeCloseTo(1);
  });

  it('subtracts a timed set’s measured duration as its work', () => {
    const timed = single(SINGLE_REST_SEC);
    // The sets took 60 s each instead of the estimated 15 s, so the rest was 45 s shorter.
    const sets = timed.sets.map((set) => ({ ...set, durationSec: 60 }));
    expect(restPace([{ ...timed, sets }], NODE_BY_ID)).toBeCloseTo(
      (SINGLE_REST_SEC - 45) / SINGLE_REST_SEC,
    );
  });

  it('is the median, kept inside its bounds', () => {
    expect(restPace([single(0)], NODE_BY_ID)).toBe(PACE_MIN);
    expect(restPace([single(SINGLE_REST_SEC * 3)], NODE_BY_ID)).toBe(PACE_MAX);
    const outlier = single(SINGLE_REST_SEC * 3, 'phone call', 2);
    const sessions = [
      single(SINGLE_REST_SEC / 2, 'a', 1),
      single(SINGLE_REST_SEC / 2, 'b', 3),
      outlier,
    ];
    expect(restPace(sessions, NODE_BY_ID)).toBeCloseTo(0.5);
  });

  it(`only reads the latest ${PACE_SESSIONS} measured sessions`, () => {
    const old = Array.from({ length: PACE_SESSIONS + 3 }, (_, index) =>
      single(SINGLE_REST_SEC, `old${index}`, 20 + index),
    );
    const recent = Array.from({ length: PACE_SESSIONS }, (_, index) =>
      single(SINGLE_REST_SEC / 4, `new${index}`, 1 + index),
    );
    expect(restPace([...old, ...recent], NODE_BY_ID)).toBeCloseTo(0.25);
  });
});
