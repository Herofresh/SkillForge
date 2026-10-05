import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DataGate } from '@/components/DataGate';
import { FONT_ASSETS } from '@/components/fonts';
import { NavigationTheme } from '@/components/navigationTheme';
import { RootErrorScreen } from '@/components/RootErrorScreen';

/** expo-router renders this instead of the app when a route throws (PLAN 7.0a). */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <>
      <StatusBar style="light" />
      <RootErrorScreen onRetry={() => void retry()} />
    </>
  );
}

export default function RootLayout() {
  // A font error isn't fatal: the app falls back to the system font.
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  return (
    <ThemeProvider value={NavigationTheme}>
      <StatusBar style="light" />
      <DataGate fontsReady={fontsLoaded || fontError !== null}>
        <Stack screenOptions={{ headerShown: false }} />
      </DataGate>
    </ThemeProvider>
  );
}
