/**
 * Skill content in the user's language (PLAN 7.8 FB-8, ADR-080): the built-in nodes keep their
 * English text in the data; a locale's translations (`content/progressions/<locale>/*.yaml`,
 * generated into `src/data/skills`) replace name, description, cues and prerequisite notes of the
 * nodes they cover. User-made nodes and anything without a translation stay as they are. Pure.
 */
import type { ExerciseNode, LocaleTranslations, NodeTranslation, Prerequisite } from './types';

/** `node` with `translation`'s texts; cues only when the count matches (else the English cues). */
export function localizeNode(node: ExerciseNode, translation: NodeTranslation): ExerciseNode {
  const cues =
    translation.cues !== undefined && translation.cues.length === node.cues.length
      ? translation.cues
      : node.cues;
  const notes = translation.prerequisiteNotes;
  const prerequisites: Prerequisite[] = notes
    ? node.prerequisites.map((prereq) =>
        prereq.note !== undefined && notes[prereq.nodeId] !== undefined
          ? { ...prereq, note: notes[prereq.nodeId] }
          : prereq,
      )
    : node.prerequisites;
  return {
    ...node,
    name: translation.name,
    description: translation.description,
    cues,
    prerequisites,
  };
}

/**
 * Every built-in (`source: 'core'`) node of `nodes` in the language of `translations`; without
 * translations (English) the same array comes back.
 */
export function localizeNodes(
  nodes: readonly ExerciseNode[],
  translations: LocaleTranslations | undefined,
): readonly ExerciseNode[] {
  if (!translations) return nodes;
  return nodes.map((node) => {
    const translation = node.source === 'core' ? translations[node.id] : undefined;
    return translation ? localizeNode(node, translation) : node;
  });
}
