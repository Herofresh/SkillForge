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
