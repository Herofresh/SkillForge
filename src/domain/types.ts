/**
 * Shared types for SkillForge. This is the single source of shared types (AGENT.md §2).
 *
 * Enumerations are declared as `readonly` value lists first and the union types are derived from
 * them, so the content parser and validator can check values against the same list the type uses.
 */

/** The 12 progression families. Each one has a content file `content/progressions/<branch>.yaml`. */
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

/** Movement patterns, used later for the 48 h rule and push/pull pairing in the generator. */
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
