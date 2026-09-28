/**
 * Changing the user's overlay from the in-app editor (PLAN 4.7) and merging a shared one into it
 * (PLAN 4.8, ADR-036). Pure: each function returns a new overlay; the store checks it with
 * `applyOverlay` and saves it only when the merged tree is valid.
 *
 * - An edited built-in node is stored as the fields that differ from the built-in node
 *   (`nodeEditFor`), so an edit that ends up equal to the default removes itself.
 * - A user node (`source: 'user'`) lives whole in `added`.
 * - Reset removes every change to one node (its edit and its hidden flag, or the added node).
 * - Import merges: the shared overlay's entries win per node, hidden lists are joined, and the
 *   rest of the user's own changes stay.
 */
import { nodeAttributes } from './character';
import { applyOverlay } from './overlay';
import type { ExerciseNode, NodeEdit, ProgressionOverlay, ValidationIssue } from './types';

/** How the overlay changes a node: a user node, an edited built-in node, or a hidden one. */
export const CUSTOMIZATION_KINDS = ['added', 'edited', 'hidden'] as const;
export type CustomizationKind = (typeof CUSTOMIZATION_KINDS)[number];

/** The fields a `NodeEdit` can change (everything but `id` and `source`). */
export const EDITABLE_NODE_FIELDS = [
  'name',
  'branch',
  'chainOrder',
  'ogLevel',
  'metric',
  'workingRange',
  'trial',
  'prerequisites',
  'straightArm',
  'isSkill',
  'patterns',
  'trains',
  'equipment',
  'alternatives',
  'regressionId',
  'legendary',
  'cues',
  'sourceUrls',
  'verify',
  'review',
] as const satisfies readonly (keyof NodeEdit)[];
export type EditableNodeField = (typeof EDITABLE_NODE_FIELDS)[number];

/** Plain-language names of the fields, for the import preview ("changes: Trial, cues"). */
export const NODE_FIELD_LABELS: Readonly<Record<EditableNodeField, string>> = {
  name: 'name',
  branch: 'branch',
  chainOrder: 'position',
  ogLevel: 'difficulty',
  metric: 'metric',
  workingRange: 'working range',
  trial: 'Trial',
  prerequisites: 'prerequisites',
  straightArm: 'straight-arm flag',
  isSkill: 'skill flag',
  patterns: 'patterns',
  trains: 'trained attributes',
  equipment: 'equipment',
  alternatives: 'alternatives',
  regressionId: 'regression',
  legendary: 'legendary flag',
  cues: 'cues',
  sourceUrls: 'sources',
  verify: 'verify note',
  review: 'review',
};

const sameValue = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * The fields of `node` that differ from the built-in `baseNode`. `trains` can't be removed by an
 * edit (an absent field means "unchanged"), so going back to derived attributes on a node that
 * sets `trains` stores the derived list explicitly (same effect).
 */
export function nodeEditFor(baseNode: ExerciseNode, node: ExerciseNode): NodeEdit {
  const edit: Record<string, unknown> = {};
  for (const field of EDITABLE_NODE_FIELDS) {
    const value = field === 'trains' ? (node.trains ?? derivedTrains(baseNode, node)) : node[field];
    if (value !== undefined && !sameValue(value, baseNode[field])) edit[field] = value;
  }
  return edit as NodeEdit;
}

/** `node`'s derived attributes when the built-in node sets `trains` and `node` doesn't. */
function derivedTrains(baseNode: ExerciseNode, node: ExerciseNode) {
  return baseNode.trains === undefined ? undefined : nodeAttributes({ patterns: node.patterns });
}

const withoutKey = <T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> =>
  Object.fromEntries(Object.entries(record).filter(([id]) => id !== key));

/**
 * The overlay with `node` as the user edited it: a user node replaces (or joins) `added`; a
 * built-in node's differences to `base` become its edit (none left = the edit is dropped).
 */
export function withNode(
  overlay: ProgressionOverlay,
  base: readonly ExerciseNode[],
  node: ExerciseNode,
): ProgressionOverlay {
  if (node.source === 'user') {
    const exists = overlay.added.some((entry) => entry.id === node.id);
    return {
      ...overlay,
      added: exists
        ? overlay.added.map((entry) => (entry.id === node.id ? node : entry))
        : [...overlay.added, node],
    };
  }
  const baseNode = base.find((entry) => entry.id === node.id);
  if (!baseNode) throw new Error(`'${node.id}' is not a built-in node`);
  const edit = nodeEditFor(baseNode, node);
  return {
    ...overlay,
    edited:
      Object.keys(edit).length === 0
        ? withoutKey(overlay.edited, node.id)
        : { ...overlay.edited, [node.id]: edit },
  };
}

/** The overlay without any change to `nodeId`: edit and hidden flag removed, or the user node. */
export function withoutNodeChanges(
  overlay: ProgressionOverlay,
  nodeId: string,
): ProgressionOverlay {
  return {
    added: overlay.added.filter((node) => node.id !== nodeId),
    edited: withoutKey(overlay.edited, nodeId),
    hidden: overlay.hidden.filter((id) => id !== nodeId),
  };
}

/** Hides or shows the built-in node `nodeId` (a user node is deleted instead: `withoutNodeChanges`). */
export function withHidden(
  overlay: ProgressionOverlay,
  nodeId: string,
  hidden: boolean,
): ProgressionOverlay {
  const rest = overlay.hidden.filter((id) => id !== nodeId);
  return { ...overlay, hidden: hidden ? [...rest, nodeId] : rest };
}

/** How the overlay changes `nodeId`, if it does (a hidden edited node counts as hidden). */
export function customizationOf(
  overlay: ProgressionOverlay,
  nodeId: string,
): CustomizationKind | undefined {
  if (overlay.hidden.includes(nodeId)) return 'hidden';
  if (overlay.added.some((node) => node.id === nodeId)) return 'added';
  if (overlay.edited[nodeId] !== undefined) return 'edited';
  return undefined;
}

/** Ids of the nodes the user added or edited (the tree's "custom" badges). */
export function customizedNodeIds(overlay: ProgressionOverlay): ReadonlySet<string> {
  return new Set([...overlay.added.map((node) => node.id), ...Object.keys(overlay.edited)]);
}

/** One changed node of an overlay, for the "My progressions" list and the import preview. */
export interface OverlayEntry {
  nodeId: string;
  /** The node's name (the user node's own, the edited name, else the built-in one). */
  name: string;
  kind: CustomizationKind;
  /** For `edited`: the changed fields, as `NODE_FIELD_LABELS`. */
  fields: string[];
}

/** Every node the overlay changes: user nodes, then edits, then hidden nodes (each by name). */
export function overlayEntries(
  overlay: ProgressionOverlay,
  base: readonly ExerciseNode[],
): OverlayEntry[] {
  const baseName = (id: string) => base.find((node) => node.id === id)?.name ?? id;
  const byName = (a: OverlayEntry, b: OverlayEntry) => a.name.localeCompare(b.name);
  const added = overlay.added.map((node): OverlayEntry => ({
    nodeId: node.id,
    name: node.name,
    kind: 'added',
    fields: [],
  }));
  const edited = Object.entries(overlay.edited)
    .filter(([id]) => !overlay.hidden.includes(id))
    .map(([id, edit]): OverlayEntry => ({
      nodeId: id,
      name: edit.name ?? baseName(id),
      kind: 'edited',
      fields: EDITABLE_NODE_FIELDS.filter((field) => edit[field] !== undefined).map(
        (field) => NODE_FIELD_LABELS[field],
      ),
    }));
  const hidden = overlay.hidden.map((id): OverlayEntry => ({
    nodeId: id,
    name: baseName(id),
    kind: 'hidden',
    fields: [],
  }));
  return [...added.sort(byName), ...edited.sort(byName), ...hidden.sort(byName)];
}

/** What the change is, e.g. "Your own exercise" or "Changed: Trial, cues". */
export function describeOverlayEntry(entry: OverlayEntry): string {
  switch (entry.kind) {
    case 'added':
      return 'Your own exercise';
    case 'edited':
      return `Changed: ${entry.fields.join(', ')}`;
    case 'hidden':
      return 'Hidden from the tree';
  }
}

/**
 * `incoming` merged into `current` (import, ADR-036): its user nodes and edits replace the user's
 * own for the same node id, its hidden nodes are added, everything else of `current` stays.
 */
export function mergeOverlays(
  current: ProgressionOverlay,
  incoming: ProgressionOverlay,
): ProgressionOverlay {
  const incomingIds = new Set(incoming.added.map((node) => node.id));
  return {
    added: [...current.added.filter((node) => !incomingIds.has(node.id)), ...incoming.added],
    edited: { ...current.edited, ...incoming.edited },
    hidden: [...new Set([...current.hidden, ...incoming.hidden])],
  };
}

/** One entry of a shared overlay and whether it replaces one of the user's own changes. */
export interface ImportChange extends OverlayEntry {
  replacesYours: boolean;
}

/** What importing a shared overlay would do, and whether the result is a valid tree. */
export interface OverlayImportPreview {
  changes: ImportChange[];
  /** The user's overlay after the import. */
  merged: ProgressionOverlay;
  /** `applyOverlay` issues of `merged` (non-empty = it can't be imported). */
  issues: ValidationIssue[];
}

export function overlayImportPreview(
  base: readonly ExerciseNode[],
  current: ProgressionOverlay,
  incoming: ProgressionOverlay,
): OverlayImportPreview {
  const merged = mergeOverlays(current, incoming);
  const changes = overlayEntries(incoming, base).map((entry): ImportChange => ({
    ...entry,
    replacesYours: customizationOf(current, entry.nodeId) !== undefined,
  }));
  return { changes, merged, issues: applyOverlay(base, merged).issues };
}
