# SkillForge

SkillForge is a gamified calisthenics progression tracker, built as an RPG-style skill tree.

Pick the skills you want to learn. The app generates workouts that train their prerequisites, you earn
XP for every session, your exercises level up, and harder progressions unlock as you go.

> Status: early development (Phase 0 scaffold). See [docs/PLAN.md](docs/PLAN.md).

## Getting started

You need Node.js 22 LTS or newer, npm, and the **Expo Go** app on an Android phone.

```bash
npm install
npx expo start
```

Scan the QR code in the terminal with Expo Go on Android. The phone and the computer must be on the
same network. If they aren't, run `npx expo start --tunnel`.

Checks (all must pass before committing, see [AGENT.md](AGENT.md)):

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint (eslint-config-expo + eslint-config-prettier)
npm test               # Jest (jest-expo preset)
npm run format         # Prettier: rewrite files (npm run format:check only checks)
```

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
