# SkillForge

SkillForge is a gamified calisthenics progression tracker, built as an RPG-style skill tree.

Pick the skills you want to learn. The app generates workouts that train their prerequisites, you earn
XP for every session, your exercises level up, and harder progressions unlock as you go.

> Status: preview releases (currently v0.7.0) as APKs on GitHub; the first Google Play release
> (1.0.0) is being prepared (Phase 7). See [docs/PLAN.md](docs/PLAN.md).

## Install on your phone

SkillForge is Android only for now, and it isn't on the Play Store yet.

**Download a preview APK.**

1. Open the [Releases](https://github.com/Herofresh/SkillForge/releases) page on your phone and pick
   the newest release (e.g. `v0.7.0`).
2. Download the **arm64** APK. The **universal** APK also runs on the x86_64 Android emulator; it
   is bigger but works on phones too.
3. Open the file and allow "Install unknown apps" for your browser or file manager when Android asks.
   Play Protect may warn about an unknown developer, because preview builds are signed with a
   development key.

**Updating:** install the newer APK over the old one, without uninstalling. Your hero, sessions
and progress stay. Every preview so far uses the same key, and `npm run build:apk` refuses to
build with another one (ADR-043).

**Build it yourself.** You need Node.js 24 (≥ 22.18), JDK 17 and the Android SDK (Android Studio
installs it; set `ANDROID_HOME` if it isn't in the default location). No Expo account is needed.

```bash
npm install
npm run build:apk             # arm64 APK for phones (the first build takes ~15 min)
npm run build:apk:universal   # arm64 + x86_64, also runs on the emulator
```

The APK lands in `builds/` with its SHA-256 printed. Install it with `adb install -r <file>` or copy
it to the phone.

### Moving from a GitHub APK to Google Play

GitHub APKs are signed with a development key; the Play Store version is signed by Google. Android
only updates an app with the same signature, so the Play version can't update an installed GitHub
APK. Moving takes a reinstall:

1. **Export first.** In SkillForge open Settings → Export backup and save the file somewhere off
   the app, e.g. Google Drive or the Files app. Uninstalling deletes the app's data from the phone.
2. Uninstall SkillForge.
3. Install SkillForge from Google Play.
4. Open Settings → Import backup and pick the file. Your hero, sessions, goals, equipment and your
   own progressions come back; levels and unlocks are worked out again from the history.

The same goes the other way: GitHub pre-release APKs are for sideloading only and won't update a
Play install either. A backup from any earlier release imports into the current app.

## Getting started

You need Node.js 24 (≥ 22.18), npm, and the **Expo Go** app on an Android phone.

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
| [docs/DESIGN.md](docs/DESIGN.md) | Visual language and UI kit (pixel art × dark fantasy) |
| [docs/research/progressions.md](docs/research/progressions.md) | Calisthenics progression research and sources |

## Stack
Expo (React Native + TypeScript), Android first, with data stored locally in SQLite.
