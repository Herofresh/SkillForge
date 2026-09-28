import { gridRoles } from '@/lib/pixelGrid';

import {
  ICON_NAMES,
  ICON_SIZE_CELLS,
  ICONS,
  iconCellColor,
  iconGrid,
  type IconDef,
  type IconRole,
} from './icons';

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

  it.each(ICON_NAMES)('%s keeps an outline when tinted', (name) => {
    const def: IconDef = ICONS[name];
    const drawn = iconGrid(name).runs.filter(
      (run) => iconCellColor(name, run.role as IconRole, '#000000') !== undefined,
    );
    expect(drawn.length).toBeGreaterThan(0);
    for (const role of def.knockout ?? []) expect(def.colors[role]).toBeDefined();
  });

  it('knocks out the scroll fill when tinted, so it is not a solid block', () => {
    expect(iconCellColor('scroll', '+', '#111111')).toBeUndefined();
    expect(iconCellColor('scroll', '#', '#111111')).toBe('#111111');
    expect(iconCellColor('scroll', '+')).toBe(ICONS.scroll.colors['+']);
    expect(iconCellColor('sword', '+', '#111111')).toBe('#111111');
  });

  it('caches parsed grids', () => {
    expect(iconGrid('sword')).toBe(iconGrid('sword'));
  });
});
