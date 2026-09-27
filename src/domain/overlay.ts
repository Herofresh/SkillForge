/**
 * User-defined progressions on top of the built-in matrix (ADR-016).
 *
 * The overlay adds, edits and hides nodes without touching the built-in data. `applyOverlay` runs
 * the same validator as the build (`validateNodes`), so a user change can never produce a broken tree
 * (cycles, dangling prerequisites, bad trials). Export/import use the same YAML node format as the
 * content files, so a user's custom progression can be sent back to the project as a suggestion.
 *
 * Persistence (Phase 3) and the editor UI (Phase 4) build on these functions.
 */
import { stringify } from 'yaml';

import {
  nodeEditFromRaw,
  nodeEditToRaw,
  nodeFromRaw,
  nodeToRaw,
  parseYamlText,
} from '@/data/progressionFormat';
import { USER_ID_PREFIX, validateNodes } from '@/data/validate';

import type {
  ExerciseNode,
  NodeEdit,
  Prerequisite,
  ProgressionOverlay,
  ValidationIssue,
} from './types';

/** Label used as `file` in overlay issues. */
export const OVERLAY_FILE = 'overlay';
/** Header that marks exported text as a SkillForge overlay. */
export const OVERLAY_FORMAT = 'skillforge-progression-overlay';
export const OVERLAY_VERSION = 1;

export const EMPTY_OVERLAY: ProgressionOverlay = { added: [], edited: {}, hidden: [] };

export interface OverlayResult {
  /** The merged tree, or the unchanged `base` when there are issues. */
  nodes: ExerciseNode[];
  issues: ValidationIssue[];
}

/**
 * Merges `overlay` into `base`. All or nothing: if the merged tree has any issue, `base` is returned
 * unchanged together with the issues, so the caller can show them and keep the old tree.
 */
export function applyOverlay(
  base: readonly ExerciseNode[],
  overlay: ProgressionOverlay,
): OverlayResult {
  const issues: ValidationIssue[] = [];
  const report = (nodeId: string, message: string) =>
    issues.push({ file: OVERLAY_FILE, nodeId, message });
  const baseIds = new Set(base.map((node) => node.id));

  for (const id of Object.keys(overlay.edited)) {
    if (!baseIds.has(id)) report(id, 'edited node does not exist in the built-in matrix');
  }
  for (const id of overlay.hidden) {
    if (!baseIds.has(id)) report(id, 'hidden node does not exist in the built-in matrix');
  }
  for (const node of overlay.added) {
    if (node.source !== 'user') report(node.id, "added nodes must have source 'user'");
    if (!node.id.startsWith(USER_ID_PREFIX)) {
      report(node.id, `added nodes need an id starting with '${USER_ID_PREFIX}'`);
    }
  }

  const merged = [
    ...base.map((node) => ({
      ...node,
      ...overlay.edited[node.id],
      id: node.id,
      source: node.source,
    })),
    ...overlay.added,
  ];
  const nodes = hideNodes(merged, new Set(overlay.hidden));
  issues.push(...validateNodes(nodes).map((issue) => ({ ...issue, file: OVERLAY_FILE })));

  return issues.length > 0 ? { nodes: [...base], issues } : { nodes, issues };
}

/**
 * Removes hidden nodes. A prerequisite on a hidden node is replaced by that node's own
 * prerequisites (recursively), so hiding "knee push-up" makes "push-up" depend on what knee
 * push-up needed. Alternatives and regressions pointing at hidden nodes are dropped or skipped.
 */
function hideNodes(nodes: readonly ExerciseNode[], hidden: ReadonlySet<string>): ExerciseNode[] {
  if (hidden.size === 0) return [...nodes];
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const resolvePrerequisites = (list: readonly Prerequisite[], seen: Set<string>): Prerequisite[] =>
    list.flatMap((prereq) => {
      if (!hidden.has(prereq.nodeId)) return [prereq];
      if (seen.has(prereq.nodeId)) return []; // a cycle; validateNodes reports it on the rest
      const hiddenNode = byId.get(prereq.nodeId);
      if (!hiddenNode) return [];
      return resolvePrerequisites(hiddenNode.prerequisites, new Set([...seen, prereq.nodeId]));
    });

  const resolveRegression = (id: string | undefined, seen: Set<string>): string | undefined => {
    if (id === undefined || !hidden.has(id)) return id;
    if (seen.has(id)) return undefined;
    return resolveRegression(byId.get(id)?.regressionId, new Set([...seen, id]));
  };

  return nodes
    .filter((node) => !hidden.has(node.id))
    .map((node) => {
      const prerequisites = mergeDuplicates(resolvePrerequisites(node.prerequisites, new Set()));
      const regressionId = resolveRegression(node.regressionId, new Set());
      const next: ExerciseNode = {
        ...node,
        prerequisites,
        alternatives: node.alternatives.filter((id) => !hidden.has(id)),
      };
      if (regressionId === undefined) delete next.regressionId;
      else next.regressionId = regressionId;
      return next;
    });
}

/** One entry per prerequisite node: the strictest kind and the highest level win. */
function mergeDuplicates(list: readonly Prerequisite[]): Prerequisite[] {
  const byNode = new Map<string, Prerequisite>();
  for (const prereq of list) {
    const existing = byNode.get(prereq.nodeId);
    if (!existing) {
      byNode.set(prereq.nodeId, prereq);
      continue;
    }
    byNode.set(prereq.nodeId, {
      ...existing,
      minLevel: Math.max(existing.minLevel, prereq.minLevel),
      kind: existing.kind === 'hard' || prereq.kind === 'hard' ? 'hard' : 'recommended',
    });
  }
  return [...byNode.values()];
}

// ---------------------------------------------------------------------------------------------
// Export / import
// ---------------------------------------------------------------------------------------------

export type OverlayTextFormat = 'yaml' | 'json';

/** Serializes an overlay to shareable text in the same field format as `content/progressions/`. */
export function exportOverlay(
  overlay: ProgressionOverlay,
  format: OverlayTextFormat = 'yaml',
): string {
  const raw = {
    format: OVERLAY_FORMAT,
    version: OVERLAY_VERSION,
    added: overlay.added.map((node) => nodeToRaw(node, true)),
    edited: Object.fromEntries(
      Object.entries(overlay.edited).map(([id, edit]) => [id, nodeEditToRaw(edit)]),
    ),
    hidden: [...overlay.hidden],
  };
  return format === 'json' ? `${JSON.stringify(raw, null, 2)}\n` : stringify(raw);
}

/**
 * Reads overlay text (YAML or JSON). Checks the fields only; call `applyOverlay` to check that the
 * result fits the tree. Returns `overlay: undefined` when there are issues.
 */
export function importOverlay(overlayText: string): {
  overlay: ProgressionOverlay | undefined;
  issues: ValidationIssue[];
} {
  const parsed = parseYamlText(overlayText, OVERLAY_FILE);
  if (parsed.issues.length > 0) return { overlay: undefined, issues: parsed.issues };

  const issues: ValidationIssue[] = [];
  const fail = (message: string, nodeId?: string) =>
    issues.push({ file: OVERLAY_FILE, message, ...(nodeId === undefined ? {} : { nodeId }) });
  const raw = parsed.value;
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    fail('must be a group of fields (format, version, added, edited, hidden)');
    return { overlay: undefined, issues };
  }
  const record = raw as Record<string, unknown>;
  const allowed = ['format', 'version', 'added', 'edited', 'hidden'];
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) fail(`unknown field '${key}' (allowed: ${allowed.join(', ')})`);
  }
  if (record.format !== OVERLAY_FORMAT) fail(`'format' must be '${OVERLAY_FORMAT}'`);
  if (record.version !== OVERLAY_VERSION) fail(`'version' must be ${OVERLAY_VERSION}`);

  const added: ExerciseNode[] = [];
  const rawAdded = record.added ?? [];
  if (!Array.isArray(rawAdded)) fail("'added' must be a list of nodes");
  else {
    rawAdded.forEach((rawNode, index) => {
      const result = nodeFromRaw(rawNode, { file: OVERLAY_FILE, source: 'user' }, index);
      issues.push(...result.issues);
      if (result.value) added.push(result.value);
    });
  }

  const edited: Record<string, NodeEdit> = {};
  const rawEdited = record.edited ?? {};
  if (typeof rawEdited !== 'object' || rawEdited === null || Array.isArray(rawEdited)) {
    fail("'edited' must map node ids to the fields that change");
  } else {
    for (const [id, rawEdit] of Object.entries(rawEdited)) {
      const result = nodeEditFromRaw(rawEdit, OVERLAY_FILE, id);
      issues.push(...result.issues);
      if (result.value) edited[id] = result.value;
    }
  }

  const rawHidden = record.hidden ?? [];
  const hidden: string[] = [];
  if (!Array.isArray(rawHidden) || rawHidden.some((id) => typeof id !== 'string')) {
    fail("'hidden' must be a list of node ids");
  } else {
    hidden.push(...(rawHidden as string[]));
  }

  return issues.length > 0
    ? { overlay: undefined, issues }
    : { overlay: { added, edited, hidden }, issues };
}
