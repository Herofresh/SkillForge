/**
 * Pure integrity checks for a set of progression nodes. Used by the build script, the dataset test
 * and the user overlay (`src/domain/overlay.ts`), so a user edit can never produce a broken tree.
 * No React/Expo/DB imports: this module must run in plain Node (ADR-009).
 */
import { STRAIGHT_ARM_BRANCHES } from '@/domain/types';
import type { ExerciseNode, Metric, ValidationIssue } from '@/domain/types';

export const SNAKE_CASE_ID = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
export const USER_ID_PREFIX = 'user_';
export const MIN_OG_LEVEL = 0;
export const MAX_OG_LEVEL = 17;
/** Node levels run 1–10 (ADR-004); a prerequisite asks for one of them. */
export const MIN_PREREQUISITE_LEVEL = 1;
export const MAX_PREREQUISITE_LEVEL = 10;
export const MAX_TRIAL_SETS = 10;

/** Plausible upper bound of a trial/working-range value, per metric. Catches typos like 300 reps. */
export const METRIC_MAX_VALUE: Record<Metric, number> = {
  reps: 50,
  hold_s: 300,
  eccentric_s: 30,
  load_xbw: 3,
};

/** Metrics whose sets consist of several reps of the measured thing (see `Trial.reps`). */
const METRICS_WITH_REPS: readonly Metric[] = ['eccentric_s', 'load_xbw'];

const URL_PATTERN = /^https?:\/\/\S+$/;

type Report = (node: ExerciseNode, message: string) => void;

/** Runs every rule and returns all issues (empty = valid). Issues carry the node id, not the file. */
export function validateNodes(nodes: readonly ExerciseNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const report: Report = (node, message) => issues.push({ nodeId: node.id, message });
  const byId = new Map<string, ExerciseNode>();

  for (const node of nodes) {
    if (byId.has(node.id)) report(node, `id '${node.id}' is used more than once`);
    else byId.set(node.id, node);
  }

  for (const node of nodes) {
    checkIdentity(node, report);
    checkLevels(node, report);
    checkReferences(node, byId, report);
    checkEquipment(node, report);
    checkRangeAndTrial(node, report);
    checkSources(node, report);
    if (STRAIGHT_ARM_BRANCHES.includes(node.branch) && !node.straightArm) {
      report(node, `is in the straight-arm branch '${node.branch}' but straight_arm is not true`);
    }
  }

  checkChains(nodes, report);
  checkCycles(byId, report);
  return issues;
}

/** Human-readable one-liner, e.g. `content/progressions/v_pull.yaml: pull_up: prerequisite …`. */
export function formatIssue(issue: ValidationIssue): string {
  return [issue.file, issue.nodeId, issue.message].filter(Boolean).join(': ');
}

function checkIdentity(node: ExerciseNode, report: Report): void {
  if (!SNAKE_CASE_ID.test(node.id)) {
    report(node, `id '${node.id}' must be snake_case (lowercase letters, digits, underscores)`);
  }
  const hasUserPrefix = node.id.startsWith(USER_ID_PREFIX);
  if (node.source === 'user' && !hasUserPrefix) {
    report(node, `user nodes must have an id starting with '${USER_ID_PREFIX}'`);
  }
  if (node.source === 'core' && hasUserPrefix) {
    report(node, `ids starting with '${USER_ID_PREFIX}' are reserved for user nodes`);
  }
  if (node.name.trim() === '') report(node, 'name must not be empty');
  if (node.patterns.length === 0) report(node, 'needs at least one pattern');
}

function checkLevels(node: ExerciseNode, report: Report): void {
  if (!isIntegerIn(node.ogLevel, MIN_OG_LEVEL, MAX_OG_LEVEL)) {
    report(
      node,
      `og_level ${node.ogLevel} must be a whole number from ${MIN_OG_LEVEL} to ${MAX_OG_LEVEL}`,
    );
  }
  if (!(Number.isFinite(node.chainOrder) && node.chainOrder > 0)) {
    report(node, `order ${node.chainOrder} must be a positive number`);
  }
  for (const prereq of node.prerequisites) {
    if (!isIntegerIn(prereq.minLevel, MIN_PREREQUISITE_LEVEL, MAX_PREREQUISITE_LEVEL)) {
      report(
        node,
        `prerequisite '${prereq.nodeId}' level ${prereq.minLevel} must be a whole number from ` +
          `${MIN_PREREQUISITE_LEVEL} to ${MAX_PREREQUISITE_LEVEL}`,
      );
    }
  }
}

function checkReferences(
  node: ExerciseNode,
  byId: ReadonlyMap<string, ExerciseNode>,
  report: Report,
): void {
  const seen = new Set<string>();
  for (const { nodeId } of node.prerequisites) {
    if (nodeId === node.id) report(node, 'lists itself as a prerequisite');
    else if (!byId.has(nodeId)) report(node, `prerequisite '${nodeId}' does not exist`);
    if (seen.has(nodeId)) report(node, `prerequisite '${nodeId}' is listed twice`);
    seen.add(nodeId);
  }
  for (const alternativeId of node.alternatives) {
    if (alternativeId === node.id) report(node, 'lists itself as an alternative');
    else if (!byId.has(alternativeId))
      report(node, `alternative '${alternativeId}' does not exist`);
  }
  if (node.regressionId !== undefined) {
    if (node.regressionId === node.id) report(node, 'lists itself as its regression');
    else if (!byId.has(node.regressionId)) {
      report(node, `regression '${node.regressionId}' does not exist`);
    }
  }
}

function checkEquipment(node: ExerciseNode, report: Report): void {
  if (node.equipment.length === 0) report(node, 'needs at least one equipment option');
  if (node.equipment.some((option) => option.length === 0)) {
    report(node, 'has an empty equipment option');
  }
}

function checkRangeAndTrial(node: ExerciseNode, report: Report): void {
  const { workingRange: range, trial, metric } = node;
  const maxValue = METRIC_MAX_VALUE[metric];
  const wholeNumbers = metric === 'reps';

  if (!(range.min > 0 && range.min <= range.max && range.max <= maxValue)) {
    report(
      node,
      `working_range ${range.min}-${range.max} must satisfy 0 < min <= max <= ${maxValue} for ${metric}`,
    );
  }
  if (wholeNumbers && !(Number.isInteger(range.min) && Number.isInteger(range.max))) {
    report(node, 'working_range must use whole numbers for reps');
  }

  if (!isIntegerIn(trial.sets, 1, MAX_TRIAL_SETS)) {
    report(node, `trial sets ${trial.sets} must be a whole number from 1 to ${MAX_TRIAL_SETS}`);
  }
  if (!(trial.target > 0 && trial.target <= maxValue)) {
    report(
      node,
      `trial target ${trial.target} must be above 0 and at most ${maxValue} for ${metric}`,
    );
  }
  if (wholeNumbers && !Number.isInteger(trial.target)) {
    report(node, 'trial target must be a whole number for reps');
  }
  if (trial.target < range.min) {
    report(node, `trial target ${trial.target} is below the working_range minimum ${range.min}`);
  }

  if (METRICS_WITH_REPS.includes(metric)) {
    if (trial.reps === undefined || !isIntegerIn(trial.reps, 1, METRIC_MAX_VALUE.reps)) {
      report(
        node,
        `trial needs reps (a whole number from 1 to ${METRIC_MAX_VALUE.reps}) for ${metric}`,
      );
    }
  } else if (trial.reps !== undefined) {
    report(node, `trial reps is only used for ${METRICS_WITH_REPS.join(' and ')} nodes`);
  }
}

function checkSources(node: ExerciseNode, report: Report): void {
  if (node.source === 'core' && node.sourceUrls.length === 0) {
    report(node, 'built-in nodes need at least one source URL');
  }
  for (const url of node.sourceUrls) {
    if (!URL_PATTERN.test(url)) report(node, `source '${url}' is not a http(s) URL`);
  }
}

/** Per branch: chainOrder is unique and ogLevel never drops as chainOrder rises. */
function checkChains(nodes: readonly ExerciseNode[], report: Report): void {
  const byBranch = new Map<string, ExerciseNode[]>();
  for (const node of nodes) {
    byBranch.set(node.branch, [...(byBranch.get(node.branch) ?? []), node]);
  }
  for (const chain of byBranch.values()) {
    const sorted = [...chain].sort((a, b) => a.chainOrder - b.chainOrder);
    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1];
      const current = sorted[i];
      if (current.chainOrder === previous.chainOrder) {
        report(
          current,
          `order ${current.chainOrder} is also used by '${previous.id}' in ${current.branch}`,
        );
      } else if (current.ogLevel < previous.ogLevel) {
        report(
          current,
          `og_level ${current.ogLevel} is lower than '${previous.id}' (og_level ${previous.ogLevel}), ` +
            `which comes before it in ${current.branch}; raise it or move the node earlier`,
        );
      }
    }
  }
}

/** Prerequisites (hard and recommended) must form a DAG. Reports each cycle once. */
function checkCycles(byId: ReadonlyMap<string, ExerciseNode>, report: Report): void {
  const DONE = 2;
  const IN_PROGRESS = 1;
  const state = new Map<string, number>();
  const path: string[] = [];

  const visit = (node: ExerciseNode): void => {
    state.set(node.id, IN_PROGRESS);
    path.push(node.id);
    for (const { nodeId } of node.prerequisites) {
      const next = byId.get(nodeId);
      if (!next || next.id === node.id) continue; // reported by checkReferences
      if (state.get(next.id) === IN_PROGRESS) {
        const cycle = [...path.slice(path.indexOf(next.id)), next.id];
        report(node, `prerequisites form a cycle: ${cycle.join(' -> ')}`);
      } else if (state.get(next.id) !== DONE) {
        visit(next);
      }
    }
    path.pop();
    state.set(node.id, DONE);
  };

  for (const node of byId.values()) {
    if (!state.has(node.id)) visit(node);
  }
}

function isIntegerIn(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}
