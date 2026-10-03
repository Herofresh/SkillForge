import {
  finishSprite,
  mirrorPart,
  rotatePart,
  SpriteCanvas,
  spriteRows,
  TONES,
  type FinalCell,
  type Legend,
} from './sprite';

const LEGEND: Legend = {
  A: { material: 'cloth', region: 'torso' },
  M: { material: 'metal', region: 'gear' },
  k: { fixed: 'eye' },
};

/** One letter per tone so the tests can read the result. */
const roleOf = (cell: FinalCell) =>
  'fixed' in cell ? cell.fixed[0] : 'osblx'[TONES.indexOf(cell.tone)];

describe('layered sprites (PLAN 6.10)', () => {
  it('rotates and mirrors parts', () => {
    expect(rotatePart({ rows: ['ab', 'cd', 'ef'] }).rows).toEqual(['eca', 'fdb']);
    expect(mirrorPart({ rows: ['ab.', 'c..'] }).rows).toEqual(['.ba', '..c']);
  });

  it('shades from the top left and outlines in the shape’s own outline tone', () => {
    const canvas = new SpriteCanvas(6, 6);
    canvas.draw({ rows: ['AAA', 'AAA', 'AAA'] }, { x: 1, y: 1 }, LEGEND);
    const rows = spriteRows(finishSprite(canvas, { shiny: new Set() }), roleOf);
    expect(rows).toEqual(['.ooo..', 'olllo.', 'olbso.', 'ossso.', '.ooo..', '......']);
  });

  it('gives shiny materials a specular corner, keeps fixed cells, and adds glow and shadow', () => {
    const canvas = new SpriteCanvas(7, 7);
    canvas.draw({ rows: ['MM', 'Mk'] }, { x: 2, y: 2 }, LEGEND);
    const cells = finishSprite(canvas, {
      shiny: new Set(['metal']),
      glow: 'glow',
      sparkles: [{ x: 6, y: 0, fixed: 'star' }],
      shadow: { key: 'shade', centre: { x: 3.5, y: 6.5 }, rx: 2, ry: 0.6 },
    });
    expect(cells[2][2]).toEqual({ material: 'metal', tone: 'spec' });
    expect(cells[3][3]).toEqual({ fixed: 'eye' });
    expect(cells[1][2]).toEqual({ material: 'metal', tone: 'outline' });
    expect(cells[0][2]).toEqual({ fixed: 'glow' });
    expect(cells[0][6]).toEqual({ fixed: 'star' });
    expect(cells[6][3]).toEqual({ fixed: 'shade' });
  });

  it('recolours regions in place', () => {
    const canvas = new SpriteCanvas(3, 1);
    canvas.draw({ rows: ['AMA'] }, { x: 0, y: 0 }, LEGEND);
    canvas.map((cell) =>
      'material' in cell && cell.region === 'torso'
        ? { material: 'iron', region: 'torso' }
        : undefined,
    );
    expect(canvas.get(0, 0)).toEqual({ material: 'iron', region: 'torso' });
    expect(canvas.get(1, 0)).toEqual({ material: 'metal', region: 'gear' });
  });
});
