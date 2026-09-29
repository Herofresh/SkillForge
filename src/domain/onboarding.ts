/**
 * First-run onboarding rules (PLAN 4.1, ADR-031): the hero name, the goal list limits and the
 * summary shown at the end. Pure; the store persists the results and the screens render them.
 */
import { computeCharacter, type Character } from './character';
import type { ProgressMap } from './progression';
import type { ExerciseNode } from './types';

/** Longest hero name, in characters (after trimming). Keeps it readable in pixel titles. */
export const HERO_NAME_MAX_LENGTH = 24;

/** How many goals onboarding lets the user pick (PLAN 4.1: 1–5). */
export const MIN_GOALS = 1;
export const MAX_GOALS = 5;

/** The onboarding steps in order (the screens map to them one to one). */
export const ONBOARDING_STEPS = ['hero', 'equipment', 'goals', 'assessment', 'summary'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** 1-based position of a step, for the "STEP 2 / 5" indicator. */
export function onboardingStepNumber(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step) + 1;
}

/** The stored `onboarding_completed_at` setting as a timestamp, `undefined` when unset or invalid. */
export function parseOnboardingCompletedAt(stored: unknown): number | undefined {
  return typeof stored === 'number' && Number.isFinite(stored) ? stored : undefined;
}

/**
 * When onboarding counts as completed after "Begin": the first completion is kept, so replaying the
 * intro from Settings (PLAN 5.10, ADR-046) and finishing it again changes nothing; only a first run
 * (nothing stored) takes `now`.
 */
export function onboardingCompletionAt(stored: unknown, now: number): number {
  return parseOnboardingCompletedAt(stored) ?? now;
}

/**
 * The hero name as stored: trimmed, inner whitespace collapsed, at most `HERO_NAME_MAX_LENGTH`
 * characters. `undefined` when nothing is left (the name is required).
 */
export function normalizeHeroName(raw: string): string | undefined {
  const collapsed = raw.trim().replace(/\s+/g, ' ');
  if (collapsed.length === 0) return undefined;
  return [...collapsed].slice(0, HERO_NAME_MAX_LENGTH).join('').trimEnd();
}

export interface GoalToggle {
  goals: string[];
  /** False when the goal could not be added because the list is full. */
  changed: boolean;
}

/**
 * Adds `nodeId` to the end of the goal list, or removes it if it is already a goal. Adding to a
 * full list (`max` goals) changes nothing.
 */
export function toggleGoal(
  goals: readonly string[],
  nodeId: string,
  max: number = MAX_GOALS,
): GoalToggle {
  if (goals.includes(nodeId)) {
    return { goals: goals.filter((id) => id !== nodeId), changed: true };
  }
  if (goals.length >= max) return { goals: [...goals], changed: false };
  return { goals: [...goals, nodeId], changed: true };
}

export interface OnboardingSummary {
  character: Character;
  /** The goal nodes, most important first (unknown ids are skipped). */
  goals: ExerciseNode[];
  /** Nodes whose Trial is passed (tested out in the assessment), easiest first. */
  testedOut: ExerciseNode[];
}

/** What the "Your journey begins" screen shows. */
export function onboardingSummary(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
  totalXp: number,
  goals: readonly string[],
): OnboardingSummary {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return {
    character: computeCharacter(nodes, progress, totalXp),
    goals: goals.flatMap((id) => byId.get(id) ?? []),
    testedOut: nodes
      .filter((node) => progress[node.id]?.trialPassed)
      .sort((a, b) => a.ogLevel - b.ogLevel || a.id.localeCompare(b.id)),
  };
}
