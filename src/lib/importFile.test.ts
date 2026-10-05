import { importFileSizeProblem, MAX_IMPORT_FILE_BYTES } from './importFile';

describe('importFileSizeProblem', () => {
  it('allows files up to the limit and files of unknown size', () => {
    expect(importFileSizeProblem(0)).toBeUndefined();
    expect(importFileSizeProblem(MAX_IMPORT_FILE_BYTES)).toBeUndefined();
    expect(importFileSizeProblem(undefined)).toBeUndefined();
    expect(importFileSizeProblem(null)).toBeUndefined();
  });

  it('refuses a larger file with a readable message naming both sizes', () => {
    expect(importFileSizeProblem(MAX_IMPORT_FILE_BYTES + 1)).toBe(
      'This file is too large to import (6 MB; the limit is 5 MB). Choose a SkillForge backup or progressions file.',
    );
    expect(importFileSizeProblem(200 * 1024 * 1024)).toMatch(/\(200 MB; the limit is 5 MB\)/);
  });
});
