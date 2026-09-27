/**
 * The app store (Zustand, PLAN 3.2): UI actions → pure domain functions → repositories.
 *
 * - `loadAll` reads the history (`session_sets`, `user_actions`) and the user's settings, rebuilds
 *   the engine state with `recompute` (ADR-008) and rewrites the `node_progress` cache.
 * - `logSession` / `selfUnlock` persist the new history entry first, then apply it incrementally
 *   (or recompute when it lies in the past, `canApplyIncrementally`) and refresh the cache.
 * - Nothing here blocks the user (ADR-023): warnings come back in the results for the UI.
 *
 * `createAppStore` takes its dependencies (database, tree, clock, id source) so tests can run it on a
 * Node-backed database; the app creates one instance in `bootstrap.ts`.
 */
import { createStore, type StoreApi } from 'zustand/vanilla';

import type { AppDb } from '@/db/database';
import {
  deleteEquipmentProfile,
  insertEquipmentProfile,
  listEquipmentProfiles,
  updateEquipmentProfile,
} from '@/db/equipmentProfileRepository';
import { listGoals, replaceGoals } from '@/db/goalRepository';
import { replaceNodeProgress } from '@/db/nodeProgressRepository';
import { getProfile } from '@/db/profileRepository';
import { insertSession, listSessions, type SessionDetails } from '@/db/sessionRepository';
import { insertUserAction, listUserActions } from '@/db/userActionRepository';
import { generateWorkout } from '@/domain/generator';
import {
  applySession,
  applyUserAction,
  canApplyIncrementally,
  compareHistory,
  INITIAL_ENGINE_STATE,
  recompute,
  type EngineState,
  type SessionResult,
  type UserActionResult,
} from '@/domain/recompute';
import type {
  EquipmentProfile,
  EquipmentTag,
  ExerciseNode,
  HeroProfile,
  LoggedSession,
  UserAction,
  WorkoutPlan,
} from '@/domain/types';
import { createId } from '@/lib/id';
import { MS_PER_DAY } from '@/lib/time';

/**
 * How far back `generateWorkout` gets sessions. The generator needs at least two weeks (48 h rules,
 * pattern recency); four weeks also cover its 3-session stagnation check for weekly trainers.
 */
export const GENERATOR_HISTORY_DAYS = 28;

export interface AppStoreDeps {
  db: AppDb;
  /** The user's tree. Today `ALL_NODES`; with the stored overlay (3.4) the merged tree. */
  nodes: readonly ExerciseNode[];
  now?: () => number;
  newId?: (now: number) => string;
}

export interface EquipmentProfileChanges {
  name?: string;
  tags?: readonly EquipmentTag[];
}

export interface AppState {
  /** `loadAll` has run at least once. */
  loaded: boolean;
  nodes: readonly ExerciseNode[];
  engine: EngineState;
  /** Full history in replay order (source of truth, ADR-008). */
  sessions: LoggedSession[];
  userActions: UserAction[];
  /** Goal node ids, most important first. */
  goals: string[];
  equipmentProfiles: EquipmentProfile[];
  profile?: HeroProfile;

  loadAll(): void;
  logSession(session: LoggedSession, details?: SessionDetails): SessionResult;
  selfUnlock(nodeId: string): UserActionResult;
  setGoals(nodeIds: readonly string[]): void;
  createEquipmentProfile(name: string, tags: readonly EquipmentTag[]): EquipmentProfile;
  updateEquipmentProfile(id: string, changes: EquipmentProfileChanges): void;
  deleteEquipmentProfile(id: string): void;
  /** Suggests a session for the chosen profile and time (ADR-024). `seed` varies the tie-breaks. */
  generateWorkout(equipmentProfileId: string, availableMinutes: number, seed?: number): WorkoutPlan;
}

export type AppStore = StoreApi<AppState>;

function uniqueTags(tags: readonly EquipmentTag[]): EquipmentTag[] {
  return [...new Set(tags)];
}

function requireName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) throw new Error('An equipment profile needs a name');
  return trimmed;
}

export function createAppStore(deps: AppStoreDeps): AppStore {
  const { db, nodes } = deps;
  const now = deps.now ?? Date.now;
  const newId = deps.newId ?? createId;
  const nodeIds = new Set(nodes.map((node) => node.id));

  const requireNode = (nodeId: string): void => {
    if (!nodeIds.has(nodeId)) throw new Error(`Unknown node '${nodeId}'`);
  };

  return createStore<AppState>()((set, get) => {
    /** Stores the new engine state and rewrites the progress cache from it. */
    const commitEngine = (engine: EngineState, changes: Partial<AppState>): void => {
      replaceNodeProgress(db, engine.progress);
      set({ ...changes, engine });
    };

    return {
      loaded: false,
      nodes,
      engine: INITIAL_ENGINE_STATE,
      sessions: [],
      userActions: [],
      goals: [],
      equipmentProfiles: [],

      loadAll() {
        const sessions = listSessions(db);
        const userActions = listUserActions(db);
        const { state: engine } = recompute(nodes, sessions, userActions);
        commitEngine(engine, {
          loaded: true,
          sessions,
          userActions,
          goals: listGoals(db),
          equipmentProfiles: listEquipmentProfiles(db),
          profile: getProfile(db),
        });
      },

      logSession(session, details) {
        insertSession(db, session, details);
        const { engine, sessions, userActions } = get();
        const allSessions = [...sessions, session].sort(compareHistory);
        if (canApplyIncrementally(engine, session)) {
          const step = applySession(engine, session, nodes);
          commitEngine(step.state, { sessions: allSessions });
          return step.result;
        }
        const rebuilt = recompute(nodes, allSessions, userActions);
        commitEngine(rebuilt.state, { sessions: allSessions });
        return rebuilt.results.find((result) => result.sessionId === session.id) as SessionResult;
      },

      selfUnlock(nodeId) {
        requireNode(nodeId);
        const at = now();
        const action: UserAction = { id: newId(at), kind: 'self_unlock', nodeId, at };
        insertUserAction(db, action);
        const { engine, sessions, userActions } = get();
        const allActions = [...userActions, action];
        if (canApplyIncrementally(engine, action)) {
          const step = applyUserAction(engine, action, nodes);
          commitEngine(step.state, { userActions: allActions });
          return step.result;
        }
        const rebuilt = recompute(nodes, sessions, allActions);
        commitEngine(rebuilt.state, { userActions: allActions });
        return rebuilt.actionResults.find(
          (result) => result.actionId === action.id,
        ) as UserActionResult;
      },

      setGoals(goalIds) {
        goalIds.forEach(requireNode);
        replaceGoals(db, goalIds);
        set({ goals: listGoals(db) });
      },

      createEquipmentProfile(name, tags) {
        const profile: EquipmentProfile = {
          id: newId(now()),
          name: requireName(name),
          tags: uniqueTags(tags),
        };
        insertEquipmentProfile(db, profile);
        set({ equipmentProfiles: listEquipmentProfiles(db) });
        return profile;
      },

      updateEquipmentProfile(id, changes) {
        updateEquipmentProfile(db, id, {
          ...(changes.name !== undefined ? { name: requireName(changes.name) } : {}),
          ...(changes.tags !== undefined ? { tags: uniqueTags(changes.tags) } : {}),
        });
        set({ equipmentProfiles: listEquipmentProfiles(db) });
      },

      deleteEquipmentProfile(id) {
        deleteEquipmentProfile(db, id);
        set({ equipmentProfiles: listEquipmentProfiles(db) });
      },

      generateWorkout(equipmentProfileId, availableMinutes, seed) {
        const { equipmentProfiles, goals, engine, sessions } = get();
        const profile = equipmentProfiles.find((candidate) => candidate.id === equipmentProfileId);
        if (!profile) throw new Error(`Unknown equipment profile '${equipmentProfileId}'`);
        const at = now();
        const since = at - GENERATOR_HISTORY_DAYS * MS_PER_DAY;
        return generateWorkout({
          nodes,
          goals,
          progress: engine.progress,
          equipment: profile.tags,
          availableMinutes,
          recentSessions: sessions.filter((session) => session.startedAt >= since),
          now: at,
          seed: seed ?? sessions.length,
        });
      },
    };
  });
}
