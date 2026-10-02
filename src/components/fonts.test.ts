import { FONT_ASSETS } from './fonts';
import { FontFamily, HeaderTitleStyle, TypeScale } from './theme';

/**
 * Fonts whose ten digits were checked side by side (Style Guide → Digits, docs/screenshots/6.1-*)
 * and are all distinct. Pixelify Sans is not one: its 5 reads as an S or an 8 (PLAN 6.1, ADR-048).
 */
const CLEAR_DIGIT_FONTS: readonly string[] = [
  'Jersey15_400Regular',
  'Silkscreen_400Regular',
  'AlegreyaSans_400Regular',
  'AlegreyaSans_700Bold',
];

const ROLES = [
  ...Object.entries(TypeScale).map(([variant, style]) => [variant, style.fontFamily] as const),
  ['header title', HeaderTitleStyle.fontFamily] as const,
];

describe('fonts', () => {
  it.each(ROLES)('%s uses a font that is loaded at start-up', (_role, family) => {
    expect(FONT_ASSETS).toHaveProperty([family]);
  });

  it.each(ROLES)('%s uses a font where every digit is distinct', (_role, family) => {
    expect(CLEAR_DIGIT_FONTS).toContain(family);
  });

  it('loads only the font files a token names', () => {
    expect(Object.keys(FONT_ASSETS).sort()).toEqual([...new Set(Object.values(FontFamily))].sort());
  });
});
