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
- Date: 2026-09-27 · Status: Accepted, amended by ADR-023 (test-out on every node, self-unlock)
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
- Date: 2026-09-27 · Status: Accepted, amended by ADR-023 (the safeguards are advisory warnings) and ADR-025 (Trial-day exception to the budget)
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
- Date: 2026-09-27 · Status: Accepted, amended by ADR-023 (attributes and the balance-warning input) and ADR-041 (rank branches)
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
- Date: 2026-09-27 · Status: Accepted, amended by ADR-023 (Trials count on every node; self-unlock)
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
- Date: 2026-09-27 · Status: Superseded by ADR-023
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

## ADR-023: User autonomy: test-out anywhere, advisory safeguards, multi-attribute stats
- Date: 2026-09-27 · Status: Accepted
- Supersedes ADR-020. Amends ADR-004, ADR-010, ADR-018 and ADR-019 (their other rules stay).
- Context: The user's product decision (2026-09-27): the app must not be too restrictive. Users
  manage their own training with a base suggestion from the app and a progressive approach. Someone
  who can already do a skill can test out and jump ahead, or unlock it into their training. Advanced
  skills should still pay into base stats like arm or core strength. ADR-019 (alternatives satisfy
  prerequisites) stays. In short: **the app suggests, the user decides.**
- Decision:
  - **Test-out on every node.** A Trial counts on any node at any time, including straight-arm
    nodes on day 1 and nodes whose hard prerequisites are unmet. Passing it sets the node to level
    5 / proficient (banked XP applies) and unlocks successors as usual. A Trial on an already passed
    node is ignored (no second `trialPassedAt`). `trialBlockReason` and `trialBlocked` are gone.
  - **Self-unlock.** The user can unlock a locked node without passing anything. It is a
    `UserAction { id, kind: 'self_unlock', nodeId, at }` stored in history next to the sessions
    (ADR-008), replayed by `applyUserAction` / `recompute(nodes, sessions, actions)`, and recorded
    as `NodeProgress.selfUnlockedAt`. A self-unlocked node is never `locked`
    (`NodeStatus.selfUnlocked`); its `unmetHard` list is kept for the UI. Replay order is time,
    then actions before sessions at the same time, then id; `EngineState.lastApplied` makes
    `canApplyIncrementally` exact for both kinds, so incremental == full recompute. An untrained,
    self-unlocked node does not satisfy prerequisites (a prerequisite needs the node trained or
    its Trial passed).
  - **Advisory safeguards.** The ADR-010 rules (6 weeks of training before a straight-arm Trial,
    ~60 s straight-arm hold budget per session, 48 h between straight-arm sessions) are still
    computed by the pure functions in `safeguards.ts` and measured as in ADR-020 (clock from
    `firstTrainedAt`, 2 s per unit for non-hold sets, session start times). They never block
    logging, Trials or test-outs. Violations become `SafeguardWarning { code, nodeId?, message,
    severity }`: `straight_arm_min_weeks`, `straight_arm_budget`, `straight_arm_rest` (severity
    `warning`) and `prerequisites_unmet` (severity `info`, when a locked node is trained or tested,
    or a node is self-unlocked). They are returned in `SessionResult.warnings` /
    `UserActionResult.warnings` and by the query functions `trialWarnings`,
    `sessionSafeguardWarnings`, `prerequisitesWarning` and `nodeUseWarnings`, so the UI shows
    them before and after an attempt with an acknowledge step. The generator's own suggestions keep
    respecting the safeguards (`isTrialOpenBySafeguards`, `remainingStraightArmBudget`,
    `isStraightArmRested`), so the app's base suggestion stays safe.
  - **Multi-attribute stats.** Every trained node pays into every attribute it trains. Which ones
    comes from its patterns through one mapping, `PATTERN_ATTRIBUTES` in `character.ts`
    (horizontal/vertical push → push; horizontal/vertical pull → pull; straight_arm_push → push +
    core; straight_arm_pull → pull + core; squat, hinge → legs; core → core; balance → balance;
    mobility → mobility; explosive → nothing on its own), or from the node's optional YAML field
    `trains: [...]`, which replaces the derived list (coach-adjustable, shown in the review
    sheet's Trains column). Every node must train at least one attribute (validator). A node adds
    `difficultyMult(ogLevel) × node level` points to each of its attributes once it has XP; the
    attribute is the rounded sum. Harder and more-trained nodes count more; the level is capped at
    5 until the Trial, like everywhere else. The support-hold L-sit chain (`foot_supported_l_sit`,
    `tuck_l_sit`, `l_sit`, `straddle_l_sit`, `v_sit`, `manna`)
    gets `trains: [core, push]` as a support hold; a coach should confirm it.
  - **Rank** is unchanged (median of each branch's highest proficient ogLevel). The **push/pull
    balance warning** keeps its threshold (> 2 OG levels) but compares the highest proficient
    ogLevel among the nodes that train push vs. pull (`attributePeakOgLevels`, via the same
    mapping), since attribute points are now open-ended sums.
  - AGENT.md §5 now says: keep the safeguards as warnings and in the generator's suggestions, never
    remove them silently, but don't hard-block the user.
- Consequences: Experienced users can skip ahead anywhere, including straight-arm skills in
  onboarding (PLAN 4.1). The responsibility moves to clear UI: every warning must be shown with an
  acknowledge step (Phase 4), and the straight-arm ones must explain why. Attribute points are no
  longer on the OG scale; the radar (4.5) should normalise them (e.g. to the largest attribute).
  Recompute is needed after this change for any stored caches (none exist yet).

## ADR-024: Workout generator: frontier, scoring, slots and prescription (Phase 2.5)
- Date: 2026-09-27 · Status: Accepted, amended by ADR-025 (straight-arm Trials are suggested on a Trial day)
- Context: ADR-005 and ADR-006 fixed the idea (on-demand session from goals, progress, history,
  equipment and time) and `docs/CONTEXT.md` sketched the steps. PLAN 2.5 needed concrete rules and
  numbers, and ADR-023 requires the generator's own suggestions to keep respecting the advisory
  safeguards while the user may override them.
- Decision (`src/domain/generator.ts`, pure; `generateWorkout(request)` with the tree, goals,
  progress, equipment tags, minutes, recent sessions, `now` and a `seed` as inputs):
  - **Frontier:** for each goal, walk its unmet hard prerequisites (`resolveTree`, so alternatives
    satisfy prerequisites, ADR-019) down to trainable nodes (available, training, self-unlocked).
    A locked prerequisite with a trainable alternative walks to that alternative. A goal without
    unmet prerequisites trains itself; mastered and unknown goals are skipped.
  - **Candidates:** the frontier plus every available/training node the user has not outgrown (a
    node is outgrown once a node that lists it as prerequisite or regression is trained). Equipment
    is OR-of-AND; a node the profile can't do is replaced by one of its `alternatives` that the
    profile can do and that shares its main pattern (unlocked first, then closest ogLevel, then id),
    else dropped with a note.
  - **Recovery:** a node is skipped when one of its patterns had working sets less than 48 h ago
    (`PATTERN_REST_HOURS`); `balance` and `mobility` are exempt (low fatigue, daily practice).
    Only ≥ 2 sets of a node in a session count as working sets (`MIN_WORKING_SETS`), so the
    one-set warm-up items never block the next day. All straight-arm work is skipped when
    `isStraightArmRested` says no.
  - **Score** = goal-path weight (per goal: 50 + 30 × distance-to-goal / the goal's longest
    distance, so the start of the critical path comes first; summed over goals) + 5 points per day
    since the node's most recent pattern (max 7 days) + up to 20 for training the weaker of push /
    pull (share of the attribute-point gap, `computeAttributes`, via `nodeAttributes`) + 10 for a
    stalled node (best set not improved over its last 3 sessions, below the range top) + 1 per
    ogLevel (train at your edge). Ties break by an FNV-1a hash of `seed:nodeId`, then id.
  - **Slots:** fixed prep (`wrist_prep`, `shoulder_dislocate`) first; then, repeatedly, the open
    slot whose best unused candidate scores highest is filled: 2 skill slots (`isSkill` or
    straight-arm; the second only for goal skills), 3 strength pairs (vertical pull + squat, push +
    hinge, horizontal pull + push), 1 core slot and 1 cool-down (mobility, goal nodes only). A slot
    is added only if it fits the minutes left, first at full sets, then trimmed to 2 sets; else it
    is skipped. Last, up to 2 warm-up ramp sets (the `regressionId` of the day's main exercises,
    never straight-arm) are added if time is left. Blocks are output in session order.
  - **Straight-arm budget:** each straight-arm exercise is fitted to the ~60 s left
    (`straightArmSecondsUsed` on the planned sets): fewer sets, or not at all. A straight-arm
    Trial is suggested only after `isTrialOpenBySafeguards` (else a note says in how many days)
    and only if it fits the budget; otherwise top-of-range working sets are suggested and a note
    says the user may still attempt it (with the budget warning). The warm-up never contains
    straight-arm work.
  - **Prescription (double progression):** no history → 3 × the bottom of the working range.
    After a session where every set met its prescription: the weakest set + one step (1 rep, 5 s
    hold, 1 s eccentric, 0.05 × BW), else the weakest set again, always inside the range. Once
    every set reached the top of the range and the Trial isn't passed, the Trial is prescribed
    (`trial.sets × trial.target`, `isTrial`). Eccentric and loaded nodes keep `trial.reps`
    lowerings/reps per set. Warm-up items are 1 set at the range bottom.
  - **Rest and time:** 90 s after each set inside a pair, 180 s otherwise, 30 s in the warm-up,
    stored per exercise for the future rest timer. Estimate = Σ (30 s setup + sets × (work + rest)),
    work = 3 s per rep, hold seconds, lowerings × seconds; rounded up to whole minutes and never
    above the available minutes.
  - **Output:** `WorkoutPlan { blocks, estimatedMinutes, warnings, notes }` (types in `types.ts`).
    `warnings` are the advisory `SafeguardWarning`s that still apply (unmet prerequisites of a
    self-unlocked or substituted node, and as a guard the session and Trial checks, which by
    construction find nothing); `notes` explain substitutions, drops, rested patterns, deferred
    Trials, stalls and push/pull priority.
- Consequences: The content has straight-arm Trials of 3 × 30 s (tuck, advanced tuck and one-leg front lever, tuck and advanced tuck back lever, German hang, planche lean, straight-arm frog stand, tuck and advanced tuck planche), i.e. 90 s, above the 60 s budget, so the generator never suggests those Trials;
  users reach them by their own choice (with the warning). The coach review (PLAN 1.10) should
  decide whether those Trial standards or the budget should change (backlog). All numbers are a
  first pass; tune them in `generator.ts` only.

## ADR-025: Trial-day exception to the straight-arm budget
- Date: 2026-09-27 · Status: Accepted
- Amends ADR-010 (the budget) and ADR-024 (the generator's straight-arm rules); their other rules stay.
- Context: Ten straight-arm nodes (tuck, advanced tuck and one-leg front lever, tuck and advanced
  tuck back lever, German hang, planche lean, straight-arm frog stand, tuck and advanced tuck
  planche) have 3 × 30 s Trials, i.e. 90 s, above the ~60 s per-session straight-arm budget. So the
  generator (ADR-024) never suggested them, and a user attempting one always got a budget warning.
  The user's decision (2026-09-27): a "Trial-day exception" instead of changing the standards or
  the budget.
- Decision:
  - **Budget:** the sets of one straight-arm Trial in a session don't count against the ~60 s
    budget. Exactly which sets: the Trial sets (`isTrial`) of the first straight-arm node in the
    session that has any, at most its `trial.sets` of them in logged order
    (`budgetExemptTrialSets` in `safeguards.ts`). A second straight-arm Trial, extra Trial sets and
    all non-Trial straight-arm sets still count. This lives in `straightArmSecondsUsed`, the one
    place the budget is measured, so the advisory warnings (`sessionSafeguardWarnings`, engine and
    UI) and the generator agree.
  - **Warnings:** a Trial session only gets `straight_arm_budget` when the extra straight-arm work
    besides the Trial goes over ~60 s (the message says "besides the Trial"). The 6-week Trial
    recommendation and the 48 h rest are unchanged; a Trial session is a straight-arm session for
    the 48 h rule.
  - **Generator (Trial day):** after ranking, the best-ranked straight-arm candidate whose
    prescription is its Trial (top of the range reached, Trial not passed,
    `isTrialOpenBySafeguards`, and rested, since straight-arm candidates are skipped within 48 h)
    is the session's only straight-arm work: every other straight-arm candidate is dropped, so at
    most one straight-arm Trial is suggested and nothing else straight-arm is added. A note says
    so. If the time budget trims the Trial to working sets, those count against the budget again.
    If the Trial doesn't fit the minutes at all, that session has no straight-arm work.
  - The Trial standards stay as sourced; the coach review (PLAN 1.10) can still change them.
- Consequences: Due straight-arm Trials are now suggested, and a Trial day costs the other
  straight-arm work of that session. On a Trial day a session can hold up to 90 s of Trial holds
  (plus what the user adds, with the warning above 60 s of extra work). Tune or reverse only with
  a new ADR and a user decision (AGENT.md §5).

## ADR-026: Persistence with Drizzle on expo-sqlite: schema, bundled migrations, store (Phase 3.1–3.2)
- Date: 2026-09-27 · Status: Accepted
- Context: ADR-002 chose on-device SQLite with Drizzle. Phase 3 needs the concrete schema, a safe
  migration path for user data, and the wiring from the UI to the pure domain (ADR-009).
- Decision:
  - **Libraries:** `expo-sqlite` (SDK 57, works in Expo Go), `drizzle-orm` with its
    `expo-sqlite` driver (synchronous mode), `drizzle-kit` (dev) to generate migrations, `zustand`
    for the store, `babel-plugin-inline-import` (dev) to bundle `.sql` files.
  - **Migrations** follow the Drizzle + Expo setup: `drizzle.config.ts` (`dialect: 'sqlite'`,
    `driver: 'expo'`) writes numbered SQL files, a journal and `migrations.js` into
    `src/db/migrations/` (`npm run db:generate`); `babel.config.js` inlines `.sql` imports as
    strings and `metro.config.js` adds `sql` to `sourceExts`. Migrations are generated from
    `src/db/schema.ts`, never hand-edited, and only added (never rewritten). Drizzle records applied
    ones in `__drizzle_migrations` and runs a pending batch in one transaction.
  - **Start-up** (`startApp`): open `skillforge.db`, `PRAGMA foreign_keys = ON`, migrate, seed,
    create the store, `loadAll`; `DataGate` shows a loading state until then and an error screen on
    failure. Nothing on any path deletes or resets data. `meta.schema_version` (number of bundled
    migrations) is written after every run; a database with a higher version (written by a newer
    app) is refused unchanged instead of being migrated.
  - **First run** seeds the hero `profile` row and the Home / Park equipment profiles
    (`DEFAULT_EQUIPMENT_PROFILES` in `src/domain/equipment.ts`) once, marked by
    `meta.defaults_seeded_at`, so a default the user deletes is not re-created.
  - **Schema:** `session_sets` maps 1:1 to `LoggedSet` (ADR-021) with `SetPerformance` flattened
    into `*_value` / `*_reps` columns (queryable, no JSON parsing), primary key
    `(session_id, set_index)`, cascade on its session. `sessions` stores only `id`, `started_at`,
    `ended_at`, `equipment_profile_id`; the planned `outcome`/`xpEarned` columns are left out
    because they are derived (ADR-008). `user_actions` stores `UserAction`s. `node_progress` stores
    `NodeProgress` without the derived `state` column (node states depend on the tree and are
    resolved by `resolveTree`). `goals(node_id, position)`, `equipment_profiles(id, name, tags JSON,
    position)`, `profile` (one row), `settings(key, JSON value)`, `meta(key, value)`.
  - **Layers:** repositories in `src/db/*Repository.ts` are small synchronous functions that take the
    database (or a transaction) and map rows ↔ domain types, checking enum columns on read
    (`rowGuards.ts`). The store (`src/store/appStore.ts`, `createAppStore(deps)`) calls domain
    functions and repositories: `loadAll` = read history → `recompute` → rewrite the
    `node_progress` cache; `logSession` / `selfUnlock` persist first, then apply incrementally (or
    recompute for an entry in the past) and rewrite the cache; `generateWorkout(profileId, minutes)`
    passes the stored goals, progress, profile tags and the last `GENERATOR_HISTORY_DAYS` (28) of
    sessions to the domain generator. `src/domain` stays free of database code.
  - The history is always recomputed on load (cheap for ~90 nodes); the cache is kept for later
    fast paths and export, and may be deleted at any time.
- Consequences: Schema changes need `npm run db:generate` and a committed migration in the same PR;
  a destructive change (drop/rename) needs a user decision (AGENT.md §4a). Synchronous queries run
  on the JS thread; fine at this size, revisit if history grows large. Changing a `.sql` file can
  leave a stale Jest/Metro cache (`npx jest --clearCache`, `npx expo start -c`).

## ADR-027: Database tests run the real Drizzle driver on Node's `node:sqlite`
- Date: 2026-09-27 · Status: Accepted
- Context: Repositories, migrations and the store must be tested in Jest on Node (CI on Ubuntu),
  where the native expo-sqlite module doesn't exist. Options: mock the repositories (tests nothing
  real), `better-sqlite3` with Drizzle's own driver (a native build dependency and a different
  driver/dialect path than the app), or an adapter.
- Decision: `src/db/testing/nodeSqliteClient.ts` implements the few synchronous expo-sqlite
  methods the Drizzle expo driver calls (`execSync`, `prepareSync` → `executeSync`,
  `executeForRawResultSync`, `getAllSync`, `getFirstSync`) on Node 24's built-in `node:sqlite`
  (`DatabaseSync`). Tests pass it to the same `createDatabase` and `migrateDatabase` the app uses,
  so the real schema, generated migrations (inlined by the same Babel config), Drizzle driver and
  repositories run against real SQLite. `openTestDatabase(path?)` opens in memory or a temp file
  (reopening the file simulates an app restart). The adapter is test-only and imported only by
  tests.
- Consequences: No new dependency and no native build. Node prints an "SQLite is experimental"
  warning in test runs. If a Drizzle upgrade starts using other expo-sqlite methods, the adapter
  fails loudly (missing method) and must be extended. Native-only behaviour (the on-device file,
  Expo Go) is covered by the Maestro smoke flow, which checks that the seeded Home and Park
  profiles are shown on Settings.

## ADR-028: Stored overlay, backup file format and replace-only import (Phase 3.3–3.4)
- Date: 2026-09-27 · Status: Accepted
- Context: The user's progression overlay (ADR-016) has to survive restarts and shape the tree the
  engine uses, and all user data needs a JSON export/import (PLAN 3.3). An import must never leave
  the database half-written or silently drop the user's current data, and a file from a newer app
  version must not be misread.
- Decision:
  - **Stored overlay:** a one-row table `progression_overlay(id = 1, revision, saved_at, body)`
    (migration `0001_progression_overlay`). `body` is the `overlayToRaw` shape (the same YAML field
    format with `format`/`version` header as a shared overlay file) stored as JSON and read back
    through `overlayFromRaw`, so the database, shared files and backups use one parser.
    `revision` counts saves; there is one current overlay, no history (YAGNI).
  - **Tree:** the store's `nodes` = `applyOverlay(ALL_NODES, overlay).nodes`; `recompute`,
    `applySession`, `applyUserAction`, `generateWorkout` and the goal/unlock checks all use it.
    `saveOverlay` runs `applyOverlay` first and returns its issues without writing anything when the
    merged tree is broken (cycles, dangling ids, …); on success it stores and runs `loadAll` (full
    recompute). A stored overlay that no longer applies (e.g. an app update removed a node it edits)
    is kept, the built-in tree is used and the issues are exposed as `overlayIssues` for the UI.
  - **Backup format** (`src/domain/backup.ts`, pure): one JSON document
    `{ format: 'skillforge-backup', schemaVersion: 1, exportedAt, profile | null, goals,
    equipmentProfiles, sessions (with endedAt?, equipmentProfileId?, sets without the implied
    sessionId), userActions, overlay (overlayToRaw), settings }`. Derived data (`node_progress`,
    character stats) and `meta` are not exported; they are recomputed (ADR-008) or belong to the
    install. `schemaVersion` is the backup layout version, independent of the database schema
    version; bumping it needs a new ADR and a reader for the old versions.
  - **Validation before writing:** `parseBackup(text, ALL_NODES)` checks everything first: JSON
    syntax, header (an overlay file gets its own hint), a newer `schemaVersion` is refused with
    "update the app", unknown or missing fields, types and enums with a path (e.g.
    `sessions[2].sets[0].metric`), unique ids and set indexes, the overlay (field checks and
    `applyOverlay`) and that goals exist in the merged tree. Hand-written readers in the style of
    `progressionFormat.ts` (no schema library such as zod: none is in the project and the checks are
    small). History on nodes that are not in the tree is kept (the engine ignores it, like hidden
    nodes).
  - **Import = replace, never merge or partial:** `importBackup(text)` → validate (issues → nothing
    written) → serialize the current data as a **safety copy** and write it to
    `documents/backups/skillforge-before-import-<UTC>.json` (if that write fails, the import stops
    before any change) → `replaceUserData` deletes all user tables and inserts the backup in ONE
    transaction → `loadAll`. The result returns the safety copy (text and location) so the UI can
    offer "undo" by importing it. Merge is not offered (conflicting ids and histories; YAGNI).
  - **Files:** `src/store/backupFiles.ts` is the only module with file I/O: expo-file-system
    (`File`/`Directory`/`Paths`), expo-sharing (share sheet for export) and expo-document-picker
    (pick any file type, because Android providers often mislabel JSON; the parser rejects the
    rest). The store gets it as the `files` dependency (`BackupFiles`), so tests use a fake. Store
    actions: `exportBackup`, `importBackup`, `shareBackup`, `importBackupFromFile`, `saveOverlay`.
- Consequences: Three Expo modules added (all in Expo Go, MIT). Safety copies accumulate in the
  app's documents folder; a later task can list or prune them in Settings (4.6). A backup can only
  be imported by an app that has every node its goals point at; history on unknown nodes survives
  but earns nothing until the node is back. The Settings buttons come with Phase 4.6.

## ADR-029: Lockfile guard with a pinned npm version
- Date: 2026-09-27 · Status: Accepted
- Context: Repeatedly, `npx expo install` / `npm install` on the Windows dev machine wrote a
  package-lock.json without the optional peer entries `node_modules/@emnapi/core` and
  `node_modules/@emnapi/runtime` (peers of `@napi-rs/wasm-runtime`, via
  `@unrs/resolver-binding-wasm32-wasi`), and CI's `npm ci` then failed with "Missing: … from lock
  file". Earlier notes blamed Windows. Reproduced on 2026-09-27: local npm **11.6.2** drops the
  entries on a plain `npm install` and its own `npm ci --dry-run` still passes (also with
  `--os=linux --cpu=x64`); CI's npm **11.19.0** (Node 24.21 on ubuntu) rejects the same lockfile,
  and on the same Windows machine `npx npm@11.19.0 ci --dry-run` rejects it too, while
  `npx npm@11.19.0 install --package-lock-only` restores the entries. The cause is npm version
  skew, not the OS.
- Decision:
  - Pin the npm version once, in `package.json` `devEngines.packageManager` (`11.19.0`,
    `onFail: "warn"`, so a different local npm prints `EBADDEVENGINES` but still works).
  - `scripts/lockfile.ts` (plain Node with type stripping, built-ins only) runs that npm through
    `npx npm@<pin>`: `lockfile:fix` = `install --package-lock-only --ignore-scripts`, then the check;
    `lockfile:check` = `ci --dry-run --ignore-scripts` on a temp copy of package.json +
    package-lock.json (+ .npmrc), so it is independent of `node_modules` and takes seconds.
  - CI installs the pinned npm before anything else and runs `lockfile:check` before `npm ci`, so
    local fix, local check and CI all use one npm version and a future npm bump in the runner image
    can't reintroduce the mismatch. AGENT.md §3 step 5 requires `lockfile:fix` after dependency
    changes.
  - Rejected: hand-patching entries (fragile, done three times), `npm install` in CI (hides real
    drift), a jq check for specific package names (only catches this one symptom).
- Consequences: The first `lockfile:*` run downloads npm 11.19.0 into the npx cache. The lockfile
  written by 11.19.0 also normalizes some `peer`/`dev` flags. Bumping npm means changing the pin,
  running `lockfile:fix` and committing both files; CI follows automatically.

## ADR-030: Design system: pixel-art × dark fantasy, OFL pixel fonts, grid-defined icons (PLAN 4.0)
- Date: 2026-09-27 · Status: Accepted
- Context: Phase 4 builds every screen. Without one visual language each screen would invent its own
  colors and widgets. The user chose the direction: "a mix of pixel-art and fantasy RPG". The app
  must stay legible on a phone (body text contrast, touch targets, screen readers) and must not need
  an artist for icons.
- Decision:
  - **Look:** retro 16-bit JRPG menus on a dark grimoire: night/stone surfaces, gold and parchment
    accents, rune colors; panels with two-step notched corners, 2 dp ink + accent frame lines and a
    hard 4 dp shadow; no blur, gradients or rounded corners. Documented in `docs/DESIGN.md`.
  - **Tokens only in `src/components/theme.ts`:** `Palette` → semantic `Colors`, `TierColors`,
    `AttributeColors`, `FontFamily`, `TypeScale`, `PIXEL` (2 dp), `Spacing`, `Border`, `Frames`,
    `ButtonStyles`, `Motion`, `TOUCH_TARGET`. Text/fill pairs are pinned at ≥ 4.5:1 (bars ≥ 3:1) by
    `theme.test.ts` using `src/lib/contrast.ts`.
  - **Fonts (all SIL OFL, `@expo-google-fonts`):** Pixelify Sans Bold/SemiBold for titles, headings
    and buttons; Silkscreen for tiny caps tags; **Alegreya Sans** for body text, because pixel fonts
    tire the eye in sentences and a humanist sans with calligraphic roots fits the grimoire. Press
    Start 2P was rejected (too wide, poor at body sizes). Only the five used weights are imported.
    `useFonts` runs in the root layout; `DataGate` keeps the native splash until fonts and the
    database are ready; a font error falls back to the system font instead of blocking.
  - **Icons:** 12×12 character grids in `src/components/ui/icons.ts` (roles `# + * o`, mapped to theme
    colors), parsed by `src/lib/pixelGrid.ts` into horizontal runs and drawn with `react-native-svg`
    rects (`PixelIcon`, optional single `tint`). No image assets, no icon font; the tab bar uses the
    same icons instead of expo-symbols. Tests check every grid's shape and colors.
  - **Frames without SVG:** `PixelFrame` stacks absolutely positioned Views (notched shape = union of
    three rects, `frameGeometry.ts`), so panels size to their content and stay cheap.
  - **Components** in `src/components/ui/` (Screen, PixelFrame, PixelText, PixelButton, PixelIcon,
    SegmentedBar, XPBar, StatBar, LevelBadge, TierChip, WarningBanner, PixelModal, EmptyState,
    LevelUpBurst). They take display values (fractions, levels, messages) as props and compute no
    game numbers. `WarningBanner` is controlled (`acknowledged` + `onAcknowledge`) and never blocks
    anything (ADR-023).
  - **Motion:** Reanimated with `Easing.steps` for sprite-like frames, ≤ 640 ms, and
    `useReducedMotion` everywhere (burst shows only its title, sheets don't slide).
  - **Dev Style Guide:** route `/styleguide`, linked from Settings only when `__DEV__`; a release
    build redirects to the tree. It is the living catalogue and a Maestro flow (`styleguide.yaml`).
  - **Component tests:** `@testing-library/react-native` 14 (with its `test-renderer` peer, React 19)
    in `*.test.tsx` next to the components; `jest.setup.ts` loads the Reanimated and Worklets JS
    mocks (the Reanimated mock gets a `useReducedMotion` stub).
- Consequences: New deps `react-native-svg` (Expo Go, MIT), three `@expo-google-fonts` packages
  (OFL fonts, MIT loaders), dev deps RNTL + test-renderer (MIT). Every Phase 4 screen builds from the
  kit and adds tokens to `theme.ts` (with a contrast test) instead of local styles. Silkscreen is
  all caps: `label` is for short tags only. `expo-symbols` is no longer imported (left installed).

## ADR-031: First-run onboarding: gated by a setting, saved step by step, assessment = Trial sessions (PLAN 4.1)
- Date: 2026-09-27 · Status: Accepted
- Context: A new user needs a hero name, equipment that matches their places, goals for the
  generator and, if they already train, a way to start further up the tree. ADR-023 says any node
  (straight-arm and locked ones included) can be tested out, with advisory warnings.
- Decision:
  - **Gate:** onboarding shows until the setting `onboarding_completed_at` (ms) exists
    (`settings` table, no migration; it travels with backups and an import restores it). The tabs
    layout and `/` redirect to `/onboarding` until then; the onboarding layout redirects to `/tree`
    once the store's `completeOnboarding()` sets it. A missing hero name alone does not re-open it.
  - **Steps and routes:** `app/onboarding/` stack: `index` (welcome + "Name your hero", required,
    `normalizeHeroName`, ≤ 24 characters) → `equipment` (toggle the seeded Home/Park tags, add or
    remove profiles; the last one can't be removed) → `goals` (browse by branch, tier + OG level,
    1–5 goals via `toggleGoal`; "Later" skips) → `assessment` (optional) → `trial/[nodeId]` →
    `summary` ("Your journey begins", Begin). Every step writes through store actions immediately,
    so Back (button or Android back) shows what is saved and a restart resumes with the data kept.
  - **Assessment anchors:** the goals plus all their transitive hard prerequisites, sorted by
    ogLevel, and up to 6 picked evenly from easiest to hardest (`assessmentAnchors`); independent of
    progress so the list does not jump. Any other node is reachable through a name/id search.
  - **Test-out = a logged Trial session:** "I can already do this" opens the Trial with one stepper
    per set (prefilled with the standard, steps from `PROGRESSION_STEP`); `logTrial` stores it as an
    ordinary session of `isTrial` sets (`trialSession`), so recompute, XP and unlocks need nothing
    new. Below the standard it just counts as training. Each test-out is its own session.
  - **Warnings (ADR-023):** before the attempt the screen shows `testOutWarnings` (unmet
    prerequisites, straight-arm Trial clock, 48 h straight-arm rest; the Trial itself is budget
    exempt, ADR-025) as `WarningBanner`s; "Log Trial" is enabled once each is acknowledged. Nothing
    is blocked beyond that acknowledge step. A second straight-arm test-out right after a first one
    therefore shows the 48 h rest warning, which is correct for the tendons.
- Consequences: New pure modules `src/domain/onboarding.ts`, `assessment.ts`, `format.ts`,
  `branch.ts` (+ `characterLevelProgress`, `EQUIPMENT_TAG_LABELS`, `toggleEquipmentTag`), store
  actions `setHeroName`, `toggleGoal`, `logTrial`, `testOutWarnings`, `completeOnboarding`, and kit
  components `PixelTextInput`, `PixelChip`, `NumberStepper` plus `NodeRow` and
  `OnboardingScaffold`. Settings (4.6) should offer "Replay onboarding" by clearing the setting if
  the user asks for it (not built). Maestro flows finish onboarding first (`subflows/`).

## ADR-032: Pixel 8 Pro API 35 emulator with host GPU as the default E2E device
- Date: 2026-09-27 · Status: Accepted
- Numbering: ADR-031 is reserved by the onboarding PR #15, which was open when this was written.
- Context:
  - E2E runs were very slow. Emulator 32.1.15 (2023) hung in GPU mode on this AMD + WHPX machine, so
    ADR-022's runbook used `swiftshader_indirect` software rendering. That meant about a 2-minute first
    bundle and "System UI isn't responding" dialogs, which made every Phase 4 PR slow to verify.
  - The user's phone is a Pixel 8 Pro and they asked for a newer, better emulator.
- Decision:
  - Update to Android Emulator 37.1.11, platform-tools 37.0.1 and the API 35 Google APIs x86_64 image.
  - Create the AVD `Pixel_8_Pro_API_35` (device profile `pixel_8_pro`, 1344×2992, 4 GB RAM,
    `hw.gpu.mode=host`) and make it the default for E2E runs and screenshots.
  - Keep `Pixel_6_Pro_API_34` + swiftshader only as a fallback.
  - Manage the SDK with cmdline-tools 19.0, because the 23.0 `android.exe` CLI crashes on Windows 10.
- Consequences:
  - Cold boot in about 80 s with hardware rendering and no ANR dialogs.
  - Screenshots now match the user's real device size.
  - A fresh AVD needs Expo Go installed once (see the CONTEXT.md runbook).

## ADR-033: Tree tab as one branch column, node detail as a stack screen (PLAN 4.2, 4.3)
- Date: 2026-09-27 · Status: Accepted
- Context: The Tree tab must show 89+ nodes as a skill tree with prerequisites, states and goals,
  stay fast on a phone, and lead to a node detail with the ADR-023 actions (set goal, attempt the
  Trial, "unlock anyway"). The graph view is Phase 5.1, so 4.2 is the column view.
- Decision:
  - **One branch at a time:** the 12 branches are horizontal pixel tabs (`BranchTabs`, shared with
    the onboarding goal picker); the chosen branch is a `FlatList` of memoized `NodeTile`s in
    `chainOrder`. It opens on the first goal's branch (`defaultBranch`), else Horizontal push.
  - **Prerequisites in a column:** when a node has a hard prerequisite on the node right above it,
    the column draws a pixel chain between the two tiles (gold once met, steel before). Every other
    hard prerequisite (another branch, or further up the column) is a small linked chip (✓/✗ +
    name, 48 dp hit area) that opens that node. Recommended prerequisites appear only in the detail.
  - **Tile states** (`TileState` = the engine's `NodeState` + `legendary`): locked tiles sink into
    the night background with a lock and muted text; available ones glow (rune double line); training
    ones are raised with "LV n" and a segmented XP bar; proficient ones are gold-framed with a shield;
    mastered ones bright gold with a star; a locked `legendary` node is an ink silhouette with a
    flame. Goals get a gold "GOAL" star marker. A Legend sheet explains them. Frames are
    `TileFrames` in `theme.ts` (contrast-tested).
  - **Node detail** is a root stack route `app/node/[nodeId]` (so Train/Character can open it later),
    not a bottom sheet: it is long (header with level/XP, actions, prerequisites with alternatives and
    what met them, attributes, standards, cues, history of the last 5 sessions, review status and
    `verify:` note). "Attempt Trial" opens `app/node/[nodeId]/trial` (same `useTrialAttempt` hook and
    Trial parts as onboarding). "Unlock anyway" shows only for locked nodes and opens a sheet with
    `selfUnlockWarnings` (unmet prerequisites, `info`) to acknowledge before `selfUnlock`; afterwards
    the detail plays an "UNLOCKED!" burst and says the user unlocked it. Once the Trial is passed the
    button is replaced by "Trial passed on <date>" (the engine ignores later Trials on that node).
  - **View models are pure:** `src/domain/treeView.ts` (`branchColumn`, `treeTile`,
    `prerequisiteViews`, `branchSummary`, `defaultBranch`, `nodeHistory`, `nodeDetail`),
    `nodeLevelProgress` and `prerequisiteSatisfiedBy` in `progression.ts`, and the text in
    `format.ts` (`formatWorkingRange`, `formatLevelProgress`, `formatShortDate`). Screens call them in
    `useMemo` over store state (`state.nodes`, the overlay-applied tree).
- Consequences: Tiles are one accessible button each; the linked chips inside a tile are reachable
  by touch, while screen-reader users get the same prerequisites as links in the detail. The 5.1
  graph view can reuse `treeTile`/`prerequisiteViews` for its nodes and edges. A second route to the
  detail from Train/Character only needs `router.push('/node/<id>')`.

## ADR-034: Train flow: editable plan, persisted live-session draft, keyed warning acknowledgements (PLAN 4.4, 4.x)
- Date: 2026-09-28 · Status: Accepted
- Context: The Train tab must turn the generator's suggestion (ADR-024) into a session the user can
  change, log set by set without losing anything when Android kills the app, and end in a summary
  with XP, level-ups, unlocks and the ADR-023 warnings. History stays the source of truth (ADR-008):
  a half-done session must not count as training until it is finished.
- Decision:
  - **Screens:** Train tab (profile + 30/45/60 min, or "Resume session") → stack routes
    `app/train/preview` → `session` → `summary`. The live session is a pushed screen, so leaving it
    keeps the session (the tab offers to resume it); `app/index.tsx` opens `/train` while one exists.
  - **Plan edits (ADR-023):** swap an exercise for a trainable, doable node sharing its main
    pattern (alternatives first, then closest ogLevel), remove it, or add any doable node (search
    also finds locked ones). A swapped/added node is prescribed on its own by the generator's double
    progression (`prescribeExercise`); a swap keeps the slot's rest and pair. The card shows
    "Swapped from X" for user swaps and "Replaces X" for equipment substitutions.
  - **Live logging:** one stepper per set starting at the last result (else the target); "Log set"
    logs it as entered, "Partial" logs it below the target (as entered, or one step / one rep short
    when the entry meets it), "Failed" logs 0. Outcomes stay derived from actual vs. prescribed
    (`classifyOutcome`), so the engine needs no new field. Strength pairs alternate their sets. After
    each set a basic countdown from the exercise's `restSec` runs from a stored `restEndsAt` (full
    timers are a later feature); logging early is always possible.
  - **Persistence:** the whole `ActiveSession` is one JSON row in a new `active_session` table
    (additive migration 0002), rewritten after every change and validated when read back
    (`parseActiveSession`; unreadable = no session). It is a draft, not history: not exported, deleted
    by an import. Finishing inserts the session and deletes the draft in one transaction.
  - **Finishing:** exercises with at least one logged set get their missing planned sets as skipped
    sets (`actual.value` 0, the engine's convention for outcome and completion bonus); exercises
    never started are left out, so skipping one doesn't mark its pattern as trained or reset its
    progression. Finishing with no set logs nothing. Abandon throws the draft away (confirmed).
  - **Warnings:** the plan and the live session use the same `workoutWarnings` (generator) over the
    plan's planned sets or the live session's logged + remaining sets: unmet prerequisites,
    straight-arm Trial clock, budget and 48 h rest. They are acknowledged by key (`code` + `nodeId`)
    stored with the plan/draft, so edits that raise a new warning ask again while old answers stay.
    Acknowledging enables "Start session" / logging; the summary's warnings (`SessionResult`) are
    acknowledged before "Done". Nothing is blocked beyond that step.
- Consequences: an app kill loses at most the set being entered. The summary result is kept in
  memory only (after a restart the session is in history, just without the summary screen). The
  Character tab (4.5) reads the finished sessions from `state.sessions`.

## ADR-035: Character sheet and Settings: derived view model, pixel radar, in-memory undo of an import (PLAN 4.5, 4.6)
- Date: 2026-09-28 · Status: Accepted
- Context: The Character tab must show level, rank, the six attributes (open-ended point sums,
  ADR-023), the push/pull balance, streak, totals, goals and the history; Settings must manage
  equipment profiles and the ADR-028 backups with a clear "replaces all your data" step and an undo.
- Decision:
  - **One pure view model:** `characterSheet` (`src/domain/characterView.ts`) builds everything the
    tab shows from the tree, engine state, sessions, their results and the goals; the screen only
    renders it. The radar is normalised to the largest attribute (`radarAxes`), so it shows the
    balance, not an absolute scale; the exact points are in stat bars under it.
  - **Streak "now":** `activeStreak` shows the engine's streak only while the next session can
    still extend it (≤ 72 h since the last one), else 0. The clock is read when the tab gets focus.
  - **Goal progress** = proficient nodes on the goal's path (the goal and its transitive hard
    prerequisites, `goalPathNodes`) / path length; "next" is the easiest open path node that is not
    locked (else the easiest open one).
  - **Session results in the store:** `sessionResults` (by session id) is filled by `loadAll`'s
    recompute and kept current by every apply/recompute, so the history shows XP per session and a
    past session opens `app/session/[sessionId]` with the same panels as the Train summary
    (`SessionResultPanels`, no bursts, warnings as plain notes: they were acknowledged when logged).
  - **Pixel radar:** the hexagon grid, spokes, value area and its outline are rasterized into 6 dp
    cells (`src/lib/radar.ts`) and drawn as SVG rects, so the chart is real pixel art at any size;
    labels are Views around it; the whole chart is one accessible image with a spoken summary.
  - **Rank crest:** the rank's emblem (shield → sword → rune → star → flame) in a frame of its
    `RankColors` (steel, then the tier colors).
  - **Settings:** hero name, the equipment editor shared with onboarding
    (`EquipmentProfileEditor`) plus rename and a confirmed remove (the last profile can't be
    removed), backups, about/credits (`src/data/credits.ts`: sources and the three OFL fonts), and
    the dev-only Style Guide. No units or other preferences exist yet, so none are shown.
  - **Import:** a confirmation sheet says it replaces all data (and a session in progress) and that
    a safety copy is saved first; a rejected file shows at most `BACKUP_ISSUES_SHOWN` (5) readable
    issues plus "and n more" and changes nothing. **Undo last import** re-imports the safety copy
    (`undoLastImport`, which saves a safety copy of the imported data in turn). The copy to undo is
    kept in memory (`lastImport`) for the running app only: it can't live in the database, which the
    import replaces; the files stay in `documents/backups/`.
- Consequences: the undo button disappears after an app restart (backlog: pick a safety copy from
  `documents/backups/`). A radar with one trained attribute is a line; the markers and bars carry
  it. `PlaceholderScreen` is gone (no placeholder tabs left).

## ADR-036: In-app node editor on the overlay, straight-arm rule for overlays, merge-on-import (PLAN 4.7, 4.8)
- Date: 2026-09-28 · Status: Accepted
- Context: Users can change the tree in the app (standards, prerequisites, equipment, cues, trained
  attributes), add their own exercises, hide built-in ones, and share their changes. The overlay
  (ADR-016) and `saveOverlay` (ADR-028) already existed; the PR #4 review left a backlog question:
  an overlay could set `straight_arm: false` on a built-in straight-arm node outside the three
  straight-arm branches (e.g. `german_hang`, `manna`, the human flags) or move it to another branch,
  which would silently drop its ADR-010 tendon safeguards (AGENT.md §5).
- Decision:
  - **Straight-arm rule (the backlog item):** `applyOverlay` rejects an edit that clears
    `straightArm` on a built-in straight-arm node or changes its `branch`
    (`straightArmEditIssues`). It is a validation issue like a cycle, so such an overlay is never
    saved or imported. Making a non-straight-arm node straight-arm, or a user node straight-arm, stays
    allowed; user nodes in the straight-arm branches must be straight-arm (validator), and a new user
    node is straight-arm when the node above it is. The safeguards themselves stay advisory (ADR-023).
  - **Draft model:** the editor edits a whole `ExerciseNode` draft through pure functions
    (`src/domain/nodeEditor.ts`). A built-in draft starts from the built-in node plus the user's edit
    (not the hidden-node rerouting of the merged tree, so hiding a node never leaks into another
    node's edit). Saving stores only the fields that differ from the built-in node
    (`nodeEditFor`); an edit equal to the default removes itself. User nodes are stored whole.
  - **Live validation:** every change runs `applyOverlay` on the overlay with the draft
    (`nodeDraftIssues`); issues show inline in the section they are about (`issueSection` maps the
    validator's wording to name / position / standards / prerequisites / equipment / trains / other)
    and Save stays disabled while there are any. The store's `saveOverlay` still refuses a broken tree.
    These are data-integrity errors, not safeguards, so disabling Save doesn't conflict with ADR-023.
  - **What is editable:** built-in nodes: working range, Trial (sets, target, reps), prerequisites
    (node, required/recommended, level), equipment options, cues, trained attributes (Auto = derived
    from patterns). User nodes also: name, metric (resets the standards to `DEFAULT_STANDARDS`),
    position ("comes after", `chainOrder` between the neighbours, OG level clamped between theirs),
    OG level and the straight-arm flag. Patterns, skill flag and equipment defaults come from the node
    above. Not editable: ids (a new node's id is `user_` + its name, made unique, fixed on save),
    patterns, alternatives, regressions, sources.
  - **Custom exercises start without prerequisites**; the user picks them (the flow and tests add
    one explicitly). Hide is for built-in nodes (their dependents inherit their prerequisites, their
    history counts again when shown); user nodes are deleted instead. "Reset to default" removes the
    node's edit and hidden flag. Goals on a hidden/deleted node are kept (ignored while it is gone).
  - **Badges:** added and edited nodes carry a "Custom" tag (arcane quill) on the tile and the
    detail header; `Frames.arcane` and the `quill` icon mark the user's own changes everywhere.
  - **Sharing (4.8):** "Share my progressions" writes `exportOverlay` YAML to
    `skillforge-progressions-<time>.yaml` and hands it to the share sheet as `text/plain` (chat and
    mail apps accept it). **Import merges** into the user's overlay instead of replacing it: the
    shared user nodes and edits win per node id, hidden lists are joined, everything else of the
    user's stays (`mergeOverlays`). The preview lists every entry (added / changed fields / hidden,
    "replaces yours") and the merged tree's issues; Import is offered only when there are none. Text
    comes from a paste field or the file picker. "Suggest to project" explains that the YAML goes
    into a GitHub issue or PR and links to `content/progressions/README.md`.
- Consequences: a user can't weaken a built-in straight-arm node's safeguards through the overlay;
  a stored overlay from before this rule that does so now fails `applyOverlay` and falls back to the
  built-in tree (`overlayIssues`, shown on My progressions). There is no undo for an import beyond
  resetting entries one by one (a backup export before importing is the safety net).

## ADR-037: Tree map as a second Tree-tab mode: own layered layout, lanes left to right, View-drawn edges (PLAN 5.1)
- Date: 2026-09-28 · Status: Accepted (refines ADR-003: no dagre)
- Context: ADR-003 wants the tree both as branch columns and as a pan/zoom graph ("dagre layout and
  SVG"). The graph must show all ~90 nodes with cross-branch prerequisites, reuse the column view's
  states (ADR-033), stay smooth on the Pixel 8 Pro emulator and keep the column view as the
  screen-reader path.
- Decision:
  - **Mode:** the Tree tab gets Columns | Map tabs; the choice is the `tree_view_mode` setting
    (`setTreeMode`, `parseTreeMode`, default Columns), so it survives restarts and travels with
    backups like `onboarding_completed_at`.
  - **Layout without dagre:** a small pure function (`mapLayout` in `src/domain/treeMap.ts`, tested)
    instead of a dependency. A node's layer is its longest chain of **hard** prerequisites (the same
    edges the column view chains and links; recommended ones stay in the detail). Layers run **left
    to right** (a tech tree) and each branch is a horizontal lane in `BRANCHES` order, with
    same-layer nodes of a branch stacked as rows in `chainOrder`. On a portrait phone that is ~10
    columns × ~25 rows instead of ~25 columns × 10 rows. Edges are orthogonal elbows that bend in
    the gap just before the target's layer, so vertical runs never cross a node; edges into one node
    are spread 8 dp apart. The layout depends only on `state.nodes` and is memoized on it; progress
    only restyles nodes and edges (`mapTiles` reuses `treeTile`).
  - **Drawing:** nodes are fixed-size `MapNode` buttons in the tile frames (`TileFrames`, same icons,
    labels and accessible text as `NodeTile` through shared `tileLook` helpers; a trained node shows
    "LV n", its state icon says the rest), a tier pip, a gold star for goals, the silhouette for a
    locked legendary node. Lanes are stone bands with a branch-colored rule and caps title
    (`BranchColors`, contrast-tested). Edges are square pixel lines: dull steel 2 dp when unmet,
    gold 4 dp on a 10 dp gold glow at 30 % once met. **Everything is plain Views, not one SVG:**
    react-native-svg on Android renders an `Svg` into a bitmap of its full size, and a map-sized SVG
    (~200 MB at 3.5× density) crashed Expo Go. Pixel icons stay small SVGs.
  - **Gestures:** react-native-gesture-handler Pan + Pinch (simultaneous) racing a double Tap, on a
    local `GestureHandlerRootView`; the camera is three Reanimated shared values applied as one
    transform (origin top-left) on the UI thread, so moving never re-renders React. The math is
    pure worklets in `src/lib/viewport.ts` (`zoomAround`, `clampPan`: the content edge can reach the
    middle of the screen, never further; `fitBox`). Zoom is 0.2–2× (at least what shows the whole
    map); double tap zooms 2× around the finger, or back out to 0.6× when already close. Node taps
    are ordinary `Pressable`s (a pan cancels them).
  - **Viewport:** the map opens on, and the gold Focus button returns to, the goals; without goals
    what can be trained now (available/training); else the roots (`mapFocus`). Focus fits them at
    0.6–1.2× so names stay readable; a box too big for 0.6× shows its top-left corner. Camera moves are a
    180 ms linear timing (not the stepped celebration motion) and instant with reduce motion.
  - **Accessibility:** the map has a "List" button labelled "Switch to list", zoom −/+ buttons for
    people who can't pinch, and every node is a labelled button; Columns stays the recommended
    screen-reader path. Map text scales up to 1.2× (fixed node size); the columns scale fully.
- Consequences: no new dependency. A tree with very long cross-branch chains gets wide, not tall.
  Long edges still pass behind nodes in a target's row when they span several layers; 5.2 could add
  channel routing. The map renders every node (~1.4k views for 89 nodes); if the tree grows a lot,
  cull off-screen nodes.

## ADR-038: Polish pass: one reveal vocabulary, tint knockout for icons, unsaved-changes sheet (PLAN 5.2)
- Date: 2026-09-28 · Status: Accepted (refines ADR-030, ADR-036)
- Context: after Phase 4 and 5.1 the celebration moments used hand-typed titles, the node detail
  had no level-up moment, a tinted `scroll` icon rendered as a solid block on gold buttons (so the
  Export button had lost its icon), and the progression editor silently dropped a changed draft on
  back (PR #20 notes). `npm run e2e` needed Maestro on PATH.
- Decision:
  - **Reveals:** every celebration is a `LevelUpBurst` with a title from `BURST_TITLES`; level-ups
    use the shared `useLevelUpKey(level)` (plays only for a rise seen while mounted). The node
    detail plays UNLOCKED! after "unlock anyway", else LEVEL UP! when its level rose while open
    (e.g. back from a Trial). The particle ring now bursts from the title's centre. Reduce motion
    still shows only the title.
  - **Icon tint:** `IconDef.knockout` lists fill roles that stay empty when an icon is tinted
    (`iconCellColor`); `scroll` and `shield` knock out their fill, so they keep outline and details
    on buttons, the tab bar and history rows. Untinted icons are unchanged.
  - **Unsaved changes:** `draftChanged(initial, draft)` (pure, structural via `lib/deepEqual`) marks
    the editor dirty; a `beforeRemove` listener stops back / Cancel / header back while dirty and
    opens a "Discard changes?" sheet (Keep editing = close, Discard changes = leave). Save and
    discard let the navigation through. A warning with a choice, never a block (ADR-023). An edit
    undone by hand counts as no change.
  - **E2E runner:** `npm run e2e` runs `scripts/e2e.ts` (plain Node): `MAESTRO_BIN`, then the default
    install, then PATH; sets `MAESTRO_CLI_NO_ANALYTICS=1`; extra args after `--` pick flows.
- Consequences: no new dependency. Haptics were not added (optional; backlog). The editor guard
  covers the edit and new screens (both use `NodeEditorBody`); an Android app kill still drops the
  draft (it lives in screen state).

## ADR-039: EAS build profiles with a local version source, and a local APK script without an Expo account (PLAN 5.3a)
- Date: 2026-09-28 · Status: Accepted (refines ADR-001)
- Context: ADR-001 planned installable APKs through EAS cloud builds, which need an Expo account
  login and a signing-key decision from the user. A local Gradle release build already worked
  (pre-release `v0.1.0-preview1`), but by hand: prebuild, `local.properties`, Gradle with an ABI
  list, and undoing prebuild's rewrite of the package.json `android`/`ios` scripts.
- Decision:
  - **`eas.json`** is committed now so 5.3b only has to log in: `development` (dev client, internal,
    APK), `preview` (internal, APK), `production` (app bundle). `cli.appVersionSource` is
    **`local`**: `expo.version` and `expo.android.versionCode` in `app.json` are the one source of
    the version, in git and readable by the local script; `remote` would keep the versionCode on
    EAS servers, which local builds can't read. No `autoIncrement` (it would rewrite app.json on
    every cloud build); bump `versionCode` by hand for each release.
  - **App version** `0.1.0` / versionCode `1`, matching the `v0.1.0-preview1` tag (app.json said
    1.0.0 before).
  - **`npm run build:apk`** (arm64-v8a, phones) and **`npm run build:apk:universal`** (+ x86_64,
    the emulator) run `scripts/buildApk.ts` via tsx: `expo prebuild --platform android
    --no-install --no-clean` with `CI=1`, restore package.json byte for byte and warn about any
    other tracked file prebuild touched, write `android/local.properties` from `ANDROID_HOME` /
    `ANDROID_SDK_ROOT` / Android Studio's default path, `gradlew assembleRelease
    -PreactNativeArchitectures=…`, copy the APK to the gitignored `builds/` as
    `SkillForge-<version>-vc<code>-<arm64|universal>-<commit>.apk` and print its SHA-256. The pure
    parts (arguments, ABIs, SDK path, file name, commands) are in `scripts/buildApkConfig.ts` with
    Jest tests. `--clean` recreates android/ (after plugin or native dependency changes),
    `--skip-prebuild` runs only Gradle.
  - **Signing:** release builds are signed with the React Native template's debug keystore. Fine
    for sideloading; not accepted by Play and not a stable identity. A release keystore (or EAS
    managed credentials) is 5.3b and a user decision; no keystore or secret is committed.
- Consequences: anyone with the Android SDK and JDK 17 can build an installable APK offline
  (~14 min cold, a few minutes incremental). An APK signed with the debug key can't be updated in
  place by a later release-key APK (uninstall first, which deletes the app's data; export a backup
  first). The `development` profile needs `expo-dev-client` installed before it is used (5.3b).
  No dependency added.

## ADR-041: Acrobatics branch: rolls, breakfalls and the cartwheel path; left out of the rank median (PLAN 5.5)
- Date: 2026-09-28 · Status: Accepted (amends ADR-018's rank rule; the number may need a renumber
  when rebasing past the timer ADR)
- Context: the user asked for "more skills like cartwheel and judo rolls, so mobility and their
  progression". Nothing in the tree covers ground tumbling or falling: `dynamic` holds bar and pole
  skills, `flexibility` holds joint prep, compression and the bridge. The decision to add a new
  branch rather than extend those two was made with the request. A new branch touches every
  `Record<Branch, …>` and the rank, which is the median over all branches (ADR-018).
- Decision:
  - **Branch** `acrobatics` ("Acrobatics"), appended to the end of `BRANCHES` so the order of the
    existing tabs, lanes and generated module stays the same. 13 nodes in
    `content/progressions/acrobatics.yaml`, all new snake_case ids; no existing id or node changed.
    Two interleaved chains (ogLevel must not drop as `order` rises): rolls and judo breakfalls
    (`tuck_rock` [0] → `back_breakfall` → `side_breakfall` → `forward_shoulder_roll` →
    `backward_shoulder_roll`; `tuck_rock` → `forward_roll` → `backward_roll`) and the cartwheel path
    (`bunny_hop_cartwheel` → `cartwheel` → `quarter_turn_cartwheel` → `round_off`; `cartwheel` →
    `one_handed_cartwheel`; both → `aerial_cartwheel`, legendary). Order and gates follow the Judo
    Canada breakfall guide, the NRG gymnastics teaching progressions and GMB tumbling
    (docs/research/progressions.md → B13).
  - **Cross-branch gates** link to existing nodes instead of duplicating them: `wall_plank` (hard)
    before the bunny-hop cartwheel, `wall_handstand` (hard) before the cartwheel and the round-off,
    `wrist_prep`, `hollow_hold` and `push_up` as recommended.
  - **Shape:** every node is `metric: reps`, `equipment: floor` (no mat tag exists; the cues ask
    for a soft surface), `skill: true`, `straight_arm: false`, with patterns `balance` + `mobility`
    (+ `explosive` for the round-off and the aerial). No new pattern or attribute: they train
    balance and mobility through `PATTERN_ATTRIBUTES`. These are not tendon-loading holds, so the
    ADR-010 safeguards do not apply; safety lives in the cues (chin in, head off the floor, slap at
    ~45°, learn the aerial with a coach on mats).
  - **Generator:** no code change. `skill: true` puts the nodes in the skill slots (fresh, early in
    the session, like handstands), never in strength, core or cool-down slots; `balance` and
    `mobility` are exempt from the 48 h pattern rest, which suits falls practised every session
    (Judo Canada). Without an acrobatics goal they compete for the first skill slot like any other
    skill; a goal puts its frontier there.
  - **Rank:** `RANK_BRANCHES` (every branch except `acrobatics`) replaces `BRANCHES` in the rank
    median. A 13th value of 0 for most people would lower the median of 12 (mean of the 6th and
    7th values) to the 6th value, so adding the branch could have dropped an existing user's rank.
    Acrobatics still pays into attributes and the radar.
  - **Color:** `BranchColors.acrobatics` = new `Palette.orchid` `#F28FD0` (a pink apart from blood,
    ember and amethyst), contrast-tested on `surface` and `background` like every lane.
  - **Standards:** OG2 has no tumbling chart and no source gives rep standards, so every ogLevel
    and trial is inferred and carries a `verify:` note (coach review, PLAN 1.10).
- Consequences: 102 nodes. The onboarding goal picker, the Tree tab and the tree map pick up the
  branch from `BRANCHES` (one more tab, one more lane). The dive roll (springboard and mats in the
  sources), mae ukemi, handsprings and flips are not modelled. If the rank should count acrobatics
  after all, that is a product decision and a one-line change to `RANK_BRANCHES`.
