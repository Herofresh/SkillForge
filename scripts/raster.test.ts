import {
  composite,
  createImage,
  cropCenter,
  downscale,
  drawGrid,
  hexToRgba,
  mask,
  pixelAt,
  upscale,
} from './raster';

const RED = '#FF0000';
const BLUE = '#0000FF';

describe('raster helpers', () => {
  it('parses #RRGGBB and rejects anything else', () => {
    expect(hexToRgba('#0D0B14')).toEqual([13, 11, 20, 255]);
    expect(() => hexToRgba('red')).toThrow('#RRGGBB');
  });

  it('draws grid cells as solid squares of `cell` pixels at the placement', () => {
    const image = drawGrid(
      createImage(6, 6),
      ['#.', '.+'],
      (role) => (role === '#' ? RED : undefined),
      {
        cell: 2,
        x: 1,
        y: 1,
      },
    );
    expect(pixelAt(image, 1, 1)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(image, 2, 2)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(image, 3, 1)[3]).toBe(0);
    // `+` maps to undefined, so its cell stays empty.
    expect(pixelAt(image, 3, 3)[3]).toBe(0);
    expect(pixelAt(image, 0, 0)[3]).toBe(0);
  });

  it('composites the top layer over the bottom one', () => {
    const top = createImage(1, 1);
    top.data.set([0, 0, 255, 0]);
    expect(pixelAt(composite(createImage(1, 1, RED), top), 0, 0)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(composite(createImage(1, 1, RED), createImage(1, 1, BLUE)), 0, 0)).toEqual([
      0, 0, 255, 255,
    ]);
  });

  it('crops, masks, and scales', () => {
    const image = drawGrid(createImage(4, 4, BLUE), ['#'], () => RED, { cell: 2, x: 1, y: 1 });
    const center = cropCenter(image, 2);
    expect(pixelAt(center, 0, 0)).toEqual([255, 0, 0, 255]);
    expect(
      pixelAt(
        mask(center, (x) => x === 0),
        1,
        0,
      )[3],
    ).toBe(0);
    const small = downscale(createImage(4, 4, BLUE), 2);
    expect(pixelAt(small, 1, 1)).toEqual([0, 0, 255, 255]);
    expect(upscale(small, 3).width).toBe(6);
  });

  it('averages transparent pixels without darkening the color', () => {
    const half = createImage(2, 1);
    half.data.set([255, 0, 0, 255], 0);
    expect(pixelAt(downscale(half, 1), 0, 0)).toEqual([255, 0, 0, 128]);
  });
});
