import { MONSTER_KINDS } from '@/domain/monsters';
import { parsePixelGrid } from '@/lib/pixelGrid';

import {
  BEATEN_COLORS,
  HIT_COLORS,
  MONSTER_ART,
  MONSTER_COLORS,
  MONSTER_ROLES,
  MONSTER_SIZE,
  monsterFrames,
} from './monsters';

const HEX = /^#[0-9A-F]{6}$/i;

describe('monster art', () => {
  it.each(MONSTER_KINDS)('%s is a square grid of known roles with an empty last row', (kind) => {
    const grid = parsePixelGrid(MONSTER_ART[kind], MONSTER_ROLES);
    expect(grid.width).toBe(MONSTER_SIZE);
    expect(grid.height).toBe(MONSTER_SIZE);
    expect(MONSTER_ART[kind][MONSTER_SIZE - 1]).toBe('.'.repeat(MONSTER_SIZE));
  });

  it.each(MONSTER_KINDS)('%s bobs one cell down in its second frame', (kind) => {
    const [first, second] = monsterFrames(kind);
    expect(second.slice(1)).toEqual(first.slice(0, -1));
    expect(parsePixelGrid(second).runs.length).toBe(parsePixelGrid(first).runs.length);
  });

  it('colours every role of every palette', () => {
    for (const colors of [...Object.values(MONSTER_COLORS), HIT_COLORS, BEATEN_COLORS]) {
      for (const role of MONSTER_ROLES) expect(colors[role as keyof typeof colors]).toMatch(HEX);
    }
  });
});
