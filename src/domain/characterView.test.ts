import { makeChain, makeNode, makeSession } from '@/data/testFixtures';
import { localWeekBounds } from '@/lib/time';

import {
  activeStreak,
  balanceNote,
  characterSheet,
  characterTotals,
  goalProgress,
  nextRank,
  radarAxes,
  rankHint,
  recentSessions,
  RECENT_SESSIONS_LIMIT,
} from './characterView';
import { PROFICIENT_LEVEL, xpForLevel } from './progression';
import { INITIAL_ENGINE_STATE, recompute, type SessionResult } from './recompute';
import type { NodeProgress } from './types';
import { STREAK_MAX_GAP_MS } from './xp';

const proficient = (nodeId: string, ogLevel = 0): NodeProgress => ({
  nodeId,
  xp: xpForLevel(PROFICIENT_LEVEL, ogLevel),
  level: PROFICIENT_LEVEL,
  trialPassed: true,
  firstTrainedAt: 1,
});

describe('radarAxes', () => {
  it('normalises to the largest attribute in ATTRIBUTES order', () => {
    const axes = radarAxes({ push: 10, pull: 20, core: 5, legs: 0, balance: 0, mobility: 0 });
    expect(axes.map((axis) => axis.attribute)).toEqual([
      'push',
      'pull',
      'core',
      'legs',
      'balance',
      'mobility',
    ]);
    expect(axes.map((axis) => axis.fraction)).toEqual([0.5, 1, 0.25, 0, 0, 0]);
    expect(axes[1].value).toBe(20);
  });

  it('is all zero for a new hero', () => {
    const axes = radarAxes({ push: 0, pull: 0, core: 0, legs: 0, balance: 0, mobility: 0 });
    expect(axes.every((axis) => axis.fraction === 0)).toBe(true);
  });
});

describe('nextRank', () => {
  it('names the next rank and its median OG level', () => {
    expect(nextRank('Novice')).toEqual({ rank: 'Apprentice', minMedianOgLevel: 2 });
    expect(nextRank('Master')).toEqual({ rank: 'Legend', minMedianOgLevel: 13 });
    expect(nextRank('Legend')).toBeUndefined();
  });
});

describe('rankHint', () => {
  it('shows the median and the next threshold', () => {
    expect(rankHint(0, nextRank('Novice'))).toBe('Branch median Foundation · Apprentice at OG 2');
    expect(rankHint(14, undefined)).toBe('Branch median OG 14 · the highest rank');
  });
});

describe('activeStreak', () => {
  it('keeps the streak while the next session can still extend it', () => {
    expect(activeStreak({ streak: 3, lastSessionAt: 1000 }, 1000 + STREAK_MAX_GAP_MS)).toBe(3);
    expect(activeStreak({ streak: 3, lastSessionAt: 1000 }, 1001 + STREAK_MAX_GAP_MS)).toBe(0);
    expect(activeStreak({ streak: 0 }, 5)).toBe(0);
  });
});

describe('characterTotals', () => {
  it('counts sessions, done sets and passed Trials', () => {
    const sessions = [
      makeSession('a', 1, [{ nodeId: 'pull_up', count: 3 }]),
      makeSession('b', 2, [{ nodeId: 'pull_up', count: 2, actual: { value: 0 } }]),
    ];
    expect(
      characterTotals(sessions, {
        dead_hang: proficient('dead_hang'),
        pull_up: { nodeId: 'pull_up', xp: 5, level: 1, trialPassed: false },
      }),
    ).toEqual({ sessions: 2, sets: 3, trialsPassed: 1 });
  });
});

describe('balanceNote', () => {
  it('names the weaker side', () => {
    const note = balanceNote({ push: 8, pull: 2, core: 0, legs: 0, balance: 0, mobility: 0 });
    expect(note.weaker).toBe('pull');
    expect(note.message).toContain('OG 8');
    expect(note.message).toContain('pull work');
  });
});

describe('recentSessions', () => {
  const nodes = makeChain();
  const sessions = Array.from({ length: RECENT_SESSIONS_LIMIT + 2 }, (_, index) =>
    makeSession(`s${String(index).padStart(2, '0')}`, index * 1000, [
      { nodeId: 'dead_hang', count: 2 },
      { nodeId: 'pull_up_negative', count: 1 },
      { nodeId: 'pull_up', count: 1 },
    ]),
  );

  it('lists the newest sessions first, with their XP', () => {
    const { results } = recompute(nodes, sessions);
    const byId = Object.fromEntries(results.map((result) => [result.sessionId, result]));
    const items = recentSessions(sessions, byId, nodes);
    expect(items).toHaveLength(RECENT_SESSIONS_LIMIT);
    expect(items[0].sessionId).toBe('s11');
    expect(items[0].title).toBe('dead_hang, pull_up_negative + 1 more');
    expect(items[0].exercises).toBe(3);
    expect(items[0].sets).toBe(4);
    expect(items[0].xp).toBe(byId.s11.xp.total);
  });

  it('titles a Trial-only session after its node', () => {
    const trial = makeSession('t', 1, [{ nodeId: 'dead_hang', count: 3, isTrial: true }]);
    const [item] = recentSessions([trial], {}, nodes);
    expect(item.title).toBe('Trial: dead_hang');
    expect(item.xp).toBe(0);
  });
});

describe('goalProgress', () => {
  const nodes = makeChain();

  it('counts proficient path nodes and names the next trainable one', () => {
    const [goal] = goalProgress(nodes, { dead_hang: proficient('dead_hang') }, ['pull_up']);
    expect(goal).toMatchObject({
      nodeId: 'pull_up',
      state: 'locked',
      stepsDone: 1,
      stepsTotal: 3,
      next: { nodeId: 'pull_up_negative' },
    });
    expect(goal.fraction).toBeCloseTo(1 / 3);
  });

  it('has no next step once the goal is reached, and skips unknown goals', () => {
    const progress = Object.fromEntries(
      nodes.map((node) => [node.id, proficient(node.id, node.ogLevel)]),
    );
    const views = goalProgress(nodes, progress, ['pull_up', 'gone']);
    expect(views).toHaveLength(1);
    expect(views[0].next).toBeUndefined();
    expect(views[0].fraction).toBe(1);
  });
});

describe('characterSheet', () => {
  it('starts a new hero at level 1 with nothing logged', () => {
    const sheet = characterSheet({
      nodes: makeChain(),
      engine: INITIAL_ENGINE_STATE,
      sessions: [],
      sessionResults: {},
      goals: [],
      heroName: 'Aria',
      now: 0,
    });
    expect(sheet).toMatchObject({
      heroName: 'Aria',
      level: { level: 1, xpIntoLevel: 0 },
      rank: 'Novice',
      nextRank: { rank: 'Apprentice' },
      streak: 0,
      totals: { sessions: 0, sets: 0, trialsPassed: 0 },
      recent: [],
      goals: [],
    });
    expect(sheet.balance).toBeUndefined();
    // PLAN 6.9: every hero class, the starting one worn.
    expect(sheet.wornClass).toMatchObject({ classId: 'recruit', status: 'worn', tier: 1 });
    expect(sheet.classes.filter((row) => row.status === 'locked')).toHaveLength(
      sheet.classes.length - 1,
    );
  });

  it('wears the selected class from the stored settings', () => {
    const sheet = characterSheet({
      nodes: makeChain(),
      engine: INITIAL_ENGINE_STATE,
      sessions: [],
      sessionResults: {},
      goals: [],
      classes: { selected: 'ranger', unlocks: { ranger: [{ at: 1 }] }, seen: {} },
      now: 0,
    });
    expect(sheet.wornClass).toMatchObject({ classId: 'ranger', title: 'Ranger', isNew: true });
    // PLAN 6.9b: without a pin, the worn class's challenge as a preview.
    expect(sheet.challenge).toMatchObject({ classId: 'ranger', pinned: false, count: 0 });
  });

  it('shows the pinned weekly challenge with its progress', () => {
    const monday = new Date(2026, 8, 21, 12).getTime();
    const session = makeSession('s1', monday, [{ nodeId: 'pull_up', count: 2 }]);
    const sheet = characterSheet({
      nodes: makeChain(),
      engine: INITIAL_ENGINE_STATE,
      sessions: [session],
      sessionResults: {},
      goals: [],
      challengePins: [{ ...localWeekBounds(monday), classId: 'recruit', tier: 1 }],
      now: monday + 1000,
    });
    expect(sheet.challenge).toMatchObject({
      classId: 'recruit',
      pinned: true,
      count: 1,
      target: 2,
      completed: false,
    });
  });

  it('adds the balance note when push is far ahead of pull', () => {
    const push = makeNode({
      id: 'planche',
      branch: 'planche',
      ogLevel: 8,
      patterns: ['straight_arm_push'],
    });
    const sessions = [makeSession('a', 1, [{ nodeId: 'planche', count: 1 }])];
    const results: Record<string, SessionResult> = {};
    const sheet = characterSheet({
      nodes: [push],
      engine: {
        ...INITIAL_ENGINE_STATE,
        progress: { planche: proficient('planche', 8) },
        totalXp: 150,
        streak: 1,
        lastSessionAt: 1,
      },
      sessions,
      sessionResults: results,
      goals: [],
      now: 2,
    });
    expect(sheet.balance?.weaker).toBe('pull');
    expect(sheet.level.level).toBe(2);
    expect(sheet.streak).toBe(1);
    expect(sheet.radar.find((axis) => axis.attribute === 'push')?.fraction).toBe(1);
    // The ladder (PLAN 6.7) agrees with the sheet's rank and sees the planche peak.
    expect(sheet.ladder.rank).toBe(sheet.rank);
    expect(sheet.ladder.medianOgLevel).toBe(sheet.medianOgLevel);
    const adept = sheet.ladder.steps.find((step) => step.rank === 'Adept');
    expect(adept?.branchesAtLevel).toBe(1);
    expect(adept?.branchesBelow.map((peak) => peak.branch)).not.toContain('planche');
  });
});
