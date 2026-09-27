# Architecture & Product Decision Records

This log is append-only. Never edit the substance of an old entry. To change course, add a new ADR and
set the old one's status to `Superseded by ADR-NNN`.

Template:

```
## ADR-NNN: Title
- Date: YYYY-MM-DD · Status: Accepted | Superseded by ADR-NNN | Proposed
- Context: why a decision was needed
- Decision: what was decided
- Consequences: trade-offs, follow-ups
```

---

## ADR-001: Expo (React Native + TypeScript), Android first
- Date: 2026-09-27 · Status: Accepted
- Context: The app is used at the gym or park on a phone. The user tests on Android. There's no Android
  SDK installed locally.
- Decision: Build a native mobile app with Expo (managed workflow) and TypeScript. During development,
  run it on the phone through Expo Go. Build installable APKs later with EAS cloud builds.
- Consequences: We get one codebase and an iOS build is possible later. We're limited to Expo-compatible
  libraries. EAS builds need an Expo account.

## ADR-002: Local-first storage (SQLite), no backend
- Date: 2026-09-27 · Status: Accepted
- Context: This is a personal app. We don't want a server to run or accounts to manage.
- Decision: Store all user data on the device in SQLite (`expo-sqlite` + Drizzle ORM). Provide JSON
  export/import for backups.
- Consequences: The app works offline and needs no ops. Data stays on one device until someone adds
  sync, which can be layered on later.

## ADR-003: Skill tree shown as both a node graph and branch columns
- Date: 2026-09-27 · Status: Accepted
- Context: The user wants a nerdy skill tree. A pan/zoom graph is the most "RPG", but columns are easier
  to read on a phone.
- Decision: Build both views from the same data. The column view comes first (MVP). The graph view uses
  a dagre layout and SVG, with gestures for pan and zoom.
- Consequences: Two views to maintain. Layout is derived from the data, so there's no duplication (DRY).

## ADR-004: Unlocking via XP levels with a Trial at the level cap, plus test-out
- Date: 2026-09-27 · Status: Accepted
- Context: XP alone would let volume replace ability. Strict gating would force experienced users to
  grind through exercises they can already do.
- Decision:
  - Each node has levels 1–10. Level 5 ("Proficient") is a cap that can only be passed by completing
    the node's **Trial**, which means logging its advancement standard (e.g. 3×8 reps, 3×30 s).
  - XP earned beyond the cap is banked.
  - Reaching Proficient unlocks successor nodes whose prerequisites are met.
  - A Trial can be attempted directly from any available node (test-out). Passing sets the node to
    level 5.
- Consequences: Progress reflects real ability, and experienced users can skip ahead. The Trial
  standards must come from sources.

## ADR-005: Equipment location profiles, chosen at session start
- Date: 2026-09-27 · Status: Accepted
- Context: The user trains at home (pull-up bar, parallettes, bands) and sometimes at a park (dip bars).
- Decision: Users define named equipment profiles (e.g. Home, Park) and pick one when starting a
  session. The generator filters exercises by the available equipment and substitutes them using each
  node's `alternatives`.
- Consequences: Every node needs equipment tags, and alternatives where they make sense.

## ADR-006: On-demand workouts; weekly plans deferred
- Date: 2026-09-27 · Status: Accepted
- Context: The user wants to open the app and say "I'll work out now", not follow a fixed schedule.
- Decision: The MVP generates a session on demand ("Train now") from goals, progress, recent history,
  the equipment profile and the available time. Weekly plans come later.
- Consequences: The generator has to account for recovery from recent history, for example the 48 h
  rule per movement pattern.

## ADR-007: Overcoming Gravity 2 difficulty scale (1–17) for cross-branch comparison
- Date: 2026-09-27 · Status: Accepted
- Context: We need comparable difficulty across branches for XP scaling and the overall level.
- Decision: Every node carries an `ogLevel` taken from Steven Low's OG2 charts. Tiers are beginner
  1–5, intermediate 6–8, advanced 9–12 and elite 13+.
- Consequences: Some levels in the research are inferred (`~`) and need to be checked against the OG2
  sheet. The FIG A–J scale is too coarse for beginners, so we don't use it.

## ADR-008: Progress is derived from logged sets; progress tables are caches
- Date: 2026-09-27 · Status: Accepted
- Context: XP formulas will be rebalanced over time.
- Decision: `session_sets` is the source of truth. `node_progress` and character stats are caches that
  can be recomputed from the full history.
- Consequences: Rebalancing is safe: we recompute and nobody loses progress. Recompute has to be
  efficient enough to run on the device.

## ADR-009: Pure-TypeScript domain layer
- Date: 2026-09-27 · Status: Accepted
- Context: The game rules and the generator are the core of the app and must be easy to test.
- Decision: `src/domain/` has no React, React Native, Expo or database imports and is tested with Jest
  in Node. The UI and database layers call into it.
- Consequences: The domain layer is fast to test and portable (web or backend later). An agent writing
  UI code must not put logic in components.

## ADR-010: Tendon safeguards for straight-arm skills
- Date: 2026-09-27 · Status: Accepted
- Context: Connective tissue adapts about 7–10× slower than muscle (Low, Antranik). Gamification could
  push users to advance too fast.
- Decision: Straight-arm nodes (`straightArm: true`) get a minimum of 6 weeks at level before their Trial
  opens, a per-session hold budget of about 60 s, and a 48 h rest between straight-arm sessions.
- Consequences: Planche and lever progress is slower by design. The UI should explain why.

## ADR-011: Repo documentation system for agent handover
- Date: 2026-09-27 · Status: Accepted
- Context: Tasks will be handed between AI agents and the user. Progress and reasoning must survive
  across sessions.
- Decision: `AGENT.md` (read first, tool-neutral) holds the rules. `CLAUDE.md` points to it.
  `docs/PLAN.md` holds living progress and handoff notes, `docs/DECISIONS.md` is this ADR log,
  `docs/CONTEXT.md` is the lookup reference, and `docs/research/` holds the source material. Every task
  updates them in the same PR.
- Consequences: A small amount of overhead per task in exchange for continuity.

## ADR-012: PRs are reviewed and merged by an independent reviewer agent
- Date: 2026-09-27 · Status: Accepted
- Context: The user doesn't want to review every change personally.
- Decision:
  - Every PR is handed to a fresh reviewer agent that didn't author it.
  - The reviewer verifies it (install, typecheck, lint, test, CI), reviews the diff against AGENT.md,
    and squash-merges if it's fine.
  - The reviewer requests changes if there are substantive issues.
  - The reviewer escalates to the user (`needs-user` label) for product decisions, ADR reversals,
    risky dependencies, data-destructive changes, or non-converging reviews.
- Consequences:
  - Faster flow with less user overhead.
  - Review quality depends on independence, so the author must never merge their own PR.
  - The rules live in AGENT.md §4a.

## ADR-013: Tooling: ESLint (eslint-config-expo) + Prettier, Jest with jest-expo
- Date: 2026-09-27 · Status: Accepted
- Context: Phase 0 needs a typecheck/lint/test baseline that the reviewer agent and CI can run with
  one command each, without extra infrastructure.
- Decision:
  - ESLint 9 flat config (`eslint.config.js`) = `eslint-config-expo/flat` + `eslint-config-prettier/flat`.
    Prettier runs on its own (`npm run format`, `format:check` in CI), not as an ESLint rule
    (no `eslint-plugin-prettier`), so lint stays fast and style errors don't hide real ones.
  - Prettier config: single quotes, width 100, trailing commas, `bracketSameLine` (matches the Expo
    template style). Markdown and `docs/` are excluded to keep the hand-written docs untouched.
  - Jest 29 with the `jest-expo` preset for everything, including pure `src/domain` and `src/data`
    tests. One runner is simpler than a separate `ts-jest`/Node project; the domain stays pure by rule
    (ADR-009), not by runner.
  - `@types/jest` is added and listed in `tsconfig.json` `types`, because TypeScript 6 no longer loads
    all `@types` automatically.
  - Dev tools are installed at the versions `npx expo install` resolves for SDK 57.
- Consequences: `npm run typecheck && npm run lint && npm test` is the whole local gate. If the domain
  test suite gets slow under `jest-expo`, a Node-only Jest project can be added later.

## ADR-014: Root `app/` routes, `@/*` → `src/*` alias, template trimmed
- Date: 2026-09-27 · Status: Accepted
- Context: The SDK 57 `create-expo-app` template puts routes in `src/app/` and ships demo screens,
  native tabs, a `reset-project` script and its own `AGENTS.md`/`CLAUDE.md`. The approved layout
  (CONTEXT.md) puts routes in root `app/` and keeps `src/` for non-route code.
- Decision:
  - Routes live in root `app/`, with tabs in `app/(tabs)/`. `src/` holds `domain`, `data`, `db`,
    `components`, `lib` only. This keeps every file under `src/` importable without becoming a route.
  - Keep the template's `@/*` → `./src/*` alias (plus `@/assets/*`). Jest mirrors it via
    `moduleNameMapper` in `package.json`.
  - Tabs use JS bottom tabs (`expo-router/js-tabs`) with `expo-symbols` icons, not the template's
    `unstable-native-tabs`, so the tab bar can be themed and stays on a stable API.
  - Removed: demo screens/components/hooks, `scripts/reset-project.js`, unused `expo-device`,
    `expo-image`, `expo-web-browser`, the template's `AGENTS.md`/`CLAUDE.md`/`.claude`/`.vscode` and
    LICENSE (the repo's licence is a separate product decision). Kept `@expo/ui`, `expo-glass-effect`,
    `expo-symbols` because `expo-router` depends on them, and web support (`react-native-web`) for
    quick previews.
  - App identity: name `SkillForge`, slug and scheme `skillforge`, Android package `at.skillforge.app`,
    `userInterfaceStyle: dark`.
- Consequences: Expo docs that assume `src/app/` need translating to `app/`. Don't create `src/app/`,
  because Expo Router would switch to it.

## ADR-015: Libraries for the progression content pipeline: `yaml` and `tsx`, no schema library
- Date: 2026-09-27 · Status: Accepted
- Context: The progression matrix is authored in YAML (ADR-016). We need a YAML parser, a way to run
  TypeScript build scripts, and field validation with messages a non-programmer can act on.
- Decision:
  - **`yaml`** (eemeli/yaml, ISC, no dependencies, pure JS) parses and writes YAML. It keeps comments
    out of the data, reports syntax errors with line and column, and rejects duplicate keys. It is a
    runtime dependency because overlay import/export (`src/domain/overlay.ts`) runs in the app; the
    built-in matrix is still never parsed on the phone.
  - **`tsx`** (dev) runs `scripts/progressions.ts` directly, honouring the `@/*` alias from
    `tsconfig.json`, so the script and the app share the same modules.
  - **`@types/node`** (dev) for the script and the dataset test's file access; `tsconfig.json`
    `types` now lists `node` next to `jest`.
  - **No `zod`.** A small field table in `src/data/progressionFormat.ts` parses each node and writes
    plain-language errors ("metric 'repetitions' is not allowed; use one of: …"), and the same table
    converts nodes back to YAML for overlay export. A schema library would add a dependency and
    produce messages that need rewriting for coaches anyway.
- Consequences: One small runtime dependency. Jest maps `yaml` to its CommonJS build because the
  jest-expo resolver otherwise picks its ESM browser entry.

## ADR-016: Progression matrix as YAML source + generated module, with a user overlay
- Date: 2026-09-27 · Status: Accepted
- Context: The user wants the matrix easy to read and edit for people who don't program: a calisthenics
  coach will review it, and users should be able to add or change progressions. The earlier plan
  (AGENT.md §5, CONTEXT.md) had TypeScript files in `src/data/skills/<branch>.ts`.
- Decision:
  - **Source of truth:** one YAML file per branch in `content/progressions/<branch>.yaml`. One block
    per node, readable snake_case field names, comments allowed, cross-references by id. Each node
    has `review: { status: draft | coach_reviewed, notes }` and an optional `verify:` note that
    replaces the `// TODO(verify):` comment convention. Field guide: `content/progressions/README.md`.
  - **One parse/normalize function** (`parseBranchFile`/`nodeFromRaw` in
    `src/data/progressionFormat.ts`) is used by the build script, the tests and overlay import.
    Graph rules live in `validateNodes` (`src/data/validate.ts`), also shared.
  - **Generated artifact:** `npm run progressions:build` writes
    `src/data/skills/progressions.generated.ts` (a typed TS module, so `tsc` checks it against
    `ExerciseNode`) and the coach sheet `docs/review/progression-matrix.md`. Both are committed. The
    app imports the module via `src/data/skills/index.ts` (`ALL_NODES`, `NODE_BY_ID`); nothing parses
    YAML at runtime. A test fails when either generated file is stale, and CI runs
    `npm run progressions:check`.
  - **`order` (chainOrder)** is an explicit number, suggested in steps of 10 so nodes can be inserted
    without renumbering. It only orders the column; ids carry identity.
  - **`ogLevel` 0** means "foundation exercise below OG2 level 1" (wall push-up, dead hang). Range is
    0–17. Tier is derived by `tierForOgLevel` (`src/domain/tier.ts`) and never stored.
  - **Straight-arm branches** (`front_lever`, `back_lever`, `planche`) must have `straight_arm: true`
    on every node; bent-arm work that belongs to those skills (frog stand, FL rows) lives in the
    handstand and h_pull branches.
  - **User overlay:** `ProgressionOverlay { added, edited, hidden }` in `src/domain/types.ts`.
    `applyOverlay(base, overlay)` merges and then runs the same `validateNodes`; it is all or nothing
    and returns the unchanged base plus issues if anything breaks (cycles, dangling ids, bad trials).
    Added nodes have ids starting `user_` and `source: 'user'`; edits never change `id` or `source`.
    Hiding a node routes its dependents to the hidden node's own prerequisites. `exportOverlay` /
    `importOverlay` use the same YAML field format (plus `branch:` per node), so a user's progression
    can be sent back as a suggestion and pasted into a content file.
  - `src/domain/overlay.ts` imports the pure `src/data` format and validator modules. That is the
    one allowed domain → data import; both modules stay free of React/Expo/DB (ADR-009).
- Consequences:
  - Contributors must run the build after editing YAML; tests and CI enforce it.
  - Persistence of the overlay (PLAN 3.4) and the editor UI (4.7, 4.8) are separate tasks.
  - AGENT.md §5 "Adding a skill node" now points at the YAML files.

## ADR-017: Home-first dip: `straight_bar_dip` node and the bar muscle-up dip gate
- Date: 2026-09-27 · Status: Accepted
- Context: The node manifest had dips only on dip bars or rings (`dip_negative`, `parallel_bar_dip`),
  and the muscle-up negative required `parallel_bar_dip` as a hard gate. The default Home profile
  (floor, wall, bar, parallettes, bands; ADR-005) has neither, so Home users had no dip and could never
  unlock the muscle-up chain. Prerequisites are single ids (no "either of" edges), and making
  `alternatives` satisfy prerequisites would be new unlock semantics that belong to Phase 2.
- Decision:
  - Add `straight_bar_dip` to `v_push` (order 55, OG level 3 copied from PB dips, `verify:` note).
    It needs only a bar. `parallel_bar_dip` and `straight_bar_dip` list each other as `alternatives`.
  - `dip_negative` gains a `bar` equipment option (lowering from a support on a straight bar).
  - `muscle_up_negative` requires `straight_bar_dip` (hard, L5) instead of `parallel_bar_dip`: the top
    of a bar muscle-up is a straight-bar dip (bodyproskills: "the top of a muscle-up is a deep dip"),
    so the more specific dip is also the better gate. The human flag keeps `parallel_bar_dip` (it
    needs a pole anyway).
  - `src/data/skills/crossBranchGates.test.ts` asserts that the Home profile reaches every node except
    `parallel_bar_dip`, `iron_cross` and the three human flags, and at least two nodes per movement
    pattern (one for `hinge`).
- Consequences: 89 nodes instead of the manifest's 88. Park users also do straight-bar dips before the
  muscle-up. Whether `alternatives` should satisfy prerequisites is left to PLAN 2.2.

## ADR-018: XP and character formulas (constants of Phase 2.1 and 2.4)
- Date: 2026-09-27 · Status: Accepted
- Context: PLAN 2.1 and 2.4 needed concrete numbers for the planned formulas in `docs/CONTEXT.md`.
  The values are a first balance pass; ADR-008 makes retuning safe (recompute from history).
- Decision (constants live only in `src/domain/xp.ts` and `src/domain/character.ts`):
  - **Units:** 1 rep = 2 s hold = 3 s eccentric = 1 unit. An eccentric set is
    `lowerings × seconds / 3`. `load_xbw` (no node uses it yet) is `reps × load`: 1 rep at 1×BW = 1
    unit, so load scales reps linearly, like a harder variation would. A missing rep count is 1.
  - **difficultyMult** = `1 + 0.25 × ogLevel` (1.0 at a foundation node, 2.0 at OG 4, 5.25 at OG 17).
    Linear keeps elite XP from dwarfing everything else.
  - **Outcome** of an exercise (all sets of one node in one session) vs. its prescription:
    `success` if every set met its prescribed target; `partial` if the achieved units, each set
    counted only up to its prescription, reach 50 % of the prescribed units; else `failed`.
    `outcomeMult` 1.0 / 0.6 / 0.3. Capping per set stops one huge set from hiding skipped ones.
  - **Exercise XP** = `round(units × difficultyMult × outcomeMult)`, units being what was actually
    done. A failed exercise still earns XP.
  - **Session bonuses** (character XP only, not node XP): completion +10 % when no set was skipped
    (`actual.value > 0`); streak +5 % per consecutive session after the first, capped at +25 %.
    Sessions at most 72 h apart continue a streak, because rest days are part of training.
  - **Character level:** geometric curve, 100 XP to level 2, each level ×1.1, max 99.
  - **Attributes:** highest ogLevel of a proficient node per branch group, via the single
    `ATTRIBUTE_BRANCHES` map: Push = h_push, v_push, planche; Pull = v_pull, h_pull, front_lever,
    back_lever; Core = core; Legs = legs; Balance = handstand, dynamic; Mobility = flexibility.
  - **Rank** from the median over all 12 branches of each branch's highest proficient ogLevel:
    Novice < 2 ≤ Apprentice < 6 ≤ Adept < 9 ≤ Master < 13 ≤ Legend (Adept and up follow the tiers).
  - **Balance warning** when |Push − Pull| > 2.
- Consequences: Numbers need play-testing; change them in the owning module and recompute. The
  shared curve helper is `src/lib/curve.ts`; `median` is in `src/lib/median.ts`.

## ADR-019: Node levels, Trial and unlock rules (Phase 2.2)
- Date: 2026-09-27 · Status: Accepted
- Context: ADR-004 fixed the idea (levels 1–10, level-5 cap, Trial, banked XP, test-out). PLAN 2.2
  and ADR-017 left open the curve, what "minLevel 5" means before a Trial, and whether a node's
  `alternatives` can satisfy a prerequisite.
- Decision (`src/domain/progression.ts`):
  - **Curve:** 20 XP from level 1 to 2, each further step ×1.35 (cumulative 0, 20, 47, 83, 133, 199,
    289, 410, 573, 794), multiplied by the node's `difficultyMult`. Harder nodes earn more XP per
    unit (for the character) but need proportionally more XP per level, so node levels track
    sessions of work rather than difficulty. About 5–6 full sessions reach level 5.
  - **Cap and bank:** until the Trial is passed the level is at most 5. All XP is kept in
    `NodeProgress.xp`; the part above the level-5 threshold is the banked XP and counts as soon as the
    Trial is passed.
  - **Trial:** passed when a session holds at least `trial.sets` Trial sets (`isTrial`) of the node's
    metric that each reach `trial.target` (and `trial.reps` for eccentric/loaded nodes). It counts
    only on an unlocked node that clears the safeguards (ADR-020); a blocked attempt still earns XP.
  - **Test-out:** passing a Trial below level 5 lifts node XP to the level-5 threshold (level 5).
  - **Prerequisites:** a hard prerequisite is met when its node reaches `minLevel`; a `minLevel` of 5
    or more also needs that node's Trial passed (Proficient), so volume alone never unlocks.
    Recommended prerequisites never lock; unmet ones are returned as warnings.
  - **Alternatives satisfy prerequisites:** a prerequisite on X is also met by any node listed in
    X's `alternatives` (they train the same thing with other equipment, e.g. `straight_bar_dip` for
    `parallel_bar_dip`). This answers the question ADR-017 left open.
  - **States:** proficient/mastered (Trial passed; mastered at level 10) win over everything; else
    `locked` if a hard prerequisite is unmet; else `training` once any set was logged; else
    `available`. A passed node stays proficient even if an overlay later adds a prerequisite.
- Consequences: Unlock checks read `alternatives` on the prerequisite node, not on the dependent one.
  Alternatives are one-directional per entry; the dataset lists both directions.

## ADR-020: How the tendon safeguards are applied (Phase 2.3)
- Date: 2026-09-27 · Status: Accepted
- Context: ADR-010 set the rules (6 weeks before the Trial, ~60 s per session, 48 h rest) but not
  how to measure them.
- Decision (`src/domain/safeguards.ts`):
  - **6 weeks** are counted from the node's first logged set (`NodeProgress.firstTrainedAt`) to the
    time of the Trial sets. An untrained straight-arm node has no clock, so **straight-arm nodes
    cannot be tested out**: the user trains them for 6 weeks first. The engine (`recompute`) enforces
    this; a blocked attempt is reported as `trialBlocked: 'straight_arm_min_weeks'`.
  - **Budget:** 60 s per session of straight-arm work, counted as hold seconds; non-hold sets on
    straight-arm nodes count 2 s per unit (the XP unit rate). The generator and UI use
    `remainingStraightArmBudget`; the engine does not reject over-budget sets that were logged.
  - **48 h rule:** measured between session start times of sessions with any straight-arm set
    (`lastStraightArmSessionAt`, `isStraightArmRested`). It is a scheduling rule for the generator.
- Consequences: Experienced users cannot skip straight-arm nodes during onboarding (PLAN 4.1). If
  that is too strict, it needs a new ADR and a user decision (AGENT.md §5).

## ADR-021: Logged-set shape and one reducer for incremental and full recompute (Phase 2.6)
- Date: 2026-09-27 · Status: Accepted
- Context: ADR-008 makes `session_sets` the source of truth and progress a cache. Incremental
  updates and full rebuilds must never disagree.
- Decision:
  - `LoggedSet` (in `types.ts`): `sessionId`, `nodeId`, `setIndex`, `metric`, `prescribed` and
    `actual` as `SetPerformance { value, reps? }` (reps = lowerings or loaded reps), `isTrial`,
    `timestamp` (ms epoch). A skipped set is logged with `actual.value = 0`. `LoggedSession` is
    `{ id, startedAt, sets }`.
  - `applySession(state, session, nodes)` in `src/domain/recompute.ts` is the only step. Logging a
    session applies it once; `recompute(nodes, sessions)` sorts by `startedAt` (ties by id) and folds
    the same step. A session older than the last one applied needs a full recompute
    (`canApplyIncrementally`).
  - The engine takes the node list as a parameter, so it runs on the user's merged tree
    (`applyOverlay`, ADR-016); after an overlay edit the caller recomputes.
  - Sets of node ids missing from the tree (hidden or removed nodes) are ignored, including for XP.
  - Node XP gets exercise XP only; session bonuses go to the character's total XP.
  - Locked status for a Trial is judged on the state before the session.
- Consequences: Recompute is O(sessions × nodes) because unlocks are resolved per session; fine for
  the ~90-node tree. Hiding a node drops its XP from the character total until it is shown again.

## ADR-022: Maestro for end-to-end tests, run against Expo Go
- Date: 2026-09-27 · Status: Accepted
- Numbering: ADR-018 to ADR-021 are reserved by the game-engine PR #6, which was open when this was
  written.
- Context: The user wants to see the app running on an Android emulator and to have E2E tests.
  There's no native dev build yet (EAS comes in PLAN 5.3). Maestro flows are YAML, so they're readable
  and close to the YAML matrix style of ADR-016.
- Decision:
  - Use Maestro (`.maestro/*.yaml`, run with `npm run e2e`).
  - For now, flows target Expo Go (`host.exp.exponent`) and open `exp://127.0.0.1:8081` through
    `adb reverse`.
  - The first flow is a smoke test that the app starts and all four tabs render.
  - UI tasks add or extend flows as they build screens.
- Consequences:
  - This is local only for now. The Maestro CLI and a running emulator plus Metro are required, and CI
    for E2E is in the backlog.
  - Flows match visible text, so UI copy changes must update them.
  - When a dev build exists, switch `appId` to `at.skillforge.app` and drop the `openLink`.
