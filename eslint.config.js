// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    // .claude/: agent worktrees inside the checkout (each lints itself); android/: generated.
    ignores: [
      'dist/*',
      '.expo/*',
      'node_modules/*',
      'coverage/*',
      'expo-env.d.ts',
      '.claude/**',
      'android/**',
    ],
  },
]);
