/**
 * The first-run defaults (ADR-026): the hero profile and the Home and Park equipment profiles,
 * plus the `defaults_seeded_at` marker. Written by the first-run seed (`seedDefaults`) and again
 * after "Delete all my data" (`deleteAllUserData`, ADR-064), so a wiped app starts like a fresh one.
 */
import { DEFAULT_EQUIPMENT_PROFILES } from '@/domain/equipment';

import type { AppDb } from './database';
import { insertEquipmentProfile } from './equipmentProfileRepository';
import { META_KEYS, setMeta } from './metaRepository';
import { createProfile } from './profileRepository';

/** Writes the defaults. Call it inside a transaction on empty user tables. */
export function writeDefaults(db: AppDb, now: number): void {
  createProfile(db, now);
  DEFAULT_EQUIPMENT_PROFILES.forEach((profile, position) =>
    insertEquipmentProfile(db, profile, position),
  );
  setMeta(db, META_KEYS.defaultsSeededAt, String(now));
}
