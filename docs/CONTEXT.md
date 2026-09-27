# SkillForge — Context & Lookup Reference

This is the quick reference for agents: architecture, glossary, formulas, commands.
Keep it current (see AGENT.md §4). Sections marked *(planned)* describe the approved design but haven't
been implemented yet.

## Stack versions
Expo SDK 57 (`expo` 57.0.x), React Native 0.86, React 19.2, expo-router 57, TypeScript 6.0 (`strict`),
Jest 29 with `jest-expo`, ESLint 9 (flat config) with `eslint-config-expo`, and Prettier 3.

## Architecture map

What exists today: the root and tabs layouts, four placeholder tab screens,
`src/components/theme.ts`, `src/components/PlaceholderScreen.tsx`, `src/lib/clamp.ts`, and the
Phase 1 progression pipeline (`content/progressions/`, `scripts/`, `src/domain/types.ts`,
`tier.ts`, `overlay.ts`, `src/data/*`). Files marked *(planned)* don't exist yet. Empty folders hold a
`.gitkeep`.

```
app/                    expo-router screens (UI only, no game logic)
  _layout.tsx           root Stack + dark navigation theme
  index.tsx             redirects "/" to /tree
  (tabs)/_layout.tsx    bottom tabs: Tree · Train · Character · Settings
  (tabs)/tree.tsx       skill tree: column view ⇄ graph view
  (tabs)/train.tsx      Train now → plan preview → live session → summary
  (tabs)/character.tsx  level, rank, attributes, history
  (tabs)/settings.tsx   equipment profiles, export/import
  onboarding/           first-run flow
content/progressions/   SOURCE OF TRUTH for skill content (ADR-016)
  <branch>.yaml         one file per branch, one block per node (human-editable)
  README.md             field guide for coaches and contributors
scripts/
  progressions.ts       CLI behind npm run progressions:check|build|review (runs via tsx)
  progressionSources.ts Node-only file access shared by the CLI and the dataset test
src/
  domain/               PURE TS game rules. No React/Expo/DB imports (ADR-009)
    types.ts            single source of shared types (nodes, issues, overlay)
    tier.ts             tierForOgLevel (tier is derived, never stored)
    overlay.ts          user overlay: applyOverlay, exportOverlay, importOverlay
    xp.ts               XP calculation (planned)
    progression.ts      levels, Trials, node states, unlocks (planned)
    character.ts        character level, attributes, rank (planned)
    generator.ts        on-demand workout generator (planned)
    recompute.ts        rebuild progress from session_sets, ADR-008 (planned)
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
  db/                   Drizzle schema, migrations, repositories
  components/           reusable UI components
    theme.ts            UI colors, spacing, navigation theme (single source of UI colors)
    PlaceholderScreen.tsx  temporary tab body until Phase 4
  lib/                  generic helpers (dates, ids, math), e.g. clamp.ts
assets/                 app icon, adaptive icon, splash, favicon
docs/                   PLAN, DECISIONS, CONTEXT, research
  research/node-manifest.md  planned MVP nodes (ids, order, OG level, prerequisites)
  review/progression-matrix.md  GENERATED coach review sheet
.github/workflows/ci.yml  CI (Node 24): typecheck, lint, format:check, test, progressions:check
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

**Data flow:** UI → store action → domain function (pure) → repository persists `session_sets` → caches
(`node_progress`) updated → UI re-renders.

## Glossary

| Term | Meaning |
|---|---|
| **Node** | One exercise in the skill tree (e.g. `tuck_front_lever`). Authored in `content/progressions/<branch>.yaml`. |
| **Overlay** | The user's own changes on top of the built-in matrix: `added` (`user_` nodes), `edited` (partial overrides), `hidden` ids. Merged and validated by `applyOverlay` (ADR-016). |
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
| **Frontier** | The available or training nodes on the paths toward the user's goals. This is what the generator picks from. |
| **Equipment profile** | A named set of equipment tags, e.g. Home or Park, chosen at session start (ADR-005). |
| **Straight-arm budget** | About 60 s total of straight-arm holds per session (ADR-010). |
| **Legendary node** | An elite node shown as a locked silhouette, there for motivation. |

## Node states
`locked` → (all hard prerequisites met) → `available` → (first logged set) → `training` →
(level 5 and Trial passed) → `proficient` → (level 10) → `mastered`.

## Formulas *(planned, Phase 2; tune the constants in the owning module only)*

- **Set units:**
  - `reps` → reps
  - `hold_s` → seconds / 2
  - `eccentric_s` → seconds / 3
- **XP per set** = `units × difficultyMult(ogLevel) × outcomeMult`.
  - `difficultyMult` grows with ogLevel.
  - `outcomeMult`: success 1.0, partial 0.6, failed 0.3.
- **Session XP** = sum of set XP + a completion bonus + a streak bonus.
- **Node level:** levels 1–10 on a rising XP curve. There's a hard cap at level 5 until the Trial is
  passed, and XP beyond the cap is banked.
- **Character level** comes from total XP.
- **Attributes** (Push, Pull, Core, Legs, Balance, Mobility) come from the highest proficient ogLevel in
  each branch group.
- **Rank** comes from the median branch ogLevel.
- **Balance warning:** fires when push and pull attributes differ by more than 2.

## Generator summary *(planned, Phase 2.5)*

1. Build the frontier from the goals.
2. Score each node: goal-path weight + days since the pattern was trained (skip anything trained
   <48 h ago) + push/pull deficit + stagnation.
3. Substitute exercises for the chosen equipment profile.
4. Fill slots: warm-up, 1–2 skill, paired strength (pull + legs, push + hinge, row + push), core. Trim
   to the available time.
5. Prescribe with double progression. Rest is 90 s within a pair and about 3 min otherwise.

The generator is deterministic for the same inputs.

## Data model *(planned, Phase 3)*
- **Tables:**
  - `profile`
  - `goals(nodeId)`
  - `node_progress(nodeId, xp, level, state, proficientAt, trialPassedAt)`, a cache
  - `equipment_profiles(id, name, tags[])`
  - `sessions(id, startedAt, endedAt, profileId, outcome, xpEarned)`
  - `session_sets(sessionId, nodeId, setIndex, prescribed, actual, metric, isTrial)`, the source of truth
  - `settings`

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
| `npm test` | Jest (`jest-expo` preset). Tests live next to the code as `*.test.ts`. |
| `npm run format` / `npm run format:check` | Prettier write / check (config in `.prettierrc.json`) |
| `npm run progressions:check` | Validate `content/progressions/*.yaml` and report stale generated files. Writes nothing. |
| `npm run progressions:build` | Validate, then write `src/data/skills/progressions.generated.ts` and `docs/review/progression-matrix.md`. Run after every YAML edit. |
| `npm run progressions:review` | Validate, then write only the coach review sheet. |
| `npx expo-doctor` | Checks dependency versions and config against the SDK |
| `npx expo install <pkg>` | Add a dependency at the SDK-compatible version (prefer it over `npm install`) |

## Environment notes
- **OS:** Windows 10 with PowerShell 5.1 (no `&&`; use `; if ($?) {}`) and Git Bash.
- **GitHub CLI:** `C:\Program Files\GitHub CLI\gh.exe`, logged in as `Herofresh`.
- **Tooling:** Node 24, npm 11, Java 17, jq 1.8.
- **Android:** no Android SDK. Test with Expo Go and build APKs with EAS cloud.

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
- **Line endings:** `.gitattributes` forces LF. Git may warn "CRLF will be replaced by LF" once per file;
  that's expected.
