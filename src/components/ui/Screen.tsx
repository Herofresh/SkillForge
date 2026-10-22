import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  /**
   * Keep the end of the content clear of Android's navigation bar (gesture handle or 3-button bar;
   * the app draws edge to edge, FB-3). Off where something below already clears it: the tab bar,
   * a fixed footer (`OnboardingScaffold`).
   */
  insetBottom?: boolean;
  testID?: string;
};

/**
 * The night-sky screen body: scrolls, pads by `Spacing.md` (plus the navigation bar at the bottom,
 * `insetBottom`) and stacks its children.
 */
export function Screen({
  children,
  centered = false,
  avoidKeyboard = false,
  insetBottom = true,
  testID,
}: Props) {
  const insets = useSafeAreaInsets();
  const body = (
    <ScrollView
      testID={testID}
      style={styles.scroll}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        insetBottom && { paddingBottom: Spacing.md + insets.bottom },
        centered && styles.centered,
      ]}>
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
