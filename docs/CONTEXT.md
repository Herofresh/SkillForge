# SkillForge — Context & Lookup Reference

This is the quick reference for agents: architecture, glossary, formulas, commands.
Keep it current (see AGENT.md §4). Sections marked *(planned)* describe the approved design but haven't
been implemented yet.

## Stack versions
Expo SDK 57 (`expo` 57.0.x), React Native 0.86, React 19.2, expo-router 57, TypeScript 6.0 (`strict`),
Jest 29 with `jest-expo`, ESLint 9 (flat config) with `eslint-config-expo`, and Prettier 3.
Persistence: `expo-sqlite` 57, `drizzle-orm` 0.45 (expo-sqlite driver), `drizzle-kit` 0.31,
`zustand` 5 (ADR-026). Backups: `expo-file-system`, `expo-sharing`, `expo-document-picker` 57 (ADR-028).
UI (ADR-030): `react-native-svg` 15, `@expo-google-fonts/pixelify-sans`, `silkscreen`,
`alegreya-sans`, `react-native-reanimated` 4; component tests with `@testing-library/react-native`
14 + `test-renderer`.

## Architecture map

What exists today: the root and tabs layouts, four placeholder tab screens,
`src/components/theme.ts`, `src/components/PlaceholderScreen.tsx`, `src/lib/clamp.ts`, and the
Phase 1 progression pipeline (`content/progressions/`, `scripts/`, `src/domain/types.ts`,
`tier.ts`, `overlay.ts`, `src/data/*`) and the Phase 2 game engine (`xp.ts`, `progression.ts`,
`safeguards.ts`, `character.ts`, `recompute.ts`, `generator.ts`, `src/lib/curve.ts`, `median.ts`,
`time.ts`, `hash.ts`), and the Phase 3 persistence (`src/db/`, `src/store/`, `DataGate`, the stored
overlay and backups), and the Phase 4.0 design system (`docs/DESIGN.md`, `src/components/ui/`,
`app/styleguide.tsx`). Files marked *(planned)* don't exist yet. Empty folders hold a `.gitkeep`.

```
app/                    expo-router screens (UI only, no game logic)
  _layout.tsx           root Stack + dark navigation theme, loads the fonts, wrapped in DataGate
  styleguide.tsx        DEV ONLY: catalogue of tokens, components and icons (Settings → Style Guide)
  index.tsx             redirects "/" to /tree
  (tabs)/_layout.tsx    bottom tabs: Tree · Train · Character · Settings (pixel icons, ink/gold rules)
  (tabs)/tree.tsx       skill tree: column view ⇄ graph view
  (tabs)/train.tsx      Train now → plan preview → live session → summary
  (tabs)/character.tsx  level, rank, attributes, history
  (tabs)/settings.tsx   equipment profiles, export/import (today: placeholder + the stored
                        profile names as a DB proof)
  onboarding/           first-run flow
content/progressions/   SOURCE OF TRUTH for skill content (ADR-016)
  <branch>.yaml         one file per branch, one block per node (human-editable)
  README.md             field guide for coaches and contributors
scripts/
  progressions.ts       CLI behind npm run progressions:check|build|review (runs via tsx)
  progressionSources.ts Node-only file access shared by the CLI and the dataset test
src/
  domain/               PURE TS game rules. No React/Expo/DB imports (ADR-009)
    types.ts            single source of shared types (nodes, issues, overlay, logged sets, progress)
    tier.ts             tierForOgLevel (tier is derived, never stored)
    overlay.ts          user overlay: applyOverlay, exportOverlay/importOverlay (text),
                        overlayToRaw/overlayFromRaw (data: DB row, backups), isEmptyOverlay
    backup.ts           backup file format (ADR-028): serializeBackup, parseBackup (validates
                        everything before an import), backupFileName, BACKUP_SCHEMA_VERSION
    xp.ts               units, difficulty/outcome multipliers, exercise and session XP, streak
    progression.ts      node XP curve, level-5 cap, Trials, test-out, node states, unlocks
    safeguards.ts       ADR-010 tendon rules (advisory, ADR-023): straight-arm Trial clock, 60 s
                        budget, 48 h rest, and the SafeguardWarning producers
    character.ts        character level, attributes (PATTERN_ATTRIBUTES, trains), rank, balance warning
    generator.ts        on-demand workout generator: frontier, scoring, equipment substitution,
                        slots, double progression (ADR-024)
    recompute.ts        applySession / applyUserAction (reducer steps) + recompute (fold over
                        sessions and user actions), ADR-008/021/023
    equipment.ts        HOME_EQUIPMENT, PARK_EQUIPMENT, DEFAULT_EQUIPMENT_PROFILES (seeded)
  data/
    progressionFormat.ts  THE YAML <-> ExerciseNode parser/normalizer (build, tests, overlay)
    validate.ts         graph/content rules: validateNodes, formatIssue
    progressionBuild.ts buildMatrix, renderGeneratedModule, renderReviewSheet (pure)
    testFixtures.ts     synthetic nodes for unit tests
    skills/
      index.ts          ALL_NODES, NODE_BY_ID (what the app imports)
      progressions.generated.ts  GENERATED from the YAML; never edit
      dataset.test.ts   real dataset is valid and the generated files are fresh
      crossBranchGates.test.ts  content checks: key gates, straight-arm flags, Home paths
      branches.ts       BRANCH_NAMES (display names)
  db/                   persistence (ADR-026): stores and loads, maps rows <-> domain types
    schema.ts           Drizzle tables (see Data model)
    migrations/         GENERATED by `npm run db:generate` (SQL + journal + migrations.js); never edit
    database.ts         AppDb type, createDatabase(client) (foreign keys on)
    openAppDatabase.ts  opens skillforge.db with expo-sqlite (app only)
    migrate.ts          migrateDatabase: version guard, migrations, schema_version, first-run seed
    *Repository.ts      session, userAction, goal, equipmentProfile, nodeProgress (cache), profile,
                        settings, meta, overlay: small sync functions taking AppDb (or a transaction)
    userDataRepository.ts  readUserData / replaceUserData (all user tables, one transaction)
    rowGuards.ts        oneOf/optional checks for values read back
    testing/            TEST-ONLY: nodeSqliteClient (expo-sqlite API on node:sqlite), testDatabase (ADR-027)
  store/                Zustand store: UI actions -> domain -> repositories
    appStore.ts         createAppStore(deps): loadAll, logSession, selfUnlock, setGoals, equipment
                        profile CRUD, generateWorkout(profileId, minutes, seed?), saveOverlay,
                        exportBackup, importBackup, shareBackup, importBackupFromFile
    backupFiles.ts      device file access (expo-file-system, expo-sharing, expo-document-picker)
    bootstrap.ts        startApp(): open, migrate, create store, loadAll (once)
    useAppStore.ts      useAppStore(selector) hook for components below DataGate
  components/           reusable UI components (visual language: docs/DESIGN.md, ADR-030)
    theme.ts            THE design tokens: Palette, Colors, TierColors, AttributeColors, FontFamily,
                        TypeScale, PIXEL, Spacing, Border, Frames, ButtonStyles, Motion, nav theme
    theme.test.ts       contrast of every text/fill pair (>= 4.5:1, bars >= 3:1)
    fonts.ts            FONT_ASSETS for useFonts (keys = FontFamily names)
    PlaceholderScreen.tsx  temporary tab body (EmptyState + "COMING SOON") until the real tab UI
    DataGate.tsx        keeps the splash until fonts + startApp are done; error screen on failure
    ui/                 the UI kit; import from '@/components/ui'
      *.tsx             Screen, PixelFrame, PixelText, PixelButton, PixelIcon, SegmentedBar, XPBar,
                        StatBar, LevelBadge, TierChip, WarningBanner, PixelModal, EmptyState,
                        LevelUpBurst
      icons.ts          12x12 pixel icon grids + role colors (ICONS, ICON_NAMES, iconGrid)
      frameGeometry.ts  notched-corner rects for PixelFrame
      ui.test.tsx       component render tests (RNTL); icons.test.ts, frameGeometry.test.ts
  lib/                  generic helpers: clamp.ts, curve.ts (geometric level curves), median.ts,
                        time.ts (MS_PER_HOUR/DAY/WEEK), hash.ts (FNV-1a, seeded tie-breaks),
                        id.ts (createId for local records), contrast.ts (WCAG ratio),
                        pixelGrid.ts (icon grid → runs), segments.ts (litSegments for bars)
assets/                 app icon, adaptive icon, splash, favicon
docs/                   PLAN, DECISIONS, CONTEXT, DESIGN (visual language), research
  screenshots/          emulator screenshots per UI task (<phase>-<screen>.png)
  research/node-manifest.md  planned MVP nodes (ids, order, OG level, prerequisites)
  review/progression-matrix.md  GENERATED coach review sheet
.github/workflows/ci.yml  CI (Node 24): typecheck, lint, format:check, test, progressions:check
drizzle.config.ts       drizzle-kit config (sqlite, expo driver, schema -> src/db/migrations)
babel.config.js         babel-preset-expo + inline-import for .sql (also used by Jest)
metro.config.js         Expo default + `sql` source extension
jest.setup.ts           Jest: Reanimated/Worklets JS mocks for component tests
.maestro/               E2E flows: smoke.yaml (tabs + DB proof), styleguide.yaml (UI kit)
```

**Path alias:** `@/*` → `src/*` (and `@/assets/*` → `assets/*`). It's defined in `tsconfig.json`
(Metro reads it) and mirrored in `package.json` → `jest.moduleNameMapper`. Change both together.

**Content flow:** `content/progressions/*.yaml` → `npm run progressions:build` (parse with
`progressionFormat.ts`, check with `validate.ts`) → `progressions.generated.ts` + review sheet → app
imports `ALL_NODES` → at runtime `applyOverlay(ALL_NODES, userOverlay)` gives the user's tree.

**Dataset (89 nodes, all `review.status: draft`):**

| Branch | Nodes | Branch | Nodes | Branch | Nodes |
|---|---|---|---|---|---|
| `h_push` | 8 | `front_lever` | 5 | `core` | 10 |
| `v_push` | 9 | `back_lever` | 7 | `legs` | 8 |
| `v_pull` | 9 | `planche` | 6 | `dynamic` | 8 |
| `h_pull` | 6 | `handstand` | 8 | `flexibility` | 5 |

The 88 manifest nodes plus `straight_bar_dip` (Home dip, ADR-017). Content checks beyond the validator
(cross-branch gates, straight-arm flags, a Home path per pattern) are in
`src/data/skills/crossBranchGates.test.ts`. With the Home profile only `parallel_bar_dip` (dip bars),
`iron_cross` (rings) and the three human flags (pole) are out of reach.

**Data flow:** UI → store action (`src/store/appStore.ts`) → repository persists the history entry
(`sessions` + `session_sets`, or `user_actions`) → domain step (`applySession` /
`applyUserAction`, or `recompute` for an entry in the past) → `node_progress` cache rewritten →
store state set → UI re-renders. **Start-up:** `DataGate` → `startApp` → open → `migrateDatabase`
→ `loadAll` (read overlay → `applyOverlay(ALL_NODES, overlay)` = `state.nodes` → read history →
`recompute` → rewrite cache) → screens render. **Overlay edit:** `saveOverlay(overlay)` →
`applyOverlay` issues? return them, write nothing : store the row → `loadAll`.

**Backup flow (ADR-028):** export: `exportBackup` / `shareBackup` → `readUserData` →
`serializeBackup` → share sheet. Import: `importBackupFromFile` (document picker) → `importBackup`
→ `parseBackup` (all checks; issues → nothing written) → safety copy of the current data to
`documents/backups/` → `replaceUserData` (one transaction) → `loadAll`.

**Engine flow:** a finished `LoggedSession` goes through `applySession(state, session, tree)` →
new `EngineState` (progress per node, total XP, streak, last straight-arm session, last applied
history position) + a `SessionResult` (exercise outcomes and XP, bonuses, level-ups, Trials,
unlocks, advisory `warnings`) for the summary screen. A self-unlock is a `UserAction` that goes
through `applyUserAction(state, action, tree)` → new state + `UserActionResult` (unlocked ids,
warnings). `computeCharacter(tree, state.progress, state.totalXp)` gives the character sheet. After
a formula change, an import or an overlay edit, `recompute(tree, allSessions, allActions)` rebuilds
the state with the same steps (`canApplyIncrementally` says when that is needed). `tree` is
`applyOverlay(ALL_NODES, overlay).nodes`.

**Warnings flow (ADR-023):** nothing in the engine blocks the user. Before an attempt the UI asks
`nodeUseWarnings(node, status, progress, lookup, now)` (Trial / test-out) and
`sessionSafeguardWarnings(sets, lookup, state.lastStraightArmSessionAt, now)` (live session), shows
the `SafeguardWarning`s and lets the user acknowledge them; after logging, the same warnings come
back in `SessionResult.warnings`. The generator never suggests work that would trigger a
`warning`-severity safeguard (ADR-024).

## Glossary

| Term | Meaning |
|---|---|
| **Node** | One exercise in the skill tree (e.g. `tuck_front_lever`). Authored in `content/progressions/<branch>.yaml`. |
| **Overlay** | The user's own changes on top of the built-in matrix: `added` (`user_` nodes), `edited` (partial overrides), `hidden` ids. Merged and validated by `applyOverlay` (ADR-016). |
| **Stored overlay** | The one current overlay in `progression_overlay`; the store's tree is `applyOverlay(ALL_NODES, overlay).nodes`. An overlay with issues is never saved; a stored one that stops applying is kept and reported as `overlayIssues` (ADR-028). |
| **Backup** | A JSON file of all user data (`skillforge-backup`, `schemaVersion`). Import validates the whole file first and then replaces all data in one transaction; never a merge or a partial import (ADR-028). |
| **Safety copy** | The backup of the current data that `importBackup` writes to `documents/backups/skillforge-before-import-<UTC>.json` before it replaces anything; importing it undoes the import. |
| **Source** | `core` (built-in YAML) or `user` (from the overlay). |
| **Review status** | `draft` or `coach_reviewed`, per node, with free-text `review.notes`. |
| **Verify note** | A node's `verify:` text: something still uncertain (the `TODO(verify)` flag, ⚠ on the review sheet). |
| **Branch** | A progression family, e.g. `planche` or `v_pull`. Nodes in a branch form a chain ordered by `chainOrder`. |
| **Prerequisite** | An edge from another node that must reach `minLevel`. `hard` edges lock the node; `recommended` edges only show a warning. |
| **ogLevel** | Cross-branch difficulty from 0 to 17, taken from the Overcoming Gravity 2 charts (ADR-007). 0 = foundation exercise below OG2 level 1 (ADR-016). |
| **Tier** | Beginner 0–5 · Intermediate 6–8 · Advanced 9–12 · Elite 13+ (derived by `tierForOgLevel`). |
| **Metric** | What a node measures: `reps`, `hold_s`, `eccentric_s`, or `load_xbw` (load as a multiple of bodyweight). |
| **Unit** | Normalized volume: 1 rep = 2 s hold = 3 s eccentric = 1 unit. |
| **Working range** | The prescribed training range for a node, e.g. 5–8 reps or 10–30 s. |
| **Trial** | A node's advancement standard (e.g. 3×8, 3×30 s). Passing it lifts the level-5 cap. |
| **Proficient** | Node level 5 with the Trial passed. Unlocks successor nodes. |
| **Mastered** | Node level 10. |
| **Banked XP** | XP earned while capped at level 5 before passing the Trial. It's applied once the Trial is passed. |
| **Frontier** | The trainable nodes (available, training or self-unlocked) reached by walking a goal's unmet hard prerequisites; a goal without unmet ones is its own frontier. The generator weights them by how far they are from the goal (critical path first). |
| **Working sets** | At least `MIN_WORKING_SETS` (2) sets of one node in one session. Only they count for pattern recency, last performance and stagnation; the 1-set warm-up items don't. |
| **Workout plan** | The generator's output: blocks (`warm_up`, `skill`, `strength` pairs, `core`, `cool_down`) of `PlannedExercise`s (`sets`, `target`, `restSec`, `isTrial?`, `substitutedFrom?`), an estimate in minutes, advisory warnings and notes. A suggestion the user can edit. |
| **Equipment profile** | A named set of equipment tags, e.g. Home or Park, chosen at session start (ADR-005). |
| **Straight-arm budget** | About 60 s total of straight-arm holds per session is recommended (ADR-010). Going over it gives a warning, not a block (ADR-023). The sets of one straight-arm Trial don't count (Trial-day exception, ADR-025). |
| **Trial day** | A session whose straight-arm work is one due straight-arm Trial and nothing else; the generator suggests it when that Trial is due (ADR-025). |
| **Test-out** | Passing a Trial on any node without training it first, including straight-arm nodes and locked nodes (ADR-023). Sets the node to level 5 / proficient and unlocks successors. |
| **Self-unlock** | The user unlocks a locked node themselves (`UserAction` kind `self_unlock`, stored in history). The node is no longer `locked` and can be trained; its unmet prerequisites stay listed (ADR-023). |
| **Advisory safeguard** | A safety rule (ADR-010 tendon rules, prerequisites) that the engine computes and the UI shows as a `SafeguardWarning` with an acknowledge step, but that never blocks the user. The generator's suggestions always respect it (ADR-023). |
| **Safeguard warning** | `{ code, nodeId?, message, severity }`: `straight_arm_min_weeks`, `straight_arm_budget`, `straight_arm_rest` (`warning`), `prerequisites_unmet` (`info`). |
| **Attribute contribution** | The points a trained node adds to each attribute it trains: `difficultyMult(ogLevel) × node level`. Which attributes comes from its patterns (`PATTERN_ATTRIBUTES`) or its `trains` override (ADR-023). |
| **Outcome** | How an exercise went vs. its prescription: `success`, `partial` (≥ 50 % of prescribed units), `failed`. |
| **Streak** | Consecutive sessions at most 72 h apart. Adds a character-XP bonus. |
| **Engine state** | Derived state rebuilt from history (sessions and user actions): node progress, total XP, streak, last straight-arm session, last applied position (`src/domain/recompute.ts`). |
| **Legendary node** | An elite node shown as a locked silhouette, there for motivation. |

## Node states
`locked` → (all hard prerequisites met) → `available` → (first logged set) → `training` →
(level 5 and Trial passed) → `proficient` → (level 10) → `mastered`. A passed Trial (including a
test-out from any state, even `locked`) goes straight to `proficient`. A self-unlock takes a
`locked` node to `available` without meeting its prerequisites (ADR-023). A hard prerequisite with
`minLevel` ≥ 5 needs that node proficient; a node's `alternatives` also satisfy prerequisites on it
(ADR-019). A prerequisite node counts only once it was trained or its Trial passed.

## Formulas *(Phase 2, ADR-018, 019, 021, 023; tune the constants in the owning module only)*

- **Set units** (`xp.ts`): `reps` → reps · `hold_s` → s / 2 · `eccentric_s` → lowerings × s / 3 ·
  `load_xbw` → reps × load (1 rep at 1×BW = 1 unit). A missing rep count is 1.
- **difficultyMult(ogLevel)** = 1 + 0.25 × ogLevel.
- **Outcome** of an exercise (all sets of one node in a session): `success` if every set met its
  prescription; `partial` if achieved units (each set capped at its prescription) ≥ 50 % of
  prescribed units; else `failed`. `outcomeMult` = 1.0 / 0.6 / 0.3.
- **Exercise XP** = round(units done × difficultyMult × outcomeMult). This is also the node XP.
- **Session XP** = Σ exercise XP + completion bonus (10 % if no set skipped) + streak bonus
  (5 % per consecutive session after the first, max 25 %; sessions ≤ 72 h apart). Bonuses are
  character XP only.
- **Node level** (`progression.ts`): cumulative XP per level 0, 20, 47, 83, 133, 199, 289, 410, 573, 794
  (20 XP, ×1.35 per step), times the node's difficultyMult. Capped at level 5 until the Trial is
  passed; XP above the level-5 threshold is banked and counts once the Trial passes. A passed Trial
  lifts XP to at least the level-5 threshold (test-out).
- **Trial passed** = at least `trial.sets` Trial sets in one session, each ≥ `trial.target` (and ≥
  `trial.reps` lowerings/reps where used), on any node whose Trial isn't passed yet. Never blocked.
- **Safeguards** (`safeguards.ts`, advisory): a straight-arm Trial is recommended 6 weeks after the
  node's first logged set (never trained = not yet); ≤ 60 s straight-arm hold time per session
  (non-hold sets 2 s per unit; `straightArmSecondsUsed` is the one measure) not counting the
  Trial-day exception (`budgetExemptTrialSets`: the Trial sets of the first straight-arm node with
  any, at most its `trial.sets`; ADR-025); ≥ 48 h between straight-arm sessions (session start
  times, a Trial session included).
  Violations are `warning` `SafeguardWarning`s; a locked node trained or tested, or a self-unlock
  with unmet hard prerequisites, gives an `info` `prerequisites_unmet`.
- **Character level** (`character.ts`): 100 XP to level 2, ×1.1 per level, max 99.
- **Attributes** (points): attribute = round(sum over the trained nodes that train it of
  `difficultyMult(ogLevel) × node level`). A node counts once it has XP (trained or tested out);
  its level is capped at 5 until the Trial. What a node trains = its `trains` list if set, else the
  union of `PATTERN_ATTRIBUTES` over its patterns: horizontal_push, vertical_push → push ·
  horizontal_pull, vertical_pull → pull · straight_arm_push → push + core · straight_arm_pull →
  pull + core · squat, hinge → legs · core → core · balance → balance · mobility → mobility ·
  explosive → nothing. Example: tuck planche (OG 5) at level 5 adds 2.25 × 5 = 11.25 to push and core.
- **Attribute peaks:** highest ogLevel of a proficient node that trains the attribute (same mapping).
- **Rank** from the median over the 12 branches of each branch's highest proficient ogLevel:
  Novice < 2 ≤ Apprentice < 6 ≤ Adept < 9 ≤ Master < 13 ≤ Legend.
- **Balance warning:** |push peak − pull peak| > 2 OG levels.

## Generator *(Phase 2.5, ADR-024; constants in `src/domain/generator.ts` only)*

`generateWorkout({ nodes, goals, progress, equipment, availableMinutes, recentSessions, now, seed })`
→ `WorkoutPlan`. Pure and deterministic (same request and seed → same plan, independent of the
order of `recentSessions`). Pass the merged tree and `EngineState.progress`.

1. **Frontier** (`goalFrontier`): per goal, walk unmet hard prerequisites (from `resolveTree`,
   so alternatives satisfy them) to trainable nodes; a locked prerequisite with a trainable
   alternative walks to the alternative. Goal weight per frontier node =
   `GOAL_BASE_WEIGHT` 50 + `CRITICAL_PATH_WEIGHT` 30 × distance / the goal's longest distance,
   summed over goals.
2. **Candidates:** frontier + available/training nodes not outgrown (a dependent or harder
   variation is trained). Equipment (OR-of-AND, `isDoableWith`): otherwise
   `substituteFor` picks a doable alternative with the same main pattern (unlocked, then closest
   ogLevel, then id), else the node is dropped (note for goal nodes).
3. **Skips:** any non-exempt pattern with working sets < `PATTERN_REST_HOURS` 48 h ago
   (`balance`, `mobility` are exempt); all straight-arm nodes when not `isStraightArmRested`.
4. **Score** = goal weight + `RECENCY_POINTS_PER_DAY` 5 × days since the node's most recent
   pattern (max `RECENCY_MAX_DAYS` 7; never = 7) + `BALANCE_WEIGHT` 20 × push/pull
   attribute-point deficit share (for nodes training the weaker side) + `STAGNATION_BONUS` 10
   (best set not improved over the last `STAGNATION_SESSIONS` 3 sessions) + `OG_LEVEL_POINTS` 1 ×
   ogLevel. Ties: FNV-1a hash of `seed:nodeId`, then id.
5. **Slots:** fixed prep `WARM_UP_PREP_IDS` (`wrist_prep`, `shoulder_dislocate`, 1 set each);
   then greedily the open slot with the best unused candidate: 2 skill slots (`isSkill` or
   straight-arm; the 2nd for goal skills only), 3 `STRENGTH_PAIRS` (vertical pull + squat, push +
   hinge, horizontal pull + push; a missing side leaves a single), 1 core, 1 cool-down (mobility,
   goal nodes only). A slot is added at `WORKING_SETS` 3, else trimmed to `MIN_WORKING_SETS` 2,
   else skipped when it doesn't fit the minutes left. Then up to `WARM_UP_MAX_RAMP` 2 ramp sets
   (`regressionId` of the main exercises, never straight-arm).
6. **Safeguards:** straight-arm exercises are fitted to the `STRAIGHT_ARM_SESSION_BUDGET_S` 60 s
   left (fewer sets or none); a straight-arm Trial only after `isTrialOpenBySafeguards`.
   **Trial day** (ADR-025): if the best-ranked straight-arm candidate's prescription is its Trial,
   all other straight-arm candidates are dropped, so the session has that one Trial (exempt from
   the budget) and no other straight-arm work; a note says so. A Trial trimmed for time becomes
   working sets that count against the budget again.
   `warnings` carries the advisory warnings that still apply (a self-unlocked or substituted node's
   `prerequisites_unmet`); the suggestion never triggers a `warning`-severity safeguard.
7. **Prescription** (`prescribe`, double progression): no history → 3 × range min. After a
   fully successful session → weakest set + `PROGRESSION_STEP` (reps 1, hold 5 s, eccentric 1 s,
   load 0.05), else the weakest set; clamped to the working range. Every set at the range top and
   Trial not passed → the Trial (`trial.sets × trial.target`, `isTrial`).
8. **Rest and time:** `PAIR_REST_SEC` 90 inside a pair, `SINGLE_REST_SEC` 180 otherwise,
   `WARM_UP_REST_SEC` 30 (per exercise, for the rest timer). Estimate per exercise
   (`exerciseSeconds`) = `TRANSITION_SEC` 30 + sets × (work + rest), work = `SECONDS_PER_REP` 3 per
   rep, hold seconds, or lowerings × seconds. `estimatedMinutes` = ceil(total / 60) ≤ available.

Helpers for the UI and tests: `planExercises(plan)`, `plannedSets(exercises, at)` (the plan as
`LoggedSet`s, e.g. for `sessionSafeguardWarnings` while the user edits the plan).

## Data model *(Phase 3.1, 3.3–3.4, ADR-026, ADR-028)*
Schema in `src/db/schema.ts`; timestamps are integers in ms since the Unix epoch. Sources of truth
(ADR-008): `sessions` + `session_sets` and `user_actions`. Everything else is settings or cache.

- **Tables:**
  - `meta(key, value)`: `schema_version` (number of bundled migrations, written after each run;
    a higher stored version is refused) and `defaults_seeded_at` (first-run seed done)
  - `profile(id = 1, hero_name?, created_at)`: the hero (`HeroProfile`)
  - `goals(node_id, position)`: goal node ids, position 0 = most important
  - `equipment_profiles(id, name, tags JSON, position)` (`EquipmentProfile`); seeded once with
    `home` (Home) and `park` (Park)
  - `sessions(id, started_at, ended_at?, equipment_profile_id?)`
  - `session_sets(session_id → sessions cascade, set_index, node_id, metric, prescribed_value,
    prescribed_reps?, actual_value, actual_reps?, is_trial, timestamp)`, PK
    `(session_id, set_index)`: one row per `LoggedSet` (ADR-021)
  - `user_actions(id, kind, node_id, at)`: `UserAction`s (`self_unlock`, ADR-023)
  - `node_progress(node_id, xp, level, trial_passed, trial_passed_at?, first_trained_at?,
    last_trained_at?, self_unlocked_at?)`: CACHE of `NodeProgress`, rewritten after every
    recompute/apply; safe to delete (`loadAll` rebuilds it identically)
  - `settings(key, value JSON)`: user settings (none used yet)
  - `progression_overlay(id = 1, revision, saved_at, body JSON)`: the current overlay in the
    `overlayToRaw` shape (ADR-028); `revision` counts saves
- **Migrations:** `src/db/migrations/`, generated from the schema by `npm run db:generate`,
  additive only, applied by Drizzle (`__drizzle_migrations`) in one transaction on every start.
- **Backups** (ADR-028): all tables above except `meta` and `node_progress`, as one JSON file with
  `format: 'skillforge-backup'` and `schemaVersion` (`BACKUP_SCHEMA_VERSION` = 1, independent of the
  database schema version). Import replaces everything; a newer `schemaVersion` is refused.
- Not stored (derived): node states, character level/attributes, session XP and outcome, streak.

## Equipment tags
`floor`, `wall`, `bar` (pull-up bar), `dip_bars`, `parallettes`, `bands`, `rings`, `pole`, `box`
(chair/bench/box to elevate hands or feet). A node's `equipment` is a list of options (OR); each option
is a set of tags needed together (AND), written `floor + wall` in YAML.
- **Default profiles:** Home = floor, wall, bar, parallettes, bands. Park = Home + dip_bars.

## Commands

| Command | Purpose |
|---|---|
| `npm start` / `npx expo start` | Dev server. Scan the QR code with Expo Go on Android. |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`eslint .`, flat config in `eslint.config.js`) |
| `npm test` | Jest (`jest-expo` preset). Tests live next to the code as `*.test.ts` (components: `*.test.tsx` with RNTL). |
| `npm run format` / `npm run format:check` | Prettier write / check (config in `.prettierrc.json`) |
| `npm run progressions:check` | Validate `content/progressions/*.yaml` and report stale generated files. Writes nothing. |
| `npm run progressions:build` | Validate, then write `src/data/skills/progressions.generated.ts` and `docs/review/progression-matrix.md`. Run after every YAML edit. |
| `npm run progressions:review` | Validate, then write only the coach review sheet. |
| `npm run db:generate` | `drizzle-kit generate`: write a new migration in `src/db/migrations/` after editing `src/db/schema.ts` (add `-- --name <slug>` to name it). Commit the generated files. |
| `npm run lockfile:check` | `npm ci --dry-run` with the pinned npm on a clean copy of package.json + package-lock.json: fails if CI's `npm ci` would reject the lockfile (ADR-029). Also runs in CI. |
| `npm run lockfile:fix` | Re-resolve package-lock.json with the pinned npm (`install --package-lock-only`), then run the check. Run after every `npx expo install` / `npm install`. |
| `npm run e2e` | Maestro E2E flows in `.maestro/` against Expo Go on a running emulator (see "E2E tests") |
| `npx expo-doctor` | Checks dependency versions and config against the SDK |
| `npx expo install <pkg>` | Add a dependency at the SDK-compatible version (prefer it over `npm install`) |

## Environment notes
- **OS:** Windows 10 with PowerShell 5.1 (no `&&`; use `; if ($?) {}`) and Git Bash.
- **GitHub CLI:** `C:\Program Files\GitHub CLI\gh.exe`, logged in as `Herofresh`.
- **Tooling:** Node 24, npm 11 (local 11.6.2; the project pins 11.19.0 for the lockfile, ADR-029), Java 17, jq 1.8.
- **Android:**
  - The Android SDK and Android Studio are installed at `%LOCALAPPDATA%\Android\Sdk`, but
    `ANDROID_HOME` and PATH aren't set. Call `adb` and `emulator` by their full paths.
  - There's an AVD called `Pixel_6_Pro_API_34`.
  - Build APKs with EAS cloud (5.3).
- **Maestro** 2.10 is installed at `%USERPROFILE%\.maestro\maestro\bin`. It isn't on PATH yet.

## E2E tests (Maestro, ADR-022)
Flows live in `.maestro/*.yaml` and run against **Expo Go** (`appId: host.exp.exponent`), so no native
build is needed.

1. **Start the emulator.** Use software rendering; the GPU mode hangs on this machine (AMD + WHPX):
   `& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_6_Pro_API_34 -no-snapshot -gpu swiftshader_indirect`
   It takes about 90 s to boot. Wait until `adb shell getprop sys.boot_completed` prints `1`.
2. **Start Metro:** `npx expo start --android`. The first time, this installs Expo Go on the emulator.
3. **Forward the port:** `adb reverse tcp:8081 tcp:8081` (use the full `adb.exe` path under
   `platform-tools`, since it isn't on PATH)
4. **Run the flows:** `npm run e2e` (Maestro must be on PATH).

**Gotchas:**
- The first cold bundle takes about 2 minutes on the emulator. The smoke flow waits up to 3 minutes.
- If Android shows "System UI isn't responding" while it loads, tap *Wait*.
- If the first run after a cold boot times out on a white Expo Go loading screen, run
  `adb shell am force-stop host.exp.exponent` and run the flows again (the bundle is cached by then).
- The flows aren't in CI yet (see the backlog).
- Match on visible text or `testID` (`id:`). When the real UI replaces the placeholders, update or
  extend the flows in the same PR.
- Flows must not assume a fresh app: Expo Go keeps the last screen. They wait for `Tree|Style Guide`,
  go back from the Style Guide and tap Tree first. Don't put `stopApp` before `openLink` (Expo Go
  then stayed on the launcher). Give `scrollUntilVisible` a long `timeout` on long pages.
- Screenshots: `adb exec-out screencap -p > docs/screenshots/<phase>-<screen>.png`.

## Gotchas
- Skill node IDs are permanent, because saved progress references them.
- Some OG2 levels in the research are inferred (`~`). Check them before relying on exact numbers.
- Never put formulas in components. Import them from `src/domain/`.
- **Encoding:** the docs are UTF-8 with non-ASCII characters (—, →, ✓).
  - Don't edit them with Windows PowerShell 5.1 `Get-Content`/`Set-Content`. They read and write the ANSI
    codepage and corrupt the text into mojibake like `â€”`.
  - Use a proper file-editing tool, or Git Bash tools.
- **TypeScript 6 `types`:** TS 6 no longer auto-includes every `@types/*` package. `tsconfig.json` sets
  `"types": ["jest", "node"]` (`node` is for `scripts/` and the dataset test). Don't use Node APIs in
  `app/` or `src/` runtime code.
- **Generated files:** never edit `src/data/skills/progressions.generated.ts` or
  `docs/review/progression-matrix.md` by hand; edit the YAML and run `npm run progressions:build`.
  Both are Prettier-ignored, as is `content/` (hand-formatted YAML).
- **`yaml` in Jest:** `package.json` → `jest.moduleNameMapper` maps `yaml` to its CommonJS build,
  because jest-expo resolves the ESM browser entry otherwise.
- **Routes live in root `app/`,** not `src/app/` (the SDK 57 template default). Expo Router uses
  `src/app/` if it exists, so never create that folder (ADR-014).
- **Database:** never edit or delete a generated migration; change `src/db/schema.ts` and run
  `npm run db:generate`. Repositories are synchronous (Drizzle expo driver in sync mode), so
  `db.transaction(cb)` needs a synchronous callback (an `async` one would commit early).
  Tests use `openTestDatabase()` from `src/db/testing/testDatabase.ts` (ADR-027); Node prints an
  "SQLite is experimental" warning, which is expected. After editing a `.sql` file clear the caches
  (`npx jest --clearCache`, `npx expo start -c`), because they are inlined by Babel.
- **Lockfile (ADR-029):** npm 11.6.2 (this machine's npm) writes package-lock.json without the
  optional peers `@emnapi/core`/`@emnapi/runtime` (of `@napi-rs/wasm-runtime`), and the newer npm
  in CI then fails `npm ci` with "Missing: … from lock file". The npm version is pinned in
  `package.json` `devEngines.packageManager` (a mismatch prints `EBADDEVENGINES`, a warning only).
  After any install run `npm run lockfile:fix`; don't hand-patch the lockfile. The script lives in
  `scripts/lockfile.ts` and runs on plain Node (type stripping), so keep it free of dependencies.
- **Line endings:** `.gitattributes` forces LF. Git may warn "CRLF will be replaced by LF" once per file;
  that's expected.
