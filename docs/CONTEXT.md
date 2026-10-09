# SkillForge — Context & Lookup Reference

This is the quick reference for agents: architecture, glossary, formulas, commands.
Keep it current (see AGENT.md §4). Sections marked *(planned)* describe the approved design but haven't
been implemented yet.

## Stack versions
Expo SDK 57 (`expo` 57.0.x), React Native 0.86, React 19.2, expo-router 57, TypeScript 6.0 (`strict`),
Jest 29 with `jest-expo`, ESLint 9 (flat config) with `eslint-config-expo`, and Prettier 3.
Persistence: `expo-sqlite` 57, `drizzle-orm` 0.45 (expo-sqlite driver), `drizzle-kit` 0.31,
`zustand` 5 (ADR-026). Backups: `expo-file-system`, `expo-sharing`, `expo-document-picker` 57 (ADR-028).
UI (ADR-030): `react-native-svg` 15, `@expo-google-fonts/jersey-15`, `silkscreen`,
`alegreya-sans`, `react-native-reanimated` 4; component tests with `@testing-library/react-native`
14 + `test-renderer`. Exercise timer (ADR-040): `expo-keep-awake` 57 and React Native's `Vibration`
(`android.permission.VIBRATE` in `app.json`).

## Architecture map

What exists today: the root and tabs layouts, the four tab screens,
`src/components/theme.ts`, `src/lib/clamp.ts`, and the
Phase 1 progression pipeline (`content/progressions/`, `scripts/`, `src/domain/types.ts`,
`tier.ts`, `overlay.ts`, `src/data/*`) and the Phase 2 game engine (`xp.ts`, `progression.ts`,
`safeguards.ts`, `character.ts`, `recompute.ts`, `generator.ts`, `src/lib/curve.ts`, `median.ts`,
`time.ts`, `hash.ts`), and the Phase 3 persistence (`src/db/`, `src/store/`, `DataGate`, the stored
overlay and backups), the Phase 4.0 design system (`docs/DESIGN.md`, `src/components/ui/`,
`app/styleguide.tsx`), the 4.1 onboarding (`app/onboarding/`, ADR-031) and the 4.2/4.3 Tree tab and
node detail (`app/(tabs)/tree.tsx`, `app/node/`, `src/components/tree/`, `src/components/node/`,
ADR-033) and the 4.4 Train flow (`app/(tabs)/train.tsx`, `app/train/`, `src/components/train/`,
`src/domain/train.ts`, `trainView.ts`, ADR-034) and the 4.5/4.6 Character tab and Settings
(`app/(tabs)/character.tsx`, `settings.tsx`, `app/session/`, `src/components/character/`,
`settings/`, `equipment/`, `src/domain/characterView.ts`, `src/lib/radar.ts`, ADR-035) and the
4.7/4.8 node editor and shared progressions (`app/node/[nodeId]/edit.tsx`, `app/progressions/`,
`src/components/editor/`, `src/domain/nodeEditor.ts`, `overlayEdit.ts`, ADR-036) and the 5.1 tree map
(`src/components/tree/map/`, `src/domain/treeMap.ts`, `src/lib/viewport.ts`, ADR-037) and the 5.4
exercise timer (`src/domain/setTimer.ts`, `src/components/timer/`, ADR-040). Files marked *(planned)* don't exist yet. Empty folders hold a `.gitkeep`.

```
app/                    expo-router screens (UI only, no game logic)
  _layout.tsx           root Stack + dark navigation theme, loads the fonts, wrapped in DataGate;
                        exports ErrorBoundary (RootErrorScreen, "Try again" = retry, PLAN 7.0a)
  +not-found.tsx        unknown route (e.g. a mistyped skillforge:// link) → Redirect to "/" (7.0a)
  styleguide.tsx        DEV ONLY: catalogue of tokens, components and icons (Settings → Style Guide)
  index.tsx             redirects "/" to /tree (/train while a session is in progress), or to
                        /onboarding until onboarding is completed
  (tabs)/_layout.tsx    bottom tabs: Tree · Train · Character · Settings (pixel icons, ink/gold rules);
                        redirects to /onboarding while `onboardingCompletedAt` is unset
  (tabs)/tree.tsx       skill tree (PLAN 4.2, ADR-033): Columns | Map tabs (TreeModeTabs, the `treeMode`
                        setting); Columns = branch tabs + one FlatList column of NodeTiles with
                        chains/linked chips, Legend sheet; Map = TreeMap of the whole tree (5.1, ADR-037);
                        a tile's "i" / long press (map: long press) opens ExerciseInfoSheet (6.2)
  node/[nodeId]/        node detail stack screens (PLAN 4.3, ADR-033)
    index.tsx           header (state, level, XP), About (the description, 6.2), actions (goal,
                        Attempt Trial, Unlock anyway sheet), prerequisites ✓/✗ + alternatives,
                        trains, standards, cues, history, review
    trial.tsx           Trial attempt: warnings to acknowledge, steppers, logTrial, outcome + burst
    edit.tsx            "Edit progression" (PLAN 4.7, ADR-036): NodeEditorBody on nodeDraft(nodeId)
  progressions/         the user's tree changes (PLAN 4.7–4.8, ADR-036), stack screens
    index.tsx           "My progressions": every change (open / reset / show / delete), the notes
                        for `overlayIssues` and `overlayUnreadable` (7.0a), SharePanel
                        (share YAML, import, suggest to project + contributor guide link)
    new.tsx             "Add custom exercise" (?branch=&after=): NodeEditorBody on newNodeDraft
    import.tsx          paste or pick shared YAML → preview (changes, "replaces yours", issues) → merge
  (tabs)/train.tsx      Train now (profile chips, 15–90 min chips → planTraining) or "Resume session"
  train/                Train flow stack screens (PLAN 4.4, ADR-034)
    preview.tsx         plan by block: sets × target, rest, markers, notes, warnings to acknowledge;
                        swap / remove / add → Start session
    session.tsx         live session: header with the session clock (SessionClock), current exercise
                        + SetLogger (with the exercise timer), RestPanel, session list, skip, add,
                        finish / abandon (confirm dialogs)
    summary.tsx         total XP + bonuses, per-exercise outcome/XP, level-up and unlock bursts,
                        streak, SessionResult warnings acknowledged before Done
  (tabs)/character.tsx  character sheet (PLAN 4.5, ADR-035): hero, level + XP, rank crest (opens
                        the rank ladder sheet, PLAN 6.7), pixel
                        radar + stat bars, balance note, streak/totals, goals, recent sessions
  session/[sessionId].tsx  a past session's summary (SessionResultPanels), from the Character
                        history and the node detail's history rows (PLAN 5.10); unknown id → not found
  (tabs)/settings.tsx   Settings (PLAN 4.6, ADR-035): hero name, equipment profiles (rename,
                        confirmed remove), backup export/import/undo, replay onboarding (5.10,
                        ADR-046), "How SkillForge works" (GuidePanel: the guide + the widgets' "i",
                        6.10c), about/credits, Style Guide
  guide/                "How SkillForge works" (PLAN 6.10c, ADR-060), stack screens
    index.tsx           every guide entry (GuideRow: icon, title, summary) → its page
    [topic].tsx         one entry (GuideArticle: summary, details) + "Next: <title>"; unknown → note
  onboarding/           first-run flow (PLAN 4.1, ADR-031), a Stack; every step saves through the store
    _layout.tsx         Stack; redirects to /tree once onboarding is completed
    index.tsx           1 welcome + "Name your hero" (setHeroName)
    equipment.tsx       2 Home/Park tag chips, add/remove (confirmed) profiles (equipment CRUD)
    goals.tsx           3 branch tabs + node rows, 1–5 goals (toggleGoal); each row's "i"
                        (`goal-<id>-info`) / long press opens ExerciseInfoSheet (FB-2)
    assessment.tsx      4 optional: anchors on the goal paths + search → trial/[nodeId]; rows have
                        the "i" too (`anchor-<id>-info`, `search-<id>-info`)
    trial/[nodeId].tsx  Trial form: warnings to acknowledge, a stepper per set, logTrial, result + burst;
                        the skill row (`trial-node`) has the "i"
    summary.tsx         5 "Your journey begins": hero, level, goals, tested out → completeOnboarding
content/progressions/   SOURCE OF TRUTH for skill content (ADR-016)
  <branch>.yaml         one file per branch, one block per node (human-editable)
  README.md             field guide for coaches and contributors
scripts/
  progressions.ts       CLI behind npm run progressions:check|build|review (runs via tsx)
  progressionSources.ts Node-only file access shared by the CLI and the dataset test
  lockfile.ts           npm run lockfile:check|fix (plain Node, ADR-029)
  e2e.ts                npm run e2e: finds Maestro (MAESTRO_BIN, ~/.maestro install, PATH), sets
                        MAESTRO_CLI_NO_ANALYTICS, runs .maestro/ or the flows passed after `--`
  buildApk.ts           npm run build:apk[:universal] (tsx, ADR-039): prebuild, restore package.json,
                        local.properties, gradlew assembleRelease, signer check, then copy to
                        builds/ + SHA-256; npm run build:aab (--aab, ADR-066): upload-key check,
                        clean prebuild, bundleRelease for every ABI, keytool signer check
  buildApkConfig.ts     its pure parts (args, ABIs, SDK path, APK/AAB names, commands, the pinned
                        signers RELEASE_SIGNER_SHA256 (debug key, sideload APKs) and
                        UPLOAD_SIGNER_SHA256 (Play upload key) with their checks), Jest-tested
docs/play/              Google Play store listing kit (PLAN 7.5): listing.md (title, descriptions, release
                        notes, store settings), graphics/ (512 px icon, 1024 x 500 feature graphic,
                        six 1080 x 1920 screenshots, make-graphics.ps1 for the first two)
site/                   public GitHub Pages site (ADR-067), deployed by .github/workflows/pages.yml:
  index.html            landing page (what the app is, links, contact)
  privacy/index.html    the privacy policy (https://herofresh.github.io/SkillForge/privacy/); update it
                        and its date whenever stored data, permissions or sharing change (AGENT.md §4)
  style.css, icon.png   the app's palette and icon
plugins/
  withUploadSigning.js  config plugin (ADR-066): `upload` signing config from the SKILLFORGE_UPLOAD_*
                        Gradle properties, used by release only with -PskillforgeUploadSigning;
                        ndk debugSymbolLevel SYMBOL_TABLE (tested in withUploadSigning.test.ts)
  appIcon.ts            the app icon as a 32×32 pixel grid (roles → Palette keys), the asset list
                        (paths, sizes, cell size per layer) and the preview sheet (PLAN 5.6, ADR-042)
  iconBuild.ts          npm run icon:build: renders appIcon.ts to assets/images/*.png + the preview,
                        and widgetPreview.ts to assets/images/widget-preview.png and
                        widget-companion-preview.png
  widgetPreview.ts      the widget picker previews: both widgets at their default size (small 4 × 1,
                        companion 4 × 2) with sample values, placed by src/widget/widgetLayout.ts
                        (icons, sprite + colors from the app, tinyFont text; PLAN 6.6b, 6.12)
  raster.ts, png.ts     tiny RGBA raster helpers and a minimal PNG encoder on node:zlib (no image deps)
  animationSheet.ts     contact sheets of the exercise animations (a row of frames per animation,
                        labelled with tinyFont.ts, a 3×5 pixel font); animationSheetBuild.ts is the
                        npm run animations:sheet CLI (PLAN 6.4, ADR-053); renderFrameSheet also
                        draws companionSheetBuild.ts, the npm run companion:sheet CLI (PLAN 6.10)
src/
  domain/               PURE TS game rules. No React/Expo/DB imports (ADR-009)
    types.ts            single source of shared types (nodes, issues, overlay, logged sets, progress)
    tier.ts             tierForOgLevel (tier is derived, never stored)
    overlay.ts          user overlay: applyOverlay (+ straightArmEditIssues, ADR-036;
                        userPlacedIds / resolveOrderClashes + warnings, upgrade-safe, ADR-052),
                        exportOverlay/importOverlay (text), overlayToRaw/overlayFromRaw (data: DB row,
                        backups), isEmptyOverlay, OVERLAY_FILE_* / PROGRESSIONS_GUIDE_URL
    overlayEdit.ts      overlay changes from the editor (ADR-036): nodeEditFor (diff to built-in),
                        withNode, withoutNodeChanges (reset/delete), withHidden, customizationOf,
                        customizedNodeIds, overlayEntries / describeOverlayEntry, mergeOverlays,
                        overlayImportPreview
    nodeEditor.ts       node editor draft (ADR-036): newCustomNode, placeAfter, customNodeId, steppers
                        (range, Trial, OG, prerequisite level), prerequisite/equipment/cue/trains
                        edits, prerequisiteOptions, issueSection / issuesBySection / editorIssueText
    backup.ts           backup file format (ADR-028): serializeBackup, parseBackup (validates
                        everything before an import), backupFileName, BACKUP_SCHEMA_VERSION
    xp.ts               units, difficulty/outcome multipliers, exercise and session XP, streak
    progression.ts      node XP curve, level-5 cap, Trials, test-out, node states, unlocks
    safeguards.ts       ADR-010 tendon rules (advisory, ADR-023): straight-arm Trial clock, 60 s
                        budget, 48 h rest, and the SafeguardWarning producers
    character.ts        character level, attributes (PATTERN_ATTRIBUTES, trains), rank, balance warning
    generator.ts        on-demand workout generator: frontier, scoring, equipment substitution,
                        slots, double progression (ADR-024), filling the time (ADR-063)
    sessionTime.ts      time estimate (rests, work, setup) and the user's rest pace from the logged
                        sets' timestamps (restPace, ADR-063); shared by the generator and preview
    recompute.ts        applySession / applyUserAction (reducer steps) + recompute (fold over
                        sessions and user actions), ADR-008/021/023
    equipment.ts        HOME_EQUIPMENT, PARK_EQUIPMENT, DEFAULT_EQUIPMENT_PROFILES (seeded),
                        EQUIPMENT_TAG_LABELS, toggleEquipmentTag
    onboarding.ts       normalizeHeroName, toggleGoal (MAX_GOALS 5), ONBOARDING_STEPS, onboardingSummary,
                        parseOnboardingCompletedAt, onboardingCompletionAt (first completion kept)
    assessment.ts       goalPathNodes, assessmentAnchors (≤ 6), searchNodes, trial results +
                        trialSession (a Trial as a session), testOutWarnings, unlockedByTrial
    format.ts           formatPerformance / formatTrial ("3 sets of 8 reps"), METRIC_UNITS,
                        formatCountdown, formatClock ("0:42", "1:02:05")
    branch.ts           nodesInBranch (column order)
    treeView.ts         Tree/detail view models: TileState, branchColumn, treeTile (chainAbove, links),
                        prerequisiteViews (alternatives, satisfiedBy), branchSummary, defaultBranch,
                        nodeHistory, nodeDetail
    treeMap.ts          Tree map (PLAN 5.1, ADR-037): TreeMode / parseTreeMode, nodeLayers, mapLayout
                        (layers left → right, branch lanes, elbow edges; once per tree), mapTiles
                        (treeTile per node + met edges), boundsOf, mapFocus, routeRects
    train.ts            Train session model (ADR-034): SessionPlan / ActiveSession, sessionPlan,
                        swapOptions / addOptions, replace/remove/addExercise, startSession,
                        logSessionSet (pairs alternate; takes the timer's durationSec),
                        markedPerformance, skip, rest, start/stop/clearSetTimer (5.4),
                        pause/resumeSetTimer (5.8), moveExercise / canMoveExercise (pairs
                        move as one), editSessionSet, deleteSessionSet (dense setIndex) (5.9,
                        ADR-045), projectedSets, finishedSession, warningKey, parseActiveSession
    setTimer.ts         exercise timer (PLAN 5.4, ADR-040): timerModeFor (hold countdown with
                        GET_READY_SECONDS, else stopwatch), readTimer (phase, clock, measured
                        seconds from timestamps, paused time left out), measuredSeconds,
                        pause/resume/stopTimer + isPaused (5.8, ADR-044), timerCue / restCue
                        (TimerCue go / target / rest_end, CUE_MAX_GAP_MS), formatTimerClock,
                        timerCaption, spokenTimer, timedPerformance, elapsedSeconds, totalDurationSec
    trainView.ts        Train view models: blockViews, exerciseView, liveView, summaryView (with the
                        stored session: time per exercise, session time), loggedSetText
                        ("8 reps · 0:42"), sessionDurationSec, BLOCK_LABELS, OUTCOME_LABELS;
                        liveView's logged sets carry setIndex + editStart, and moves per exercise
    characterView.ts    Character tab view model (ADR-035): characterSheet, radarAxes, nextRank,
                        rankHint, activeStreak, characterTotals, balanceNote, recentSessions,
                        goalProgress
    rankLadder.ts       rank ladder view model (PLAN 6.7, ADR-054): rankLadder (every rank with
                        reached/current/next/locked, branches at its level, branches below),
                        branchesForMedian, rankRequirement, rankProgressText
    classes.ts          hero classes (PLAN 6.9, ADR-057): classFacts, ruleParts / ruleMet (flat
                        thresholds), reachedTier, mergeClassUnlocks (tiers kept forever), classLadder
                        (class sheet rows), wornClass, sessionClassTierUps, NEW badges (seen tiers),
                        parseClassSettings / classSettingsToRaw (the `hero_classes` setting)
    companion.ts        the companion (PLAN 6.10, ADR-059): companionMood (happy / content /
                        waiting / sad by local days since the last session), moodLine, MOOD_TITLES,
                        companionFacts + companionRuleProgress (flat accessory rules),
                        mergeAccessoryUnlocks (kept forever), sessionAccessoryUnlocks,
                        companionLoadout (choice, cleared, else the grandest earned per slot),
                        companionWardrobe (customize sheet rows), equipAccessory, the
                        `hero_companion` setting reader / writer
    challenges.ts       weekly class challenges (PLAN 6.9b, ADR-058): classChallenge /
                        weeklyChallenge (goal + target per tier, local Mon–Sun week),
                        challengeContribution (per session; straight-arm never counts),
                        advanceChallenge (the engine step), challengeProgress, pins (pinWeek,
                        pinAt, weeklyChallenges, parse / toRaw of `class_challenges`), challengeView
    guide.ts            "How SkillForge works" (PLAN 6.10c, ADR-060): GUIDE_TOPICS, guideFacts()
                        (every number the text uses, from the owning modules), buildGuide(facts)
                        (formatting only; the test rebuilds it with every fact changed and fails on
                        a number typed into the text), GUIDE, guideEntry, isGuideTopic
    widget.ts           home-screen widget data (PLAN 6.6, ADR-055): widgetSnapshot (app state →
                        JSON-safe WidgetSnapshot), widgetView (snapshot + now → trained today via
                        isSameLocalDay, streak via activeStreak), parseWidgetSnapshot, topAttributes,
                        WIDGET_DEEP_LINK (skillforge://train)
  data/
    progressionFormat.ts  THE YAML <-> ExerciseNode parser/normalizer (build, tests, overlay)
    validate.ts         graph/content rules: validateNodes, validateTree (overlay: issues + warnings,
                        ADR-052), formatIssue
    progressionBuild.ts buildMatrix, renderGeneratedModule, renderReviewSheet (pure)
    classes.ts          HERO_CLASSES: the 15 hero classes as typed data (ids, tiers with rules,
                        flavor, color, 12×12 emblem), the one place for class thresholds (ADR-057)
    companion/          the companion sprite as typed data (PLAN 6.10, ADR-059)
      accessories.ts    ACCESSORIES: 46 accessories (slot, flavour, flat unlock rule), the one place
                        for their rules
      body.ts           SPRITE_SIZE (32 × 44, the one size constant), BODY_SHAPES (man / woman:
                        head, torso, arm inset), HAIR_STYLES (spiky / long / ponytail), arm and leg
                        poses, frame anchors (BodyFrame, STAND, armPlacement), faces, regions
      art.ts            ACCESSORY_ART (head / back / front parts, region recolours, auras) and
                        WEAPON_ART (one per class, tier III material swaps), GEAR_LEGEND
      weapons.ts        CLASS_WEAPONS + weaponFor(classId, tier): the worn class's weapon
      moods.ts          COMPANION_ANIMATIONS: frame loops per mood, the victory pose, the wave
      looks.ts          the sprite palette (ramps per material, skin / hair / outfit options),
                        companionRole, companionColors(look)
      index.ts          companionFrame / companionFrames / companionStill (grids for app, widget,
                        sheets)
    credits.ts          About screen content: CONTENT_SOURCES, NOT_AFFILIATED_NOTE, FONT_CREDITS,
                        OFL_CREDIT
    notices.ts          texts shown in several places (ADR-065): HEALTH_DISCLAIMER (+ title),
                        DATA_STORAGE_NOTE (on this phone; Android's device backup may include it),
                        STORE_SWITCH_NOTE (GitHub ↔ Play needs export, reinstall, import; ADR-068)
    testFixtures.ts     synthetic nodes for unit tests
    skills/
      index.ts          ALL_NODES, NODE_BY_ID (what the app imports)
      progressions.generated.ts  GENERATED from the YAML; never edit
      dataset.test.ts   real dataset is valid and the generated files are fresh
      crossBranchGates.test.ts  content checks: key gates, straight-arm flags, Home paths
      releasedPositions.ts  test data: node positions of the last release (overlay upgrade test, ADR-052)
      branches.ts       BRANCH_NAMES (display names)
    animations/         exercise animations as typed data (PLAN 6.4, ADR-053), the one source
      index.ts          NODE_ANIMATIONS, PATTERN_ANIMATIONS, animationFor(node) (own, else the
                        first pattern's), ANIMATION_CATALOGUE (Style Guide)
      pose.ts           authoring helpers: figure({ hip, torso, hands, feet, pin }) solves limbs (IK)
      generic.ts        one generic animation per Pattern; iconic.ts; v_pull.ts (whole branch)
      h_push.ts …       h_push, v_push, planche, handstand, legs.ts: whole branches (6.4b-2)
      flexibility.ts, mobility.ts, acrobatics.ts  whole branches (6.4b-3); floorPoses.ts: legVia/armVia
                        (front views), turned + resting (rolls)
      animations.test.ts  ids exist, v_pull + iconic covered, every node resolves, frames in bounds,
                        pinned hands stay on their bar
  db/                   persistence (ADR-026): stores and loads, maps rows <-> domain types
    schema.ts           Drizzle tables (see Data model)
    migrations/         GENERATED by `npm run db:generate` (SQL + journal + migrations.js); never edit
    database.ts         AppDb type, createDatabase(client) (foreign keys on)
    openAppDatabase.ts  opens skillforge.db with expo-sqlite (app only)
    migrate.ts          migrateDatabase: version guard, migrations, schema_version, first-run seed
    defaults.ts         writeDefaults: hero profile, Home and Park, defaults_seeded_at (seed + wipe)
    activeSessionRepository.ts  the Train draft row (get/save/clear, ADR-034)
    *Repository.ts      session, userAction, goal, equipmentProfile, nodeProgress (cache), profile,
                        settings, meta, overlay: small sync functions taking AppDb (or a transaction)
    userDataRepository.ts  readUserData / replaceUserData (all user tables, one transaction);
                        deleteAllUserData (wipe + writeDefaults, one transaction, meta schema kept)
    rowGuards.ts        oneOf/optional checks for values read back
    testing/            TEST-ONLY: nodeSqliteClient (expo-sqlite API on node:sqlite), testDatabase (ADR-027)
  store/                Zustand store: UI actions -> domain -> repositories
    appStore.ts         createAppStore(deps): loadAll, logSession, selfUnlock, setGoals, equipment
                        profile CRUD, generateWorkout(profileId, minutes, seed?), saveOverlay,
                        exportBackup, importBackup, shareBackup, importBackupFromFile; onboarding:
                        onboardingCompletedAt, setHeroName, toggleGoal, logTrial, testOutWarnings,
                        completeOnboarding, replayOnboarding (in memory only, ADR-046),
                        onboardingReplay + leaveOnboardingReplay ("Back to the app", 7.0a);
                        overlayUnreadable (a stored overlay row that doesn't read, 7.0a); node detail: selfUnlockWarnings; Train (ADR-034):
                        trainPlan / activeSession / trainSummary, planTraining, swap/remove/add,
                        trainWarnings, acknowledgeTrainWarning, startTraining, logTrainingSet,
                        editTrainingSet / deleteTrainingSet / moveTrainingExercise (5.9),
                        skip/select/rest, finishTraining, abandonTraining; sessionResults (per
                        session, PLAN 4.5); classes + selectClass / markClassesSeen (PLAN 6.9, re-checked
                        in every engine commit, `hero_classes` setting); companion + equipAccessory /
                        setCompanionLook / markAccessoriesSeen (PLAN 6.10, accessories re-checked
                        after the class tiers, `hero_companion` setting); challengePins (PLAN 6.9b: the
                        first session of a week pins the worn class's challenge, `class_challenges`
                        setting, passed to every recompute / applySession); lastImport + undoLastImport (PLAN 4.6); editor (ADR-036):
                        baseNodes, nodeDraft, newNodeDraft, nodeDraftIssues, saveNodeDraft,
                        resetNode, setNodeHidden, exportOverlay, shareOverlay, previewOverlayImport,
                        importOverlay (merge), pickOverlayFile; deleteAllData (PLAN 7.0b, ADR-065:
                        deleteAllUserData, files.deleteAppFiles, loadAll, dataResets + 1)
    backupFiles.ts      device file access (expo-file-system, expo-sharing, expo-document-picker);
                        a picked file over MAX_IMPORT_FILE_BYTES is refused before it is read (7.0a);
                        deleteAppFiles: safety copies, skillforge-* cache exports, picker copies,
                        widget snapshot
    bootstrap.ts        startApp(): open, migrate, create store, loadAll (once)
    useAppStore.ts      useAppStore(selector) hook for components below DataGate
    fixtures/           backup files written by each published release (releaseBackups.test.ts,
                        ADR-068)
  components/           reusable UI components (visual language: docs/DESIGN.md, ADR-030)
    theme.ts            THE design tokens: Palette, Colors, TierColors, AttributeColors, FontFamily,
                        TypeScale, PIXEL, Spacing, Border, Frames, ButtonStyles, Motion (no RN
                        imports, so tsx scripts can read it)
    navigationTheme.ts  NavigationTheme for expo-router's ThemeProvider (from Colors)
    palette.ts          the raw Palette hex values (no RN imports, so Node scripts such as the app
                        icon build can use them; theme.ts re-exports it, ADR-042)
    theme.test.ts       contrast of every text/fill pair (>= 4.5:1, bars >= 3:1)
    fonts.ts            FONT_ASSETS for useFonts (keys = FontFamily names)
    NodeRow.tsx         a node as a list row: icon, name, tier chip, OG level, straight-arm tag, status;
                        `onInfo` adds the "i" (`<testID>-info`) and a long press for the info sheet
    onboarding/OnboardingScaffold.tsx  step bar "STEP n / 5", title, scrolling body, Back/Skip/Next footer;
                        "Back to the app" while `onboardingReplay` (PLAN 7.0a)
    RootErrorScreen.tsx what the root ErrorBoundary shows: EmptyState + "Try again" (no store, 7.0a)
    BranchTabs.tsx      the 14 branches as horizontal pixel tabs (goal picker, Tree tab)
    SafeguardWarningList.tsx  WarningBanner per SafeguardWarning + useAcknowledgements (ADR-023)
    stackHeader.ts      stackHeaderOptions(title) for pushed stack screens
    trial/              useTrialAttempt (warnings, results, log) + TrialSetsPanel / TrialOutcome,
                        shared by the onboarding and node-detail Trial screens
    tree/               NodeTile (+ GoalMarker), ChainLink, PrereqChip, TreeLegend, TreeModeTabs,
                        tileLook (state → icon, label, tone, description; tileAccessibilityLabel,
                        tileStateLabel shared by tiles and map nodes)
      map/              TreeMap (pan/pinch/double-tap on a GestureHandlerRootView, Reanimated
                        transform; Focus, zoom −/+, "Switch to list"), MapCanvas (lane bands, edge
                        lines as Views), MapNode (fixed-size state-framed node button)
    node/               node detail parts: NodeHeader, DetailSection, PrerequisiteList,
                        NodeHistoryList (rows open the past session), AttributeChips (re-exports
                        ATTRIBUTE_LABELS from components/attributeLabels.ts, RN-free), UnlockSheet;
                        ExerciseInfoSheet (description + cues, the one sheet for Tree and Train, 6.2)
                        and InfoButton (the "i" that opens it; the guide's "i" too)
    guide/              the guide's UI (PLAN 6.10c): GuideButton (an InfoButton that opens
                        GuideSheet: the entry's summary + "More in the guide"), GuideRow /
                        GuideArticle (the guide screens), GUIDE_ICONS, SafeguardGuideNote ("Why these
                        warnings?" above a list with a tendon warning)
    train/              Train flow parts: ExerciseCard (prescription, rest, markers, "i" via
                        onInfo), SetLogger
                        (timer + stepper + Log / Partial / Failed; logged-set lines open the
                        edit sheet), EditSetSheet (edit / delete a logged set, 5.9), RestPanel
                        (countdown, buzz at its end),
                        SessionClock (elapsed session time), NodeOptionSheet (swap/add picker),
                        TrainWarningList (warnings acknowledged by key)
    timer/SetTimerPanel.tsx  the exercise timer of one set (PLAN 5.4): Start hold / Start set →
                        clock, Pause / Resume (5.8), Stop / Done, Cancel / Reset; buzzes at "go"
                        and at a hold's target, keeps the screen awake while it ticks
                        (expo-keep-awake). Train SetLogger and the hold Trials' TrialSetsPanel
    timer/vibration.ts  CUE_VIBRATIONS (the pattern per TimerCue, SHORT/LONG_BUZZ_MS, BUZZ_GAP_MS)
                        and buzz(cue) over React Native's Vibration (ADR-044)
    train/SessionResultPanels.tsx  XP, streak, level-ups, unlocks, exercises of a SessionResult
                        (Train summary and past session)
    character/          AttributeRadar (rasterized pixel radar), RankCrest (RANK_ICONS; a
                        button with onPress), RankLadderSheet (PLAN 6.7), ClassEmblem / ClassBanner /
                        ClassSheet / ClassUnlockPanel + classText.ts (PLAN 6.9), ChallengeCard /
                        ChallengeProgressPanel + challengeText.ts (PLAN 6.9b), CompanionCard /
                        CompanionSprite / CompanionSheet / CompanionVictory / TrinketUnlockPanel +
                        useCompanion.ts + companionText.ts (PLAN 6.10), SessionHistoryRow,
                        GoalProgressCard
    equipment/EquipmentProfileEditor.tsx  profile cards with tag chips + add form + the "Remove?"
                        confirmation (onboarding, Settings)
    settings/           BackupPanel (export, import confirm, rejection issues, undo), AboutPanel,
                        ProgressionsPanel (count of tree changes → My progressions),
                        ReplayOnboardingPanel (confirm → replayOnboarding), DeleteDataPanel
                        (what goes, export first, acknowledge → deleteAllData; 7.0b), GuidePanel
                        ("How SkillForge works": open the guide, the widgets' "i"; 6.10c)
    HealthNotice.tsx    the framed health disclaimer (onboarding step 1, About; ADR-065)
    editor/             node editor (PLAN 4.7–4.8, ADR-036): NodeEditorBody (screen body: live
                        issues, Save/Cancel), NodeEditorForm (sections with inline IssueNotes),
                        PositionSheet, IssueNotes, CustomBadge, OverlayEntryRow, SharePanel;
                        leaving with a changed draft opens a "Discard changes?" sheet (5.2)
    node/CustomizeSection.tsx  "Your tree" on the node detail: edit, add after, reset, hide/delete
    editor.test.tsx     component tests: editor add/cycle/save, unsaved-changes guard (real store),
                        custom tag, entry row
    character.test.tsx  component tests: radar, crest, goal card, history row, profile editor,
                        backup panel (real store, fake files)
    train.test.tsx      component tests of the Train parts (SetLogger timer, SetTimerPanel with
                        fake timers: pause / resume, buzz at go and target; RestPanel buzz,
                        summary times)
    liveSession.test.tsx  the live session screen with a real store: edit / delete a logged set,
                        reorder (PLAN 5.9)
    trial.test.tsx      component tests: TrialSetsPanel timers per hold set
    tree.test.tsx       component tests: tiles, chains, prerequisite list, unlock sheet (real store)
    DataGate.tsx        keeps the splash until fonts + startApp are done; error screen on failure
    ui/                 the UI kit; import from '@/components/ui'
      *.tsx             Screen, PixelFrame, PixelText, PixelButton, PixelIcon, SegmentedBar, XPBar,
                        StatBar, LevelBadge, TierChip, WarningBanner, PixelModal, EmptyState,
                        LevelUpBurst (+ BURST_TITLES), PixelTextInput, PixelChip, NumberStepper,
                        (PixelModal's content scrolls past SHEET_MAX_HEIGHT_SHARE of the window, 7.0a;
                        a list inside a sheet that scrolls by itself sets nestedScrollEnabled),
                        PixelAnimation (looping exercise figure, 6.4), PixelSprite (stepped frames
                        of any pixel grids on the UI thread; PixelAnimation and the companion use it)
      KeyboardSafeView.tsx  keeps a screen body above the soft keyboard (RN KeyboardAvoidingView,
                        padding, offset = its own pageY; FB-1, ADR-069). Used by `Screen
                        avoidKeyboard` (screens with a text field), OnboardingScaffold (around
                        content + footer) and PixelModal (sheets shrink to the room left)
      useKeyboardShown.ts  whether the soft keyboard is open; footers/sheets drop the bottom
                        safe-area inset while it is (the keyboard covers the navigation bar)
      figurePalette.ts  FIGURE_COLORS: animation roles → Palette keys (also used by the sheet script)
      useLevelUpKey.ts  replay key for a LEVEL UP! burst when a level rises while mounted (5.2)
      useNow.ts         the screen clock: re-renders once a second while active (rest, timers)
      icons.ts          12x12 pixel icon grids + role colors (ICONS, ICON_NAMES, iconGrid,
                        iconCellColor: tint with `knockout` roles left empty, 5.2; iconSvg: an icon
                        as an SVG string for the home-screen widget, 6.6)
      frameGeometry.ts  notched-corner rects for PixelFrame
      ui.test.tsx       component render tests (RNTL); icons.test.ts, frameGeometry.test.ts
  lib/                  generic helpers: importFile.ts (MAX_IMPORT_FILE_BYTES 5 MB,
                        importFileSizeProblem: the "too large" message, 7.0a), clamp.ts, deepEqual.ts, curve.ts (geometric level curves), median.ts,
                        time.ts (MS_PER_HOUR/DAY/WEEK, currentTime for UI handlers, isSameLocalDay), hash.ts (FNV-1a, seeded tie-breaks),
                        id.ts (createId for local records), compare.ts (compareCodeUnits: id tie-breaks,
                        same order on Hermes as in Node), contrast.ts (WCAG ratio),
                        pixelGrid.ts (icon grid → runs, gridPaths, gridSvg: a standalone SVG string
                        for the widget), segments.ts (litSegments for bars),
                        radar.ts (spoke points, polygon rasterized into cells), viewport.ts
                        (pan/zoom worklets: zoomAround, clampPan, fitBox), figure.ts (side-view
                        stick figure: Pose, jointsOf, interpolatePose, solveLimb), figureRaster.ts
                        (pose + props → 32×32 role grid), figureAnimation.ts (keyframes → stepped
                        frames, FRAME_MS, stillFrame) (PLAN 6.4, ADR-053), sprite.ts (layered
                        sprites: SpriteCanvas, parts with material / region legends, top-left
                        shading, selective outline, glow, sparkles, ground shadow; PLAN 6.10)
  widget/               Android home-screen widget (PLAN 6.6, ADR-055; react-native-android-widget)
    widgetModule.ts     THE guard: widgetsAvailable() (Android + native module `AndroidWidget`),
                        loadNativeWidget() requires nativeWidget.tsx only then (Expo Go, Jest: undefined)
    widgetLayout.ts     pure (no library, no RN): what goes where at a widget size (PLAN 6.12,
                        ADR-062). A layout tree (WidgetNode: box / text / icon / sprite), measured
                        with the fonts' real advance widths and line heights (textWidthDp,
                        lineHeightDp); every size class (narrow, standard, wide, tall, grid) at every
                        scale (widgetSizes(scale)), the best that fits wins: widgetLayout (small),
                        companionLayout (sprite size too); placeWidgetNodes = the flex positions
                        (preview, tests)
    nativeWidget.tsx    turns the layout tree into the library's primitives: the small
                        SkillForgeWidget (WIDGET_NAME) and the large SkillForgeCompanionWidget
                        (COMPANION_WIDGET_NAME, the companion sprite as an SVG, PLAN 6.10),
                        registerWidgetTask (draws by widgetName; a plain "SkillForge" fallback
                        that opens the app if drawing fails, 7.0a), redrawWidgets (both);
                        the only file that imports the library ('use no memo': no React Compiler)
    widgetStorage.ts    the snapshot file `widget-snapshot.json` in the document directory
                        (write / read / deleteWidgetSnapshot)
    widgetSync.ts       startWidgetSync(store) from bootstrap: write + redraw after loadAll, on
                        engine/nodes changes, after a wipe (dataResets) and on foreground
                        (syncWidget, tested with fakes)
index.ts                app entry (package.json main): expo-router/entry + the widget task registration
assets/images/          app icon, adaptive icon layers, splash, favicon, widget-preview.png,
                        widget-companion-preview.png: GENERATED by
                        npm run icon:build
docs/                   PLAN, DECISIONS, CONTEXT, DESIGN (visual language), research
  screenshots/          emulator screenshots per UI task (<phase>-<screen>.png)
  research/node-manifest.md  planned MVP nodes (ids, order, OG level, prerequisites)
  review/progression-matrix.md  GENERATED coach review sheet
.github/workflows/ci.yml  CI (Node 24): typecheck, lint, format:check, test, progressions:check
app.json                Expo config: version + android.versionCode (the one version source,
                        ADR-039), package at.skillforge.app, adaptive icon, plugins (incl. the
                        widgets: default / min / max size, 30-min update, fonts copied into the
                        APK, ADR-055, ADR-062); android.blockedPermissions strips the template's
                        SYSTEM_ALERT_WINDOW and READ/WRITE_EXTERNAL_STORAGE (7.0a). No eas.json (ADR-064)
android/, builds/       GENERATED, gitignored: prebuild's native project and the copied APKs
drizzle.config.ts       drizzle-kit config (sqlite, expo driver, schema -> src/db/migrations)
babel.config.js         babel-preset-expo + inline-import for .sql (also used by Jest)
metro.config.js         Expo default + `sql` source extension
jest.config.js          Jest config: jest-expo preset, path aliases, per-checkout cache (node_modules/.cache/jest),
                        maxWorkers 50% outside CI
jest.setup.ts           Jest: Reanimated/Worklets JS mocks for component tests, a react-native-android-widget mock,
                        the 60 s timeout for heavy suites (src/components, scripts/appIcon)
.maestro/               E2E flows: editor.yaml (clearState; custom exercise with a prerequisite,
                        cycle error, reset, My progressions share/import/delete, discard-changes
                        sheet; 4.7/4.8/5.2 screenshots), character.yaml (clearState; rank ladder, class sheet, weekly challenge 0 → 1 → 2 / 2 with
                        CHALLENGE COMPLETE!, level/XP after a session, history → past session; 4.5 / 6.7 / 6.9 / 6.9b
                        screenshots; subflows/log-short-session.yaml), settings.yaml (profile add/remove, export share
                        sheet, import cancel, replay onboarding; 4.6 screenshots), map.yaml (Tree Map: zoom, pan, double tap,
                        focus, open a node, back to Columns; 5.1 screenshots), onboarding.yaml (fresh install, clearState), smoke.yaml (tabs + DB
                        proof), styleguide.yaml (UI kit), train.yaml (clearState; plan, live session,
                        kill + resume, edit a logged set, reorder, summary; takes the 4.4 / 5.9 screenshots), tree.yaml (clearState; branch, detail, goal,
                        Trial, unlock anyway; takes the 4.2/4.3 screenshots); subflows/finish-onboarding.yaml (not run
                        on its own) finishes onboarding from any step
```

**Path alias:** `@/*` → `src/*` (and `@/assets/*` → `assets/*`). It's defined in `tsconfig.json`
(Metro reads it) and mirrored in `jest.config.js` → `moduleNameMapper`. Change both together.

**Content flow:** `content/progressions/*.yaml` → `npm run progressions:build` (parse with
`progressionFormat.ts`, check with `validate.ts`) → `progressions.generated.ts` + review sheet → app
imports `ALL_NODES` → at runtime `applyOverlay(ALL_NODES, userOverlay)` gives the user's tree.

**Dataset (155 nodes, all `review.status: draft`):**

| Branch | Nodes | Branch | Nodes | Branch | Nodes |
|---|---|---|---|---|---|
| `h_push` | 11 | `front_lever` | 10 | `core` | 10 |
| `v_push` | 10 | `back_lever` | 10 | `legs` | 12 |
| `v_pull` | 10 | `planche` | 10 | `dynamic` | 10 |
| `h_pull` | 10 | `handstand` | 11 | `flexibility` | 17 |
| `acrobatics` | 13 | `mobility` | 11 | | |

The 88 manifest nodes plus `straight_bar_dip` (Home dip, ADR-017) and the 13-node **acrobatics**
branch (rolls, judo breakfalls, cartwheel → round-off → legendary aerial; PLAN 5.5, ADR-041). All
acrobatics nodes are `skill: true` floor work with only `balance`/`mobility`(/`explosive`)
patterns, so the generator puts them in skill slots and the 48 h pattern rest never holds them back.
PLAN 6.3a (ADR-050) grew **flexibility** to 17 (yoga paths: pigeon → king pigeon, half split →
front split, butterfly → frog → pancake → middle split, half lotus → lotus, full bridge → one-leg
wheel) and added the 11-node **mobility** branch (CARs, ankle rocks, open book, wall angel, 90/90,
deep squat hold, cossack squat, three-point bridge, overhead squat). Both are plain `mobility`
pattern work (`skill: false`), so the generator only puts them in the goal-driven cool-down slot.
PLAN 6.3b (ADR-051) filled every other branch to at least 10 with 30 OG2 / BWF-chart steps (lever
and planche variants, lever rows, planche push-ups, ring push-ups and dips, one-arm push-up and
row, L-sit pull-up, shrimp squats, nordic curl, ring muscle-up, ring shoulder stand, elevated
straddle press); no existing node gained a hard gate on a new one.
Content checks beyond the validator
(cross-branch gates, straight-arm flags, a Home path per pattern) are in
`src/data/skills/crossBranchGates.test.ts`. With the Home profile only `parallel_bar_dip` (dip bars),
`iron_cross`, `ring_push_up`, `ring_dip`, `ring_muscle_up`, `ring_shoulder_stand` (rings) and the
four human flags (pole) are out of reach.

**Data flow:** UI → store action (`src/store/appStore.ts`) → repository persists the history entry
(`sessions` + `session_sets`, or `user_actions`) → domain step (`applySession` /
`applyUserAction`, or `recompute` for an entry in the past) → `node_progress` cache rewritten →
store state set → UI re-renders. **Start-up:** `DataGate` → `startApp` → open → `migrateDatabase`
→ `loadAll` (read overlay → `applyOverlay(ALL_NODES, overlay)` = `state.nodes` → read history →
`recompute` → rewrite cache) → screens render. **Overlay edit:** `saveOverlay(overlay)` →
`applyOverlay` issues? return them, write nothing : store the row → `loadAll`. The editor
(ADR-036) builds that overlay from a draft (`withNode`, `withoutNodeChanges`, `withHidden`) and
checks it live with `nodeDraftIssues` before Save; an import previews `mergeOverlays(current,
shared)` the same way.

**Backup flow (ADR-028):** export: `exportBackup` / `shareBackup` → `readUserData` →
`serializeBackup` → share sheet. Import: `importBackupFromFile` (document picker) → `importBackup`
→ `parseBackup` (all checks; issues → nothing written) → safety copy of the current data to
`documents/backups/` → `replaceUserData` (one transaction) → `loadAll`.

**Engine flow:** a finished `LoggedSession` goes through `applySession(state, session, tree)` →
new `EngineState` (progress per node, total XP, streak, last straight-arm session, last applied
history position) + a `SessionResult` (exercise outcomes and XP, bonuses, level-ups, Trials,
unlocks, advisory `warnings`) for the summary screen. A self-unlock is a `UserAction` that goes
through `applyUserAction(state, action, tree)` → new state + `UserActionResult` (unlocked ids,
warnings). `computeCharacter(tree, state.progress, state.totalXp)` gives the character sheet. After
a formula change, an import or an overlay edit, `recompute(tree, allSessions, allActions)` rebuilds
the state with the same steps (`canApplyIncrementally` says when that is needed). `tree` is
`applyOverlay(ALL_NODES, overlay).nodes`.

**Warnings flow (ADR-023):** nothing in the engine blocks the user. Before an attempt the UI asks
`nodeUseWarnings(node, status, progress, lookup, now)` (Trial / test-out) and
`sessionSafeguardWarnings(sets, lookup, state.lastStraightArmSessionAt, now)` (live session), shows
the `SafeguardWarning`s and lets the user acknowledge them; after logging, the same warnings come
back in `SessionResult.warnings`. The generator never suggests work that would trigger a
`warning`-severity safeguard (ADR-024).

## Glossary

| Term | Meaning |
|---|---|
| **Node** | One exercise in the skill tree (e.g. `tuck_front_lever`). Authored in `content/progressions/<branch>.yaml`. |
| **Tier (UI)** | What the UI calls a node's Overcoming Gravity 2 level (`ogLevel`, YAML `og_level`, 0–17; 0 = "Foundation"): "Tier 6" (`formatOgLevel`, ADR-065). The code and the docs keep the OG name. Distinct from the hero class tiers I–III and from the code's `Tier` bands below (shown only as Beginner … Elite). |
| **Research note** | A node's `verify:` note: what is inferred or a placeholder. Shown on the node detail only in development builds (`__DEV__`); safety advice belongs in the cues (ADR-065). |
| **Overlay** | The user's own changes on top of the built-in matrix: `added` (`user_` nodes), `edited` (partial overrides), `hidden` ids. Merged and validated by `applyOverlay` (ADR-016). |
| **User-placed node** | A user node, or a built-in node whose edit sets branch, order or og_level. Its order clashes are resolved in the merged tree and an og_level drop next to it is a warning, so a content update can't invalidate a saved overlay (ADR-052). |
| **Hero class** | A cosmetic title the hero earns (PLAN 6.9, ADR-057): `HERO_CLASSES` in `src/data/classes.ts`. Every class but the starting Recruit has three **tiers** (e.g. Warrior → Veteran → Warlord) of flat thresholds (attribute points, sessions or rank) that only grow with training. Reached tiers are derived on every engine change and kept forever in the `hero_classes` setting; the hero wears one class. No effect on XP, the generator or the safeguards. |
| **Companion** | The hero as a small JRPG field sprite (a man or a woman, cool and heroic since 6.13) on the Character tab, the Train summary and the large widget (PLAN 6.10 / 6.13, ADR-059 / ADR-061). Its **mood** (happy / content / waiting / sad) follows the calendar days since the last session and only changes its pose and one line; it never loses anything. It wears **accessories** (`ACCESSORIES`, five slots) that flat rules over rank, level, class tiers, sessions, best streak and Trials earn and that are kept forever in the `hero_companion` setting, the worn class's **weapon** (upgraded at tier III), and the hero's body, hair style and skin / hair / outfit colours. Cosmetic only. The exercise animations stay stick figures on purpose. |
| **Weekly class challenge** | An optional goal the worn hero class offers for each calendar week (PLAN 6.9b, ADR-058), e.g. Ranger "Pull work in 2 sessions". The first session of a week **pins** it (`class_challenges` setting), so switching classes changes it only next Monday. Completing it pays `CLASS_CHALLENGE_BONUS_XP` once and counts as a badge; missing it costs nothing. Straight-arm work never counts; the generator and the safeguards ignore it. |
| **Widget snapshot** | The small JSON (`WidgetSnapshot`: level, rank, the engine's streak, `lastSessionAt`, top 3 attributes, optionally the worn hero class and tier, PLAN 6.9) the app writes to `widget-snapshot.json` for the home-screen widget. The widget derives "trained today" (same local calendar day as `lastSessionAt`) and the active streak from it at render time (ADR-055). |
| **Session plan / active session** | The Train flow's editable plan preview (`SessionPlan`, in memory) and the started session (`ActiveSession`, the `active_session` draft) with its logged sets; `finishedSession` turns it into a `LoggedSession` (ADR-034). |
| **Edit / reorder in the live session** | Tap a logged set's line to change its result (stepper, Save / Partial / Failed against its own prescription; its time stays) or delete it (confirmed; later sets move up, so `setIndex` stays the dense logging position). "Reorder" shows Up / Down per exercise; a strength pair moves as one (PLAN 5.9, ADR-045). |
| **Exercise timer** | The optional timer of the set being done (PLAN 5.4, ADR-040): a hold counts down from the target after a 3 s get-ready, vibrates and counts on past it ("+7 s"); other metrics get a stopwatch. It can be paused and resumed (5.8, ADR-044; the paused time is not measured). Stored as timestamps plus the paused time (`ActiveSession.timer`), so it survives an app kill, paused too; the measured whole seconds become the set's `durationSec` (a hold's stepper gets the seconds held). |
| **Timer cue** | A moment the phone buzzes (PLAN 5.8, ADR-044): `go` (a hold's get-ready ends: one short buzz), `target` (the hold reaches its target: two long buzzes), `rest_end` (the rest countdown reaches zero: three short buzzes). Only while the screen sees the moment pass; no sound, no background notification. |
| **Custom node / custom tag** | A node the user added (`user_` id) or edited through the node editor; shown with a "Custom" tag. "Reset to default" removes the edit; a custom node is deleted instead. Overlays can't clear `straightArm` on, or move, a built-in straight-arm node (ADR-036). |
| **Shared progressions** | The overlay as YAML (`exportOverlay`), shared from My progressions. Importing one merges it into the user's overlay after a preview (`mergeOverlays`, ADR-036). |
| **Stored overlay** | The one current overlay in `progression_overlay`; the store's tree is `applyOverlay(ALL_NODES, overlay).nodes`. An overlay with issues is never saved; a stored one that stops applying is kept and reported as `overlayIssues` (ADR-028); a stored row that doesn't read at all is kept, the app starts on the built-in tree and reports it as `overlayUnreadable` (ADR-064). |
| **Backup** | A JSON file of all user data (`skillforge-backup`, `schemaVersion`). Import validates the whole file first and then replaces all data in one transaction; never a merge or a partial import (ADR-028). |
| **Safety copy** | The backup of the current data that `importBackup` writes to `documents/backups/skillforge-before-import-<UTC>.json` before it replaces anything; importing it undoes the import. |
| **Description** | A node's 1–3 plain sentences on what the exercise is and what it looks like (not the cues; PLAN 6.2, ADR-049). Required on built-in nodes (`validateNodes`), at most `MAX_DESCRIPTION_LENGTH` (300) characters; a user node saved before 6.2 may have `''` (shown as "No description yet…") and the editor asks for one on its next save. |
| **Exercise info sheet** | `ExerciseInfoSheet`: name, description and cues over the current screen. Opened by the "i" (`InfoButton`) on Tree tiles, plan-preview cards, the live session's current exercise and onboarding's goal, assessment and Trial rows (`NodeRow onInfo`, FB-2), or a long press on a tile / map node / onboarding row. Never navigates in Train; adds "Open skill" in the Tree. |
| **Guide** | "How SkillForge works" (PLAN 6.10c, ADR-060): one entry per system (`GUIDE_TOPICS`: xp, skills, safeguards, attributes, ranks, streak, classes, challenge, companion, generator, widgets, data), a 1–3 sentence summary and details. Every number comes from the owning module's constants (`guideFacts`). Reached through a `GuideButton` "i" next to the system (Character tab, node detail, plan preview, session summary, warning lists, Settings → widgets) or Settings → How SkillForge works. Never opens on its own. |
| **Exercise animation** | A small looping pixel figure doing the exercise (PLAN 6.4, ADR-053): 1–4 keyframe poses of a side-view stick figure (hip position + absolute joint angles) plus props (floor, wall, bar, rings, rail, parallettes, dip bars, box, pole), interpolated into stepped frames and rasterized to a 32×32 grid. A node without its own animation shows its first pattern's generic one. Shown in the node detail's About panel and the exercise info sheet; reduce motion shows the still keyframe. |
| **Source** | `core` (built-in YAML) or `user` (from the overlay). |
| **Review status** | `draft` or `coach_reviewed`, per node, with free-text `review.notes`. |
| **Verify note** | A node's `verify:` text: something still uncertain (the `TODO(verify)` flag, ⚠ on the review sheet). |
| **Branch** | A progression family, e.g. `planche` or `v_pull`. Nodes in a branch form a chain ordered by `chainOrder`. |
| **Acrobatics** | The ground tumbling and safe-falling branch (rolls, judo breakfalls / ukemi, cartwheel path). Trains balance and mobility, sits in skill slots, and does not count towards the rank median (ADR-041). |
| **Flexibility vs. mobility** | Two branches (ADR-050). `flexibility` is passive range: stretches and yoga poses held for time (splits, pancake, pigeon, lotus, bridge) plus the warm-up staples wrist prep and band dislocates. `mobility` is active range: moving a joint through its range under your own control (CARs, ankle rocks, open book, wall angel, deep squat hold, overhead squat). Flexibility counts towards the rank median, mobility does not. |
| **Prerequisite** | An edge from another node that must reach `minLevel`. `hard` edges lock the node; `recommended` edges only show a warning. |
| **ogLevel** | Cross-branch difficulty from 0 to 17, taken from the Overcoming Gravity 2 charts (ADR-007). 0 = foundation exercise below OG2 level 1 (ADR-016). |
| **Tier** (band, code `Tier`) | Beginner 0–5 · Intermediate 6–8 · Advanced 9–12 · Elite 13+ (derived by `tierForOgLevel`). |
| **Metric** | What a node measures: `reps`, `hold_s`, `eccentric_s`, or `load_xbw` (load as a multiple of bodyweight). |
| **Unit** | Normalized volume: 1 rep = 2 s hold = 3 s eccentric = 1 unit. |
| **Working range** | The prescribed training range for a node, e.g. 5–8 reps or 10–30 s. |
| **Trial** | A node's advancement standard (e.g. 3×8, 3×30 s). Passing it lifts the level-5 cap. |
| **Proficient** | Node level 5 with the Trial passed. Unlocks successor nodes. |
| **Mastered** | Node level 10. |
| **Banked XP** | XP earned while capped at level 5 before passing the Trial. It's applied once the Trial is passed. |
| **Frontier** | The trainable nodes (available, training or self-unlocked) reached by walking a goal's unmet hard prerequisites; a goal without unmet ones is its own frontier. The generator weights them by how far they are from the goal (critical path first). |
| **Working sets** | At least `MIN_WORKING_SETS` (2) sets of one node in one session. Only they count for pattern recency, last performance and stagnation; the 1-set warm-up items don't. |
| **Workout plan** | The generator's output: blocks (`warm_up`, `skill`, `strength` pairs, `core`, `cool_down`) of `PlannedExercise`s (`sets`, `target`, `restSec`, `isTrial?`, `substitutedFrom?`), an estimate in minutes, advisory warnings and notes. A suggestion the user can edit. |
| **Equipment profile** | A named set of equipment tags, e.g. Home or Park, chosen at session start (ADR-005). |
| **Straight-arm budget** | About 60 s total of straight-arm holds per session is recommended (ADR-010). Going over it gives a warning, not a block (ADR-023). The sets of one straight-arm Trial don't count (Trial-day exception, ADR-025). |
| **Trial day** | A session whose straight-arm work is one due straight-arm Trial and nothing else; the generator suggests it when that Trial is due (ADR-025). |
| **Test-out** | Passing a Trial on any node without training it first, including straight-arm nodes and locked nodes (ADR-023). Sets the node to level 5 / proficient and unlocks successors. |
| **Self-unlock** | The user unlocks a locked node themselves (`UserAction` kind `self_unlock`, stored in history). The node is no longer `locked` and can be trained; its unmet prerequisites stay listed (ADR-023). |
| **Advisory safeguard** | A safety rule (ADR-010 tendon rules, prerequisites) that the engine computes and the UI shows as a `SafeguardWarning` with an acknowledge step, but that never blocks the user. The generator's suggestions always respect it (ADR-023). |
| **Safeguard warning** | `{ code, nodeId?, message, severity }`: `straight_arm_min_weeks`, `straight_arm_budget`, `straight_arm_rest` (`warning`), `prerequisites_unmet` (`info`). |
| **Attribute contribution** | The points a trained node adds to each attribute it trains: `difficultyMult(ogLevel) × node level`. Which attributes comes from its patterns (`PATTERN_ATTRIBUTES`) or its `trains` override (ADR-023). |
| **Outcome** | How an exercise went vs. its prescription: `success`, `partial` (≥ 50 % of prescribed units), `failed`. |
| **Streak** | Consecutive sessions at most 72 h apart. Adds a character-XP bonus. |
| **Engine state** | Derived state rebuilt from history (sessions and user actions): node progress, total XP, streak, last straight-arm session, last applied position (`src/domain/recompute.ts`). |
| **Tree map** | The Tree tab's Map mode: the whole tree as a pan/zoom graph, layers (longest hard-prerequisite chain) left to right, one lane per branch, hard prerequisites as lines lit gold once met (ADR-037). |
| **Onboarding** | The first-run flow (hero name, equipment, goals, optional assessment, summary). Shown until the setting `onboarding_completed_at` exists (ADR-031). Settings → Replay onboarding shows it again for the running app, with all data kept (ADR-046). |
| **Assessment** | Onboarding's optional step: log a Trial for anchor nodes on the goal paths (or any searched node); a passed one is a test-out. Stored as ordinary Trial sessions. |
| **Anchor node** | One of up to 6 nodes spread evenly (by ogLevel) over the goals and their transitive hard prerequisites (`assessmentAnchors`). |
| **Legendary node** | An elite node shown as a locked silhouette, there for motivation. |
| **Tile state** | How the tree shows a node: the engine's node state, or `legendary` for a locked legendary node (`tileState`, ADR-033). |
| **Chain / linked chip** | In the column view, a hard prerequisite on the node right above is drawn as a pixel chain (gold when met); any other hard prerequisite is a chip under the tile that opens that node. |
| **Character sheet** | The Character tab's view model (`characterSheet`): level, rank, radar axes (attributes normalised to the largest), balance note, streak now, totals, goal progress, recent sessions (ADR-035). |
| **Goal progress** | Proficient nodes on a goal's path (the goal + its transitive hard prerequisites) / path length, plus the next open, not-locked path node. |
| **Undo last import** | Re-importing the safety copy of the last import in this app run (`undoLastImport`); kept in memory only (ADR-035). |
| **Unlock anyway** | The node detail's self-unlock for a locked node: acknowledge `selfUnlockWarnings`, then `selfUnlock` (ADR-023, ADR-033). |

## Node states
`locked` → (all hard prerequisites met) → `available` → (first logged set) → `training` →
(level 5 and Trial passed) → `proficient` → (level 10) → `mastered`. A passed Trial (including a
test-out from any state, even `locked`) goes straight to `proficient`. A self-unlock takes a
`locked` node to `available` without meeting its prerequisites (ADR-023). A hard prerequisite with
`minLevel` ≥ 5 needs that node proficient; a node's `alternatives` also satisfy prerequisites on it
(ADR-019). A prerequisite node counts only once it was trained or its Trial passed.

## Formulas *(Phase 2, ADR-018, 019, 021, 023; tune the constants in the owning module only)*

- **Set units** (`xp.ts`): `reps` → reps · `hold_s` → s / 2 · `eccentric_s` → lowerings × s / 3 ·
  `load_xbw` → reps × load (1 rep at 1×BW = 1 unit). A missing rep count is 1.
- **difficultyMult(ogLevel)** = 1 + 0.25 × ogLevel.
- **Outcome** of an exercise (all sets of one node in a session): `success` if every set met its
  prescription; `partial` if achieved units (each set capped at its prescription) ≥ 50 % of
  prescribed units; else `failed`. `outcomeMult` = 1.0 / 0.6 / 0.3.
- **Exercise XP** = round(units done × difficultyMult × outcomeMult). This is also the node XP.
- **Session XP** = Σ exercise XP + completion bonus (10 % if no set skipped) + streak bonus
  (5 % per consecutive session after the first, max 25 %; sessions ≤ 72 h apart) + the weekly
  class challenge bonus (flat `CLASS_CHALLENGE_BONUS_XP` = 50, only on the session that completes
  the week's challenge; PLAN 6.9b, ADR-058). Bonuses are character XP only.
- **Node level** (`progression.ts`): cumulative XP per level 0, 20, 47, 83, 133, 199, 289, 410, 573, 794
  (20 XP, ×1.35 per step), times the node's difficultyMult. Capped at level 5 until the Trial is
  passed; XP above the level-5 threshold is banked and counts once the Trial passes. A passed Trial
  lifts XP to at least the level-5 threshold (test-out).
- **Trial passed** = at least `trial.sets` Trial sets in one session, each ≥ `trial.target` (and ≥
  `trial.reps` lowerings/reps where used), on any node whose Trial isn't passed yet. Never blocked.
- **Safeguards** (`safeguards.ts`, advisory): a straight-arm Trial is recommended 6 weeks after the
  node's first logged set (never trained = not yet); ≤ 60 s straight-arm hold time per session
  (non-hold sets 2 s per unit; `straightArmSecondsUsed` is the one measure) not counting the
  Trial-day exception (`budgetExemptTrialSets`: the Trial sets of the first straight-arm node with
  any, at most its `trial.sets`; ADR-025); ≥ 48 h between straight-arm sessions (session start
  times, a Trial session included).
  Violations are `warning` `SafeguardWarning`s; a locked node trained or tested, or a self-unlock
  with unmet hard prerequisites, gives an `info` `prerequisites_unmet`.
- **Character level** (`character.ts`): 100 XP to level 2, ×1.1 per level, max 99.
- **Attributes** (points): attribute = round(sum over the trained nodes that train it of
  `difficultyMult(ogLevel) × node level`). A node counts once it has XP (trained or tested out);
  its level is capped at 5 until the Trial. What a node trains = its `trains` list if set, else the
  union of `PATTERN_ATTRIBUTES` over its patterns: horizontal_push, vertical_push → push ·
  horizontal_pull, vertical_pull → pull · straight_arm_push → push + core · straight_arm_pull →
  pull + core · squat, hinge → legs · core → core · balance → balance · mobility → mobility ·
  explosive → nothing. Example: tuck planche (OG 5) at level 5 adds 2.25 × 5 = 11.25 to push and core.
- **Attribute peaks:** highest ogLevel of a proficient node that trains the attribute (same mapping).
- **Rank** from the median over the 12 `RANK_BRANCHES` (every branch except the `NON_RANK_BRANCHES`
  `acrobatics` and `mobility`, ADR-041, ADR-050)
  of each branch's highest proficient ogLevel:
  Novice < 2 ≤ Apprentice < 6 ≤ Adept < 9 ≤ Master < 13 ≤ Legend.
  `rankMedianOgLevel(branchLevels)` is that median; the rank ladder (PLAN 6.7, ADR-054) reads it too.
- **Rank ladder:** a rank is surely reached once `branchesForMedian(12)` = 7 rank branches (more
  than half) have a peak at its level; with an even count a high middle value can make up for a
  lower one, so a rank can also come with 6. The ladder shows "n of 7 branches at OG x or higher".
- **Balance warning:** |push peak − pull peak| > 2 OG levels.
- **Hero class tiers** (PLAN 6.9, ADR-057): a tier is reached when every part of its rule holds:
  `stats` = each listed attribute ≥ its points, `sessions` = logged sessions ≥ count, `rank` =
  rank ≥ the named one. Tiers count from I and stop at the first missed one. Thresholds only in
  `src/data/classes.ts` (e.g. Warrior push 30 / 120 / 300).
- **Companion mood** (PLAN 6.10, ADR-059): `d` = local calendar days from the last session to now
  (`localDaysBetween`): `d = 0` happy, `1 ≤ d ≤ CONTENT_MAX_DAYS` (2) content, `≤ WAITING_MAX_DAYS`
  (5) waiting, later sad; no session yet = waiting. Constants in `src/domain/companion.ts`.
- **Companion accessories**: earned when the rule holds (`rank` ≥, `level` ≥, `class` tier ≥,
  `sessions` ≥, best `streak` ≥, passed `trials` ≥, `eliteTrial` = a Trial passed on an
  elite-tier node); kept forever. Rules only in `src/data/companion/accessories.ts`.
- **Weekly class challenge** (PLAN 6.9b, ADR-058): week = local Monday 00:00 to the next Monday
  00:00 (`localWeekBounds`, 167 / 169 h across DST), stored with the pin. Count = Σ per session in
  the window of its contribution: done sets (value > 0) on known, non-straight-arm nodes; 1 per
  session (`sessions`, `complete_sessions` without a skipped set (straight-arm sets are ignored
  in that check too), `sessions_training` training every
  listed attribute) or per node (`exercises_training`, `trial_attempts`). Target per tier in
  `HERO_CLASSES[].challenge.targets`. Completed when count ≥ target; the session that crosses it
  gets the bonus, at most once per week.

## Generator *(Phase 2.5, ADR-024, ADR-063; constants in `src/domain/generator.ts`, rests and time in `src/domain/sessionTime.ts`)*

`generateWorkout({ nodes, goals, progress, equipment, availableMinutes, recentSessions, now, seed })`
→ `WorkoutPlan`. Pure and deterministic (same request and seed → same plan, independent of the
order of `recentSessions`). Pass the merged tree and `EngineState.progress`.

1. **Frontier** (`goalFrontier`): per goal, walk unmet hard prerequisites (from `resolveTree`,
   so alternatives satisfy them) to trainable nodes; a locked prerequisite with a trainable
   alternative walks to the alternative. Goal weight per frontier node =
   `GOAL_BASE_WEIGHT` 50 + `CRITICAL_PATH_WEIGHT` 30 × distance / the goal's longest distance,
   summed over goals.
2. **Candidates:** frontier + available/training nodes not outgrown (a dependent or harder
   variation is trained). Equipment (OR-of-AND, `isDoableWith`): otherwise
   `substituteFor` picks a doable alternative with the same main pattern (unlocked, then closest
   ogLevel, then id), else the node is dropped (note for goal nodes).
3. **Skips:** any non-exempt pattern with working sets < `PATTERN_REST_HOURS` 48 h ago
   (`balance`, `mobility` are exempt); all straight-arm nodes when not `isStraightArmRested`.
4. **Score** = goal weight + `RECENCY_POINTS_PER_DAY` 5 × days since the node's most recent
   pattern (max `RECENCY_MAX_DAYS` 7; never = 7) + `BALANCE_WEIGHT` 20 × push/pull
   attribute-point deficit share (for nodes training the weaker side) + `STAGNATION_BONUS` 10
   (best set not improved over the last `STAGNATION_SESSIONS` 3 sessions) + `OG_LEVEL_POINTS` 1 ×
   ogLevel. Ties: FNV-1a hash of `seed:nodeId`, then id.
5. **Slots:** fixed prep `WARM_UP_PREP_IDS` (`wrist_prep`, `shoulder_dislocate`, 1 set each);
   then greedily the open slot with the best unused candidate: 2 skill slots (`isSkill` or
   straight-arm; the 2nd for goal skills only), 3 `STRENGTH_PAIRS` (vertical pull + squat, push +
   hinge, horizontal pull + push; a missing side leaves a single), 1 core, 1 cool-down (mobility,
   goal nodes only). A slot is added at `WORKING_SETS` 3, else trimmed to `MIN_WORKING_SETS` 2,
   else skipped when it doesn't fit the minutes left. Then up to `WARM_UP_MAX_RAMP` 2 ramp sets
   (`regressionId` of the main exercises, never straight-arm).
6. **Safeguards:** straight-arm exercises are fitted to the `STRAIGHT_ARM_SESSION_BUDGET_S` 60 s
   left (fewer sets or none); a straight-arm Trial only after `isTrialOpenBySafeguards`.
   **Trial day** (ADR-025): if the best-ranked straight-arm candidate's prescription is its Trial,
   all other straight-arm candidates are dropped, so the session has that one Trial (exempt from
   the budget) and no other straight-arm work; a note says so. A Trial trimmed for time becomes
   working sets that count against the budget again.
   `warnings` carries the advisory warnings that still apply (a self-unlocked or substituted node's
   `prerequisites_unmet`); the suggestion never triggers a `warning`-severity safeguard.
7. **Prescription** (`prescribe`, double progression): no history → 3 × range min. After a
   fully successful session → weakest set + `PROGRESSION_STEP` (reps 1, hold 5 s, eccentric 1 s,
   load 0.05), else the weakest set; clamped to the working range. Every set at the range top and
   Trial not passed → the Trial (`trial.sets × trial.target`, `isTrial`).
8. **Rest and time** (`sessionTime.ts`): `PAIR_REST_SEC` 90 inside a pair, `SINGLE_REST_SEC` 180
   otherwise, `WARM_UP_REST_SEC` 30, `COOL_DOWN_REST_SEC` 30 (per exercise, for the rest timer).
   Estimate per exercise (`exerciseSeconds`) = `TRANSITION_SEC` 30 + sets × (work + rest × pace),
   work = `SECONDS_PER_REP` 3 per rep, hold seconds, or lowerings × seconds.
   `estimatedMinutes` = ceil(total / 60) ≤ available; `WorkoutPlan.restPace` = pace.
9. **Rest pace** (`restPace`, ADR-063): per measured rest, (gap to the previous set − the set's
   work or `durationSec`) ÷ the prescribed rest read from the set order (same node again =
   180 s, alternating pair = 90 s; changes of exercise, Trial sets and mobility work not measured).
   Median over the latest `PACE_SESSIONS` 5 sessions with measured rests, clamped to
   [`PACE_MIN` 0.2, `PACE_MAX` 1.5]; < `PACE_MIN_RESTS` 4 rests → 1. A note when |pace − 1| ≥
   `PACE_NOTE_DEVIATION` 0.2.
10. **Filling the time** (`fillTime`, after the ramp, ADR-063): a cool-down if none (any mobility
   node); `growSets`: +1 set per round for every skill / strength / core block (a pair together)
   up to `MAX_WORKING_SETS` 5, never a Trial; up to `MAX_EXTRA_EXERCISES` 4 unused candidates
   (training before stretching, ≥ `MIN_WORKING_SETS` sets, in the block matching what they train);
   `growSets` again. Each step checks time and the straight-arm budget. Below `FILL_NOTE_SHARE`
   80 % of the chosen time a note says the tree has no more for today.
   Session lengths: `SESSION_MINUTES` 15, 20, 30, 45, 60, 75, 90 (`train.ts`), default 30.

Helpers for the UI and tests: `planExercises(plan)`, `plannedSets(exercises, at)` (the plan as
`LoggedSet`s, e.g. for `sessionSafeguardWarnings` while the user edits the plan).

## Data model *(Phase 3.1, 3.3–3.4, ADR-026, ADR-028)*
Schema in `src/db/schema.ts`; timestamps are integers in ms since the Unix epoch. Sources of truth
(ADR-008): `sessions` + `session_sets` and `user_actions`. Everything else is settings or cache.

- **Tables:**
  - `meta(key, value)`: `schema_version` (number of bundled migrations, written after each run;
    a higher stored version is refused) and `defaults_seeded_at` (first-run seed done)
  - `profile(id = 1, hero_name?, created_at)`: the hero (`HeroProfile`)
  - `goals(node_id, position)`: goal node ids, position 0 = most important
  - `equipment_profiles(id, name, tags JSON, position)` (`EquipmentProfile`); seeded once with
    `home` (Home) and `park` (Park)
  - `sessions(id, started_at, ended_at?, equipment_profile_id?)`
  - `session_sets(session_id → sessions cascade, set_index, node_id, metric, prescribed_value,
    prescribed_reps?, actual_value, actual_reps?, is_trial, timestamp, duration_sec?)`, PK
    `(session_id, set_index)`: one row per `LoggedSet` (ADR-021); `duration_sec` is the exercise
    timer's measured whole seconds (migration 0003, PLAN 5.4, ADR-040), NULL for untimed sets
  - `user_actions(id, kind, node_id, at)`: `UserAction`s (`self_unlock`, ADR-023)
  - `node_progress(node_id, xp, level, trial_passed, trial_passed_at?, first_trained_at?,
    last_trained_at?, self_unlocked_at?)`: CACHE of `NodeProgress`, rewritten after every
    recompute/apply; safe to delete (`loadAll` rebuilds it identically)
  - `settings(key, value JSON)`: user settings: `onboarding_completed_at` (ADR-031),
    `tree_view_mode` (`columns` | `map`, PLAN 5.1), `hero_classes` (PLAN 6.9, ADR-057:
    `{ version, selected?, unlocks: { classId: [{ at, sessionId? }] }, seen: { classId: tier } }`),
    `class_challenges` (PLAN 6.9b, ADR-058: `{ version, pins: [{ start, end, classId, tier }] }`,
    one pin per week with a session; user data like the history, recompute needs it for the bonus),
    `hero_companion` (PLAN 6.10, ADR-059: `{ version, unlocks: { accessoryId: { at, sessionId? } },
    equipped: { slot: accessoryId | null }, look: { skin?, hair?, outfit? }, seen: [accessoryId] }`)
  - `progression_overlay(id = 1, revision, saved_at, body JSON)`: the current overlay in the
    `overlayToRaw` shape (ADR-028); `revision` counts saves
  - `active_session(id = 1, updated_at, body JSON)`: the Train flow's session in progress
    (`ActiveSession`, ADR-034), rewritten after every change; a draft, not history (not exported,
    deleted by an import and when the session is finished or abandoned)
- **Migrations:** `src/db/migrations/`, generated from the schema by `npm run db:generate`,
  additive only, applied by Drizzle (`__drizzle_migrations`) in one transaction on every start.
- **Backups** (ADR-028): all tables above except `meta`, `node_progress` and `active_session`, as one JSON file with
  `format: 'skillforge-backup'` and `schemaVersion` (`BACKUP_SCHEMA_VERSION` = 3, independent of the
  database schema version; 2 adds an optional `durationSec` per set, ADR-040; 3 lets the overlay's
  nodes and edits carry `description`, ADR-049; version 1 and 2 files still import). Import replaces
  everything; a newer `schemaVersion` is refused. `src/store/fixtures/backup-v*.json` are files
  written by each published release's own code; `src/store/releaseBackups.test.ts` imports every one
  (ADR-068). A release that changes the layout or the stored settings adds its fixture.
- **Overlay layout** (`OVERLAY_VERSION` = 2 in `src/domain/overlay.ts`, ADR-049): the same raw shape
  in the `progression_overlay` row, backups and shared files; version 1 (no descriptions) still
  reads, a newer version is refused.
- Not stored (derived): node states, character level/attributes, session XP and outcome, streak.

## Equipment tags
`floor`, `wall`, `bar` (pull-up bar), `dip_bars`, `parallettes`, `bands`, `rings`, `pole`, `box`
(chair/bench/box to elevate hands or feet). A node's `equipment` is a list of options (OR); each option
is a set of tags needed together (AND), written `floor + wall` in YAML.
- **Default profiles:** Home = floor, wall, bar, parallettes, bands. Park = Home + dip_bars.

## Commands

| Command | Purpose |
|---|---|
| `npm start` / `npx expo start` | Dev server. Scan the QR code with Expo Go on Android. |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`eslint .`, flat config in `eslint.config.js`) |
| `npm test` | Jest (`jest-expo` preset, config in `jest.config.js`). Tests live next to the code as `*.test.ts` (components: `*.test.tsx` with RNTL). Locally it uses half the cores (`maxWorkers: 50%`); CI keeps the default. |
| `npm run format` / `npm run format:check` | Prettier write / check (config in `.prettierrc.json`) |
| `npm run progressions:check` | Validate `content/progressions/*.yaml` and report stale generated files. Writes nothing. |
| `npm run progressions:build` | Validate, then write `src/data/skills/progressions.generated.ts` and `docs/review/progression-matrix.md`. Run after every YAML edit. |
| `npm run progressions:review` | Validate, then write only the coach review sheet. |
| `npm run db:generate` | `drizzle-kit generate`: write a new migration in `src/db/migrations/` after editing `src/db/schema.ts` (add `-- --name <slug>` to name it). Commit the generated files. |
| `npm run lockfile:check` | `npm ci --dry-run` with the pinned npm on a clean copy of package.json + package-lock.json: fails if CI's `npm ci` would reject the lockfile (ADR-029). Also runs in CI. |
| `npm run lockfile:fix` | Re-resolve package-lock.json with the pinned npm (`install --package-lock-only`), then run the check. Run after every `npx expo install` / `npm install`. |
| `npm run e2e` | Maestro E2E flows in `.maestro/` against Expo Go on a running emulator (see "E2E tests"); `npm run e2e -- .maestro/tree.yaml` runs one flow |
| `npm run build:apk` | Local release APK for phones (arm64-v8a) in `builds/`, no Expo account (ADR-039). `-- --clean` recreates android/, `-- --skip-prebuild` only runs Gradle, `-- --abis=a,b` picks ABIs. ~14 min cold, a few minutes incremental. |
| `npm run build:apk:universal` | The same with arm64-v8a + x86_64, so it also runs on the x86_64 emulator |
| `npm run build:aab` | Google Play App Bundle in `builds/` (every ABI, always a clean prebuild), signed with the upload key; fails unless the signer is `UPLOAD_SIGNER_SHA256` (see "Play build") |
| `npm run animations:sheet` | Render the exercise animations as contact sheets to `docs/screenshots/6.4a-*.png` (v_pull, iconic, patterns). While tuning: `-- --only pull_up,pattern:core --cell 8 --out <png>`. Look at them after every pose change; commit the PNGs. |
| `npm run companion:sheet` | Render the companion sprite's contact sheets to `docs/screenshots/6.10-*.png` (animations, accessories per slot, weapons, outfits, looks). While tuning: `-- --only iron_helm,warrior,legend --cell 8 --out <png>` (accessory ids, class ids for weapons, outfit labels). Look at them after every art change; commit the PNGs. |
| `npm run icon:build` | Render the pixel-art app icon (`scripts/appIcon.ts`) to every PNG app.json points at (`assets/images/`) and `docs/screenshots/5.6-app-icon.png`, plus the widget picker previews (`scripts/widgetPreview.ts` → `assets/images/widget-preview.png`, `widget-companion-preview.png`). Run after editing the grid; commit the PNGs. |
| `npx expo-doctor` | Checks dependency versions and config against the SDK |
| `npx expo install <pkg>` | Add a dependency at the SDK-compatible version (prefer it over `npm install`) |

## Environment notes
- **OS:** Windows 10 with PowerShell 5.1 (no `&&`; use `; if ($?) {}`) and Git Bash.
- **GitHub CLI:** `C:\Program Files\GitHub CLI\gh.exe`, logged in as `Herofresh`.
- **Tooling:** Node 24, npm 11 (local 11.6.2; the project pins 11.19.0 for the lockfile, ADR-029), Java 17, jq 1.8.
- **Android:**
  - The Android SDK and Android Studio are installed at `%LOCALAPPDATA%\Android\Sdk`, but
    `ANDROID_HOME` and PATH aren't set. Call `adb` and `emulator` by their full paths.
  - **SDK versions:** Android Emulator 37.1.11, platform-tools 37.0.1, platform `android-35`, and
    system image `system-images;android-35;google_apis;x86_64`. The emulator was updated on 2026-09-27
    (ADR-032).
  - **Default AVD: `Pixel_8_Pro_API_35`**. It matches the user's phone (Pixel 8 Pro, 1344×2992, Android
    15) and has 4 GB RAM and `hw.gpu.mode=host`.
  - The old `Pixel_6_Pro_API_34` AVD still exists as a fallback.
  - **Command-line tools:** use `cmdline-tools\19.0\bin\sdkmanager.bat` / `avdmanager.bat`.
    - The newer `cmdline-tools\latest` (23.0) only ships the new `android.exe` CLI. It **crashes on
      this Windows 10** (exit 0xC0000409), and its `sdkmanager.bat` wrapper fails silently.
    - `sdkmanager.bat` runs through `cmd`, which splits arguments at `;`. Pass package names with
      `--package_file=<file>`.
    - Stop the adb server (`adb kill-server`) before updating platform-tools, because a running
      `adb.exe` is locked.
  - Build APKs locally with `npm run build:apk` (5.3a, ADR-039); it writes `android/local.properties`
    from `ANDROID_HOME` or this default path. There are no EAS cloud builds (ADR-047).
- **Maestro** 2.10 is installed at `%USERPROFILE%\.maestro\maestro\bin`. It isn't on PATH;
  `npm run e2e` finds it there (5.2).

## E2E tests (Maestro, ADR-022)
Flows live in `.maestro/*.yaml` and run against **Expo Go** (`appId: host.exp.exponent`), so no native
build is needed.

1. **Start the emulator.** Use the Pixel 8 Pro AVD with hardware GPU rendering:
   `& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_8_Pro_API_35 -gpu host -no-boot-anim -no-snapshot-save`
   - A cold boot takes about 80 s. Wait until `adb shell getprop sys.boot_completed` prints `1`.
   - Only if `-gpu host` fails, fall back to the old setup:
     `-avd Pixel_6_Pro_API_34 -gpu swiftshader_indirect`. It is slow, and its first bundle takes about
     2 min.
2. **Start Metro:** `npx expo start --android`. The first time, this installs Expo Go on the emulator.
   - A fresh AVD has no Expo Go, and every flow then fails within seconds.
   - If Metro is already running on 8081, you can install Expo Go without disturbing it: run a
     throwaway `npx expo start --android --port 8082` with `CI=1`, wait until
     `adb shell pm list packages host.exp.exponent` lists it, then stop that server.
3. **Forward the port:** `adb reverse tcp:8081 tcp:8081` (use the full `adb.exe` path under
   `platform-tools`, since it isn't on PATH)
4. **Run the flows:** `npm run e2e`. Maestro doesn't need to be on PATH: `scripts/e2e.ts` uses
   `MAESTRO_BIN` if set, else the default install (`%USERPROFILE%\.maestro\maestro\bin\maestro.bat`
   on Windows, `~/.maestro/bin/maestro` elsewhere), else `maestro` on PATH, and sets
   `MAESTRO_CLI_NO_ANALYTICS=1`. One flow: `npm run e2e -- .maestro/editor.yaml`.

**Gotchas:**
- With `-gpu host` the first bundle is much faster than the old swiftshader setup, but it can still
  take about a minute. The smoke flow waits up to 3 minutes.
- Only on the swiftshader fallback: if Android shows "System UI isn't responding" while it loads, tap
  *Wait*.
- If the first run after a cold boot times out on a white Expo Go loading screen, run
  `adb shell am force-stop host.exp.exponent` and run the flows again (the bundle is cached by then).
- The flows aren't in CI yet (see the backlog).
- Match on visible text or `testID` (`id:`). When the real UI replaces the placeholders, update or
  extend the flows in the same PR.
- Flows must not assume a fresh app: Expo Go keeps the last screen. They wait for `Tree|Style Guide`,
  go back from the Style Guide and tap Tree first. Don't put `stopApp` before `openLink` (Expo Go
  then stayed on the launcher). Give `scrollUntilVisible` a long `timeout` on long pages.
- Screenshots: `adb exec-out screencap -p > docs/screenshots/<phase>-<screen>.png`, or Maestro
  `takeScreenshot: name` (saved under `%USERPROFILE%\.maestro\tests\<run>\<flow>\takeScreenshot\`).
- Screenshots from a flow (e.g. `takeScreenshot: 4.2-tree` in `tree.yaml`) must be copied from
  that folder to `docs/screenshots/`.
- Decorative views (`ChainLink`) are hidden from accessibility; RNTL queries need
  `{ includeHiddenElements: true }` to find them.
- Onboarding (4.1): a fresh app starts in onboarding, so smoke/styleguide wait for
  `Tree|Style Guide|Step . / 5|Continue` and run `subflows/finish-onboarding.yaml`.
  `onboarding.yaml` starts with `clearState` (wipes Expo Go and the app database); after that Expo Go
  shows its intro ("Continue") and then leaves its dev menu open: the flows close it with `back`.
  Text inside a scrolled-away panel isn't "visible": assert on a `testID` near the action instead.
- The tree map (5.1) must not be one big `react-native-svg` `Svg`: Android rasterizes an SVG into a
  bitmap of its full size, and the whole map (~1.9k × 3.3k dp at 3.5× density) crashed Expo Go with
  "Canvas: trying to draw too large bitmap". Edges and lanes are plain Views. Maestro can tap map
  nodes by `testID` while the map is zoomed (`map-node-<id>`; `map-node-.*` for "any visible node").
- `hideKeyboard` presses back when no keyboard is open, which leaves a tab (4.6), and also when
  Gboard shows only its small hardware-keyboard toolbar, which leaves the app. Avoid it where the
  next tap works without it (`settings.yaml` after "Gym"). `onboarding.yaml` and
  `subflows/finish-onboarding.yaml` press `back` only when `onboarding-next` is not visible
  (`runFlow` + `when: notVisible`); since FB-1 (ADR-069) the footer rides on the keyboard, so that
  step is skipped, but it stays as a guard. Tabs keep their scroll position between flows; scroll up to a
  known element first.

## Play build (PLAN 7.1–7.3, ADR-047, ADR-066, ADR-068)
- **Version:** the first Play upload is **1.0.0, versionCode 8** (GitHub releases used 1–7; the
  code keeps rising across both channels). Every later upload raises `expo.android.versionCode`.
- **Upload key:** `%USERPROFILE%\keys\skillforge-upload.jks` (alias `upload`, PKCS12, RSA 2048,
  valid ~27 years), created by the user with `keytool` and backed up twice outside the repo. Never
  commit it (`*.jks` / `*.keystore` are gitignored). SHA-256 `02:7D:80:…:72:5D` =
  `UPLOAD_SIGNER_SHA256`.
- **Gradle properties** in `~/.gradle/gradle.properties` (or `ORG_GRADLE_PROJECT_<name>`):
  `SKILLFORGE_UPLOAD_STORE_FILE` (forward slashes), `SKILLFORGE_UPLOAD_KEY_ALIAS`,
  `SKILLFORGE_UPLOAD_STORE_PASSWORD`, `SKILLFORGE_UPLOAD_KEY_PASSWORD` (the same password for a
  PKCS12 key). `build:aab` reads only their names before the build.
- **Two signers on purpose:** `build:apk` keeps the debug key so GitHub APKs still update over
  earlier ones (ADR-043); Play installs carry Google's app signing key (Play App Signing), so a
  GitHub install can't update to Play; moving needs export → uninstall → install → import (7.3:
  README "Moving from a GitHub APK to Google Play", in the app `STORE_SWITCH_NOTE`).
- **Lost upload key:** Play Console → App integrity → request an upload key reset (days); then put
  the new digest into `UPLOAD_SIGNER_SHA256`.

## Release upgrade check (PLAN 5.7, ADR-043)
Before publishing a release, check that it installs over the previous one with the data intact.
1. Build the new APK: `npm run build:apk:universal` (runs on the x86_64 emulator; pass `-- --clean`
   after plugin, icon or native dependency changes). The script fails if the APK isn't signed with
   `RELEASE_SIGNER_SHA256` (`scripts/buildApkConfig.ts`): another key can't update existing installs.
2. Download the previous release's universal APK: `gh release download <tag> -p "*universal*"`.
3. Start the emulator (see "E2E tests", step 1), then `adb uninstall at.skillforge.app` and
   `adb install <previous>.apk`.
4. `npm run e2e -- .maestro/release/upgrade-seed.yaml`: fresh onboarding with a Pull-up test-out,
   then a custom exercise "Lever hold" saved right after Tuck front lever (the user overlay; on
   v0.3.0 and earlier its order clashes with a later built-in node, ADR-052). Since v0.4.0 the
   editor requires a description; the flow fills it only when the field is there. Works on every
   release since v0.1.0-preview1.
5. `adb install -r builds/<new>.apk` (an update: no uninstall, no clearState). It must print
   `Success`; `INSTALL_FAILED_UPDATE_INCOMPATIBLE` means the signer changed,
   `INSTALL_FAILED_VERSION_DOWNGRADE` a versionCode that isn't higher.
6. `npm run e2e -- .maestro/release/upgrade-verify.yaml`: the hero, goal, session and XP are still
   there, onboarding isn't shown again and "Lever hold" is still in the Front lever column. Since
   v0.6.0 it also checks that the companion card, the class banner and the weekly challenge
   render (ids only, no texts). The flows take the screenshots `5.7-upgrade-before` /
   `5.7-upgrade-after`, `upgrade-before-overlay` / `upgrade-after-overlay` and
   `6.11-upgrade-companion` / `6.11-upgrade-character` (copy them from Maestro's test folder,
   `~/.maestro/tests/<run>/…/takeScreenshot/`, to `docs/screenshots/`). Don't run the flows while
   a Gradle build is running: the slow emulator turns swipes into taps.
7. Repeat 3–6 for **every** earlier release a user may still have (`gh release list`), not only
   the last one.
8. Since v0.5.0 (widget, ADR-055): on one upgraded install, add the SkillForge widget (long-press
   the home screen → Widgets → search "SkillForge" → tap the preview → Add). It must show the
   seeded data (Trained today, streak 1, level 1, Novice, Pull 8) and a tap must open Train.
   Since v0.6.0 (6.10): place the small widget on the previous release **before** the update and
   check it still draws after `install -r`; then add the large "SkillForge Companion" widget (same
   picker entry, second preview): the sprite stands on the widget background, the data matches,
   a tap opens Train. A widget tap does nothing while the app is force-stopped (the library's
   clicks are broadcasts); open the app once first. Since v0.7.0 (6.12, 6.13): place both widgets
   at the previous release's defaults before the update; after `install -r` they must redraw with
   the current layout and sprite even before the app is opened; then add fresh ones at the
   current defaults and switch Customize → Body / Hair style once (the Character tab and the
   companion widgets follow).
9. If the seed fails at `hideKeyboard` with the app gone to the home screen (Gboard shows only its
   small floating hardware-keyboard toolbar, so Maestro's Back leaves the app), restart the
   emulator and run it again (6.14).

**Building in an agent worktree:** under `.claude/worktrees/<agent-…>/` the native CMake object
paths get too long for Windows and Gradle fails with "ninja: error: manifest 'build.ninja' still
dirty after 100 tries". A `subst` drive doesn't help (codegen then sees two roots). Copy the tree
without `node_modules`, `android`, `builds` and `.git` to a short folder (e.g.
`robocopy <worktree> D:\sf040 /E /XD node_modules android builds .git .expo /XF .git`), run
`npm ci` and the build there, and take the APKs from that folder's `builds/` (6.5).

## Gotchas
- Skill node IDs are permanent, because saved progress references them.
- Some OG2 levels in the research are inferred (`~`). Check them before relying on exact numbers.
- Never put formulas in components. Import them from `src/domain/`.
- **Encoding:** the docs are UTF-8 with non-ASCII characters (—, →, ✓).
  - Don't edit them with Windows PowerShell 5.1 `Get-Content`/`Set-Content`. They read and write the ANSI
    codepage and corrupt the text into mojibake like `â€”`.
  - Use a proper file-editing tool, or Git Bash tools.
- **TypeScript 6 `types`:** TS 6 no longer auto-includes every `@types/*` package. `tsconfig.json` sets
  `"types": ["jest", "node"]` (`node` is for `scripts/` and the dataset test). Don't use Node APIs in
  `app/` or `src/` runtime code.
- **Generated files:** never edit `src/data/skills/progressions.generated.ts` or
  `docs/review/progression-matrix.md` by hand; edit the YAML and run `npm run progressions:build`.
  Both are Prettier-ignored, as is `content/` (hand-formatted YAML).
- **`yaml` in Jest:** `jest.config.js` → `moduleNameMapper` maps `yaml` to its CommonJS build,
  because jest-expo resolves the ESM browser entry otherwise.
- **Jest timeouts and cache:** component suites (`src/components/**`) and `scripts/appIcon.test.ts`
  get a 60 s timeout from `jest.setup.ts` (`UI_SUITE_TIMEOUT_MS`), because under a loaded machine
  their tests took up to ~30 s; pure suites keep the 5 s default. Don't add per-test timeout
  numbers: extend `HEAVY_SUITE_PATH` there, and prefer making the test cheaper (one query or one
  assertion over a list instead of one per item). The transform cache is per checkout in
  `node_modules/.cache/jest` (a shared `%TEMP%\jest` broke parallel worktree runs with EPERM).
  Every run uses `TZ=Europe/Vienna`, set at the top of `jest.config.js` before workers start
  (CI is UTC; assigning `process.env.TZ` inside a test is not reliable), so local-time tests such as
  the 167 / 169 h DST weeks behave the same everywhere. Write local-time tests for that zone.
- **Home-screen widget (ADR-055):** never import `react-native-android-widget` or
  `src/widget/nativeWidget.tsx` statically; the library throws on import without its native module
  (Expo Go, Jest). Go through `loadNativeWidget()`. Widget components are called as plain
  functions by the library: no hooks, and keep `'use no memo'` in `nativeWidget.tsx`. The widget
  only exists in a release build (`npm run build:apk:universal`); after changing its config in
  app.json build with `-- --clean`. To place it on the emulator: long-press the home screen →
  Widgets → SkillForge, drag it onto the home screen.
- **Routes live in root `app/`,** not `src/app/` (the SDK 57 template default). Expo Router uses
  `src/app/` if it exists, so never create that folder (ADR-014).
- **Database:** never edit or delete a generated migration; change `src/db/schema.ts` and run
  `npm run db:generate`. Repositories are synchronous (Drizzle expo driver in sync mode), so
  `db.transaction(cb)` needs a synchronous callback (an `async` one would commit early).
  Tests use `openTestDatabase()` from `src/db/testing/testDatabase.ts` (ADR-027); Node prints an
  "SQLite is experimental" warning, which is expected. After editing a `.sql` file clear the caches
  (`npx jest --clearCache`, `npx expo start -c`), because they are inlined by Babel.
- **Lockfile (ADR-029):** npm 11.6.2 (this machine's npm) writes package-lock.json without the
  optional peers `@emnapi/core`/`@emnapi/runtime` (of `@napi-rs/wasm-runtime`), and the newer npm
  in CI then fails `npm ci` with "Missing: … from lock file". The npm version is pinned in
  `package.json` `devEngines.packageManager` (a mismatch prints `EBADDEVENGINES`, a warning only).
  After any install run `npm run lockfile:fix`; don't hand-patch the lockfile. The script lives in
  `scripts/lockfile.ts` and runs on plain Node (type stripping), so keep it free of dependencies.
- **Local APK builds (ADR-039):**
  - Release APKs are signed with the **debug keystore** (the React Native template's). Fine for
    sideloading; Play rejects it, and a later release-key APK can't update it in place (uninstall,
    which wipes the data; export a backup first). The Play upload key comes in PLAN 7.1 (ADR-047).
  - **ABI quirk:** the arm64-only APK installs on the x86_64 emulator but crashes at start with
    `SoLoaderDSONotFoundError` (libreactnative.so). Not an app bug; use `build:apk:universal` there.
  - `expo prebuild` rewrites package.json's `android`/`ios` scripts to `expo run:*`. The script
    restores package.json byte for byte and warns if prebuild changed any other tracked file. Don't
    run a bare `npx expo prebuild` and commit the result.
  - Prebuild defaults to recreating android/ (a cold ~14 min Gradle build); the script passes
    `--no-clean` unless you pass `--clean` (do that after changing app.json plugins or native deps).
  - Gradle's warnings about hard links / "failed to create a hard link, copying instead" and
    deprecated features are harmless.
  - Bump `expo.android.versionCode` in app.json for every APK you hand out (no autoIncrement).
- **Keyboard (ADR-069):** Android 15+ is edge-to-edge, so the window is never resized for the soft
  keyboard (`adjustResize` does nothing) and nothing moves by itself. A new screen with a text field
  uses `<Screen avoidKeyboard>`, a screen with a fixed footer wraps content + footer in
  `KeyboardSafeView`, and `PixelModal` sheets already handle it. Check it on the emulator with the
  soft keyboard forced on (`adb shell settings put secure show_ime_with_hard_keyboard 1`; reset to
  0 after), or the AVD's hardware keyboard shows only Gboard's small toolbar and hides the bug.
  Measure positions with `measure`'s `pageY`: `measureInWindow` leaves out the status bar on
  Android while the keyboard's `screenY` counts from the top of the screen.
- **Line endings:** `.gitattributes` forces LF. Git may warn "CRLF will be replaced by LF" once per file;
  that's expected.
