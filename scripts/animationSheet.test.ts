import { NODE_ANIMATIONS } from '@/data/animations';
import { FIGURE_GRID } from '@/lib/figure';
import { animationFrames } from '@/lib/figureAnimation';

import { renderSheet, SHEET_CELL } from './animationSheet';
import { createImage, pixelAt } from './raster';
import { drawText, GLYPH_WIDTH, textWidth } from './tinyFont';

describe('renderSheet', () => {
  it('lays out one row per animation and one column per frame', () => {
    const pullUp = NODE_ANIMATIONS.pull_up;
    const frames = animationFrames(pullUp).length;
    const image = renderSheet([
      { label: 'pull_up', animation: pullUp },
      { label: 'squat', animation: NODE_ANIMATIONS.squat },
    ]);
    const frame = FIGURE_GRID * SHEET_CELL;
    expect(image.height).toBeGreaterThan(2 * frame);
    expect(image.height).toBeLessThan(3 * frame);
    expect(image.width).toBeGreaterThan(frames * frame);
  });
});

describe('tinyFont', () => {
  it('measures text with one blank column between glyphs', () => {
    expect(textWidth('', 2)).toBe(0);
    expect(textWidth('AB', 1)).toBe(2 * GLYPH_WIDTH + 1);
  });

  it('draws a glyph and skips unknown characters', () => {
    const image = createImage(8, 6);
    drawText(image, 'i~', 0, 0, '#FFFFFF', 1);
    // "I" starts with a full top row.
    expect(pixelAt(image, 0, 0)).toEqual([255, 255, 255, 255]);
    expect(pixelAt(image, 1, 1)).toEqual([255, 255, 255, 255]);
    // "~" draws nothing.
    expect(pixelAt(image, 5, 0)[3]).toBe(0);
  });
});
