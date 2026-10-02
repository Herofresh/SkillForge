/**
 * SkillForge design tokens (PLAN 4.0, ADR-030, docs/DESIGN.md): pixel-art meets dark fantasy
 * grimoire. This is the ONLY place for colors (the raw hex values sit in `palette.ts`), fonts, spacing, borders and frame styles; import the
 * tokens, never copy a hex value or a font name into a component.
 */
import { DarkTheme, type Theme } from 'expo-router';

import type { TileState } from '@/domain/treeView';
import type { Attribute, Branch, RankTitle, Tier } from '@/domain/types';

import { Palette } from './palette';

/** Raw palette (`palette.ts`). Contrast pairs are pinned in theme.test.ts and listed in docs/DESIGN.md. */
export { Palette };

/** Semantic colors: what components use. */
export const Colors = {
  background: Palette.night,
  surface: Palette.stone,
  surfaceRaised: Palette.stoneRaised,
  /** Inner frame line on stone, unlit bar segments, dividers. */
  border: Palette.stoneEdge,
  /** Outer frame line and hard drop shadow. */
  ink: Palette.ink,
  text: Palette.bone,
  textMuted: Palette.mist,
  textOnGold: Palette.parchmentInk,
  textOnParchment: Palette.parchmentInk,
  parchment: Palette.parchment,
  gold: Palette.gold,
  goldLight: Palette.goldLight,
  goldDark: Palette.goldDark,
  bronze: Palette.bronze,
  rune: Palette.rune,
  arcane: Palette.arcane,
  ember: Palette.ember,
  danger: Palette.blood,
  dangerDark: Palette.bloodDark,
  success: Palette.verdant,
  steel: Palette.steel,
  steelDark: Palette.steelDark,
} as const;

export type ColorToken = keyof typeof Colors;

/** Tier colors (ADR-007 tiers): beginner green, intermediate blue, advanced purple, elite gold. */
export const TierColors: Readonly<Record<Tier, string>> = {
  beginner: Palette.verdant,
  intermediate: Palette.sky,
  advanced: Palette.amethyst,
  elite: Palette.sunfire,
};

/**
 * Rank crest colors (PLAN 4.5): steel for Novice, then the tier colors upwards, so a Master's crest
 * matches the advanced tier and a Legend's the legendary gold.
 */
export const RankColors: Readonly<Record<RankTitle, string>> = {
  Novice: Palette.steel,
  Apprentice: Palette.verdant,
  Adept: Palette.sky,
  Master: Palette.amethyst,
  Legend: Palette.sunfire,
};

/** Attribute colors for stat bars and the radar. */
export const AttributeColors: Readonly<Record<Attribute, string>> = {
  push: Palette.ember,
  pull: Palette.sky,
  core: Palette.gold,
  legs: Palette.verdant,
  balance: Palette.rune,
  mobility: Palette.arcane,
};

/**
 * Font families. The names are the keys `useFonts` registers (src/components/fonts.ts); until the
 * fonts are loaded (or if loading fails) React Native falls back to the system font.
 */
export const FontFamily = {
  /**
   * Pixel font for titles, headings, buttons and big numbers: Jersey 15, whose ten digits are all
   * distinct (ADR-048 replaced Pixelify Sans, where a 5 looked like an S or an 8).
   */
  pixel: 'Jersey15_400Regular',
  /** Tiny all-caps pixel font for tags, chips and tab labels. */
  caps: 'Silkscreen_400Regular',
  /** Readable humanist body font. */
  body: 'AlegreyaSans_400Regular',
  bodyBold: 'AlegreyaSans_700Bold',
} as const;

/**
 * Type scale (docs/DESIGN.md → Typography). Jersey 15 draws smaller than its size (cap height 0.56
 * em), so the pixel sizes are about 7/6 of the old Pixelify ones: same cap height and line height.
 */
export const TypeScale = {
  display: { fontFamily: FontFamily.pixel, fontSize: 36, lineHeight: 40 },
  title: { fontFamily: FontFamily.pixel, fontSize: 28, lineHeight: 32 },
  heading: { fontFamily: FontFamily.pixel, fontSize: 21, lineHeight: 24 },
  label: { fontFamily: FontFamily.caps, fontSize: 12, lineHeight: 16, letterSpacing: 1 },
  body: { fontFamily: FontFamily.body, fontSize: 17, lineHeight: 24 },
  small: { fontFamily: FontFamily.body, fontSize: 15, lineHeight: 20 },
} as const;

export type TextVariant = keyof typeof TypeScale;

/** Navigation header titles (tab and stack screens): the pixel font, between heading and title. */
export const HeaderTitleStyle = { fontFamily: FontFamily.pixel, fontSize: 23 } as const;

/** One art pixel in dp. Borders, steps, shadows and icon cells are multiples of it. */
export const PIXEL = 2;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Border = {
  /** One frame line. */
  line: PIXEL,
  /** Width of the hard drop shadow (and the press travel of a button). */
  shadow: 2 * PIXEL,
  /** Size of one corner step; frames have two steps. */
  cornerStep: PIXEL,
} as const;

/** Minimum touch target (Android 48 dp, WCAG ≥ 44). */
export const TOUCH_TARGET = 48;

/** A frame: stacked lines from the outside in, then the fill. */
export interface FrameStyle {
  lines: readonly string[];
  fill: string;
}

export const Frames = {
  stone: { lines: [Colors.ink, Colors.border], fill: Colors.surface },
  raised: { lines: [Colors.ink, Colors.goldDark], fill: Colors.surfaceRaised },
  gold: { lines: [Colors.ink, Colors.gold], fill: Colors.surface },
  parchment: { lines: [Colors.ink, Colors.bronze], fill: Colors.parchment },
  rune: { lines: [Colors.ink, Colors.rune], fill: Colors.surface },
  danger: { lines: [Colors.ink, Colors.danger], fill: Colors.surface },
  /** The user's own changes to the tree: the "Custom" badge, the editor (PLAN 4.7). */
  arcane: { lines: [Colors.ink, Colors.arcane], fill: Colors.surface },
  /** A picked chip or row (goal, tag, branch). */
  selected: { lines: [Colors.ink, Colors.gold], fill: Colors.surfaceRaised },
} as const satisfies Record<string, FrameStyle>;

export type FrameVariant = keyof typeof Frames;

/**
 * Skill-tree tiles by state (PLAN 4.2, docs/DESIGN.md → Tree): locked tiles sink into the night,
 * available ones glow rune-blue, trained ones are raised, proficient ones gold, mastered ones bright
 * gold; a legendary teaser is an ink silhouette.
 */
export const TileFrames: Readonly<Record<TileState, FrameStyle>> = {
  legendary: { lines: [Colors.ink, Colors.goldDark], fill: Colors.ink },
  locked: { lines: [Colors.ink, Colors.border], fill: Colors.background },
  available: { lines: [Colors.ink, Colors.rune, Palette.runeShade], fill: Colors.surface },
  training: { lines: [Colors.ink, Colors.goldDark], fill: Colors.surfaceRaised },
  proficient: { lines: [Colors.ink, Colors.gold, Colors.goldDark], fill: Colors.surface },
  mastered: { lines: [Colors.ink, Colors.goldLight, Colors.gold], fill: Colors.surfaceRaised },
};

/** The pixel chain between two tiles: lit gold once the prerequisite is met, dull steel before. */
export const ChainColors = {
  met: Colors.gold,
  unmet: Colors.steelDark,
} as const;

/**
 * Branch lane colors on the tree map (PLAN 5.1): warm for push, cool for pull, rune/arcane for the
 * straight-arm levers, gold light for planche, and the attribute colors for the rest. Used for the
 * lane's rule line and its caps title (text, contrast-tested on `background` and `surface`).
 */
export const BranchColors: Readonly<Record<Branch, string>> = {
  h_push: Palette.ember,
  v_push: Palette.sunfire,
  v_pull: Palette.sky,
  h_pull: Palette.steel,
  front_lever: Palette.rune,
  back_lever: Palette.amethyst,
  planche: Palette.goldLight,
  handstand: Palette.parchment,
  core: Palette.gold,
  legs: Palette.verdant,
  dynamic: Palette.bone,
  flexibility: Palette.arcane,
  acrobatics: Palette.orchid,
  mobility: Palette.lime,
};

/**
 * The tree map (PLAN 5.1): lane bands in stone on the night sky, edges as square pixel lines (gold
 * with a soft gold glow once met, dull steel before; `ChainColors`).
 */
export const MapStyle = {
  laneFill: Colors.surface,
  chainWidth: 2 * PIXEL,
  unmetWidth: PIXEL,
  /** The glow under a met chain: a wider gold line at low opacity (the only soft edge allowed). */
  glowWidth: 5 * PIXEL,
  glowOpacity: 0.3,
  /** Height of the lane's top rule line. */
  laneRule: PIXEL,
} as const;

/** Button looks: frame + text color. */
export const ButtonStyles = {
  primary: {
    frame: { lines: [Colors.ink, Colors.goldLight], fill: Colors.gold },
    text: Colors.textOnGold,
  },
  secondary: { frame: Frames.raised, text: Colors.text },
  danger: {
    frame: { lines: [Colors.ink, Colors.danger], fill: Colors.dangerDark },
    text: Colors.text,
  },
} as const satisfies Record<string, { frame: FrameStyle; text: string }>;

export type ButtonVariant = keyof typeof ButtonStyles;

/** Motion (docs/DESIGN.md → Motion). Stepped timing keeps animation "pixel"; reduce-motion skips it. */
export const Motion = {
  burstMs: 640,
  burstSteps: 8,
  burstDistance: 64,
} as const;

/** Navigation theme derived from {@link Colors}. */
export const NavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.gold,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.ink,
    notification: Colors.arcane,
  },
};
