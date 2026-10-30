/**
 * Default equipment profiles (ADR-005, docs/CONTEXT.md → Equipment tags). They are seeded into the
 * database on first run; the user can edit or delete them afterwards (the app suggests, the user
 * decides, ADR-023).
 */
import { k } from '@/i18n';

import type { EquipmentProfile, EquipmentTag } from './types';

/** Home: floor, wall, pull-up bar, parallettes and bands. */
export const HOME_EQUIPMENT: readonly EquipmentTag[] = [
  'floor',
  'wall',
  'bar',
  'parallettes',
  'bands',
];

/** Park: everything at Home plus dip bars. */
export const PARK_EQUIPMENT: readonly EquipmentTag[] = [...HOME_EQUIPMENT, 'dip_bars'];

export const DEFAULT_EQUIPMENT_PROFILES: readonly EquipmentProfile[] = [
  { id: 'home', name: 'Home', tags: [...HOME_EQUIPMENT] },
  { id: 'park', name: 'Park', tags: [...PARK_EQUIPMENT] },
];

/** Display names of the equipment tags (onboarding, settings): English, shown through `t`. */
export const EQUIPMENT_TAG_LABELS: Readonly<Record<EquipmentTag, string>> = {
  floor: k('Floor'),
  wall: k('Wall'),
  bar: k('Pull-up bar'),
  dip_bars: k('Dip bars'),
  parallettes: k('Parallettes'),
  bands: k('Bands'),
  rings: k('Rings'),
  pole: k('Pole'),
  box: k('Box or bench'),
};

/** `tags` with `tag` added (at the end) or removed. */
export function toggleEquipmentTag(
  tags: readonly EquipmentTag[],
  tag: EquipmentTag,
): EquipmentTag[] {
  return tags.includes(tag) ? tags.filter((entry) => entry !== tag) : [...tags, tag];
}
