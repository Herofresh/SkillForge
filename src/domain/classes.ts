/**
 * Hero classes (PLAN 6.9, ADR-057): which class tiers the hero has reached, what the next ones
 * need, which class the hero wears, and the stored form of all that. Pure; the class definitions
 * are data (`src/data/classes.ts`).
 *
 * Classes are cosmetic. A tier's rule is a flat threshold over values the engine already derives
 * and that only grow with training (attribute points, logged sessions, rank), so evaluating the
 * current state gives the same answer as replaying the history (ADR-008): a restore or an upgrade
 * shows every tier the hero qualifies for at once. Reached tiers are also kept in the
 * `hero_classes` setting, so a tier stays reached forever, even if a later tree edit or rule
 * change would lower the numbers.
 */
import { computeCharacter, RANK_MIN_MEDIAN_OG_LEVEL, type AttributeValues } from './character';
import type { EngineState } from './recompute';
import {
  ATTRIBUTES,
  RANK_TITLES,
  type Attribute,
  type ClassDefinition,
  type ClassRule,
  type ClassTierUnlock,
  type ClassUnlocks,
  type ExerciseNode,
  type RankTitle,
} from './types';

/** Layout version of the stored `hero_classes` setting. */
export const CLASS_SETTINGS_VERSION = 1;

/** What the class rules look at: values derived from the engine state and the history. */
export interface ClassFacts {
  attributes: AttributeValues;
  /** Logged sessions (Trials and onboarding test-outs are sessions too). */
  sessions: number;
  rank: RankTitle;
  /** The rank median (progress towards a rank rule). */
  medianOgLevel: number;
}

export function classFacts(
  nodes: readonly ExerciseNode[],
  engine: Pick<EngineState, 'progress' | 'totalXp'>,
  sessionCount: number,
): ClassFacts {
  const character = computeCharacter(nodes, engine.progress, engine.totalXp);
  return {
    attributes: character.attributes,
    sessions: sessionCount,
    rank: character.rank,
    medianOgLevel: character.medianOgLevel,
  };
}

/** One measurable part of a rule, with where the hero stands. */
export type RequirementPart = (
  | { kind: 'attribute'; attribute: Attribute }
  | { kind: 'sessions' }
  | { kind: 'rank'; rank: RankTitle; currentRank: RankTitle }
) & {
  /** Attribute points, sessions, or for a rank the rank median. */
  current: number;
  target: number;
  met: boolean;
  /** 0–1 towards `target`. */
  fraction: number;
};

const minOgLevelOf = (rank: RankTitle): number =>
  RANK_MIN_MEDIAN_OG_LEVEL.find((entry) => entry.rank === rank)?.min ?? 0;

const rankIndex = (rank: RankTitle): number => RANK_TITLES.indexOf(rank);

function part<T extends object>(
  shape: T,
  current: number,
  target: number,
  met = current >= target,
): T & { current: number; target: number; met: boolean; fraction: number } {
  const fraction = met ? 1 : target <= 0 ? 1 : Math.min(1, Math.max(0, current / target));
  return { ...shape, current, target, met, fraction };
}

/** The parts of `rule` and how far the hero is on each; `start` has none (always met). */
export function ruleParts(rule: ClassRule, facts: ClassFacts): RequirementPart[] {
  switch (rule.kind) {
    case 'start':
      return [];
    case 'stats':
      return ATTRIBUTES.filter((attribute) => rule.points[attribute] !== undefined).map(
        (attribute) =>
          part(
            { kind: 'attribute' as const, attribute },
            facts.attributes[attribute],
            rule.points[attribute] as number,
          ),
      );
    case 'sessions':
      return [part({ kind: 'sessions' as const }, facts.sessions, rule.count)];
    case 'rank':
      return [
        part(
          { kind: 'rank' as const, rank: rule.rank, currentRank: facts.rank },
          facts.medianOgLevel,
          minOgLevelOf(rule.rank),
          rankIndex(facts.rank) >= rankIndex(rule.rank),
        ),
      ];
  }
}

export function ruleMet(rule: ClassRule, facts: ClassFacts): boolean {
  return ruleParts(rule, facts).every((entry) => entry.met);
}

/** 0–1: the mean of the parts' fractions (1 for a rule without parts). */
export function ruleFraction(parts: readonly RequirementPart[]): number {
  if (parts.length === 0) return 1;
  return parts.reduce((sum, entry) => sum + entry.fraction, 0) / parts.length;
}

/** A class every hero has from the start (its first tier's rule is `start`). */
export function isStartingClass(definition: ClassDefinition): boolean {
  return definition.tiers[0]?.rule.kind === 'start';
}

/** How many tiers of `definition` the facts meet, counted from tier I (a missed tier stops it). */
export function reachedTier(definition: ClassDefinition, facts: ClassFacts): number {
  const firstMissed = definition.tiers.findIndex((tier) => !ruleMet(tier.rule, facts));
  return firstMissed === -1 ? definition.tiers.length : firstMissed;
}

/** A class tier reached for the first time. `tier` counts from 1 (tier I). */
export interface ClassTierUp {
  classId: string;
  tier: number;
}

/**
 * Adds the tiers the facts now meet to `unlocks`, stamped with `source` (the session that did it,
 * or the time of a load). Reached tiers are never removed. Starting classes are not stored.
 */
export function mergeClassUnlocks(
  classes: readonly ClassDefinition[],
  unlocks: ClassUnlocks,
  facts: ClassFacts,
  source: ClassTierUnlock,
): { unlocks: ClassUnlocks; gained: ClassTierUp[] } {
  const next: Record<string, readonly ClassTierUnlock[]> = { ...unlocks };
  const gained: ClassTierUp[] = [];
  for (const definition of classes) {
    if (isStartingClass(definition)) continue;
    const have = unlocks[definition.id] ?? [];
    const reached = reachedTier(definition, facts);
    if (reached <= have.length) continue;
    const added: ClassTierUnlock[] = [];
    for (let tier = have.length + 1; tier <= reached; tier++) {
      added.push({ ...source });
      gained.push({ classId: definition.id, tier });
    }
    next[definition.id] = [...have, ...added];
  }
  return { unlocks: gained.length > 0 ? next : unlocks, gained };
}

/** The tier the hero has of a class: 1 for a starting class, else the stored reached tiers. */
export function classTier(definition: ClassDefinition, unlocks: ClassUnlocks): number {
  if (isStartingClass(definition)) return 1;
  return Math.min(unlocks[definition.id]?.length ?? 0, definition.tiers.length);
}

/** The title of a class at a tier (1-based); the class name below tier I. */
export function classTitle(definition: ClassDefinition, tier: number): string {
  return tier <= 0
    ? definition.name
    : definition.tiers[Math.min(tier, definition.tiers.length) - 1].name;
}

const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

/** "I", "II", "III" for tiers 1–3. */
export function tierNumeral(tier: number): string {
  return NUMERALS[tier - 1] ?? String(tier);
}

/** The tier-ups a session earned (for its summary), in class order. */
export function sessionClassTierUps(
  classes: readonly ClassDefinition[],
  unlocks: ClassUnlocks,
  sessionId: string,
): ClassTierUp[] {
  return classes.flatMap((definition) =>
    (unlocks[definition.id] ?? []).flatMap((unlock, index) =>
      unlock.sessionId === sessionId ? [{ classId: definition.id, tier: index + 1 }] : [],
    ),
  );
}

// --- Stored form ---------------------------------------------------------------------------

/** The `hero_classes` setting: the worn class, the reached tiers, and the tiers already seen. */
export interface ClassSettings {
  /** The class the hero chose to wear; unset (or not unlocked) = the starting class. */
  selected?: string;
  unlocks: ClassUnlocks;
  /** The highest tier per class the hero has looked at in the class sheet (for the NEW badge). */
  seen: Readonly<Record<string, number>>;
}

export const EMPTY_CLASS_SETTINGS: ClassSettings = { unlocks: {}, seen: {} };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTime = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function readUnlock(value: unknown): ClassTierUnlock | undefined {
  if (!isRecord(value) || !isTime(value.at)) return undefined;
  return typeof value.sessionId === 'string'
    ? { at: value.at, sessionId: value.sessionId }
    : { at: value.at };
}

/**
 * Reads the stored setting. Tolerant: a missing or unreadable value is the empty state (the
 * reached tiers are then derived again from the history), unknown class ids and broken entries
 * are dropped, a tier list stops at its first broken entry and at the class's tier count.
 */
export function parseClassSettings(
  raw: unknown,
  classes: readonly ClassDefinition[],
): ClassSettings {
  if (!isRecord(raw)) return EMPTY_CLASS_SETTINGS;
  const byId = new Map(classes.map((definition) => [definition.id, definition]));
  const unlocks: Record<string, ClassTierUnlock[]> = {};
  if (isRecord(raw.unlocks)) {
    for (const [id, list] of Object.entries(raw.unlocks)) {
      const definition = byId.get(id);
      if (!definition || isStartingClass(definition) || !Array.isArray(list)) continue;
      const tiers: ClassTierUnlock[] = [];
      for (const entry of list.slice(0, definition.tiers.length)) {
        const unlock = readUnlock(entry);
        if (!unlock) break;
        tiers.push(unlock);
      }
      if (tiers.length > 0) unlocks[id] = tiers;
    }
  }
  const seen: Record<string, number> = {};
  if (isRecord(raw.seen)) {
    for (const [id, tier] of Object.entries(raw.seen)) {
      if (byId.has(id) && typeof tier === 'number' && Number.isInteger(tier) && tier > 0) {
        seen[id] = tier;
      }
    }
  }
  const selected =
    typeof raw.selected === 'string' && byId.has(raw.selected) ? raw.selected : undefined;
  return { ...(selected !== undefined ? { selected } : {}), unlocks, seen };
}

/** The JSON value stored in the `hero_classes` setting. */
export function classSettingsToRaw(settings: ClassSettings): Record<string, unknown> {
  return {
    version: CLASS_SETTINGS_VERSION,
    ...(settings.selected !== undefined ? { selected: settings.selected } : {}),
    unlocks: settings.unlocks,
    seen: settings.seen,
  };
}

/** The class the hero wears: the selected one while it is unlocked, else the starting class. */
export function wornClass(
  classes: readonly ClassDefinition[],
  settings: ClassSettings,
): { classId: string; tier: number } {
  const selected = classes.find((definition) => definition.id === settings.selected);
  if (selected) {
    const tier = classTier(selected, settings.unlocks);
    if (tier > 0) return { classId: selected.id, tier };
  }
  const start = classes.find(isStartingClass) ?? classes[0];
  return { classId: start.id, tier: classTier(start, settings.unlocks) };
}

/** Whether a class has a tier the hero hasn't looked at yet. */
export function isNewClassTier(
  definition: ClassDefinition,
  settings: Pick<ClassSettings, 'unlocks' | 'seen'>,
): boolean {
  if (isStartingClass(definition)) return false;
  return classTier(definition, settings.unlocks) > (settings.seen[definition.id] ?? 0);
}

/** `seen` with every reached tier marked as seen (the hero opened the class sheet). */
export function seenAllTiers(
  classes: readonly ClassDefinition[],
  settings: ClassSettings,
): Record<string, number> {
  const seen: Record<string, number> = { ...settings.seen };
  for (const definition of classes) {
    const tier = classTier(definition, settings.unlocks);
    if (!isStartingClass(definition) && tier > (seen[definition.id] ?? 0))
      seen[definition.id] = tier;
  }
  return seen;
}

// --- Class sheet view model ----------------------------------------------------------------

export type ClassRowStatus = 'worn' | 'unlocked' | 'locked';

export interface ClassRow {
  classId: string;
  name: string;
  /** The title at the reached tier (the class name while locked). */
  title: string;
  /** Reached tiers (0 = locked). */
  tier: number;
  tierCount: number;
  status: ClassRowStatus;
  /** A reached tier the hero hasn't seen in the sheet yet. */
  isNew: boolean;
  /** The next tier to reach and how far the hero is; absent at the top tier. */
  next?: {
    tier: number;
    title: string;
    rule: ClassRule;
    parts: RequirementPart[];
    fraction: number;
  };
}

/** Every class in definition order with its tier, status and next requirement. */
export function classLadder(
  classes: readonly ClassDefinition[],
  facts: ClassFacts,
  settings: ClassSettings,
): ClassRow[] {
  const worn = wornClass(classes, settings).classId;
  return classes.map((definition) => {
    const tier = classTier(definition, settings.unlocks);
    const nextTier = definition.tiers[tier];
    const parts = nextTier ? ruleParts(nextTier.rule, facts) : [];
    return {
      classId: definition.id,
      name: definition.name,
      title: classTitle(definition, tier),
      tier,
      tierCount: definition.tiers.length,
      status: definition.id === worn ? 'worn' : tier > 0 ? 'unlocked' : 'locked',
      isNew: isNewClassTier(definition, settings),
      ...(nextTier
        ? {
            next: {
              tier: tier + 1,
              title: nextTier.name,
              rule: nextTier.rule,
              parts,
              fraction: ruleFraction(parts),
            },
          }
        : {}),
    };
  });
}
