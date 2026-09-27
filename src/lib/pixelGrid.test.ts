import { gridRoles, parsePixelGrid } from './pixelGrid';

describe('parsePixelGrid', () => {
  it('merges horizontal runs of one role and skips transparent cells', () => {
    const grid = parsePixelGrid(['.##+', '#  #']);
    expect(grid.width).toBe(4);
    expect(grid.height).toBe(2);
    expect(grid.runs).toEqual([
      { x: 1, y: 0, width: 2, role: '#' },
      { x: 3, y: 0, width: 1, role: '+' },
      { x: 0, y: 1, width: 1, role: '#' },
      { x: 3, y: 1, width: 1, role: '#' },
    ]);
  });

  it('never merges runs across rows', () => {
    const grid = parsePixelGrid(['##', '##']);
    expect(grid.runs).toHaveLength(2);
  });

  it('returns no runs for an all-transparent grid', () => {
    expect(parsePixelGrid(['...', '...']).runs).toEqual([]);
  });

  it('rejects ragged rows', () => {
    expect(() => parsePixelGrid(['###', '##'])).toThrow('Row 1 has 2 cells, expected 3');
  });

  it('rejects an empty grid', () => {
    expect(() => parsePixelGrid([])).toThrow('needs cells');
    expect(() => parsePixelGrid([''])).toThrow('needs cells');
  });

  it('rejects roles outside the allowed set', () => {
    expect(() => parsePixelGrid(['#x'], '#+')).toThrow('Unknown role "x" at row 0, column 1');
    expect(() => parsePixelGrid(['#+'], '#+')).not.toThrow();
  });

  it('lists the roles in order of first use', () => {
    expect(gridRoles(parsePixelGrid(['+#', '#o']))).toEqual(['+', '#', 'o']);
  });
});
