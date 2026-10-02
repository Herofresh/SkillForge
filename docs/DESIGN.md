# SkillForge — Design System

> Agents: read this before building any screen. Tokens live only in
> [`src/components/theme.ts`](../src/components/theme.ts); components live in
> [`src/components/ui/`](../src/components/ui/). If this file and the code disagree, the code wins:
> fix this file in the same PR. Decision record: ADR-030.

## 1. The look in one paragraph

**Retro 16-bit JRPG menu meets a dark fantasy grimoire.** Screens are a night-sky stone background
with flat panels drawn like pixel-art UI windows: stepped (notched) corners, crisp 2 dp frame lines
(black ink outside, a colored accent inside) and a hard black drop shadow. Accents are gold and
parchment with glowing rune colors. Titles and labels use pixel fonts; body text uses a readable
humanist font. Progress is shown as segmented pixel bars. Level-ups and unlocks get a short pixel
burst. No blur, no gradients, no rounded corners, no soft shadows.

See the dev-only **Style Guide** screen (Settings → Style Guide in development builds, route
`/styleguide`) for every token and component, and `docs/screenshots/4.0-styleguide.png`.

## 2. Palette

Raw colors are in `Palette` (`src/components/palette.ts`, re-exported by `theme.ts`; its own file so
Node scripts like the app icon build can import it); components use the semantic `Colors` (and `TierColors`,
`AttributeColors`). Never write a hex value outside `palette.ts` / `theme.ts`.

| Token (`Colors.`) | Hex | Use |
|---|---|---|
| `background` | `#0D0B14` | Screen background (night) |
| `surface` | `#1A1624` | Panel fill (stone) |
| `surfaceRaised` | `#262036` | Raised panels, secondary buttons, sheets |
| `border` | `#3E3654` | Inner frame line on stone, unlit bar segments |
| `ink` | `#050408` | Outer frame line, hard shadow, backdrop |
| `text` | `#F3EAD3` | Body text (bone) |
| `textMuted` | `#B4A9C8` | Secondary text (mist) |
| `gold` | `#E9B949` | Titles, primary buttons, XP, highlights |
| `goldLight` / `goldDark` | `#FFE08A` / `#9A7328` | Bevel highlight / frame accent, tab rule |
| `parchment` | `#EAD9A8` | Parchment panels (lists, scrolls) |
| `textOnParchment` / `textOnGold` | `#2B1D0E` | Ink text on parchment and on gold |
| `bronze` | `#7A5424` | Parchment frame line, scroll rolls |
| `rune` | `#62E3F0` | Glowing rune accents, section labels, "coming soon" notes |
| `arcane` | `#A58BFF` | Magic accents, mobility |
| `ember` | `#F2893B` | Warning titles, flame, push |
| `danger` / `dangerDark` | `#EC6B73` / `#8E2230` | Warning frames, danger button |
| `success` | `#6BD17A` | Acknowledged / done |
| `steel` / `steelDark` | `#C5CCD8` / `#6E7890` | Icon metal (sword, bar, chain) |

**Tier colors** (`TierColors`, tiers from ADR-007): beginner `#6BD17A` green · intermediate
`#58A6FF` blue · advanced `#B07CFF` purple · elite `#F5A524` legendary orange-gold.

**Rank colors** (`RankColors`, the crest frame and rank title): Novice steel · Apprentice green ·
Adept blue · Master purple · Legend orange-gold.

**Attribute colors** (`AttributeColors`): push ember · pull blue · core gold · legs green ·
balance rune · mobility arcane.

**Contrast** (WCAG 2.x; pinned by `src/components/theme.test.ts`, helper `src/lib/contrast.ts`):

| Pair | Ratio |
|---|---|
| `text` on `background` / `surface` / `surfaceRaised` | 16.3 / 14.8 / 13.1 |
| `textMuted` on `background` / `surface` / `surfaceRaised` | 8.8 / 8.0 / 7.0 |
| `gold` on `surface` | 9.7 |
| `rune` on `surface` | 11.6 |
| `ember` / `danger` on `surface` | 7.1 / 5.8 |
| `textOnGold` on `gold` (primary button) | 9.0 |
| `textOnParchment` on `parchment` | 11.7 |
| `text` on `dangerDark` (danger button) | 7.2 |
| Tier colors on `surface` | 6.1–9.3 |

Rules: body text ≥ 4.5:1 against its fill; bar fills and icons ≥ 3:1. `goldDark`, `steelDark`,
`bronze` and `border` are decoration only: never text. Any new text/fill pair goes into
`theme.test.ts`.

## 3. Typography

Fonts are OFL Google Fonts loaded with `@expo-google-fonts` (`src/components/fonts.ts`); the splash
screen stays up until they and the database are ready. If loading fails the system font is used.

| Family token | Font | Role |
|---|---|---|
| `FontFamily.pixel` | Jersey 15 | Titles, headings, button labels, big numbers |
| `FontFamily.caps` | Silkscreen | Tiny caps tags: chips, bar labels, tab labels |
| `FontFamily.body` / `bodyBold` | Alegreya Sans Regular / Bold | Everything people read |

Type scale (`TypeScale`, used through `<PixelText variant>`):

| Variant | Font | Size / line | Notes |
|---|---|---|---|
| `display` | pixel | 36 / 40 | Gold, hard 2 dp ink text shadow |
| `title` | pixel | 28 / 32 | Gold, hard text shadow |
| `heading` | pixel | 21 / 24 | Section and button text |
| `label` | caps | 12 / 16, +1 tracking | Short tags only (≤ 3 words); Silkscreen is all caps by design |
| `body` | body | 17 / 24 | Default |
| `small` | body | 15 / 20 | Secondary lines |

Navigation header titles use `HeaderTitleStyle` (pixel, 23).

**Readable numbers (PLAN 6.1, ADR-048):** every role's font draws all ten digits distinctly, so
numbers need no special role; any variant may show them. Jersey 15 replaced Pixelify Sans, whose 5
read as an S or an 8. Jersey 15 draws small for its size (cap height 0.56 em), hence the larger
pixel sizes; the line heights are unchanged. The Style Guide's **Digits** section shows 0–9 in
every variant (`docs/screenshots/6.1-digits-before.png` / `-after.png`); check it before adding a
font, and add the font to `CLEAR_DIGIT_FONTS` in `src/components/fonts.test.ts` only if every digit
is distinct.

Rules: never set `fontFamily`/`fontSize` by hand, use a variant. Keep pixel fonts for short
strings; sentences are always `body`/`small`. Don't use `label` for anything a screen reader user
needs to parse as a sentence.

## 4. Pixel grid, spacing, frames

- **Art pixel:** `PIXEL` = 2 dp. Frame lines, corner steps, shadows and icon cells are multiples.
- **Spacing:** `Spacing` xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48. Screen padding md; gaps
  between blocks lg.
- **Borders:** `Border.line` 2 dp per frame line, `Border.shadow` 4 dp hard shadow (also the button
  press travel), `Border.cornerStep` 2 dp, two steps per corner.
- **Touch targets:** `TOUCH_TARGET` 48 dp minimum (buttons already meet it).

**Frames** (`Frames`, drawn by `PixelFrame`): outer `ink` line + inner accent line + flat fill, with
stepped corners and a hard shadow.

| Variant | Inner line | Fill | Use |
|---|---|---|---|
| `stone` | `border` | `surface` | Default panel |
| `raised` | `goldDark` | `surfaceRaised` | Sheets, secondary buttons |
| `gold` | `gold` | `surface` | Highlighted: level badge, info notes |
| `parchment` | `bronze` | `parchment` | Lists and "documents" (ink text) |
| `rune` | `rune` | `surface` | Magic moments: level-up, unlocks |
| `arcane` | `arcane` | `surface` | The user's own changes: "Custom" badge, editor panels (4.7) |
| `danger` | `danger` | `surface` | Safeguard warnings |
| `selected` | `gold` | `surfaceRaised` | A picked chip or row (goal, tag, branch) |

## 5. Components (`src/components/ui/`, import from `@/components/ui`)

| Component | What it is |
|---|---|
| `Screen` | Scrolling night background with standard padding; `centered` for short content |
| `PixelFrame` | The panel: `variant` or custom `frame`, `shadow`, `pressed`, `padding` |
| `PixelText` | All text: `variant`, `tone` (a `Colors` key) or `color`, `align` |
| `PixelButton` | `primary` (gold) / `secondary` (raised) / `danger`; optional `icon`; press drops the face into the shadow; `disabled` flattens it |
| `PixelIcon` | Grid icon: `name`, `size` (24 default, use multiples of 24), `tint` (one color), `label` (else decorative) |
| `SegmentedBar` | Low-level segmented bar (inside XPBar/StatBar) |
| `XPBar` | Caps label + value text + 10 gold segments; `progressbar` role |
| `StatBar` | Attribute row: icon, name, 8 segments, value; `max` normalises |
| `LevelBadge` | "LV n" in a gold frame; `md` / `lg` |
| `TierChip` | Tier name in its tier color (`TIER_LABELS`) |
| `WarningBanner` | Advisory safeguard (ADR-023): title, message, "I understand" → "Acknowledged" |
| `PixelModal` | Bottom sheet with title, content and a close button over an ink backdrop |
| `EmptyState` | Big icon, title, message, optional caps note and action |
| `LevelUpBurst` | "LEVEL UP!" with a stepped pixel burst; `playKey` replays, `onDone` |
| `PixelTextInput` | Labelled text field in a stone frame that turns gold on focus; body font, ≥ 48 dp |
| `PixelChip` | Selectable tag: stone off, `Frames.selected` + check on; `checkbox` or `tab` role |
| `NumberStepper` | Label, − / value / + (48 dp buttons); the caller formats the value (`formatPerformance`) |

Built from the kit outside `ui/`: `NodeRow` (a skill node as a list row: icon, name, `TierChip`, OG
level, ember "Straight-arm" tag, caps status; `selected` uses `Frames.selected`) and
`onboarding/OnboardingScaffold` (rune step bar, title with a 48 dp icon, scrolling body, footer with
Back / Skip / Next pinned above the content). Onboarding screenshots: `docs/screenshots/4.1-*.png`.

**Tree (PLAN 4.2, ADR-033)** in `src/components/tree/`: `NodeTile` frames each node by its tile
state (`TileFrames` in `theme.ts`): locked = night fill, stone line, lock icon, muted name ·
available = rune double line ("glow"), rune icon, READY · training = raised with gold-dark line, sword,
"LV n · Training" XP bar · proficient = gold + gold-dark lines, shield, gold name · mastered = gold-light
+ gold lines, star · legendary (locked) = ink silhouette with a gold-dark flame. `GoalMarker` is a
gold "GOAL" star tag. `ChainLink` draws the prerequisite chain between tiles (`ChainColors`: gold met,
steel unmet); `PrereqChip` is a ✓/✗ + name chip for other prerequisites (36 dp, hit slop to 48 dp).
`TreeLegend` explains it all. The `cross` icon is the ✗. The node detail (`src/components/node/`) is
built from `DetailSection` panels (caps heading + icon); its header reuses the tile frame, and the
first panel is "About" (`info` icon) with the description (PLAN 6.2).

**Exercise info (PLAN 6.2, ADR-049):** the `info` icon is a rune ring with a light "i".
`InfoButton` puts it on a small `raised` frame that drops into its shadow when pressed (no fade),
centred in a 48 dp target; it sits at the end of a tile's top row and of an `ExerciseCard` header.
`ExerciseInfoSheet` is a `PixelModal` titled with the exercise name: the description in `body`,
then the cues as `small` bullets in a shadowless parchment frame with a scroll icon and a CUES
label (the body scrolls above 360 dp), plus a primary "Open skill" in the Tree only. Map nodes open
it on long press (too small for the button); the Legend mentions both ways.
Screenshots: `docs/screenshots/4.2-tree.png`, `4.3-node-detail.png`, `4.3-unlock.png`,
`4.3-trial.png`.

**Exercise animations (PLAN 6.4, ADR-053):** `PixelAnimation` plays a node's animation
(`animationFor(node)`) as a 32 × 32-cell side view: the hero in `gold` like the app icon, the near
arm in `goldLight` with a 1-cell `ink` edge (and the head too) so arm, head and torso stay apart,
the far arm and leg in `goldDark` behind the body, equipment in `steel` / `steelDark` (bars and
rings in front of the gripping hands) and floor, walls and boxes in `bronze`. It sits centred on
top of the node detail's About panel at 128 dp (4 dp per cell) and on top of the
`ExerciseInfoSheet` at 96 dp; use multiples of 32 dp. It is decorative (hidden from screen
readers): the description next to it says the same in words. Proportions are chunky on purpose
(head radius 2.7 cells, torso ~3–4 cells, limbs ~2 cells) so the pose reads at 96 dp; a figure
must keep its head inside the frame and its feet on the floor (tested). The Style Guide's
"Exercise animations" section shows every animation; `npm run animations:sheet` renders contact
sheets for review (`docs/screenshots/6.4a-v_pull.png`, `6.4a-iconic.png`, `6.4a-patterns.png`);
on the phone: `6.4a-node-detail.png`, `6.4a-info-sheet.png`, `6.4a-styleguide.png`.

**Train (PLAN 4.4, ADR-034)** in `src/components/train/`: `ExerciseCard` (stone card, gold-lined
`Frames.selected` for the current exercise; sword icon, shield for a Trial, cross when skipped;
rune TRIAL / ember STRAIGHT-ARM / green DONE caps tags; "Swapped from X", "Replaces X", "Pair"
lines), `SetLogger` (the kit's `NumberStepper` + primary "Log set" and secondary Partial / Failed),
`RestPanel` (rune frame, potion icon, big display-font countdown, "Skip rest"), `NodeOptionSheet`
(`PixelModal` with an optional search field and a scrolling list of `NodeRow`s) and
`TrainWarningList` (`WarningBanner`s acknowledged by key). The session bar is an `XPBar` in rune
color; the summary opens with a "QUEST COMPLETE" `LevelUpBurst`, then LEVEL UP! / UNLOCKED! bursts,
a gold streak panel with the flame and a parchment list of exercises. Screenshots:
`docs/screenshots/4.4-*.png`.

**Live-session edits (PLAN 5.9, ADR-045):** a logged-set line in `SetLogger` is a 48 dp row
(outcome icon, "Set 2: 8 reps · 0:42", a quill at the end) that shows `surfaceRaised` while
pressed and opens `EditSetSheet`, a `PixelModal` ("Edit set 2", Cancel) with the logged / target
line, the "Did" stepper, primary Save (check), secondary Partial / Failed and a danger "Delete
set" that swaps the sheet's body for the confirm (danger Delete set, secondary Keep set). The
session list's header has a secondary Reorder / Done button; while reordering, each row is a plain
frame with name, block ("Strength · pair") and secondary Up / Down buttons, disabled at the ends.

**Exercise timer (PLAN 5.4, ADR-040)** in `src/components/timer/SetTimerPanel.tsx`: idle, a
secondary button with the hourglass ("Start hold" / "Start set") between the target line and the
"Did" stepper. Running, a rune-framed panel like the rest countdown: hourglass, caps caption (GET
READY, HOLD, TIME) and the display-font clock ("3", "0:27", "1:05"), then a primary Stop / Done
with the check and a secondary Cancel (a hold shows only Cancel while it gets ready). Past a hold's
target the frame turns gold, the caption reads TARGET REACHED and the clock "+7 s"; the phone
vibrates once. Stopped, the caption is HELD / TIME with the measured clock and a secondary "Reset
timer". The live header shows the session clock (hourglass + rune caps time) next to the exercise
count; logged sets read "8 reps · 0:42"; the summary's XP panel adds "Session time 32:05" and
exercise rows "Success · 1:24". Hold Trials show the same panel under each set's stepper.

**Character and Settings (PLAN 4.5–4.6, ADR-035)** in `src/components/character/`, `settings/`,
`equipment/`: the Character tab opens with a gold hero panel (display-font name, `LevelBadge` lg,
XP bar "To level n"), then `RankCrest` (the rank emblem, shield → sword → rune → star → flame, at
48 dp in a double frame of its `RankColors`: steel, then the tier colors), the `AttributeRadar`
(hexagon rings and spokes in `border`, the value area as 6 dp cells in gold at 40 % with a solid
gold outline, a marker per attribute in its `AttributeColors`; caps labels around it; one
accessible image) over six `StatBar`s, the balance `WarningBanner` (info), a raised stats row
(streak, sessions, sets, Trials), goal cards (tier chip, path `SegmentedBar`, rune "Next: …" link)
and a parchment list of `SessionHistoryRow`s. Settings stacks `DetailSection` panels (Hero, Backup,
About) and the shared `EquipmentProfileEditor`; destructive steps (remove a profile, import, undo)
confirm in a `PixelModal` with a danger button. Screenshots: `docs/screenshots/4.5-*.png`,
`4.6-*.png`.

**Node editor and shared progressions (PLAN 4.7–4.8, ADR-036)** in `src/components/editor/`: the
editor is a stack of `DetailSection` panels (an arcane "Exercise" panel for a custom node: name,
metric chips, "Comes after" + `PositionSheet`, difficulty stepper, straight-arm chip; then
Standards steppers, Prerequisites as raised cards with a "Required" chip, level stepper and Remove,
a Description panel with a multiline field for every node (6.2), Equipment options as tag-chip
cards, Cues on parchment, Trains chips with "Auto"). Validator issues
show inline under the section they are about in an `IssueNotes` danger frame ("FIX THIS TO SAVE");
the footer states the problem count and Save stays disabled while there are any. `CustomBadge`
(arcane frame, quill, "CUSTOM") marks added/edited nodes on the detail header; tiles get a smaller
quill + "CUSTOM" tag. My progressions lists `OverlayEntryRow`s (raised cards), then `SharePanel`
(Share / Import, and a parchment "Suggest to project" panel with the contributor-guide link).
Screenshots: `docs/screenshots/4.7-*.png`, `4.8-*.png`.

**Tree map (PLAN 5.1, ADR-037)** in `src/components/tree/map/`: the Tree tab's Columns | Map tabs
(`TreeModeTabs`, two `PixelChip` tabs). The map is the night sky with a stone lane per branch, a
2 dp rule and caps title in the branch's color (`BranchColors`: push warm, pull cool, levers rune /
amethyst, planche gold light, then parchment, gold, green, bone, arcane, orchid `#F28FD0` for acrobatics and lime `#B9E769` for mobility). `MapNode` is a fixed
136 × 84 dp card in the tile's `TileFrames` frame with the state icon (a gold star below it for a
goal, else the quill for a custom node), the name (2 lines), a 8 dp tier pip and the caps state or
"LV n". Edges (`MapCanvas`) are square pixel lines, `MapStyle`: steel-dark 2 dp unmet; gold 4 dp on
a 10 dp gold glow at 30 % once met (the one soft touch). Controls sit at the bottom: List (scroll,
"Switch to list"), − / +, and a gold Goals / Focus button (star). Screenshots:
`docs/screenshots/5.1-map.png`, `5.1-map-overview.png`, `5.1-map-node-detail.png`.

Bar math: `litSegments(fraction, count)` (`src/lib/segments.ts`) lights ≥ 1 segment for any gain and
never shows full before 100 %. The fraction itself comes from the domain (e.g. XP thresholds in
`progression.ts` / `character.ts`); components never compute game numbers.

## 6. Icons

12×12 character grids in `src/components/ui/icons.ts`, rendered by `PixelIcon` as SVG rects (one
per horizontal run, `src/lib/pixelGrid.ts`). Roles: `#` main, `+` accent, `*` highlight, `o` shade,
`.` empty; each icon maps roles to theme colors. The set: `sword`, `shield`, `flame`, `star`,
`lock`, `chain`, `scroll`, `potion`, `bar`, `heart`, `rune`, `alert`, `check`, `cross`, `quill`, `hourglass`, and the tab icons
`tree`, `bar` (Train), `helmet` (Character), `gear` (Settings).

Suggested meanings: sword = train/attempt · shield = safeguard · flame = streak · star = mastered /
goal · lock = locked · chain = prerequisite · scroll = log, info, notes · potion = recovery, errors ·
bar = equipment / strength · heart = health · rune = skill node / magic · alert = warning ·
check = done / met · cross = not met · quill = edit / the user's own changes · hourglass = timer,
time.

Adding an icon: add a grid (exactly 12 rows of 12 characters, ≤ 4 roles, keep one role for icons
that must tint), map its roles to `Colors`, and `icons.test.ts` checks it. Keep silhouettes readable
at 24 dp: 1-cell details disappear on a phone. A tint paints every role in one color, so an icon with
a large fill (scroll, shield) lists that fill role in `knockout`: tinted, those cells stay empty and
the outline and details remain (PLAN 5.2; before, the tinted scroll was a solid block on buttons).

### App icon (PLAN 5.6, ADR-042)

The launcher icon is the same kind of grid, 32 × 32 cells, in `scripts/appIcon.ts` (`MOTIF_ROWS`):
a gold hero in a straddle handstand on a bronze floor (`gold` body, `goldLight` lit left edges and
two sparkles, `goldDark` shaded right edges) inside a two-cell `rune` ring with a `runeShade` inner
line around a `stone` disc, on the `night` background. Roles map to `Palette` keys; nothing else.

- `npm run icon:build` renders it with nearest-neighbour cells (whole pixels per cell) to every
  image app.json uses: `icon.png` 1024 (28 px cells), the adaptive foreground and monochrome
  1024 (18 px cells: the motif is ~61 of 108 dp, every pixel inside the 66 dp safe-zone circle), the solid night
  adaptive background, `splash-icon.png` 1024 transparent (32 px cells) and `favicon.png` 48.
- The themed (monochrome) icon drops the disc (`MONOCHROME_KNOCKOUT`) so the hero and ring stay
  separate shapes when Android tints the mask.
- Preview: `docs/screenshots/5.6-app-icon.png` (icon, circle and squircle masks, themed icon,
  splash; bottom row the launcher icon at 96 and 48 px and both ×4).
- Editing: keep the silhouette mirror-symmetric (tested), keep details ≥ 2 cells so they survive
  48 px, rebuild, look at the preview, commit the PNGs.

## 7. Motion

- Stepped, not smooth: `Easing.steps(Motion.burstSteps)` so movement reads like sprite frames.
- Short: ≤ `Motion.burstMs` (640 ms). Motion celebrates (level-up, unlock); it never gates input.
- **Reduce motion:** every animation checks `useReducedMotion()` (Reanimated). With it on, show the
  end state immediately (the burst shows only the title; sheets appear without sliding).
- Buttons animate by position only (the press drop), no fades.
- **Exercise animations loop (PLAN 6.4, ADR-053):** the one exception to "short, never loop".
  They explain a movement rather than celebrate, so they repeat: sprite frames of `FRAME_MS`
  (160 ms) each, switched in whole steps (a linear ramp floored to the frame index on the UI
  thread, the same stepped look as `Easing.steps`); the in-between poses are eased (smoothstep)
  between keyframes. With reduce motion they show one still keyframe and never move.
- **Reveal moments (PLAN 5.2, ADR-038):** every celebration is a `LevelUpBurst` with a title from
  `BURST_TITLES` (LEVEL UP!, UNLOCKED!, TESTED OUT!, QUEST COMPLETE). The ring bursts from the
  title's centre. Where they play: Train summary (quest complete, first level-up, first unlock),
  Trial outcome (tested out; node detail and onboarding share `TrialOutcome`), onboarding summary
  (hero name + rank), node detail (UNLOCKED! after unlock anyway, else LEVEL UP! when the node's
  level rose while it was open), Character tab (LEVEL UP! when the character level rose). Level-ups
  use `useLevelUpKey(level)`: it plays only for a rise seen while mounted, never on every visit.

## 8. Accessibility

- Contrast as in §2, checked by tests.
- Touch targets ≥ 48 dp.
- Every control has an `accessibilityRole` and label; bars are `progressbar` with a value;
  decorative icons are hidden from screen readers, meaningful icons get a `label`.
- Warnings use `accessibilityLiveRegion="polite"`; the level-up burst is an `alert`.
- Text scales with the system font size; don't fix heights on text containers.

## 9. Do / don't

| Do | Don't |
|---|---|
| Build screens from `Screen`, `PixelFrame`, `PixelText`, `PixelButton` | Hard-code colors, font names, sizes or radii |
| Use `ink` + accent frame lines and the hard shadow | Rounded corners, blur, gradients, soft `elevation` shadows |
| Pixel fonts for titles, buttons, tags | Pixel fonts for sentences |
| Show safeguards with `WarningBanner` and an acknowledge step | Block the user because of a safeguard (ADR-023) |
| Take numbers from the store/domain and pass fractions to bars | Compute XP/levels in components |
| Add a `testID` where Maestro needs a stable selector | Rely on text that changes with data in E2E flows |
| Respect reduce motion | Loop animations or animate for more than ~0.6 s (exercise animations are the one looping exception, §7) |
