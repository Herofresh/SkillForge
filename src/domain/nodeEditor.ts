/**
 * The in-app node editor's draft (PLAN 4.7, ADR-036). A draft is a whole `ExerciseNode`: the
 * node as the user's tree has it, or a new user node from `newCustomNode`. Every function here is
 * pure and returns a new draft; the editor screen keeps the draft and the store checks it with
 * `applyOverlay` (live validation) and saves it through the overlay (`withNode`).
 *
 * The functions don't try to keep the draft valid (the validator's issues are the feedback); they
 * only keep numbers on the metric's step and above zero, so a stepper never produces noise.
 */
import { searchNodes } from './assessment';
import { nodesInBranch } from './branch';
import { PROGRESSION_STEP } from './generator';
import { MAX_NODE_LEVEL, PROFICIENT_LEVEL } from './progression';
import {
  STRAIGHT_ARM_BRANCHES,
  type Attribute,
  type Branch,
  type EquipmentTag,
  type ExerciseNode,
  type Metric,
  type ValidationIssue,
} from './types';

/** `id` of a draft that is not saved yet; the store gives it `customNodeId(name)` on save. */
export const NEW_NODE_ID = '';
/** Prefix of user node ids (the validator's `USER_ID_PREFIX`). */
const USER_PREFIX = 'user_';
/** Gap between `chainOrder` values when a node goes to the end of a branch. */
export const CHAIN_ORDER_GAP = 10;
/** Decimals kept when a node goes between two others (`chainOrder` may be fractional). */
const ORDER_DECIMALS = 3;
/** Trial sets and `reps` step by one. */
const COUNT_STEP = 1;
/** Longest cue the editor takes (a short coaching line). */
export const MAX_CUE_LENGTH = 120;
export const MAX_NODE_NAME_LENGTH = 40;

/** Metrics that also need `trial.reps` (lowerings / reps per set), like the validator. */
export const METRICS_WITH_TRIAL_REPS: readonly Metric[] = ['eccentric_s', 'load_xbw'];

/**
 * Starting standards of a new user node per metric: a typical beginner working range and a Trial
 * at the top of it (the user sets their own; the project's content standards need sources).
 */
export const DEFAULT_STANDARDS: Readonly<
  Record<Metric, Pick<ExerciseNode, 'workingRange' | 'trial'>>
> = {
  reps: { workingRange: { min: 5, max: 8 }, trial: { sets: 3, target: 8 } },
  hold_s: { workingRange: { min: 10, max: 30 }, trial: { sets: 3, target: 30 } },
  eccentric_s: { workingRange: { min: 3, max: 6 }, trial: { sets: 3, target: 6, reps: 3 } },
  load_xbw: {
    workingRange: { min: 0.1, max: 0.3 },
    trial: { sets: 3, target: 0.3, reps: 5 },
  },
};

/** A fresh copy of the metric's `DEFAULT_STANDARDS`. */
function defaultStandards(metric: Metric): Pick<ExerciseNode, 'workingRange' | 'trial'> {
  const { workingRange, trial } = DEFAULT_STANDARDS[metric];
  return { workingRange: { ...workingRange }, trial: { ...trial } };
}

/** Rounds to the metric's step (0.05 × BW loads without floating-point noise). */
function onStep(value: number, step: number): number {
  return Number((Math.round(value / step) * step).toFixed(2));
}

const stepped = (value: number, steps: number, step: number): number =>
  Math.max(step, onStep(value + steps * step, step));

/** The id a new user node gets: `user_` + its name in snake_case, made unique with `_2`, `_3`. */
export function customNodeId(name: string, existingIds: Iterable<string>): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const stem = `${USER_PREFIX}${slug === '' ? 'exercise' : slug}`;
  const taken = new Set(existingIds);
  if (!taken.has(stem)) return stem;
  let suffix = 2;
  while (taken.has(`${stem}_${suffix}`)) suffix += 1;
  return `${stem}_${suffix}`;
}

/** The nodes of `branch` in column order, without `excludeId` (the draft itself). */
export function chainNodes(
  nodes: readonly ExerciseNode[],
  branch: Branch,
  excludeId?: string,
): ExerciseNode[] {
  return nodesInBranch(nodes, branch).filter((node) => node.id !== excludeId);
}

/** The node right above the draft in its branch column, if any. */
export function nodeAbove(
  draft: ExerciseNode,
  nodes: readonly ExerciseNode[],
): ExerciseNode | undefined {
  return chainNodes(nodes, draft.branch, draft.id)
    .filter((node) => node.chainOrder < draft.chainOrder)
    .at(-1);
}

/**
 * Moves the draft right after `afterId` in its branch (`undefined` = to the top): a `chainOrder`
 * between its new neighbours, and the OG level clamped between theirs so the chain stays
 * monotonic.
 */
export function placeAfter(
  draft: ExerciseNode,
  nodes: readonly ExerciseNode[],
  afterId: string | undefined,
): ExerciseNode {
  const chain = chainNodes(nodes, draft.branch, draft.id);
  const index = afterId === undefined ? -1 : chain.findIndex((node) => node.id === afterId);
  if (afterId !== undefined && index < 0) {
    throw new Error(`'${afterId}' is not in the ${draft.branch} branch`);
  }
  const previous = index >= 0 ? chain[index] : undefined;
  const next = chain[index + 1];
  let chainOrder: number;
  if (previous && next) {
    chainOrder = Number(((previous.chainOrder + next.chainOrder) / 2).toFixed(ORDER_DECIMALS));
  } else if (previous) {
    chainOrder = previous.chainOrder + CHAIN_ORDER_GAP;
  } else if (next) {
    chainOrder = Number((next.chainOrder / 2).toFixed(ORDER_DECIMALS));
  } else {
    chainOrder = CHAIN_ORDER_GAP;
  }
  const minOg = previous?.ogLevel ?? 0;
  const maxOg = next?.ogLevel ?? Number.POSITIVE_INFINITY;
  const ogLevel = Math.min(Math.max(draft.ogLevel, minOg), Math.max(minOg, maxOg));
  return { ...draft, chainOrder, ogLevel };
}

/**
 * A new user node in `branch`, placed after `afterId` (default, or not in the branch: the end of
 * the column). It takes
 * the metric, patterns, equipment and skill flag of the node above it, the metric's default
 * standards, and is straight-arm in the straight-arm branches or under a straight-arm node (so it
 * keeps the tendon safeguards, ADR-010). No prerequisites: the user picks them.
 */
export function newCustomNode(
  nodes: readonly ExerciseNode[],
  branch: Branch,
  afterId?: string,
): ExerciseNode {
  const chain = chainNodes(nodes, branch);
  // An `afterId` outside the branch (a stale link) means the end of the column.
  const template = chain.find((node) => node.id === afterId) ?? chain.at(-1);
  const metric = template?.metric ?? 'reps';
  const draft: ExerciseNode = {
    id: NEW_NODE_ID,
    name: '',
    branch,
    chainOrder: CHAIN_ORDER_GAP,
    ogLevel: template?.ogLevel ?? 0,
    metric,
    ...defaultStandards(metric),
    prerequisites: [],
    straightArm: STRAIGHT_ARM_BRANCHES.includes(branch) || (template?.straightArm ?? false),
    isSkill: template?.isSkill ?? false,
    patterns: [...(template?.patterns ?? [])],
    equipment: (template?.equipment ?? [['floor']]).map((option) => [...option]),
    alternatives: [],
    cues: [],
    sourceUrls: [],
    source: 'user',
    review: { status: 'draft' },
  };
  return placeAfter(draft, nodes, template?.id);
}

export function setName(draft: ExerciseNode, name: string): ExerciseNode {
  return { ...draft, name: name.slice(0, MAX_NODE_NAME_LENGTH) };
}

/** Changes the metric of a user node and resets its standards to the metric's defaults. */
export function setMetric(draft: ExerciseNode, metric: Metric): ExerciseNode {
  if (metric === draft.metric) return draft;
  return { ...draft, metric, ...defaultStandards(metric) };
}

/** OG level ± `steps` (0–17 is checked by the validator; never below 0 here). */
export function stepOgLevel(draft: ExerciseNode, steps: number): ExerciseNode {
  return { ...draft, ogLevel: Math.max(0, draft.ogLevel + steps) };
}

export function toggleStraightArm(draft: ExerciseNode): ExerciseNode {
  return { ...draft, straightArm: !draft.straightArm };
}

export type RangeEnd = 'min' | 'max';

/** One end of the working range ± `steps` of the metric's step. */
export function stepWorkingRange(draft: ExerciseNode, end: RangeEnd, steps: number): ExerciseNode {
  const step = PROGRESSION_STEP[draft.metric];
  const value = stepped(draft.workingRange[end], steps, step);
  return { ...draft, workingRange: { ...draft.workingRange, [end]: value } };
}

export type TrialField = 'sets' | 'target' | 'reps';

/** One Trial field ± `steps`: sets and reps by 1, the target by the metric's step. */
export function stepTrial(draft: ExerciseNode, field: TrialField, steps: number): ExerciseNode {
  const step = field === 'target' ? PROGRESSION_STEP[draft.metric] : COUNT_STEP;
  const current = draft.trial[field] ?? COUNT_STEP;
  return { ...draft, trial: { ...draft.trial, [field]: stepped(current, steps, step) } };
}

/** Adds a hard prerequisite on `nodeId` at the proficient level (the chain's usual rule). */
export function addPrerequisite(draft: ExerciseNode, nodeId: string): ExerciseNode {
  if (draft.prerequisites.some((prereq) => prereq.nodeId === nodeId)) return draft;
  return {
    ...draft,
    prerequisites: [...draft.prerequisites, { nodeId, minLevel: PROFICIENT_LEVEL, kind: 'hard' }],
  };
}

export function removePrerequisite(draft: ExerciseNode, nodeId: string): ExerciseNode {
  return {
    ...draft,
    prerequisites: draft.prerequisites.filter((prereq) => prereq.nodeId !== nodeId),
  };
}

/** Hard ↔ recommended. */
export function togglePrerequisiteKind(draft: ExerciseNode, nodeId: string): ExerciseNode {
  return {
    ...draft,
    prerequisites: draft.prerequisites.map((prereq) =>
      prereq.nodeId === nodeId
        ? { ...prereq, kind: prereq.kind === 'hard' ? 'recommended' : 'hard' }
        : prereq,
    ),
  };
}

/** The level the prerequisite node must reach ± `steps`, kept in 1–10. */
export function stepPrerequisiteLevel(
  draft: ExerciseNode,
  nodeId: string,
  steps: number,
): ExerciseNode {
  return {
    ...draft,
    prerequisites: draft.prerequisites.map((prereq) =>
      prereq.nodeId === nodeId
        ? {
            ...prereq,
            minLevel: Math.min(MAX_NODE_LEVEL, Math.max(1, prereq.minLevel + steps)),
          }
        : prereq,
    ),
  };
}

/** Adds or removes `tag` in equipment option `index` (an AND-set of tags). */
export function toggleEquipmentTag(
  draft: ExerciseNode,
  index: number,
  tag: EquipmentTag,
): ExerciseNode {
  return {
    ...draft,
    equipment: draft.equipment.map((option, i) =>
      i !== index
        ? option
        : option.includes(tag)
          ? option.filter((entry) => entry !== tag)
          : [...option, tag],
    ),
  };
}

/** Adds another way to do the exercise (starting with `floor`). */
export function addEquipmentOption(draft: ExerciseNode): ExerciseNode {
  return { ...draft, equipment: [...draft.equipment, ['floor']] };
}

export function removeEquipmentOption(draft: ExerciseNode, index: number): ExerciseNode {
  return { ...draft, equipment: draft.equipment.filter((_, i) => i !== index) };
}

/** Adds a cue (trimmed, at most `MAX_CUE_LENGTH`); empty or duplicate text changes nothing. */
export function addCue(draft: ExerciseNode, text: string): ExerciseNode {
  const cue = text.trim().slice(0, MAX_CUE_LENGTH);
  if (cue === '' || draft.cues.includes(cue)) return draft;
  return { ...draft, cues: [...draft.cues, cue] };
}

export function removeCue(draft: ExerciseNode, index: number): ExerciseNode {
  return { ...draft, cues: draft.cues.filter((_, i) => i !== index) };
}

/**
 * Adds or removes `attribute` from what the node trains. The first toggle starts from the
 * attributes it currently trains (`current`, derived from its patterns when `trains` is unset).
 */
export function toggleTrains(
  draft: ExerciseNode,
  attribute: Attribute,
  current: readonly Attribute[],
): ExerciseNode {
  const list = draft.trains ?? [...current];
  const trains = list.includes(attribute)
    ? list.filter((entry) => entry !== attribute)
    : [...list, attribute];
  return { ...draft, trains };
}

/** Back to the attributes derived from the patterns (`trains` unset). */
export function clearTrains(draft: ExerciseNode): ExerciseNode {
  const next = { ...draft };
  delete next.trains;
  return next;
}

/**
 * Nodes the draft could need (the prerequisite picker): matches for `query`, or the draft's own
 * branch column when the query is empty. Never the draft itself or a node it already lists.
 */
export function prerequisiteOptions(
  nodes: readonly ExerciseNode[],
  draft: ExerciseNode,
  query: string,
): ExerciseNode[] {
  const listed = new Set(draft.prerequisites.map((prereq) => prereq.nodeId));
  const keep = (node: ExerciseNode) => node.id !== draft.id && !listed.has(node.id);
  const candidates = nodes.filter(keep);
  return query.trim() === ''
    ? chainNodes(candidates, draft.branch)
    : searchNodes(candidates, query);
}

/** Editor sections an issue is shown in (inline, next to the fields it is about). */
export const EDITOR_SECTIONS = [
  'name',
  'position',
  'standards',
  'prerequisites',
  'equipment',
  'trains',
  'other',
] as const;
export type EditorSection = (typeof EDITOR_SECTIONS)[number];

/** Message patterns → section, first match wins (the validator's wording). */
const SECTION_PATTERNS: readonly [RegExp, EditorSection][] = [
  [/prerequisite|cycle/, 'prerequisites'],
  [/working_range|trial/, 'standards'],
  [/equipment/, 'equipment'],
  [/trains|pattern/, 'trains'],
  [/og_level|order|straight_arm|straight-arm|branch/, 'position'],
  [/name|id /, 'name'],
];

/** The editor section that shows `issue` (by the validator's wording; `other` when unknown). */
export function issueSection(issue: ValidationIssue): EditorSection {
  return SECTION_PATTERNS.find(([pattern]) => pattern.test(issue.message))?.[1] ?? 'other';
}

/**
 * An issue as the editor shows it: just the message when it is about the draft, else prefixed
 * with the name of the node it is about (a cycle is reported on the node that closes it).
 */
export function editorIssueText(
  issue: ValidationIssue,
  draftId: string,
  nodes: readonly ExerciseNode[],
): string {
  if (issue.nodeId === undefined || issue.nodeId === draftId) return issue.message;
  const name = nodes.find((node) => node.id === issue.nodeId)?.name ?? issue.nodeId;
  return `${name}: ${issue.message}`;
}

/** The editor's issues as text (`editorIssueText`), grouped by the section that shows them. */
export function issuesBySection(
  issues: readonly ValidationIssue[],
  draftId: string,
  nodes: readonly ExerciseNode[],
): Record<EditorSection, string[]> {
  const grouped = Object.fromEntries(
    EDITOR_SECTIONS.map((section) => [section, [] as string[]]),
  ) as Record<EditorSection, string[]>;
  for (const issue of issues) {
    grouped[issueSection(issue)].push(editorIssueText(issue, draftId, nodes));
  }
  return grouped;
}
