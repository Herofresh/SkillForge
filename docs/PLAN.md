# SkillForge — Living Plan & Progress

> Agents: read [AGENT.md](../AGENT.md) first. Update this file at the end of every task.
> Status legend: `[ ]` todo · `[~]` in progress (owner) · `[x]` done (PR link)

## Current state
- Repo: https://github.com/Herofresh/SkillForge (public).
- Phase 0 is done: docs (PR #1), the Expo SDK 57 scaffold with tooling (PR #2), and GitHub Actions
  CI (PR #3).
- The app has four tabs (Tree · Train · Character · Settings) on a dark theme. It runs
  in Expo Go on the emulator, and a Maestro smoke flow checks that every tab renders (task 0.6,
  ADR-022). The default E2E AVD is now `Pixel_8_Pro_API_35` with `-gpu host` (task 0.8, ADR-032).
- Phase 1 is merged ([PR #4](https://github.com/Herofresh/SkillForge/pull/4)) except 1.6 (OG verification) and 1.10 (coach review): shared
  types, the YAML progression format with build/check/review scripts, the validator, the user
  overlay and the full dataset of **89 nodes** in 12 branches (all `review.status: draft`, 52 with a
  `verify:` note). The coach review sheet `docs/review/progression-matrix.md` is generated and committed.
- Phase 2 game engine (2.1–2.4, 2.6) is merged ([PR #6](https://github.com/Herofresh/SkillForge/pull/6)): `xp.ts`,
  `progression.ts`, `safeguards.ts`, `character.ts`, `recompute.ts` in `src/domain/`, pure and
  tested. Formulas and constants are in `docs/CONTEXT.md` → Formulas and ADR-018…021.
- User autonomy (2.7, ADR-023, [PR #8](https://github.com/Herofresh/SkillForge/pull/8)): "the app suggests, the user decides". Test-out works on
  every node (straight-arm on day 1, locked nodes too), a user can self-unlock a locked node
  (`UserAction` in history), the ADR-010 tendon safeguards are advisory `SafeguardWarning`s
  instead of blocks, and every trained node pays into all the attributes it trains
  (`PATTERN_ATTRIBUTES` or the new YAML field `trains`, weighted by ogLevel and node level).
- Workout generator (2.5, ADR-024, [PR #9](https://github.com/Herofresh/SkillForge/pull/9)): `generateWorkout` in `src/domain/generator.ts`
  builds a `WorkoutPlan` from goals, progress, equipment, minutes and recent sessions (frontier,
  scoring, substitution, slots, double progression; suggestions respect the safeguards).
  **Phase 2 is complete.** No persistence or real UI yet.
- Trial-day exception (2.8, ADR-025, [PR #10](https://github.com/Herofresh/SkillForge/pull/10)): one straight-arm Trial's sets are exempt from the
  ~60 s budget, and the generator now suggests a due straight-arm Trial (e.g. tuck planche 3 × 30 s)
  as the session's only straight-arm work.
- Persistence core (3.1–3.2, ADR-026/027, [PR #11](https://github.com/Herofresh/SkillForge/pull/11)): expo-sqlite + Drizzle schema with bundled,
  additive migrations run on app start (`DataGate` loading / error screen), first-run seed of the
  Home and Park profiles, repositories in `src/db/` and the Zustand store in `src/store/`
  (`loadAll` → `recompute`, `logSession`, `selfUnlock`, goals, equipment CRUD,
  `generateWorkout`). Settings shows the stored profile names as the only UI proof.
- Stored overlay and backups (3.3–3.4, ADR-028, [PR #12](https://github.com/Herofresh/SkillForge/pull/12)): the user's overlay lives in
  `progression_overlay` and the store's tree is `applyOverlay(ALL_NODES, overlay).nodes` (used by
  recompute, logging and the generator); `saveOverlay` refuses a broken overlay. All user data
  exports to one JSON backup (`schemaVersion` 1) and imports with full validation first, a safety
  copy of the current data, and a one-transaction replace. Store actions are ready; the buttons come
  in 4.6. **Phase 3 is complete.**

- Design system (4.0, ADR-030, [PR #14](https://github.com/Herofresh/SkillForge/pull/14)): `docs/DESIGN.md` is the visual language (pixel-art × dark
  fantasy); tokens in `src/components/theme.ts`, the UI kit in `src/components/ui/`, fonts via
  `@expo-google-fonts` behind the splash, pixel icons from code grids, and a dev-only Style Guide
  (Settings → Style Guide). The four tabs are restyled placeholders. Screenshots in
  `docs/screenshots/4.0-*.png`.
- Onboarding (4.1, ADR-031, [PR #15](https://github.com/Herofresh/SkillForge/pull/15)): a fresh app opens a five-step first-run flow
  (`app/onboarding/`): hero name, equipment (Home/Park tags, add/remove), 1–5 goals by branch, an
  optional assessment (anchors on the goal paths + search → log a Trial → test-out, with the
  ADR-023 warnings acknowledged first), and "Your journey begins". Completion is the
  `onboarding_completed_at` setting; until then the tabs redirect to onboarding. Maestro
  `onboarding.yaml` covers it from a fresh install; smoke/styleguide finish it first. Screenshots in
  `docs/screenshots/4.1-*.png` (Pixel 8 Pro).
- Tree tab and node detail (4.2–4.3, ADR-033, [PR #17](https://github.com/Herofresh/SkillForge/pull/17)): the Tree tab shows one branch at a
  time (pixel branch tabs, opens on the first goal's branch) as a column of state-framed tiles
  (locked / ready glow / training XP bar / proficient gold / mastered star / legendary silhouette,
  goal markers) with pixel chains to the node above and linked chips for other prerequisites.
  Tapping a tile opens `app/node/[nodeId]`: level + XP (cap and banked XP), set/remove goal,
  Attempt Trial (`app/node/[nodeId]/trial`, warnings acknowledged first), Unlock anyway (sheet with
  the unmet-prerequisites note to acknowledge), prerequisites ✓/✗ with alternatives, attributes,
  standards, cues, history, review status. Maestro `tree.yaml`; screenshots
  `docs/screenshots/4.2-tree.png`, `4.3-*.png`.
- Train flow (4.4 + the session part of 4.x, ADR-034, [PR #18](https://github.com/Herofresh/SkillForge/pull/18)): the Train tab plans a session
  (equipment profile chips, 30/45/60 min) → `app/train/preview` (blocks with sets × target, rest,
  Trial / straight-arm / "Swapped from X" / equipment-substitution markers, pairs, notes, advisory
  warnings to acknowledge; swap, remove, add) → `app/train/session` (current exercise with a stepper
  and Log / Partial / Failed, rest countdown from the stored `restSec`, pair sets alternate, session
  list to jump, skip, add, finish/abandon with confirm) → `app/train/summary` (total XP and bonuses,
  outcome + XP per exercise, LEVEL UP! / UNLOCKED! bursts, streak, safeguard warnings acknowledged
  before Done). The live session is a draft in the new `active_session` table, saved after every
  change; the app reopens on the Train tab with "Resume session". Maestro `train.yaml` (includes
  the kill-and-resume check); screenshots `docs/screenshots/4.4-*.png`.
- Character tab and Settings (4.5–4.6, ADR-035, [PR #19](https://github.com/Herofresh/SkillForge/pull/19)): the Character tab shows the hero,
  level + XP bar, rank crest with the next rank's threshold, a pixel-art attribute radar (normalised
  to the largest attribute) with stat bars, the push/pull balance note, streak and totals, goals
  with their path progress and next step, and the last 10 sessions (tap → `app/session/[sessionId]`,
  the Train summary panels). Settings: hero name, equipment profiles (add, tags, rename, confirmed
  remove), export backup (share sheet), import with a "replaces all your data" confirmation, readable
  rejection issues, "Undo last import", about/credits, dev-only Style Guide. Maestro
  `character.yaml`, `settings.yaml`; screenshots `docs/screenshots/4.5-*.png`, `4.6-*.png`.
  **The four tabs are real now.**
- Node editor and shared progressions (4.7–4.8, ADR-036, [PR #20](https://github.com/Herofresh/SkillForge/pull/20)): the node detail's
  "Your tree" panel opens **Edit progression** (`app/node/[nodeId]/edit`: working range, Trial,
  prerequisites with required/recommended and level, equipment options, cues, trained attributes;
  a custom node also name, metric, position and difficulty), **Add exercise after this**, **Reset to
  default**, **Hide exercise** / **Delete exercise**; the Tree header has **Add exercise**
  (`app/progressions/new`). Every change is validated live with `applyOverlay` and the issues show
  inline per section; Save is off while any exist. Added/edited nodes carry a "Custom" tag. The
  backlog's overlay safety question is decided: overlays can't clear `straightArm` on a built-in
  straight-arm node or move it to another branch. Settings → **My progressions**
  (`app/progressions/`) lists every change (open / reset / show / delete), shares the overlay as
  YAML via the share sheet, imports a shared one (paste or file) with a preview and merge, and
  explains "Suggest to project" with a link to the contributor guide. Maestro `editor.yaml`;
  screenshots `docs/screenshots/4.7-*.png`, `4.8-*.png`. **Phase 4 is complete.**
- Tree map (5.1, ADR-037, [PR #21](https://github.com/Herofresh/SkillForge/pull/21)): the Tree tab has **Columns | Map** tabs (remembered in the
  `tree_view_mode` setting). Map shows the whole overlay-applied tree as a pan / pinch-zoom /
  double-tap graph: layers (longest hard-prerequisite chain) left to right, one stone lane per
  branch in its color, nodes in the column tiles' state frames (goal star, legendary silhouette,
  "LV n"), hard prerequisites as pixel lines that glow gold once met. Tap a node → its detail;
  Focus (goals, else what's trainable), − / +, and "List" (Switch to list). Maestro `map.yaml`;
  screenshots `docs/screenshots/5.1-*.png`.
- Polish (5.2, ADR-038, [PR #22](https://github.com/Herofresh/SkillForge/pull/22)): every celebration is a `LevelUpBurst` from `BURST_TITLES`
  (the node detail now plays LEVEL UP! when its level rose while open); tinted icons with a big
  fill keep their outline (`knockout`), so the Export backup button has its scroll icon again;
  leaving the progression editor with a changed draft asks "Discard changes?"; the Character
  tab's empty goals / sessions use `EmptyState`; `npm run e2e` finds Maestro itself
  (`scripts/e2e.ts`). Screenshot `docs/screenshots/5.2-*.png`.
- Build config (5.3a, ADR-039, [PR #23](https://github.com/Herofresh/SkillForge/pull/23)): a first preview APK is published as the GitHub
  pre-release `v0.1.0-preview1` (arm64 + universal, debug-signed). `eas.json` has the development /
  preview / production profiles (version source `local`, not used yet), app.json is version 0.1.0 /
  versionCode 1, and `npm run build:apk` (arm64) / `npm run build:apk:universal` (+ x86_64) build a
  release APK locally into `builds/` without an Expo account. README → "Install on your phone".
- Acrobatics branch (5.5, ADR-041, [PR #25](https://github.com/Herofresh/SkillForge/pull/25)): a 13th branch `acrobatics` with 13 nodes (rolls,
  judo breakfalls, cartwheel → round-off → legendary aerial), gated on the wall plank / wall
  handstand, all floor skill work training balance + mobility. **102 nodes.** It is left out of the
  rank median (`RANK_BRANCHES`) so no existing rank drops.
- App icon (5.6, ADR-042, [PR #24](https://github.com/Herofresh/SkillForge/pull/24)): an original pixel-art icon (a gold hero in a straddle
  handstand inside a rune ring on the night background) replaces the Expo template icons. It is a
  32 × 32 grid in `scripts/appIcon.ts`; `npm run icon:build` renders icon, adaptive foreground /
  background / monochrome, splash and favicon. Preview `docs/screenshots/5.6-app-icon.png`.
- Exercise timer (5.4, ADR-040, [PR #26](https://github.com/Herofresh/SkillForge/pull/26)): the live session's set logger has "Start hold"
  (3 s get-ready → countdown from the target → vibration → "+7 s" overtime; Stop fills the stepper
  with the seconds held) or "Start set" (stopwatch → Done). The timer is timestamps in the persisted
  draft (survives an app kill), ends the rest, and keeps the screen awake while it runs. Each timed
  set stores `durationSec` (column `session_sets.duration_sec`, migration 0003, additive; backups
  `schemaVersion` 2, version 1 still imports). Logged sets read "8 reps · 0:42"; the header shows the
  session clock; summary / past session show the session time and the time per exercise. Hold
  Trials have a timer per set.
- Release v0.2.0 (5.7, ADR-043, [PR #27](https://github.com/Herofresh/SkillForge/pull/27)): version 0.2.0 / versionCode 2, published ([release v0.2.0](https://github.com/Herofresh/SkillForge/releases/tag/v0.2.0)) as the
  GitHub pre-release `v0.2.0` (arm64 + universal). **Checked upgrade-safe** on the emulator: the
  v0.1.0-preview1 APK with seeded data (`.maestro/release/upgrade-seed.yaml`), then `adb install -r`
  of 0.2.0 → hero, goal, session and the 40 XP still there, no onboarding
  (`upgrade-verify.yaml`); screenshots `docs/screenshots/5.7-*.png` (also the launcher icon and
  the Acrobatics tab in the APK). `npm run build:apk` now fails unless the APK's signer is
  `RELEASE_SIGNER_SHA256` (the key every published APK uses).
- Timer extras (5.8, ADR-044, [PR #30](https://github.com/Herofresh/SkillForge/pull/30)): the set timer has Pause / Resume (stored in the draft
  as `pausedAt` / `pausedMs`, so a paused timer survives an app kill; the paused time is not
  measured), and the phone buzzes at "go" (one short), at the hold target (two long, as before) and
  when the rest countdown reaches zero (three short), only while the app is open.
- History links and replay onboarding (5.10, ADR-046, [PR #29](https://github.com/Herofresh/SkillForge/pull/29)): node detail history rows open
  the past session (onboarding Trials too); Settings → **Replay onboarding** (confirmed) runs the
  intro again from the current hero, equipment and goals without deleting anything; the first
  completion time is kept. Maestro `settings.yaml` extended.
- Live-session edits (5.9, ADR-045, [PR #31](https://github.com/Herofresh/SkillForge/pull/31)): tap a logged set's line to change it
  (stepper, Save / Partial / Failed against its own prescription, its time kept) or delete it
  (confirmed; later sets move up, `setIndex` stays dense). "Reorder" on the session list shows
  Up / Down per exercise; a strength pair moves as one. Pure functions in `train.ts`, the draft is
  saved after each change, old drafts load unchanged.
- Release v0.3.0 (5.11, [PR #32](https://github.com/Herofresh/SkillForge/pull/32), release [v0.3.0](https://github.com/Herofresh/SkillForge/releases/tag/v0.3.0)): timer extras (5.8), edit/delete sets + reorder (5.9), history
  links + replay onboarding (5.10), as the GitHub pre-release `v0.3.0` (arm64 + universal). No
  database or backup change since v0.2.0. Upgrade check (CONTEXT.md "Release upgrade check") passed
  on the emulator from the v0.2.0 APK **and** straight from the v0.1.0-preview1 APK: hero, goal,
  session and the 40 XP kept.
- Remove confirmation everywhere (5.12, [PR #34](https://github.com/Herofresh/SkillForge/pull/34)): the equipment step of onboarding now asks
  "Remove <name>?" like Settings; the dialog lives in `EquipmentProfileEditor`, so both use one.
- `build:apk` (5.13, ADR-043 update, [PR #35](https://github.com/Herofresh/SkillForge/pull/35)): the signer check runs on Gradle's APK before
  the copy, so a wrongly signed APK never lands in `builds/`; path and SHA-256 are printed only
  for an APK that passed.
- Readable numbers (6.1, ADR-048, [PR #37](https://github.com/Herofresh/SkillForge/pull/37)): the pixel font is now **Jersey 15** (titles,
  headings, buttons, header titles; sizes 36/28/21/23) instead of Pixelify Sans, whose 5 read as
  an S or an 8. Silkscreen and Alegreya Sans stay (their digits were already clear). The Style
  Guide has a **Digits** section (0–9 per variant); `fonts.test.ts` pins every role to a checked
  font. Screenshots `docs/screenshots/6.1-*.png`.
- Exercise descriptions (6.2, ADR-049, [PR #38](https://github.com/Herofresh/SkillForge/pull/38)): every node has a `description` (1–3 plain
  sentences, YAML key after `name`, required on built-in nodes, ≤ 300 characters; review sheet
  column). The node detail opens with an "About" panel; one `ExerciseInfoSheet` (description +
  cues) opens from the Tree tile's "i" or a long press, a long press on a map node, and the "i" on
  plan-preview cards and the live session's current exercise (no navigation in Train). The editor
  has a Description section; a user node needs one to be saved, but old overlays/backups without
  one still load (shown as "No description yet…"). Overlay layout version 2, backup
  `schemaVersion` 3 (older ones still read); no database change.
- Flexibility + mobility (6.3a, ADR-050, [PR #39](https://github.com/Herofresh/SkillForge/pull/39)): **125 nodes in 14 branches.** `flexibility`
  grew from 5 to 17 (yoga paths: pigeon → king pigeon "the dove", half split → front split,
  butterfly → frog → pancake → middle split, half lotus → lotus, full bridge → one-leg wheel). New
  branch `mobility` (11 nodes: CARs, ankle rocks, open book, wall angel, 90/90, deep squat hold,
  cossack squat, three-point bridge, overhead squat), appended to `BRANCHES`, lime lane, left out of
  the rank median (`NON_RANK_BRANCHES`). Only new ids; no data or database change. The
  `wall_handstand_push_up` and `elbow_lever` descriptions were reworded (6.2 review).
- Branch fill-ups (6.3b, ADR-051, [PR #40](https://github.com/Herofresh/SkillForge/pull/40)): **155 nodes**, every branch has 10–17. 30 new ids from
  the printed OG2 chart and the BWF Progressions chart (lever / planche variants and pulls, lever
  rows, planche push-ups, ring push-ups / dips / muscle-up / shoulder stand, one-arm push-up and
  row, L-sit pull-up, shrimp squats, nordic curl, elevated straddle press, chest-to-wall shoulder
  taps). No existing id, level or hard gate changed, so saved progress, unlocks and ranks carry
  over. `king_pigeon` repeats the pigeon pose's front-knee cue (6.3a review nit).

- Upgrade-safe overlays (6.3c, ADR-052): a content update can no longer invalidate a saved
  overlay. A user-placed node that shares its `order` with a (new) built-in node goes right after
  it in the merged tree; an og_level that drops next to a user-placed node is a warning (gold
  "Worth a look" note in the editor), not an error. Tested against every position a user could
  pick on v0.3.0.
- Exercise animations, part 1 (6.4a, ADR-053, [PR #42](https://github.com/Herofresh/SkillForge/pull/42)): a small looping pixel figure (side-view
  stick figure from joint angles, 32 × 32 grid, stepped 160 ms frames) on top of the node
  detail's About panel and the exercise info sheet (Tree and Train); reduce motion shows a still
  pose. All 10 v_pull nodes plus push-up, squat, freestanding handstand, front lever and full
  planche have their own; every other node shows its first pattern's generic animation. Dev Style
  Guide → Exercise animations; contact sheets and emulator screenshots `docs/screenshots/6.4a-*.png`.
- Rank ladder (6.7, ADR-054, [PR #47](https://github.com/Herofresh/SkillForge/pull/47)): tapping the rank crest opens a sheet with every rank
  (reached, yours, next, locked) and, per rank, how many branches are at its level; the next rank
  lists the branches still below. Screenshots `docs/screenshots/6.7-*.png`.
- Release v0.4.0 (6.5, [PR #48](https://github.com/Herofresh/SkillForge/pull/48)): version 0.4.0 / versionCode 4 with 6.1–6.4 and 6.7 (Jersey 15,
  descriptions, 155 nodes in 14 branches with mobility, upgrade-safe overlays, pixel animations,
  rank ladder). Upgrade check passed on the emulator from **v0.1.0-preview1, v0.2.0 and v0.3.0**:
  hero, goal, session, the 40 XP and a custom exercise placed after Tuck front lever (order 15, now
  shared with the built-in Tuck front lever raise) all kept, no onboarding. The seed/verify flows
  now cover the user overlay. Screenshots `docs/screenshots/6.5-*.png`. The GitHub release is
  created by the coordinator after the merge.
- Home-screen widget (6.6, ADR-055, [PR #49](https://github.com/Herofresh/SkillForge/pull/49)): an Android widget (react-native-android-widget,
  MIT) shows "Trained today" / "Not yet today", the streak, level, rank and top 3 attributes in
  the pixel look; a tap opens the Train tab (`skillforge://train`). The app writes a snapshot file
  after loadAll, on data changes and on foreground; the widget decides "today" and the streak at
  draw time (30-minute updates, so it flips ≤ 30 min after midnight). Only in release builds; Expo
  Go and Jest skip it. Screenshots `docs/screenshots/6.6-widget-*.png`. 6.6b (ADR-056): the
  layout scales with the widget's size (the 4 × 2 widget draws at 1.5) and the widget picker
  shows a pixel preview (`assets/images/widget-preview.png`).

- Release v0.5.0 (6.8, [PR #52](https://github.com/Herofresh/SkillForge/pull/52)): version 0.5.0 / versionCode 5 with the home-screen
  widget (6.6, 6.6b). Upgrade check passed on the emulator from **v0.1.0-preview1, v0.2.0,
  v0.3.0 and v0.4.0** (hero, goal, session, 40 XP and the custom exercise "Lever hold" kept, no
  onboarding); on the upgraded install the widget was added and showed the seeded data, and a
  tap opened Train. Screenshots `docs/screenshots/6.8-*.png`. The GitHub release is created by
  the coordinator after the merge.

- Hero classes (6.9, ADR-057, [PR #54](https://github.com/Herofresh/SkillForge/pull/54)): 15 cosmetic classes (Recruit, then Warrior, Ranger,
  Monk, Barbarian, Rogue, Druid, Paladin, Samurai, Templar, Bard, Cleric, Knight, Berserker,
  Sorcerer), each with three tiers of flat thresholds (attribute points, sessions or rank). The
  Character tab shows the worn class under the rank; it opens the class sheet (tiers, next
  requirement with progress, Wear, NEW tags). A session that reaches a tier plays CLASS UNLOCKED! /
  TIER UP! on the summary. Reached tiers are derived from history on every load (existing users
  see theirs at once) and kept forever in the `hero_classes` setting. The widget shows the title
  under the rank. Screenshots `docs/screenshots/6.9-*.png`.
- Weekly class challenge (6.9b, ADR-058, [PR #55](https://github.com/Herofresh/SkillForge/pull/55)): the worn class offers one optional
  challenge per local Monday–Sunday week (e.g. Ranger "Pull work in 2 sessions", Druid "3 mobility
  exercises", Berserker 3 sessions, Sorcerer "Attempt 1 Trial"; a little more at tier II / III).
  The first session of a week pins it (`class_challenges` setting), so switching classes can't
  farm; completing it pays a flat +50 XP once (`CLASS_CHALLENGE_BONUS_XP`, part of recompute) and
  a badge count. Straight-arm work never counts; the generator and safeguards are unchanged.
  Character tab card under the class banner, summary panel with CHALLENGE COMPLETE!, the
  challenge per class in the class sheet. Screenshots `docs/screenshots/6.9b-*.png`.
- Companion (6.10, ADR-059, [PR #56](https://github.com/Herofresh/SkillForge/pull/56)): the hero as a JRPG-style chibi sprite on the Character tab
  (own panel under the hero panel): four moods by calendar days since the last session (happy,
  content, waiting, sad; never worse, nothing is ever lost, a session cheers it up at once), a
  wave on a tap, the worn class's weapon (tier III upgraded), 46 accessories in five slots earned
  by flat rules (rank, level, class tiers, sessions, best streak, Trials) and kept forever in the
  `hero_companion` setting (existing users get theirs on the first start), a Customize sheet
  (slots, skin / hair / outfit, locked items with what earns them), NEW TRINKET! and the victory
  pose on the Train summary. Widgets: the existing one stays the small widget; a new large
  `SkillForgeCompanion` widget shows the companion in its mood with status, streak, level, rank and
  class. Contact sheets `docs/screenshots/6.10-*.png`.
- How it works (6.10c, ADR-060, [PR #57](https://github.com/Herofresh/SkillForge/pull/57)): `src/domain/guide.ts` has one entry per system (12:
  XP, skill levels and Trials, safeguards, attributes, ranks, streak, classes, weekly challenge,
  companion, generator, widgets, backups and data), a short summary and details, every number taken
  from the owning module's constants (a test fails on a number typed into the text). An "i"
  (`GuideButton`) next to each system opens the summary with "More in the guide"; Settings → "How
  SkillForge works" opens the guide list and each page. Optional only: nothing opens on its own.
  Screenshots `docs/screenshots/6.10c-*.png`.
- Release v0.6.0 (6.11, [PR #58](https://github.com/Herofresh/SkillForge/pull/58)): version 0.6.0 / versionCode 6 with classes (6.9), the weekly
  class challenge (6.9b), the companion and the large widget (6.10) and the guide (6.10c).
  Upgrade check passed on the emulator from **v0.1.0-preview1, v0.2.0, v0.3.0, v0.4.0 and
  v0.5.0** (hero, goal, session, 40 XP, "Lever hold" kept, no onboarding; the companion card,
  class banner and weekly challenge render from the old history). The small widget placed on
  0.5.0 kept working after the update (now with the class title); the new large companion widget
  was added and drew the sprite straight on the widget background. Screenshots
  `docs/screenshots/6.11-*.png`. The GitHub release is created by the coordinator after the
  merge. **Phase 6 is complete.**
- Companion cooler look (6.13, ADR-061, [PR #60](https://github.com/Herofresh/SkillForge/pull/60)): the companion is a taller, heroic JRPG
  field sprite (32 × 44, head ≈ ¼ of the height, determined face, more contrast, heroic poses)
  instead of a chibi, as a man or a woman (Customize → Body) with Spiky / Long / Ponytail hair;
  every accessory and weapon re-fitted, stored data unchanged (`look.body` / `look.hairStyle` are
  optional). Screenshots `docs/screenshots/6.13-*.png`.
- Widgets use their space (6.12, ADR-062, [PR #62](https://github.com/Herofresh/SkillForge/pull/62)): smaller defaults (small widget 4 × 1, at
  most two rows; companion widget 4 × 2, min 300 × 110 dp) and a pure layout engine
  (`src/widget/widgetLayout.ts`) that measures every size class (narrow, standard, wide, tall,
  grid) with the fonts' real widths at every scale and picks the one that fills the reported size,
  so content grows and reflows instead of leaving empty bands, nothing clipped. The companion
  sprite is trimmed to its painted pixels. Picker previews drawn from the same layout. Screenshots
  `docs/screenshots/6.12-*.png`.
- Release v0.7.0 (6.14, [PR #63](https://github.com/Herofresh/SkillForge/pull/63)): version 0.7.0 / versionCode 7 with the widgets that use
  their space (6.12) and the cooler companion with the Man / Woman body and hair styles (6.13).
  Upgrade check passed on the emulator from **v0.1.0-preview1, v0.2.0, v0.3.0, v0.4.0, v0.5.0 and
  v0.6.0** (hero, goal, session, 40 XP, "Lever hold" kept, no onboarding; the new sprite renders
  from the old history, Man by default). Both widgets placed on 0.6.0 at the old defaults (small
  4 × 2, companion 4 × 3) redrew after the update with the new layouts and sprite; fresh ones at
  the new defaults (4 × 1, 4 × 2) drew correctly; Woman + ponytail updated the Character tab and
  both companion widgets. Screenshots `docs/screenshots/6.14-*.png`. The GitHub release is
  created by the coordinator after the merge.
- Session length (6.15, ADR-063, [PR #65](https://github.com/Herofresh/SkillForge/pull/65)): Train offers **15, 20, 30, 45, 60, 75 and 90 min**. The generator
  plans at the user's **rest pace** (the median "rest taken ÷ rest prescribed" from the logged sets'
  timestamps over the last 5 sessions, 0.2–1.5; Trials and mobility not measured; no data change),
  so a user who skips rests gets a plan with that much more work in it, and **more time buys more
  work**: a cool-down, more sets (up to 5), then up to 4 extra exercises, within the straight-arm
  budget and the 48 h rules. The cool-down rests 30 s. Notes say when the plan uses the pace and
  when the tree can't fill the chosen time. Time model in `src/domain/sessionTime.ts`.
- Play hardening (7.0a, ADR-064, [PR #66](https://github.com/Herofresh/SkillForge/pull/66)): the manifest no longer asks for
  `SYSTEM_ALERT_WINDOW` / external storage; an unreadable stored overlay starts the app on the
  built-in tree with a note on My progressions instead of the "Could not open your data" dead
  end; a root error boundary ("Try again") and an unknown-route redirect; picked import files
  over 5 MB are refused before reading; a replayed onboarding has "Back to the app"; sheets
  scroll at large text; the widget task draws a fallback on errors; `eas.json` is gone; README
  refreshed. No data change.
- Play texts and data (7.0b, ADR-065, [PR #67](https://github.com/Herofresh/SkillForge/pull/67)): a health disclaimer (`HEALTH_DISCLAIMER`)
  on onboarding step 1, in About and in the guide; the UI says **"Tier 6"** instead of "OG 6"
  (internal names unchanged); "not affiliated" under the sources; node sources point at Steven
  Low's own OG2 PDF and the r/bodyweightfitness wiki instead of re-hosted copies; `verify:` research
  notes only in dev builds (their safety points moved into cues); Auto Backup stays on
  (`allowBackup: true` explicit) and the texts say Android's device backup may include the data;
  **Settings → Delete data** wipes everything (files, all user tables, the draft, the widget
  snapshot) in one transaction, re-seeds Home and Park and opens onboarding.
- Play App Bundle (7.1 + 7.2, ADR-066, [PR #68](https://github.com/Herofresh/SkillForge/pull/68)): the user's upload key lives outside the repo;
  `npm run build:aab` makes a bundle signed with it (clean prebuild, all four ABIs, native debug
  symbols, signer checked against `UPLOAD_SIGNER_SHA256`). `build:apk` keeps the debug key, so
  GitHub APKs still update over earlier ones. targetSdk 36 (React Native's default).
- Privacy policy (7.4, ADR-067, [PR #69](https://github.com/Herofresh/SkillForge/pull/69)): live at
  https://herofresh.github.io/SkillForge/privacy/ (developer "Anriar", contact
  skillforge.application@gmail.com), deployed from `site/`, linked in Settings → About.
- 1.0.0 prep + moving to Play (7.3, ADR-068, [PR #70](https://github.com/Herofresh/SkillForge/pull/70)): **the first Play upload is 1.0.0,
  versionCode 8** (continues from GitHub's 7). README "Moving from a GitHub APK to Google Play"
  (export → uninstall → install from Play → import) and one sentence in the guide and the Backup
  panel (`STORE_SWITCH_NOTE`). A backup written by every published release (v0.1.0-preview1 …
  v0.7.0, schemaVersion 1–3) imports into today's store (`src/store/releaseBackups.test.ts`).
  Fixes from the 2026-10-06 emulator check of 7.0a + 7.0b: the Overcoming Gravity credit says
  "Tier levels", and the Maestro flows no longer lose the app to `hideKeyboard` on onboarding.

## Next up
1. 7.5 with the user: the Play listing kit (texts, screenshots, feature graphic from the pixel
   assets) and the Play Console setup (content rating, Data safety from the privacy policy, app
   access, target audience).
2. The 1.0.0 bundle: `npm run build:aab` on the user's profile (the upload key lives only there)
   → `builds/SkillForge-1.0.0-vc8-<commit>.aab`, uploaded to the closed testing track.
3. 7.6 closed test: the user collects ≥ 12 testers for 14 days; collect feedback, fix, then apply
   for production (7.7).
4. On the user's phone (replaces the "install v0.7.0" item: 1.0.0 supersedes it): move to the Play
   1.0.0 as the README says (Export backup → uninstall → install from Play → Import backup),
   then check that the hero, history and own progressions came back, both widgets (placed again
   after the reinstall) and the Man / Woman choice, and report what feels off.
5. Open question for the user: whether GitHub also gets a 1.0.0 sideload APK (`build:apk`, debug
   key; it would update over v0.7.0 but never over a Play install), or GitHub releases stop at
   v0.7.0.
6. Phase 1.6: verify inferred OG2 levels; Phase 1.10: coach review of the sheet (needs the user to
   find a coach).

## Blockers
- None. The `gh` token now has the `workflow` scope, so agents can push `.github/workflows/*`.

## Handoff notes
- **1.0.0 prep + moving to Play (task 7.3, ADR-068, [PR #70](https://github.com/Herofresh/SkillForge/pull/70)):**
  - Version: `app.json` 1.0.0 / versionCode 8; `package.json` was already 1.0.0. No test pins the
    real app version. Not built here: the 1.0.0 bundle (`npm run build:aab`) is built by the
    coordinating session on the user's profile.
  - Texts: `STORE_SWITCH_NOTE` in `src/data/notices.ts` → guide `data` entry (`more`) and
    `BackupPanel` (second help line). README section "Moving from a GitHub APK to Google Play".
  - Release backups: `src/store/fixtures/backup-v0.1.0.json` (v0.1.0-preview1, schemaVersion 1),
    `backup-v0.2.0.json` (v0.2.0 and v0.3.0, 2), `backup-v0.4.0.json` (v0.4.0 and v0.5.0, 3),
    `backup-v0.6.0.json` (3 + `hero_classes` / `class_challenges` / `hero_companion`),
    `backup-v0.7.0.json` (3 + companion `look.body` / `hairStyle`). Each was written by the tag's
    own `serializeBackup` and setting serializers (the tag's `src/` extracted with `git archive`,
    run with `tsx --tsconfig <tag>/tsconfig.json` so `@/*` points at the tag's `src/*`), and the
    tag's own `parseBackup` read it back before it was saved. Releases with byte-identical output
    share a file. `src/store/releaseBackups.test.ts` imports each into today's store and checks
    hero, goals, profiles, sessions (durations from v2), the self-unlock, the overlay (user node
    description from v3, the edit), XP, tree mode, onboarding, classes / challenge pin /
    companion (from v0.6.0) and the body (v0.7.0), then that the re-export reads back.
  - Credits: "Tier levels (OG2 charts)" (test in `notices.test.ts`).
  - Maestro: `onboarding.yaml` and `subflows/finish-onboarding.yaml` press `back` after the hero
    name only when `onboarding-next` is hidden; `settings.yaml` has no `hideKeyboard` after "Gym".
    Taken from the emulator-verified scratch flows; not re-run in this PR (no emulator).
- **Play App Bundle (task 7.2, ADR-066, [PR #68](https://github.com/Herofresh/SkillForge/pull/68)):**
  - Code: `plugins/withUploadSigning.js` (+ `.d.ts`, `.test.ts`; registered in app.json),
    `scripts/buildApk.ts --aab` (`checkUploadProperties`, `checkUploadSigner`),
    `scripts/buildApkConfig.ts` (`UPLOAD_SIGNER_SHA256`, `UPLOAD_PROPERTIES`, `UPLOAD_SIGNING_FLAG`,
    `GRADLE_AAB_PATH`, `aabFileName`, `missingUploadProperties`, `parseKeytoolDigests`,
    `uploadSignerProblem`, `keytoolCandidates`), `npm run build:aab`. CONTEXT.md → "Play build".
  - Verified: `npm run build:aab` on this machine → `builds/SkillForge-0.7.0-vc7-6af4fcc.aab`
    (72.9 MB, SHA-256 e810be9a…9345), BUILD SUCCESSFUL in 47 min (cold, four ABIs); keytool:
    SHA-256 = the pinned upload key; 52 debug-symbol files in
    BUNDLE-METADATA; merged manifest permissions as in ADR-066.
  - Not verified: `npm run build:apk` after the change (the plugin keeps the debug key unless the
    flag is set; covered by the plugin test, not by a real APK build); uploading to Play (7.5).
  - Jest and ESLint now ignore `.claude/` (agent worktrees inside the checkout were tested and
    linted from the main checkout, with false failures).
- **Play hardening (task 7.0a, ADR-064, [PR #66](https://github.com/Herofresh/SkillForge/pull/66)):**
  - Overlay: `getOverlay` selects `body` as raw text (`sql\`${progressionOverlay.body}\``) and
    parses it itself, so broken JSON is a reported issue, not a throw in Drizzle's JSON decoder.
    `StoredOverlay.unreadable` → store `overlayUnreadable` → My progressions note
    (`overlay-unreadable`). The row is not touched on load; the next `saveOverlay` overwrites it.
  - Replay exit: `onboardingReplay` (true only when `onboarding_completed_at` is stored) and
    `leaveOnboardingReplay`; the button lives in `OnboardingScaffold`, which now reads the store
    (its tests start a real store).
  - Not done on purpose: removing `@expo/ui`, `expo-glass-effect`, `expo-symbols` (expo-router
    depends on them, ADR-064). `allowBackup` unchanged (user decision; 7.0b does the texts).
  - Verified: `npx expo prebuild --platform android --clean --no-install` → the generated
    `AndroidManifest.xml` has the three permissions with `tools:node="remove"`, VIBRATE and
    INTERNET kept. Not verified: the merged manifest of a Gradle build, sheets at a real large
    font scale on a device, the widget fallback on a device.
- **Play texts and data (task 7.0b, ADR-065, [PR #67](https://github.com/Herofresh/SkillForge/pull/67)):**
  - Texts in one place: `src/data/notices.ts` (`HEALTH_DISCLAIMER`, `DATA_STORAGE_NOTE`) and
    `NOT_AFFILIATED_NOTE` in `src/data/credits.ts`; `src/components/HealthNotice.tsx` frames the
    disclaimer (onboarding step 1, About); the guide's safeguards page ends with it.
  - "Tier" (user's wording, chosen in review over the first draft's "Difficulty", which is too
    long for the tree tiles): only `formatOgLevel` / `spokenOgLevel` (`src/domain/format.ts`), the
    guide, the rank ladder intro, the editor stepper / hint / position sheet and the import
    preview's field name changed; everything else formats through them. Not seen on a device yet:
    the "Tier N" fit on the tiles.
  - Sources: mechanical replace in the YAML (calisthenics-101 OG2 PDF → stevenlow.org print PDF,
    BWF v5.4 PDF → reddit.com/r/bodyweightfitness/wiki/exercises), noted in
    docs/research/progressions.md. The reddit URL could not be fetched from the agent's
    environment; check it opens. The `redditbwf.github.io` Recommended Routine mirror (50
    sources and the About credit) was left; swapping it for the reddit wiki is a separate call.
  - Verify notes: `SHOW_RESEARCH_NOTES = __DEV__` in `app/node/[nodeId]/index.tsx`. New safety
    cues: soft surface (back / side breakfall, forward / backward roll, both shoulder rolls),
    "coach or a spotter" (aerial), lotus knee, 90/90 switch (hip impingement / knee problems),
    dip negative on a straight bar (shoulders).
  - Delete all: `src/db/defaults.ts` (`writeDefaults`, shared with the first-run seed),
    `deleteAllUserData` in `userDataRepository.ts`, the store's `deleteAllData` + `dataResets`,
    `BackupFiles.deleteAppFiles` (device version in `backupFiles.ts`, deletes `documents/backups/`,
    `cache/skillforge-*`, `cache/DocumentPicker/`, the widget snapshot), widgetSync redraws on
    `dataResets`, UI `src/components/settings/DeleteDataPanel.tsx`. Not run on a device yet: the
    file deletion and the widget redraw after a wipe belong in the combined emulator check
    (expected: widget shows a fresh level-1 hero, "Not yet today"; the app opens onboarding).
  - `app.json` `android.allowBackup: true` is this task's only app.json line (7.0a adds
    `blockedPermissions`).
- **Session length (task 6.15, ADR-063, [PR #65](https://github.com/Herofresh/SkillForge/pull/65)):**
  - Cause found by running the generator: the estimate was ~80 % rest (90 / 180 s after every set)
    and the live session lets the user skip rest, so a "30 min" plan of ~13 sets could be done in
    ~5 min; and volume never grew (3 sets, fixed slots), so 60 and 90 min gave the same 58-min plan.
  - Code: `src/domain/sessionTime.ts` (rests, `workSeconds`, `setSeconds`, `exerciseSeconds(e,
    pace)`, `estimateMinutes`, `restPace(sessions, lookup)`); the generator re-exports the rest
    constants and `exerciseSeconds`, so old imports still work. Generator: `Builder.pace`,
    `fillTime` → extra cool-down (`EXTRA_COOL_DOWN`), `growSets`, `addExtraExercises`
    (`extraBlockKind`), the pace and fill notes, `WorkoutPlan.restPace`. `SlotDef.restSec` (the
    cool-down slot rests `COOL_DOWN_REST_SEC`). `train.ts`: `SESSION_MINUTES`,
    `DEFAULT_SESSION_MINUTES`, `SessionPlan.restPace?`, `planMinutes(exercises, restPace)`. Guide
    generator page: "15 to 90 min", the pace and the 5-set cap from the constants.
  - Measured with the real tree: a new user at pace 1 now gets 15 / 30 / 60 / 90 min plans of
    15 / 30 / 60 / 90 estimated minutes (before: 15 / 25 / 58 / 58); at pace 0.2 a 30-min plan is
    ~40 sets (before: 12). A new user can't fill 60–90 min at pace 0.2 (few unlocked nodes): the
    note says so.
  - Gotchas: test-outs / the onboarding assessment log all sets at once, so Trial sets are not
    measured (they read as zero rest). Mobility isn't measured either, because its rest changed
    from 180 to 30 s and the set order can't tell which one applied. If the pace feels off, the
    knobs are `PACE_*` in `sessionTime.ts` and `MAX_WORKING_SETS` / `MAX_EXTRA_EXERCISES` /
    `FILL_NOTE_SHARE` in `generator.ts`.
  - Emulator gotchas this session: (1) the installed release APK `at.skillforge.app` (from the 6.14
    upgrade check) took the `exp://` link, so Maestro opened it instead of Expo Go; it is disabled
    on the AVD (`adb shell pm enable at.skillforge.app` brings it back). (2) `hideKeyboard` in
    `finish-onboarding.yaml` pressed Back and left the app (no soft keyboard shown), also after
    an emulator restart; the E2E run used a scratch copy that taps the step title instead.
    (3) After an emulator restart, run `adb reverse tcp:8081 tcp:8081` again.
  - Verified: typecheck, lint, Jest (1752 tests). Maestro `train.yaml` on Pixel_8_Pro_API_35 /
    Expo Go (with the scratch onboarding subflow above) passed every step up to and including the
    summary with XP > 0; the last step (Done → Train tab) didn't run because the emulator's
    background task hit its time limit. Screenshots `6.15-train-lengths.png` (the seven chips) and
    `6.15-plan-preview-30.png` (fresh user, 30 min: 7 exercises, about 30 min). Not verified: a
    real phone, the pace note on a device (needs real history), a 90-min session trained end to end.
- **Release v0.7.0 (task 6.14, [PR #63](https://github.com/Herofresh/SkillForge/pull/63)):** ADR-043 routine. Both APKs built with `-- --clean`
  in a short-path copy `D:\sf070` (`diff -r` against the branch: identical, excluding
  `node_modules`, `android`, `builds`, `.git`, `.expo`); signer check passed,
  `RELEASE_SIGNER_SHA256` unchanged. APKs and SHA-256: see the PR body; the coordinator
  publishes them. The `D:\sf070` copy can be deleted.
  - Upgrade check on Pixel_8_Pro_API_35 from every earlier release (fresh install of the
    release's universal APK, `upgrade-seed.yaml`, `adb install -r` 0.7.0 → `Success`,
    versionCode 7, `upgrade-verify.yaml`): v0.1.0-preview1, v0.2.0, v0.3.0, v0.4.0, v0.5.0,
    v0.6.0 all passed; no flow changes. After every upgrade the companion is the 6.13 man
    (spiky hair, Recruit's wooden sword, "Fired up").
  - Widgets (upgrade from v0.6.0): the small widget (4 × 2) and the companion widget (4 × 3)
    were placed on 0.6.0 at its defaults. Right after `install -r`, before the app was opened,
    both redrew: the small one as `grid` filling the height, the companion with the new man
    sprite full height next to the column. The picker shows the new defaults (4 × 1, 4 × 2)
    with the new previews; fresh widgets drew `standard` (small) and sprite + column
    (companion), nothing clipped. A tap opens Train.
  - Body: Customize → Woman + Ponytail changed the Character tab sprite and both companion
    widgets; switching the body back to Man keeps the chosen hair style (man with a ponytail,
    as ADR-061 stores `hairStyle` separately); Spiky restored the original look.
  - Gotcha (emulator, not the app): on the first boot of this session the seed failed three
    times at `hideKeyboard` (Gboard showed only its floating hardware-keyboard toolbar, so
    Maestro's Back left the app). Restarting the emulator fixed it; added to CONTEXT.md.
  - Not verified: a real phone, importing an old backup into 0.7.0 (Jest only), a widget at
    a 5-column launcher on a device.
- **Widgets use their space (task 6.12, ADR-062, [PR #62](https://github.com/Herofresh/SkillForge/pull/62)):**
  - Code: `src/widget/widgetLayout.ts` (pure; font advance tables from the TTFs, `widgetSizes(scale)`,
    the layout tree, `measureWidgetNode`, `placeWidgetNodes`, `widgetLayout`, `companionLayout`);
    `nativeWidget.tsx` only renders the tree; `trimPixelRows` in `src/lib/pixelGrid.ts`;
    `ATTRIBUTE_LABELS` now lives in `src/components/attributeLabels.ts` (re-exported).
  - Sizes: app.json small 4 × 1 (min 110 × 40 dp, `maxResizeHeight` 300 dp), companion 4 × 2
    (min 300 × 110 dp). Provider names unchanged: placed widgets keep their size and redraw.
  - Emulator (Pixel_8_Pro_API_35, release APK built with `-- --clean` in `D:\sf612`, signer check
    passed, installed with `install -r` over v0.6.0): the 4 × 2 small widget placed on 0.6.0
    redrew as `grid` filling the height; a new small widget at the default 4 × 1 (395 × 115 dp)
    drew `standard` with rank, class and Pull; resized to 2 × 1 it drew `narrow` with the status
    on two lines; the companion 4 × 3 placed on 0.6.0 drew the 6.13 sprite full height next to
    the column; a new companion at the default 4 × 2 drew sprite + column; nothing clipped.
    Screenshots `6.12-small-4x1`, `6.12-small-4x2-and-2x1`, `6.12-companion-4x3-and-4x2`,
    `6.12-widget-picker`.
  - Gotcha: the library reports portrait widgets as min width × **max** height (e.g. ≈ 260 dp for
    a 4 × 2 whose view is ≈ 245 dp), and the host scales the bitmap to fit, so the device can show
    a slightly different scale than a test at 395 × 249 predicts. Fine-tune with the screenshots,
    not only the tests.
  - Tuning knobs (all named constants in `widgetLayout.ts`): `EXTRA_WEIGHT` (how much showing
    rank / class / attributes is worth vs. bigger text), `READABLE_SCALE` (1 = the 6.6 sizes),
    `FIT_SHARE`, `PADDING_MAX_SHARE`. At 4 × 3 the companion's text column is spread with gaps
    (the sprite takes the height); if the user wants bigger text there, weigh the sprite less.
  - The `D:\sf612` copy (with node_modules and android/) can be deleted.
- **Companion: cooler look (task 6.13, ADR-061, [PR #60](https://github.com/Herofresh/SkillForge/pull/60)):**
  - Code: `src/data/companion/body.ts` (`SPRITE_SIZE` 32 × 44, the one size constant the UI,
    widget and scripts read; `BODY_SHAPES` man / woman; `HAIR_STYLES` spiky / long / ponytail with
    `top` (hidden under helmets: `hidesHair` in `art.ts`), `locks` and `back` parts; arm poses
    down / up / shoulder / hip / cross / salute; legs stand / shift / wide / kneel; faces),
    `moods.ts` (weapon poses held / lowered / planted), `index.ts` (`companionFrame(frame, outfit,
    look)` now takes the look for the body and hair; `companionBody(look)`; cloak and long hair
    sway), `art.ts` (every part re-fitted to the 12 × 10 head and 12 × 13 torso boxes; cloak folds;
    `plant` / `plantMirror` on weapons), `looks.ts` (contrast palette, `iris`, no blush;
    `CompanionLook` = the domain's `CompanionLookChoice`). Domain: `COMPANION_BODIES`,
    `DEFAULT_COMPANION_BODY`, `parseCompanionLook` (shared by the setting and the widget snapshot).
    UI: Body and Hair style chip rows in `CompanionSheet`. Widget: `companionSvg` passes the look
    (one line); `companionScale` unchanged (44 rows still give 3 dp per pixel at the 250 × 180 dp
    minimum); preview regenerated (`icon:build`).
  - Tests: every accessory and weapon on both bodies in every animation, each frame one connected
    piece (no loose layer; sparkles excepted), boots on the ground row, every hair style on both
    bodies in every frame; body parsing / default / unknown values; store and backup round trip
    with the body; widget snapshot keeps it.
  - Sheets: `npm run companion:sheet` → `docs/screenshots/6.13-*.png` (moods per body, accessories
    per slot on both bodies, weapons man base / woman tier III, outfits × poses per body, looks ×
    hair styles), `6.13-before-after.png` (6.10 row cut from the old sheet above the new man and
    woman; made by a one-off script, not committed).
  - Verified: the five checks, the sheets at 4× and 8–12×, Maestro `character.yaml` on
    Pixel_8_Pro_API_35 / Expo Go (`6.13-character-companion*.png`, `6.13-customize-woman.png`,
    `6.13-summary-victory.png`). Not verified: a real phone, the large widget on a device.
  - Weakest art / ideas: the kneel reads best without a long cloak (a cloak covers the legs); the
    crossed arms are a simple band; small weapons (daggers, wand) are still a few pixels; a fourth
    hair style (short crop) or tier II recolours could come later.
- **Release v0.6.0 (task 6.11, [PR #58](https://github.com/Herofresh/SkillForge/pull/58)):** ADR-043 routine. Both APKs built with `-- --clean`
  in a short-path copy `D:\sf060` (`diff -r` against the branch: identical, excluding
  `node_modules`, `android`, `builds`, `.git`, `.expo`); signer check passed,
  `RELEASE_SIGNER_SHA256` unchanged. APKs and SHA-256: see the PR body; the coordinator
  publishes them.
  - Upgrade check on Pixel_8_Pro_API_35 from every earlier release (fresh install of the
    release's universal APK, `upgrade-seed.yaml`, `adb install -r` 0.6.0 → `Success`,
    versionCode 6, `upgrade-verify.yaml`): v0.1.0-preview1, v0.2.0, v0.3.0, v0.4.0, v0.5.0 all
    passed with the final flows.
  - `upgrade-verify.yaml` now also scrolls to the companion card (mood + weapon), the class
    banner and the weekly challenge (no texts asserted; they depend on the release and the day)
    and takes `6.11-upgrade-companion` / `6.11-upgrade-character`. After every upgrade the hero
    was Recruit, the companion "Fired up" with the wooden sword and "2 NEW" accessories, and the
    challenge counted the seeded session (1 / 2).
  - Widgets (upgrade from v0.5.0): the small widget was placed on 0.5.0 before the update; after
    `install -r` it redrew with the same data plus "RECRUIT" under the rank. The picker lists
    both widgets with their previews; the large SkillForge Companion widget (4 × 3) drew the
    sprite directly on the widget background (no lighter box: the 6.10 review tweak is checked),
    Trained today, Fired up, streak 1, level 1, Novice, Recruit. A tap on either opens Train.
  - Settings → How SkillForge works (list, Companion page) and all seven Character tab "i"
    buttons (XP, companion, rank, class, challenge, attributes, streak) opened and closed on the
    upgraded release install (an ad-hoc Maestro flow, not committed).
  - Gotcha: running the seed flow while Gradle builds makes the emulator so slow that swipes land
    as taps (the 0.1.0 seed once ticked "Rings" and timed out). Build first, then run the flows.
  - Finding (not a regression, library behaviour): after `am force-stop` a widget tap does
    nothing until the app is opened once; `react-native-android-widget` sends clicks as
    broadcasts, which Android doesn't deliver to a force-stopped app. Backlog entry added.
  - Not verified: a real phone, the sad sprite after a real gap, importing an old backup into
    0.6.0 (Jest only).
- **How it works (task 6.10c, ADR-060, [PR #57](https://github.com/Herofresh/SkillForge/pull/57)):**
  - Code: `src/domain/guide.ts` (`GUIDE_TOPICS`, `guideFacts`, `buildGuide`, `GUIDE`,
    `guideEntry`), `hasTendonWarning` in `safeguards.ts`; UI in `src/components/guide/`
    (`GuideButton`, `GuideSheet`, `GuideRow` / `GuideArticle`, `GUIDE_ICONS`,
    `SafeguardGuideNote`), `src/components/settings/GuidePanel.tsx`, routes `app/guide/index.tsx`
    and `app/guide/[topic].tsx`. `InfoButton` got an optional `hint`.
  - "i" buttons: Character tab (XP bar, companion header, rank crest, class banner, challenge
    card, Attributes heading, streak panel), node detail (level row, "Straight-arm" label, Trial
    standard), plan preview header, summary XP breakdown (also past sessions), warning lists with
    a tendon warning ("Why these warnings?": Trial screens, plan preview, live session, summary),
    Settings (widgets).
  - Gotcha: write every number in the guide through `facts` (add a field to `GuideFacts` and fill
    it in `guideFacts()`); the "no hand-written number" test treats tier numerals (I, II, III) as
    numbers too, so avoid a standalone "I" in the text. A rule change (not just a constant) still
    needs the words reviewed.
  - Verified: typecheck, lint, format:check, progressions:check, full Jest (guide domain tests incl.
    the perturbation check, component tests for the button, sheet, guide screens, settings panel,
    warning note, companion card and plan preview); Maestro on Pixel_8_Pro_API_35 / Expo Go:
    `settings.yaml` (widgets "i", guide list, Ranks page, back) and `character.yaml` (companion "i",
    "More in the guide" → page, back) pass, plus `train.yaml` and `tree.yaml`. `train.yaml` now closes the swap sheet by id: `tapOn: 'Cancel'` also matched the backdrop, which is labelled "Cancel", and its tap swapped the warm-up. Not verified: a real phone, TalkBack.
  - Ideas (not done): a "counts towards your weekly challenge" hint; a guide entry per tree state
    (locked / ready / …) beside the Tree legend.
- **Companion (task 6.10, ADR-059, [PR #56](https://github.com/Herofresh/SkillForge/pull/56)):**
  - Code: `src/domain/companion.ts` (mood, facts, rules, unlock merge, loadout, wardrobe, setting
    reader / writer), `src/data/companion/` (`accessories.ts` the one place for rules, `body.ts`
    chibi parts and frame anchors, `art.ts` accessory and weapon parts, `weapons.ts`, `moods.ts`
    frame loops, `looks.ts` sprite palette, `index.ts` composer), `src/lib/sprite.ts` (generic
    layered sprite: parts, regions, computed shading, selective outline, glow, ground shadow),
    `PixelSprite` (UI kit; `PixelAnimation` now uses it too); store: `companion` state,
    `COMPANION_SETTING` (`hero_companion`), `equipAccessory`, `setCompanionLook`,
    `markAccessoriesSeen`, the re-check in `commitEngine` after the class tiers; UI:
    `CompanionCard`, `CompanionSprite`, `CompanionSheet`, `CompanionVictory`,
    `TrinketUnlockPanel`, `useCompanion`, `companionText`; widget: optional `companion` in the
    snapshot, `SkillForgeCompanionWidget`, second provider `SkillForgeCompanion` in app.json,
    `widget-companion-preview.png`.
  - Art workflow: `npm run companion:sheet -- --only <ids> --cell 8 --out <png>`, look at it,
    tune the part grids (uppercase = material, auto-shaded; lowercase = its shadow), re-run the
    full sheet and commit. Before / after: the first draft (stick figure with a chunky build) was
    replaced by the sprite on the user's art direction; the exercise animations are unchanged.
  - "7/30-day streak" = the app's streak (sessions ≤ 72 h apart), best ever reached.
  - Weakest art: raised arms tuck beside the head, small weapons (daggers, axes, wand) are a few
    pixels, the sad pose hides the legs. Ideas: tier II recolours (the user allowed them), a
    second hairstyle.
  - Verified: typecheck, lint, format:check, progressions:check, full Jest (88 suites: sprite
    engine, every accessory and weapon in every pose, moods by calendar day, rules, unlock merge,
    loadout, setting reader, store upgrade / backups / choices, components, widget snapshot and
    both layouts, picker previews); contact sheets looked at (`docs/screenshots/6.10-*.png`,
    before: `6.10-before-stick-figure.png`); Maestro `character.yaml` on Pixel_8_Pro_API_35 /
    Expo Go (Restless new hero with the wooden sword, Customize sheet with skin chip and locked
    items, Fired up after the session, wave on tap, victory pose on the summary; the 6.9b steps
    pass too); release APK (`npm run build:apk:universal`, signer check passed, built in
    `D:\sf610`) installed with `adb install -r` over an older install with data (hero Aria, 40 XP):
    the Character tab showed the companion with "2 NEW" earned accessories at once, the picker
    lists both widgets with their previews, the large widget drew the sprite with the real data and
    survived a reinstall, the small one still draws, a tap opens Train
    (`6.10-upgrade-character.png`, `6.10-widget-picker.png`, `6.10-widget-large.png`,
    `6.10-widget-small.png`). Not verified: a real phone, the sad sprite on the widget after a real
    6-day gap (unit tests cover the mood at render time), reduce motion on a device, the full
    ADR-043 upgrade check from every release (6.11 does that).
  - Review tweak: the large widget's sprite no longer sits on a lighter `surfaceRaised` box (seen
    in `6.10-widget-large.png`); its background is transparent, checked by the widget and preview
    tests and the regenerated picker preview. The on-device check of this tweak happens in the
    6.11 release (the screenshot above still shows the box).
- **Weekly class challenge (task 6.9b, ADR-058, [PR #55](https://github.com/Herofresh/SkillForge/pull/55)):**
  - Code: `src/domain/challenges.ts` (goal counting, `advanceChallenge` engine step, pins,
    `challengeView`), `localWeekBounds` in `src/lib/time.ts`, `ChallengeGoal` /
    `ClassChallengeDefinition` / `WeeklyChallenge` in `types.ts`, `challenge` per class in
    `src/data/classes.ts` (the only place for targets), `CLASS_CHALLENGE_BONUS_XP` and
    `SessionXp.challengeBonus` in `xp.ts`, `recompute` / `applySession` take the challenges
    (`EngineState.challenge` tally, `SessionResult.challenge`); store: `challengePins`,
    `CHALLENGE_SETTING` (`class_challenges`), `pinChallengeWeek` before applying a session (a new
    pin forces a full recompute); UI: `ChallengeCard`, `ChallengeProgressPanel`,
    `challengeText.ts`, a line per class in `ClassSheet`, `BURST_TITLES.challengeComplete`.
  - Also the 6.9 review nit: the Sorcerer's rank progress reads "You are Novice · branch median
    Foundation · Adept at OG 6".
  - Verified: typecheck, lint, format:check, progressions:check, full Jest (83 suites, incl. week
    boundaries, DST weeks (167 / 169 h; Jest pins `TZ=Europe/Vienna` in `jest.config.js`, so CI in UTC checks them too), a skipped straight-arm set not breaking Knight, farming, incremental == full, upgrade, backups); Maestro
    `character.yaml` on Pixel_8_Pro_API_35 / Expo Go (card 0 / 2, class sheet line, summary 1 / 2
    "+1 this session", second session CHALLENGE COMPLETE! "+50 challenge", card COMPLETE and
    "Challenge badges: 1"; new `subflows/log-short-session.yaml`; the Sorcerer scroll now uses
    `visibilityPercentage: 50` because the rows are taller). Not verified on a device: a class
    switch mid-week and the Monday rollover (store and domain tests cover them), a release
    upgrade install (no migration; the store "upgrade" test covers it).
  - Ideas (not done): a read-only "counts towards your weekly challenge" marker in the plan
    preview; the challenge on the widget.
- **Hero classes (task 6.9, ADR-057, [PR #54](https://github.com/Herofresh/SkillForge/pull/54)):**
  - Code: `src/data/classes.ts` (`HERO_CLASSES`: ids, tiers, emblems, colors; the only place for
    thresholds), `src/domain/classes.ts` (rules, ladder, setting reader/writer), `ClassRule` /
    `ClassDefinition` / `ClassUnlocks` in `types.ts`; store: `classes` state, `CLASS_SETTING`
    (`hero_classes`), `selectClass`, `markClassesSeen`, the re-check in `commitEngine` (sessions
    stamp their tier-ups with `sessionId`); UI: `src/components/character/ClassEmblem`,
    `ClassBanner`, `ClassSheet`, `ClassUnlockPanel`, `classText.ts`; Style Guide → Class emblems;
    widget: optional `heroClass` in the snapshot, `ClassLabel` in `nativeWidget.tsx`.
  - Thresholds were scaled from the user's "100–1000" to the real attribute scale (ADR-057 has the
    simulation and the ceilings); **the user approved these scaled thresholds (2026-10-03)**
    instead of a literal 100–1000 range. Change them only in `src/data/classes.ts`.
  - Verified: typecheck, lint, format:check, progressions:check, full Jest (80 suites); Maestro
    `character.yaml` on Pixel_8_Pro_API_35 / Expo Go (banner shows Recruit, sheet opens with
    Recruit worn and locked classes with "Push 0 / 30", scroll to Sorcerer, close; screenshots
    `6.9-character-class`, `6.9-class-sheet`, `6.9-class-sheet-locked`). Not verified on a
    device: an actual unlock / tier-up burst and "Wear" (a fresh E2E hero can't reach tier I;
    covered by component and store tests), the widget label (needs a release build), an upgrade
    install with real history (store test "upgrade" covers the logic). The 6.11 release upgrade
    check should look at the class banner after the update.
  - Ideas: 6.10 outfits per class / tier; the widget picker preview could show a class title.
- **Release v0.5.0 (task 6.8, [PR #52](https://github.com/Herofresh/SkillForge/pull/52)):** ADR-043 routine. Both APKs built with `-- --clean` (new native
  dependency) in a short-path copy `D:\sf050` (checked identical to the branch with `diff -r`);
  signer check passed, `RELEASE_SIGNER_SHA256` unchanged. APKs and SHA-256: see the PR body; the
  coordinator publishes them. Upgrade check from all four earlier releases on the final build.
  - Flow fix: `upgrade-seed.yaml` failed on v0.4.0 itself ("1 problem to fix before saving":
    6.2 made the description required). The flow now fills `editor-description-input` inside a
    `runFlow: when: visible`, so it still runs on v0.1.0–v0.3.0 (no field there); if a release
    needs the field and it isn't found, the `editor-status` assert fails. All four seeds were run
    with the final flow.
  - Widget on the upgraded install (from v0.4.0): added via the picker, showed Trained today,
    streak 1, level 1, Novice, Pull 8 (the seeded data); a tap opened Train. CONTEXT.md "Release
    upgrade check" step 8. Not verified: a real phone, the midnight flip on an upgraded install,
    importing an old backup into 0.5.0 (Jest only).
- **Widget polish (task 6.6b, ADR-056, [PR #51](https://github.com/Herofresh/SkillForge/pull/51)):**
  - Code: `widgetSizes` in `src/widget/nativeWidget.tsx` (one scale for type, icons, gaps from
    the reported width and height; tests in `nativeWidget.test.tsx`), `scripts/widgetPreview.ts`
    (the picker PNG, written by `icon:build`, test fails if the committed PNG is stale),
    `previewImage` in app.json. `NavigationTheme` moved to `src/components/navigationTheme.ts`
    so `theme.ts` loads in tsx scripts (expo-router pulled React Native in).
  - Verified: typecheck, lint, Jest, format:check, progressions:check;
    `npm run build:apk:universal -- --clean` (signer check passed) in a short-path copy `D:\sfw2`
    (native builds fail in `.claude/worktrees/`), then a second incremental build after the
    final layout change; `adb install -r` over the 6.6 build on Pixel_8_Pro_API_35 (data kept).
    The existing widget redrew at 4 × 2 (≈ 395 × 250 dp → scale 1.5, rows spread, clear gap
    between "Not yet today" and the rank), at 2 columns it kept the compact layout, a freshly
    added widget drew the same; the picker shows the pixel preview, "4 × 2". Screenshots
    `docs/screenshots/6.6b-widget-{4x2,4x2-added,small,picker}.png`. Not verified: other
    launchers / screen sizes (the scale steps down to 1.25 or 1 on narrower 4 × 2 cells), a
    real phone.
  - Tuning: a 220 dp width base drew the emulator's 4 × 2 at 1.75 and "Not yet today" nearly
    touched the rank; 260 dp keeps it at 1.5.
  - Gotcha: the preview text is the 3 × 5 font in caps, not Jersey 15 (no TTF rasterizer in the
    scripts). If the widget's look changes, update `scripts/widgetPreview.ts` and re-run
    `npm run icon:build`.
- **Stable Jest runs (maintenance, [PR #50](https://github.com/Herofresh/SkillForge/pull/50)):** component suites timed out (5 s default) only in
  the full parallel `npm test` while other agents ran, and a shared `%TEMP%\jest` cache once failed
  with EPERM on rename. Now: the Jest config lives in `jest.config.js` (moved from `package.json`)
  with `cacheDirectory: <rootDir>/node_modules/.cache/jest` and `maxWorkers: '50%'` outside CI
  (CI unchanged); `jest.setup.ts` gives `src/components/**` and `scripts/appIcon.test.ts` a 60 s
  timeout (`UI_SUITE_TIMEOUT_MS`, `HEAVY_SUITE_PATH`), replacing the editor test's own `20_000`.
  The treeMap "every node" test uses one `getAllByTestId` instead of 155 `getByTestId` walks, and
  the appIcon palette test asserts once instead of ~20k times. Still the slowest: the editor's
  "adds a custom exercise" (types a name key by key; 5–13 s under load) and every TreeMap render
  (~1.2 s for 155 nodes). Pure suites keep 5 s; `overlayUpgrade` (~6 s) is synchronous, so the
  timeout never applies to it.
- **Home-screen widget (task 6.6, ADR-055, [PR #49](https://github.com/Herofresh/SkillForge/pull/49)):**
  - Code: `src/domain/widget.ts` (pure: `widgetSnapshot`, `widgetView`, `parseWidgetSnapshot`),
    `src/widget/` (`widgetModule.ts` guard, `nativeWidget.tsx` layout + task + redraw,
    `widgetStorage.ts` file, `widgetSync.ts` store subscription started from `bootstrap.ts`),
    root `index.ts` (new `main`), plugin config in `app.json`, library mock in `jest.setup.ts`.
    `gridSvg` (`src/lib/pixelGrid.ts`) / `iconSvg` (`icons.ts`) draw pixel icons as SVG strings.
  - Verified: typecheck, lint, Jest (75 suites), format:check, progressions:check, lockfile:check;
    `npm run build:apk:universal -- --clean` (signer check passed; built in a short-path copy
    `D:\sf066`, identical code except comments, since native builds fail in `.claude/worktrees/`);
    on the Pixel_8_Pro_API_35 emulator: the widget is in the picker (4 × 2), added via long-press
    → Widgets → search "SkillForge" → Add; showed "Trained today" with the existing data; after
    moving the clock one day forward (`adb root`, `date`) "Not yet today" with the streak kept;
    after logging and finishing a session "Trained today" and streak 2; tap opened the Train tab;
    resizing to 2 cells while the app was force-stopped redrew it from the background task
    (compact layout). The APK was installed with `install -r -d` over the release agent's 0.4.0
    data (kept, no migration). Not verified: the 30-min periodic flip at real midnight (unit tests
    cover `widgetView`), a real phone.
  - Ideas (not done): a `previewImage` for the widget picker (shows the app icon today), larger
    type on the 4 × 2 size, classes (6.9) on the widget (bump `WIDGET_SNAPSHOT_VERSION`).
- **Release v0.4.0 (task 6.5):** ADR-043 routine. Built from the rebased branch (includes 6.7) in
  a short-path copy of the worktree (`D:\sf040`): in `.claude/worktrees/<agent>/` the native
  CMake paths are too long and Gradle fails with "build.ninja still dirty after 100 tries"
  (CONTEXT.md → "Release upgrade check"). Signer check passed (pinned `RELEASE_SIGNER_SHA256`,
  unchanged). APKs and SHA-256: see the PR body; the coordinator publishes them. The
  `.maestro/release/` flows now also save a custom exercise "Lever hold" after Tuck front lever
  on the old version and look for it after the update (the 6.3c risk). Maestro only finds a branch chip that is
  rendered, so the flows swipe the chip row (y 21 %) until `branch-front_lever` shows (a no-op when
  it already does). All three upgrade checks ran on the final build (main 4826661 + this branch). Not checked: a real phone, a backup import of a v0.3.0
  backup into 0.4.0 (covered by Jest only).
- **Rank ladder (task 6.7, ADR-054, [PR #47](https://github.com/Herofresh/SkillForge/pull/47)):** the rank crest on the Character tab is a button
  that opens `RankLadderSheet` (`src/components/character/`), built from `rankLadder` in
  `src/domain/rankLadder.ts` (via `characterSheet().ladder`). `character.ts` gained
  `rankMedianOgLevel` (the one median, also used by `computeCharacter`). Progress is "n of 7
  branches at OG x or higher" (`branchesForMedian`: more than half always lifts the median; with
  12 branches 6 can be enough when a higher middle value makes up for it, the status uses the real
  median). Only the next rank lists the branches below its level. No data or schema change.
  Verified: typecheck, lint, format:check, progressions:check, the full Jest suite (one
  `treeMap.test.tsx` case timed out once at 5 s under load while the emulator was running and
  passes alone; unrelated), and Maestro `character.yaml` on the Pixel 8 Pro emulator (opens,
  asserts Novice/Apprentice/Legend, closes; `docs/screenshots/6.7-rank-ladder*.png`).
- **6.3c review fixes (6.5 release prep, ADR-052 update):** every id/session-id tie-break in
  `src/domain/` (overlay order clashes, branch columns, assessment, onboarding, recent sessions,
  node session log) uses `compareCodeUnits` from `src/lib/compare.ts`; `localeCompare` is left only
  for sorting names people read (`train.ts`, `overlayEdit.ts`). `nodeDraftWarnings` filters through
  `warningsForNode` (warnings on the node or naming it, so a drop between two user nodes shows in
  both editors). Loaded-tree warnings are still not shown elsewhere (no "My progressions" list of
  them). Verified by typecheck, lint, Jest, format:check and `progressions:check`; not run on the
  emulator.
- **Exercise animations, bar branches (task 6.4b-1, [PR #45](https://github.com/Herofresh/SkillForge/pull/45)):** `h_pull.ts`, `front_lever.ts`,
  `back_lever.ts`, `dynamic.ts`, `core.ts` animate all 49 remaining nodes of those branches (the
  front lever stays in iconic.ts); sheets `docs/screenshots/6.4b-<branch>.png`. No engine change.
  `lever.ts` holds the shared lever leg shapes (tuck → full; a straddle is drawn as a V of the
  legs, also for the straddle one-arm row and the flags). Gotchas: a muscle-up (hang to support)
  and a dead hang to inverted hang do not fit 32 rows, so the muscle-ups start at the pull and
  `hanging_pull_to_inverted` starts well into the pull. The figure's front is `torso + 90`, so
  face-up rows put the head on the left (as in the front lever). Weakest: `wide_row` (differs from
  the horizontal row only by the bar) and muscle-up negative vs strict (same shapes, other tempo).
- **Exercise animations, push/legs (task 6.4b-2, ADR-053):** `h_push.ts`, `v_push.ts`,
  `planche.ts`, `handstand.ts`, `legs.ts` animate every node of those branches (iconic.ts keeps
  push_up, squat, freestanding_handstand, full_planche); sheets `docs/screenshots/6.4b-<branch>.png`.
  No engine change. A `wall` prop only stands on the right, so the walk-up-the-wall drills (wall
  plank, chest-to-wall) are authored facing right with the wall on the left and flipped by a local
  `mirror(pose)` (pointed toes only: a flexed foot would point backwards once mirrored). The
  one-arm handstand is a front view. Weakest reads: diamond vs push-up (side view can't show the
  hand shape; hands sit further back under the chest), straddle vs full planche/one-arm push-ups
  (the far leg splits a little), chest-to-wall vs back-to-wall final hold (told apart by how they
  get up).
- **Exercise animations, part 1 (task 6.4a, ADR-053, [PR #42](https://github.com/Herofresh/SkillForge/pull/42)):**
  - Engine (pure, `src/lib/`): `figure.ts` (Pose = position + absolute angles, `jointsOf`,
    `interpolatePose`, `solveLimb` IK), `figureRaster.ts` (pose + props → 32 × 32 role rows),
    `figureAnimation.ts` (keyframes → frames). Data in `src/data/animations/` (typed TS, not
    YAML, see the ADR): `generic.ts` (one per Pattern), `iconic.ts`, `v_pull.ts`, resolved by
    `animationFor(node)` in `index.ts`. UI: `PixelAnimation` (ui kit) in the node detail and
    `ExerciseInfoSheet`; Style Guide section "Exercise animations".
  - **6.4b, where to continue:** add `<branch>.ts` files next to `v_pull.ts`, spread them into
    `NODE_ANIMATIONS`, author poses with `figure({ hip, torso, hands: [{ to }], feet: [{ to }],
    pin })` (angles in degrees, 0 = right/facing, 90 = down, -90 = up; `ON_FLOOR` for hands/feet
    on the floor; `pin: 'hand'` on a bar), add the file to `SHEETS` in
    `scripts/animationSheetBuild.ts` (e.g. `6.4b-<branch>.png`), run `npm run animations:sheet --
    --only <id> --cell 8 --out <scratch png>` and look at it until the exercise is recognisable.
    Then extend the coverage test in `animations.test.ts` (today: v_pull + `ICONIC_IDS`).
  - **6.4b-3 (flexibility, mobility, acrobatics) done:** `flexibility.ts`, `mobility.ts`,
    `acrobatics.ts`, plus `floorPoses.ts` (data-side helpers, no engine change: `legVia`/`armVia`
    aim a limb through a knee/elbow for front views, `turned` rotates a whole shape, `resting`
    sets it down on the floor, used for rolls). Front views: butterfly, lotus seats, pancake,
    middle split, wall angel, 90/90, cossack, cartwheels; the open book is seen from above. A last
    keyframe with `steps: 1` cuts back to the start, so rolls and cartwheels travel across the
    frame. Weakest (small front-view seats): half lotus vs lotus, butterfly, 90/90, open book, frog.
  - Gotchas: angles interpolate the short way, so a roll needs keyframes < 180° apart. A head or
    hand that leaves the grid fails the bounds test (that is why the pull-up bar is at row 6 and
    the chest-to-bar one at row 7). A `bar` prop draws its rig (post + beam) itself; `postX` moves
    the post when a figure needs that side. Arms come out of one shoulder point; in the front view
    (archer) that reads as a Y, which is fine at this size. Far limbs hide behind the torso: bend
    them forward to show them (one-arm chin-up).
  - Verified: typecheck, lint, format, the full Jest suite, `progressions:check`, the contact
    sheets (looked at every frame), and on the Pixel 8 Pro emulator in Expo Go: the node detail (dead hang), the
    info sheet (jumping pull-up; consecutive screenshots show different frames, so it plays) and
    the Style Guide section render (`docs/screenshots/6.4a-node-detail.png`, `6.4a-info-sheet.png`,
    `6.4a-styleguide.png`). Not checked: reduce motion on a device (the still frame is unit-tested
    only), and no Maestro flow asserts the animation (the Svg is hidden from accessibility).
- **Upgrade-safe overlays (task 6.3c, ADR-052, [PR #41](https://github.com/Herofresh/SkillForge/pull/41)):**
  - `applyOverlay` → `userPlacedIds` (user nodes + edits that set branch/order/og_level) →
    `resolveOrderClashes` (merged tree only; ties sort built-in first, then by id; the user node
    gets the order halfway to the next node, or +1 at the end) → `validateTree(nodes, userPlaced)`
    in `src/data/validate.ts`, which returns `{ issues, warnings }`; `validateNodes` (build) is
    `validateTree` with no user-placed nodes, so the dataset rules are unchanged.
  - `OverlayResult` has `warnings`. Store: `nodeDraftWarnings` (editor advice, `IssueNotes advice`,
    testIDs `editor-advice-position` / `editor-advice-other`); `nodeDraft` returns the resolved
    order so the editor shows and saves the place the tree shows (the only time a resolved order
    is written back, and it is the same place). Loaded-tree warnings are not shown anywhere else.
  - Tests: `src/domain/overlayUpgrade.test.ts` rebuilds the v0.3.0 tree from
    `src/data/skills/releasedPositions.ts` (v0.2.0 identical, v0.1.0-preview1 = minus acrobatics)
    and checks every user-node position and every built-in move a user could have saved. **When a
    release changes content, add its positions there.** Without the fix ~30 old positions failed.
  - Not covered: a content update that adds a prerequisite which closes a cycle with a user's
    edited prerequisites would still fail (Backlog). Verified by typecheck, lint, format:check,
    the full Jest suite and `progressions:check`; not run on the emulator (one new editor note,
    covered by a component test).
- **Branch fill-ups (task 6.3b, ADR-051):**
  - Content only: YAML + regenerated module/review sheet, no code or format change. New ids and
    sources per branch: docs/research/progressions.md → B15 (also lists the steps considered and
    left out, and the OG2 printed-vs-dataset level gaps for PLAN 1.6).
  - Rules kept: no existing node got a hard prerequisite on a new one; new levels are the printed
    OG2 level unless that would break the per-branch order (then the nearest fitting level +
    `verify:`). Tests: `crossBranchGates.test.ts` → "branch fill-ups (PLAN 6.3b)" (≥ 10 per
    branch, no new gates on old nodes, rank of an existing user unchanged, straight-arm flags) and
    `generator.test.ts` → "straight-arm nodes added in PLAN 6.3b" (budget, no early Trial, 48 h).
  - Planche push-ups and the tuck ice cream maker bend the arms but are `straight_arm: true` (branch
    rule; they start/end in a planche or lever). A coach may want the planche push-ups unflagged;
    that needs an ADR and the branch rule in `validate.ts` relaxed.
  - Home profile: the ring nodes and the advanced tuck flag are out of reach (test list updated).
  - Verified by typecheck, lint, format:check, the full Jest suite and `progressions:check`; not
    run on the emulator (no UI change).
- **Flexibility + mobility (task 6.3a, ADR-050):**
  - Content only plus the branch plumbing: `BRANCHES` (+ `mobility`, last), `BRANCH_NAMES`,
    `BranchColors.mobility` = `Palette.lime`, `NON_RANK_BRANCHES` in `character.ts`. Any new
    `Record<Branch, …>` needs a `mobility` key.
  - All new flexibility/mobility nodes are `patterns: [mobility]`, `skill: false`; the generator
    only plans them in the goal-driven cool-down (tests in `generator.test.ts` → "flexibility and
    mobility"). Content checks in `crossBranchGates.test.ts`.
  - Every ogLevel > 0 and every trial in both branches is inferred (`verify:` notes); unilateral
    holds/reps are per side (YAML comment on the trial line only, the app has no per-side flag).
  - Verified by typecheck, lint, the full Jest suite and `progressions:check`; the new tab, lane
    and goal-picker tab are covered by component tests (`treeMap.test.tsx`), not by an emulator
    run or screenshot.
  - 6.3b (other branches) followed as ADR-051.
- **Exercise descriptions (task 6.2, ADR-049):**
  - Format: `description` has fallback `''` in `progressionFormat.ts` (so v1 overlays and
    pre-6.2 backups read); `validateNodes` requires it on `core` nodes only. The editor's own
    rule is `draftIssues` in `nodeEditor.ts` (user nodes), combined with the `applyOverlay`
    issues in the store's `nodeDraftIssues` / `saveNodeDraft`; `finalizeDraft` trims.
  - `dataset.test.ts` checks ≤ 3 sentences and that no cue is copied into the description.
  - `OVERLAY_VERSION` 2 (reads 1–2), `BACKUP_SCHEMA_VERSION` 3 (reads 1–3).
  - UI: `src/components/node/ExerciseInfoSheet.tsx` + `InfoButton.tsx`, new `info` icon;
    `PixelModal`'s close button now has `<testID>-close`. `NodeTile` / `MapNode` /
    `ExerciseCard` show the affordance only when `onInfo` is passed.
  - Verified on the Pixel 8 Pro AVD (Expo Go, Metro `--clear`): `tree.yaml`, `train.yaml`,
    `editor.yaml` (now types a description for the custom node) and `map.yaml` pass. The map
    long press is covered by a component test only, not by Maestro.
- **Readable numbers (task 6.1, ADR-048):** `FontFamily.pixel` = `Jersey15_400Regular`;
  `FontFamily.display` is gone (one weight). Header titles use the new `HeaderTitleStyle` token
  (tabs and stack). A new font must pass the Style Guide → Digits check and be added to
  `CLEAR_DIGIT_FONTS` in `src/components/fonts.test.ts`. Verified on the Pixel 8 Pro AVD:
  `styleguide.yaml` (now asserts the Digits rows and takes `6.1-digits`), `train.yaml` and
  `character.yaml` pass; before/after screenshots committed. Metro started with `CI=1` does not
  watch files: restart it (`--clear`) after a dependency change or edits won't show.
- **Remove confirmation (task 5.12):** `EquipmentProfileEditor` owns the "Remove <name>?" sheet
  (`remove-dialog`, `remove-confirm`, "Keep it") and always asks, on first run too; the `onRemove`
  prop is gone. Settings only passes `onRename`. No Maestro change needed (`settings.yaml` already
  confirms; `onboarding.yaml` never taps Remove); not run on the emulator by the author.
- **build:apk signer order (task 5.13):** only the order in `scripts/buildApk.ts` `main` changed
  (`checkSigner` on `GRADLE_APK_PATH`, then copy); verified by typecheck, lint and tests, not by a
  real Gradle build. The next release build is the first real run.
- **Release v0.3.0 (task 5.11):** same routine as 5.7. Test the upgrade from every release a user
  may still have (0.1.0 and 0.2.0 so far); the seed flow works on both. The emulator got very slow
  after hours of E2E runs (taps ~60 s, adb hanging): cold-boot it and `adb kill-server` when
  flows start timing out.
- **Live-session edits (task 5.9, ADR-045):**
  - Domain: `moveExercise` / `canMoveExercise` (units = single or adjacent pair partners),
    `editSessionSet`, `deleteSessionSet` in `src/domain/train.ts`; `liveView` adds `setIndex` and
    `editStart` per logged set and `moves` per exercise key.
  - Store: `editTrainingSet(setIndex, entered, mark?)`, `deleteTrainingSet(setIndex)`,
    `moveTrainingExercise(key, direction)`.
  - UI: `src/components/train/EditSetSheet.tsx`; `SetLogger` takes `onEditSet`; the session
    list's "Reorder" toggle (`session-reorder`, `move-up-<key>` / `move-down-<key>`) in
    `app/train/session.tsx`. Screen test `src/components/liveSession.test.tsx` (real store).
  - E2E: `train.yaml` gained an edit + reorder step (screenshots `docs/screenshots/5.9-edit-set.png`,
    `5.9-reorder.png`); run by the reviewer on the Pixel 8 Pro AVD after merging 5.8 (with the
    pause / resume steps): passes, and so does `smoke.yaml`.
- **Timer extras (task 5.8, ADR-044):**
  - Domain: `setTimer.ts` has `pauseTimer`, `resumeTimer`, `stopTimer`, `isPaused`, `TimerCue`,
    `timerCue`, `restCue`, `CUE_MAX_GAP_MS`; `reachedTarget` is gone (replaced by `timerCue`).
    `TimerReading.paused` is new. `train.ts` has `pauseSetTimer` / `resumeSetTimer`;
    `parseActiveSession` accepts timers with or without `pausedAt` / `pausedMs`.
  - Store: `pauseTrainingTimer()`, `resumeTrainingTimer()`. `useTrialAttempt` has
    `pauseTimer(index)` / `resumeTimer(index)`; `TrialSetsPanel` shows timers only when all five
    timer handlers are given.
  - UI: `SetTimerPanel` takes `onPause` / `onResume` (ids `<prefix>-pause`, `<prefix>-resume`;
    Cancel moved to its own full-width row). Vibration patterns are in
    `src/components/timer/vibration.ts` (`CUE_VIBRATIONS`, `buzz`). `RestPanel` buzzes at zero.
  - E2E: `train.yaml` now pauses the second set's timer, kills the app and resumes it after the
    restart. Not run by the author (no emulator in that session); the cues are covered only by
    component tests (fake timers + a `Vibration` spy). Vibration is untested on a real phone.
  - Not built (backlog): sound, a background notification, pausing the rest countdown, timers for
    rep Trials.
- **History links and replay onboarding (task 5.10, ADR-046):**
  - Node detail: `NodeHistoryList` takes `onOpenSession`; every row is a button that pushes
    `app/session/[sessionId]` (onboarding test-outs are ordinary Trial sessions, so they open too).
    The session screen treats a missing / non-string id as unknown ("Session not found").
  - Replay: `replayOnboarding()` clears `onboardingCompletedAt` **in memory only**; the stored
    setting stays, so a restart mid-replay returns to the tabs. `completeOnboarding` keeps the first
    completion (`onboardingCompletionAt` in `src/domain/onboarding.ts`). No prefill code: the steps
    already read the store. Settings → `ReplayOnboardingPanel` (confirm sheet `replay-dialog`).
  - E2E: `settings.yaml` ends with the replay (confirm → hero step → `finish-onboarding` subflow →
    Tree). Not run on the emulator by the author.
- **Release v0.2.0 (task 5.7, ADR-043):**
  - Release routine: bump `expo.version` + `expo.android.versionCode` (+1) in app.json, build
    both APKs (`-- --clean` after icon/plugin/native changes), run the "Release upgrade check" in
    CONTEXT.md against the previous release's APK, then `gh release create` with both APKs and
    their SHA-256.
  - `RELEASE_SIGNER_SHA256` in `scripts/buildApkConfig.ts` is the debug keystore's certificate.
    Don't change it without the user (Phase 7): installs from earlier releases couldn't update.
  - The first preview's APK reports versionName "1.0.0" (built before ADR-039); the user calls it
    "version 1.0". Only the versionCode matters for updates.
  - `.maestro/release/` flows target the installed app (`at.skillforge.app`), not Expo Go, and
    aren't run by `npm run e2e` (subfolder).
- **Exercise timer (task 5.4, ADR-040):**
  - Domain: `src/domain/setTimer.ts` (`timerModeFor`, `readTimer`, `measuredSeconds`,
    `reachedTarget` (now `timerCue`, 5.8), `formatTimerClock`, `timerCaption`, `spokenTimer`, `timedPerformance`,
    `elapsedSeconds`, `totalDurationSec`); `train.ts` has `ActiveSession.timer`, `startSetTimer`,
    `stopSetTimer`, `clearSetTimer`, and `logSessionSet` writes `durationSec`. `formatClock` is in
    `format.ts`; `loggedSetText`, `sessionDurationSec` and `summaryView(result, nodes, session?)` are
    in `trainView.ts`.
  - Store: `startTrainingTimer(key)`, `stopTrainingTimer()` (returns the measured seconds),
    `resetTrainingTimer()`; `logTrial(nodeId, results, durations?)`. `state.sessions` are now
    `StoredSession`s (with `endedAt`).
  - UI: `src/components/timer/SetTimerPanel.tsx` (keyed per timer start so its clock is fresh;
    `KeepAwake` only while running; vibrates on the holding → overtime step). `useNow` moved to the
    UI kit (`@/components/ui`). `SessionClock` in the live header. New `hourglass` icon.
    UI event handlers read the wall clock with `currentTime()` (`src/lib/time.ts`): the React
    Compiler lint flags a bare `Date.now()` in a hook's handler.
  - Data: never edit migration 0003; a later set field needs a new additive column and backup
    `schemaVersion` 3 (keep reading 1 and 2).
  - E2E: the reviewer ran `smoke`, `train` and `character` on the Pixel 8 Pro AVD (all green;
    `train.yaml` covers the stopwatch, the rest ending on start, the timer surviving a kill, and
    the summary's session / exercise times). `docs/screenshots/5.4-timer.png` is from that run.
    The hold countdown and vibration are only covered by component tests (the first planned
    exercise is a rep warm-up); keep-awake and vibration are untested on a real phone.
  - Not built in 5.4: pause and a buzz at "go" came in 5.8 (see above); sound, a background
    notification and timers for rep Trials are still in the backlog.
- **App icon (task 5.6, ADR-042):**
  - Edit `MOTIF_ROWS` in `scripts/appIcon.ts` (roles → `Palette` keys in `MOTIF_COLORS`), run
    `npm run icon:build`, look at `docs/screenshots/5.6-app-icon.png` (bottom row: 96 / 48 px),
    commit the PNGs. `appIcon.test.ts` checks the grid, colors, sizes on disk, the safe zone and
    that app.json points at exactly these files.
  - `Palette` now lives in `src/components/palette.ts` (re-exported by `theme.ts`) so Node scripts
    can import it without React Native.
  - Not checked on a device yet: the icon in a real launcher / installed APK. `build:apk` runs
    prebuild with `--no-clean`; if an old icon shows, rebuild with `npm run build:apk -- --clean`.
  - iOS uses `icon.png`; the template `assets/expo.icon` bundle was removed.
- **Build config (task 5.3a, ADR-039):**
  - `scripts/buildApk.ts` (I/O, runs via tsx) + `scripts/buildApkConfig.ts` (pure, tested in
    `buildApkConfig.test.ts`). Output `builds/SkillForge-<version>-vc<code>-<arm64|universal>-<commit>.apk`.
  - Prebuild runs with `--no-clean` (keeps android/ and Gradle's cache); pass `-- --clean` after
    changing app.json plugins or native dependencies. The script restores package.json (prebuild
    rewrites the `android`/`ios` scripts) and warns about other tracked changes.
  - Signed with the debug keystore. The arm64 APK crashes on the x86_64 emulator
    (`SoLoaderDSONotFoundError`); use the universal one there. See CONTEXT.md → Gotchas.
  - Releases: bump `expo.android.versionCode` (and `expo.version`) in app.json, build, attach
    the APKs to a GitHub pre-release with their SHA-256.
  - EAS is dropped (ADR-047); Play signing is Phase 7. Never commit a keystore (`*.jks` is
    gitignored).
- **Acrobatics branch (task 5.5, ADR-041):**
  - Content: `content/progressions/acrobatics.yaml`; sources and chain notes in
    docs/research/progressions.md → B13. Every ogLevel and trial is inferred (`verify:` on all 13
    nodes), so the coach review (1.10) should look at this branch too.
  - Code: `BRANCHES` gained `acrobatics` at the end; `BRANCH_NAMES`, `BranchColors`
    (`Palette.orchid`) follow. The rank median uses `RANK_BRANCHES` in `character.ts`. The
    generator needed no change (skill slots; balance/mobility skip the 48 h rest). Tests:
    `crossBranchGates.test.ts` (gates, shape), `generator.test.ts` (slots, rest),
    `character.test.ts` (rank median).
  - Not verified on the emulator: the extra Tree tab / map lane / onboarding tab come from
    `BRANCHES`; a quick look at the map lane color on a device is worth doing.
  - Not modelled: dive roll, mae ukemi (forward impact breakfall), handsprings and flips; no mat
    equipment tag (everything is `floor`, cues ask for a soft surface).
- **Polish (task 5.2, ADR-038):**
  - Reveals: import `BURST_TITLES` and `useLevelUpKey` from `@/components/ui` for any new
    celebration; DESIGN.md §7 lists where each burst plays. The burst ring is centred on the title.
  - Icons: a new icon with a large fill that is used tinted (buttons, tab bar) should list the fill
    role in `knockout` (icons.test.ts checks every icon still draws something when tinted).
  - Editor: `NodeEditorBody` guards leaving with `navigation.addListener('beforeRemove')` while
    `draftChanged(initial, draft)`; the component test mocks `useNavigation` (`mockNavigation`)
    and needs `await act(async …)` around the listener call. Maestro `editor.yaml` presses back on
    the new-exercise form and keeps editing.
  - Tooling: `npm run e2e -- .maestro/<flow>.yaml` runs one flow; `MAESTRO_BIN` overrides the path.
  - Not built (backlog): haptics (expo-haptics) on level-up/unlock, animating a newly lit map edge,
    a burst for self-unlock on the map, keeping the editor draft across an app kill.
- **Tree map (task 5.1, ADR-037):**
  - Domain: `src/domain/treeMap.ts` (`TREE_MODES`, `parseTreeMode`, `nodeLayers`, `mapLayout`
    with `MAP_DIMS`, `mapTiles`, `edgeKey`, `boundsOf`, `mapFocus`, `routeRects`); camera math in
    `src/lib/viewport.ts` (worklets). Store: `treeMode` + `setTreeMode` (setting
    `TREE_MODE_SETTING` = `tree_view_mode`), test `src/store/treeMode.test.ts`.
  - UI: `src/components/tree/map/` (`TreeMap`, `MapCanvas`, `MapNode`), `tree/TreeModeTabs`;
    `tileLook.ts` now has `tileAccessibilityLabel` / `tileStateLabel`, shared with `NodeTile`.
    Tokens `BranchColors`, `MapStyle` in `theme.ts` (branch colors contrast-tested).
  - Gotcha: don't draw the map as one `Svg`: Android rasterizes it at full size and Expo Go
    crashed ("Canvas: trying to draw too large bitmap"). Lanes/edges are Views; see CONTEXT.md.
  - `GestureHandlerRootView` wraps only the map (the app root has none). Pan cancels node
    `Pressable`s (checked on the emulator: a swipe that starts on a node doesn't open it).
  - Not built (backlog): culling off-screen nodes (all 89 render; smooth on the Pixel 8 Pro
    emulator), channel routing for long edges (they pass behind nodes in the target's row),
    remembering the camera between visits, recommended prerequisites on the map, a map legend
    (the column Legend explains the same frames), a Maestro pinch (Maestro has no pinch; the flow
    uses − / +, swipes and a double tap).
  - Maestro `map.yaml` (no clearState): switch to Map, − − +, two swipes, double tap, Focus, tap
    the first visible `map-node-.*`, back, List → Columns. It must end in Columns: smoke.yaml
    expects "Skill Tree".
- **Node editor and shared progressions (tasks 4.7–4.8, ADR-036):**
  - Domain: `src/domain/nodeEditor.ts` (pure draft functions: `newCustomNode`, `placeAfter`,
    `customNodeId`, steppers, prerequisite/equipment/cue/trains edits, `prerequisiteOptions`,
    `issueSection` / `issuesBySection` / `editorIssueText`) and `src/domain/overlayEdit.ts`
    (`nodeEditFor`, `withNode`, `withoutNodeChanges`, `withHidden`, `customizationOf`,
    `customizedNodeIds`, `overlayEntries`, `describeOverlayEntry`, `mergeOverlays`,
    `overlayImportPreview`). The straight-arm rule is `straightArmEditIssues` in `overlay.ts`, called
    by `applyOverlay`.
  - Store: `baseNodes` in state; `nodeDraft`, `newNodeDraft`, `nodeDraftIssues`, `saveNodeDraft`
    (a new draft has id `NEW_NODE_ID` = '' and gets its `user_` id on save), `resetNode`,
    `setNodeHidden` (built-in only; throws for user nodes), `exportOverlay`, `shareOverlay`,
    `previewOverlayImport`, `importOverlay` (merge), `pickOverlayFile`. `BackupFiles.share` takes
    optional `{ mimeType, dialogTitle }`.
  - UI: `src/components/editor/` (`NodeEditorBody` = the screen body shared by edit and new,
    `NodeEditorForm`, `PositionSheet`, `IssueNotes`, `CustomBadge`, `OverlayEntryRow`,
    `SharePanel`), `node/CustomizeSection`, `settings/ProgressionsPanel`. The prerequisite picker
    reuses the Train `NodeOptionSheet`. New kit bits: `Frames.arcane`, the `quill` icon,
    `PixelTextInput` `multiline` / `autoCorrect`, `METRIC_LABELS` in `format.ts`.
  - The editor keeps its draft in screen state (read once on mount); leaving without saving
    discards it (no "unsaved changes" prompt yet).
  - Not built (backlog): undo for an overlay import (reset entries one by one), editing patterns,
    alternatives, regressions or sources, a node's `verify` note, clipboard paste button (the paste
    field works with the system paste), an "unsaved changes" prompt, a Maestro step that imports
    real YAML (covered by store and domain tests).
  - Maestro `editor.yaml` (clearState): add "Towel hang" after Dead hang with Dead hang as
    prerequisite, see its Custom tag, a cycle on Dead hang shows the inline error with Save off,
    a valid edit + Reset to default, My progressions → share sheet (closed with back), import screen,
    delete. Gotcha: the search field's keyboard covers the sheet's options: `hideKeyboard` after
    `inputText` there (a keyboard is open, so it doesn't leave the screen). All eight flows took ~19.5 min
    on the Pixel 8 Pro (editor.yaml ~6 min).
- **Character tab and Settings (tasks 4.5–4.6, ADR-035):**
  - View model: `characterSheet` in `src/domain/characterView.ts` (`radarAxes`, `nextRank`,
    `rankHint`, `activeStreak`, `characterTotals`, `balanceNote`, `recentSessions`,
    `goalProgress`). Pixel geometry in `src/lib/radar.ts` (`rasterizePolygon` with a hole for
    outlines, `segmentQuad` for spokes).
  - Store: `sessionResults` (every session's `SessionResult`, kept by loadAll/apply/recompute),
    `lastImport` + `undoLastImport()` (memory only; gone after a restart).
  - Shared UI: `SessionResultPanels` (Train summary and past session), `EquipmentProfileEditor`
    (onboarding and Settings; `onRename`/`onRemove` hand the confirmation to the screen). Settings
    panels in `src/components/settings/`, credits in `src/data/credits.ts`.
  - The Character tab reads the clock on focus (`useFocusEffect`) for the streak, and plays LEVEL
    UP! when the level rose while the tab was mounted.
  - Not built (backlog): undo after a restart (pick a safety copy from `documents/backups/`),
    pruning old safety copies, units/preferences (none exist). Replay onboarding and the node
    history links came in 5.10 (ADR-046).
  - Maestro: `character.yaml` (clearState, logs one session through Train); `settings.yaml` (no
    clearState; add + remove a "Gym" profile, share sheet closed with back, import cancel paths).
    Gotcha: Maestro `hideKeyboard` presses back when no keyboard is open, which leaves the tab;
    the add-profile button dismisses the keyboard itself, so the flow doesn't call it there. All seven
    flows took ~14 min on the Pixel 8 Pro. The
    Settings tab keeps its scroll position between flows: the flow scrolls up first.
  - Gotcha: during this task Expo Go kept running an old bundle after edits (even after
    `clearState`); restarting Metro with `npx expo start -c` fixed it. Restart Metro before the
    final E2E run.
- **Train flow (task 4.4, ADR-034):**
  - Model: `src/domain/train.ts` (`SessionPlan` → `ActiveSession`, pure: swap/remove/add, pairs,
    `logSessionSet`, `markedPerformance`, skip, rest, `projectedSets`, `finishedSession`,
    `parseActiveSession`), view models in `src/domain/trainView.ts`, text in `format.ts`
    (`formatPrescription`, `formatRest`, `formatCountdown`). The generator now exports
    `workoutWarnings` (plan and live warnings share it) and `prescribeExercise` (swaps/additions).
  - Store: `trainPlan` (memory), `activeSession` (row in `active_session`, migration 0002, read by
    `loadAll`), `trainSummary` (memory, lost on restart). Actions `planTraining`, `swapOptions`,
    `swapPlanExercise`, `removePlanExercise`, `trainWarnings`, `acknowledgeTrainWarning`,
    `startTraining`, `logTrainingSet`, `skipTrainingExercise`, `selectTrainingExercise`,
    `skipTrainingRest`, `addTrainingOptions`, `addTrainingExercise`, `finishTraining`,
    `abandonTraining`, `dismissTrainSummary`.
  - Warnings are acknowledged by `warningKey` (code + node) and stored with the plan/draft, so a new
    warning (e.g. straight-arm work added on top) shows up unacknowledged while old ones keep their
    answer. Logging waits for the acknowledgement; nothing blocks after it (ADR-023).
  - Finishing: started exercises get their missing sets logged as skipped (value 0); never-started
    ones are left out (so a skipped exercise doesn't count as trained). No sets = nothing logged.
  - The draft is not in backups; an import deletes it (`USER_TABLES`). A draft that no longer parses
    reads as "no session".
  - `app/index.tsx` opens `/train` while a session is in progress. The summary's Done dismisses the
    stack (or replaces with `/train` when the summary is the only screen).
  - Not built (backlog): hold stopwatch / full rest timer, reordering exercises, "shuffle" the plan
    (`planTraining(profile, minutes, seed)` already takes a seed), editing a logged set, Trial-day
    note beyond the generator's notes. The Character tab (4.5) can list `state.sessions`.
  - Maestro `train.yaml`: `stopApp` + `launchApp` + `openLink` restarted the app fine mid-flow
    (the start-of-flow gotcha doesn't apply there). All five flows took ~8.5 min on the Pixel 8 Pro.
- **Tree tab and node detail (tasks 4.2–4.3, ADR-033):**
  - View models are pure in `src/domain/treeView.ts`; screens `useMemo` them over `state.nodes`,
    `state.engine.progress`, `state.goals`, `state.sessions`. `nodeLevelProgress` (node XP bar) and
    `prerequisiteSatisfiedBy` are in `progression.ts`; `LevelProgress` moved to `types.ts`.
  - Open a node from anywhere with `router.push({ pathname: '/node/[nodeId]', params: { nodeId } })`
    (Train summary and Character history can link to it). Pushed screens use
    `stackHeaderOptions(title)`; the header height looked normal on the Pixel 8 Pro (the Style Guide
    uses it now too).
  - The Trial logic is shared: `useTrialAttempt(node)` + `TrialSetsPanel` / `TrialOutcome`
    (`src/components/trial/`), and `SafeguardWarningList` + `useAcknowledgements` for any
    acknowledge step. 4.4 should reuse them for session warnings.
  - `UnlockSheet` is mounted to open it (warnings frozen in a `useState` initializer). The store's
    `selfUnlockWarnings(nodeId)` is empty for nodes that aren't locked.
  - Tiles are one accessible button; the prerequisite chips inside are touch-only duplicates of the
    detail's prerequisite links. Recommended prerequisites show only in the detail.
  - The detail's history lists the last `NODE_HISTORY_LIMIT` (5) sessions with the node's actual
    sets; a full log belongs to the Character tab (4.5).
  - Maestro `tree.yaml` starts with `clearState` (like onboarding) so the node states are known;
    all four flows took ~5.5 min. Its `takeScreenshot` steps produce the committed screenshots.
- **Onboarding (task 4.1, ADR-031):**
  - Gate: `state.onboardingCompletedAt` (setting `onboarding_completed_at`). `app/(tabs)/_layout.tsx`
    and `app/index.tsx` redirect to `/onboarding` while it is unset; `app/onboarding/_layout.tsx`
    redirects to `/tree` once `completeOnboarding()` ran. Settings (4.6) could add "replay
    onboarding" (delete the setting + `loadAll`); not built.
  - Reuse for 4.3/4.4: `logTrial(nodeId, results)` (any node, returns `SessionResult`),
    `testOutWarnings(nodeId)` (pre-attempt warnings; the node detail's "attempt Trial / test out"
    should use it the same way: `WarningBanner` per warning, action enabled once all are
    acknowledged), `trialSession`, `defaultTrialResults`, `stepTrialResult`, `formatTrial`,
    `formatPerformance`, `unlockedByTrial`, and the kit's `NumberStepper`.
  - Show OG levels with `formatOgLevel` / `spokenOgLevel` (`format.ts`): level 0 reads
    "Foundation" (below the OG2 chart), never "OG 0". The `rune` icon is a gem-rune (diamond) so
    it no longer reads as the letter K in node rows.
  - `characterLevelProgress(totalXp)` now exists (`character.ts`) for the Character tab XP bar; a
    node-level equivalent still doesn't.
  - The trial screen freezes its warnings on mount (`useState` initializer) so they don't change
    under the user after logging. The eccentric/load steppers change the per-set value only; the
    lowerings/reps stay at the Trial's `reps`.
  - `NodeRow` uses the `rune` icon for ordinary nodes, `star` for goals, `flame` for legendary
    ones in the goal picker; 4.2 may want state icons (lock for locked).
  - Expo Go's floating dev-tools bubble overlaps the top-right of every screen in the screenshots;
    it isn't part of the app.
  - Maestro: `onboarding.yaml` uses `clearState` (wipes Expo Go's data, then Expo Go's intro and dev
    menu have to be dismissed; see CONTEXT.md E2E gotchas). The flows now take ~4.5 min in total.
- **Design system (task 4.0, ADR-030):**
  - Read `docs/DESIGN.md` before any screen. Build from `@/components/ui` (`Screen`,
    `PixelFrame`, `PixelText`, `PixelButton`, …); never hard-code colors, font names or sizes.
    A new color goes into `theme.ts` and, if it is text or a fill, into `theme.test.ts`.
  - Bars take a `fraction`; compute it from the domain thresholds (`xpForLevel`,
    `CHARACTER_LEVEL_THRESHOLDS`) in the store or a pure domain helper, not in the component. A
    `nodeLevelProgress` / `characterLevelProgress` helper doesn't exist yet: add it to
    `src/domain/` with tests when 4.3/4.5 need it.
  - `WarningBanner` is controlled: keep the acknowledged set in screen state and pass
    `SafeguardWarning.message` / `severity`. Acknowledging only enables the action; never block.
  - Icons: add 12×12 grids to `src/components/ui/icons.ts` (icons.test.ts checks them); use sizes
    24/48. Icons on gold or blood fills should be tinted (PixelButton does this for its variants).
  - `LevelUpBurst` replays when `playKey` changes. Its particles start a little above the title's
    centre; 5.2 (animations and polish) can tune it.
  - Component tests: `@testing-library/react-native` 14 is async (`await render(...)`,
    `userEvent.setup()`); `jest.setup.ts` mocks Reanimated/Worklets. Mock
    `react-native-safe-area-context` in tests that render `PixelModal`.
  - Maestro: the flows no longer assume a fresh start (they wait for `Tree|Style Guide`, leave the
    Style Guide with back, then tap Tree). `stopApp` before `openLink` left Expo Go on the Android
    launcher, so don't add it. Long pages need `scrollUntilVisible` with `timeout: 90000` on the
    software-rendered emulator. Prefer `testID` selectors.
  - Typed routes: after adding a route, start Metro once (`npx expo start`) to regenerate
    `.expo/types`, or `npm run typecheck` rejects the new href locally (CI has no generated types).
  - The Style Guide header is taller than the tab headers (status bar inset counted twice by the root
    Stack in Expo Go); harmless for a dev screen, check again with real stack screens (4.3).
- **Lockfile guard (task 0.7, ADR-029):** root cause of the recurring `@emnapi/*` drops was npm
  version skew (local 11.6.2 writes the lockfile without them; CI's 11.19.0 requires them), not the
  OS. `npm run lockfile:fix` re-resolves with the pinned npm through `npx`, so it works whatever npm
  is installed; local npm prints an `EBADDEVENGINES` warning until it is upgraded
  (`npm install -g npm@11.19.0`, optional). To bump the pin, change `devEngines` in package.json,
  run `lockfile:fix` and commit both files.
- **Stored overlay and backups (Phase 3.3–3.4, ADR-028):**
  - Overlay: `useAppStore((s) => s.saveOverlay)(overlay)` returns `ValidationIssue[]`; empty =
    saved and reloaded. The node editor (4.7) shows the issues inline (`formatIssue`) and keeps
    the draft. `state.overlay` is the stored one; `state.overlayIssues` is non-empty when a stored
    overlay stopped applying after an app update (then the built-in tree is used; show a notice).
  - Backups: `shareBackup()` (export + share sheet) and `importBackupFromFile()` →
    `{ status: 'imported', safetyCopy } | { status: 'rejected', issues } | { status: 'canceled' }`.
    Settings (4.6) must confirm "replace all data" before calling it, show `issues` on
    rejection, and can offer "undo" by importing `safetyCopy.text` (`importBackup(text)`).
    Safety copies are written to `documents/backups/` and never pruned yet.
  - The format is in `src/domain/backup.ts`. Any change to the layout needs
    `BACKUP_SCHEMA_VERSION` + 1, a reader for the old version and a new ADR. `meta` and
    `node_progress` are not exported (recomputed on `loadAll`).
  - `replaceUserData` deletes every user table; add new user tables to `USER_TABLES`,
    `readUserData`, `UserData` and the backup format together.
  - `backupFiles.ts` (native I/O) is not unit-tested; the flows are tested with a fake
    `BackupFiles`. Manual device check of share/pick is part of 4.6.
  - Lockfile: `npx expo install` dropped `@emnapi/core` / `@emnapi/runtime` again; restored from
    main's lockfile with jq.
- **Persistence core (Phase 3.1–3.2, ADR-026, ADR-027):**
  - Start-up: `app/_layout.tsx` wraps the Stack in `DataGate` → `startApp()`
    (`src/store/bootstrap.ts`): open `skillforge.db`, `migrateDatabase` (version guard,
    Drizzle migrations, `meta.schema_version`, one-time seed), `createAppStore`, `loadAll`.
    Components read with `useAppStore(selector)`; actions are `useAppStore((s) => s.logSession)`.
  - Schema changes: edit `src/db/schema.ts`, run `npm run db:generate -- --name <slug>`, commit the
    new files in `src/db/migrations/` (Prettier-ignored). Never edit or delete a generated
    migration; destructive changes need a user decision.
  - Repositories are synchronous (Drizzle's expo driver runs in sync mode): keep
    `db.transaction` callbacks synchronous.
  - The store always recomputes on `loadAll` and rewrites `node_progress` after every change; the
    cache is never read back yet (export or a fast start can use `readNodeProgress`).
  - `logSession(session, { endedAt, equipmentProfileId })` stores the session exactly as given; the
    Train flow (4.4) builds the `LoggedSession` (ids via `createId` in `src/lib/id.ts`).
  - `generateWorkout(profileId, minutes, seed?)` defaults the seed to the number of logged sessions
    (stable until the next session); pass another seed for "shuffle".
  - The store takes `baseNodes` (= `ALL_NODES`) and applies the stored overlay itself (3.4);
    read the user's tree from `state.nodes`, never from `ALL_NODES` in the UI.
  - Tests: `openTestDatabase(path?)` (`src/db/testing/testDatabase.ts`) gives a migrated database
    on `node:sqlite` through the real driver; use a temp file to simulate a restart.
  - The Maestro smoke flow now also asserts "Home" and "Park" on Settings.
  - Lockfile: `npm install` on Windows dropped `@emnapi/core` / `@emnapi/runtime` again; they were
    restored from main's lockfile (check after every install).
- **Workout generator (Phase 2.5, ADR-024):**
  - `generateWorkout(request)` is pure; pass `now` and a `seed` (e.g. the session id hash or a
    counter). Same request + seed = same plan, so the plan preview can be regenerated safely.
  - `recentSessions` should cover at least the last two weeks: it drives pattern recency, the
    48 h rules, the last performance for double progression and stagnation. Only ≥ 2 sets of a
    node in a session count as working sets, so a 1-set warm-up item never blocks a pattern.
  - The Train flow (4.4) should log a planned exercise with `prescribed = target` and
    `isTrial` from the plan. When the user edits the plan, re-check it with
    `sessionSafeguardWarnings(plannedSets(planExercises(plan), now), …)` and show the warnings
    with an acknowledge step (ADR-023); never block.
  - Default profiles are seeded on first run from `DEFAULT_EQUIPMENT_PROFILES`
    (`src/domain/equipment.ts`; Home = floor, wall, bar, parallettes, bands; Park = Home +
    dip_bars). 4.1 onboarding can edit them through the store.
  - Straight-arm Trials of 3 × 30 s are suggested on a **Trial day** (2.8, ADR-025): one
    straight-arm Trial's sets are exempt from the budget (`budgetExemptTrialSets`, used inside
    `straightArmSecondsUsed`), and the generator then drops all other straight-arm candidates.
    Changing this needs a new ADR and a user decision (AGENT.md §5). The Train flow can show the
    "Trial day" note; straight-arm work the user adds on top gets `straight_arm_budget` only once
    it goes over ~60 s besides the Trial.
  - Constants are a first pass (see `docs/CONTEXT.md` → Generator). Tune them in
    `generator.ts` only.
- **Game engine (Phase 2.1–2.4, 2.6; ADR-018…021):**
  - Everything takes the node list as a parameter. Pass the user's merged tree
    (`applyOverlay(ALL_NODES, overlay).nodes`, the store's `state.nodes` since 3.4), not `ALL_NODES`,
    so user-added or edited progressions (and later coach changes) flow through the same rules.
  - `applySession` is the only reducer step; `recompute` folds it over the sorted history. Use
    `canApplyIncrementally` before an incremental apply; an older session (import) needs a recompute.
    Recompute also after an overlay edit or a formula change.
  - A skipped set must be logged with `actual.value = 0` (completion bonus and outcome rely on it).
  - **User autonomy (2.7, ADR-023):** nothing in the engine blocks the user. Trials count on every
    node (a Trial on an already passed node is ignored). Safeguard violations and unmet
    prerequisites come back as `SessionResult.warnings` / `UserActionResult.warnings`; the UI
    must show them with an acknowledge step and can ask for them before an attempt with
    `nodeUseWarnings` and `sessionSafeguardWarnings`. The generator must keep respecting the
    safeguards (AGENT.md §5).
  - Self-unlocks are `UserAction`s (`kind: 'self_unlock'`) and must be persisted next to the
    sessions (a `user_actions` table in 3.1). `recompute(nodes, sessions, actions)` replays both
    (actions before sessions at the same ms); `canApplyIncrementally` takes either kind.
  - Attribute points are open-ended sums (`difficultyMult × level` per trained node); the radar
    (4.5) should normalise them. The push/pull warning uses `peakOgLevels` instead.
  - The L-sit support-hold chain has `trains: [core, push]` (chosen in this task from the user's own example);
    the coach review (1.10) should confirm or change it via the review sheet's Trains column.
  - `alternatives` of a prerequisite node satisfy that prerequisite (ADR-019), so a proficient
    `straight_bar_dip` also meets the human flag's `parallel_bar_dip` gate.
  - All numbers are a first balance pass; tune them only in the owning module and recompute.
  - PR #5 (docs-only PLAN update after PR #4) also edits "Current state" / "Next up"; whichever merges
    second has to resolve a small conflict in this file.
- **Progression matrix (Phase 1, ADR-015/016):**
  - Content lives in `content/progressions/<branch>.yaml`. Authors follow
    `content/progressions/README.md` and the node list in `docs/research/node-manifest.md`.
  - After any YAML edit run `npm run progressions:build` and commit the YAML **and** the two
    generated files (`src/data/skills/progressions.generated.ts`, `docs/review/progression-matrix.md`).
    The dataset test and `progressions:check` (also in CI) fail when they are stale.
  - Dataset: 89 nodes (manifest's 88 + `straight_bar_dip`, ADR-017). Home profile reaches every
    node except `parallel_bar_dip`, `iron_cross` and the three human flags; this and the key
    cross-branch gates are asserted in `src/data/skills/crossBranchGates.test.ts`.
  - The muscle-up negative's dip gate is `straight_bar_dip` (not `parallel_bar_dip`), so Home users
    can reach it. The human flag still gates on `parallel_bar_dip`.
  - Handstand presses (`wall_straddle_press_eccentric`, `straddle_press_to_handstand`) have the
    `straight_arm_push` pattern but `straight_arm: false` (balance skills). The gate test pins this;
    a coach may want them flagged.
  - **Open `verify:` nodes (task 1.6 / 1.10), 52 total:**
    - h_push: pseudo_planche_push_up
    - v_push: support_hold, dip_negative, straight_bar_dip, freestanding_handstand_push_up
    - v_pull: dead_hang, scapular_pull, pull_up_negative, chest_to_bar_pull_up, archer_pull_up,
      one_arm_chin_up_negative, one_arm_chin_up
    - h_pull: band_row
    - front_lever: advanced_tuck_front_lever, one_leg_front_lever (OG2 may list it after straddle)
    - back_lever: skin_the_cat, tuck_back_lever, back_lever, iron_cross
    - planche: planche_lean, full_planche
    - handstand: wall_handstand, chest_to_wall_handstand, freestanding_handstand,
      straddle_press_to_handstand, one_arm_handstand
    - core: hollow_hold, side_plank, foot_supported_l_sit, hanging_knee_raise, l_sit, toes_to_bar,
      straddle_l_sit, v_sit, manna (big jump from the 45° V-sit to manna; OG2 gates on a 170° V-sit)
    - legs: split_squat, bulgarian_split_squat, assisted_pistol_squat, nordic_curl_negative
    - dynamic: kipping_swing, muscle_up_negative, kipping_muscle_up, elbow_lever, tuck_human_flag,
      straddle_human_flag, human_flag, strict_bar_muscle_up
    - flexibility: all 5 (our own synthesis)
  - Placeholder standards worth a coach's eye first: one-arm chin-up 3×3, muscle-ups 3×5, all
    eccentric trials 3×3 lowerings of 5 s, advanced holds 3×15 s, `skin_the_cat` 3×8.
  - `yaml` is a runtime dependency only for overlay import/export; the built-in matrix is never
    parsed on the phone. Jest maps `yaml` to its CJS build (`package.json` → `moduleNameMapper`)
    because jest-expo otherwise picks the ESM browser build.
  - Windows `npm install` dropped the `@emnapi/*` lockfile entries again; they were restored by hand
    (see the CI gotcha below). Check for this after every install.
- Scaffold (tasks 0.2–0.5): routes are in root `app/` (not the template's `src/app/`, see ADR-014).
  Tooling choices are in ADR-013. Folder layout, alias and commands are in `docs/CONTEXT.md`.
- UI colors live only in `src/components/theme.ts`. (`PlaceholderScreen` was removed in 4.5–4.6.)
- Add dependencies with `npx expo install <pkg>` so versions match SDK 57. `npx expo-doctor` passed
  21/21 checks at scaffold time.
- CI (`.github/workflows/ci.yml`) runs on Node 24 for every PR and on every push to `main`: it
  installs the npm pinned in `package.json` `devEngines` (11.19.0), then lockfile:check, npm ci,
  typecheck, lint, format:check, test, progressions:check. Lockfile gotcha (task 0.7, ADR-029): the
  local npm 11.6.2 drops the optional peers `@emnapi/core`/`@emnapi/runtime` from
  package-lock.json and CI's newer npm then rejects it ("Missing: … from lock file"). After every
  `npx expo install` / `npm install`, run `npm run lockfile:fix` (never hand-patch, never switch CI
  to `npm install`); `npm run lockfile:check` must pass before committing. Reviewers must wait for it to be green (`gh pr checks <n> --watch`).
- The approved design is summarized in this file and in `docs/DECISIONS.md` (ADR-001…029). The
  exercise research is in `docs/research/progressions.md`.
- `gh` is installed at `C:\Program Files\GitHub CLI\gh.exe` and logged in as `Herofresh`. If `gh`
  isn't on PATH in an old shell, use the full path.
- Local tooling: Node 24, npm 11, Java 17, jq, the Android SDK (emulator) and Maestro; paths are in
  `docs/CONTEXT.md`.
- E2E (task 0.6, ADR-022): the runbook is in `docs/CONTEXT.md` "E2E tests". Flows in `.maestro/`
  match visible text, so a UI task that changes copy must update them. They don't run in CI yet.

---

## Roadmap

### Phase 0: Docs and scaffold
- [x] 0.1 Documentation set: AGENT.md, CLAUDE.md, PLAN.md, DECISIONS.md, CONTEXT.md, research doc ([PR #1](https://github.com/Herofresh/SkillForge/pull/1))
- [x] 0.2 `create-expo-app` (TypeScript, expo-router, tabs: Tree · Train · Character · Settings) ([PR #2](https://github.com/Herofresh/SkillForge/pull/2))
- [x] 0.3 TypeScript strict, ESLint, Prettier, Jest (`jest-expo`); scripts `typecheck`, `lint`, `test` ([PR #2](https://github.com/Herofresh/SkillForge/pull/2))
- [x] 0.4 GitHub Actions CI: typecheck, lint and test on every PR ([PR #3](https://github.com/Herofresh/SkillForge/pull/3))
- [x] 0.5 Folder layout (`src/domain`, `src/data/skills`, `src/db`, `src/components`, `src/lib`) and README update ([PR #2](https://github.com/Herofresh/SkillForge/pull/2))
- [x] 0.6 Emulator check and Maestro E2E smoke flow (`.maestro/smoke.yaml`, `npm run e2e`, ADR-022). Verified on `Pixel_6_Pro_API_34` via Expo Go ([PR #7](https://github.com/Herofresh/SkillForge/pull/7))
- [x] 0.7 Lockfile guard: `lockfile:check` / `lockfile:fix` with the npm pinned in `devEngines`, CI on the same npm (ADR-029) ([PR #13](https://github.com/Herofresh/SkillForge/pull/13))
- [x] 0.8 Emulator upgrade: Emulator 37.1.11, API 35, default AVD `Pixel_8_Pro_API_35` with host GPU (matches the user's phone), runbook updated (ADR-032) ([PR #16](https://github.com/Herofresh/SkillForge/pull/16))

### Phase 1: Progression matrix
The matrix is authored as human-editable YAML (one file per branch in `content/progressions/`) and
compiled into a typed module for the app; users can layer their own changes on top (ADR-016).

- [x] 1.1 `src/domain/types.ts`: `ExerciseNode`, `Branch`, `Metric`, `Prerequisite`, `Trial`, `EquipmentTag`, overlay types; `tierForOgLevel` ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.2 Dataset: the 88 nodes of [`docs/research/node-manifest.md`](research/node-manifest.md) written as YAML blocks in `content/progressions/<branch>.yaml`, plus `straight_bar_dip` (89 nodes, ADR-017) ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.3 Cross-branch prerequisites (muscle-up, front lever, planche, freestanding HS, flag, pistol), as listed in the manifest ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.4 Equipment options and `alternatives` (Home: floor/wall/bar/parallettes/bands; Park: + dip bars) ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.5 `src/data/validate.ts` + tests: unique snake_case ids, references resolve, DAG, ogLevel monotonic per branch, unique order, equipment, ranges/trials, sources, straight-arm flag ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [ ] 1.6 Verify the inferred (`~`) OG2 levels against the OG2 Google Sheet
- [x] 1.7 YAML format (`src/data/progressionFormat.ts`), `npm run progressions:build|check|review`, generated `src/data/skills/progressions.generated.ts`, staleness test, contributor guide `content/progressions/README.md` ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.8 Coach review sheet `docs/review/progression-matrix.md` (generated, committed) ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [x] 1.9 User overlay in `src/domain/overlay.ts`: `applyOverlay` (same validator), `exportOverlay`/`importOverlay` (YAML/JSON) ([PR #4](https://github.com/Herofresh/SkillForge/pull/4))
- [ ] 1.10 Coach review pass: a calisthenics coach reviews the sheet; notes go into `review.notes`, signed-off nodes get `review.status: coach_reviewed` (needs the user to find a coach)

### Phase 2: Game engine (`src/domain/`, pure TS, with tests)
- [x] 2.1 `xp.ts`: unit normalization (1 rep = 2 s hold = 3 s eccentric), difficulty and outcome multipliers, bonuses ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.2 `progression.ts`: levels 1–10, level-5 cap and Trial, banked XP, node states, unlock resolution ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.3 Tendon safeguards (ADR-010): min weeks at level, 60 s straight-arm budget, 48 h rule ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.4 `character.ts`: character level, attributes, rank title, push/pull balance warning ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.5 `generator.ts`: frontier, scoring, equipment substitution, slot filling, double-progression prescription; suggestions respect the safeguards (ADR-023) ([PR #9](https://github.com/Herofresh/SkillForge/pull/9))
- [x] 2.6 Recompute-from-history function (ADR-008) ([PR #6](https://github.com/Herofresh/SkillForge/pull/6))
- [x] 2.7 User autonomy: test-out anywhere (incl. straight-arm), self-unlock as a recorded user action, advisory safeguards (`SafeguardWarning`), multi-attribute stats (`PATTERN_ATTRIBUTES`, YAML `trains`) (ADR-023) ([PR #8](https://github.com/Herofresh/SkillForge/pull/8))
- [x] 2.8 Trial-day exception (user decision 2026-09-27): one straight-arm Trial's sets don't count against the ~60 s budget; the generator suggests at most one due straight-arm Trial per session and then no other straight-arm work; budget warnings only for extra non-Trial volume (ADR-025) ([PR #10](https://github.com/Herofresh/SkillForge/pull/10))

### Phase 3: Persistence
- [x] 3.1 Drizzle schema and migrations (profile, goals, node_progress, equipment_profiles, sessions, session_sets, user_actions, settings, meta), run on start with a loading/error gate; Home/Park seeded (ADR-026) ([PR #11](https://github.com/Herofresh/SkillForge/pull/11))
- [x] 3.2 Repositories plus the Zustand store that wires the domain to the database; tests on `node:sqlite` through the real driver (ADR-027) ([PR #11](https://github.com/Herofresh/SkillForge/pull/11))
- [x] 3.3 JSON export/import of all user data with a `schemaVersion`, validated before writing, safety copy + one-transaction replace; expo-file-system/sharing/document-picker (ADR-028) ([PR #12](https://github.com/Herofresh/SkillForge/pull/12))
- [x] 3.4 Store the user progression overlay (ADR-016) in SQLite, apply it with `applyOverlay` when loading the tree, and include it in export/import (ADR-028) ([PR #12](https://github.com/Herofresh/SkillForge/pull/12))

### Phase 4: Core UI
- [x] 4.0 Design system (pixel-art × dark fantasy, ADR-030): `docs/DESIGN.md`, tokens in `theme.ts` (contrast-tested), OFL pixel/body fonts with the splash kept until fonts + DB are ready, UI kit in `src/components/ui/` (frames, text, buttons, grid-defined pixel icons, XP/stat bars, level badge, tier chip, warning banner, modal, empty state, level-up burst), restyled tab bar and placeholder tabs, dev-only Style Guide (`/styleguide`), component tests (RNTL), Maestro `styleguide.yaml` ([PR #14](https://github.com/Herofresh/SkillForge/pull/14))
- [x] 4.1 Onboarding: hero name, equipment profiles, goal picking, optional assessment Trials. The assessment may offer any node, including straight-arm ones (ADR-023), with their safeguard warnings shown (ADR-031) ([PR #15](https://github.com/Herofresh/SkillForge/pull/15))
- [x] 4.2 Tree tab, column view: branch tabs, state-framed tiles in chain order with pixel chains and linked cross-branch chips, goal markers, legend (ADR-033) ([PR #17](https://github.com/Herofresh/SkillForge/pull/17))
- [x] 4.3 Node detail: cues, level/XP, prerequisites ✓/✗ with alternatives, set goal, attempt Trial / test out, "unlock anyway" (self-unlock) for locked nodes, history, review status (ADR-033) ([PR #17](https://github.com/Herofresh/SkillForge/pull/17))
- [x] 4.4 Train flow: Train now → profile and time → plan preview (swap/remove/add) → live logging (persisted draft, resume after restart) → summary with XP, level-ups and unlocks (ADR-034) ([PR #18](https://github.com/Herofresh/SkillForge/pull/18))
- [x] 4.x Safeguard warnings in the UI (ADR-023): every `SafeguardWarning` (before a Trial, test-out or self-unlock, during a live session and in the summary) is shown with its message and an acknowledge step; straight-arm ones explain why. Never a hard block. Part of 4.1, 4.3 and 4.4 (the Train part: ADR-034) ([PR #18](https://github.com/Herofresh/SkillForge/pull/18))
- [x] 4.5 Character tab: level + XP, rank crest, pixel attribute radar, balance note, streak, totals, goals along their paths, recent sessions → past session summary (ADR-035) ([PR #19](https://github.com/Herofresh/SkillForge/pull/19))
- [x] 4.6 Settings: hero name, equipment profiles CRUD, export (share sheet) / import with confirmation, readable rejection, undo last import, about/credits, dev Style Guide link (ADR-035) ([PR #19](https://github.com/Herofresh/SkillForge/pull/19))
- [x] 4.7 In-app node editor: add a `user_` node, edit a node's standards/prerequisites/equipment/cues/trains, hide a node, reset to default, "Custom" badges; show `applyOverlay` issues inline and never save a broken tree; overlays keep built-in straight-arm nodes straight-arm and in their branch (ADR-036) ([PR #20](https://github.com/Herofresh/SkillForge/pull/20))
- [x] 4.8 "Suggest to project": share the overlay as YAML (`exportOverlay`) and import someone else's (`importOverlay`) with a preview and merge; link to the contributor guide (ADR-036) ([PR #20](https://github.com/Herofresh/SkillForge/pull/20))

### Phase 5: Graph view and release
- [x] 5.1 Graph view: dagre layout, SVG, pan/zoom, glowing unlocked edges, legendary silhouettes
  (own layered layout instead of dagre, View-drawn edges; ADR-037, [PR #21](https://github.com/Herofresh/SkillForge/pull/21))
- [x] 5.2 Animations and polish: one reveal vocabulary (`BURST_TITLES`, `useLevelUpKey`, node-detail LEVEL UP!), tinted icons keep their outline (`knockout`; Export icon back), "Discard changes?" when leaving the editor with a changed draft, consistent empty states, `npm run e2e` without Maestro on PATH (ADR-038, [PR #22](https://github.com/Herofresh/SkillForge/pull/22))
- 5.3 EAS build profile and Android APK, split in two:
  - [x] 5.3a Build config + local APK script: `eas.json` (development / preview / production, version source local), app.json version 0.1.0 / versionCode 1, `npm run build:apk[:universal]` (ADR-039, [PR #23](https://github.com/Herofresh/SkillForge/pull/23))
  - ~~5.3b EAS cloud build + proper release signing~~ dropped: no Expo account or paid service
    (user decision 2026-10-02, ADR-047). Release signing moved to Phase 7 (7.1–7.2).

#### v0.2.0
- [x] 5.4 Exercise timer (user request 2026-09-28): hold countdown with get-ready, vibration at the target and overtime, stopwatch for other metrics, per-set `durationSec` (additive column, backup version 2), session clock and times in the summary, hold Trials too (ADR-040, [PR #26](https://github.com/Herofresh/SkillForge/pull/26))
- [x] 5.5 Acrobatics branch: rolls, judo breakfalls (ukemi) and the cartwheel path to a legendary aerial, gated on the wall handstand; left out of the rank median (ADR-041, [PR #25](https://github.com/Herofresh/SkillForge/pull/25))
- [x] 5.6 App icon: original pixel-art icon from a code grid (`scripts/appIcon.ts`, `npm run icon:build`): icon, adaptive foreground / background / monochrome, splash, favicon (ADR-042, [PR #24](https://github.com/Herofresh/SkillForge/pull/24))
- [x] 5.7 v0.2.0 release: upgrade-safe over v0.1.0 (same package + signing key, higher versionCode, additive migrations), APK on GitHub; pinned signer check in `build:apk`, release upgrade flows (ADR-043, [PR #27](https://github.com/Herofresh/SkillForge/pull/27); release [v0.2.0](https://github.com/Herofresh/SkillForge/releases/tag/v0.2.0))

#### v0.3.0
- [x] 5.8 Timer extras: pause/resume, buzz at go and at rest end (ADR-044, [PR #30](https://github.com/Herofresh/SkillForge/pull/30))
- [x] 5.9 Edit/delete a logged set, reorder exercises in the live session (ADR-045, [PR #31](https://github.com/Herofresh/SkillForge/pull/31))
- [x] 5.10 Node history opens the past session; replay onboarding from Settings (ADR-046, [PR #29](https://github.com/Herofresh/SkillForge/pull/29))
- [x] 5.11 v0.3.0 release: version 0.3.0 / versionCode 3, upgrade check from v0.2.0 and straight from v0.1.0 (ADR-043 routine, [PR #32](https://github.com/Herofresh/SkillForge/pull/32); release [v0.3.0](https://github.com/Herofresh/SkillForge/releases/tag/v0.3.0))

#### Next
- [x] 5.12 Confirm before removing an equipment profile in onboarding ([PR #34](https://github.com/Herofresh/SkillForge/pull/34))
- [x] 5.13 build:apk checks the signer before copying the APK (ADR-043 update, [PR #35](https://github.com/Herofresh/SkillForge/pull/35))
- [x] Maintenance: stable Jest runs under load: `jest.config.js` (per-checkout cache, `maxWorkers`
  50% outside CI), one 60 s timeout for heavy suites in `jest.setup.ts`, cheaper treeMap/appIcon
  tests ([PR #50](https://github.com/Herofresh/SkillForge/pull/50))

### Phase 6: Feature wave (user requests 2026-10-02)
Work through these in order, one task per branch and PR. Until Phase 7, releases stay on the
debug key: every release must install over the user's current build with all data kept (ADR-043,
upgrade check from every earlier release). Any new table or column is additive and gets a backup
`schemaVersion` bump that still reads the older versions.

- [x] 6.1 Readable numbers: Jersey 15 replaces Pixelify Sans in the pixel roles, so every digit
  is distinct; Style Guide → Digits; screenshots `docs/screenshots/6.1-*.png` (ADR-048, [PR #37](https://github.com/Herofresh/SkillForge/pull/37))
- [x] 6.2 Exercise descriptions (ADR-049, [PR #38](https://github.com/Herofresh/SkillForge/pull/38)): a short plain-language text per node (what the exercise is and
  how it looks, 1–3 sentences, not the cues), new required YAML field `description` for all nodes,
  validator + generated module + contributor guide. Show it (a) in the node detail on top,
  (b) in the Tree (column tile long-press or an info button, and the map node sheet) and (c) in the
  live session and plan preview through an "i" button that opens a sheet with description + cues,
  without leaving the session. The overlay/editor can edit a node's description (custom nodes
  need one). Maestro: open the sheet in `train.yaml` and `tree.yaml`. Screenshots
  `docs/screenshots/6.2-*.png`.
- [x] 6.3a More content: flexibility + mobility (ADR-050, [PR #39](https://github.com/Herofresh/SkillForge/pull/39)):
  - **Flexibility** (5 today) grows to ≥ 10 with yoga-based skills, e.g. pigeon → king pigeon (the
    "dove"), splits (front and middle) progressions, pancake, wheel/bridge variations, lotus prep.
  - **Mobility:** decide in the ADR whether joint mobility (deep squat, ankle, hip CARs, thoracic,
    shoulder flexion, German hang) becomes its own branch `mobility` (≥ 10 nodes, left out of the
    rank median like acrobatics) or stays inside flexibility.
  - Also: reword the `wall_handstand_push_up` and `elbow_lever` descriptions (6.2 review nits).
  - Every new node has `sources`, `description` (6.2), a `verify:` note where values are
    inferred, and stable ids.
- [x] 6.3b More content (ADR-051, [PR #40](https://github.com/Herofresh/SkillForge/pull/40)): other branches under 10 (back lever 7, front lever 5, planche 6,
  h_pull 6, h_push 8, handstand 8, legs 8, dynamic 8, v_pull 9, v_push 9): add real, sourced
  intermediate or accessory steps (e.g. front lever raises / rows, planche leans / pseudo planche
  push-ups, archer rows, shrimp squats). Don't pad: a branch stays under 10 when there's no sourced
  step that fits; write down why in docs/research/progressions.md. Every new node has `sources`,
  `description` (6.2), a `verify:` note where values are inferred, and stable ids.
- [x] 6.3c Saved overlays survive new built-in nodes (ADR-052, [PR #41](https://github.com/Herofresh/SkillForge/pull/41)): found
  in the 6.3b review. A user node placed between two nodes gets the midpoint `order`; 6.3a/6.3b put
  new built-in nodes on exactly such orders (and with higher og_levels), so a saved overlay failed
  `applyOverlay` after the update and the user's nodes vanished from the tree. Fix: order clashes of
  user-placed nodes are resolved in the merged tree (stored data unchanged), an og_level drop next to
  a user-placed node is a warning; regression tests rebuild the v0.3.0 dataset.
- [ ] 6.4 Pixel animations per exercise: a small looping pixel-art figure showing the general
  movement (not anatomically perfect). Proposed approach (confirm in the ADR): a shared
  stick-figure skeleton with joint angles, 2–4 keyframe poses per node defined in data
  (one source of truth, e.g. `content/animations/*.yaml` or a field per node), rasterized to a
  pixel grid in code like the app icon, played with stepped frames (`Easing.steps`, DESIGN.md
  motion rules), equipment drawn as simple props (bar, rings, parallettes, wall, floor). Every
  node gets one; a node without its own falls back to its pattern's generic pose. Shown in the
  node detail and the 6.2 description sheet (Tree and Train). Preview sheet with all animations
  in the dev Style Guide; screenshots for review. Split by branch if needed (6.4a engine +
  a few nodes, 6.4b the rest).
  - [x] 6.4a Engine + generic pattern poses + one branch fully animated (v_pull) + iconic nodes
    (push-up, squat, handstand, front lever, planche) + display (node detail, info sheet, Style
    Guide) (ADR-053, [PR #42](https://github.com/Herofresh/SkillForge/pull/42))
  - [x] 6.4b Per-node animations for all remaining nodes
    - [x] 6.4b-1 bar branches (h_pull, front_lever, back_lever, dynamic, core) ([PR #45](https://github.com/Herofresh/SkillForge/pull/45))
    - [x] 6.4b-2 push/legs branches (h_push, v_push, planche, handstand, legs) ([PR #43](https://github.com/Herofresh/SkillForge/pull/43))
    - [x] 6.4b-3 flexibility/mobility/acrobatics (all 41 nodes; generic `mobility` is now a low
      lunge reach; contact sheets `docs/screenshots/6.4b-{flexibility,mobility,acrobatics}.png`)
      ([PR #44](https://github.com/Herofresh/SkillForge/pull/44))
- [x] 6.5 v0.4.0 release (6.1–6.4 and 6.7): ADR-043 routine, upgrade check from 0.1.0, 0.2.0 and
  0.3.0, including a custom exercise in the overlay ([PR #48](https://github.com/Herofresh/SkillForge/pull/48); release [v0.4.0](https://github.com/Herofresh/SkillForge/releases/tag/v0.4.0))
  - [x] Release prep, 6.3c review fixes: id tie-breaks compare code units (`compareCodeUnits`),
    not `localeCompare`, so order is the same on Hermes as in Node; the node editor shows only the
    advice about the node being edited (`warningsForNode`)
- [x] 6.6 (ADR-055, [PR #49](https://github.com/Herofresh/SkillForge/pull/49)) Android home-screen widget (like Duolingo): shows whether you trained today, the
  streak, the hero's level and rank, a few stats; tapping it opens the Train tab
  (`skillforge://train`). Needs native code: a config plugin / library that works with
  `expo prebuild` and the local `build:apk` (candidate: `react-native-android-widget`; check
  licence and SDK 57 support in the ADR). The app writes the widget's data after every
  session / load and the widget refreshes at midnight so "today" flips. Not testable in Expo
  Go: verify on the emulator with the release APK and add a screenshot.
  - [x] 6.6b widget polish (ADR-056, [PR #51](https://github.com/Herofresh/SkillForge/pull/51)): the layout scales with the widget's size
    (`widgetSizes`; the default 4 × 2 draws at 1.5: bigger status, streak, level, rank and
    attributes, compact layout kept below 220 dp wide); a pixel picker preview
    (`assets/images/widget-preview.png`, `previewImage`, drawn by `npm run icon:build`)
- [x] 6.7 Rank ladder: tapping the rank crest on the Character tab opens all ranks, the reached
  ones and the still locked ones with what each needs (from `character.ts`, no copied
  thresholds) (ADR-054, [PR #47](https://github.com/Herofresh/SkillForge/pull/47))
- [x] 6.8 v0.5.0 release (6.6; 6.7 already shipped in v0.4.0), same routine: upgrade check from
  0.1.0, 0.2.0, 0.3.0 and 0.4.0, then the widget on the upgraded install
  ([PR #52](https://github.com/Herofresh/SkillForge/pull/52); release [v0.5.0](https://github.com/Herofresh/SkillForge/releases/tag/v0.5.0))
- [x] 6.9 Classes (user idea; ADR-057, [PR #54](https://github.com/Herofresh/SkillForge/pull/54)): cosmetic hero classes the hero unlocks and
  picks one to wear. User decisions (2026-10-03): cosmetic only (title, emblem, color; later
  outfits for 6.10), no effect on XP, the generator or the safeguards; classic fantasy-RPG roles;
  locked classes show what they need, like the rank ladder; an unlocked class stays unlocked
  forever. Update the same day: no relative rules ("top attribute", "balanced stats"), only flat
  thresholds (mostly attribute points in one or two attributes) that more training can never
  un-meet, and three escalating tiers per class (e.g. Warrior → Veteran → Warlord), celebrated like
  unlocks. 15 classes in `src/data/classes.ts`, rules in `src/domain/classes.ts`, the setting
  `hero_classes` (no migration, no backup version change), Character tab banner + class sheet,
  Train summary CLASS UNLOCKED! / TIER UP!, class title on the widget.
- [x] 6.9b Weekly class challenge (user approved 2026-10-03; ADR-058, [PR #55](https://github.com/Herofresh/SkillForge/pull/55)): the worn class offers one optional
  weekly challenge relevant to it (e.g. Ranger: 3 sessions with pull work this week), with a small
  bonus and a badge. A suggestion only, never blocking or pressuring (ADR-023 spirit). Bonus size
  and rules are designed in its own ADR first. Done: 15 challenges in `src/data/classes.ts`,
  pinned per week by the first session, flat +50 XP once a week, badge count, Character card,
  summary CHALLENGE COMPLETE!, class sheet line; setting `class_challenges`, no migration.
- [x] 6.10 Companion (user idea; ADR-059, [PR #56](https://github.com/Herofresh/SkillForge/pull/56)): the hero as a small tamagotchi-style
  pixel companion on the Character tab, customizable within limits. **User decisions
  (2026-10-03):**
  - Mood: it can get sad (after several days without training) but it never dies, never gets
    sick, never loses anything; training cheers it up. No punishment (ADR-023).
  - Accessories fit milestones, ranks, levels and classes/tiers, fantasy-RPG styled; every unlock
    rule is flat and monotonic like the classes (once earned, kept forever). The list shown to the
    user is the spec: rank (rope headband, leather bracers, iron circlet, knight's mantle, golden
    crown + golden aura), character level 5/10/20/35/50/75 (traveler's tunic, hooded cloak,
    chainmail vest, runed gauntlets, dragonscale armour, phoenix cloak), milestones (first Trial
    trial medallion, streak 7 ember aura, streak 30 flame aura, first elite-skill Trial star-forged
    halo, 50 sessions veteran's scarf, 100 sessions war banner) and one item for tier I and one for
    tier III of every class. Colour choices for skin, hair and outfit.
  - A weapon slot that is not chosen: the companion carries the worn class's weapon (it identifies
    the class), tier III upgraded, the Recruit a wooden training sword.
  - Widgets: a small one (training status, streak, stats; the existing widget, so placed widgets
    keep working) and a large one (the companion plus a few key stats).
  - Art direction: not the stick figure; an original chibi sprite inspired by SNES-era Final
    Fantasy field sprites and Octopath Traveler (big head, face, hair, clothes, hands, boots;
    selective outline, 3–4 tone shading from the top left, ground shadow; layered parts; idle,
    cheer, sad and victory loops). The exercise animations stay stick figures on purpose.
  Built: `src/lib/sprite.ts` (layered parts, computed shading and outline), a 32 × 40 chibi body
  with its own sprite palette, 46 accessories, 15 class weapons, mood / victory / wave loops,
  `hero_companion` setting (no migration, backups unchanged), Customize sheet, NEW TRINKET! and the
  victory pose on the summary, the large `SkillForgeCompanion` widget.
- [x] 6.10c How it works: explanations and tooltips (user request 2026-10-03: "leave ways in the
  app to understand the systems and offer tooltips for people that are interested") (ADR-060,
  [PR #57](https://github.com/Herofresh/SkillForge/pull/57)). A pure guide module with one entry per system (XP, skill levels and
  Trials, safeguards, attributes, ranks, streak, classes, weekly challenge, companion, generator,
  widgets, backups and data), every number taken from the domain constants; "i" buttons where each
  system appears (Character tab, node detail, Train) that open a short summary with "More in the
  guide"; Settings → "How SkillForge works" lists every entry. Optional only: nothing pops up on
  its own, no onboarding change, no data change.
- [x] 6.11 v0.6.0 release (6.9–6.10c), same routine: upgrade check from 0.1.0, 0.2.0, 0.3.0,
  0.4.0 and 0.5.0, then both widgets on the install upgraded from 0.5.0 ([PR #58](https://github.com/Herofresh/SkillForge/pull/58); release [v0.6.0](https://github.com/Herofresh/SkillForge/releases/tag/v0.6.0))
- [x] 6.12 Widgets use their space (user request 2026-10-03: "I want the widget to use its space
  better or be smaller"; ADR-062, [PR #62](https://github.com/Herofresh/SkillForge/pull/62)): smaller defaults (small 4 × 1, companion 4 × 2), a measured
  layout per size class (narrow / standard / wide / tall / grid) that fills the height without
  clipping (tested at 4- and 5-column launcher sizes), the companion sprite trimmed to its pixels,
  regenerated picker previews.
- [x] 6.13 Companion: cooler look (user request 2026-10-03: "try to make the companion less cute
  and more cool"; ADR-061, [PR #60](https://github.com/Herofresh/SkillForge/pull/60)). Same art direction family (SNES-era FF
  field sprites, Octopath Traveler; original art), from chibi-cute to a cool, heroic hero: taller
  and leaner (head about a quarter of the height, long legs, broad shoulders; canvas 32 × 44),
  narrow determined eyes under a brow, a set mouth, no blush, sharper hair; more contrast, darker
  outlines, deeper shadows, cooler metal; heroic poses (happy raises the weapon, content holds it at
  the shoulder and shifts its weight with a swaying cloak, waiting crosses its arms with the weapon
  planted, sad rests on one knee with the head bowed, victory a fist on the hip and the weapon
  high, the wave a salute with a nod). Every accessory and weapon re-fitted; ids, rules and stored
  data unchanged. **User addition (2026-10-03):** a body choice in Customize, "Man" / "Woman",
  stored additively as `look.body` in `hero_companion` (missing = Man, the body every hero had, so
  nobody sees a surprise change; unknown values dropped; backups carry it); a distinct, equally
  heroic woman (narrower shoulders, softer jaw, lashes, a fitted jerkin with a split travelling
  skirt; practical, not sexualised); hair styles Spiky / Long / Ponytail for both bodies
  (`look.hairStyle`, unset = the body's default).
- [x] 6.14 v0.7.0 release (6.12 widgets, 6.13 cooler companion + Man/Woman), same routine: upgrade
  check from 0.1.0, 0.2.0, 0.3.0, 0.4.0, 0.5.0 and 0.6.0, then both widgets on the install upgraded
  from 0.6.0 ([PR #63](https://github.com/Herofresh/SkillForge/pull/63); release [v0.7.0](https://github.com/Herofresh/SkillForge/releases/tag/v0.7.0))
- [x] 6.15 Session length 15–90 min (user request 2026-10-05: "30 often are no longer than 5
  minutes"): more length options, plan at the user's rest pace and fill longer sessions (ADR-063)
  ([PR #65](https://github.com/Herofresh/SkillForge/pull/65))

### Phase 7: Google Play (local builds, no Expo account, ADR-047)
The first Play upload is **1.0.0, versionCode 8** (user decision 2026-10-05; the code continues
from the GitHub releases' 1–7, ADR-068).

- [x] 7.0a Play hardening: blocked unused permissions, root error boundary,
  unreadable stored overlay no longer blocks startup, picked-file size cap, unused native deps
  checked (kept: expo-router depends on them), `.gitignore` for keys/builds, unknown-route redirect, link-open catches, a "Back to the
  app" exit on a replayed onboarding, scrolling sheets at large text, widget task fallback,
  `eas.json` removed, README refresh (ADR-064, [PR #66](https://github.com/Herofresh/SkillForge/pull/66))
- [x] 7.0b Play texts and data (ADR-065, [PR #67](https://github.com/Herofresh/SkillForge/pull/67); user decisions 2026-10-05 after the pre-Play
  review): health disclaimer in onboarding/About/guide, "OG" → "Tier" in the UI, "not
  affiliated" credit, official source links, research `verify:` notes only in dev builds (safety
  points moved into cues), Auto Backup kept on with honest texts, Settings → Delete all my data
- [x] 7.1 Upload key: **the user** created it with `keytool` on 2026-10-05 (`%USERPROFILE%\keys\`,
  alias `upload`, PKCS12) and keeps two backups outside the repo. Gradle reads the path and
  passwords from `~/.gradle/gradle.properties`, never from the repo (checked: the properties open
  the key; SHA-256 02:7D:80:…:72:5D, pinned in 7.2). CONTEXT.md → "Play build".
- [x] 7.2 `npm run build:aab` (Gradle `bundleRelease`) signed with the upload key; the pinned signer
  check learns the upload key; `build:apk` keeps working for sideloading. `targetSdkVersion`
  meets Play's current requirement (checked in review: 36, from React Native's
  `libs.versions.toml`). (`eas.json` is already gone: 7.0a, ADR-064.) (ADR-066,
  [PR #68](https://github.com/Herofresh/SkillForge/pull/68))
- [x] 7.3 Move existing installs: the Play build has a different signer, so an install of a GitHub
  APK can't update to it. In-app/README guide: export backup → uninstall → install from Play →
  import. Check that a backup from every earlier release imports. Done with the 1.0.0 version
  bump (ADR-068, [PR #70](https://github.com/Herofresh/SkillForge/pull/70))
- [x] 7.4 Privacy policy page on GitHub Pages (free): what the app stores (everything on the
  device), what leaves the device (the user's own exports, Android device backup), no analytics,
  no ads, no account; contact skillforge.application@gmail.com, developer Anriar (the Play developer name).
  https://herofresh.github.io/SkillForge/privacy/ from `site/` (ADR-067), linked in Settings →
  About. Update it whenever a feature changes what is stored or shared (AGENT.md §4).
  ([PR #69](https://github.com/Herofresh/SkillForge/pull/69); live)
- [~] 7.5 Play Console (user, with the agent's help): developer account ($25 once), store listing
  (texts, screenshots, feature graphic from the pixel assets), content rating, data safety form,
  app access, target audience. Done by the user on 2026-10-06: account (developer name Anriar, identity
  check pending), app created, all "App content" declarations (privacy policy, app access, ads: no,
  content rating, target audience 18+, Data safety: no data collected, health apps: fitness), main store
  listing from `docs/play/` (listing.md + graphics/). Left: the 1.0.0 bundle on the closed testing track,
  and re-paste the full description (review of PR #71 corrected two bullets: classes have "up to"
  three tiers, the Recruit has one; deleting all data is a confirmed sheet in Settings, not one tap).
- [ ] 7.6 Closed test: new personal developer accounts must run a closed test (currently 12
  testers for 14 days) before production; collect feedback, fix, then apply for production.
- [ ] 7.7 Production release and an update routine (versionCode +1, AAB upload, release notes).

### Later / Backlog
- Rank pacing for beginners (found 2026-10-06 while making the store screenshots): a demo hero with
  six weeks of balanced training (19 sessions, 3 a week, level 19, 5032 XP) is still rank **Novice**
  ("Branch median Tier 0.5 · Apprentice at Tier 2"). The rank is the median of the branches' best
  passed Trial tier (`RANK_BRANCHES`, ADR-018/054), so a beginner who trains everything evenly stays
  at the bottom for a long time while the level climbs. Look at it after the closed test (ask the
  testers whether ranks feel stuck): e.g. count Proficient nodes, use a lower percentile than the
  median, or add an in-between rank. Changing the formula needs an ADR; ranks already reached must
  never drop (upgrade-safe).
- Source names in exercise notes: two prerequisite notes in content/progressions/handstand.yaml say
  "About 3 x 20-30 s chest-to-wall first (GMB)." (line ~170) and "About 60 s freestanding handstand
  first (GMB)." (~332), shown on the node detail. It's
  attribution, not the listing, but the rest of the UI avoids third-party names since ADR-065
  (sources are credited in Settings → About). Reword without the brand name (keep the `sources:`
  entry) and check the other prerequisite/cue texts for the same.
- Companion headgear readability (after 6.13, ADR-061): with full helmets, hoods and cowls
  (crested_helm, green_hood, nightblade_cowl, shadow_mask) the man and woman read almost the same,
  and faces under helmets are very dark. Ideas: a lighter eye/face pixel under the brim, the
  woman's side locks or long hair showing under hoods/cowls as they already do under iron_helm
- E2E in CI: run the Maestro flows on GitHub Actions with an Android emulator (e.g.
  `reactivecircus/android-emulator-runner`). This probably needs a dev build or APK (5.3) instead of
  Expo Go. Every UI task in Phase 4 should also add or extend a flow in `.maestro/`.
- Maestro against the preview/dev build instead of Expo Go (`appId: at.skillforge.app`, install
  the APK from `npm run build:apk:universal`): no Expo Go dev menu or intro, closer to what users
  run, and a prerequisite for E2E in CI (5.3a, ADR-039)
- Backups: "undo" after an app restart (choose one of the safety copies in `documents/backups/`),
  prune old safety copies (4.6 keeps the last import's copy in memory only, ADR-035)
- Overlay upgrade safety (after 6.3c, ADR-052): a content update that adds a built-in
  prerequisite closing a cycle with a user's edited prerequisites still invalidates the overlay; no
  release does that today. Options: drop the user's closing prerequisite in the merged tree, or a
  dataset check against `RELEASED_POSITIONS`-style snapshots of user edits
- Settings extras: units/preferences once there are any
- Timer extras (after 5.8, ADR-040 / ADR-044): sound, a notification when a hold's target or the
  rest's end passes while the app is in the background, timers for rep Trials, pausing the rest
  countdown
- Train flow extras: shuffle the plan (seed); reorder in the plan preview too (`moveExercise` is
  generic over `SessionPlan`, ADR-045); edit a logged set of another exercise without selecting it
- Weekly plans and scheduling
- Notifications and reminders
- More content: advanced/elite nodes (flexibility, mobility and branch fill-ups are 6.3)
- Optional cloud sync
- Progression editor extras: undo an overlay import, edit patterns/alternatives/regressions/sources
  (4.7–4.8, ADR-036); keep a changed draft across an app kill (5.2 only asks on leaving)
- Polish extras (5.2, ADR-038): haptics on level-up/unlock (expo-haptics, optional), animate a
  newly lit edge on the tree map
- Companion widget at 4 × 3 (after 6.12, ADR-062): the text column is sparse with large gaps, because
  its width (next to the sprite) caps the text scale at ≈ 1.3 while the sprite takes the height. A
  scoring tweak alone doesn't fix it (weighing the text scale squared picks the same layout; cubed
  only shrinks the sprite and leaves more empty height). Ideas: a third text column / the rank and
  class beside the stats at tall sizes, or let the column wrap the status and mood into wider lines
- Widget text and the system font size (after 6.12, ADR-062): widget type is in dp and ignores
  the font-scale setting; if a user asks, map the font scale onto `READABLE_SCALE` (the minimum
  layout scale) so larger system text means a larger minimum, not clipping
- Widget tap after a force stop (6.11): `react-native-android-widget` sends clicks as
  broadcasts, so after "Force stop" a tap does nothing until the app is opened once. Option: an
  activity `PendingIntent` for the plain "open Train" click (needs a look at the library's API)
- E2E (5.8 review): `train.yaml` asserts the rest panel right after set 1, which races the 30 s rest
  when the emulator is slow; wait on something that doesn't expire
