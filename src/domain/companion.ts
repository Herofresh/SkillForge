/**
 * The companion (PLAN 6.10, ADR-059): the hero as a small pixel character on the Character tab.
 * Pure: its mood from the time since the last session, the accessories training has earned, what
 * it wears, and the stored form of the hero's choices. Accessory definitions are data
 * (`src/data/companion/`).
 *
 * No punishment (ADR-023): the mood only changes the pose and one line of text. The companion
 * never dies, never gets sick and never loses an accessory; one session cheers it up at once.
 *
 * Unlock rules are flat thresholds over values that only grow with training (like the class
 * rules, ADR-057), so evaluating the current state is the same as replaying the history
 * (ADR-008): a restore or an upgrade shows every accessory already earned. Earned accessories
 * are also kept in the `hero_companion` setting, so they stay earned forever.
 */
import { localDaysBetween } from '@/lib/time';

import { characterLevel, computeCharacter } from './character';
import type { EngineState, SessionResult } from './recompute';
import { tierForOgLevel } from './tier';
import {
  COMPANION_SLOTS,
  RANK_TITLES,
  type AccessoryDefinition,
  type ClassUnlocks,
  type CompanionRule,
  type CompanionSlot,
  type ExerciseNode,
  type RankTitle,
} from './types';

// --- Mood ----------------------------------------------------------------------------------

export const COMPANION_MOODS = ['happy', 'content', 'waiting', 'sad'] as const;
export type CompanionMood = (typeof COMPANION_MOODS)[number];

/** Up to this many calendar days after the last session the companion is content (rest days). */
export const CONTENT_MAX_DAYS = 2;
/** Up to this many days it is waiting; after that it is sad (never worse than sad). */
export const WAITING_MAX_DAYS = 5;

/**
 * The mood at `now`: happy on a day with a session, content for the rest days after it, waiting
 * after `CONTENT_MAX_DAYS`, sad after `WAITING_MAX_DAYS`. A new hero without a session waits for
 * the first one. The next session makes it happy again at once.
 */
export function companionMood(lastSessionAt: number | undefined, now: number): CompanionMood {
  if (lastSessionAt === undefined) return 'waiting';
  const days = localDaysBetween(lastSessionAt, now);
  if (days <= 0) return 'happy';
  if (days <= CONTENT_MAX_DAYS) return 'content';
  if (days <= WAITING_MAX_DAYS) return 'waiting';
  return 'sad';
}

/** A short title per mood for the Character tab. */
export const MOOD_TITLES: Readonly<Record<CompanionMood, string>> = {
  happy: 'Fired up',
  content: 'Rested',
  waiting: 'Restless',
  sad: 'Missing you',
};

/** One friendly line per mood; never guilt, always a way back. */
export function moodLine(mood: CompanionMood, lastSessionAt: number | undefined): string {
  switch (mood) {
    case 'happy':
      return 'Fired up after today’s training!';
    case 'content':
      return 'Resting well. Rest days are part of training.';
    case 'waiting':
      return lastSessionAt === undefined
        ? 'Ready for our first quest together.'
        : 'Getting restless. Up for a session?';
    case 'sad':
      return 'Misses training with you. One session cheers it up.';
  }
}

// --- Unlock rules --------------------------------------------------------------------------

/** What the accessory rules look at, all derived from the history (and the kept class tiers). */
export interface CompanionFacts {
  sessions: number;
  level: number;
  rank: RankTitle;
  /** Reached tiers per class id (`ClassUnlocks` lengths). */
  classTiers: Readonly<Record<string, number>>;
  /** The longest streak ever reached (the best of every session's streak). */
  bestStreak: number;
  trialsPassed: number;
  /** A Trial passed on an elite-tier node. */
  eliteTrialPassed: boolean;
}

export function companionFacts(input: {
  nodes: readonly ExerciseNode[];
  engine: Pick<EngineState, 'progress' | 'totalXp'>;
  sessionCount: number;
  sessionResults: Readonly<Record<string, Pick<SessionResult, 'streak'>>>;
  classUnlocks: ClassUnlocks;
}): CompanionFacts {
  const { nodes, engine } = input;
  const character = computeCharacter(nodes, engine.progress, engine.totalXp);
  const passed = nodes.filter((node) => engine.progress[node.id]?.trialPassed);
  return {
    sessions: input.sessionCount,
    level: characterLevel(engine.totalXp),
    rank: character.rank,
    classTiers: Object.fromEntries(
      Object.entries(input.classUnlocks).map(([id, tiers]) => [id, tiers.length]),
    ),
    bestStreak: Math.max(0, ...Object.values(input.sessionResults).map((result) => result.streak)),
    trialsPassed: Object.values(engine.progress).filter((entry) => entry.trialPassed).length,
    eliteTrialPassed: passed.some((node) => tierForOgLevel(node.ogLevel) === 'elite'),
  };
}

/** Where the hero stands on a rule: a number towards a target (rank: index in `RANK_TITLES`). */
export interface RuleProgress {
  current: number;
  target: number;
  met: boolean;
}

const rankIndex = (rank: RankTitle) => RANK_TITLES.indexOf(rank);

export function companionRuleProgress(rule: CompanionRule, facts: CompanionFacts): RuleProgress {
  const at = (current: number, target: number) => ({ current, target, met: current >= target });
  switch (rule.kind) {
    case 'sessions':
      return at(facts.sessions, rule.count);
    case 'level':
      return at(facts.level, rule.level);
    case 'rank':
      return at(rankIndex(facts.rank), rankIndex(rule.rank));
    case 'class':
      return at(facts.classTiers[rule.classId] ?? 0, rule.tier);
    case 'streak':
      return at(facts.bestStreak, rule.count);
    case 'trials':
      return at(facts.trialsPassed, rule.count);
    case 'eliteTrial':
      return at(facts.eliteTrialPassed ? 1 : 0, 1);
  }
}

export const companionRuleMet = (rule: CompanionRule, facts: CompanionFacts): boolean =>
  companionRuleProgress(rule, facts).met;

/** When an accessory was earned: the time and, when a session did it, that session. */
export interface AccessoryUnlock {
  at: number;
  sessionId?: string;
}

export type AccessoryUnlocks = Readonly<Record<string, AccessoryUnlock>>;

/**
 * Adds the accessories the facts now earn to `unlocks`, stamped with `source`. Earned
 * accessories are never removed. Returns the same object when nothing changed.
 */
export function mergeAccessoryUnlocks(
  accessories: readonly AccessoryDefinition[],
  unlocks: AccessoryUnlocks,
  facts: CompanionFacts,
  source: AccessoryUnlock,
): { unlocks: AccessoryUnlocks; gained: string[] } {
  const gained = accessories
    .filter((item) => unlocks[item.id] === undefined && companionRuleMet(item.rule, facts))
    .map((item) => item.id);
  if (gained.length === 0) return { unlocks, gained };
  const next: Record<string, AccessoryUnlock> = { ...unlocks };
  for (const id of gained) next[id] = { ...source };
  return { unlocks: next, gained };
}

/** The accessories a session earned (for its summary), in catalogue order. */
export function sessionAccessoryUnlocks(
  accessories: readonly AccessoryDefinition[],
  unlocks: AccessoryUnlocks,
  sessionId: string,
): string[] {
  return accessories
    .filter((item) => unlocks[item.id]?.sessionId === sessionId)
    .map((item) => item.id);
}

// --- Stored form ---------------------------------------------------------------------------

/** Layout version of the stored `hero_companion` setting. */
export const COMPANION_SETTINGS_VERSION = 1;

/** The hero's color choices (ids from `src/data/companion/looks.ts`; unset = the default). */
export interface CompanionLookChoice {
  skin?: string;
  hair?: string;
  outfit?: string;
}

/**
 * The `hero_companion` setting. `equipped` per slot: an accessory id the hero chose, `null` for a
 * slot they cleared, absent while they never chose (the slot then shows the grandest earned item).
 */
export interface CompanionSettings {
  unlocks: AccessoryUnlocks;
  equipped: Readonly<Partial<Record<CompanionSlot, string | null>>>;
  look: CompanionLookChoice;
  /** Earned accessories the hero has seen in the customize sheet (for the NEW badge). */
  seen: readonly string[];
}

export const EMPTY_COMPANION_SETTINGS: CompanionSettings = {
  unlocks: {},
  equipped: {},
  look: {},
  seen: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTime = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const LOOK_KEYS = ['skin', 'hair', 'outfit'] as const;

/**
 * Reads the stored setting. Tolerant: a missing or unreadable value is the empty state (the
 * accessories are then earned again from the history), unknown ids and broken entries are
 * dropped, a chosen item must sit in its own slot. Color ids are kept as text (an unknown one
 * draws the default).
 */
export function parseCompanionSettings(
  raw: unknown,
  accessories: readonly AccessoryDefinition[],
): CompanionSettings {
  if (!isRecord(raw)) return EMPTY_COMPANION_SETTINGS;
  const byId = new Map(accessories.map((item) => [item.id, item]));
  const unlocks: Record<string, AccessoryUnlock> = {};
  if (isRecord(raw.unlocks)) {
    for (const [id, entry] of Object.entries(raw.unlocks)) {
      if (!byId.has(id) || !isRecord(entry) || !isTime(entry.at)) continue;
      unlocks[id] =
        typeof entry.sessionId === 'string'
          ? { at: entry.at, sessionId: entry.sessionId }
          : { at: entry.at };
    }
  }
  const equipped: Partial<Record<CompanionSlot, string | null>> = {};
  if (isRecord(raw.equipped)) {
    for (const slot of COMPANION_SLOTS) {
      const value = raw.equipped[slot];
      if (value === null) equipped[slot] = null;
      else if (typeof value === 'string' && byId.get(value)?.slot === slot) equipped[slot] = value;
    }
  }
  const look: CompanionLookChoice = {};
  if (isRecord(raw.look)) {
    for (const key of LOOK_KEYS) {
      const value = raw.look[key];
      if (typeof value === 'string' && value.length > 0) look[key] = value;
    }
  }
  const seen = Array.isArray(raw.seen)
    ? raw.seen.filter((id): id is string => typeof id === 'string' && byId.has(id))
    : [];
  return { unlocks, equipped, look, seen: [...new Set(seen)] };
}

/** The JSON value stored in the `hero_companion` setting. */
export function companionSettingsToRaw(settings: CompanionSettings): Record<string, unknown> {
  return {
    version: COMPANION_SETTINGS_VERSION,
    unlocks: settings.unlocks,
    equipped: settings.equipped,
    look: settings.look,
    seen: settings.seen,
  };
}

// --- What the companion wears --------------------------------------------------------------

/** Accessory id per slot (absent = nothing in that slot). */
export type CompanionLoadout = Readonly<Partial<Record<CompanionSlot, string>>>;

/**
 * What the companion wears: per slot the hero's choice while it is earned, nothing for a slot
 * they cleared, else the last earned accessory of that slot in catalogue order (humble → grand).
 * So an existing hero's companion shows their earned gear the first time it appears.
 */
export function companionLoadout(
  accessories: readonly AccessoryDefinition[],
  settings: Pick<CompanionSettings, 'unlocks' | 'equipped'>,
): CompanionLoadout {
  const loadout: Partial<Record<CompanionSlot, string>> = {};
  for (const slot of COMPANION_SLOTS) {
    const choice = settings.equipped[slot];
    if (choice === null) continue;
    if (choice !== undefined && settings.unlocks[choice] !== undefined) {
      loadout[slot] = choice;
      continue;
    }
    const earned = accessories.filter(
      (item) => item.slot === slot && settings.unlocks[item.id] !== undefined,
    );
    const best = earned[earned.length - 1];
    if (best) loadout[slot] = best.id;
  }
  return loadout;
}

/** The loadout's accessory ids in drawing order (aura and back items first, the head last). */
export const DRAW_ORDER: readonly CompanionSlot[] = ['aura', 'cloak', 'body', 'hands', 'head'];

export function loadoutDrawOrder(loadout: CompanionLoadout): string[] {
  return DRAW_ORDER.flatMap((slot) => (loadout[slot] ? [loadout[slot]] : []));
}

// --- Customize sheet view model ------------------------------------------------------------

export type AccessoryStatus = 'worn' | 'earned' | 'locked';

export interface AccessoryRow {
  id: string;
  name: string;
  rule: CompanionRule;
  status: AccessoryStatus;
  /** Earned and not yet seen in the sheet. */
  isNew: boolean;
  progress: RuleProgress;
}

export interface SlotRow {
  slot: CompanionSlot;
  /** What the slot shows now (absent = nothing). */
  worn?: string;
  /** The hero cleared this slot on purpose. */
  cleared: boolean;
  items: AccessoryRow[];
}

/** Every slot with its accessories (catalogue order), what is worn, and what the locked ones need. */
export function companionWardrobe(
  accessories: readonly AccessoryDefinition[],
  settings: CompanionSettings,
  facts: CompanionFacts,
): SlotRow[] {
  const loadout = companionLoadout(accessories, settings);
  const seen = new Set(settings.seen);
  return COMPANION_SLOTS.map((slot) => ({
    slot,
    ...(loadout[slot] ? { worn: loadout[slot] } : {}),
    cleared: settings.equipped[slot] === null,
    items: accessories
      .filter((item) => item.slot === slot)
      .map((item) => {
        const earned = settings.unlocks[item.id] !== undefined;
        return {
          id: item.id,
          name: item.name,
          rule: item.rule,
          status: loadout[slot] === item.id ? 'worn' : earned ? 'earned' : 'locked',
          isNew: earned && !seen.has(item.id),
          progress: companionRuleProgress(item.rule, facts),
        };
      }),
  }));
}

/** How many earned accessories the hero hasn't seen yet. */
export function newAccessoryCount(settings: Pick<CompanionSettings, 'unlocks' | 'seen'>): number {
  const seen = new Set(settings.seen);
  return Object.keys(settings.unlocks).filter((id) => !seen.has(id)).length;
}

/** Wears `id` in its slot, or clears `slot` with `null`. */
export function equipAccessory(
  accessories: readonly AccessoryDefinition[],
  settings: CompanionSettings,
  slot: CompanionSlot,
  id: string | null,
): CompanionSettings {
  if (id !== null) {
    const item = accessories.find((entry) => entry.id === id);
    if (!item) throw new Error(`Unknown accessory '${id}'`);
    if (item.slot !== slot) throw new Error(`'${id}' is not worn on the ${slot}`);
    if (settings.unlocks[id] === undefined) throw new Error(`'${id}' is not earned yet`);
  }
  return { ...settings, equipped: { ...settings.equipped, [slot]: id } };
}
