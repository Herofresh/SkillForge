# SkillForge — Living Plan & Progress

> Agents: read [AGENT.md](../AGENT.md) first. Update this file at the end of every task.
> Status legend: `[ ]` todo · `[~]` in progress (owner) · `[x]` done (PR link)

## Current state
- Repo: https://github.com/Herofresh/SkillForge (public).
- Phase 0 is nearly done: docs (PR #1) and the Expo SDK 57 scaffold with tooling (tasks 0.2, 0.3,
  0.5). CI (0.4) is written but not pushed yet, see Blockers.
- The app has four placeholder tabs (Tree · Train · Character · Settings) on a dark theme. The
  Android bundle exports cleanly, but it hasn't been opened on a phone in Expo Go yet.
- There's no game logic, data or persistence yet.

## Next up
1. Phase 1.1: `src/domain/types.ts`.
2. Phase 1.2–1.4: the progression dataset in `src/data/skills/`.
3. Phase 1.5: `src/data/validate.ts` with tests.

## Blockers
- **0.4 CI can't be pushed by agents.** GitHub rejects pushes that add `.github/workflows/*` because
  the `gh`/git OAuth token has scopes `gist, read:org, repo` but not `workflow`. The workflow is
  committed on the local branch `chore/ci-workflow` and is also quoted in the scaffold PR description.
  **User action:** run `gh auth refresh -h github.com -s workflow` (browser login), then
  `git push -u origin chore/ci-workflow` and open a PR (or tell an agent to).

## Handoff notes
- Scaffold (tasks 0.2–0.5): routes are in root `app/` (not the template's `src/app/`, see ADR-014).
  Tooling choices are in ADR-013. Folder layout, alias and commands are in `docs/CONTEXT.md`.
- UI colors live only in `src/components/theme.ts`. Tab screens use `PlaceholderScreen`; replace them
  in Phase 4.
- `src/domain`, `src/data/skills` and `src/db` only contain `.gitkeep`. Delete it when you add the first
  real file.
- Add dependencies with `npx expo install <pkg>` so versions match SDK 57. `npx expo-doctor` passed
  21/21 checks at scaffold time.
- CI (`.github/workflows/ci.yml`, on branch `chore/ci-workflow` until the token blocker is fixed) runs
  on Node 22: npm ci, typecheck, lint, format:check, test. Until it lands, reviewers verify locally only.
- The approved design is summarized in this file and in `docs/DECISIONS.md` (ADR-001…014). The
  exercise research is in `docs/research/progressions.md`.
- `gh` is installed at `C:\Program Files\GitHub CLI\gh.exe` and logged in as `Herofresh`. If `gh`
  isn't on PATH in an old shell, use the full path.
- Local tooling: Node 24, npm 11, Java 17, jq. There's no Android SDK, so test with Expo Go on the phone.

---

## Roadmap

### Phase 0: Docs and scaffold
- [x] 0.1 Documentation set: AGENT.md, CLAUDE.md, PLAN.md, DECISIONS.md, CONTEXT.md, research doc ([PR #1](https://github.com/Herofresh/SkillForge/pull/1))
- [x] 0.2 `create-expo-app` (TypeScript, expo-router, tabs: Tree · Train · Character · Settings) (PR_LINK)
- [x] 0.3 TypeScript strict, ESLint, Prettier, Jest (`jest-expo`); scripts `typecheck`, `lint`, `test` (PR_LINK)
- [~] 0.4 GitHub Actions CI: typecheck, lint and test on every PR (blocked: needs `workflow` token scope, see Blockers; file ready on local branch `chore/ci-workflow`)
- [x] 0.5 Folder layout (`src/domain`, `src/data/skills`, `src/db`, `src/components`, `src/lib`) and README update (PR_LINK)

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
