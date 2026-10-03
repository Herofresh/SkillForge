import type { GuideTopic } from '@/domain/guide';

import type { IconName } from '../ui';

/** The pixel icon of each guide entry (PLAN 6.10c). */
export const GUIDE_ICONS: Readonly<Record<GuideTopic, IconName>> = {
  xp: 'star',
  skills: 'sword',
  safeguards: 'alert',
  attributes: 'bar',
  ranks: 'shield',
  streak: 'flame',
  classes: 'helmet',
  challenge: 'scroll',
  companion: 'heart',
  generator: 'hourglass',
  widgets: 'gear',
  data: 'potion',
};
