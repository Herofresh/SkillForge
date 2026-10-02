/**
 * A 3 × 5 pixel font for labels in generated preview sheets (scripts/animationSheet.ts), so a
 * contact sheet says which exercise each row is without an image or font dependency. Uppercase
 * letters, digits and `_ - . ( ) /`; anything else draws as a space.
 */
import type { RgbaImage } from './png';
import { hexToRgba } from './raster';

export const GLYPH_WIDTH = 3;
export const GLYPH_HEIGHT = 5;

const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['##.', '#.#', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.#.', '#..', '###'],
  '3': ['##.', '..#', '.#.', '..#', '##.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '##.', '..#', '##.'],
  '6': ['.##', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '##.'],
  _: ['...', '...', '...', '...', '###'],
  '-': ['...', '...', '###', '...', '...'],
  '.': ['...', '...', '...', '...', '.#.'],
  '(': ['.#.', '#..', '#..', '#..', '.#.'],
  ')': ['.#.', '..#', '..#', '..#', '.#.'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
};

/** Width in pixels of `text` at `scale` (one blank column between glyphs). */
export function textWidth(text: string, scale: number): number {
  return text.length === 0 ? 0 : (text.length * (GLYPH_WIDTH + 1) - 1) * scale;
}

/** Draws `text` (case-insensitive) at (x, y) in `color`, each font pixel `scale` image pixels. */
export function drawText(
  image: RgbaImage,
  text: string,
  x: number,
  y: number,
  color: string,
  scale: number,
): RgbaImage {
  const rgba = hexToRgba(color);
  [...text.toUpperCase()].forEach((char, index) => {
    const glyph = GLYPHS[char];
    if (glyph === undefined) return;
    for (let cell = 0; cell < GLYPH_WIDTH * GLYPH_HEIGHT; cell += 1) {
      const row = Math.floor(cell / GLYPH_WIDTH);
      const column = cell % GLYPH_WIDTH;
      if (glyph[row][column] !== '#') continue;
      const gx = x + (index * (GLYPH_WIDTH + 1) + column) * scale;
      const gy = y + row * scale;
      for (let v = 0; v < scale; v += 1) {
        for (let u = 0; u < scale; u += 1) {
          const px = gx + u;
          const py = gy + v;
          if (px < 0 || py < 0 || px >= image.width || py >= image.height) continue;
          image.data.set(rgba, (py * image.width + px) * 4);
        }
      }
    }
  });
  return image;
}
