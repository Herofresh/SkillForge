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
import { HERO_CLASS_BY_ID, HERO_CLASSES } from '@/data/classes';
import { ACCESSORIES, ACCESSORY_BY_ID } from '@/data/companion/accessories';
import { CLASS_WEAPONS, weaponFor } from '@/data/companion/weapons';
import { isSameLocalDay } from '@/lib/time';

import { computeCharacter } from './character';
import { activeStreak } from './characterView';
import { classTitle, EMPTY_CLASS_SETTINGS, wornClass, type ClassSettings } from './classes';
import {
  companionLoadout,
  companionMood,
  EMPTY_COMPANION_SETTINGS,
  MOOD_TITLES,
  type CompanionLoadout,
  type CompanionLookChoice,
  type CompanionMood,
  type CompanionSettings,
} from './companion';
import type { EngineState } from './recompute';
import {
  ATTRIBUTES,
  RANK_TITLES,
  COMPANION_SLOTS,
  type Attribute,
  type CompanionSlot,
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
  level: number;
  rank: RankTitle;
  /** The engine's streak after the last session (`activeStreak` decides if it still holds). */
  streak: number;
  /** Start of the last logged session (sessions and Trials alike), ms since the Unix epoch. */
  lastSessionAt?: number;
  /** The strongest attributes with points, strongest first (at most `WIDGET_TOP_ATTRIBUTES`). */
  topAttributes: WidgetAttribute[];
  /**
   * The worn hero class and its tier (PLAN 6.9). Optional, so snapshots written before 6.9 still
   * read (no version bump); an unknown class is left out.
   */
  heroClass?: { id: string; tier: number };
  /**
   * What the companion wears (PLAN 6.10), for the large widget. Optional like `heroClass` (no
   * version bump); the mood is decided at render time from `lastSessionAt`.
   */
  companion?: WidgetCompanion;
}

/** The companion's outfit as the widget draws it. */
export interface WidgetCompanion {
  loadout: CompanionLoadout;
  weapon: { classId: string; upgraded: boolean };
  look: CompanionLookChoice;
}

export interface WidgetSnapshotInput {
  nodes: readonly ExerciseNode[];
  engine: Pick<EngineState, 'progress' | 'totalXp' | 'streak' | 'lastSessionAt'>;
  /** The stored class settings; none = the starting class. */
  classes?: ClassSettings;
  /** The stored companion settings; none = no accessories, default colors. */
  companion?: CompanionSettings;
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
  const { nodes, engine } = input;
  const character = computeCharacter(nodes, engine.progress, engine.totalXp);
  const worn = wornClass(HERO_CLASSES, input.classes ?? EMPTY_CLASS_SETTINGS);
  return {
    version: WIDGET_SNAPSHOT_VERSION,
    level: character.level,
    rank: character.rank,
    streak: engine.streak,
    ...(engine.lastSessionAt !== undefined ? { lastSessionAt: engine.lastSessionAt } : {}),
    topAttributes: topAttributes(character.attributes),
    heroClass: { id: worn.classId, tier: worn.tier },
    companion: widgetCompanion(input.companion ?? EMPTY_COMPANION_SETTINGS, worn),
  };
}

function widgetCompanion(
  settings: CompanionSettings,
  worn: { classId: string; tier: number },
): WidgetCompanion {
  const weapon = weaponFor(worn.classId, worn.tier);
  return {
    loadout: companionLoadout(ACCESSORIES, settings),
    weapon: { classId: weapon.classId, upgraded: weapon.upgraded },
    look: settings.look,
  };
}

/** What the widget renders. `empty` until the app has written a snapshot (first run). */
export type WidgetView =
  | { kind: 'empty'; deepLink: string }
  | {
      kind: 'hero';
      deepLink: string;
      trainedToday: boolean;
      /** "Trained today" / "Not yet today". */
      status: string;
      /** The streak as it stands at render time (`activeStreak`). */
      streak: number;
      level: number;
      rank: RankTitle;
      topAttributes: WidgetAttribute[];
      /** The worn class's title at its tier (e.g. "Veteran") and the class id (its color). */
      heroClass?: { id: string; title: string };
      /** The companion in its mood at render time (the large widget). */
      companion?: WidgetCompanion & { mood: CompanionMood; moodTitle: string };
    };

export function widgetView(snapshot: WidgetSnapshot | undefined, now: number): WidgetView {
  if (snapshot === undefined) return { kind: 'empty', deepLink: WIDGET_DEEP_LINK };
  const trainedToday =
    snapshot.lastSessionAt !== undefined && isSameLocalDay(snapshot.lastSessionAt, now);
  const heroClass = snapshot.heroClass && HERO_CLASS_BY_ID.get(snapshot.heroClass.id);
  const mood = companionMood(snapshot.lastSessionAt, now);
  return {
    kind: 'hero',
    deepLink: WIDGET_DEEP_LINK,
    trainedToday,
    status: trainedToday ? 'Trained today' : 'Not yet today',
    streak: activeStreak(snapshot, now),
    level: snapshot.level,
    rank: snapshot.rank,
    topAttributes: snapshot.topAttributes,
    ...(snapshot.companion
      ? { companion: { ...snapshot.companion, mood, moodTitle: MOOD_TITLES[mood] } }
      : {}),
    ...(heroClass && snapshot.heroClass
      ? {
          heroClass: {
            id: heroClass.id,
            title: classTitle(heroClass, snapshot.heroClass.tier),
          },
        }
      : {}),
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
 * gives `undefined`, so the widget shows its first-run state instead of crashing. Unknown fields
 * are ignored (e.g. `heroName`, which the first 6.6 builds wrote).
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
  const { level, rank, streak, lastSessionAt, topAttributes: top } = value;
  if (!isCount(level) || !isCount(streak)) return undefined;
  if (!(RANK_TITLES as readonly unknown[]).includes(rank)) return undefined;
  if (lastSessionAt !== undefined && !isCount(lastSessionAt)) return undefined;
  if (!Array.isArray(top) || !top.every(isWidgetAttribute)) return undefined;
  const heroClass = readHeroClass(value.heroClass);
  const companion = readCompanion(value.companion);
  return {
    version: WIDGET_SNAPSHOT_VERSION,
    level,
    rank: rank as RankTitle,
    streak,
    ...(lastSessionAt !== undefined ? { lastSessionAt } : {}),
    topAttributes: top,
    ...(heroClass ? { heroClass } : {}),
    ...(companion ? { companion } : {}),
  };
}

/** The snapshot's companion: known accessories in their own slots, a known weapon; else none. */
function readCompanion(value: unknown): WidgetCompanion | undefined {
  if (!isRecord(value) || !isRecord(value.loadout) || !isRecord(value.weapon)) return undefined;
  const loadout: Partial<Record<CompanionSlot, string>> = {};
  for (const slot of COMPANION_SLOTS) {
    const id = value.loadout[slot];
    if (typeof id === 'string' && ACCESSORY_BY_ID.get(id)?.slot === slot) loadout[slot] = id;
  }
  const { classId, upgraded } = value.weapon;
  if (typeof classId !== 'string' || !CLASS_WEAPONS.some((entry) => entry.classId === classId)) {
    return undefined;
  }
  const look: CompanionLookChoice = {};
  if (isRecord(value.look)) {
    for (const key of ['skin', 'hair', 'outfit'] as const) {
      if (typeof value.look[key] === 'string') look[key] = value.look[key];
    }
  }
  return { loadout, weapon: { classId, upgraded: upgraded === true }, look };
}

/** The snapshot's class, if it is a known class with a tier; anything else is left out. */
function readHeroClass(value: unknown): { id: string; tier: number } | undefined {
  if (!isRecord(value) || typeof value.id !== 'string' || !HERO_CLASS_BY_ID.has(value.id)) {
    return undefined;
  }
  if (!isCount(value.tier) || !Number.isInteger(value.tier) || value.tier < 1) return undefined;
  return { id: value.id, tier: value.tier };
}
