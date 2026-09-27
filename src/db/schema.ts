/**
 * The SQLite schema (Drizzle, ADR-002, ADR-026). `drizzle-kit generate` turns changes to this file into
 * a new, additive migration in `src/db/migrations/` (see docs/CONTEXT.md → Data model).
 *
 * Sources of truth (ADR-008): `sessions` + `session_sets` and `user_actions`. `node_progress` is a
 * cache rebuilt by `recompute`; it may be deleted at any time.
 *
 * Timestamps are integers in ms since the Unix epoch, like the domain types.
 */
import { index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { EquipmentTag, Metric, UserActionKind } from '@/domain/types';

/** System key/value pairs, e.g. the schema version and the first-run seed marker. */
export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

/** The single hero profile (row id 1). */
export const profile = sqliteTable('profile', {
  id: integer('id').primaryKey(),
  heroName: text('hero_name'),
  createdAt: integer('created_at').notNull(),
});

/** Goal node ids in priority order (`position` 0 = most important). */
export const goals = sqliteTable('goals', {
  nodeId: text('node_id').primaryKey(),
  position: integer('position').notNull(),
});

export const equipmentProfiles = sqliteTable('equipment_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** JSON array of `EquipmentTag`s. */
  tags: text('tags', { mode: 'json' }).$type<EquipmentTag[]>().notNull(),
  /** Display order. */
  position: integer('position').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  startedAt: integer('started_at').notNull(),
  endedAt: integer('ended_at'),
  /** The profile chosen at session start; kept (not cascaded) if the profile is deleted later. */
  equipmentProfileId: text('equipment_profile_id'),
});

/** One row per `LoggedSet` (ADR-021). `prescribed`/`actual` are flattened `SetPerformance`s. */
export const sessionSets = sqliteTable(
  'session_sets',
  {
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    setIndex: integer('set_index').notNull(),
    nodeId: text('node_id').notNull(),
    metric: text('metric').$type<Metric>().notNull(),
    prescribedValue: real('prescribed_value').notNull(),
    prescribedReps: integer('prescribed_reps'),
    actualValue: real('actual_value').notNull(),
    actualReps: integer('actual_reps'),
    isTrial: integer('is_trial', { mode: 'boolean' }).notNull(),
    timestamp: integer('timestamp').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.setIndex] }),
    index('session_sets_node_idx').on(table.nodeId),
  ],
);

/** Deliberate user decisions outside a workout (`UserAction`, ADR-023), e.g. `self_unlock`. */
export const userActions = sqliteTable('user_actions', {
  id: text('id').primaryKey(),
  kind: text('kind').$type<UserActionKind>().notNull(),
  nodeId: text('node_id').notNull(),
  at: integer('at').notNull(),
});

/** CACHE of `NodeProgress` per node (ADR-008). Rebuilt from history by `recompute`. */
export const nodeProgress = sqliteTable('node_progress', {
  nodeId: text('node_id').primaryKey(),
  xp: real('xp').notNull(),
  level: integer('level').notNull(),
  trialPassed: integer('trial_passed', { mode: 'boolean' }).notNull(),
  trialPassedAt: integer('trial_passed_at'),
  firstTrainedAt: integer('first_trained_at'),
  lastTrainedAt: integer('last_trained_at'),
  selfUnlockedAt: integer('self_unlocked_at'),
});

/** User settings as JSON values by key. */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
});

/**
 * The user's current progression overlay (ADR-016, PLAN 3.4): one row (id 1). `body` is the
 * `overlayToRaw` shape as JSON, which carries its own format `version`; `revision` counts the saves.
 */
export const progressionOverlay = sqliteTable('progression_overlay', {
  id: integer('id').primaryKey(),
  revision: integer('revision').notNull(),
  savedAt: integer('saved_at').notNull(),
  body: text('body', { mode: 'json' }).notNull(),
});

/**
 * The Train flow's session in progress (PLAN 4.4, ADR-034): one row (id 1) with the whole
 * `ActiveSession` as JSON, rewritten after every logged set so an app kill loses nothing. It is a
 * draft, not history: finishing it logs an ordinary session and deletes the row. Not part of backups;
 * an import deletes it.
 */
export const activeSession = sqliteTable('active_session', {
  id: integer('id').primaryKey(),
  updatedAt: integer('updated_at').notNull(),
  body: text('body', { mode: 'json' }).notNull(),
});
