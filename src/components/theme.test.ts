import { contrastRatio, MIN_TEXT_CONTRAST } from '@/lib/contrast';

import { AttributeColors, ButtonStyles, Colors, RankColors, TierColors, TileFrames } from './theme';

/** Every text color on every surface it is used on (docs/DESIGN.md → Palette). */
const TEXT_PAIRS: readonly [string, string, string][] = [
  ['text', Colors.text, Colors.background],
  ['text', Colors.text, Colors.surface],
  ['text', Colors.text, Colors.surfaceRaised],
  ['textMuted', Colors.textMuted, Colors.background],
  ['textMuted', Colors.textMuted, Colors.surface],
  ['textMuted', Colors.textMuted, Colors.surfaceRaised],
  ['gold', Colors.gold, Colors.surface],
  ['gold', Colors.gold, Colors.surfaceRaised],
  ['rune', Colors.rune, Colors.surface],
  ['arcane', Colors.arcane, Colors.surface],
  ['ember', Colors.ember, Colors.surface],
  ['danger', Colors.danger, Colors.surface],
  ['danger', Colors.danger, Colors.surfaceRaised],
  ['success', Colors.success, Colors.surface],
  ['textOnParchment', Colors.textOnParchment, Colors.parchment],
  // Tiles (PLAN 4.2): name and state text on every tile fill.
  ...Object.entries(TileFrames).flatMap(([state, frame]) => [
    [`tile ${state} text`, Colors.text, frame.fill] as [string, string, string],
    [`tile ${state} textMuted`, Colors.textMuted, frame.fill] as [string, string, string],
    [`tile ${state} rune`, Colors.rune, frame.fill] as [string, string, string],
    [`tile ${state} gold`, Colors.gold, frame.fill] as [string, string, string],
  ]),
  ...Object.entries(AttributeColors).map(
    ([name, color]) => [`attribute ${name}`, color, Colors.surface] as [string, string, string],
  ),
  ...Object.entries(ButtonStyles).map(
    ([name, style]) => [`button ${name}`, style.text, style.frame.fill] as [string, string, string],
  ),
  ...Object.entries(TierColors).map(
    ([tier, color]) => [`tier ${tier}`, color, Colors.surface] as [string, string, string],
  ),
  ...Object.entries(RankColors).map(
    ([rank, color]) => [`rank ${rank}`, color, Colors.surfaceRaised] as [string, string, string],
  ),
];

/** Non-text UI (bar fills, icons) needs 3:1 against its surface (WCAG 1.4.11). */
const MIN_UI_CONTRAST = 3;

describe('theme contrast', () => {
  it.each(TEXT_PAIRS)('%s text is legible (>= 4.5:1)', (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each(Object.entries(AttributeColors))('%s bar color stands out (>= 3:1)', (_name, color) => {
    expect(contrastRatio(color, Colors.surface)).toBeGreaterThanOrEqual(MIN_UI_CONTRAST);
  });

  it('keeps unlit bar segments visible against the frame fill', () => {
    expect(contrastRatio(Colors.border, Colors.ink)).toBeGreaterThanOrEqual(1.5);
  });
});
