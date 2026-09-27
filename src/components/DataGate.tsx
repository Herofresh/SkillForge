import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/components/theme';
import { startApp } from '@/store/bootstrap';

type Status = { kind: 'loading' } | { kind: 'ready' } | { kind: 'error'; message: string };

/**
 * Renders its children once the database is migrated and the store is loaded. While that runs it
 * shows a loading state; a failure shows the error and leaves the data untouched.
 */
export function DataGate({ children }: { children: ReactNode }) {
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

  if (status.kind === 'ready') return children;
  return (
    <View style={styles.container}>
      {status.kind === 'loading' ? (
        <>
          <ActivityIndicator color={Colors.gold} />
          <Text style={styles.text}>Loading your data…</Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>Could not open your data</Text>
          <Text style={styles.text}>{status.message}</Text>
          <Text style={styles.hint}>Nothing was deleted. Restart the app to try again.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    color: Colors.gold,
    fontSize: 22,
    fontWeight: '700',
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
