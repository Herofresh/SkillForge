import { DarkTheme, type Theme } from 'expo-router';

/** Dark "RPG" palette. The single source of UI colors; import it, don't copy hex values. */
export const Colors = {
  background: '#12101A',
  surface: '#1E1A2B',
  border: '#2E2842',
  text: '#EDE6D6',
  textMuted: '#9A90AE',
  gold: '#E3B341',
  arcane: '#8B6CF0',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Navigation theme derived from {@link Colors}. */
export const NavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.gold,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.arcane,
  },
};
