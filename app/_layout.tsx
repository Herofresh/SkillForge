import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { NavigationTheme } from '@/components/theme';

export default function RootLayout() {
  return (
    <ThemeProvider value={NavigationTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
