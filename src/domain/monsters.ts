/**
 * Monster battles in the live session (PLAN 7.9, ADR-071): every set of an exercise is a foe, a
 * monster of the exercise's branch, and logging the set is the attack. The foe's state and hit
 * points come only from the logged set against its prescription (`setUnits`, `meetsTarget`), so the
 * monsters are a view: nothing new is stored and XP is unchanged.
 *
 * Both training views use them: Classic shows the current exercise's foes above its logger, Battle
 * (`TRAINING_VIEWS`) shows every exercise as a row of foes and logs with taps (`tapDown`).
 */
import { k } from '@/i18n';

import type { Branch, Metric, SetPerformance } from './types';
import { meetsTarget, setUnits } from './xp';

export const MONSTER_KINDS = [
  'imp',
  'bat',
  'skeleton',
  'golem',
  'slime',
  'goblin',
  'wisp',
] as const;
export type MonsterKind = (typeof MONSTER_KINDS)[number];

/** Each branch fights one kind of monster; related branches share one. */
export const BRANCH_MONSTERS: Readonly<Record<Branch, MonsterKind>> = {
  h_push: 'imp',
  v_push: 'imp',
  v_pull: 'bat',
  h_pull: 'bat',
  front_lever: 'skeleton',
  back_lever: 'skeleton',
  planche: 'golem',
  handstand: 'golem',
  core: 'slime',
  mobility: 'slime',
  legs: 'goblin',
  dynamic: 'goblin',
  flexibility: 'wisp',
  acrobatics: 'wisp',
};

export const MONSTER_NAMES: Readonly<Record<MonsterKind, string>> = {
  imp: k('Imp'),
  bat: k('Bat'),
  skeleton: k('Skeleton'),
  golem: k('Golem'),
  slime: k('Slime'),
  goblin: k('Goblin'),
  wisp: k('Wisp'),
};

/**
 * - `fresh`: not logged yet; `fighting`: its hold timer runs.
 * - Logged: `overkill` (more than the target), `defeated` (the target), `wounded` (some of it),
 *   `escaped` (nothing: a set logged as 0).
 */
export const FOE_STATES = [
  'fresh',
  'fighting',
  'overkill',
  'defeated',
  'wounded',
  'escaped',
] as const;
export type FoeState = (typeof FOE_STATES)[number];

/** The state of a logged set's foe. */
export function foeState(metric: Metric, actual: SetPerformance, target: SetPerformance): FoeState {
  const done = setUnits(metric, actual);
  if (meetsTarget(metric, actual, target)) {
    return done > setUnits(metric, target) ? 'overkill' : 'defeated';
  }
  return done > 0 ? 'wounded' : 'escaped';
}

/** The share of a logged set's foe's hit points left, 0–1 (1 = untouched, 0 = beaten). */
export function foeHp(metric: Metric, actual: SetPerformance, target: SetPerformance): number {
  if (meetsTarget(metric, actual, target)) return 0;
  const full = setUnits(metric, target);
  if (full <= 0) return 0;
  return Math.max(0, 1 - setUnits(metric, actual) / full);
}

/** Whether a tap logs the foe outright: holds start their timer instead. */
export function tapLogs(metric: Metric): boolean {
  return metric !== 'hold_s';
}

/**
 * The Battle view's tap on a logged foe (ADR-071): one rep fewer (one lowering or rep fewer for
 * eccentric and load sets), down to 0 (escaped); a tap on a 0 returns `undefined`: the set is
 * removed and the foe is fresh again. Holds don't count down by taps (`tapLogs`); their sets are
 * edited in the edit sheet.
 */
export function tapDown(metric: Metric, actual: SetPerformance): SetPerformance | undefined {
  if (metric === 'eccentric_s' || metric === 'load_xbw') {
    const reps = actual.reps ?? 1;
    if (reps <= 0 || actual.value <= 0) return undefined;
    return reps === 1 ? { value: 0, reps: 0 } : { ...actual, reps: reps - 1 };
  }
  if (actual.value <= 0) return undefined;
  return { ...actual, value: actual.value - 1 };
}

/** The short count under a foe: reps, seconds or lowerings ("5", "30s", "3"). */
export function foeCount(metric: Metric, performance: SetPerformance): string {
  switch (metric) {
    case 'reps':
      return String(performance.value);
    case 'hold_s':
      return `${performance.value}s`;
    case 'eccentric_s':
    case 'load_xbw':
      return String(performance.reps ?? 1);
  }
}

/**
 * The damage a logged set did, as the number that floats up from the foe ("-5", "-30s"): what was
 * done, in the foe's count.
 */
export function foeDamage(metric: Metric, actual: SetPerformance): string {
  return `-${foeCount(metric, actual)}`;
}
