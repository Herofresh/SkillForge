/**
 * Node-only file access for the progression matrix, shared by `scripts/progressions.ts` and the
 * dataset test. Everything else about the matrix is pure and lives in `src/data/`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  GENERATED_MODULE_PATH,
  PROGRESSIONS_DIR,
  REVIEW_SHEET_PATH,
  buildMatrix,
  renderGeneratedModule,
  renderReviewSheet,
} from '@/data/progressionBuild';
import type { BuildResult, SourceFile } from '@/data/progressionBuild';
import {
  TRANSLATED_LOCALES,
  TRANSLATIONS_MODULE_PATH,
  buildTranslations,
  renderTranslationsModule,
} from '@/data/progressionTranslations';

export const REPO_ROOT = join(__dirname, '..');

/** Reads every `*.yaml` file in `content/progressions/` (sorted, LF line endings). */
export function readProgressionSources(root: string = REPO_ROOT): SourceFile[] {
  return readYamlDir(PROGRESSIONS_DIR, root);
}

/** Reads every `*.yaml` file in `content/progressions/<locale>/` for each translated locale. */
export function readTranslationSources(root: string = REPO_ROOT): SourceFile[] {
  return TRANSLATED_LOCALES.flatMap((locale) => readYamlDir(`${PROGRESSIONS_DIR}/${locale}`, root));
}

function readYamlDir(dir: string, root: string): SourceFile[] {
  let names: string[];
  try {
    names = readdirSync(join(root, dir));
  } catch {
    return [];
  }
  return names
    .filter((name) => name.endsWith('.yaml') || name.endsWith('.yml'))
    .sort()
    .map((name) => ({ path: `${dir}/${name}`, text: readRepoFile(`${dir}/${name}`, root) ?? '' }));
}

/** Reads a repo file with LF line endings, or `undefined` if it does not exist. */
export function readRepoFile(path: string, root: string = REPO_ROOT): string | undefined {
  try {
    return readFileSync(join(root, path), 'utf8').replace(/\r\n/g, '\n');
  } catch {
    return undefined;
  }
}

export interface GeneratedOutput {
  path: string;
  expected: string;
}

/** Builds the matrix and its translations, and the text every generated file should have. */
export function buildFromDisk(root: string = REPO_ROOT): {
  result: BuildResult;
  outputs: GeneratedOutput[];
} {
  const matrix = buildMatrix(readProgressionSources(root));
  const translated = buildTranslations(readTranslationSources(root), matrix.nodes);
  const result: BuildResult = {
    ...matrix,
    issues: [...matrix.issues, ...translated.issues],
    translations: translated.translations,
  };
  return {
    result,
    outputs: [
      { path: GENERATED_MODULE_PATH, expected: renderGeneratedModule(result.nodes) },
      {
        path: TRANSLATIONS_MODULE_PATH,
        expected: renderTranslationsModule(translated.translations),
      },
      { path: REVIEW_SHEET_PATH, expected: renderReviewSheet(result.nodes) },
    ],
  };
}
