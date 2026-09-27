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

Raw colors are in `Palette`; components use the semantic `Colors` (and `TierColors`,
`AttributeColors`). Never write a hex value outside `theme.ts`.

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
| `FontFamily.display` | Pixelify Sans Bold | Titles, big numbers |
| `FontFamily.pixel` | Pixelify Sans SemiBold | Headings, button labels |
| `FontFamily.caps` | Silkscreen | Tiny caps tags: chips, bar labels, tab labels |
| `FontFamily.body` / `bodyBold` | Alegreya Sans Regular / Bold | Everything people read |

Type scale (`TypeScale`, used through `<PixelText variant>`):

| Variant | Font | Size / line | Notes |
|---|---|---|---|
| `display` | display | 32 / 40 | Gold, hard 2 dp ink text shadow |
| `title` | display | 24 / 32 | Gold, hard text shadow |
| `heading` | pixel | 18 / 24 | Section and button text |
| `label` | caps | 12 / 16, +1 tracking | Short tags only (≤ 3 words); Silkscreen is all caps by design |
| `body` | body | 17 / 24 | Default |
| `small` | body | 15 / 20 | Secondary lines |

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

Bar math: `litSegments(fraction, count)` (`src/lib/segments.ts`) lights ≥ 1 segment for any gain and
never shows full before 100 %. The fraction itself comes from the domain (e.g. XP thresholds in
`progression.ts` / `character.ts`); components never compute game numbers.

## 6. Icons

12×12 character grids in `src/components/ui/icons.ts`, rendered by `PixelIcon` as SVG rects (one
per horizontal run, `src/lib/pixelGrid.ts`). Roles: `#` main, `+` accent, `*` highlight, `o` shade,
`.` empty; each icon maps roles to theme colors. The set: `sword`, `shield`, `flame`, `star`,
`lock`, `chain`, `scroll`, `potion`, `bar`, `heart`, `rune`, `alert`, `check`, and the tab icons
`tree`, `bar` (Train), `helmet` (Character), `gear` (Settings).

Suggested meanings: sword = train/attempt · shield = safeguard · flame = streak · star = mastered /
goal · lock = locked · chain = prerequisite · scroll = log, info, notes · potion = recovery, errors ·
bar = equipment / strength · heart = health · rune = skill node / magic · alert = warning ·
check = done.

Adding an icon: add a grid (exactly 12 rows of 12 characters, ≤ 4 roles, keep one role for icons
that must tint), map its roles to `Colors`, and `icons.test.ts` checks it. Keep silhouettes readable
at 24 dp: 1-cell details disappear on a phone.

## 7. Motion

- Stepped, not smooth: `Easing.steps(Motion.burstSteps)` so movement reads like sprite frames.
- Short: ≤ `Motion.burstMs` (640 ms). Motion celebrates (level-up, unlock); it never gates input.
- **Reduce motion:** every animation checks `useReducedMotion()` (Reanimated). With it on, show the
  end state immediately (the burst shows only the title; sheets appear without sliding).
- Buttons animate by position only (the press drop), no fades.

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
| Respect reduce motion | Loop animations or animate for more than ~0.6 s |
