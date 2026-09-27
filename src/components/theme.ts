/**
 * SkillForge design tokens (PLAN 4.0, ADR-030, docs/DESIGN.md): pixel-art meets dark fantasy
 * grimoire. This is the ONLY place for colors, fonts, spacing, borders and frame styles; import the
 * tokens, never copy a hex value or a font name into a component.
 */
import { DarkTheme, type Theme } from 'expo-router';

import type { Attribute, Tier } from '@/domain/types';

/** Raw palette. Contrast pairs are pinned in theme.test.ts and listed in docs/DESIGN.md. */
export const Palette = {
  night: '#0D0B14',
  stone: '#1A1624',
  stoneRaised: '#262036',
  stoneEdge: '#3E3654',
  ink: '#050408',
  parchment: '#EAD9A8',
  parchmentInk: '#2B1D0E',
  bone: '#F3EAD3',
  mist: '#B4A9C8',
  gold: '#E9B949',
  goldLight: '#FFE08A',
  goldDark: '#9A7328',
  bronze: '#7A5424',
  rune: '#62E3F0',
  arcane: '#A58BFF',
  ember: '#F2893B',
  blood: '#EC6B73',
  bloodDark: '#8E2230',
  steel: '#C5CCD8',
  steelDark: '#6E7890',
  verdant: '#6BD17A',
  sky: '#58A6FF',
  amethyst: '#B07CFF',
  sunfire: '#F5A524',
} as const;

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
  /** Pixel display font for titles and numbers. */
  display: 'PixelifySans_700Bold',
  /** Pixel font for headings and buttons. */
  pixel: 'PixelifySans_600SemiBold',
  /** Tiny all-caps pixel font for tags, chips and tab labels. */
  caps: 'Silkscreen_400Regular',
  /** Readable humanist body font. */
  body: 'AlegreyaSans_400Regular',
  bodyBold: 'AlegreyaSans_700Bold',
} as const;

/** Type scale (docs/DESIGN.md → Typography). */
export const TypeScale = {
  display: { fontFamily: FontFamily.display, fontSize: 32, lineHeight: 40 },
  title: { fontFamily: FontFamily.display, fontSize: 24, lineHeight: 32 },
  heading: { fontFamily: FontFamily.pixel, fontSize: 18, lineHeight: 24 },
  label: { fontFamily: FontFamily.caps, fontSize: 12, lineHeight: 16, letterSpacing: 1 },
  body: { fontFamily: FontFamily.body, fontSize: 17, lineHeight: 24 },
  small: { fontFamily: FontFamily.body, fontSize: 15, lineHeight: 20 },
} as const;

export type TextVariant = keyof typeof TypeScale;

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
  /** A picked chip or row (goal, tag, branch). */
  selected: { lines: [Colors.ink, Colors.gold], fill: Colors.surfaceRaised },
} as const satisfies Record<string, FrameStyle>;

export type FrameVariant = keyof typeof Frames;

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
