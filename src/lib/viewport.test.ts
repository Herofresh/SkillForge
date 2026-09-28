import { clampPan, clampScale, fitBox, zoomAround } from './viewport';

const LIMITS = { minScale: 0.5, maxScale: 2 };
const SCREEN = { width: 400, height: 800 };

describe('clampScale', () => {
  it('keeps the scale inside the limits', () => {
    expect(clampScale(0.1, LIMITS)).toBe(0.5);
    expect(clampScale(1.2, LIMITS)).toBe(1.2);
    expect(clampScale(9, LIMITS)).toBe(2);
  });
});

describe('zoomAround', () => {
  it('keeps the focal point fixed on the screen', () => {
    const before = { scale: 1, x: -100, y: -50 };
    const focal = { x: 200, y: 300 };
    const after = zoomAround(before, focal, 2, LIMITS);
    const contentX = (focal.x - before.x) / before.scale;
    const contentY = (focal.y - before.y) / before.scale;
    expect(after.scale).toBe(2);
    expect(contentX * after.scale + after.x).toBeCloseTo(focal.x);
    expect(contentY * after.scale + after.y).toBeCloseTo(focal.y);
  });

  it('clamps the zoom', () => {
    expect(zoomAround({ scale: 1, x: 0, y: 0 }, { x: 0, y: 0 }, 10, LIMITS).scale).toBe(2);
  });
});

describe('clampPan', () => {
  const content = { width: 1000, height: 2000 };

  it('stops the content edge at the middle of the screen', () => {
    expect(clampPan({ scale: 1, x: 500, y: 900 }, content, SCREEN)).toEqual({
      scale: 1,
      x: 200,
      y: 400,
    });
    expect(clampPan({ scale: 1, x: -5000, y: -5000 }, content, SCREEN)).toEqual({
      scale: 1,
      x: 200 - 1000,
      y: 400 - 2000,
    });
  });

  it('leaves an in-range viewport alone', () => {
    const viewport = { scale: 0.5, x: -100, y: -200 };
    expect(clampPan(viewport, content, SCREEN)).toEqual(viewport);
  });
});

describe('fitBox', () => {
  it('centers a small box at the largest allowed zoom', () => {
    const view = fitBox({ x: 100, y: 100, width: 100, height: 100 }, SCREEN, LIMITS, 16);
    expect(view.scale).toBe(2);
    // The box's middle (150, 150) lands on the screen's middle.
    expect(150 * view.scale + view.x).toBeCloseTo(200);
    expect(150 * view.scale + view.y).toBeCloseTo(400);
  });

  it('shrinks to fit a medium box', () => {
    const view = fitBox({ x: 0, y: 0, width: 736, height: 200 }, SCREEN, LIMITS, 32);
    expect(view.scale).toBeCloseTo(0.5);
    const scaled = fitBox({ x: 0, y: 0, width: 504, height: 200 }, SCREEN, LIMITS, 32);
    expect(scaled.scale).toBeCloseTo(336 / 504);
  });

  it('shows the top-left of a box too big for the smallest zoom', () => {
    const view = fitBox({ x: 1000, y: 40, width: 4000, height: 100 }, SCREEN, LIMITS, 16);
    expect(view.scale).toBe(0.5);
    expect(1000 * view.scale + view.x).toBeCloseTo(16);
    // The other axis starts at the padding too.
    expect(40 * view.scale + view.y).toBeCloseTo(16);
  });
});
