/** Time unit constants. Timestamps in SkillForge are milliseconds since the Unix epoch. */
export const MS_PER_SECOND = 1000;
export const MS_PER_HOUR = 60 * 60 * MS_PER_SECOND;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const MS_PER_WEEK = 7 * MS_PER_DAY;

/** The wall clock, for UI event handlers (the store takes its own injectable clock). */
export const currentTime = (): number => Date.now();
