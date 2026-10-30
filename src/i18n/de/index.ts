/**
 * The German dictionary (PLAN 7.8 FB-8, ADR-080): English source text → German, one file per
 * area so the parts can be written and reviewed apart. `src/i18n/i18n.test.ts` checks that every
 * `t('…')` / `k('…')` key in the source has an entry and that no entry is left over.
 */
import type { Dictionary } from '../t';

import { CHARACTER_DE } from './character';
import { COMMON_DE } from './common';
import { EDITOR_DE } from './editor';
import { GUIDE_DE } from './guide';
import { SETTINGS_DE } from './settings';
import { TRAIN_DE } from './train';
import { TREE_DE } from './tree';

export const DE: Dictionary = {
  ...COMMON_DE,
  ...TRAIN_DE,
  ...TREE_DE,
  ...CHARACTER_DE,
  ...SETTINGS_DE,
  ...EDITOR_DE,
  ...GUIDE_DE,
};
