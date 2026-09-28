/**
 * The raw SkillForge palette (docs/DESIGN.md → Palette). It lives in its own file with no React
 * Native imports so Node scripts can use it too (the app icon, scripts/appIcon.ts, ADR-042); the app
 * imports it through `theme.ts`, which maps it to the semantic tokens.
 */
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
  /** Dim rune: the inner glow line of an available tile (decoration only). */
  runeShade: '#2A7C86',
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

export type PaletteColor = keyof typeof Palette;
