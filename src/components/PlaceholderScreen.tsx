import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/components/theme';

type Props = {
  title: string;
  subtitle: string;
  /** Optional content below the card (e.g. a small proof that stored data loads). */
  children?: ReactNode;
};

/** Temporary themed screen body used by tabs until their real UI lands (Phase 4). */
export function PlaceholderScreen({ title, subtitle, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.hint}>Coming soon</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    color: Colors.gold,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  hint: {
    color: Colors.arcane,
    fontSize: 12,
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
