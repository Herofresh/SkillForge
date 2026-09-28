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

## Next up
1. Phase 5: 5.2 animations and polish (level-up and unlock reveal; the map could animate a newly
   lit edge), then 5.3 EAS build profile and Android APK.
2. Phase 1.6: verify inferred OG2 levels; Phase 1.10: coach review of the sheet (needs the user to
   find a coach).

## Blockers
- None. The `gh` token now has the `workflow` scope, so agents can push `.github/workflows/*`.

## Handoff notes
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
    pruning old safety copies, replay onboarding, units/preferences (none exist), linking the node
    detail history to the past-session screen.
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
- [ ] 5.2 Animations and polish (level-up and unlock reveal)
- [ ] 5.3 EAS build profile and Android APK

### Later / Backlog
- E2E in CI: run the Maestro flows on GitHub Actions with an Android emulator (e.g.
  `reactivecircus/android-emulator-runner`). This probably needs a dev build or APK (5.3) instead of
  Expo Go. Every UI task in Phase 4 should also add or extend a flow in `.maestro/`.
- Backups: "undo" after an app restart (choose one of the safety copies in `documents/backups/`),
  prune old safety copies (4.6 keeps the last import's copy in memory only, ADR-035)
- Settings extras: replay onboarding, units/preferences once there are any
- Node detail history rows could open the past-session screen (`app/session/[sessionId]`)
- Hold stopwatch and a full rest timer (4.4 has a basic countdown from `restEndsAt`; sound/vibration, pause)
- Train flow extras: reorder exercises, shuffle the plan (seed), edit or delete a logged set
- Weekly plans and scheduling
- Notifications and reminders
- More content: advanced/elite nodes, full flexibility branch
- Optional cloud sync
- Progression editor extras: undo an overlay import, edit patterns/alternatives/regressions/sources,
  an "unsaved changes" prompt when leaving the editor (4.7–4.8, ADR-036)
