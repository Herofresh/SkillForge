/** WCAG 2.x contrast helpers for `#RRGGBB` colors (used to keep the theme's text legible). */

const HEX_COLOR = /^#([0-9a-f]{6})$/i;

/** WCAG body-text minimum (AA, normal text). */
export const MIN_TEXT_CONTRAST = 4.5;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance (0 = black, 1 = white) of a `#RRGGBB` color. */
export function relativeLuminance(hex: string): number {
  const match = HEX_COLOR.exec(hex);
  if (!match) throw new Error(`Expected a #RRGGBB color, got "${hex}"`);
  const n = parseInt(match[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colors, 1 (none) to 21 (black on white). Order doesn't matter. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
