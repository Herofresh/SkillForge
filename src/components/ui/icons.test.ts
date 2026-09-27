import { gridRoles } from '@/lib/pixelGrid';

import { ICON_NAMES, ICON_SIZE_CELLS, ICONS, iconGrid, type IconRole } from './icons';

const REQUIRED_ICONS = [
  'sword',
  'shield',
  'flame',
  'star',
  'lock',
  'chain',
  'scroll',
  'potion',
  'bar',
  'heart',
  'rune',
  'tree',
  'helmet',
  'gear',
];

describe('pixel icon set', () => {
  it('has every icon the design system names', () => {
    expect(ICON_NAMES).toEqual(expect.arrayContaining(REQUIRED_ICONS));
  });

  it.each(ICON_NAMES)('%s is a 12x12 grid with a color for every role it uses', (name) => {
    const grid = iconGrid(name);
    expect(grid.width).toBe(ICON_SIZE_CELLS);
    expect(grid.height).toBe(ICON_SIZE_CELLS);
    expect(grid.runs.length).toBeGreaterThan(0);
    const colors: Partial<Record<IconRole, string>> = ICONS[name].colors;
    for (const role of gridRoles(grid)) {
      expect(colors[role as IconRole]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('caches parsed grids', () => {
    expect(iconGrid('sword')).toBe(iconGrid('sword'));
  });
});
