// Jest config (moved out of package.json so it can carry comments). The per-suite timeout for the
// heavy component suites lives in jest.setup.ts (UI_SUITE_TIMEOUT_MS).

// One time zone for every run (local and CI, which is UTC): set here, before Jest starts its
// workers, which inherit it. Assigning process.env.TZ inside a test is not reliable. Europe/Vienna
// has DST, so the clock-change week tests check the real 167 / 169 h everywhere.
process.env.TZ = 'Europe/Vienna';

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^yaml$': '<rootDir>/node_modules/yaml/dist/index.js',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Per-checkout transform cache: the default %TEMP%\jest is shared by every worktree, and two
  // runs writing it at once fail with EPERM on rename (Windows).
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  // Locally, leave half the cores free: several agents (or an emulator) often run alongside, and
  // the component suites time out under that contention. CI keeps Jest's default (cores - 1).
  ...(process.env.CI ? {} : { maxWorkers: '50%' }),
};
