/**
 * The live session's foes (PLAN 7.9, ADR-071): per exercise, one monster per set (`monsters.ts`),
 * for both training views. Classic shows the current exercise's row above its logger; Battle shows
 * every exercise as a row and logs with taps. Pure, built from the session like `liveView`.
 */
import { k, t } from '@/i18n';

import { formatPerformance } from './format';
import {
  BRANCH_MONSTERS,
  foeCount,
  foeDamage,
  foeHp,
  foeState,
  MONSTER_NAMES,
  tapDown,
  tapLogs,
  type FoeState,
  type MonsterKind,
} from './monsters';
import type { ProgressMap } from './progression';
import { measuredSeconds } from './setTimer';
import {
  deleteSessionSet,
  editSessionSet,
  exerciseSets,
  logSessionSet,
  startSetTimer,
  type ActiveSession,
  type SessionExercise,
} from './train';
import { blockViews, type BlockView, type ExerciseView } from './trainView';
import type { Metric, NodeLookup, SetPerformance } from './types';

/** The two ways to train a live session (a setting): one exercise at a time, or all as foes. */
export const TRAINING_VIEWS = ['classic', 'battle'] as const;
export type TrainingView = (typeof TRAINING_VIEWS)[number];
export const DEFAULT_TRAINING_VIEW: TrainingView = 'classic';

/** A stored setting read back; anything unknown is the default. */
export function parseTrainingView(value: unknown): TrainingView {
  return TRAINING_VIEWS.find((view) => view === value) ?? DEFAULT_TRAINING_VIEW;
}

/** The monster an exercise fights: its branch's (`BRANCH_MONSTERS`); unknown nodes get a slime. */
export function monsterOf(lookup: NodeLookup, nodeId: string): MonsterKind {
  const branch = lookup.get(nodeId)?.branch;
  return branch === undefined ? 'slime' : BRANCH_MONSTERS[branch];
}

/** One set of an exercise as a foe. */
export interface FoeView {
  /** 0-based position in the exercise's row ("Set 1" is 0). */
  slot: number;
  /** The logged set (`SessionSetLog.setIndex`); unset while fresh or fighting. */
  setIndex?: number;
  /** What was logged; unset while fresh or fighting. */
  actual?: SetPerformance;
  state: FoeState;
  /** Hit points left, 0–1 (fresh and fighting: 1). */
  hp: number;
  /** The count under it: the target while fresh, else what was logged. */
  count: string;
  /** The number that floats up when its set is logged ("-5"); unset while fresh or fighting. */
  damage?: string;
  /** Past the planned sets (an extra set). */
  extra: boolean;
  /** For screen readers: "Set 2 of 5, Imp, defeated, 8 reps". */
  spoken: string;
}

/** An exercise of the live session with its foes. */
export interface ExerciseFoes {
  exercise: ExerciseView;
  metric: Metric;
  target: SetPerformance;
  monster: MonsterKind;
  monsterName: string;
  /** Logged sets in order, then the fresh ones still planned (the first may be fighting). */
  foes: FoeView[];
  /** The fresh foe the next tap fights: the first not logged, else an extra set. */
  nextSlot: number;
}

const STATE_WORDS: Readonly<Record<FoeState, string>> = {
  fresh: k('not fought yet'),
  fighting: k('fighting'),
  overkill: k('overkill'),
  defeated: k('defeated'),
  wounded: k('wounded'),
  escaped: k('escaped'),
};

/** "Set 2 of 5" for a planned slot (0-based), "Extra set 6" past the plan. */
export function foeSetLabel(slot: number, plannedSets: number): string {
  return slot < plannedSets
    ? t('Set {n} of {total}', { n: slot + 1, total: plannedSets })
    : t('Extra set {n}', { n: slot + 1 });
}

/** The foes of `exercise` in `session`. */
export function exerciseFoes(
  session: ActiveSession,
  exercise: SessionExercise,
  lookup: NodeLookup,
  view: ExerciseView,
): ExerciseFoes {
  const monster = monsterOf(lookup, exercise.nodeId);
  const monsterName = t(MONSTER_NAMES[monster]);
  const sets = exerciseSets(session, exercise.key);
  const planned = Math.max(exercise.sets, sets.length);
  const fighting = session.timer?.exerciseKey === exercise.key;
  const setLabel = (slot: number): string => foeSetLabel(slot, exercise.sets);
  const foes: FoeView[] = [];
  for (let slot = 0; slot < planned; slot++) {
    const set = sets[slot];
    const extra = slot >= exercise.sets;
    if (set) {
      const state = foeState(exercise.metric, set.actual, set.prescribed);
      foes.push({
        slot,
        setIndex: set.setIndex,
        actual: set.actual,
        state,
        hp: foeHp(exercise.metric, set.actual, set.prescribed),
        count: foeCount(exercise.metric, set.actual),
        damage: foeDamage(exercise.metric, set.actual),
        extra,
        spoken: t('{set}, {monster}, {state}, {result}', {
          set: setLabel(slot),
          monster: monsterName,
          state: t(STATE_WORDS[state]),
          result: formatPerformance(exercise.metric, set.actual),
        }),
      });
    } else {
      const state: FoeState = fighting && slot === sets.length ? 'fighting' : 'fresh';
      foes.push({
        slot,
        state,
        hp: 1,
        count: foeCount(exercise.metric, exercise.target),
        extra,
        spoken: t('{set}, {monster}, {state}, target {target}', {
          set: setLabel(slot),
          monster: monsterName,
          state: t(STATE_WORDS[state]),
          target: formatPerformance(exercise.metric, exercise.target),
        }),
      });
    }
  }
  return {
    exercise: view,
    metric: exercise.metric,
    target: exercise.target,
    monster,
    monsterName,
    foes,
    nextSlot: sets.length,
  };
}

/** A block of the Battle view: its exercises with their foes. */
export interface BattleBlock {
  kind: BlockView['kind'];
  label: string;
  exercises: ExerciseFoes[];
}

/** Every exercise of the session as foes, in session order and blocks (the Battle view). */
export function battleView(
  session: ActiveSession,
  lookup: NodeLookup,
  progress?: ProgressMap,
): BattleBlock[] {
  const byKey = new Map(session.exercises.map((exercise) => [exercise.key, exercise]));
  return blockViews(session.exercises, lookup, session, progress).map((block) => ({
    kind: block.kind,
    label: block.label,
    exercises: block.exercises.flatMap((view) => {
      const exercise = byKey.get(view.key);
      return exercise ? [exerciseFoes(session, exercise, lookup, view)] : [];
    }),
  }));
}

/** What a tap on a foe did: a new session, or a hold's logged set that opens in the edit sheet. */
export type FoeTap = { session: ActiveSession } | { edit: number };

/**
 * A tap on foe `slot` of exercise `key` in the Battle view (ADR-071):
 * - a fresh foe (the next set, or an extra one past the plan): reps, lowerings and load sets are
 *   logged at the target; a hold starts its timer, and a tap while it runs stops it and logs the
 *   seconds held (the get-ready countdown first, as in Classic);
 * - a logged foe: one rep fewer (`tapDown`), down to 0; a tap on a 0 removes the set, so the foe is
 *   fresh again. A logged hold opens the edit sheet instead (`edit` = its `setIndex`).
 * Any fresh slot fights the next set. An unknown key leaves the session as it is.
 */
export function tapFoe(session: ActiveSession, key: string, slot: number, at: number): FoeTap {
  const exercise = session.exercises.find((entry) => entry.key === key);
  if (!exercise) return { session };
  const sets = exerciseSets(session, key);
  const logged = sets[slot];
  if (logged) {
    if (!tapLogs(exercise.metric)) return { edit: logged.setIndex };
    const fewer = tapDown(exercise.metric, logged.actual);
    return {
      session:
        fewer === undefined
          ? deleteSessionSet(session, logged.setIndex)
          : editSessionSet(session, logged.setIndex, fewer),
    };
  }
  // Any fresh foe fights the next set: the row fills from the left.
  if (tapLogs(exercise.metric)) {
    return { session: logSessionSet(session, key, exercise.target, at) };
  }
  const { timer } = session;
  if (timer?.exerciseKey !== key) return { session: startSetTimer(session, key, at) };
  const held = measuredSeconds(timer, 'hold', at);
  return { session: logSessionSet(session, key, { ...exercise.target, value: held }, at) };
}
