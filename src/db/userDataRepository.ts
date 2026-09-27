/**
 * All user data at once (PLAN 3.3, ADR-028): read for a backup, replaced by an import. The
 * `node_progress` cache is cleared on replace (the store recomputes it) and `meta` (schema version,
 * seed marker) is never touched.
 */
import { EMPTY_OVERLAY, isEmptyOverlay } from '@/domain/overlay';
import type { UserData } from '@/domain/types';

import type { AppDb } from './database';
import { insertEquipmentProfile, listEquipmentProfiles } from './equipmentProfileRepository';
import { listGoals, replaceGoals } from './goalRepository';
import { clearOverlay, getOverlay, saveOverlay } from './overlayRepository';
import { createProfile, getProfile, setHeroName } from './profileRepository';
import {
  equipmentProfiles,
  goals,
  nodeProgress,
  profile,
  progressionOverlay,
  sessionSets,
  sessions,
  settings,
  userActions,
} from './schema';
import { insertSession, listStoredSessions } from './sessionRepository';
import { listSettings, setSetting } from './settingsRepository';
import { insertUserAction, listUserActions } from './userActionRepository';

/** Tables an import replaces: every user table except `meta`. */
const USER_TABLES = [
  sessionSets,
  sessions,
  userActions,
  goals,
  equipmentProfiles,
  settings,
  profile,
  progressionOverlay,
  nodeProgress,
] as const;

export function readUserData(db: AppDb): UserData {
  const heroProfile = getProfile(db);
  return {
    ...(heroProfile !== undefined ? { profile: heroProfile } : {}),
    goals: listGoals(db),
    equipmentProfiles: listEquipmentProfiles(db),
    sessions: listStoredSessions(db),
    userActions: listUserActions(db),
    overlay: getOverlay(db)?.overlay ?? EMPTY_OVERLAY,
    settings: listSettings(db),
  };
}

/**
 * Deletes all user data and writes `data` instead, in ONE transaction: if any write fails, nothing
 * changes. `data` must already be validated (`parseBackup`). `now` stamps the stored overlay.
 */
export function replaceUserData(db: AppDb, data: UserData, now: number): void {
  db.transaction((tx) => {
    for (const table of USER_TABLES) tx.delete(table).run();

    if (data.profile) {
      createProfile(tx, data.profile.createdAt);
      if (data.profile.heroName !== undefined) setHeroName(tx, data.profile.heroName);
    }
    replaceGoals(tx, data.goals);
    data.equipmentProfiles.forEach((equipmentProfile, position) =>
      insertEquipmentProfile(tx, equipmentProfile, position),
    );
    for (const { endedAt, equipmentProfileId, ...session } of data.sessions) {
      insertSession(tx, session, {
        ...(endedAt !== undefined ? { endedAt } : {}),
        ...(equipmentProfileId !== undefined ? { equipmentProfileId } : {}),
      });
    }
    data.userActions.forEach((action) => insertUserAction(tx, action));
    if (isEmptyOverlay(data.overlay)) clearOverlay(tx);
    else saveOverlay(tx, data.overlay, now);
    for (const [key, value] of Object.entries(data.settings)) setSetting(tx, key, value);
  });
}
