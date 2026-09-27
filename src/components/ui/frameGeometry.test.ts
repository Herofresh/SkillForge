import { inset, NO_INSETS, notchedRects } from './frameGeometry';

describe('notchedRects', () => {
  it('draws a two-step staircase corner as three rects', () => {
    expect(notchedRects(NO_INSETS, 2, 2)).toEqual([
      { top: 0, bottom: 0, left: 4, right: 4 },
      { top: 2, bottom: 2, left: 2, right: 2 },
      { top: 4, bottom: 4, left: 0, right: 0 },
    ]);
  });

  it('keeps the base insets (e.g. the shadow offset)', () => {
    const [first] = notchedRects({ top: 4, right: 0, bottom: 0, left: 4 }, 2, 1);
    expect(first).toEqual({ top: 4, bottom: 0, left: 6, right: 2 });
  });

  it('is a plain rect with zero steps', () => {
    expect(notchedRects(NO_INSETS, 2, 0)).toEqual([NO_INSETS]);
  });
});

describe('inset', () => {
  it('moves every side in', () => {
    expect(inset({ top: 1, right: 2, bottom: 3, left: 4 }, 2)).toEqual({
      top: 3,
      right: 4,
      bottom: 5,
      left: 6,
    });
  });
});
