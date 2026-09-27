# SkillForge — Living Plan & Progress

> Agents: read [AGENT.md](../AGENT.md) first. Update this file at the end of every task.
> Status legend: `[ ]` todo · `[~]` in progress (owner) · `[x]` done (PR link)

## Current state
- Repo created: https://github.com/Herofresh/SkillForge (public). Branch `main` has the initial README.
- Phase 0 is in progress: the documentation set has been written. The Expo scaffold hasn't been started yet.
- No app code exists yet.

## Next up
1. Phase 0: scaffold the Expo app (see task 0.2).
2. Phase 0: tooling and CI (tasks 0.3–0.4).
3. Phase 1: domain types and the progression dataset.

## Blockers
- None.

## Handoff notes
- The approved design is summarized in this file and in `docs/DECISIONS.md` (ADR-001…011). The
  exercise research is in `docs/research/progressions.md`.
- `gh` is installed at `C:\Program Files\GitHub CLI\gh.exe` and logged in as `Herofresh`. If `gh`
  isn't on PATH in an old shell, use the full path.
- Local tooling: Node 24, npm 11, Java 17, jq. There's no Android SDK, so test with Expo Go on the phone.

---

## Roadmap

### Phase 0: Docs and scaffold
- [~] 0.1 Documentation set: AGENT.md, CLAUDE.md, PLAN.md, DECISIONS.md, CONTEXT.md, research doc (owner: Claude)
- [ ] 0.2 `create-expo-app` (TypeScript, expo-router, tabs: Tree · Train · Character · Settings)
- [ ] 0.3 TypeScript strict, ESLint, Prettier, Jest (`jest-expo`); scripts `typecheck`, `lint`, `test`
- [ ] 0.4 GitHub Actions CI: typecheck, lint and test on every PR
- [ ] 0.5 Folder layout (`src/domain`, `src/data/skills`, `src/db`, `src/components`, `src/lib`) and README update

### Phase 1: Progression matrix
- [ ] 1.1 `src/domain/types.ts`: `ExerciseNode`, `Branch`, `Metric`, `Prerequisite`, `Trial`, `EquipmentTag`
- [ ] 1.2 Dataset, about 80 nodes across 12 branches (OG levels 1–8, plus elite "legendary" teasers)
- [ ] 1.3 Cross-branch prerequisites (muscle-up, front lever, planche, freestanding HS, flag, pistol)
- [ ] 1.4 Equipment tags and `alternatives` (Home: bar/parallettes/bands; Park: + dip bars)
- [ ] 1.5 `src/data/validate.ts` + tests: DAG/no cycles, IDs resolve, ogLevel monotonic per chain, equipment present
- [ ] 1.6 Verify the inferred (`~`) OG2 levels against the OG2 Google Sheet

### Phase 2: Game engine (`src/domain/`, pure TS, with tests)
- [ ] 2.1 `xp.ts`: unit normalization (1 rep = 2 s hold = 3 s eccentric), difficulty and outcome multipliers, bonuses
- [ ] 2.2 `progression.ts`: levels 1–10, level-5 cap and Trial, banked XP, node states, unlock resolution
- [ ] 2.3 Tendon safeguards (ADR-010): min weeks at level, 60 s straight-arm budget, 48 h rule
- [ ] 2.4 `character.ts`: character level, attributes, rank title, push/pull balance warning
- [ ] 2.5 `generator.ts`: frontier, scoring, equipment substitution, slot filling, double-progression prescription
- [ ] 2.6 Recompute-from-history function (ADR-008)

### Phase 3: Persistence
- [ ] 3.1 Drizzle schema and migrations (profile, goals, node_progress, equipment_profiles, sessions, session_sets, settings)
- [ ] 3.2 Repositories plus the Zustand stores that wire the domain to the database
- [ ] 3.3 JSON export/import with validation

### Phase 4: Core UI
- [ ] 4.1 Onboarding: hero name, equipment profiles, goal picking, optional assessment Trials
- [ ] 4.2 Tree tab, column view
- [ ] 4.3 Node detail: cues, level/XP, prerequisites ✓/✗, set goal, attempt Trial, history
- [ ] 4.4 Train flow: Train now → profile and time → plan preview (swap/remove) → live logging → summary with XP, level-ups and unlocks
- [ ] 4.5 Character tab: level, rank, attribute radar, streak, recent sessions
- [ ] 4.6 Settings: equipment profiles, export/import

### Phase 5: Graph view and release
- [ ] 5.1 Graph view: dagre layout, SVG, pan/zoom, glowing unlocked edges, legendary silhouettes
- [ ] 5.2 Animations and polish (level-up and unlock reveal)
- [ ] 5.3 EAS build profile and Android APK

### Later / Backlog
- Hold stopwatch and rest timer (rest durations are already stored in the prescription)
- Weekly plans and scheduling
- Notifications and reminders
- More content: advanced/elite nodes, full flexibility branch
- Optional cloud sync
