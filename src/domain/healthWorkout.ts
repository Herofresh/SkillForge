/**
 * A finished session as the workout SkillForge writes to Health Connect (PLAN 7.10, ADR-072): one
 * exercise session from start to end with a title and a note that lists what was done ("Pull-up:
 * 5, 5, 4 reps"). Pure and platform-neutral: the Health Connect adapter (`src/health/`) turns it
 * into the platform's record. Nothing is read back from Health Connect.
 */
import { k, t } from '@/i18n';

import { formatPerformance } from './format';
import type { LoggedSet, NodeLookup, SetPerformance } from './types';

/** The workout to write. Times are ms since the Unix epoch. */
export interface HealthWorkout {
  /**
   * Stable per session (`skillforge-<session id>`): Health Connect ignores a second write with the
   * same id and version, so a session never shows up twice (ADR-073).
   */
  clientId: string;
  startMs: number;
  endMs: number;
  title: string;
  notes: string;
}

export const HEALTH_WORKOUT_TITLE = k('SkillForge workout');
/** Health Connect keeps notes short; longer ones are cut with an ellipsis. */
export const HEALTH_NOTES_MAX = 1000;
/** A session shorter than this (e.g. one quick set) is written with this length. */
export const HEALTH_MIN_DURATION_MS = 60_000;
const ELLIPSIS = '…';

/** The setting `health_connect`: whether finished sessions are written (off unless turned on). */
export function parseHealthConnectEnabled(raw: unknown): boolean {
  return raw === true;
}

/** "5, 5, 4 reps", "30, 30, 25 s"; lowerings and loaded sets one by one ("3 × 5 s lowerings, …"). */
function setsText(set: Pick<LoggedSet, 'metric'>, actuals: readonly SetPerformance[]): string {
  switch (set.metric) {
    case 'reps':
      return t('{list} reps', { list: actuals.map((actual) => actual.value).join(', ') });
    case 'hold_s':
      return t('{list} s', { list: actuals.map((actual) => actual.value).join(', ') });
    case 'eccentric_s':
    case 'load_xbw':
      return actuals.map((actual) => formatPerformance(set.metric, actual)).join(', ');
  }
}

/**
 * One line per exercise in the order first trained, with the sets that were done (sets logged as
 * 0 are left out; an exercise with none is left out too). Trial sets are marked.
 */
export function workoutNotes(sets: readonly LoggedSet[], lookup: NodeLookup, xp?: number): string {
  const byNode = new Map<string, LoggedSet[]>();
  for (const set of [...sets].sort((a, b) => a.setIndex - b.setIndex)) {
    if (set.actual.value <= 0) continue;
    byNode.set(set.nodeId, [...(byNode.get(set.nodeId) ?? []), set]);
  }
  const lines = [...byNode.values()].map((done) => {
    const name = lookup.get(done[0].nodeId)?.name ?? done[0].nodeId;
    const params = {
      name,
      sets: setsText(
        done[0],
        done.map((set) => set.actual),
      ),
    };
    return done.some((set) => set.isTrial)
      ? t('{name} (Trial): {sets}', params)
      : t('{name}: {sets}', params);
  });
  const total = [...byNode.values()].reduce((sum, done) => sum + done.length, 0);
  const header = [
    byNode.size === 1 ? t('1 exercise') : t('{n} exercises', { n: byNode.size }),
    total === 1 ? t('1 set') : t('{n} sets', { n: total }),
    ...(xp !== undefined ? [`+${xp} XP`] : []),
  ].join(', ');
  const text = [header, ...lines].join('\n');
  return text.length <= HEALTH_NOTES_MAX
    ? text
    : `${text.slice(0, HEALTH_NOTES_MAX - ELLIPSIS.length)}${ELLIPSIS}`;
}

/**
 * The workout for a finished session: from its start to `endedAt` (at least
 * `HEALTH_MIN_DURATION_MS`), with the notes of its sets and, when known, the XP it earned.
 */
export function healthWorkout(
  session: { id: string; startedAt: number; sets: readonly LoggedSet[] },
  endedAt: number,
  lookup: NodeLookup,
  xp?: number,
): HealthWorkout {
  return {
    clientId: `skillforge-${session.id}`,
    startMs: session.startedAt,
    endMs: Math.max(endedAt, session.startedAt + HEALTH_MIN_DURATION_MS),
    title: t(HEALTH_WORKOUT_TITLE),
    notes: workoutNotes(session.sets, lookup, xp),
  };
}
