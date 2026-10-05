/**
 * Size check for a file the user picks to import (a backup or shared progressions, PLAN 7.0a). The
 * picker accepts any file, so a huge one (a video, a disk image) is refused before it is read into
 * memory instead of freezing or crashing the app.
 */

const BYTES_PER_MB = 1024 * 1024;

/** Picked files above this many bytes are not read. */
export const MAX_IMPORT_FILE_BYTES = 5 * BYTES_PER_MB;

/**
 * Why a picked file of `size` bytes isn't read, or `undefined` when it may be. An unknown size is
 * allowed: the import's own checks still reject a file that isn't a backup.
 */
export function importFileSizeProblem(size: number | null | undefined): string | undefined {
  if (size === null || size === undefined || size <= MAX_IMPORT_FILE_BYTES) return undefined;
  const megabytes = (bytes: number) => Math.ceil(bytes / BYTES_PER_MB);
  return `This file is too large to import (${megabytes(size)} MB; the limit is ${megabytes(MAX_IMPORT_FILE_BYTES)} MB). Choose a SkillForge backup or progressions file.`;
}
