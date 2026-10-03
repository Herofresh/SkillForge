/**
 * Weekly class challenges (PLAN 6.9b, ADR-058): the worn hero class offers one optional goal per
 * calendar week (local Monday to Sunday), e.g. "Pull work in 3 sessions". Completing it pays a
 * small flat XP bonus once (`CLASS_CHALLENGE_BONUS_XP`) and counts as a badge; missing it costs
 * nothing. Pure.
 *
 * - **Pinned per week.** The first session of a week pins the challenge of the class worn then
 *   (`pinWeek`): its window, class and tier. Wearing another class later that week changes nothing
 *   until next Monday, so switching classes can't collect a second bonus. Until the first session,
 *   the card previews the worn class's challenge.
 * - **Recomputable (ADR-008).** The pins are stored user data (the `class_challenges` setting,
 *   part of backups) like `UserAction`s; progress and the bonus are derived from the logged sets in
 *   the window. `recompute(nodes, sessions, actions, weeklyChallenges(pins))` reproduces every
 *   bonus, the incremental path runs the same step (`advanceChallenge`).
 * - **Never more tendon load.** Straight-arm nodes never count towards a challenge, and nothing
 *   here reaches the generator or the safeguards (ADR-023 unchanged).
 */
import { localWeekBounds } from '@/lib/time';

import { nodeAttributes } from './character';
import type {
  Attribute,
  ClassChallengeDefinition,
  ClassDefinition,
  ChallengeGoal,
  ExerciseNode,
  LoggedSession,
  LoggedSet,
  NodeLookup,
  WeeklyChallenge,
} from './types';
import { isSessionComplete } from './xp';

/** Layout version of the stored `class_challenges` setting. */
export const CHALLENGE_SETTINGS_VERSION = 1;

/** A class's challenge at a tier (tier I below 1, the last target beyond the list). */
export function classChallenge(
  definition: Pick<ClassDefinition, 'challenge'>,
  tier: number,
): { goal: ChallengeGoal; target: number } | undefined {
  const challenge: ClassChallengeDefinition | undefined = definition.challenge;
  if (!challenge || challenge.targets.length === 0) return undefined;
  const index = Math.min(Math.max(1, tier), challenge.targets.length) - 1;
  return { goal: challenge.goal, target: challenge.targets[index] };
}

/** The challenge of `definition` at `tier` for the calendar week around `at`. */
export function weeklyChallenge(
  definition: Pick<ClassDefinition, 'challenge'>,
  tier: number,
  at: number,
): WeeklyChallenge | undefined {
  const challenge = classChallenge(definition, tier);
  return challenge ? { ...localWeekBounds(at), ...challenge } : undefined;
}

/** The sets that can count: done (value above 0), on a known node that is not straight-arm. */
function countedSets(session: LoggedSession, lookup: NodeLookup): LoggedSet[] {
  return session.sets.filter((set) => {
    const node = lookup.get(set.nodeId);
    return node !== undefined && !node.straightArm && set.actual.value > 0;
  });
}

const trains = (node: ExerciseNode | undefined, attribute: Attribute): boolean =>
  node !== undefined && nodeAttributes(node).includes(attribute);

/** How much one logged session adds to a challenge with `goal`. */
export function challengeContribution(
  goal: ChallengeGoal,
  session: LoggedSession,
  lookup: NodeLookup,
): number {
  const sets = countedSets(session, lookup);
  if (sets.length === 0) return 0;
  const nodeIds = [...new Set(sets.map((set) => set.nodeId))];
  switch (goal.kind) {
    case 'sessions':
      return 1;
    case 'complete_sessions':
      // A skipped straight-arm set (e.g. skipped for the tendons) never costs progress either.
      return isSessionComplete(
        session.sets.filter((set) => {
          const node = lookup.get(set.nodeId);
          return node !== undefined && !node.straightArm;
        }),
      )
        ? 1
        : 0;
    case 'sessions_training':
      return goal.attributes.every((attribute) =>
        nodeIds.some((nodeId) => trains(lookup.get(nodeId), attribute)),
      )
        ? 1
        : 0;
    case 'exercises_training':
      return nodeIds.filter((nodeId) => trains(lookup.get(nodeId), goal.attribute)).length;
    case 'trial_attempts':
      return new Set(sets.filter((set) => set.isTrial).map((set) => set.nodeId)).size;
  }
}

/** The challenge whose window holds `at`, if any. */
export function challengeAt(
  challenges: readonly WeeklyChallenge[],
  at: number,
): WeeklyChallenge | undefined {
  return challenges.find((challenge) => at >= challenge.start && at < challenge.end);
}

/** The engine's running count for the latest challenge window a session fell into. */
export interface ChallengeTally {
  start: number;
  count: number;
}

/** What one session did for its week's challenge (`SessionResult.challenge`). */
export interface ChallengeStep {
  /** The window start (identifies the week and its pin). */
  start: number;
  /** What this session added. */
  gained: number;
  /** The week's count after this session. */
  count: number;
  target: number;
  /** This session reached the target (earns the bonus; exactly one session per week can). */
  completed: boolean;
}

/**
 * The engine step: adds `session` to its week's tally. Sessions replay in time order, so one
 * running tally is enough; a session in another window starts a new one. No challenge for the
 * session's week = no step (the tally is kept).
 */
export function advanceChallenge(
  tally: ChallengeTally | undefined,
  challenges: readonly WeeklyChallenge[],
  session: LoggedSession,
  lookup: NodeLookup,
): { tally?: ChallengeTally; step?: ChallengeStep } {
  const challenge = challengeAt(challenges, session.startedAt);
  if (!challenge) return tally ? { tally } : {};
  const before = tally?.start === challenge.start ? tally.count : 0;
  const gained = challengeContribution(challenge.goal, session, lookup);
  const count = before + gained;
  return {
    tally: { start: challenge.start, count },
    step: {
      start: challenge.start,
      gained,
      count,
      target: challenge.target,
      completed: before < challenge.target && count >= challenge.target,
    },
  };
}

/** Where a week's challenge stands, computed from the logged sessions in its window. */
export interface ChallengeProgress {
  count: number;
  target: number;
  completed: boolean;
  /** 0–1 towards the target. */
  fraction: number;
}

export function challengeProgress(
  challenge: WeeklyChallenge,
  sessions: readonly LoggedSession[],
  nodes: readonly ExerciseNode[],
): ChallengeProgress {
  const lookup: NodeLookup = new Map(nodes.map((node) => [node.id, node]));
  const count = sessions
    .filter((session) => session.startedAt >= challenge.start && session.startedAt < challenge.end)
    .reduce((sum, session) => sum + challengeContribution(challenge.goal, session, lookup), 0);
  const completed = count >= challenge.target;
  return {
    count,
    target: challenge.target,
    completed,
    fraction: completed || challenge.target <= 0 ? 1 : count / challenge.target,
  };
}

// --- Pins (the stored form) ------------------------------------------------------------------

/** The challenge a week got: its window and the class (and tier) worn at its first session. */
export interface ChallengePin {
  start: number;
  end: number;
  classId: string;
  tier: number;
}

/** The pin whose window holds `at`. */
export function pinAt(pins: readonly ChallengePin[], at: number): ChallengePin | undefined {
  return pins.find((pin) => at >= pin.start && at < pin.end);
}

/**
 * `pins` with the week around `at` pinned to `classId` at `tier`; unchanged (the same array) when
 * that week already has a pin. Kept in time order.
 */
export function pinWeek(
  pins: readonly ChallengePin[],
  classId: string,
  tier: number,
  at: number,
): readonly ChallengePin[] {
  if (pinAt(pins, at)) return pins;
  const pin: ChallengePin = { ...localWeekBounds(at), classId, tier };
  return [...pins, pin].sort((a, b) => a.start - b.start);
}

/** The engine's challenges: one per pin of a known class that offers one. */
export function weeklyChallenges(
  pins: readonly ChallengePin[],
  classes: readonly ClassDefinition[],
): WeeklyChallenge[] {
  const byId = new Map(classes.map((definition) => [definition.id, definition]));
  return pins.flatMap((pin) => {
    const definition = byId.get(pin.classId);
    const challenge = definition ? classChallenge(definition, pin.tier) : undefined;
    return challenge ? [{ start: pin.start, end: pin.end, ...challenge }] : [];
  });
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isTime = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

function readPin(value: unknown): ChallengePin | undefined {
  if (!isRecord(value)) return undefined;
  const { start, end, classId, tier } = value;
  if (!isTime(start) || !isTime(end) || end <= start) return undefined;
  if (typeof classId !== 'string' || typeof tier !== 'number' || !Number.isInteger(tier))
    return undefined;
  if (tier < 1) return undefined;
  return { start, end, classId, tier };
}

/**
 * Reads the stored `class_challenges` setting. Tolerant: a missing or unreadable value is no pins,
 * broken entries and entries overlapping an earlier one are dropped. Unknown class ids are kept
 * (`weeklyChallenges` ignores them), so a later release can still read them.
 */
export function parseChallengePins(raw: unknown): ChallengePin[] {
  if (!isRecord(raw) || !Array.isArray(raw.pins)) return [];
  const pins = raw.pins
    .map(readPin)
    .filter((pin): pin is ChallengePin => pin !== undefined)
    .sort((a, b) => a.start - b.start);
  return pins.filter((pin, index) => index === 0 || pin.start >= pins[index - 1].end);
}

/** The JSON value stored in the `class_challenges` setting. */
export function challengePinsToRaw(pins: readonly ChallengePin[]): Record<string, unknown> {
  return { version: CHALLENGE_SETTINGS_VERSION, pins };
}

// --- Character tab view model ----------------------------------------------------------------

export interface ChallengeView extends ChallengeProgress {
  /** The class whose challenge it is (the pinned one, else the worn one). */
  classId: string;
  tier: number;
  goal: ChallengeGoal;
  /** The week's window. */
  start: number;
  end: number;
  /** Fixed for the week (a session was logged); else a preview of the worn class's challenge. */
  pinned: boolean;
  /** The worn class when it differs from the pinned one (its challenge starts next week). */
  nextClassId?: string;
  /** Weeks whose challenge was completed, this one included (the badge count). */
  completedWeeks: number;
}

/**
 * The challenge of the week around `now`: the pinned one, or a preview of the worn class's. No
 * challenge when that class offers none.
 */
export function challengeView(input: {
  classes: readonly ClassDefinition[];
  worn: { classId: string; tier: number };
  pins: readonly ChallengePin[];
  sessions: readonly LoggedSession[];
  nodes: readonly ExerciseNode[];
  now: number;
}): ChallengeView | undefined {
  const { classes, worn, pins, sessions, nodes, now } = input;
  const pin = pinAt(pins, now);
  const owner = pin ?? { classId: worn.classId, tier: worn.tier };
  const definition = classes.find((entry) => entry.id === owner.classId);
  const challenge = definition ? weeklyChallenge(definition, owner.tier, now) : undefined;
  if (!challenge) return undefined;
  const window = pin ? { ...challenge, start: pin.start, end: pin.end } : challenge;
  const completedWeeks = weeklyChallenges(pins, classes).filter(
    (entry) => challengeProgress(entry, sessions, nodes).completed,
  ).length;
  return {
    ...challengeProgress(window, sessions, nodes),
    classId: owner.classId,
    tier: owner.tier,
    goal: window.goal,
    start: window.start,
    end: window.end,
    pinned: pin !== undefined,
    ...(pin && pin.classId !== worn.classId ? { nextClassId: worn.classId } : {}),
    completedWeeks,
  };
}
