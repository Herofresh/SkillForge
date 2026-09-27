# SkillForge — Context & Lookup Reference

This is the quick reference for agents: architecture, glossary, formulas, commands.
Keep it current (see AGENT.md §4). Sections marked *(planned)* describe the approved design but haven't
been implemented yet.

## Architecture map *(planned, Phase 0.5)*

```
app/                    expo-router screens (UI only, no game logic)
  (tabs)/tree.tsx       skill tree: column view ⇄ graph view
  (tabs)/train.tsx      Train now → plan preview → live session → summary
  (tabs)/character.tsx  level, rank, attributes, history
  (tabs)/settings.tsx   equipment profiles, export/import
  onboarding/           first-run flow
src/
  domain/               PURE TS game rules. No React/Expo/DB imports (ADR-009)
    types.ts            single source of shared types
    xp.ts               XP calculation
    progression.ts      levels, Trials, node states, unlocks
    character.ts        character level, attributes, rank
    generator.ts        on-demand workout generator
    recompute.ts        rebuild progress from session_sets (ADR-008)
  data/
    skills/<branch>.ts  static progression matrix (single source of skill content)
    validate.ts         dataset integrity checks
  db/                   Drizzle schema, migrations, repositories
  components/           reusable UI components
  lib/                  generic helpers (dates, ids, math)
docs/                   PLAN, DECISIONS, CONTEXT, research
```

**Data flow:** UI → store action → domain function (pure) → repository persists `session_sets` → caches
(`node_progress`) updated → UI re-renders.

## Glossary

| Term | Meaning |
|---|---|
| **Node** | One exercise in the skill tree (e.g. `tuck_front_lever`). Static data in `src/data/skills/`. |
| **Branch** | A progression family, e.g. `planche` or `v_pull`. Nodes in a branch form a chain ordered by `chainOrder`. |
| **Prerequisite** | An edge from another node that must reach `minLevel`. `hard` edges lock the node; `recommended` edges only show a warning. |
| **ogLevel** | Cross-branch difficulty from 1 to 17, taken from the Overcoming Gravity 2 charts (ADR-007). |
| **Tier** | Beginner 1–5 · Intermediate 6–8 · Advanced 9–12 · Elite 13+ (derived from ogLevel). |
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
`floor`, `wall`, `bar` (pull-up bar), `dip_bars`, `parallettes`, `bands`, `rings`, `pole`.
- **Default profiles:** Home = floor, wall, bar, parallettes, bands. Park = Home + dip_bars.

## Commands *(available once Phase 0 is done)*

| Command | Purpose |
|---|---|
| `npm start` / `npx expo start` | Dev server. Scan the QR code with Expo Go on Android. |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests (domain and data) |

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
