/**
 * The backup file (PLAN 3.3, ADR-028): all user data as one JSON document with a `schemaVersion`.
 *
 * - `serializeBackup` writes it; `parseBackup` reads it back and checks EVERYTHING before the caller
 *   writes anything: the JSON, the header (a newer `schemaVersion` is refused), every field, unique
 *   ids, the overlay (field checks and `applyOverlay` against the built-in tree) and that the goals
 *   exist in the resulting tree. All problems come back as plain-language issues with a path, e.g.
 *   `backup: sessions[2].sets[0].metric: must be one of reps, hold_s, …`.
 * - History is kept as it is: sets and user actions on nodes that are not in the tree are allowed
 *   (the engine ignores them, like hidden nodes), and a session may name a deleted equipment profile.
 *
 * Pure TypeScript: no React/Expo/DB (ADR-009). Files and the database live in `src/store/` and `src/db/`.
 */
import {
  applyOverlay,
  OVERLAY_FORMAT,
  overlayFromRaw,
  overlayToRaw,
  type OverlayImport,
} from './overlay';
import {
  EQUIPMENT_TAGS,
  METRICS,
  USER_ACTION_KINDS,
  type EquipmentProfile,
  type ExerciseNode,
  type HeroProfile,
  type LoggedSet,
  type SetPerformance,
  type StoredSession,
  type UserAction,
  type UserData,
  type ValidationIssue,
} from './types';

/** Marks a JSON document as a SkillForge backup. */
export const BACKUP_FORMAT = 'skillforge-backup';
/** The backup layout this build writes and the newest one it reads. Bump it with a new ADR. */
export const BACKUP_SCHEMA_VERSION = 1;
/** Label used as `file` in backup issues. */
export const BACKUP_FILE = 'backup';
export const BACKUP_MIME_TYPE = 'application/json';

const TOP_LEVEL_KEYS = [
  'format',
  'schemaVersion',
  'exportedAt',
  'profile',
  'goals',
  'equipmentProfiles',
  'sessions',
  'userActions',
  'overlay',
  'settings',
] as const;

export interface BackupParse {
  /** The validated data, or `undefined` when there is any issue. */
  data: UserData | undefined;
  /** When the backup was written (ms since the Unix epoch), if readable. */
  exportedAt?: number;
  issues: ValidationIssue[];
}

/** A file name like `skillforge-backup-2026-09-27T08-30-00Z.json` (no `:` for Android/Windows). */
export function backupFileName(exportedAt: number, prefix: string = BACKUP_FORMAT): string {
  const stamp = new Date(exportedAt)
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
    .replace(/:/g, '-');
  return `${prefix}-${stamp}.json`;
}

function performanceToRaw({ value, reps }: SetPerformance): SetPerformance {
  return reps === undefined ? { value } : { value, reps };
}

/** The backup document for `data` as pretty-printed JSON text. */
export function serializeBackup(data: UserData, exportedAt: number): string {
  const document = {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt,
    profile: data.profile
      ? {
          createdAt: data.profile.createdAt,
          ...(data.profile.heroName !== undefined ? { heroName: data.profile.heroName } : {}),
        }
      : null,
    goals: data.goals,
    equipmentProfiles: data.equipmentProfiles.map(({ id, name, tags }) => ({ id, name, tags })),
    sessions: data.sessions.map((session) => ({
      id: session.id,
      startedAt: session.startedAt,
      ...(session.endedAt !== undefined ? { endedAt: session.endedAt } : {}),
      ...(session.equipmentProfileId !== undefined
        ? { equipmentProfileId: session.equipmentProfileId }
        : {}),
      // `sessionId` is implied by the enclosing session.
      sets: session.sets.map((set) => ({
        setIndex: set.setIndex,
        nodeId: set.nodeId,
        metric: set.metric,
        prescribed: performanceToRaw(set.prescribed),
        actual: performanceToRaw(set.actual),
        isTrial: set.isTrial,
        timestamp: set.timestamp,
      })),
    })),
    userActions: data.userActions.map(({ id, kind, nodeId, at }) => ({ id, kind, nodeId, at })),
    overlay: overlayToRaw(data.overlay),
    settings: data.settings,
  };
  return `${JSON.stringify(document, null, 2)}\n`;
}

// ---------------------------------------------------------------------------------------------
// Reading. Every reader takes the raw value and its path and reports a problem through `fail`.
// ---------------------------------------------------------------------------------------------

type Fail = (path: string, message: string) => void;

function describe(value: unknown): string {
  if (value === undefined) return 'nothing';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'a list';
  if (typeof value === 'object') return 'an object';
  if (typeof value === 'string') return `'${value}'`;
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRecord(
  value: unknown,
  path: string,
  fail: Fail,
  allowed?: readonly string[],
): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    fail(path, `must be an object, got ${describe(value)}`);
    return undefined;
  }
  if (allowed) {
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) {
        fail(path, `unknown field '${key}' (allowed: ${allowed.join(', ')})`);
      }
    }
  }
  return value;
}

function readText(value: unknown, path: string, fail: Fail): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') return value;
  fail(path, `must be some text, got ${describe(value)}`);
  return undefined;
}

/** A whole number ≥ `min` (timestamps, indexes, reps). */
function readInteger(value: unknown, path: string, fail: Fail, min = 0): number | undefined {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value >= min) return value;
  fail(path, `must be a whole number of at least ${min}, got ${describe(value)}`);
  return undefined;
}

function readAmount(value: unknown, path: string, fail: Fail): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  fail(path, `must be a number of at least 0, got ${describe(value)}`);
  return undefined;
}

function readBoolean(value: unknown, path: string, fail: Fail): boolean | undefined {
  if (typeof value === 'boolean') return value;
  fail(path, `must be true or false, got ${describe(value)}`);
  return undefined;
}

function readOneOf<T extends string>(
  allowed: readonly T[],
  value: unknown,
  path: string,
  fail: Fail,
): T | undefined {
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value))
    return value as T;
  fail(path, `must be one of ${allowed.join(', ')}, got ${describe(value)}`);
  return undefined;
}

/** Reads every item; `undefined` if the list or any item is invalid (all items are still checked). */
function readList<T>(
  value: unknown,
  path: string,
  fail: Fail,
  readItem: (item: unknown, itemPath: string) => T | undefined,
): T[] | undefined {
  if (!Array.isArray(value)) {
    fail(path, `must be a list, got ${describe(value)}`);
    return undefined;
  }
  const items = value.map((item, index) => readItem(item, `${path}[${index}]`));
  return items.every((item) => item !== undefined) ? (items as T[]) : undefined;
}

/** Reports the second and later uses of the same key. */
function checkUnique<T>(
  items: readonly T[],
  path: string,
  key: (item: T) => string | number,
  label: string,
  fail: Fail,
): void {
  const seen = new Set<string | number>();
  items.forEach((item, index) => {
    const value = key(item);
    if (seen.has(value)) fail(`${path}[${index}]`, `${label} '${value}' is used more than once`);
    seen.add(value);
  });
}

function readProfile(value: unknown, fail: Fail): HeroProfile | null | undefined {
  if (value === null) return null;
  const path = 'profile';
  const record = readRecord(value, path, fail, ['heroName', 'createdAt']);
  if (!record) return undefined;
  const createdAt = readInteger(record.createdAt, `${path}.createdAt`, fail);
  const heroName =
    record.heroName === undefined ? undefined : readText(record.heroName, `${path}.heroName`, fail);
  if (createdAt === undefined || (record.heroName !== undefined && heroName === undefined)) {
    return undefined;
  }
  return { createdAt, ...(heroName !== undefined ? { heroName } : {}) };
}

function readEquipmentProfile(
  value: unknown,
  path: string,
  fail: Fail,
): EquipmentProfile | undefined {
  const record = readRecord(value, path, fail, ['id', 'name', 'tags']);
  if (!record) return undefined;
  const id = readText(record.id, `${path}.id`, fail);
  const name = readText(record.name, `${path}.name`, fail);
  const tags = readList(record.tags, `${path}.tags`, fail, (tag, tagPath) =>
    readOneOf(EQUIPMENT_TAGS, tag, tagPath, fail),
  );
  if (id === undefined || name === undefined || tags === undefined) return undefined;
  return { id, name, tags };
}

function readPerformance(value: unknown, path: string, fail: Fail): SetPerformance | undefined {
  const record = readRecord(value, path, fail, ['value', 'reps']);
  if (!record) return undefined;
  const amount = readAmount(record.value, `${path}.value`, fail);
  const reps =
    record.reps === undefined ? undefined : readInteger(record.reps, `${path}.reps`, fail);
  if (amount === undefined || (record.reps !== undefined && reps === undefined)) return undefined;
  return reps === undefined ? { value: amount } : { value: amount, reps };
}

const SET_KEYS = [
  'setIndex',
  'nodeId',
  'metric',
  'prescribed',
  'actual',
  'isTrial',
  'timestamp',
] as const;

function readSet(
  value: unknown,
  path: string,
  sessionId: string,
  fail: Fail,
): LoggedSet | undefined {
  const record = readRecord(value, path, fail, SET_KEYS);
  if (!record) return undefined;
  const set = {
    sessionId,
    setIndex: readInteger(record.setIndex, `${path}.setIndex`, fail),
    nodeId: readText(record.nodeId, `${path}.nodeId`, fail),
    metric: readOneOf(METRICS, record.metric, `${path}.metric`, fail),
    prescribed: readPerformance(record.prescribed, `${path}.prescribed`, fail),
    actual: readPerformance(record.actual, `${path}.actual`, fail),
    isTrial: readBoolean(record.isTrial, `${path}.isTrial`, fail),
    timestamp: readInteger(record.timestamp, `${path}.timestamp`, fail),
  };
  return Object.values(set).every((field) => field !== undefined) ? (set as LoggedSet) : undefined;
}

function readSession(value: unknown, path: string, fail: Fail): StoredSession | undefined {
  const record = readRecord(value, path, fail, [
    'id',
    'startedAt',
    'endedAt',
    'equipmentProfileId',
    'sets',
  ]);
  if (!record) return undefined;
  const id = readText(record.id, `${path}.id`, fail);
  const startedAt = readInteger(record.startedAt, `${path}.startedAt`, fail);
  const endedAt =
    record.endedAt === undefined ? undefined : readInteger(record.endedAt, `${path}.endedAt`, fail);
  const equipmentProfileId =
    record.equipmentProfileId === undefined
      ? undefined
      : readText(record.equipmentProfileId, `${path}.equipmentProfileId`, fail);
  const sets = readList(record.sets, `${path}.sets`, fail, (item, setPath) =>
    readSet(item, setPath, id ?? '', fail),
  );
  if (sets) checkUnique(sets, `${path}.sets`, (set) => set.setIndex, 'setIndex', fail);
  const invalidOptional =
    (record.endedAt !== undefined && endedAt === undefined) ||
    (record.equipmentProfileId !== undefined && equipmentProfileId === undefined);
  if (id === undefined || startedAt === undefined || sets === undefined || invalidOptional) {
    return undefined;
  }
  return {
    id,
    startedAt,
    sets,
    ...(endedAt !== undefined ? { endedAt } : {}),
    ...(equipmentProfileId !== undefined ? { equipmentProfileId } : {}),
  };
}

function readUserAction(value: unknown, path: string, fail: Fail): UserAction | undefined {
  const record = readRecord(value, path, fail, ['id', 'kind', 'nodeId', 'at']);
  if (!record) return undefined;
  const action = {
    id: readText(record.id, `${path}.id`, fail),
    kind: readOneOf(USER_ACTION_KINDS, record.kind, `${path}.kind`, fail),
    nodeId: readText(record.nodeId, `${path}.nodeId`, fail),
    at: readInteger(record.at, `${path}.at`, fail),
  };
  return Object.values(action).every((field) => field !== undefined)
    ? (action as UserAction)
    : undefined;
}

/** Overlay issues keep their node id; the message says they come from the backup's overlay. */
function overlayIssues(issues: readonly ValidationIssue[]): ValidationIssue[] {
  return issues.map((issue) => ({
    ...issue,
    file: BACKUP_FILE,
    message: `overlay: ${issue.message}`,
  }));
}

/**
 * Reads and validates backup text against the built-in tree `baseNodes` (`ALL_NODES`). Writes
 * nothing; `data` is only set when there is no issue at all, so a caller can never import part of a
 * file.
 */
export function parseBackup(text: string, baseNodes: readonly ExerciseNode[]): BackupParse {
  const issues: ValidationIssue[] = [];
  const fail: Fail = (path, message) =>
    issues.push({ file: BACKUP_FILE, message: path === '' ? message : `${path}: ${message}` });
  const rejected = (message: string): BackupParse => ({
    data: undefined,
    issues: [{ file: BACKUP_FILE, message }],
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return rejected(`The file is not valid JSON (${(error as Error).message}).`);
  }
  if (!isRecord(parsed)) return rejected('The file is not a SkillForge backup (no JSON object).');
  if (parsed.format === OVERLAY_FORMAT) {
    return rejected(
      'The file is a progression overlay, not a backup. Import it in the node editor instead.',
    );
  }
  if (parsed.format !== BACKUP_FORMAT) {
    return rejected(`The file is not a SkillForge backup ('format' is not '${BACKUP_FORMAT}').`);
  }
  const version = parsed.schemaVersion;
  if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1) {
    return rejected(
      `'schemaVersion' must be a whole number of at least 1, got ${describe(version)}.`,
    );
  }
  if (version > BACKUP_SCHEMA_VERSION) {
    return rejected(
      `The backup was made by a newer SkillForge (backup version ${version}; this app reads up to ` +
        `${BACKUP_SCHEMA_VERSION}). Update the app, then import it again. Nothing was changed.`,
    );
  }

  readRecord(parsed, '', fail, TOP_LEVEL_KEYS);
  const exportedAt = readInteger(parsed.exportedAt, 'exportedAt', fail);
  const profile = readProfile(parsed.profile, fail);
  const goals = readList(parsed.goals, 'goals', fail, (goal, path) => readText(goal, path, fail));
  if (goals) checkUnique(goals, 'goals', (goal) => goal, 'goal', fail);
  const equipmentProfiles = readList(
    parsed.equipmentProfiles,
    'equipmentProfiles',
    fail,
    (item, path) => readEquipmentProfile(item, path, fail),
  );
  if (equipmentProfiles) {
    checkUnique(equipmentProfiles, 'equipmentProfiles', (item) => item.id, 'id', fail);
  }
  const sessions = readList(parsed.sessions, 'sessions', fail, (item, path) =>
    readSession(item, path, fail),
  );
  if (sessions) checkUnique(sessions, 'sessions', (item) => item.id, 'id', fail);
  const userActions = readList(parsed.userActions, 'userActions', fail, (item, path) =>
    readUserAction(item, path, fail),
  );
  if (userActions) checkUnique(userActions, 'userActions', (item) => item.id, 'id', fail);
  const settings = readRecord(parsed.settings, 'settings', fail);

  const overlayRead: OverlayImport = overlayFromRaw(parsed.overlay);
  issues.push(...overlayIssues(overlayRead.issues));
  let treeIds: ReadonlySet<string> | undefined;
  if (overlayRead.overlay) {
    const applied = applyOverlay(baseNodes, overlayRead.overlay);
    issues.push(...overlayIssues(applied.issues));
    if (applied.issues.length === 0) treeIds = new Set(applied.nodes.map((node) => node.id));
  }
  if (goals && treeIds) {
    goals.forEach((goal, index) => {
      if (!treeIds.has(goal)) fail(`goals[${index}]`, `'${goal}' is not a node in the tree`);
    });
  }

  const exported = exportedAt !== undefined ? { exportedAt } : {};
  if (
    issues.length > 0 ||
    profile === undefined ||
    !goals ||
    !equipmentProfiles ||
    !sessions ||
    !userActions ||
    !settings ||
    !overlayRead.overlay
  ) {
    return { data: undefined, issues, ...exported };
  }
  return {
    data: {
      ...(profile !== null ? { profile } : {}),
      goals,
      equipmentProfiles,
      sessions,
      userActions,
      overlay: overlayRead.overlay,
      settings: { ...settings },
    },
    issues,
    ...exported,
  };
}
