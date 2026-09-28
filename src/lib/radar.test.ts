import {
  isInsidePolygon,
  radarPolygon,
  rasterizePolygon,
  scalePolygon,
  segmentQuad,
  spokePoint,
} from './radar';

const center = { x: 10, y: 10 };

describe('spokePoint', () => {
  it('starts at the top and goes clockwise', () => {
    const top = spokePoint(center, 10, 0, 4);
    expect(top.x).toBeCloseTo(10);
    expect(top.y).toBeCloseTo(0);
    const right = spokePoint(center, 10, 1, 4);
    expect(right.x).toBeCloseTo(20);
    expect(right.y).toBeCloseTo(10);
  });

  it('scales by the fraction', () => {
    const half = spokePoint(center, 10, 2, 4, 0.5);
    expect(half.x).toBeCloseTo(10);
    expect(half.y).toBeCloseTo(15);
  });
});

describe('radarPolygon', () => {
  it('clamps fractions to 0–1', () => {
    const [top, right] = radarPolygon([2, -1, 1, 1], center, 10);
    expect(top.y).toBeCloseTo(0);
    expect(right.x).toBeCloseTo(10);
  });
});

describe('isInsidePolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 4 },
    { x: 0, y: 4 },
  ];
  it('tells inside from outside', () => {
    expect(isInsidePolygon({ x: 2, y: 2 }, square)).toBe(true);
    expect(isInsidePolygon({ x: 5, y: 2 }, square)).toBe(false);
    expect(isInsidePolygon({ x: 2, y: -1 }, square)).toBe(false);
  });
});

describe('rasterizePolygon', () => {
  it('fills the cells whose centres are inside, as merged runs', () => {
    const square = [
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 6 },
      { x: 2, y: 6 },
    ];
    // cell 2: columns 1 and 2 (centres 3, 5) of rows 1 and 2 are inside
    expect(rasterizePolygon(square, 2, 4, 4)).toEqual([
      { x: 1, y: 1, width: 2 },
      { x: 1, y: 2, width: 2 },
    ]);
  });

  it('fills nothing for a degenerate polygon', () => {
    expect(rasterizePolygon(radarPolygon([0, 0, 0], center, 10), 2, 10, 10)).toEqual([]);
    expect(rasterizePolygon([], 2, 10, 10)).toEqual([]);
  });

  it('closes runs at the right edge', () => {
    const wide = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 2 },
      { x: 0, y: 2 },
    ];
    expect(rasterizePolygon(wide, 2, 5, 1)).toEqual([{ x: 0, y: 0, width: 5 }]);
  });
});

describe('outlines', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 8, y: 0 },
    { x: 8, y: 8 },
    { x: 0, y: 8 },
  ];

  it('scales a polygon around a centre', () => {
    expect(scalePolygon(square, { x: 4, y: 4 }, 0.5)[0]).toEqual({ x: 2, y: 2 });
  });

  it('leaves the hole empty', () => {
    const ring = rasterizePolygon(square, 2, 4, 4, scalePolygon(square, { x: 4, y: 4 }, 0.5));
    expect(ring).toEqual([
      { x: 0, y: 0, width: 4 },
      { x: 0, y: 1, width: 1 },
      { x: 3, y: 1, width: 1 },
      { x: 0, y: 2, width: 1 },
      { x: 3, y: 2, width: 1 },
      { x: 0, y: 3, width: 4 },
    ]);
  });

  it('turns a segment into a thin quad', () => {
    const quad = segmentQuad({ x: 0, y: 5 }, { x: 10, y: 5 }, 2);
    expect(quad.map((point) => point.y)).toEqual([6, 6, 4, 4]);
    expect(segmentQuad({ x: 1, y: 1 }, { x: 1, y: 1 }, 2)).toEqual([]);
    expect(rasterizePolygon(quad, 2, 5, 5)).toEqual([{ x: 0, y: 2, width: 5 }]);
  });
});
