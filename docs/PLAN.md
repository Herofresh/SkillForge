# SkillForge — Living Plan & Progress

> Agents: read [AGENT.md](../AGENT.md) first. Update this file at the end of every task.
> Status legend: `[ ]` todo · `[~]` in progress (owner) · `[x]` done (PR link)

## Current state
- Repo: https://github.com/Herofresh/SkillForge (public).
- Phase 0 is done: docs (PR #1), the Expo SDK 57 scaffold with tooling (PR #2), and GitHub Actions
  CI (PR #3).
- The app has four placeholder tabs (Tree · Train · Character · Settings) on a dark theme. It runs
  in Expo Go on the `Pixel_6_Pro_API_34` emulator, and a Maestro smoke flow checks that every tab
  renders (task 0.6, ADR-022).
- Phase 1 is merged ([PR #4](https://github.com/Herofresh/SkillForge/pull/4)) except 1.6 (OG verification) and 1.10 (coach review): shared
  types, the YAML progression format with build/check/review scripts, the validator, the user
  overlay and the full dataset of **89 nodes** in 12 branches (all `review.status: draft`, 52 with a
  `verify:` note). The coach review sheet `docs/review/progression-matrix.md` is generated and committed.
- Phase 2 game engine (2.1–2.4, 2.6) is merged ([PR #6](https://github.com/Herofresh/SkillForge/pull/6)): `xp.ts`,
  `progression.ts`, `safeguards.ts`, `character.ts`, `recompute.ts` in `src/domain/`, pure and
  tested. Formulas and constants are in `docs/CONTEXT.md` → Formulas and ADR-018…021.
- User autonomy (2.7, ADR-023, [PR #8](https://github.com/Herofresh/SkillForge/pull/8)): "the app suggests, the user decides". Test-out works on
  every node (straight-arm on day 1, locked nodes too), a user can self-unlock a locked node
  (`UserAction` in history), the ADR-010 tendon safeguards are advisory `SafeguardWarning`s
  instead of blocks, and every trained node pays into all the attributes it trains
  (`PATTERN_ATTRIBUTES` or the new YAML field `trains`, weighted by ogLevel and node level).
- Workout generator (2.5, ADR-024, [PR #9](https://github.com/Herofresh/SkillForge/pull/9)): `generateWorkout` in `src/domain/generator.ts`
  builds a `WorkoutPlan` from goals, progress, equipment, minutes and recent sessions (frontier,
  scoring, substitution, slots, double progression; suggestions respect the safeguards).
  **Phase 2 is complete.** No persistence or real UI yet.
- Trial-day exception (2.8, ADR-025, [PR #10](https://github.com/Herofresh/SkillForge/pull/10)): one straight-arm Trial's sets are exempt from the
  ~60 s budget, and the generator now suggests a due straight-arm Trial (e.g. tuck planche 3 × 30 s)
  as the session's only straight-arm work.
- Persistence core (3.1–3.2, ADR-026/027, [PR #11](https://github.com/Herofresh/SkillForge/pull/11)): expo-sqlite + Drizzle schema with bundled,
  additive migrations run on app start (`DataGate` loading / error screen), first-run seed of the
  Home and Park profiles, repositories in `src/db/` and the Zustand store in `src/store/`
  (`loadAll` → `recompute`, `logSession`, `selfUnlock`, goals, equipment CRUD,
  `generateWorkout`). Settings shows the stored profile names as the only UI proof.
- Stored overlay and backups (3.3–3.4, ADR-028, [PR #12](https://github.com/Herofresh/SkillForge/pull/12)): the user's overlay lives in
  `progression_overlay` and the store's tree is `applyOverlay(ALL_NODES, overlay).nodes` (used by
  recompute, logging and the generator); `saveOverlay` refuses a broken overlay. All user data
  exports to one JSON backup (`schemaVersion` 1) and imports with full validation first, a safety
  copy of the current data, and a one-transaction replace. Store actions are ready; the buttons come
  in 4.6. **Phase 3 is complete.**

## Next up
1. Phase 4 UI on top of the store (`useAppStore`), starting with 4.1 onboarding and 4.2 the tree
   column view (see the handoff notes).
2. Phase 1.6: verify inferred OG2 levels; Phase 1.10: coach review of the sheet (needs the user to
   find a coach).

## Blockers
- None. The `gh` token now has the `workflow` scope, so agents can push `.github/workflows/*`.

## Handoff notes
- **Lockfile guard (task 0.7, ADR-029):** root cause of the recurring `@emnapi/*` drops was npm
  version skew (local 11.6.2 writes the lockfile without them; CI's 11.19.0 requires them), not the
  OS. `npm run lockfile:fix` re-resolves with the pinned npm through `npx`, so it works whatever npm
  is installed; local npm prints an `EBADDEVENGINES` warning until it is upgraded
  (`npm install -g npm@11.19.0`, optional). To bump the pin, change `devEngines` in package.json,
  run `lockfile:fix` and commit both files.
- **Stored overlay and backups (Phase 3.3–3.4, ADR-028):**
  - Overlay: `useAppStore((s) => s.saveOverlay)(overlay)` returns `ValidationIssue[]`; empty =
    saved and reloaded. The node editor (4.7) shows the issues inline (`formatIssue`) and keeps
    the draft. `state.overlay` is the stored one; `state.overlayIssues` is non-empty when a stored
    overlay stopped applying after an app update (then the built-in tree is used; show a notice).
  - Backups: `shareBackup()` (export + share sheet) and `importBackupFromFile()` →
    `{ status: 'imported', safetyCopy } | { status: 'rejected', issues } | { status: 'canceled' }`.
    Settings (4.6) must confirm "replace all data" before calling it, show `issues` on
    rejection, and can offer "undo" by importing `safetyCopy.text` (`importBackup(text)`).
    Safety copies are written to `documents/backups/` and never pruned yet.
  - The format is in `src/domain/backup.ts`. Any change to the layout needs
    `BACKUP_SCHEMA_VERSION` + 1, a reader for the old version and a new ADR. `meta` and
    `node_progress` are not exported (recomputed on `loadAll`).
  - `replaceUserData` deletes every user table; add new user tables to `USER_TABLES`,
    `readUserData`, `UserData` and the backup format together.
  - `backupFiles.ts` (native I/O) is not unit-tested; the flows are tested with a fake
    `BackupFiles`. Manual device check of share/pick is part of 4.6.
  - Lockfile: `npx expo install` dropped `@emnapi/core` / `@emnapi/runtime` again; restored from
    main's lockfile with jq.
- **Persistence core (Phase 3.1–3.2, ADR-026, ADR-027):**
  - Start-up: `app/_layout.tsx` wraps the Stack in `DataGate` → `startApp()`
    (`src/store/bootstrap.ts`): open `skillforge.db`, `migrateDatabase` (version guard,
    Drizzle migrations, `meta.schema_version`, one-time seed), `createAppStore`, `loadAll`.
    Components read with `useAppStore(selector)`; actions are `useAppStore((s) => s.logSession)`.
  - Schema changes: edit `src/db/schema.ts`, run `npm run db:generate -- --name <slug>`, commit the
    new files in `src/db/migrations/` (Prettier-ignored). Never edit or delete a generated
    migration; destructive changes need a user decision.
  - Repositories are synchronous (Drizzle's expo driver runs in sync mode): keep
    `db.transaction` callbacks synchronous.
  - The store always recomputes on `loadAll` and rewrites `node_progress` after every change; the
    cache is never read back yet (export or a fast start can use `readNodeProgress`).
  - `logSession(session, { endedAt, equipmentProfileId })` stores the session exactly as given; the
    Train flow (4.4) builds the `LoggedSession` (ids via `createId` in `src/lib/id.ts`).
  - `generateWorkout(profileId, minutes, seed?)` defaults the seed to the number of logged sessions
    (stable until the next session); pass another seed for "shuffle".
  - The store takes `baseNodes` (= `ALL_NODES`) and applies the stored overlay itself (3.4);
    read the user's tree from `state.nodes`, never from `ALL_NODES` in the UI.
  - Tests: `openTestDatabase(path?)` (`src/db/testing/testDatabase.ts`) gives a migrated database
    on `node:sqlite` through the real driver; use a temp file to simulate a restart.
  - The Maestro smoke flow now also asserts "Home" and "Park" on Settings.
  - Lockfile: `npm install` on Windows dropped `@emnapi/core` / `@emnapi/runtime` again; they were
    restored from main's lockfile (check after every install).
- **Workout generator (Phase 2.5, ADR-024):**
  - `generateWorkout(request)` is pure; pass `now` and a `seed` (e.g. the session id hash or a
    counter). Same request + seed = same plan, so the plan preview can be regenerated safely.
  - `recentSessions` should cover at least the last two weeks: it drives pattern recency, the
    48 h rules, the last performance for double progression and stagnation. Only ≥ 2 sets of a
    node in a session count as working sets, so a 1-set warm-up item never blocks a pattern.
  - The Train flow (4.4) should log a planned exercise with `prescribed = target` and
    `isTrial` from the plan. When the user edits the plan, re-check it with
    `sessionSafeguardWarnings(plannedSets(planExercises(plan), now), …)` and show the warnings
    with an acknowledge step (ADR-023); never block.
  - Default profiles are seeded on first run from `DEFAULT_EQUIPMENT_PROFILES`
    (`src/domain/equipment.ts`; Home = floor, wall, bar, parallettes, bands; Park = Home +
    dip_bars). 4.1 onboarding can edit them through the store.
  - Straight-arm Trials of 3 × 30 s are suggested on a **Trial day** (2.8, ADR-025): one
    straight-arm Trial's sets are exempt from the budget (`budgetExemptTrialSets`, used inside
    `straightArmSecondsUsed`), and the generator then drops all other straight-arm candidates.
    Changing this needs a new ADR and a user decision (AGENT.md §5). The Train flow can show the
    "Trial day" note; straight-arm work the user adds on top gets `straight_arm_budget` only once
    it goes over ~60 s besides the Trial.
  - Constants are a first pass (see `docs/CONTEXT.md` → Generator). Tune them in
    `generator.ts` only.
- **Game engine (Phase 2.1–2.4, 2.6; ADR-018…021):**
  - Everything takes the node list as a parameter. Pass the user's merged tree
    (`applyOverlay(ALL_NODES, overlay).nodes`, the store's `state.nodes` since 3.4), not `ALL_NODES`,
    so user-added or edited progressions (and later coach changes) flow through the same rules.
  - `applySession` is the only reducer step; `recompute` folds it over the sorted history. Use
    `canApplyIncrementally` before an incremental apply; an older session (import) needs a recompute.
    Recompute also after an overlay edit or a formula change.
  - A skipped set must be logged with `actual.value = 0` (completion bonus and outcome rely on it).
  - **User autonomy (2.7, ADR-023):** nothing in the engine blocks the user. Trials count on every
    node (a Trial on an already passed node is ignored). Safeguard violations and unmet
    prerequisites come back as `SessionResult.warnings` / `UserActionResult.warnings`; the UI
    must show them with an acknowledge step and can ask for them before an attempt with
    `nodeUseWarnings` and `sessionSafeguardWarnings`. The generator must keep respecting the
    safeguards (AGENT.md §5).
  - Self-unlocks are `UserAction`s (`kind: 'self_unlock'`) and must be persisted next to the
    sessions (a `user_actions` table in 3.1). `recompute(nodes, sessions, actions)` replays both
    (actions before sessions at the same ms); `canApplyIncrementally` takes either kind.
  - Attribute points are open-ended sums (`difficultyMult × level` per trained node); the radar
    (4.5) should normalise them. The push/pull warning uses `peakOgLevels` instead.
  - The L-sit support-hold chain has `trains: [core, push]` (chosen in this task from the user's own example);
    the coach review (1.10) should confirm or change it via the review sheet's Trains column.
  - `alternatives` of a prerequisite node satisfy that prerequisite (ADR-019), so a proficient
    `straight_bar_dip` also meets the human flag's `parallel_bar_dip` gate.
  - All numbers are a first balance pass; tune them only in the owning module and recompute.
  - PR #5 (docs-only PLAN update after PR #4) also edits "Current state" / "Next up"; whichever merges
    second has to resolve a small conflict in this file.
- **Progression matrix (Phase 1, ADR-015/016):**
  - Content lives in `content/progressions/<branch>.yaml`. Authors follow
    `content/progressions/README.md` and the node list in `docs/research/node-manifest.md`.
  - After any YAML edit run `npm run progressions:build` and commit the YAML **and** the two
    generated files (`src/data/skills/progressions.generated.ts`, `docs/review/progression-matrix.md`).
    The dataset test and `progressions:check` (also in CI) fail when they are stale.
  - Dataset: 89 nodes (manifest's 88 + `straight_bar_dip`, ADR-017). Home profile reaches every
    node except `parallel_bar_dip`, `iron_cross` and the three human flags; this and the key
    cross-branch gates are asserted in `src/data/skills/crossBranchGates.test.ts`.
  - The muscle-up negative's dip gate is `straight_bar_dip` (not `parallel_bar_dip`), so Home users
    can reach it. The human flag still gates on `parallel_bar_dip`.
  - Handstand presses (`wall_straddle_press_eccentric`, `straddle_press_to_handstand`) have the
    `straight_arm_push` pattern but `straight_arm: false` (balance skills). The gate test pins this;
    a coach may want them flagged.
  - **Open `verify:` nodes (task 1.6 / 1.10), 52 total:**
    - h_push: pseudo_planche_push_up
    - v_push: support_hold, dip_negative, straight_bar_dip, freestanding_handstand_push_up
    - v_pull: dead_hang, scapular_pull, pull_up_negative, chest_to_bar_pull_up, archer_pull_up,
      one_arm_chin_up_negative, one_arm_chin_up
    - h_pull: band_row
    - front_lever: advanced_tuck_front_lever, one_leg_front_lever (OG2 may list it after straddle)
    - back_lever: skin_the_cat, tuck_back_lever, back_lever, iron_cross
    - planche: planche_lean, full_planche
    - handstand: wall_handstand, chest_to_wall_handstand, freestanding_handstand,
      straddle_press_to_handstand, one_arm_handstand
    - core: hollow_hold, side_plank, foot_supported_l_sit, hanging_knee_raise, l_sit, toes_to_bar,
      straddle_l_sit, v_sit, manna (big jump from the 45° V-sit to manna; OG2 gates on a 170° V-sit)
    - legs: split_squat, bulgarian_split_squat, assisted_pistol_squat, nordic_curl_negative
    - dynamic: kipping_swing, muscle_up_negative, kipping_muscle_up, elbow_lever, tuck_human_flag,
      straddle_human_flag, human_flag, strict_bar_muscle_up
    - flexibility: all 5 (our own synthesis)
  - Placeholder standards worth a coach's eye first: one-arm chin-up 3×3, muscle-ups 3×5, all
    eccentric trials 3×3 lowerings of 5 s, advanced holds 3×15 s, `skin_the_cat` 3×8.
  - `yaml` is a runtime dependency only for overlay import/export; the built-in matrix is never
    parsed on the phone. Jest maps `yaml` to its CJS build (`package.json` → `moduleNameMapper`)
    because jest-expo otherwise picks the ESM browser build.
  - Windows `npm install` dropped the `@emnapi/*` lockfile entries again; they were restored by hand
    (see the CI gotcha below). Check for this after every install.
- Scaffold (tasks 0.2–0.5): routes are in root `app/` (not the template's `src/app/`, see ADR-014).
  Tooling choices are in ADR-013. Folder layout, alias and commands are in `docs/CONTEXT.md`.
- UI colors live only in `src/components/theme.ts`. Tab screens use `PlaceholderScreen`; replace them
  in Phase 4.
- Add dependencies with `npx expo install <pkg>` so versions match SDK 57. `npx expo-doctor` passed
  21/21 checks at scaffold time.
- CI (`.github/workflows/ci.yml`) runs on Node 24 for every PR and on every push to `main`: it
  installs the npm pinned in `package.json` `devEngines` (11.19.0), then lockfile:check, npm ci,
  typecheck, lint, format:check, test, progressions:check. Lockfile gotcha (task 0.7, ADR-029): the
  local npm 11.6.2 drops the optional peers `@emnapi/core`/`@emnapi/runtime` from
  package-lock.json and CI's newer npm then rejects it ("Missing: … from lock file"). After every
  `npx expo install` / `npm install`, run `npm run lockfile:fix` (never hand-patch, never switch CI
  to `npm install`); `npm run lockfile:check` must pass before committing. Reviewers must wait for it to be green (`gh pr checks <n> --watch`).
- The approved design is summarized in this file and in `docs/DECISIONS.md` (ADR-001…029). The
  exercise research is in `docs/research/progressions.md`.
- `gh` is installed at `C:\Program Files\GitHub CLI\gh.exe` and logged in as `Herofresh`. If `gh`
  isn't on PATH in an old shell, use the full path.
- Local tooling: Node 24, npm 11, Java 17, jq, the Android SDK (emulator) and Maestro; paths are in
  `docs/CONTEXT.md`.
- E2E (task 0.6, ADR-022): the runbook is in `docs/CONTEXT.md` "E2E tests". Flows in `.maestro/`
  match visible text, so a UI task that changes copy must update them. They don't run in CI yet.

---

## Roadmap

### Phase 0: Docs and scaffold
- [x] 0.1 Documentation set: AGENT.md, CLAUDE.md, PLAN.md, DECISIONS.md, CONTEXT.md, research doc ([PR #1](https://github.com/Herofresh/SkillForge/pull/1))
- [x] 0.2 `create-expo-app` (TypeScript, expo-router, tabs: Tree · Train · Character · Settings) ([PR #2](https://github.com/Herofresh/SkillForge/pull/2))
- [x] 0.3 TypeScript strict, ESLint, Prettier, Jest (`jest-expo`); scripts `typecheck`, `lint`, `test` ([PR #2](https://github.com/Herofresh/SkillForge/pull/2))
- [x] 0.4 GitHub Actions CI: typecheck, lint and test on every PR ([PR #3](https://github.com/Herofresh/SkillForge/pull/3))
- [x] 0.5 Folder layout (`src/domain`, `src/data/skills`, `src/db`, `src/components`, `src/lib`) and README update ([PR #2](https://github.com/Herofresh/SkillForge/pull/2))
- [x] 0.6 Emulator check and Maestro E2E smoke flow (`.maestro/smoke.yaml`, `npm run e2e`, ADR-022). Verified on `Pixel_6_Pro_API_34` via Expo Go ([PR #7](https://github.com/Herofresh/SkillForge/pull/7))
- [x] 0.7 Lockfile guard: `lockfile:check` / `lockfile:fix` with the npm pinned in `devEngines`, CI on the same npm (ADR-029) ([PR #13](https://github.com/Herofresh/SkillForge/pull/13))

### Phase 1: Progression matrix
The matrix is authored as human-editable YAML (one file per branch in `content/progressions/`) and
compiled into a typed module for the app; users can layer their own changes on top (ADR-016).

- [x] 1.1 `src/domain/types.ts`: `ExerciseNode`, `Branch`, `Metric`, `Prerequisite`, `Trial`, `EquipmentTag`, overlay types; `tierForOgLevel` ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.2 Dataset: the 88 nodes of [`docs/research/node-manifest.md`](research/node-manifest.md) written as YAML blocks in `content/progressions/<branch>.yaml`, plus `straight_bar_dip` (89 nodes, ADR-017) ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.3 Cross-branch prerequisites (muscle-up, front lever, planche, freestanding HS, flag, pistol), as listed in the manifest ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.4 Equipment options and `alternatives` (Home: floor/wall/bar/parallettes/bands; Park: + dip bars) ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.5 `src/data/validate.ts` + tests: unique snake_case ids, references resolve, DAG, ogLevel monotonic per branch, unique order, equipment, ranges/trials, sources, straight-arm flag ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [ ] 1.6 Verify the inferred (`~`) OG2 levels against the OG2 Google Sheet
- [x] 1.7 YAML format (`src/data/progressionFormat.ts`), `npm run progressions:build|check|review`, generated `src/data/skills/progressions.generated.ts`, staleness test, contributor guide `content/progressions/README.md` ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.8 Coach review sheet `docs/review/progression-matrix.md` (generated, committed) ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.9 User overlay in `src/domain/overlay.ts`: `applyOverlay` (same validator), `exportOverlay`/`importOverlay` (YAML/JSON) ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [ ] 1.10 Coach review pass: a calisthenics coach reviews the sheet; notes go into `review.notes`, signed-off nodes get `review.status: coach_reviewed` (needs the user to find a coach)

### Phase 2: Game engine (`src/domain/`, pure TS, with tests)
- [x] 2.1 `xp.ts`: unit normalization (1 rep = 2 s hold = 3 s eccentric), difficulty and outcome multipliers, bonuses ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.2 `progression.ts`: levels 1–10, level-5 cap and Trial, banked XP, node states, unlock resolution ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.3 Tendon safeguards (ADR-010): min weeks at level, 60 s straight-arm budget, 48 h rule ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.4 `character.ts`: character level, attributes, rank title, push/pull balance warning ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.5 `generator.ts`: frontier, scoring, equipment substitution, slot filling, double-progression prescription; suggestions respect the safeguards (ADR-023) ([PR #9](https://github.com/Herofresh/SkillForge/pull/9))
- [x] 2.6 Recompute-from-history function (ADR-008) ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.7 User autonomy: test-out anywhere (incl. straight-arm), self-unlock as a recorded user action, advisory safeguards (`SafeguardWarning`), multi-attribute stats (`PATTERN_ATTRIBUTES`, YAML `trains`) (ADR-023) ([PR #8](https://github.com/Herofresh/SkillForge/pull/8))
- [x] 2.8 Trial-day exception (user decision 2026-09-27): one straight-arm Trial's sets don't count against the ~60 s budget; the generator suggests at most one due straight-arm Trial per session and then no other straight-arm work; budget warnings only for extra non-Trial volume (ADR-025) ([PR #10](https://github.com/Herofresh/SkillForge/pull/10))

### Phase 3: Persistence
- [x] 3.1 Drizzle schema and migrations (profile, goals, node_progress, equipment_profiles, sessions, session_sets, user_actions, settings, meta), run on start with a loading/error gate; Home/Park seeded (ADR-026) ([PR #11](https://github.com/Herofresh/SkillForge/pull/11))
- [x] 3.2 Repositories plus the Zustand store that wires the domain to the database; tests on `node:sqlite` through the real driver (ADR-027) ([PR #11](https://github.com/Herofresh/SkillForge/pull/11))
- [x] 3.3 JSON export/import of all user data with a `schemaVersion`, validated before writing, safety copy + one-transaction replace; expo-file-system/sharing/document-picker (ADR-028) ([PR #12](https://github.com/Herofresh/SkillForge/pull/12))
- [x] 3.4 Store the user progression overlay (ADR-016) in SQLite, apply it with `applyOverlay` when loading the tree, and include it in export/import (ADR-028) ([PR #12](https://github.com/Herofresh/SkillForge/pull/12))

### Phase 4: Core UI
- [ ] 4.1 Onboarding: hero name, equipment profiles, goal picking, optional assessment Trials. The assessment may offer any node, including straight-arm ones (ADR-023), with their safeguard warnings shown
- [ ] 4.2 Tree tab, column view
- [ ] 4.3 Node detail: cues, level/XP, prerequisites ✓/✗, set goal, attempt Trial / test out, "unlock anyway" (self-unlock) for locked nodes, history
- [ ] 4.4 Train flow: Train now → profile and time → plan preview (swap/remove) → live logging → summary with XP, level-ups and unlocks
- [ ] 4.x Safeguard warnings in the UI (ADR-023): every `SafeguardWarning` (before a Trial, test-out or self-unlock, during a live session and in the summary) is shown with its message and an acknowledge step; straight-arm ones explain why. Never a hard block. Part of 4.1, 4.3 and 4.4
- [ ] 4.5 Character tab: level, rank, attribute radar, streak, recent sessions
- [ ] 4.6 Settings: equipment profiles, export/import
- [ ] 4.7 In-app node editor: add a `user_` node, edit a node's standards/prerequisites, hide a node; show `applyOverlay` issues inline and never save a broken tree
- [ ] 4.8 "Suggest to project": share the overlay as YAML (`exportOverlay`) and import someone else's (`importOverlay`)

### Phase 5: Graph view and release
- [ ] 5.1 Graph view: dagre layout, SVG, pan/zoom, glowing unlocked edges, legendary silhouettes
- [ ] 5.2 Animations and polish (level-up and unlock reveal)
- [ ] 5.3 EAS build profile and Android APK

### Later / Backlog
- E2E in CI: run the Maestro flows on GitHub Actions with an Android emulator (e.g.
  `reactivecircus/android-emulator-runner`). This probably needs a dev build or APK (5.3) instead of
  Expo Go. Every UI task in Phase 4 should also add or extend a flow in `.maestro/`.
- Hold stopwatch and rest timer (rest durations are already stored in the prescription)
- Weekly plans and scheduling
- Notifications and reminders
- More content: advanced/elite nodes, full flexibility branch
- Optional cloud sync
- Overlay safety (from the PR #4 review): `applyOverlay` only enforces `straight_arm: true` in the
  front_lever, back_lever and planche branches, so an overlay edit can set `straight_arm: false` on
  a built-in straight-arm node elsewhere (e.g. `german_hang`, `manna`, `tuck_human_flag`) or move it
  to another `branch`, which would drop its tendon safeguards (AGENT.md §5, ADR-010). Decide before
  the editor UI (4.7/4.8) whether overlays may clear `straightArm` on built-in nodes.
