import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Colors, Spacing } from '../theme';

import { KeyboardSafeView } from './KeyboardSafeView';

type Props = {
  children: ReactNode;
  /** Vertically centre short content (placeholders, empty states). */
  centered?: boolean;
  /**
   * The screen has a text field: keep it above the soft keyboard (`KeyboardSafeView`). Not for
   * screens with a fixed footer; those wrap screen and footer themselves (`OnboardingScaffold`).
   */
  avoidKeyboard?: boolean;
  testID?: string;
};

/** The night-sky screen body: scrolls, pads by `Spacing.md` and stacks its children. */
export function Screen({ children, centered = false, avoidKeyboard = false, testID }: Props) {
  const body = (
    <ScrollView
      testID={testID}
      style={styles.scroll}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, centered && styles.centered]}>
      {children}
    </ScrollView>
  );
  return avoidKeyboard ? <KeyboardSafeView>{body}</KeyboardSafeView> : body;
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
