/**
 * The navigation theme, kept out of `theme.ts` so that module stays free of React Native imports
 * (the tsx build scripts read colors and icons from it, e.g. the widget preview, PLAN 6.6b).
 */
import { DarkTheme, type Theme } from 'expo-router';

import { Colors } from './theme';

/** Navigation theme derived from {@link Colors}. */
export const NavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.gold,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.ink,
    notification: Colors.arcane,
  },
};
