import { HERO_CLASSES } from '@/data/classes';
import { makeChain, makeNode, makeSession, makeSet } from '@/data/testFixtures';
import { localWeekBounds, MS_PER_HOUR } from '@/lib/time';

import {
  advanceChallenge,
  challengeContribution,
  challengePinsToRaw,
  challengeProgress,
  challengeView,
  classChallenge,
  parseChallengePins,
  pinAt,
  pinWeek,
  weeklyChallenge,
  weeklyChallenges,
  type ChallengePin,
} from './challenges';
import { applySession, INITIAL_ENGINE_STATE, recompute, type EngineState } from './recompute';
import type {
  ChallengeGoal,
  ClassDefinition,
  ExerciseNode,
  LoggedSession,
  NodeLookup,
  WeeklyChallenge,
} from './types';
import { CLASS_CHALLENGE_BONUS_XP } from './xp';

/** Monday 21 September 2026, 12:00 local time. */
const MONDAY = new Date(2026, 8, 21, 12).getTime();
const day = (n: number, hour = 12): number => new Date(2026, 8, 21 + n, hour).getTime();

const NODES: ExerciseNode[] = [
  ...makeChain(), // dead_hang, pull_up_negative, pull_up: pull
  makeNode({ id: 'push_up', branch: 'h_push', patterns: ['horizontal_push'] }),
  makeNode({ id: 'pike_stretch', branch: 'flexibility', patterns: ['mobility'] }),
  makeNode({ id: 'hip_opener', branch: 'flexibility', patterns: ['mobility'] }),
  makeNode({ id: 'hollow_hold', branch: 'core', patterns: ['core'] }),
  makeNode({
    id: 'tuck_front_lever',
    branch: 'front_lever',
    patterns: ['straight_arm_pull'],
    straightArm: true,
  }),
];
const LOOKUP: NodeLookup = new Map(NODES.map((node) => [node.id, node]));

const train = (id: string, at: number, ...nodeIds: string[]): LoggedSession =>
  makeSession(
    id,
    at,
    nodeIds.map((nodeId) => ({ nodeId, count: 2 })),
  );

const PULL: ChallengeGoal = { kind: 'sessions_training', attributes: ['pull'] };

/** Classes with a challenge, like the data's (one to switch to). */
const CLASSES: ClassDefinition[] = [
  {
    id: 'recruit',
    name: 'Recruit',
    tiers: [{ name: 'Recruit', rule: { kind: 'start' } }],
    challenge: { goal: { kind: 'sessions' }, targets: [2] },
  },
  {
    id: 'ranger',
    name: 'Ranger',
    tiers: [
      { name: 'Ranger', rule: { kind: 'sessions', count: 1 } },
      { name: 'Pathfinder', rule: { kind: 'sessions', count: 2 } },
      { name: 'Warden', rule: { kind: 'sessions', count: 3 } },
    ],
    challenge: { goal: PULL, targets: [2, 3, 3] },
  },
  { id: 'plain', name: 'Plain', tiers: [{ name: 'Plain', rule: { kind: 'sessions', count: 1 } }] },
];

describe('localWeekBounds', () => {
  it('runs from Monday 00:00 to the next Monday 00:00', () => {
    const { start, end } = localWeekBounds(day(2));
    expect(new Date(start)).toEqual(new Date(2026, 8, 21, 0, 0, 0, 0));
    expect(new Date(end)).toEqual(new Date(2026, 8, 28, 0, 0, 0, 0));
  });

  it('puts Sunday 23:59 in the week before and Monday 00:00 in the new one', () => {
    const sunday = new Date(2026, 8, 27, 23, 59, 59, 999).getTime();
    const nextMonday = new Date(2026, 8, 28, 0, 0).getTime();
    expect(localWeekBounds(sunday).start).toBe(new Date(2026, 8, 21).getTime());
    expect(localWeekBounds(nextMonday).start).toBe(nextMonday);
    expect(localWeekBounds(sunday).end).toBe(localWeekBounds(nextMonday).start);
  });

  /**
   * The EU clock-change weeks of 2026. Assigning `process.env.TZ` at runtime is not reliable in
   * Jest workers (CI runs in UTC), so the expected length comes from the zone's own offsets: 168 h
   * plus the hour the clock changed by. In a zone with DST (e.g. Europe/Vienna, where the app is
   * developed) that is 167 and 169 h; in UTC both are 168 h.
   */
  it.each([
    ['spring', new Date(2026, 2, 29, 12), 23],
    ['autumn', new Date(2026, 9, 25, 12), 19],
  ])('the %s clock-change week runs Monday 00:00 to Monday 00:00', (_name, sunday, mondayDate) => {
    const { start, end } = localWeekBounds(sunday.getTime());
    const startDate = new Date(start);
    const endDate = new Date(end);
    expect([startDate.getDate(), startDate.getDay(), startDate.getHours()]).toEqual([
      mondayDate,
      1,
      0,
    ]);
    expect([endDate.getDay(), endDate.getHours(), endDate.getMinutes()]).toEqual([1, 0, 0]);
    const shiftHours = (endDate.getTimezoneOffset() - startDate.getTimezoneOffset()) / 60;
    expect((end - start) / MS_PER_HOUR).toBe(168 + shiftHours);
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Vienna') {
      expect((end - start) / MS_PER_HOUR).toBe(mondayDate === 23 ? 167 : 169);
    }
  });
});

describe('classChallenge', () => {
  it('takes the target of the tier, tier I below 1, the last one beyond the list', () => {
    const ranger = CLASSES[1];
    expect(classChallenge(ranger, 0)).toEqual({ goal: PULL, target: 2 });
    expect(classChallenge(ranger, 1)?.target).toBe(2);
    expect(classChallenge(ranger, 2)?.target).toBe(3);
    expect(classChallenge(ranger, 9)?.target).toBe(3);
    expect(classChallenge(CLASSES[2], 1)).toBeUndefined();
  });

  it('dates a challenge to the calendar week', () => {
    expect(weeklyChallenge(CLASSES[1], 1, day(3))).toEqual({
      ...localWeekBounds(MONDAY),
      goal: PULL,
      target: 2,
    });
  });
});

describe('challengeContribution', () => {
  it('counts sessions, complete sessions, attributes, exercises and Trials', () => {
    const session = makeSession('s', MONDAY, [
      { nodeId: 'pull_up', count: 2 },
      { nodeId: 'pike_stretch', count: 1 },
      { nodeId: 'hip_opener', count: 1, isTrial: true },
    ]);
    expect(challengeContribution({ kind: 'sessions' }, session, LOOKUP)).toBe(1);
    expect(challengeContribution({ kind: 'complete_sessions' }, session, LOOKUP)).toBe(1);
    expect(challengeContribution(PULL, session, LOOKUP)).toBe(1);
    const pushPull: ChallengeGoal = { kind: 'sessions_training', attributes: ['push', 'pull'] };
    expect(challengeContribution(pushPull, session, LOOKUP)).toBe(0);
    const mobility: ChallengeGoal = { kind: 'exercises_training', attribute: 'mobility' };
    expect(challengeContribution(mobility, session, LOOKUP)).toBe(2);
    expect(challengeContribution({ kind: 'trial_attempts' }, session, LOOKUP)).toBe(1);
  });

  it('never counts straight-arm work, skipped sets or unknown nodes', () => {
    const lever = makeSession('lever', MONDAY, [
      { nodeId: 'tuck_front_lever', count: 3, metric: 'hold_s', isTrial: true },
    ]);
    expect(challengeContribution(PULL, lever, LOOKUP)).toBe(0);
    expect(challengeContribution({ kind: 'sessions' }, lever, LOOKUP)).toBe(0);
    expect(challengeContribution({ kind: 'trial_attempts' }, lever, LOOKUP)).toBe(0);

    const skipped = makeSession('skipped', MONDAY, [
      { nodeId: 'pull_up', count: 2, actual: { value: 0 } },
      { nodeId: 'unknown_node', count: 2 },
    ]);
    expect(challengeContribution({ kind: 'sessions' }, skipped, LOOKUP)).toBe(0);
  });

  it('a session with a skipped set is not complete', () => {
    const session: LoggedSession = {
      id: 's',
      startedAt: MONDAY,
      sets: [
        makeSet({ sessionId: 's', nodeId: 'pull_up', setIndex: 0 }),
        makeSet({ sessionId: 's', nodeId: 'pull_up', setIndex: 1, actual: { value: 0 } }),
      ],
    };
    expect(challengeContribution({ kind: 'complete_sessions' }, session, LOOKUP)).toBe(0);
    expect(challengeContribution({ kind: 'sessions' }, session, LOOKUP)).toBe(1);
  });

  it('a skipped straight-arm set does not make a session incomplete (regression)', () => {
    const session: LoggedSession = {
      id: 's',
      startedAt: MONDAY,
      sets: [
        makeSet({ sessionId: 's', nodeId: 'pull_up', setIndex: 0 }),
        makeSet({
          sessionId: 's',
          nodeId: 'tuck_front_lever',
          setIndex: 1,
          metric: 'hold_s',
          prescribed: { value: 10 },
          actual: { value: 0 },
        }),
      ],
    };
    expect(challengeContribution({ kind: 'complete_sessions' }, session, LOOKUP)).toBe(1);
  });
});

describe('advanceChallenge', () => {
  const week: WeeklyChallenge = { ...localWeekBounds(MONDAY), goal: PULL, target: 2 };

  it('completes once, on the session that reaches the target', () => {
    const first = advanceChallenge(undefined, [week], train('a', day(0), 'pull_up'), LOOKUP);
    expect(first.step).toMatchObject({ gained: 1, count: 1, target: 2, completed: false });
    const second = advanceChallenge(first.tally, [week], train('b', day(2), 'pull_up'), LOOKUP);
    expect(second.step).toMatchObject({ count: 2, completed: true });
    const third = advanceChallenge(second.tally, [week], train('c', day(4), 'pull_up'), LOOKUP);
    expect(third.step).toMatchObject({ count: 3, completed: false });
  });

  it('starts again in a new window and keeps the tally without a challenge', () => {
    const next: WeeklyChallenge = { ...localWeekBounds(day(7)), goal: PULL, target: 2 };
    const first = advanceChallenge(undefined, [week, next], train('a', day(0), 'pull_up'), LOOKUP);
    const later = advanceChallenge(
      first.tally,
      [week, next],
      train('b', day(8), 'pull_up'),
      LOOKUP,
    );
    expect(later.step).toMatchObject({ start: next.start, count: 1 });
    const none = advanceChallenge(first.tally, [week], train('c', day(15), 'pull_up'), LOOKUP);
    expect(none).toEqual({ tally: first.tally });
  });
});

describe('the engine pays the bonus once per week', () => {
  const pins: ChallengePin[] = [
    { ...localWeekBounds(MONDAY), classId: 'ranger', tier: 1 },
    { ...localWeekBounds(day(7)), classId: 'recruit', tier: 1 },
  ];
  const challenges = weeklyChallenges(pins, CLASSES);
  const history = [
    train('w1a', day(0), 'pull_up'),
    train('w1b', day(1), 'push_up'), // no pull: does not count for the Ranger
    train('w1c', day(3), 'dead_hang'), // completes 2 / 2
    train('w1d', day(5), 'pull_up'), // already complete: no second bonus
    train('w2a', day(7), 'push_up'),
    train('w2b', day(9), 'push_up'), // the Recruit's 2 sessions
    train('w3a', day(14), 'pull_up'), // no pin: no challenge
  ];

  it('adds CLASS_CHALLENGE_BONUS_XP to the completing session only', () => {
    const { results, state } = recompute(NODES, history, [], challenges);
    const bonuses = results.map((result) => result.xp.challengeBonus);
    expect(bonuses).toEqual([0, 0, CLASS_CHALLENGE_BONUS_XP, 0, 0, CLASS_CHALLENGE_BONUS_XP, 0]);
    expect(results[6].challenge).toBeUndefined();
    const plain = recompute(NODES, history);
    expect(state.totalXp - plain.state.totalXp).toBe(2 * CLASS_CHALLENGE_BONUS_XP);
    expect(plain.results.every((result) => result.xp.challengeBonus === 0)).toBe(true);
  });

  it('incremental and full replay agree (ADR-008)', () => {
    let state: EngineState = INITIAL_ENGINE_STATE;
    const steps = history.map((session) => {
      const step = applySession(state, session, NODES, challenges);
      state = step.state;
      return step.result;
    });
    const full = recompute(NODES, history, [], challenges);
    expect(state).toEqual(full.state);
    expect(steps).toEqual(full.results);
  });

  it('a past session inserted later can move the completion, never double it', () => {
    const extra = train('w1early', day(0, 8), 'pull_up');
    const { results } = recompute(NODES, [...history, extra], [], challenges);
    const paid = results.filter((result) => result.xp.challengeBonus > 0).map((r) => r.sessionId);
    expect(paid).toEqual(['w1a', 'w2b']);
  });
});

describe('challengeProgress', () => {
  it('counts the logged sessions inside the window, like the engine', () => {
    const challenge = weeklyChallenge(CLASSES[1], 2, MONDAY) as WeeklyChallenge;
    const sessions = [
      train('before', day(-1), 'pull_up'),
      train('a', day(0), 'pull_up'),
      train('b', day(6, 23), 'pull_up'),
      train('after', day(7, 0), 'pull_up'),
    ];
    expect(challengeProgress(challenge, sessions, NODES)).toEqual({
      count: 2,
      target: 3,
      completed: false,
      fraction: 2 / 3,
    });
    const done = challengeProgress(
      challenge,
      [...sessions, train('c', day(3), 'dead_hang')],
      NODES,
    );
    expect(done).toMatchObject({ count: 3, completed: true, fraction: 1 });
  });
});

describe('pins', () => {
  it('pins a week once: switching classes later in the week changes nothing', () => {
    const first = pinWeek([], 'recruit', 1, day(1));
    expect(first).toEqual([{ ...localWeekBounds(MONDAY), classId: 'recruit', tier: 1 }]);
    expect(pinWeek(first, 'ranger', 3, day(6))).toBe(first);
    const next = pinWeek(first, 'ranger', 3, day(8));
    expect(next.map((pin) => pin.classId)).toEqual(['recruit', 'ranger']);
    expect(pinAt(next, day(8))?.tier).toBe(3);
    expect(pinAt(next, day(20))).toBeUndefined();
  });

  it('resolves pins to the engine challenges, skipping classes without one', () => {
    const pins = [
      { ...localWeekBounds(MONDAY), classId: 'ranger', tier: 2 },
      { ...localWeekBounds(day(7)), classId: 'plain', tier: 1 },
      { ...localWeekBounds(day(14)), classId: 'gone', tier: 1 },
    ];
    expect(weeklyChallenges(pins, CLASSES)).toEqual([
      { ...localWeekBounds(MONDAY), goal: PULL, target: 3 },
    ]);
  });

  it('round-trips through the setting and reads broken values tolerantly', () => {
    const pins = pinWeek(pinWeek([], 'ranger', 2, day(8)), 'recruit', 1, day(0));
    expect(parseChallengePins(JSON.parse(JSON.stringify(challengePinsToRaw(pins))))).toEqual(pins);
    expect(parseChallengePins(undefined)).toEqual([]);
    expect(parseChallengePins({ pins: 'x' })).toEqual([]);
    const week = localWeekBounds(MONDAY);
    expect(
      parseChallengePins({
        version: 1,
        pins: [
          { ...week, classId: 'ranger', tier: 1 },
          { ...week, classId: 'recruit', tier: 1 }, // overlaps: dropped
          { start: week.end, end: week.start, classId: 'ranger', tier: 1 }, // backwards
          { ...localWeekBounds(day(7)), classId: 'ranger', tier: 0 }, // no tier
          { ...localWeekBounds(day(14)), classId: 42, tier: 1 },
          null,
          { ...localWeekBounds(day(21)), classId: 'future_class', tier: 2 }, // kept
        ],
      }),
    ).toEqual([
      { ...week, classId: 'ranger', tier: 1 },
      { ...localWeekBounds(day(21)), classId: 'future_class', tier: 2 },
    ]);
  });
});

describe('challengeView', () => {
  const base = { classes: CLASSES, nodes: NODES, now: day(2) };

  it('previews the worn class until a session pins the week', () => {
    const view = challengeView({
      ...base,
      worn: { classId: 'ranger', tier: 2 },
      pins: [],
      sessions: [],
    });
    expect(view).toMatchObject({
      classId: 'ranger',
      tier: 2,
      target: 3,
      count: 0,
      pinned: false,
      completed: false,
      completedWeeks: 0,
    });
    expect(view?.nextClassId).toBeUndefined();
  });

  it('shows the pinned challenge, the next class and the completed weeks', () => {
    const pins: ChallengePin[] = [
      { ...localWeekBounds(day(-7)), classId: 'recruit', tier: 1 },
      { ...localWeekBounds(MONDAY), classId: 'recruit', tier: 1 },
    ];
    const sessions = [
      train('old1', day(-6), 'push_up'),
      train('old2', day(-5), 'push_up'),
      train('now1', day(0), 'pull_up'),
    ];
    const view = challengeView({ ...base, worn: { classId: 'ranger', tier: 1 }, pins, sessions });
    expect(view).toMatchObject({
      classId: 'recruit',
      count: 1,
      target: 2,
      pinned: true,
      nextClassId: 'ranger',
      completedWeeks: 1,
    });
  });

  it('is absent when the class offers no challenge', () => {
    expect(
      challengeView({ ...base, worn: { classId: 'plain', tier: 1 }, pins: [], sessions: [] }),
    ).toBeUndefined();
  });
});

describe('the class data', () => {
  it('gives every class a challenge with one rising target per tier', () => {
    for (const heroClass of HERO_CLASSES) {
      const { targets } = heroClass.challenge;
      expect(targets.length).toBe(heroClass.tiers.length);
      targets.forEach((target, index) => {
        expect(Number.isInteger(target) && target >= 1).toBe(true);
        if (index > 0) expect(target).toBeGreaterThanOrEqual(targets[index - 1]);
      });
    }
  });

  it('never asks for more than four sessions a week (no pressure, ADR-058)', () => {
    for (const heroClass of HERO_CLASSES) {
      const { goal, targets } = heroClass.challenge;
      if (goal.kind !== 'exercises_training' && goal.kind !== 'trial_attempts') {
        expect(Math.max(...targets)).toBeLessThanOrEqual(4);
      }
    }
  });
});
