import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Colors, Spacing } from '../theme';

type Props = {
  children: ReactNode;
  /** Vertically centre short content (placeholders, empty states). */
  centered?: boolean;
  testID?: string;
};

/** The night-sky screen body: scrolls, pads by `Spacing.md` and stacks its children. */
export function Screen({ children, centered = false, testID }: Props) {
  return (
    <ScrollView
      testID={testID}
      style={styles.scroll}
      contentContainerStyle={[styles.content, centered && styles.centered]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    gap: Spacing.lg,
    padding: Spacing.md,
  },
  centered: {
    justifyContent: 'center',
  },
});
