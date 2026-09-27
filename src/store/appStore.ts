/**
 * The app store (Zustand, PLAN 3.2): UI actions → pure domain functions → repositories.
 *
 * - `loadAll` reads the stored overlay, the history (`session_sets`, `user_actions`) and the user's
 *   settings, rebuilds the engine state with `recompute` (ADR-008) and rewrites the `node_progress`
 *   cache.
 * - The tree is the built-in matrix with the stored overlay applied (`applyOverlay`, ADR-016, PLAN
 *   3.4). `state.nodes` is that merged tree and every engine call (recompute, apply, generator) uses
 *   it. `saveOverlay` refuses an overlay with validator issues and writes nothing.
 * - `logSession` / `selfUnlock` persist the new history entry first, then apply it incrementally
 *   (or recompute when it lies in the past, `canApplyIncrementally`) and refresh the cache.
 * - Backups (PLAN 3.3, ADR-028): `exportBackup` serializes all user data; `importBackup` validates
 *   the whole file first, saves a safety copy of the current data, then replaces everything in one
 *   transaction and reloads. Never a partial import.
 * - Onboarding (PLAN 4.1, ADR-031): `setHeroName`, `toggleGoal`, `logTrial` (assessment test-outs,
 *   logged as ordinary Trial sessions) and `completeOnboarding` (the `onboarding_completed_at`
 *   setting, so it travels with backups).
 * - Nothing here blocks the user (ADR-023): warnings come back in the results for the UI.
 *
 * `createAppStore` takes its dependencies (database, built-in tree, clock, id source, file access) so
 * tests can run it on a Node-backed database; the app creates one instance in `bootstrap.ts`.
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
import { getOverlay, saveOverlay } from '@/db/overlayRepository';
import { getProfile, setHeroName } from '@/db/profileRepository';
import { insertSession, listSessions } from '@/db/sessionRepository';
import { getSetting, setSetting } from '@/db/settingsRepository';
import { insertUserAction, listUserActions } from '@/db/userActionRepository';
import { readUserData, replaceUserData } from '@/db/userDataRepository';
import { testOutWarnings, trialSession } from '@/domain/assessment';
import { backupFileName, parseBackup, serializeBackup } from '@/domain/backup';
import { generateWorkout } from '@/domain/generator';
import { normalizeHeroName, toggleGoal } from '@/domain/onboarding';
import { applyOverlay, EMPTY_OVERLAY } from '@/domain/overlay';
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
  ProgressionOverlay,
  SafeguardWarning,
  SessionDetails,
  SetPerformance,
  UserAction,
  ValidationIssue,
  WorkoutPlan,
} from '@/domain/types';
import { createId } from '@/lib/id';
import { MS_PER_DAY } from '@/lib/time';

/**
 * How far back `generateWorkout` gets sessions. The generator needs at least two weeks (48 h rules,
 * pattern recency); four weeks also cover its 3-session stagnation check for weekly trainers.
 */
export const GENERATOR_HISTORY_DAYS = 28;

/** Setting key: when the user finished onboarding (ms since the Unix epoch). */
export const ONBOARDING_COMPLETED_SETTING = 'onboarding_completed_at';

/** File name prefix of the safety copy written before an import replaces the data. */
export const SAFETY_COPY_PREFIX = 'skillforge-before-import';

/** Platform file access for backups (`backupFiles.ts` in the app, a fake in tests). */
export interface BackupFiles {
  /** Offers `text` to the user as a file (share sheet: save to Drive, send, …). */
  share(fileName: string, text: string): Promise<void>;
  /** Lets the user pick a file and returns its text, or `undefined` when they cancel. */
  pick(): Promise<string | undefined>;
  /** Writes a copy into the app's own storage and returns its location. Throws on failure. */
  saveSafetyCopy(fileName: string, text: string): string;
}

export interface AppStoreDeps {
  db: AppDb;
  /** The built-in tree (`ALL_NODES`). The stored overlay is applied on top of it. */
  baseNodes: readonly ExerciseNode[];
  now?: () => number;
  newId?: (now: number) => string;
  /** Needed by `shareBackup` / `importBackupFromFile` and for the pre-import safety copy file. */
  files?: BackupFiles;
}

export interface EquipmentProfileChanges {
  name?: string;
  tags?: readonly EquipmentTag[];
}

/** The data an import replaced, kept so the user can go back. */
export interface SafetyCopy {
  fileName: string;
  /** The full backup text of the replaced data. */
  text: string;
  /** Where `files.saveSafetyCopy` stored it (absent without file access, e.g. in tests). */
  location?: string;
}

export type ImportBackupResult =
  | { status: 'imported'; safetyCopy: SafetyCopy }
  | { status: 'rejected'; issues: ValidationIssue[] };

export type ImportBackupFileResult = ImportBackupResult | { status: 'canceled' };

export interface AppState {
  /** `loadAll` has run at least once. */
  loaded: boolean;
  /** The user's tree: `applyOverlay(baseNodes, overlay).nodes`, or the built-in tree on issues. */
  nodes: readonly ExerciseNode[];
  /** The stored overlay (empty when the user changed nothing). */
  overlay: ProgressionOverlay;
  /**
   * Issues of the stored overlay against the current built-in tree (e.g. after an app update
   * removed a node it edits). Non-empty means the built-in tree is used; the overlay is kept.
   */
  overlayIssues: ValidationIssue[];
  engine: EngineState;
  /** Full history in replay order (source of truth, ADR-008). */
  sessions: LoggedSession[];
  userActions: UserAction[];
  /** Goal node ids, most important first. */
  goals: string[];
  equipmentProfiles: EquipmentProfile[];
  profile?: HeroProfile;
  /** When onboarding was finished; unset = show the first-run flow (PLAN 4.1). */
  onboardingCompletedAt?: number;

  loadAll(): void;
  logSession(session: LoggedSession, details?: SessionDetails): SessionResult;
  selfUnlock(nodeId: string): UserActionResult;
  setGoals(nodeIds: readonly string[]): void;
  /**
   * Adds `nodeId` to the goals or removes it (`toggleGoal`, at most `MAX_GOALS`). Returns false when
   * the list is full and nothing changed.
   */
  toggleGoal(nodeId: string): boolean;
  /** Stores the hero name (`normalizeHeroName`). Throws when nothing is left of it. */
  setHeroName(name: string): void;
  /**
   * Logs a Trial attempt on `nodeId` now, one set per result (the assessment's "I can already do
   * this"). A passed Trial is a test-out (ADR-023); warnings come back in the result, never a block.
   */
  logTrial(nodeId: string, results: readonly SetPerformance[]): SessionResult;
  /** What to show and acknowledge before `logTrial` on `nodeId` now (`testOutWarnings`). */
  testOutWarnings(nodeId: string): SafeguardWarning[];
  /** Marks onboarding as done (the app then opens on the tabs). */
  completeOnboarding(): void;
  createEquipmentProfile(name: string, tags: readonly EquipmentTag[]): EquipmentProfile;
  updateEquipmentProfile(id: string, changes: EquipmentProfileChanges): void;
  deleteEquipmentProfile(id: string): void;
  /** Suggests a session for the chosen profile and time (ADR-024). `seed` varies the tie-breaks. */
  generateWorkout(equipmentProfileId: string, availableMinutes: number, seed?: number): WorkoutPlan;
  /**
   * Stores `overlay` as the current one and reloads the tree and progress. Returns the
   * `applyOverlay` issues instead (and writes nothing) when the merged tree would be broken.
   */
  saveOverlay(overlay: ProgressionOverlay): ValidationIssue[];
  /** All user data as backup text (`serializeBackup`), read from the database. */
  exportBackup(): { fileName: string; text: string };
  /**
   * Replaces ALL user data with the backup in `text`. Validates the whole file first (issues →
   * nothing written), then saves a safety copy of the current data, then replaces everything in
   * one transaction and reloads.
   */
  importBackup(text: string): ImportBackupResult;
  /** `exportBackup`, then hand the file to the share sheet. */
  shareBackup(): Promise<void>;
  /** Let the user pick a file, then `importBackup` it. */
  importBackupFromFile(): Promise<ImportBackupFileResult>;
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
  const { db, baseNodes } = deps;
  const now = deps.now ?? Date.now;
  const newId = deps.newId ?? createId;

  const requireFiles = (): BackupFiles => {
    if (!deps.files) throw new Error('This store has no file access for backups');
    return deps.files;
  };

  return createStore<AppState>()((set, get) => {
    const requireNode = (nodeId: string): ExerciseNode => {
      const node = get().nodes.find((candidate) => candidate.id === nodeId);
      if (!node) throw new Error(`Unknown node '${nodeId}'`);
      return node;
    };

    /** Stores the new engine state and rewrites the progress cache from it. */
    const commitEngine = (engine: EngineState, changes: Partial<AppState>): void => {
      replaceNodeProgress(db, engine.progress);
      set({ ...changes, engine });
    };

    return {
      loaded: false,
      nodes: baseNodes,
      overlay: EMPTY_OVERLAY,
      overlayIssues: [],
      engine: INITIAL_ENGINE_STATE,
      sessions: [],
      userActions: [],
      goals: [],
      equipmentProfiles: [],

      loadAll() {
        const overlay = getOverlay(db)?.overlay ?? EMPTY_OVERLAY;
        const { nodes, issues: overlayIssues } = applyOverlay(baseNodes, overlay);
        const sessions = listSessions(db);
        const userActions = listUserActions(db);
        const { state: engine } = recompute(nodes, sessions, userActions);
        const completedAt = getSetting(db, ONBOARDING_COMPLETED_SETTING);
        commitEngine(engine, {
          onboardingCompletedAt: typeof completedAt === 'number' ? completedAt : undefined,
          loaded: true,
          nodes,
          overlay,
          overlayIssues,
          sessions,
          userActions,
          goals: listGoals(db),
          equipmentProfiles: listEquipmentProfiles(db),
          profile: getProfile(db),
        });
      },

      logSession(session, details) {
        insertSession(db, session, details);
        const { engine, sessions, userActions, nodes } = get();
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
        const { engine, sessions, userActions, nodes } = get();
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

      toggleGoal(nodeId) {
        requireNode(nodeId);
        const { goals, changed } = toggleGoal(get().goals, nodeId);
        if (changed) get().setGoals(goals);
        return changed;
      },

      setHeroName(name) {
        const heroName = normalizeHeroName(name);
        if (heroName === undefined) throw new Error('The hero needs a name');
        setHeroName(db, heroName);
        set({ profile: getProfile(db) });
      },

      logTrial(nodeId, results) {
        const node = requireNode(nodeId);
        const at = now();
        return get().logSession(trialSession(node, results, newId(at), at), { endedAt: at });
      },

      testOutWarnings(nodeId) {
        const node = requireNode(nodeId);
        const { nodes, engine } = get();
        return testOutWarnings(
          node,
          nodes,
          engine.progress,
          engine.lastStraightArmSessionAt,
          now(),
        );
      },

      completeOnboarding() {
        const at = now();
        setSetting(db, ONBOARDING_COMPLETED_SETTING, at);
        set({ onboardingCompletedAt: at });
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
        const { equipmentProfiles, goals, engine, sessions, nodes } = get();
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

      saveOverlay(overlay) {
        const { issues } = applyOverlay(baseNodes, overlay);
        if (issues.length > 0) return issues;
        saveOverlay(db, overlay, now());
        get().loadAll(); // the tree changed: full recompute (ADR-008)
        return [];
      },

      exportBackup() {
        const at = now();
        return { fileName: backupFileName(at), text: serializeBackup(readUserData(db), at) };
      },

      importBackup(text) {
        const { data, issues } = parseBackup(text, baseNodes);
        if (!data) return { status: 'rejected', issues };
        const at = now();
        const current = serializeBackup(readUserData(db), at);
        const fileName = backupFileName(at, SAFETY_COPY_PREFIX);
        // Runs before the replace: if the copy cannot be written, this throws and nothing changes.
        const location = deps.files?.saveSafetyCopy(fileName, current);
        replaceUserData(db, data, at);
        get().loadAll(); // history in the past and a new tree: full recompute
        return {
          status: 'imported',
          safetyCopy: { fileName, text: current, ...(location !== undefined ? { location } : {}) },
        };
      },

      async shareBackup() {
        const files = requireFiles();
        const { fileName, text } = get().exportBackup();
        await files.share(fileName, text);
      },

      async importBackupFromFile() {
        const text = await requireFiles().pick();
        if (text === undefined) return { status: 'canceled' };
        return get().importBackup(text);
      },
    };
  });
}
