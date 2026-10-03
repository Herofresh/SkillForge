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

## Next up
1. Coordinator: after this PR is merged, publish the GitHub pre-release `v0.5.0` with both APKs
   and their SHA-256 (see the PR body). Then, on the user's phone: install v0.5.0 over the
   installed build (Update, no uninstall), add the SkillForge widget to the home screen and
   report what feels off.
2. 6.9 Classes and 6.10 Companion: waiting for the user's decision on the design proposals.
   Then 6.11 (v0.6.0 release) and Phase 7 (Google Play); the user creates the upload key then
   (7.1).
3. Phase 1.6: verify inferred OG2 levels; Phase 1.10: coach review of the sheet (needs the user to
   find a coach).

## Blockers
- None. The `gh` token now has the `workflow` scope, so agents can push `.github/workflows/*`.

## Handoff notes
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
  0.3.0, including a custom exercise in the overlay ([PR #48](https://github.com/Herofresh/SkillForge/pull/48))
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
  ([PR #52](https://github.com/Herofresh/SkillForge/pull/52))
- [ ] 6.9 Classes (user idea): classes the hero unlocks at certain levels, ranks or attribute
  profiles (e.g. a pull-strong hero unlocks a "Climber" class) and can pick one to display.
  **Starts with a short design proposal for the user** (class list, unlock rules, what a class
  changes: title and look only, no gameplay effect unless the user wants one); then pure rules in
  `src/domain/`, selection stored additively, shown on the Character tab and the widget.
- [ ] 6.10 Companion (user idea, do last): the hero as a small tamagotchi-style pixel character on
  the Character tab, customizable within limits; classes (6.9) and achievements unlock trinkets
  and outfits. **Starts with a design proposal for the user** (what reacts to training, what can be
  customized, which unlocks; no punishing mechanics in the spirit of ADR-023). Reuses the 6.4
  skeleton and pixel renderer.
- [ ] 6.11 v0.6.0 release (6.9–6.10), same routine.

### Phase 7: Google Play (local builds, no Expo account, ADR-047)
- [ ] 7.1 Upload key: **the user** creates it with `keytool` (instructions are given when Phase 6 is
  done) and keeps it outside the repo with two backups. Gradle reads the path and passwords
  from `~/.gradle/gradle.properties` or environment variables, never from the repo.
- [ ] 7.2 `npm run build:aab` (Gradle `bundleRelease`) signed with the upload key; the pinned signer
  check learns the upload key; `build:apk` keeps working for sideloading. `targetSdkVersion`
  meets Play's current requirement (check it). Decide whether `eas.json` goes.
- [ ] 7.3 Move existing installs: the Play build has a different signer, so an install of a GitHub
  APK can't update to it. In-app/README guide: export backup → uninstall → install from Play →
  import. Check that a backup from every earlier release imports.
- [ ] 7.4 Privacy policy page on GitHub Pages (free): what the app stores (everything on the
  device), what leaves the device (only backups/progressions the user shares), no analytics,
  no ads, no account; contact address. Update it whenever a feature changes what is collected.
- [ ] 7.5 Play Console (user, with the agent's help): developer account ($25 once), store listing
  (texts, screenshots, feature graphic from the pixel assets), content rating, data safety form,
  app access, target audience.
- [ ] 7.6 Closed test: new personal developer accounts must run a closed test (currently 12
  testers for 14 days) before production; collect feedback, fix, then apply for production.
- [ ] 7.7 Production release and an update routine (versionCode +1, AAB upload, release notes).

### Later / Backlog
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
- Replay onboarding extras (5.10, ADR-046): a "Back to the app" exit on the hero step during a
  replay (today: finish it, or restart the app)
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
- E2E (5.8 review): `train.yaml` asserts the rest panel right after set 1, which races the 30 s rest
  when the emulator is slow; wait on something that doesn't expire
