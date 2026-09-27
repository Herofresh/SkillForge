/**
 * The human-editable progression format (ADR-016): YAML text <-> `ExerciseNode`.
 *
 * This is the ONE parse/normalize implementation. The build script, the dataset test and the user
 * overlay import all go through it, so the rules for what a valid node looks like live in one place.
 * Field-level problems (missing field, wrong type, unknown value) are reported here; graph rules
 * (ids resolve, no cycles, …) are checked by `validateNodes` in `./validate.ts`.
 *
 * Pure TypeScript (no React/Expo/DB), so it runs in Node scripts, Jest and the app.
 */
import { parseDocument } from 'yaml';

import {
  ATTRIBUTES,
  BRANCHES,
  EQUIPMENT_TAGS,
  METRICS,
  PATTERNS,
  PREREQUISITE_KINDS,
  REVIEW_STATUSES,
} from '@/domain/types';
import type {
  Branch,
  EquipmentTag,
  ExerciseNode,
  NodeEdit,
  NodeSource,
  Prerequisite,
  Review,
  Trial,
  ValidationIssue,
  WorkingRange,
} from '@/domain/types';

/** Joins the tags of one equipment option in YAML, e.g. `floor + wall`. */
export const EQUIPMENT_AND_SEPARATOR = '+';

/** Every node field except the ones set by where the node comes from. */
export type NodeFields = Omit<ExerciseNode, 'id' | 'source' | 'branch'>;

type Fail = (message: string) => void;

interface FieldSpec {
  /** Key in the YAML file. */
  key: string;
  prop: keyof NodeFields;
  /** When absent: `undefined` means the field is required, otherwise the default value. */
  fallback?: () => unknown;
  /** Returns the parsed value, or `undefined` after calling `fail`. */
  parse: (value: unknown, fail: Fail) => unknown;
  /** Back to the YAML shape. */
  toRaw: (value: never) => unknown;
}

// ---------------------------------------------------------------------------------------------
// Small value parsers. Each takes the raw YAML value and reports a plain-language problem.
// ---------------------------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function describe(value: unknown): string {
  if (value === null || value === undefined) return 'nothing';
  if (Array.isArray(value)) return 'a list';
  if (typeof value === 'object') return 'a group of fields';
  return `'${String(value)}'`;
}

const text =
  (label: string) =>
  (value: unknown, fail: Fail): string | undefined => {
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
    fail(`${label} must be some text, got ${describe(value)}`);
    return undefined;
  };

const number =
  (label: string) =>
  (value: unknown, fail: Fail): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    fail(`${label} must be a number, got ${describe(value)}`);
    return undefined;
  };

const yesNo =
  (label: string) =>
  (value: unknown, fail: Fail): boolean | undefined => {
    if (typeof value === 'boolean') return value;
    fail(`${label} must be true or false, got ${describe(value)}`);
    return undefined;
  };

const oneOf =
  <T extends string>(label: string, allowed: readonly T[]) =>
  (value: unknown, fail: Fail): T | undefined => {
    if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
      return value as T;
    }
    fail(`${label} ${describe(value)} is not allowed; use one of: ${allowed.join(', ')}`);
    return undefined;
  };

const listOf =
  <T>(label: string, item: (value: unknown, fail: Fail) => T | undefined) =>
  (value: unknown, fail: Fail): T[] | undefined => {
    if (!Array.isArray(value)) {
      fail(`${label} must be a list (lines starting with '- '), got ${describe(value)}`);
      return undefined;
    }
    const out: T[] = [];
    let ok = true;
    value.forEach((entry, index) => {
      const parsed = item(entry, (message) => fail(`${label} #${index + 1}: ${message}`));
      if (parsed === undefined) ok = false;
      else out.push(parsed);
    });
    return ok ? out : undefined;
  };

/** Reads a YAML mapping with known keys; reports missing and unknown keys. */
function group(
  label: string,
  value: unknown,
  fail: Fail,
  keys: { required: readonly string[]; optional?: readonly string[] },
): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    fail(
      `${label} must be a group of fields (${keys.required.join(', ')}), got ${describe(value)}`,
    );
    return undefined;
  }
  const known = [...keys.required, ...(keys.optional ?? [])];
  let ok = true;
  for (const key of Object.keys(value)) {
    if (!known.includes(key)) {
      fail(`${label} has unknown field '${key}' (allowed: ${known.join(', ')})`);
      ok = false;
    }
  }
  for (const key of keys.required) {
    if (!(key in value)) {
      fail(`${label} is missing '${key}'`);
      ok = false;
    }
  }
  return ok ? value : undefined;
}

function parseWorkingRange(value: unknown, fail: Fail): WorkingRange | undefined {
  const raw = group('working_range', value, fail, { required: ['min', 'max'] });
  if (!raw) return undefined;
  const min = number('working_range min')(raw.min, fail);
  const max = number('working_range max')(raw.max, fail);
  return min === undefined || max === undefined ? undefined : { min, max };
}

function parseTrial(value: unknown, fail: Fail): Trial | undefined {
  const raw = group('trial', value, fail, { required: ['sets', 'target'], optional: ['reps'] });
  if (!raw) return undefined;
  const sets = number('trial sets')(raw.sets, fail);
  const target = number('trial target')(raw.target, fail);
  const reps = raw.reps === undefined ? undefined : number('trial reps')(raw.reps, fail);
  if (sets === undefined || target === undefined) return undefined;
  if (raw.reps !== undefined && reps === undefined) return undefined;
  return reps === undefined ? { sets, target } : { sets, target, reps };
}

function parsePrerequisite(value: unknown, fail: Fail): Prerequisite | undefined {
  const raw = group('prerequisite', value, fail, {
    required: ['node', 'level'],
    optional: ['kind', 'note'],
  });
  if (!raw) return undefined;
  const nodeId = text('node')(raw.node, fail);
  const minLevel = number('level')(raw.level, fail);
  const kind = raw.kind === undefined ? 'hard' : oneOf('kind', PREREQUISITE_KINDS)(raw.kind, fail);
  const note = raw.note === undefined ? undefined : text('note')(raw.note, fail);
  if (nodeId === undefined || minLevel === undefined || kind === undefined) return undefined;
  if (raw.note !== undefined && note === undefined) return undefined;
  return note === undefined ? { nodeId, minLevel, kind } : { nodeId, minLevel, kind, note };
}

function parseEquipmentOption(value: unknown, fail: Fail): EquipmentTag[] | undefined {
  const option = text('equipment option')(value, fail);
  if (option === undefined) return undefined;
  const tags = option.split(EQUIPMENT_AND_SEPARATOR).map((tag) => tag.trim());
  const parsed = tags.map((tag) => oneOf('equipment', EQUIPMENT_TAGS)(tag, fail));
  return parsed.every((tag) => tag !== undefined) ? (parsed as EquipmentTag[]) : undefined;
}

function parseReview(value: unknown, fail: Fail): Review | undefined {
  const raw = group('review', value, fail, { required: ['status'], optional: ['notes'] });
  if (!raw) return undefined;
  const status = oneOf('review status', REVIEW_STATUSES)(raw.status, fail);
  // Empty notes are fine (a placeholder for the reviewer), so they are not an error.
  const notes =
    typeof raw.notes === 'string' && raw.notes.trim() !== '' ? raw.notes.trim() : undefined;
  if (raw.notes !== undefined && raw.notes !== null && typeof raw.notes !== 'string') {
    fail(`review notes must be some text, got ${describe(raw.notes)}`);
    return undefined;
  }
  if (status === undefined) return undefined;
  return notes === undefined ? { status } : { status, notes };
}

const DRAFT_REVIEW: Review = { status: 'draft' };
const same = <T>(value: T): T => value;

/** The node fields in the order they are written to YAML. */
const FIELDS: readonly FieldSpec[] = [
  { key: 'name', prop: 'name', parse: text('name'), toRaw: (v: string) => v },
  { key: 'order', prop: 'chainOrder', parse: number('order'), toRaw: (v: number) => v },
  { key: 'og_level', prop: 'ogLevel', parse: number('og_level'), toRaw: (v: number) => v },
  { key: 'metric', prop: 'metric', parse: oneOf('metric', METRICS), toRaw: (v: string) => v },
  {
    key: 'working_range',
    prop: 'workingRange',
    parse: parseWorkingRange,
    toRaw: (v: WorkingRange) => ({ min: v.min, max: v.max }),
  },
  {
    key: 'trial',
    prop: 'trial',
    parse: parseTrial,
    toRaw: (v: Trial) => ({ ...v }),
  },
  {
    key: 'prerequisites',
    prop: 'prerequisites',
    fallback: () => [],
    parse: listOf('prerequisites', parsePrerequisite),
    toRaw: (v: Prerequisite[]) =>
      v.map((p) => ({
        node: p.nodeId,
        level: p.minLevel,
        ...(p.kind === 'hard' ? {} : { kind: p.kind }),
        ...(p.note === undefined ? {} : { note: p.note }),
      })),
  },
  {
    key: 'straight_arm',
    prop: 'straightArm',
    fallback: () => false,
    parse: yesNo('straight_arm'),
    toRaw: same,
  },
  { key: 'skill', prop: 'isSkill', fallback: () => false, parse: yesNo('skill'), toRaw: same },
  {
    key: 'patterns',
    prop: 'patterns',
    parse: listOf('patterns', oneOf('pattern', PATTERNS)),
    toRaw: (v: string[]) => [...v],
  },
  {
    key: 'trains',
    prop: 'trains',
    fallback: () => undefined,
    parse: listOf('trains', oneOf('attribute', ATTRIBUTES)),
    toRaw: (v: string[] | undefined) => (v === undefined ? v : [...v]),
  },
  {
    key: 'equipment',
    prop: 'equipment',
    parse: listOf('equipment', parseEquipmentOption),
    toRaw: (v: EquipmentTag[][]) => v.map((option) => option.join(` ${EQUIPMENT_AND_SEPARATOR} `)),
  },
  {
    key: 'alternatives',
    prop: 'alternatives',
    fallback: () => [],
    parse: listOf('alternatives', text('alternative')),
    toRaw: same,
  },
  {
    key: 'regression',
    prop: 'regressionId',
    fallback: () => undefined,
    parse: text('regression'),
    toRaw: (v: string | undefined) => v,
  },
  {
    key: 'legendary',
    prop: 'legendary',
    fallback: () => undefined,
    parse: yesNo('legendary'),
    toRaw: same,
  },
  {
    key: 'cues',
    prop: 'cues',
    fallback: () => [],
    parse: listOf('cues', text('cue')),
    toRaw: same,
  },
  {
    key: 'sources',
    prop: 'sourceUrls',
    fallback: () => [],
    parse: listOf('sources', text('source')),
    toRaw: same,
  },
  {
    key: 'verify',
    prop: 'verify',
    fallback: () => undefined,
    parse: text('verify'),
    toRaw: (v: string | undefined) => v,
  },
  {
    key: 'review',
    prop: 'review',
    fallback: () => ({ ...DRAFT_REVIEW }),
    parse: parseReview,
    toRaw: (v: Review) => ({
      status: v.status,
      ...(v.notes === undefined ? {} : { notes: v.notes }),
    }),
  },
];

const ID_KEY = 'id';
const BRANCH_KEY = 'branch';

// ---------------------------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------------------------

export interface NodeContext {
  /** Shown in issues, e.g. `content/progressions/v_pull.yaml`. */
  file: string;
  source: NodeSource;
  /** Branch of the whole file. When absent, each node must name its own `branch` (overlays). */
  branch?: Branch;
}

export interface Parsed<T> {
  value: T | undefined;
  issues: ValidationIssue[];
}

/** Parses YAML (or JSON, which is valid YAML) text. Syntax errors include line and column. */
export function parseYamlText(yamlText: string, file: string): Parsed<unknown> {
  const doc = parseDocument(yamlText, { prettyErrors: true, uniqueKeys: true });
  if (doc.errors.length > 0) {
    return {
      value: undefined,
      issues: doc.errors.map((error) => ({ file, message: `YAML syntax: ${error.message}` })),
    };
  }
  return { value: doc.toJS(), issues: [] };
}

/** Turns one raw YAML node into an `ExerciseNode`, filling defaults for optional fields. */
export function nodeFromRaw(
  raw: unknown,
  context: NodeContext,
  position = 0,
): Parsed<ExerciseNode> {
  const issues: ValidationIssue[] = [];
  const rawId = isRecord(raw) && typeof raw[ID_KEY] === 'string' ? raw[ID_KEY] : undefined;
  const nodeId = rawId ?? `node #${position + 1}`;
  const fail: Fail = (message) => issues.push({ file: context.file, nodeId, message });

  if (!isRecord(raw)) {
    fail(`must be a group of fields starting with 'id:', got ${describe(raw)}`);
    return { value: undefined, issues };
  }
  const id = text('id')(raw[ID_KEY], fail);
  const branch =
    context.branch ??
    (raw[BRANCH_KEY] === undefined ? undefined : oneOf('branch', BRANCHES)(raw[BRANCH_KEY], fail));
  if (context.branch === undefined && raw[BRANCH_KEY] === undefined)
    fail(`is missing '${BRANCH_KEY}'`);
  if (context.branch !== undefined && raw[BRANCH_KEY] !== undefined) {
    fail(`'${BRANCH_KEY}' is set by the file, remove it from the node`);
  }

  const extraKeys = context.branch === undefined ? [ID_KEY, BRANCH_KEY] : [ID_KEY];
  const fields = readFields(raw, fail, { partial: false, extraKeys });
  if (id === undefined || branch === undefined || fields === undefined || issues.length > 0) {
    return { value: undefined, issues };
  }
  return { value: { id, branch, ...(fields as NodeFields), source: context.source }, issues };
}

/** Reads a partial node (overlay edit). Only the given fields are returned; no defaults. */
export function nodeEditFromRaw(raw: unknown, file: string, nodeId: string): Parsed<NodeEdit> {
  const issues: ValidationIssue[] = [];
  const fail: Fail = (message) => issues.push({ file, nodeId, message });
  if (!isRecord(raw)) {
    fail(`edit must be a group of fields, got ${describe(raw)}`);
    return { value: undefined, issues };
  }
  const edit: NodeEdit = {};
  if (raw[BRANCH_KEY] !== undefined) {
    const branch = oneOf('branch', BRANCHES)(raw[BRANCH_KEY], fail);
    if (branch !== undefined) edit.branch = branch;
  }
  const fields = readFields(raw, fail, { partial: true, extraKeys: [BRANCH_KEY] });
  if (fields === undefined || issues.length > 0) return { value: undefined, issues };
  return { value: { ...edit, ...fields }, issues };
}

/** Parses a whole branch file: `branch: <id>` plus a `nodes:` list. */
export function parseBranchFile(
  yamlText: string,
  file: string,
): { branch: Branch | undefined; nodes: ExerciseNode[]; issues: ValidationIssue[] } {
  const parsed = parseYamlText(yamlText, file);
  if (parsed.issues.length > 0) return { branch: undefined, nodes: [], issues: parsed.issues };

  const issues: ValidationIssue[] = [];
  const fail: Fail = (message) => issues.push({ file, message });
  const raw = group('the file', parsed.value, fail, { required: ['branch', 'nodes'] });
  if (!raw) return { branch: undefined, nodes: [], issues };
  const branch = oneOf('branch', BRANCHES)(raw.branch, fail);
  if (!Array.isArray(raw.nodes)) {
    fail(`'nodes' must be a list of nodes, got ${describe(raw.nodes)}`);
    return { branch, nodes: [], issues };
  }
  if (branch === undefined) return { branch, nodes: [], issues };

  const nodes: ExerciseNode[] = [];
  raw.nodes.forEach((rawNode, index) => {
    const result = nodeFromRaw(rawNode, { file, source: 'core', branch }, index);
    issues.push(...result.issues);
    if (result.value) nodes.push(result.value);
  });
  return { branch, nodes, issues };
}

/** Back to the YAML shape (defaults left out). `withBranch` adds `branch:` (used in overlays). */
export function nodeToRaw(node: ExerciseNode, withBranch: boolean): Record<string, unknown> {
  const raw: Record<string, unknown> = { [ID_KEY]: node.id };
  if (withBranch) raw[BRANCH_KEY] = node.branch;
  return { ...raw, ...fieldsToRaw(node, true) };
}

/** Back to the YAML shape for a partial edit. */
export function nodeEditToRaw(edit: NodeEdit): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  if (edit.branch !== undefined) raw[BRANCH_KEY] = edit.branch;
  return { ...raw, ...fieldsToRaw(edit, false) };
}

// ---------------------------------------------------------------------------------------------

function readFields(
  raw: Record<string, unknown>,
  fail: Fail,
  options: { partial: boolean; extraKeys: readonly string[] },
): Partial<NodeFields> | undefined {
  const known = new Set([...options.extraKeys, ...FIELDS.map((field) => field.key)]);
  let ok = true;
  for (const key of Object.keys(raw)) {
    if (!known.has(key)) {
      fail(`unknown field '${key}' (check the spelling; see content/progressions/README.md)`);
      ok = false;
    }
  }
  const out: Record<string, unknown> = {};
  for (const field of FIELDS) {
    const value = raw[field.key];
    if (value === undefined || value === null) {
      if (options.partial) continue;
      if (field.fallback === undefined) {
        fail(`is missing '${field.key}'`);
        ok = false;
      } else {
        const fallback = field.fallback();
        if (fallback !== undefined) out[field.prop] = fallback;
      }
      continue;
    }
    const parsed = field.parse(value, fail);
    if (parsed === undefined) ok = false;
    else out[field.prop] = parsed;
  }
  return ok ? (out as Partial<NodeFields>) : undefined;
}

/**
 * Converts fields back to YAML. With `omitDefaults`, optional fields that equal their default
 * (empty list, false, draft review) are left out to keep files short. Edits keep them, because
 * "clear this list" is a real change there.
 */
function fieldsToRaw(values: Partial<NodeFields>, omitDefaults: boolean): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const field of FIELDS) {
    const value = values[field.prop];
    if (value === undefined) continue;
    if (omitDefaults && field.fallback !== undefined && isDefault(value, field.fallback()))
      continue;
    raw[field.key] = field.toRaw(value as never);
  }
  return raw;
}

function isDefault(value: unknown, fallback: unknown): boolean {
  if (fallback === undefined) return value === false;
  return JSON.stringify(value) === JSON.stringify(fallback);
}
