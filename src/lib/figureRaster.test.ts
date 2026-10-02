import { FIGURE_GRID, type Pose } from './figure';
import { distanceToSegment, FIGURE_ROLES, FLOOR_Y, rasterizePose, type Prop } from './figureRaster';
import { parsePixelGrid } from './pixelGrid';

const STAND: Pose = {
  at: { x: 16, y: 19 },
  torso: -90,
  arms: [
    [90, 90],
    [90, 90],
  ],
  legs: [
    [90, 90],
    [90, 90],
  ],
};

const ROLE_CHARS = Object.values(FIGURE_ROLES).join('');

function cell(rows: string[], x: number, y: number): string {
  return rows[y][x];
}

describe('distanceToSegment', () => {
  it('measures to the nearest point of the segment, ends included', () => {
    expect(distanceToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(3);
    expect(distanceToSegment({ x: 13, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5);
    expect(distanceToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);
  });
});

describe('rasterizePose', () => {
  it('returns a FIGURE_GRID square of known roles', () => {
    const rows = rasterizePose(STAND, [{ kind: 'floor' }]);
    expect(rows).toHaveLength(FIGURE_GRID);
    for (const row of rows) expect(row).toHaveLength(FIGURE_GRID);
    expect(() => parsePixelGrid(rows, ROLE_CHARS)).not.toThrow();
  });

  it('draws the floor from FLOOR_Y down and the figure on top of it', () => {
    const rows = rasterizePose(STAND, [{ kind: 'floor' }]);
    expect(rows[FLOOR_Y]).toBe(FIGURE_ROLES.wood.repeat(FIGURE_GRID));
    expect(rows[FLOOR_Y - 1]).not.toBe(FIGURE_ROLES.empty.repeat(FIGURE_GRID));
    expect(cell(rows, 16, 23)).toBe(FIGURE_ROLES.body);
  });

  it('draws the head as a body disc above the shoulders', () => {
    const rows = rasterizePose(STAND, []);
    // Head centre: hip 19 - torso 7 - neck 3.4 = 8.6.
    expect(cell(rows, 16, 8)).toBe(FIGURE_ROLES.body);
    expect(cell(rows, 16, 1)).toBe(FIGURE_ROLES.empty);
  });

  it('draws the far limbs behind in their own shade', () => {
    const lunge: Pose = {
      ...STAND,
      legs: [
        [60, 90],
        [130, 100],
      ],
    };
    const rows = rasterizePose(lunge, []);
    expect(rows.join('')).toContain(FIGURE_ROLES.bodyFar);
    expect(rows.join('')).toContain(FIGURE_ROLES.bodyLight);
  });

  it('draws bars and rings in front of the hands, stands and walls behind the figure', () => {
    const hang: Pose = {
      ...STAND,
      arms: [
        [-90, -90],
        [-90, -90],
      ],
      anchor: 'hand',
      at: { x: 16, y: 4 },
    };
    const props: Prop[] = [{ kind: 'bar', x: 16, y: 4 }];
    expect(cell(rasterizePose(hang, props), 16, 4)).toBe(FIGURE_ROLES.metal);
    const wallRows = rasterizePose(STAND, [{ kind: 'wall', x: 14 }]);
    expect(cell(wallRows, 16, 23)).toBe(FIGURE_ROLES.body);
    expect(cell(wallRows, 30, 15)).toBe(FIGURE_ROLES.wood);
  });

  it('puts a bar on a rig: a post from the floor and a beam over to the bar', () => {
    const rows = rasterizePose(STAND, [{ kind: 'floor' }, { kind: 'bar', x: 16, y: 6 }]);
    // Post 11 columns to the left, from the beam down to the floor.
    expect(cell(rows, 5, 20)).toBe(FIGURE_ROLES.metalDark);
    expect(cell(rows, 5, FLOOR_Y - 1)).toBe(FIGURE_ROLES.metalDark);
    // Beam at the bar's height, the bar itself a bold steel cross-section.
    expect(cell(rows, 10, 5)).toBe(FIGURE_ROLES.metalDark);
    expect(cell(rows, 16, 6)).toBe(FIGURE_ROLES.metal);
    expect(cell(rows, 15, 5)).toBe(FIGURE_ROLES.metal);
    const right = rasterizePose(STAND, [{ kind: 'bar', x: 10, y: 6, postX: 25 }]);
    expect(cell(right, 25, 20)).toBe(FIGURE_ROLES.metalDark);
  });

  it('draws every prop kind inside the grid', () => {
    const props: Prop[] = [
      { kind: 'floor' },
      { kind: 'box', x: 2, width: 6, height: 4 },
      { kind: 'parallettes', x: 20, width: 8 },
      { kind: 'dipBars', x: 10, y: 18, width: 10 },
      { kind: 'rings', x: 25, y: 10 },
      { kind: 'rail', x: 4, y: 3, width: 20 },
      { kind: 'pole', x: 30 },
    ];
    const rows = rasterizePose(STAND, props);
    expect(cell(rows, 3, FLOOR_Y - 2)).toBe(FIGURE_ROLES.wood);
    expect(cell(rows, 22, FLOOR_Y - 3)).toBe(FIGURE_ROLES.metal);
    expect(cell(rows, 25, 2)).toBe(FIGURE_ROLES.metalDark);
    expect(cell(rows, 5, 2)).toBe(FIGURE_ROLES.metal);
    expect(cell(rows, 30, 5)).toBe(FIGURE_ROLES.metal);
  });
});
