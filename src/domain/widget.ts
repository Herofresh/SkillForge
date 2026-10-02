/**
 * The Android home-screen widget's data (PLAN 6.6, ADR-055). Two steps, both pure:
 *
 * 1. `widgetSnapshot` turns the app state into a small JSON-safe snapshot. The app writes it to a
 *    file whenever its state changes; the widget's background task reads it back
 *    (`parseWidgetSnapshot`), because it can run while the app (and its database) is closed.
 * 2. `widgetView` turns a snapshot into what the widget shows **at render time**: "trained today"
 *    and the streak depend on the clock, so the widget re-evaluates them on every periodic update
 *    instead of showing a value frozen when the app last ran (no ✓ from yesterday after midnight).
 */
import { isSameLocalDay } from '@/lib/time';

import { computeCharacter } from './character';
import { activeStreak } from './characterView';
import type { EngineState } from './recompute';
import {
  ATTRIBUTES,
  RANK_TITLES,
  type Attribute,
  type ExerciseNode,
  type RankTitle,
} from './types';

/** Bump when the snapshot's shape changes; an unknown version is ignored by the widget. */
export const WIDGET_SNAPSHOT_VERSION = 1;
/** How many attributes the medium widget lists (the strongest first). */
export const WIDGET_TOP_ATTRIBUTES = 3;
/** Where tapping the widget leads: the Train tab (expo-router path `/train`, scheme in app.json). */
export const WIDGET_DEEP_LINK = 'skillforge://train';

export interface WidgetAttribute {
  attribute: Attribute;
  value: number;
}

/** What the app hands to the widget. Raw values only; clock-dependent parts are in `widgetView`. */
export interface WidgetSnapshot {
  version: typeof WIDGET_SNAPSHOT_VERSION;
  heroName?: string;
  level: number;
  rank: RankTitle;
  /** The engine's streak after the last session (`activeStreak` decides if it still holds). */
  streak: number;
  /** Start of the last logged session (sessions and Trials alike), ms since the Unix epoch. */
  lastSessionAt?: number;
  /** The strongest attributes with points, strongest first (at most `WIDGET_TOP_ATTRIBUTES`). */
  topAttributes: WidgetAttribute[];
}

export interface WidgetSnapshotInput {
  nodes: readonly ExerciseNode[];
  engine: Pick<EngineState, 'progress' | 'totalXp' | 'streak' | 'lastSessionAt'>;
  heroName?: string;
}

/** The attributes with points, strongest first; ties keep the `ATTRIBUTES` order. */
export function topAttributes(
  attributes: Readonly<Record<Attribute, number>>,
  limit: number = WIDGET_TOP_ATTRIBUTES,
): WidgetAttribute[] {
  return ATTRIBUTES.map((attribute) => ({ attribute, value: attributes[attribute] }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value) // stable: ties stay in ATTRIBUTES order
    .slice(0, limit);
}

export function widgetSnapshot(input: WidgetSnapshotInput): WidgetSnapshot {
  const { nodes, engine, heroName } = input;
  const character = computeCharacter(nodes, engine.progress, engine.totalXp);
  return {
    version: WIDGET_SNAPSHOT_VERSION,
    ...(heroName !== undefined ? { heroName } : {}),
    level: character.level,
    rank: character.rank,
    streak: engine.streak,
    ...(engine.lastSessionAt !== undefined ? { lastSessionAt: engine.lastSessionAt } : {}),
    topAttributes: topAttributes(character.attributes),
  };
}

/** What the widget renders. `empty` until the app has written a snapshot (first run). */
export type WidgetView =
  | { kind: 'empty'; deepLink: string }
  | {
      kind: 'hero';
      deepLink: string;
      heroName?: string;
      trainedToday: boolean;
      /** "Trained today" / "Not yet today". */
      status: string;
      /** The streak as it stands at render time (`activeStreak`). */
      streak: number;
      level: number;
      rank: RankTitle;
      topAttributes: WidgetAttribute[];
    };

export function widgetView(snapshot: WidgetSnapshot | undefined, now: number): WidgetView {
  if (snapshot === undefined) return { kind: 'empty', deepLink: WIDGET_DEEP_LINK };
  const trainedToday =
    snapshot.lastSessionAt !== undefined && isSameLocalDay(snapshot.lastSessionAt, now);
  return {
    kind: 'hero',
    deepLink: WIDGET_DEEP_LINK,
    ...(snapshot.heroName !== undefined ? { heroName: snapshot.heroName } : {}),
    trainedToday,
    status: trainedToday ? 'Trained today' : 'Not yet today',
    streak: activeStreak(snapshot, now),
    level: snapshot.level,
    rank: snapshot.rank,
    topAttributes: snapshot.topAttributes,
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function isWidgetAttribute(value: unknown): value is WidgetAttribute {
  return (
    isRecord(value) &&
    (ATTRIBUTES as readonly unknown[]).includes(value.attribute) &&
    isCount(value.value)
  );
}

/**
 * Reads a stored snapshot. Anything unreadable (no file yet, a half-written file, another version)
 * gives `undefined`, so the widget shows its first-run state instead of crashing.
 */
export function parseWidgetSnapshot(text: string | undefined): WidgetSnapshot | undefined {
  if (text === undefined) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (!isRecord(value) || value.version !== WIDGET_SNAPSHOT_VERSION) return undefined;
  const { heroName, level, rank, streak, lastSessionAt, topAttributes: top } = value;
  if (heroName !== undefined && typeof heroName !== 'string') return undefined;
  if (!isCount(level) || !isCount(streak)) return undefined;
  if (!(RANK_TITLES as readonly unknown[]).includes(rank)) return undefined;
  if (lastSessionAt !== undefined && !isCount(lastSessionAt)) return undefined;
  if (!Array.isArray(top) || !top.every(isWidgetAttribute)) return undefined;
  return {
    version: WIDGET_SNAPSHOT_VERSION,
    ...(heroName !== undefined ? { heroName } : {}),
    level,
    rank: rank as RankTitle,
    streak,
    ...(lastSessionAt !== undefined ? { lastSessionAt } : {}),
    topAttributes: top,
  };
}
