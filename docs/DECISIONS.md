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
