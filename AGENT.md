# AGENT.md — read this first

This file is for every AI agent (and human) working on SkillForge. Read it fully before touching code.

SkillForge is a gamified calisthenics progression app. It's built as an RPG skill tree of bodyweight
exercise progressions, with XP, levels, unlocks and on-demand generated workouts.
It uses Expo (React Native + TypeScript), runs on Android first, and stores data locally in SQLite.

## 1. Reading order

1. **`AGENT.md`**: rules and workflow.
2. **[`docs/PLAN.md`](docs/PLAN.md)**: what's done, what's in progress, what's next, and the handoff notes.
3. **[`docs/CONTEXT.md`](docs/CONTEXT.md)**: architecture map, glossary, formulas, commands.
4. **[`docs/DECISIONS.md`](docs/DECISIONS.md)**: why things are the way they are. Read the entries
   relevant to your task.
5. **[`docs/research/progressions.md`](docs/research/progressions.md)**: exercise and progression
   source material. Read it when you touch skill data.

If these documents disagree with the code, the code is the truth. Fix the document in the same PR.

## 2. Principles

- **DRY: one source of truth.**
  - Skill content lives only in `src/data/skills/`.
  - Game formulas (XP, levels, unlocks) live only in `src/domain/`.
  - Shared types live only in `src/domain/types.ts`.
  - Never copy a formula, constant or type into a UI component. Import it.
  - Before writing a helper, search `src/domain/` and `src/lib/` for one that already exists.
- **KISS / YAGNI.** Build what the current task needs, not what a future phase might need. Leave
  extension points only where `docs/PLAN.md` names a planned feature (timers, weekly plans, sync).
- **Separation of concerns.**
  - `src/domain/` is pure TypeScript: no React, React Native, Expo or database imports. It must be
    unit-testable in plain Node.
  - UI (`app/`, `src/components/`) renders and dispatches.
  - Persistence (`src/db/`) stores and loads.
- **Small, focused modules.** One responsibility per file. Prefer pure functions that take input and
  return output over classes with hidden state.
- **Derived state is recomputable.** Progress is derived from logged sets (`session_sets`). Caches
  such as `node_progress` must be rebuildable from history (see ADR-008).
- **Type safety.** Run TypeScript in `strict` mode. Don't use `any` without a comment explaining why.
  Validate external input (imports, backups) at the boundary.
- **Explicit over clever.** Use readable names and no magic numbers. Named constants go in the module
  that owns them.

## 3. Workflow

1. **Pick a task.**
   - Take the first unclaimed task under "Next up" in `docs/PLAN.md`, or the one you were assigned.
   - Mark it `in-progress (<agent/owner>)` in PLAN.md before you start.
2. **Branch.**
   - Name it `<type>/<short-slug>`, e.g. `feat/xp-engine`, `fix/unlock-rule`, `docs/adr-009`.
   - Never commit directly to `main`.
3. **Stay in scope.**
   - Do one task per branch and PR.
   - If you find something else that needs doing, add it to PLAN.md under "Backlog" instead of doing it.
   - If requirements are unclear or a decision belongs to the user, ask. Don't guess on product
     decisions.
4. **Test.**
   - Every change to `src/domain/` or `src/data/` needs unit tests.
   - Bug fixes get a regression test.
5. **Check before committing.**
   - Run `npm run typecheck && npm run lint && npm test`. All three must pass.
   - Don't skip hooks and don't disable failing tests to get green.
6. **Update the docs.** Do this in the same PR (see §4).
7. **Commit.**
   - Use Conventional Commits: `feat: …`, `fix: …`, `docs: …`, `chore: …`, `refactor: …`, `test: …`.
   - Keep each commit focused.
8. **Open a PR.**
   - Say what changed, why, how it was verified, and link the PLAN.md task.
   - Report failures honestly. If something is untested or skipped, say so.
9. **Hand the PR to a reviewer agent.** Never merge your own PR. See §4a.

## 4a. PR review and merge (agent-reviewed, not user-reviewed)

The user doesn't review every PR. Each PR is handed to a **fresh, independent reviewer agent**. That
agent didn't write the code and starts with no context from the author.

**The reviewer:**

1. **Reads the context.** It reads `AGENT.md`, the PR description, the linked PLAN.md task and the
   relevant ADRs.
2. **Checks out the branch and verifies it.**
   - `npm ci`, then `npm run typecheck && npm run lint && npm test` must all pass.
   - GitHub Actions CI must be green once it exists.
3. **Reviews the diff against:**
   - correctness and tests;
   - the §2 principles (DRY, the pure domain layer, no logic in components);
   - scope, meaning only the claimed task;
   - the docs, meaning PLAN.md, DECISIONS.md and CONTEXT.md are updated;
   - accuracy of content against `docs/research/`;
   - the safety rules in §5.
4. **Acts on the result.**
   - **If everything looks fine:** approve, **squash-merge**
     (`gh pr merge <n> --squash --delete-branch`), then update `docs/PLAN.md` on `main` if the merge
     changes the "Current state".
   - **If the problems are small and mechanical** (typos, a missing doc line, lint): the reviewer may
     push a fix commit to the branch, re-verify, then merge.
   - **If the problems are substantive:** don't merge. Leave a PR review with concrete, actionable
     findings. The PR then goes back to an implementing agent, and after the fix a new reviewer checks
     it again.
5. **Escalates to the user instead of merging** when:
   - a product decision is involved;
   - an ADR would be reversed;
   - a dependency with licence or security concerns is added;
   - the change deletes user data or migrations;
   - review has gone around more than twice without converging.

   To escalate, label the PR `needs-user` and write the reason in PLAN.md under "Blockers".

## 4. Documentation duty (non-negotiable)

At the end of every task:

- **`docs/PLAN.md`:**
  - Tick the task and add the PR link.
  - Update "Current state", "Next up" and "Blockers".
  - Write **Handoff notes** for the next agent: what's half-done, gotchas, where to continue.
- **`docs/DECISIONS.md`:**
  - Append an ADR for any non-trivial choice: a library, a data shape, a formula, a trade-off, or a
    change of direction.
  - Never rewrite old ADRs. To reverse one, add a new ADR and mark the old one `Superseded by ADR-NNN`.
- **`docs/CONTEXT.md`:** update it whenever you add or move folders, change formulas, add commands, or
  introduce a new concept that belongs in the glossary.

## 5. Conventions

- **Files:**
  - Components: `PascalCase.tsx`.
  - Everything else: `camelCase.ts`.
  - Tests: next to the code as `*.test.ts`.
- **IDs:** skill node IDs are `snake_case` and stable forever, e.g. `tuck_front_lever`. Renaming an ID
  breaks users' saved progress. If you must rename, add a migration.
- **Adding a skill node:**
  1. Add it to the correct `src/data/skills/<branch>.ts`.
  2. Set its prerequisites, `ogLevel`, `trial`, `equipment` and `sourceUrls`.
  3. Run the data validator tests.
  4. If the change is non-obvious, note it in `docs/research/progressions.md`.
- **Content accuracy:** exercise standards must trace back to a source. Don't invent thresholds.
  Mark uncertain values with a `// TODO(verify):` comment.
- **Safety:** straight-arm skills (planche, levers, cross) keep their tendon safeguards: the minimum
  time before a Trial opens and the per-session volume budget. Don't remove them to "make progress
  faster".

## 6. Handing over

A task is handed over when:

- the branch is pushed,
- PLAN.md shows its exact state, and
- the handoff notes let a fresh agent continue with nothing more than "read AGENT.md and continue".

Leave the tree in a state that builds and passes the tests. If that isn't possible, say so clearly
under "Blockers".
