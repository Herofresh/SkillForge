import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { startApp } from '@/store/bootstrap';

import { Colors, Spacing } from './theme';
import { EmptyState, PixelText } from './ui';

type Status = { kind: 'loading' } | { kind: 'ready' } | { kind: 'error'; message: string };

// Keep the native splash up until the fonts and the database are ready (PLAN 4.0). Called at module
// load so it runs before the first frame; a rejection (e.g. already hidden in a fast refresh) is
// harmless.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

type Props = {
  /** True once the fonts are loaded or failed to load (system fonts are used then). */
  fontsReady: boolean;
  children: ReactNode;
};

/**
 * Renders its children once the fonts are ready and the database is migrated and loaded. Until
 * then the splash screen stays up; a failure hides it and shows the error, leaving the data
 * untouched.
 */
export function DataGate({ fontsReady, children }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    startApp().then(
      () => setStatus({ kind: 'ready' }),
      (error: unknown) =>
        setStatus({
          kind: 'error',
          message: error instanceof Error ? error.message : String(error),
        }),
    );
  }, []);

  const settled = fontsReady && status.kind !== 'loading';
  useEffect(() => {
    if (settled) SplashScreen.hideAsync().catch(() => undefined);
  }, [settled]);

  if (!settled) return <View style={styles.container} />;
  if (status.kind === 'ready') return children;
  return (
    <View style={styles.container}>
      <EmptyState
        icon="potion"
        title="Could not open your data"
        message={status.kind === 'error' ? status.message : ''}>
        <PixelText variant="small" tone="textMuted" align="center">
          Nothing was deleted. Restart the app to try again.
        </PixelText>
      </EmptyState>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
});
