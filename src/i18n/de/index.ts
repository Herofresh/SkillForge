/**
 * The German dictionary (PLAN 7.8 FB-8, ADR-080): English source text → German, one file per
 * area so the parts can be written and reviewed apart. `src/i18n/i18n.test.ts` checks that every
 * `t('…')` / `k('…')` key in the source has an entry and that no entry is left over.
 */
import type { Dictionary } from '../t';

import { COMMON_DE } from './common';

export const DE: Dictionary = {
  ...COMMON_DE,
};
