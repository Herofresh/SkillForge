# SkillForge

SkillForge is a gamified calisthenics progression tracker, built as an RPG-style skill tree.

Pick the skills you want to learn. The app generates workouts that train their prerequisites, you earn
XP for every session, your exercises level up, and harder progressions unlock as you go.

> Status: planning / scaffolding. See [docs/PLAN.md](docs/PLAN.md).

## Docs

| File | Purpose |
|---|---|
| [AGENT.md](AGENT.md) | Rules and workflow for AI agents and contributors. **Read first.** |
| [docs/PLAN.md](docs/PLAN.md) | Living roadmap, current progress and handoff notes |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture and product decision log (ADRs) |
| [docs/CONTEXT.md](docs/CONTEXT.md) | Architecture map, glossary, formulas, commands |
| [docs/research/progressions.md](docs/research/progressions.md) | Calisthenics progression research and sources |

## Stack
Expo (React Native + TypeScript), Android first, with data stored locally in SQLite.
