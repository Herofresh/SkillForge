/**
 * Translations of the progression content (PLAN 7.8 FB-8, ADR-080): one YAML file per branch and
 * locale under `content/progressions/<locale>/`, with the texts a reader sees (name, description,
 * cues, prerequisite notes) and nothing else. The build checks each against the English nodes
 * (same ids, same number of cues, the same length limits) and generates
 * `src/data/skills/translations.generated.ts`; the store applies them when it loads
 * (`localizeNodes`). Pure TypeScript, like `progressionBuild.ts`.
 */
import { MAX_CUE_LENGTH } from '@/domain/nodeEditor';
import {
  BRANCHES,
  type Branch,
  type ExerciseNode,
  type LocaleTranslations,
  type NodeTranslation,
  type ValidationIssue,
} from '@/domain/types';
import type { Locale } from '@/i18n/locale';

import { PROGRESSIONS_DIR, type SourceFile } from './progressionBuild';
import { parseYamlText } from './progressionFormat';
import { MAX_DESCRIPTION_LENGTH } from './validate';

/** The locales with content translations (English is the source). */
export const TRANSLATED_LOCALES: readonly Locale[] = ['de'];
export const TRANSLATIONS_MODULE_PATH = 'src/data/skills/translations.generated.ts';

export function translationFilePath(locale: Locale, branch: Branch): string {
  return `${PROGRESSIONS_DIR}/${locale}/${branch}.yaml`;
}

/** Every translation of every node, by locale: what the generated module exports. */
export type NodeTranslations = Readonly<Partial<Record<Locale, LocaleTranslations>>>;

const NODE_KEYS = ['id', 'name', 'description', 'cues', 'prerequisite_notes'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Parses one translation file: `branch:` plus `nodes:` with id, name, description, cues, notes. */
export function parseTranslationFile(
  yamlText: string,
  file: string,
): { branch: Branch | undefined; nodes: Map<string, NodeTranslation>; issues: ValidationIssue[] } {
  const parsed = parseYamlText(yamlText, file);
  const nodes = new Map<string, NodeTranslation>();
  if (parsed.issues.length > 0) return { branch: undefined, nodes, issues: parsed.issues };
  const issues: ValidationIssue[] = [];
  const raw = parsed.value;
  if (!isRecord(raw) || typeof raw.branch !== 'string' || !Array.isArray(raw.nodes)) {
    issues.push({ file, message: "the file needs 'branch: <id>' and a 'nodes:' list" });
    return { branch: undefined, nodes, issues };
  }
  const branch = (BRANCHES as readonly string[]).includes(raw.branch)
    ? (raw.branch as Branch)
    : undefined;
  if (branch === undefined) issues.push({ file, message: `unknown branch '${raw.branch}'` });

  raw.nodes.forEach((entry: unknown, index: number) => {
    const nodeId = isRecord(entry) && typeof entry.id === 'string' ? entry.id : `node #${index + 1}`;
    const fail = (message: string) => issues.push({ file, nodeId, message });
    if (!isRecord(entry) || typeof entry.id !== 'string') {
      fail("must be a group of fields starting with 'id:'");
      return;
    }
    for (const key of Object.keys(entry)) {
      if (!(NODE_KEYS as readonly string[]).includes(key)) {
        fail(`unknown field '${key}' (translations carry only ${NODE_KEYS.join(', ')})`);
      }
    }
    const name = nonEmptyText(entry.name, 'name', fail);
    const description = nonEmptyText(entry.description, 'description', fail);
    if (description !== undefined && description.length > MAX_DESCRIPTION_LENGTH) {
      fail(`description is ${description.length} characters; keep it under ${MAX_DESCRIPTION_LENGTH}`);
    }
    let cues: string[] | undefined;
    if (entry.cues !== undefined) {
      if (!Array.isArray(entry.cues)) fail("'cues' must be a list of short lines");
      else {
        cues = entry.cues.flatMap((cue: unknown, cueIndex: number) => {
          const text = nonEmptyText(cue, `cue #${cueIndex + 1}`, fail);
          if (text !== undefined && text.length > MAX_CUE_LENGTH) {
            fail(`cue #${cueIndex + 1} is ${text.length} characters; keep it under ${MAX_CUE_LENGTH}`);
          }
          return text === undefined ? [] : [text];
        });
      }
    }
    let prerequisiteNotes: Record<string, string> | undefined;
    if (entry.prerequisite_notes !== undefined) {
      if (!isRecord(entry.prerequisite_notes)) {
        fail("'prerequisite_notes' must map a prerequisite's id to its note");
      } else {
        prerequisiteNotes = {};
        for (const [id, note] of Object.entries(entry.prerequisite_notes)) {
          const text = nonEmptyText(note, `note for '${id}'`, fail);
          if (text !== undefined) prerequisiteNotes[id] = text;
        }
      }
    }
    if (nodes.has(entry.id)) fail('appears twice in the file');
    if (name === undefined || description === undefined) return;
    nodes.set(entry.id, {
      name,
      description,
      ...(cues !== undefined ? { cues } : {}),
      ...(prerequisiteNotes !== undefined ? { prerequisiteNotes } : {}),
    });
  });
  return { branch, nodes, issues };
}

function nonEmptyText(value: unknown, what: string, fail: (message: string) => void): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${what} must be a non-empty text`);
    return undefined;
  }
  return value.trim();
}

export interface TranslationsBuild {
  translations: NodeTranslations;
  issues: ValidationIssue[];
}

/**
 * Reads every translation file for `TRANSLATED_LOCALES` and checks it against the English
 * `nodes`: every branch file present, every built-in node of the branch translated (and no other),
 * the same number of cues, notes only for prerequisites that have one.
 */
export function buildTranslations(
  files: readonly SourceFile[],
  nodes: readonly ExerciseNode[],
): TranslationsBuild {
  const issues: ValidationIssue[] = [];
  const translations: Partial<Record<Locale, Record<string, NodeTranslation>>> = {};
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const locale of TRANSLATED_LOCALES) {
    const table: Record<string, NodeTranslation> = {};
    for (const branch of BRANCHES) {
      const path = translationFilePath(locale, branch);
      const file = files.find((entry) => entry.path === path);
      if (!file) {
        issues.push({ file: path, message: 'file is missing' });
        continue;
      }
      const parsed = parseTranslationFile(file.text, path);
      issues.push(...parsed.issues);
      if (parsed.branch !== undefined && parsed.branch !== branch) {
        issues.push({ file: path, message: `says 'branch: ${parsed.branch}' but the file name differs` });
        continue;
      }
      const expected = nodes.filter((node) => node.branch === branch);
      for (const node of expected) {
        if (!parsed.nodes.has(node.id)) {
          issues.push({ file: path, nodeId: node.id, message: 'has no translation yet' });
        }
      }
      for (const [nodeId, translation] of parsed.nodes) {
        const node = byId.get(nodeId);
        const fail = (message: string) => issues.push({ file: path, nodeId, message });
        if (!node || node.branch !== branch) {
          fail(`is not a node of the ${branch} branch`);
          continue;
        }
        if ((translation.cues?.length ?? 0) !== node.cues.length) {
          fail(
            `has ${translation.cues?.length ?? 0} cues but the English node has ${node.cues.length}`,
          );
        }
        for (const id of Object.keys(translation.prerequisiteNotes ?? {})) {
          if (!node.prerequisites.some((prereq) => prereq.nodeId === id && prereq.note !== undefined)) {
            fail(`has a note for '${id}', which is not a prerequisite with a note`);
          }
        }
        for (const prereq of node.prerequisites) {
          if (prereq.note !== undefined && translation.prerequisiteNotes?.[prereq.nodeId] === undefined) {
            fail(`is missing the note for its prerequisite '${prereq.nodeId}'`);
          }
        }
        table[nodeId] = translation;
      }
    }
    translations[locale] = table;
  }
  return { translations, issues };
}

const GENERATED_HEADER = [
  '// GENERATED FILE - DO NOT EDIT.',
  '// Source: content/progressions/<locale>/*.yaml. Rebuild with `npm run progressions:build`.',
].join('\n');

/** The typed module the app imports: translations by locale, then node id. */
export function renderTranslationsModule(translations: NodeTranslations): string {
  const sorted = Object.fromEntries(
    Object.entries(translations).map(([locale, table]) => [
      locale,
      Object.fromEntries(Object.entries(table ?? {}).sort(([a], [b]) => (a < b ? -1 : 1))),
    ]),
  );
  return [
    GENERATED_HEADER,
    "import type { NodeTranslations } from '@/data/progressionTranslations';",
    '',
    `export const GENERATED_TRANSLATIONS: NodeTranslations = ${JSON.stringify(sorted, null, 2)};`,
    '',
  ].join('\n');
}
