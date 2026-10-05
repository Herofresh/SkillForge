/**
 * Shared types for SkillForge. This is the single source of shared types (AGENT.md §2).
 *
 * Enumerations are declared as `readonly` value lists first and the union types are derived from
 * them, so the content parser and validator can check values against the same list the type uses.
 */

/** The 14 progression families. Each one has a content file `content/progressions/<branch>.yaml`. */
export const BRANCHES = [
  'h_push',
  'v_push',
  'v_pull',
  'h_pull',
  'front_lever',
  'back_lever',
  'planche',
  'handstand',
  'core',
  'legs',
  'dynamic',
  'flexibility',
  'acrobatics',
  'mobility',
] as const;
export type Branch = (typeof BRANCHES)[number];

/** Branches whose nodes are all straight-arm work and get the ADR-010 tendon safeguards. */
export const STRAIGHT_ARM_BRANCHES: readonly Branch[] = ['front_lever', 'back_lever', 'planche'];

/**
 * What a node measures.
 * - `reps`: repetitions per set.
 * - `hold_s`: seconds held per set.
 * - `eccentric_s`: seconds of one slow lowering (the set has `trial.reps` lowerings).
 * - `load_xbw`: total load as a multiple of bodyweight (the set has `trial.reps` reps).
 */
export const METRICS = ['reps', 'hold_s', 'eccentric_s', 'load_xbw'] as const;
export type Metric = (typeof METRICS)[number];

/** Difficulty bands derived from `ogLevel` (see `tierForOgLevel` in `src/domain/tier.ts`). */
export const TIERS = ['beginner', 'intermediate', 'advanced', 'elite'] as const;
export type Tier = (typeof TIERS)[number];

/**
 * Character attributes ("base stats"). Every trained node feeds the attributes it trains: derived from
 * its `patterns` via `PATTERN_ATTRIBUTES` in `character.ts`, or set per node with `trains` (ADR-023).
 */
export const ATTRIBUTES = ['push', 'pull', 'core', 'legs', 'balance', 'mobility'] as const;
export type Attribute = (typeof ATTRIBUTES)[number];

/**
 * Movement patterns: they decide which attributes a node trains, and are used later for the 48 h
 * rule and push/pull pairing in the generator.
 */
export const PATTERNS = [
  'horizontal_push',
  'vertical_push',
  'vertical_pull',
  'horizontal_pull',
  'straight_arm_push',
  'straight_arm_pull',
  'squat',
  'hinge',
  'core',
  'balance',
  'mobility',
  'explosive',
] as const;
export type Pattern = (typeof PATTERNS)[number];

/** Equipment a node can need. Profiles (Home, Park) are sets of these tags (ADR-005). */
export const EQUIPMENT_TAGS = [
  'floor',
  'wall',
  'bar',
  'dip_bars',
  'parallettes',
  'bands',
  'rings',
  'pole',
  'box',
] as const;
export type EquipmentTag = (typeof EQUIPMENT_TAGS)[number];

/** `hard` prerequisites lock a node; `recommended` ones only show a warning. */
export const PREREQUISITE_KINDS = ['hard', 'recommended'] as const;
export type PrerequisiteKind = (typeof PREREQUISITE_KINDS)[number];

/** Where a node comes from: the built-in matrix or the user's own overlay. */
export const NODE_SOURCES = ['core', 'user'] as const;
export type NodeSource = (typeof NODE_SOURCES)[number];

/** Review state of a node's content. `coach_reviewed` means a coach has signed it off. */
export const REVIEW_STATUSES = ['draft', 'coach_reviewed'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** Inclusive training range in the node's metric, e.g. 5–8 reps or 10–30 s. */
export interface WorkingRange {
  min: number;
  max: number;
}

/**
 * The advancement standard. Passing it lifts the level-5 cap (ADR-004).
 * `target` is in the node's metric. `reps` is only used by `eccentric_s` and `load_xbw` nodes
 * (lowerings or reps per set).
 */
export interface Trial {
  sets: number;
  target: number;
  reps?: number;
}

export interface Prerequisite {
  nodeId: string;
  /** Node level (1–10) the prerequisite node must reach. */
  minLevel: number;
  kind: PrerequisiteKind;
  note?: string;
}

export interface Review {
  status: ReviewStatus;
  notes?: string;
}

/**
 * A problem found in progression content (a YAML file, the dataset, or a user overlay).
 * Every issue is an error: content with issues is never used.
 */
export interface ValidationIssue {
  /** Where the content came from, e.g. `content/progressions/v_pull.yaml` or `overlay`. */
  file?: string;
  nodeId?: string;
  /** Plain-language description, e.g. "prerequisite 'dead_hangg' does not exist". */
  message: string;
}

/** One exercise in the skill tree. */
export interface ExerciseNode {
  /** Stable snake_case id. Never rename (saved progress references it). User nodes start `user_`. */
  id: string;
  name: string;
  /**
   * What the exercise is and what it looks like, in 1–3 plain sentences (PLAN 6.2, ADR-049); not
   * the cues. Required in `content/progressions/`. A user node saved before 6.2 may have `''`
   * (old overlays and backups keep loading); the editor asks for one on its next save.
   */
  description: string;
  branch: Branch;
  /** Position inside the branch column. Unique per branch; only used for ordering. */
  chainOrder: number;
  /** Overcoming Gravity 2 level, 0–17. 0 = foundation exercise below OG2 level 1 (ADR-016). */
  ogLevel: number;
  metric: Metric;
  workingRange: WorkingRange;
  trial: Trial;
  prerequisites: Prerequisite[];
  /** Straight-arm work gets the ADR-010 tendon safeguards. */
  straightArm: boolean;
  /** Balance/lever skill (true) vs. strength exercise (false). */
  isSkill: boolean;
  patterns: Pattern[];
  /**
   * Attributes the node trains, replacing the ones derived from `patterns` (ADR-023). Only set it
   * when the derivation is wrong for this node, e.g. an L-sit also trains `push` (straight-arm support).
   */
  trains?: Attribute[];
  /** OR of AND-sets: the node can be done with any one inner list of tags. */
  equipment: EquipmentTag[][];
  /** Ids of nodes that train the same thing with other equipment (generator substitution). */
  alternatives: string[];
  /** Id of the easier node to fall back to. */
  regressionId?: string;
  /** Elite teaser shown as a locked silhouette. */
  legendary?: boolean;
  cues: string[];
  sourceUrls: string[];
  /** Free-text note on what still needs checking (the `TODO(verify)` flag). */
  verify?: string;
  source: NodeSource;
  review: Review;
}

/** Nodes by id: the lookup the engine functions take next to the node list. */
export type NodeLookup = ReadonlyMap<string, ExerciseNode>;

/** A partial change to a built-in node, as stored in a user overlay. `id` and `source` never change. */
export type NodeEdit = Partial<Omit<ExerciseNode, 'id' | 'source'>>;

/**
 * The user's own changes on top of the built-in matrix (ADR-016). The built-in data is never
 * modified; `applyOverlay` in `src/domain/overlay.ts` merges the two and validates the result.
 */
export interface ProgressionOverlay {
  /** New nodes. Ids start with `user_` and `source` is `'user'`. */
  added: ExerciseNode[];
  /** Per built-in node id: the fields the user changed. */
  edited: Record<string, NodeEdit>;
  /** Built-in node ids the user doesn't want to see. Their dependents inherit their prerequisites. */
  hidden: string[];
}

// ---------------------------------------------------------------------------------------------
// Training history and derived progress (Phase 2). History is the source of truth (ADR-008);
// everything under "derived" is rebuilt from it by `recompute` in `src/domain/recompute.ts`.
// ---------------------------------------------------------------------------------------------

/**
 * What one set asked for or achieved, in the set's metric.
 * - `value`: reps (`reps`), seconds held (`hold_s`), seconds per lowering (`eccentric_s`) or load as a
 *   multiple of bodyweight (`load_xbw`).
 * - `reps`: lowerings (`eccentric_s`) or reps (`load_xbw`) in the set. Ignored for `reps` and
 *   `hold_s`; treated as 1 when missing.
 *
 * A skipped set is logged with `value: 0`.
 */
export interface SetPerformance {
  value: number;
  reps?: number;
}

/** One logged set: the row of `session_sets`, the source of truth for all progress (ADR-008). */
export interface LoggedSet {
  sessionId: string;
  nodeId: string;
  /** Position of the set within the session (0-based, across all exercises). */
  setIndex: number;
  metric: Metric;
  prescribed: SetPerformance;
  actual: SetPerformance;
  /** The set is part of a Trial attempt for `nodeId`. */
  isTrial: boolean;
  /** When the set was logged, in ms since the Unix epoch. */
  timestamp: number;
  /**
   * How long the set took in whole seconds, when the exercise timer measured it (PLAN 5.4,
   * ADR-040): the seconds held for a hold, the stopwatch time otherwise. Unset for untimed sets.
   */
  durationSec?: number;
}

export interface LoggedSession {
  id: string;
  /** In ms since the Unix epoch. Sessions are replayed in `startedAt` order. */
  startedAt: number;
  sets: LoggedSet[];
}

/**
 * A deliberate user decision outside a workout, stored in history next to the sessions so that
 * `recompute` stays deterministic (ADR-008, ADR-023).
 * - `self_unlock`: the user unlocks `nodeId` although its hard prerequisites are not met ("the app
 *   suggests, the user decides"). The node is no longer `locked`; it can be trained and tested out.
 */
export const USER_ACTION_KINDS = ['self_unlock'] as const;
export type UserActionKind = (typeof USER_ACTION_KINDS)[number];

export interface UserAction {
  id: string;
  kind: UserActionKind;
  nodeId: string;
  /** When the user took the action, in ms since the Unix epoch. */
  at: number;
}

/** How a logged exercise (all sets of one node in one session) went against its prescription. */
export const OUTCOMES = ['success', 'partial', 'failed'] as const;
export type Outcome = (typeof OUTCOMES)[number];

/** Derived node states, see `docs/CONTEXT.md` → Node states. */
export const NODE_STATES = ['locked', 'available', 'training', 'proficient', 'mastered'] as const;
export type NodeState = (typeof NODE_STATES)[number];

/** Derived progress of one node: the `node_progress` cache row. */
export interface NodeProgress {
  nodeId: string;
  /** All node XP ever earned, including XP banked beyond the level-5 cap. */
  xp: number;
  /** Node level 1–10; capped at `PROFICIENT_LEVEL` until the Trial is passed. */
  level: number;
  trialPassed: boolean;
  trialPassedAt?: number;
  /** Timestamp of the first logged set (starts the ADR-010 straight-arm clock). */
  firstTrainedAt?: number;
  lastTrainedAt?: number;
  /** When the user unlocked the node themselves (a `self_unlock` action), if they did. */
  selfUnlockedAt?: number;
}

/** A level and the progress towards the next one (character and node XP bars). */
export interface LevelProgress {
  level: number;
  /** XP earned inside the current level. */
  xpIntoLevel: number;
  /** XP the current level needs in total (0 at the max level). */
  xpForLevel: number;
  /** 0–1 towards the next level (1 at the max level). */
  fraction: number;
}

export const RANK_TITLES = ['Novice', 'Apprentice', 'Adept', 'Master', 'Legend'] as const;
export type RankTitle = (typeof RANK_TITLES)[number];

/**
 * What a hero class tier needs (PLAN 6.9, ADR-057). Flat thresholds over values that only grow with
 * training, so a rule once met stays met (and an unlock is kept anyway). Classes are cosmetic: no
 * rule feeds back into XP, the generator or the safeguards.
 * - `start`: every hero has it from the first day.
 * - `stats`: at least these attribute points (every listed attribute).
 * - `sessions`: at least `count` logged sessions.
 * - `rank`: at least this rank.
 */
export type ClassRule =
  | { kind: 'start' }
  | { kind: 'stats'; points: Readonly<Partial<Record<Attribute, number>>> }
  | { kind: 'sessions'; count: number }
  | { kind: 'rank'; rank: RankTitle };

/** One escalation step of a class: its title and what it needs. */
export interface ClassTierDefinition {
  /** The title the hero wears at this tier, e.g. "Veteran". */
  name: string;
  rule: ClassRule;
}

/** What the class rules need of a class (the full definitions live in `src/data/classes.ts`). */
export interface ClassDefinition {
  /** Stable snake_case id, never renamed (the hero's selection and unlocks reference it). */
  id: string;
  /** The class name, e.g. "Warrior" (the first tier's title). */
  name: string;
  /** Lowest first; each tier needs more of the same than the one before. */
  tiers: readonly ClassTierDefinition[];
  /** The optional weekly challenge the class offers while worn (PLAN 6.9b, ADR-058). */
  challenge?: ClassChallengeDefinition;
}

/**
 * What a weekly class challenge counts (PLAN 6.9b, ADR-058). Counted per logged session, from its
 * done sets (value above 0) on known nodes; straight-arm nodes never count, so a challenge never
 * asks for more tendon load than the safeguards allow.
 * - `sessions`: sessions with training.
 * - `complete_sessions`: sessions without a skipped set.
 * - `sessions_training`: sessions that train every listed attribute.
 * - `exercises_training`: exercises (one node in one session) that train the attribute.
 * - `trial_attempts`: Trials attempted (one per node and session).
 */
export type ChallengeGoal =
  | { kind: 'sessions' }
  | { kind: 'complete_sessions' }
  | { kind: 'sessions_training'; attributes: readonly Attribute[] }
  | { kind: 'exercises_training'; attribute: Attribute }
  | { kind: 'trial_attempts' };

/** A class's weekly challenge: what counts and how many, per tier (entry 0 = tier I). */
export interface ClassChallengeDefinition {
  goal: ChallengeGoal;
  /** One target per tier; a tier beyond the list uses the last one. */
  targets: readonly number[];
}

/**
 * One week's challenge as the engine sees it: a fixed time window and what to reach in it. The
 * window is stored with the week's pin, so a later time-zone change can't move it.
 */
export interface WeeklyChallenge {
  /** Window start (local Monday 00:00 when pinned), ms since the Unix epoch, inclusive. */
  start: number;
  /** Window end (the next Monday 00:00), exclusive. */
  end: number;
  goal: ChallengeGoal;
  target: number;
}

/** When a class tier was first reached: the time and, when a session did it, that session. */
export interface ClassTierUnlock {
  at: number;
  sessionId?: string;
}

/** Reached tiers per class id: entry 0 is tier I, entry 1 tier II, … (a prefix, never with gaps). */
export type ClassUnlocks = Readonly<Record<string, readonly ClassTierUnlock[]>>;

/** Where a companion accessory sits on the hero (PLAN 6.10); one accessory per slot. */
export const COMPANION_SLOTS = ['head', 'cloak', 'body', 'hands', 'aura'] as const;
export type CompanionSlot = (typeof COMPANION_SLOTS)[number];

/**
 * What earns a companion accessory (PLAN 6.10, ADR-059). Like the class rules: flat thresholds
 * over values that only grow with training, and an earned accessory is kept forever anyway.
 * Cosmetic only.
 * - `sessions`: at least `count` logged sessions.
 * - `level`: at least this character level.
 * - `rank`: at least this rank.
 * - `class`: the class `classId` at tier `tier` or higher.
 * - `streak`: a streak of at least `count` sessions reached at some point (the best streak).
 * - `trials`: at least `count` Trials passed (tested out or earned).
 * - `eliteTrial`: a Trial passed on an elite-tier node (a legendary skill).
 */
export type CompanionRule =
  | { kind: 'sessions'; count: number }
  | { kind: 'level'; level: number }
  | { kind: 'rank'; rank: RankTitle }
  | { kind: 'class'; classId: string; tier: number }
  | { kind: 'streak'; count: number }
  | { kind: 'trials'; count: number }
  | { kind: 'eliteTrial' };

/** What the unlock rules need of an accessory (the full definitions are in `src/data/companion.ts`). */
export interface AccessoryDefinition {
  /** Stable snake_case id, never renamed (the stored loadout and unlocks reference it). */
  id: string;
  name: string;
  slot: CompanionSlot;
  rule: CompanionRule;
}

/**
 * Advisory warnings (ADR-023). The engine computes them and the UI shows them with an acknowledge
 * step; they never block logging, Trials or test-outs.
 * - `straight_arm_min_weeks`: a straight-arm Trial before `MIN_WEEKS_AT_LEVEL` weeks of training.
 * - `straight_arm_budget`: a session over the straight-arm hold budget.
 * - `straight_arm_rest`: straight-arm work sooner than `STRAIGHT_ARM_REST_HOURS` after the last.
 * - `prerequisites_unmet`: a node was trained, tested or self-unlocked with hard prerequisites unmet.
 */
export const SAFEGUARD_WARNING_CODES = [
  'straight_arm_min_weeks',
  'straight_arm_budget',
  'straight_arm_rest',
  'prerequisites_unmet',
] as const;
export type SafeguardWarningCode = (typeof SAFEGUARD_WARNING_CODES)[number];

/** `warning`: a tendon safeguard is exceeded. `info`: guidance the user chose to skip. */
export const SAFEGUARD_SEVERITIES = ['info', 'warning'] as const;
export type SafeguardSeverity = (typeof SAFEGUARD_SEVERITIES)[number];

export interface SafeguardWarning {
  code: SafeguardWarningCode;
  /** The node the warning is about; absent for session-wide warnings (budget, rest). */
  nodeId?: string;
  /** Plain-language explanation for the UI. */
  message: string;
  severity: SafeguardSeverity;
}

// ---------------------------------------------------------------------------------------------
// Workout generator (Phase 2.5, ADR-005, ADR-006, ADR-024). Built by `generateWorkout` in
// `src/domain/generator.ts`; the plan is a suggestion the user can change (ADR-023).
// ---------------------------------------------------------------------------------------------

/** What the generator needs to suggest one session ("Train now"). */
export interface WorkoutRequest {
  /** The user's merged tree (`applyOverlay(ALL_NODES, overlay).nodes`), like the engine takes. */
  nodes: readonly ExerciseNode[];
  /** Goal node ids, most important first (the order is only a tie-break). */
  goals: readonly string[];
  /** Node progress by id (`EngineState.progress` from `recompute`). */
  progress: Readonly<Record<string, NodeProgress>>;
  /** Tags of the equipment profile chosen for this session (ADR-005). */
  equipment: readonly EquipmentTag[];
  /** Time for the session in minutes (`SESSION_MINUTES`: 15 to 90). */
  availableMinutes: number;
  /**
   * Recent logged sessions (at least the last two weeks): pattern recency, the 48 h rules and the
   * last performance per node for the prescription.
   */
  recentSessions: readonly LoggedSession[];
  /** Session start in ms since the Unix epoch (the generator never reads the clock). */
  now: number;
  /** Seed for tie-breaks between equally good exercises; same inputs + seed = same plan. */
  seed: number;
}

/** Plan sections in session order (docs/research/progressions.md → Session order). */
export const WORKOUT_BLOCK_KINDS = ['warm_up', 'skill', 'strength', 'core', 'cool_down'] as const;
export type WorkoutBlockKind = (typeof WORKOUT_BLOCK_KINDS)[number];

/** One exercise of a plan: `sets` sets of `target`, each followed by `restSec` of rest. */
export interface PlannedExercise {
  nodeId: string;
  sets: number;
  /** Per set, in the node's metric (`SetPerformance`, like the logged `prescribed` value). */
  target: SetPerformance;
  metric: Metric;
  /** Rest after each set in seconds (for the rest timer): 90 s inside a pair, else ~180 s. */
  restSec: number;
  /** The sets are a Trial attempt (log them with `isTrial`). */
  isTrial?: boolean;
  /** Id of the node this exercise replaces because the equipment profile can't do it (ADR-005). */
  substitutedFrom?: string;
}

/** A section of the plan. A `strength` block with two exercises is a pair (alternate the sets). */
export interface WorkoutBlock {
  kind: WorkoutBlockKind;
  exercises: PlannedExercise[];
}

export interface WorkoutPlan {
  blocks: WorkoutBlock[];
  /** Estimated duration in whole minutes (never above the request's `availableMinutes`). */
  estimatedMinutes: number;
  /**
   * The user's rest pace the estimate uses (`restPace` in `sessionTime.ts`, ADR-063): each set's
   * rest counts as `restSec × restPace`; 1 = the prescribed rest.
   */
  restPace: number;
  /** Advisory warnings that apply to the plan (ADR-023), e.g. a self-unlocked node's prerequisites. */
  warnings: SafeguardWarning[];
  /** Plain-language explanations: substitutions, skipped patterns, deferred Trials, balance. */
  notes: string[];
}

// ---------------------------------------------------------------------------------------------
// Stored user data (Phase 3). Persisted in SQLite by `src/db/`; the domain only sees these shapes.
// ---------------------------------------------------------------------------------------------

/** A named set of equipment tags, chosen at session start (ADR-005), e.g. Home or Park. */
export interface EquipmentProfile {
  /** Stable id. The seeded defaults use `home` and `park`; user profiles get generated ids. */
  id: string;
  name: string;
  tags: EquipmentTag[];
}

/** The user's hero. `heroName` is unset until onboarding (4.1). */
export interface HeroProfile {
  heroName?: string;
  /** When the profile was first created (first app start), in ms since the Unix epoch. */
  createdAt: number;
}

/** What a stored session keeps beyond the domain `LoggedSession` (the `sessions` row). */
export interface SessionDetails {
  endedAt?: number;
  /** The profile chosen at session start; kept when that profile is deleted later. */
  equipmentProfileId?: string;
}

/** A logged session together with its stored details, as read back from the database. */
export type StoredSession = LoggedSession & SessionDetails;

/**
 * Everything the user owns (PLAN 3.3, ADR-028): what a backup contains and an import replaces.
 * Derived data (`node_progress`, character stats) is not part of it; it is recomputed (ADR-008).
 */
export interface UserData {
  /** Missing only before the first app start has seeded it. */
  profile?: HeroProfile;
  /** Goal node ids, most important first. */
  goals: string[];
  /** In display order. */
  equipmentProfiles: EquipmentProfile[];
  /** Oldest first, with their sets. */
  sessions: StoredSession[];
  /** Oldest first. */
  userActions: UserAction[];
  /** The user's progression overlay (ADR-016); empty when the user changed nothing. */
  overlay: ProgressionOverlay;
  /** User settings by key; values are JSON. */
  settings: Record<string, unknown>;
}
