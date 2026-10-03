/**
 * View models of the Character tab (PLAN 4.5): the character sheet (level, rank, attributes for the
 * radar, the push/pull balance note, streak, totals, the hero classes of PLAN 6.9), the recent
 * sessions list and the goals with their progress along the goal paths. Pure: screens only render
 * what these return.
 */
import { HERO_CLASSES } from '@/data/classes';
import { compareCodeUnits } from '@/lib/compare';

import { goalPathNodes } from './assessment';
import { challengeView, type ChallengePin, type ChallengeView } from './challenges';
import {
  branchOgLevels,
  characterLevelProgress,
  computeCharacter,
  RANK_MIN_MEDIAN_OG_LEVEL,
  type AttributeValues,
} from './character';
import {
  classFacts,
  classLadder,
  EMPTY_CLASS_SETTINGS,
  type ClassRow,
  type ClassSettings,
} from './classes';
import { formatOgLevel } from './format';
import { resolveNode, type ProgressMap } from './progression';
import { rankLadder, type RankLadder } from './rankLadder';
import type { EngineState, SessionResult } from './recompute';
import { tierForOgLevel } from './tier';
import {
  ATTRIBUTES,
  type Attribute,
  type ExerciseNode,
  type LevelProgress,
  type LoggedSession,
  type NodeLookup,
  type NodeState,
  type RankTitle,
  type Tier,
} from './types';
import { STREAK_MAX_GAP_MS } from './xp';

/** How many sessions the Character tab lists (newest first). */
export const RECENT_SESSIONS_LIMIT = 10;
/** How many exercise names a session row spells out before "+ n more". */
export const SESSION_TITLE_NAMES = 2;

const lookupOf = (nodes: readonly ExerciseNode[]): NodeLookup =>
  new Map(nodes.map((node) => [node.id, node]));

const nameOf = (lookup: NodeLookup, id: string): string => lookup.get(id)?.name ?? id;

/** One radar axis: the attribute points and their share of the largest attribute (0–1). */
export interface RadarAxis {
  attribute: Attribute;
  value: number;
  fraction: number;
}

/**
 * The six attributes for the radar, in `ATTRIBUTES` order, normalised to the largest one (ADR-023:
 * attribute points are open-ended sums, so the shape shows the balance, not an absolute scale).
 * All zero → every fraction 0.
 */
export function radarAxes(attributes: Readonly<AttributeValues>): RadarAxis[] {
  const largest = Math.max(0, ...ATTRIBUTES.map((attribute) => attributes[attribute]));
  return ATTRIBUTES.map((attribute) => ({
    attribute,
    value: attributes[attribute],
    fraction: largest > 0 ? attributes[attribute] / largest : 0,
  }));
}

/** The next rank above `rank` and the median branch ogLevel it needs; `undefined` for Legend. */
export function nextRank(
  rank: RankTitle,
): { rank: RankTitle; minMedianOgLevel: number } | undefined {
  const index = RANK_MIN_MEDIAN_OG_LEVEL.findIndex((entry) => entry.rank === rank);
  if (index <= 0) return undefined; // highest first: Legend (index 0) has no next rank
  const next = RANK_MIN_MEDIAN_OG_LEVEL[index - 1];
  return { rank: next.rank, minMedianOgLevel: next.min };
}

/** The line under the rank: where the hero stands and what the next rank needs. */
export function rankHint(
  medianOgLevel: number,
  next: { rank: RankTitle; minMedianOgLevel: number } | undefined,
): string {
  const standing = `Branch median ${formatOgLevel(medianOgLevel)}`;
  return next
    ? `${standing} · ${next.rank} at ${formatOgLevel(next.minMedianOgLevel)}`
    : `${standing} · the highest rank`;
}

/**
 * The streak as it stands now: the engine's streak while the next session can still extend it
 * (the last one started at most `STREAK_MAX_GAP_MS` ago), else 0 (the next session starts over).
 */
export function activeStreak(
  engine: Pick<EngineState, 'streak' | 'lastSessionAt'>,
  now: number,
): number {
  if (engine.lastSessionAt === undefined) return 0;
  return now - engine.lastSessionAt <= STREAK_MAX_GAP_MS ? engine.streak : 0;
}

export interface CharacterTotals {
  sessions: number;
  /** Sets actually done (a skipped set, `actual.value` 0, doesn't count). */
  sets: number;
  /** Nodes whose Trial is passed (tested out or earned). */
  trialsPassed: number;
}

export function characterTotals(
  sessions: readonly LoggedSession[],
  progress: ProgressMap,
): CharacterTotals {
  return {
    sessions: sessions.length,
    sets: sessions.reduce(
      (count, session) => count + session.sets.filter((set) => set.actual.value > 0).length,
      0,
    ),
    trialsPassed: Object.values(progress).filter((entry) => entry.trialPassed).length,
  };
}

/** The push/pull balance note: both peaks, and which side is behind. */
export interface BalanceNote {
  pushPeak: number;
  pullPeak: number;
  weaker: 'push' | 'pull';
  message: string;
}

export function balanceNote(peakOgLevels: Readonly<AttributeValues>): BalanceNote {
  const weaker = peakOgLevels.push < peakOgLevels.pull ? 'push' : 'pull';
  const stronger = weaker === 'push' ? 'pull' : 'push';
  const message =
    `Your best ${stronger} skill (${formatOgLevel(peakOgLevels[stronger])}) is well ahead of ` +
    `your best ${weaker} skill (${formatOgLevel(peakOgLevels[weaker])}). Unbalanced shoulders ` +
    `get hurt more often: give ${weaker} work some extra attention. Workouts already favour it.`;
  return { pushPeak: peakOgLevels.push, pullPeak: peakOgLevels.pull, weaker, message };
}

/** One row of the recent sessions list. */
export interface SessionListItem {
  sessionId: string;
  at: number;
  /** "Pull-up, Hollow hold + 2 more", or "Trial: Tuck planche" for a Trial-only session. */
  title: string;
  exercises: number;
  /** Sets actually done. */
  sets: number;
  /** Total character XP of the session (from its `SessionResult`); 0 when it has none. */
  xp: number;
  trialsPassed: number;
}

/** The exercise ids of a session in the order they were first logged. */
function sessionNodeIds(session: LoggedSession): string[] {
  return [
    ...new Set([...session.sets].sort((a, b) => a.setIndex - b.setIndex).map((set) => set.nodeId)),
  ];
}

export function sessionListItem(
  session: LoggedSession,
  result: SessionResult | undefined,
  lookup: NodeLookup,
): SessionListItem {
  const ids = sessionNodeIds(session);
  const allTrial = session.sets.length > 0 && session.sets.every((set) => set.isTrial);
  const names = ids.slice(0, SESSION_TITLE_NAMES).map((id) => nameOf(lookup, id));
  const more = ids.length - names.length;
  const title =
    allTrial && ids.length === 1
      ? `Trial: ${names[0]}`
      : names.join(', ') + (more > 0 ? ` + ${more} more` : '');
  return {
    sessionId: session.id,
    at: session.startedAt,
    title: title.length > 0 ? title : 'Empty session',
    exercises: ids.length,
    sets: session.sets.filter((set) => set.actual.value > 0).length,
    xp: result?.xp.total ?? 0,
    trialsPassed: result?.exercises.filter((exercise) => exercise.trialPassed).length ?? 0,
  };
}

/** The newest `limit` sessions, newest first. */
export function recentSessions(
  sessions: readonly LoggedSession[],
  results: Readonly<Record<string, SessionResult>>,
  nodes: readonly ExerciseNode[],
  limit: number = RECENT_SESSIONS_LIMIT,
): SessionListItem[] {
  const lookup = lookupOf(nodes);
  return [...sessions]
    .sort((a, b) => b.startedAt - a.startedAt || compareCodeUnits(b.id, a.id))
    .slice(0, limit)
    .map((session) => sessionListItem(session, results[session.id], lookup));
}

/** A goal and how far along its path (the goal plus its transitive hard prerequisites) the user is. */
export interface GoalProgressView {
  nodeId: string;
  name: string;
  tier: Tier;
  state: NodeState;
  /** Path nodes with a passed Trial. */
  stepsDone: number;
  stepsTotal: number;
  fraction: number;
  /** The easiest path node that isn't proficient and can be trained now (else the easiest one left). */
  next?: { nodeId: string; name: string };
}

const isDone = (state: NodeState): boolean => state === 'proficient' || state === 'mastered';

export function goalProgress(
  nodes: readonly ExerciseNode[],
  progress: ProgressMap,
  goals: readonly string[],
): GoalProgressView[] {
  const lookup = lookupOf(nodes);
  return goals
    .map((goalId) => lookup.get(goalId))
    .filter((goal): goal is ExerciseNode => goal !== undefined)
    .map((goal) => {
      const path = goalPathNodes(nodes, [goal.id]).map((node) => ({
        node,
        state: resolveNode(node, progress, lookup).state,
      }));
      const open = path.filter((entry) => !isDone(entry.state));
      const next = open.find((entry) => entry.state !== 'locked') ?? open[0];
      const stepsDone = path.length - open.length;
      return {
        nodeId: goal.id,
        name: goal.name,
        tier: tierForOgLevel(goal.ogLevel),
        state: resolveNode(goal, progress, lookup).state,
        stepsDone,
        stepsTotal: path.length,
        fraction: path.length === 0 ? 0 : stepsDone / path.length,
        ...(next ? { next: { nodeId: next.node.id, name: next.node.name } } : {}),
      };
    });
}

/** Everything the Character tab shows. */
export interface CharacterSheet {
  heroName?: string;
  level: LevelProgress;
  totalXp: number;
  rank: RankTitle;
  medianOgLevel: number;
  nextRank?: { rank: RankTitle; minMedianOgLevel: number };
  /** `rankHint`: the median and the next rank's threshold. */
  rankHint: string;
  /** Every rank and what the locked ones need (PLAN 6.7), opened from the rank crest. */
  ladder: RankLadder;
  /** Every hero class with its tier and next requirement (PLAN 6.9), in `HERO_CLASSES` order. */
  classes: ClassRow[];
  /** The class the hero wears (one of `classes`). */
  wornClass: ClassRow;
  /** This week's class challenge (PLAN 6.9b); absent when the class offers none. */
  challenge?: ChallengeView;
  radar: RadarAxis[];
  /** Present when push and pull peaks are more than `PUSH_PULL_MAX_GAP` OG levels apart. */
  balance?: BalanceNote;
  streak: number;
  totals: CharacterTotals;
  recent: SessionListItem[];
  goals: GoalProgressView[];
}

export interface CharacterSheetInput {
  nodes: readonly ExerciseNode[];
  engine: EngineState;
  sessions: readonly LoggedSession[];
  sessionResults: Readonly<Record<string, SessionResult>>;
  goals: readonly string[];
  heroName?: string;
  /** The stored class settings (PLAN 6.9); none = the starting class only. */
  classes?: ClassSettings;
  /** The pinned weekly class challenges (PLAN 6.9b); none = a preview of the worn class's. */
  challengePins?: readonly ChallengePin[];
  now: number;
}

export function characterSheet(input: CharacterSheetInput): CharacterSheet {
  const { nodes, engine, sessions, sessionResults, goals, heroName, now } = input;
  const character = computeCharacter(nodes, engine.progress, engine.totalXp);
  const next = nextRank(character.rank);
  const classes = classLadder(
    HERO_CLASSES,
    classFacts(nodes, engine, sessions.length),
    input.classes ?? EMPTY_CLASS_SETTINGS,
  );
  const wornClass = classes.find((row) => row.status === 'worn') as ClassRow;
  const challenge = challengeView({
    classes: HERO_CLASSES,
    worn: { classId: wornClass.classId, tier: wornClass.tier },
    pins: input.challengePins ?? [],
    sessions,
    nodes,
    now,
  });
  return {
    ...(heroName !== undefined ? { heroName } : {}),
    level: characterLevelProgress(engine.totalXp),
    totalXp: engine.totalXp,
    rank: character.rank,
    medianOgLevel: character.medianOgLevel,
    ...(next ? { nextRank: next } : {}),
    rankHint: rankHint(character.medianOgLevel, next),
    ladder: rankLadder(branchOgLevels(nodes, engine.progress)),
    classes,
    wornClass,
    ...(challenge ? { challenge } : {}),
    radar: radarAxes(character.attributes),
    ...(character.pushPullWarning ? { balance: balanceNote(character.peakOgLevels) } : {}),
    streak: activeStreak(engine, now),
    totals: characterTotals(sessions, engine.progress),
    recent: recentSessions(sessions, sessionResults, nodes),
    goals: goalProgress(nodes, engine.progress, goals),
  };
}
