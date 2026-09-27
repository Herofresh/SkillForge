import { contrastRatio, relativeLuminance } from './contrast';

describe('contrast', () => {
  it('computes the luminance of black and white', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('gives 21:1 for black on white, in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
  });

  it('matches a known WCAG value', () => {
    // #767676 on white is the classic 4.54:1 grey.
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });

  it('rejects anything but #RRGGBB', () => {
    expect(() => relativeLuminance('#fff')).toThrow('#RRGGBB');
    expect(() => relativeLuminance('red')).toThrow('#RRGGBB');
  });
});
