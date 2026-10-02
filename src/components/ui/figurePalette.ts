/**
 * Colors of the exercise-animation figure (PLAN 6.4, ADR-053): the gold hero of the app icon
 * (ADR-042) with its far limbs in the shaded gold, steel equipment and bronze floor and walls.
 * No React Native imports, so the preview script (scripts/animationSheet.ts) uses it too.
 */
import type { FigureRole } from '@/lib/figureRaster';

import type { PaletteColor } from '../palette';

export const FIGURE_COLORS: Readonly<Record<Exclude<FigureRole, '.'>, PaletteColor>> = {
  '#': 'gold',
  '*': 'goldLight',
  k: 'ink',
  o: 'goldDark',
  '+': 'steel',
  s: 'steelDark',
  '=': 'bronze',
};
