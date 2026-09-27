import { asc, eq, sql } from 'drizzle-orm';

import { EQUIPMENT_TAGS, type EquipmentProfile, type EquipmentTag } from '@/domain/types';

import type { AppDb } from './database';
import { oneOf } from './rowGuards';
import { equipmentProfiles } from './schema';

type Row = typeof equipmentProfiles.$inferSelect;

function toProfile(row: Row): EquipmentProfile {
  if (!Array.isArray(row.tags)) throw new Error(`Equipment profile '${row.id}' has no tag list`);
  return {
    id: row.id,
    name: row.name,
    tags: row.tags.map((tag: string) => oneOf(EQUIPMENT_TAGS, tag, 'equipment_profiles.tags')),
  };
}

/** All profiles in display order. */
export function listEquipmentProfiles(db: AppDb): EquipmentProfile[] {
  return db
    .select()
    .from(equipmentProfiles)
    .orderBy(asc(equipmentProfiles.position), asc(equipmentProfiles.id))
    .all()
    .map(toProfile);
}

/** Inserts a profile at `position` (default: after the last one). */
export function insertEquipmentProfile(
  db: AppDb,
  equipmentProfile: EquipmentProfile,
  position?: number,
): void {
  const next =
    position ??
    (db
      .select({ max: sql<number | null>`max(${equipmentProfiles.position})` })
      .from(equipmentProfiles)
      .get()?.max ?? -1) + 1;
  db.insert(equipmentProfiles)
    .values({ ...equipmentProfile, tags: [...equipmentProfile.tags], position: next })
    .run();
}

export function updateEquipmentProfile(
  db: AppDb,
  id: string,
  changes: { name?: string; tags?: readonly EquipmentTag[] },
): void {
  db.update(equipmentProfiles)
    .set({
      ...(changes.name !== undefined ? { name: changes.name } : {}),
      ...(changes.tags !== undefined ? { tags: [...changes.tags] } : {}),
    })
    .where(eq(equipmentProfiles.id, id))
    .run();
}

/** Deletes a profile. Past sessions keep their `equipment_profile_id` (history is never changed). */
export function deleteEquipmentProfile(db: AppDb, id: string): void {
  db.delete(equipmentProfiles).where(eq(equipmentProfiles.id, id)).run();
}
