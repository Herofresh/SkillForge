/**
 * Tendon safeguards for straight-arm nodes (PLAN 2.3, ADR-010, ADR-023). Connective tissue adapts
 * far slower than muscle, so these rules recommend slowing straight-arm progress down.
 *
 * Since ADR-023 they are ADVISORY: the user manages their own training. The pure checks below feed
 * two consumers:
 * - the generator's own suggestions keep respecting them (the app's base suggestion stays safe);
 * - the engine and the UI turn violations into `SafeguardWarning`s that the user sees and can
 *   acknowledge. Nothing here blocks logging, a Trial or a test-out.
 * AGENT.md §5: keep them as warnings and in the generator; never remove them silently.
 *
 * The rules:
 * - a straight-arm node's Trial is recommended only after `MIN_WEEKS_AT_LEVEL` weeks of training;
 * - a session holds at most `STRAIGHT_ARM_SESSION_BUDGET_S` seconds of straight-arm work, not
 *   counting the sets of one straight-arm Trial (the Trial-day exception, ADR-025);
 * - straight-arm sessions are at least `STRAIGHT_ARM_REST_HOURS` apart.
 */
import { MS_PER_HOUR, MS_PER_WEEK } from '@/lib/time';

import type {
  ExerciseNode,
  LoggedSession,
  LoggedSet,
  NodeLookup,
  NodeProgress,
  Prerequisite,
  SafeguardWarning,
} from './types';
import { HOLD_SECONDS_PER_UNIT, setUnits } from './xp';

/** Weeks between the first logged set on a straight-arm node and its recommended Trial. */
export const MIN_WEEKS_AT_LEVEL = 6;
/** Straight-arm work per session, in hold seconds (non-hold sets count 2 s per unit). */
export const STRAIGHT_ARM_SESSION_BUDGET_S = 60;
/** Minimum rest between two sessions that contain straight-arm work. */
export const STRAIGHT_ARM_REST_HOURS = 48;

/**
 * When the node's Trial is recommended: `undefined` (no gate) for a bent-arm node, `Infinity` for a
 * straight-arm node that was never trained, else the first training time + `MIN_WEEKS_AT_LEVEL`.
 */
export function trialOpensAt(
  node: ExerciseNode,
  progress: Pick<NodeProgress, 'firstTrainedAt'> | undefined,
): number | undefined {
  if (!node.straightArm) return undefined;
  const first = progress?.firstTrainedAt;
  return first === undefined ? Infinity : first + MIN_WEEKS_AT_LEVEL * MS_PER_WEEK;
}

/** Whether the safeguards recommend a Trial attempt on `node` at time `now` (generator, UI). */
export function isTrialOpenBySafeguards(
  node: ExerciseNode,
  progress: Pick<NodeProgress, 'firstTrainedAt'> | undefined,
  now: number,
): boolean {
  const opensAt = trialOpensAt(node, progress);
  return opensAt === undefined || now >= opensAt;
}

/** Straight-arm load of one set in hold seconds; 0 for sets of bent-arm or unknown nodes. */
export function straightArmSeconds(set: LoggedSet, nodes: NodeLookup): number {
  if (!nodes.get(set.nodeId)?.straightArm) return 0;
  return setUnits(set.metric, set.actual) * HOLD_SECONDS_PER_UNIT;
}

/**
 * The Trial-day exception (ADR-025): the sets of `sets` that do not count against the straight-arm
 * budget. These are the Trial sets of the first straight-arm node with any, at most its
 * `trial.sets` of them (in logged order). A second straight-arm Trial or extra Trial sets count.
 */
export function budgetExemptTrialSets(
  sets: readonly LoggedSet[],
  nodes: NodeLookup,
): Set<LoggedSet> {
  const exempt = new Set<LoggedSet>();
  const first = sets.find((set) => set.isTrial && nodes.get(set.nodeId)?.straightArm);
  if (!first) return exempt;
  const limit = (nodes.get(first.nodeId) as ExerciseNode).trial.sets; // straightArm ⇒ known node
  for (const set of sets) {
    if (exempt.size >= limit) break;
    if (set.isTrial && set.nodeId === first.nodeId) exempt.add(set);
  }
  return exempt;
}

/**
 * Straight-arm hold seconds of `sets` that count against the session budget: every straight-arm
 * set except the `budgetExemptTrialSets`. The one place the budget is measured (warnings and
 * generator).
 */
export function straightArmSecondsUsed(sets: readonly LoggedSet[], nodes: NodeLookup): number {
  const exempt = budgetExemptTrialSets(sets, nodes);
  return sets.reduce(
    (sum, set) => (exempt.has(set) ? sum : sum + straightArmSeconds(set, nodes)),
    0,
  );
}

/** Straight-arm hold seconds still recommended in a session that already contains `sets`. */
export function remainingStraightArmBudget(sets: readonly LoggedSet[], nodes: NodeLookup): number {
  return Math.max(0, STRAIGHT_ARM_SESSION_BUDGET_S - straightArmSecondsUsed(sets, nodes));
}

/** Start time of the latest session that contains any straight-arm set, if any. */
export function lastStraightArmSessionAt(
  sessions: readonly LoggedSession[],
  nodes: NodeLookup,
): number | undefined {
  let latest: number | undefined;
  for (const session of sessions) {
    if (!session.sets.some((set) => nodes.get(set.nodeId)?.straightArm)) continue;
    if (latest === undefined || session.startedAt > latest) latest = session.startedAt;
  }
  return latest;
}

/** Whether straight-arm work is recommended at `now` given the last straight-arm session. */
export function isStraightArmRested(lastSessionAt: number | undefined, now: number): boolean {
  return (
    lastSessionAt === undefined || now - lastSessionAt >= STRAIGHT_ARM_REST_HOURS * MS_PER_HOUR
  );
}

// ---------------------------------------------------------------------------------------------
// Advisory warnings (ADR-023): the same checks, turned into structured warnings for the UI.
// ---------------------------------------------------------------------------------------------

const roundSeconds = (seconds: number): number => Math.round(seconds);

/**
 * Warnings for a Trial attempt (or test-out) on `node` at `now`, before or after it is logged.
 * Empty when the safeguards recommend the attempt.
 */
export function trialWarnings(
  node: ExerciseNode,
  progress: Pick<NodeProgress, 'firstTrainedAt'> | undefined,
  now: number,
): SafeguardWarning[] {
  if (isTrialOpenBySafeguards(node, progress, now)) return [];
  const trained = progress?.firstTrainedAt !== undefined;
  const message = trained
    ? `${node.name} is straight-arm work: a Trial is recommended after ${MIN_WEEKS_AT_LEVEL} weeks of ` +
      'training it, so your tendons can catch up with your muscles.'
    : `${node.name} is straight-arm work you have not trained here yet: a Trial is recommended ` +
      `after ${MIN_WEEKS_AT_LEVEL} weeks of training it. Only test out if you already train it.`;
  return [{ code: 'straight_arm_min_weeks', nodeId: node.id, message, severity: 'warning' }];
}

/**
 * Session-wide warnings for straight-arm work in `sets` (the live session or a logged one) that
 * starts at `startedAt`: over the hold budget (the Trial-day exception applies, so only extra
 * straight-arm work in a Trial session can go over it), or too soon after the last straight-arm
 * session (a Trial session counts as a straight-arm session).
 */
export function sessionSafeguardWarnings(
  sets: readonly LoggedSet[],
  nodes: NodeLookup,
  lastStraightArmAt: number | undefined,
  startedAt: number,
): SafeguardWarning[] {
  const warnings: SafeguardWarning[] = [];
  if (!sets.some((set) => nodes.get(set.nodeId)?.straightArm)) return warnings;
  const used = straightArmSecondsUsed(sets, nodes);
  if (used > STRAIGHT_ARM_SESSION_BUDGET_S) {
    const besides = budgetExemptTrialSets(sets, nodes).size > 0 ? ' besides the Trial' : '';
    warnings.push({
      code: 'straight_arm_budget',
      message:
        `This session has about ${roundSeconds(used)} s of straight-arm work${besides}; about ` +
        `${STRAIGHT_ARM_SESSION_BUDGET_S} s per session is recommended for tendon health.`,
      severity: 'warning',
    });
  }
  if (!isStraightArmRested(lastStraightArmAt, startedAt)) {
    warnings.push({
      code: 'straight_arm_rest',
      message:
        `Your last straight-arm session was less than ${STRAIGHT_ARM_REST_HOURS} h ago; ` +
        `${STRAIGHT_ARM_REST_HOURS} h of rest between straight-arm sessions is recommended.`,
      severity: 'warning',
    });
  }
  return warnings;
}

/** Info warning for a node used while hard prerequisites are unmet; `undefined` when all are met. */
export function prerequisitesWarning(
  node: ExerciseNode,
  unmetHard: readonly Prerequisite[],
  nodes: NodeLookup,
): SafeguardWarning | undefined {
  if (unmetHard.length === 0) return undefined;
  const list = unmetHard
    .map((prereq) => `${nodes.get(prereq.nodeId)?.name ?? prereq.nodeId} L${prereq.minLevel}`)
    .join(', ');
  return {
    code: 'prerequisites_unmet',
    nodeId: node.id,
    message: `${node.name} usually comes after ${list}. You chose to go ahead; build up if it feels too hard.`,
    severity: 'info',
  };
}

/**
 * Whether any of `warnings` comes from a tendon safeguard (not the prerequisites note): the UI then
 * offers the guide's safeguards entry next to them (PLAN 6.10c).
 */
export function hasTendonWarning(warnings: readonly SafeguardWarning[]): boolean {
  return warnings.some((warning) => warning.code !== 'prerequisites_unmet');
}
