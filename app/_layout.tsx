import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DataGate } from '@/components/DataGate';
import { NavigationTheme } from '@/components/theme';

export default function RootLayout() {
  return (
    <ThemeProvider value={NavigationTheme}>
      <StatusBar style="light" />
      <DataGate>
        <Stack screenOptions={{ headerShown: false }} />
      </DataGate>
    </ThemeProvider>
  );
}
