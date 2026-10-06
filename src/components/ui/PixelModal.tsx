import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '../theme';

import { KeyboardSafeView } from './KeyboardSafeView';
import { PixelButton } from './PixelButton';
import { PixelFrame } from './PixelFrame';
import { PixelText } from './PixelText';
import { useKeyboardShown } from './useKeyboardShown';

/**
 * The sheet's content scrolls once it would be taller than this share of the window (PLAN 7.0a):
 * at a large font scale the title and the close button stay reachable.
 */
export const SHEET_MAX_HEIGHT_SHARE = 0.8;

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  closeLabel?: string;
  children?: ReactNode;
  testID?: string;
};

/**
 * A bottom sheet in a raised pixel frame over a dimmed backdrop. Tapping the backdrop, the close
 * button (`<testID>-close`) or Android back closes it. Slides in unless the user asked for reduced motion.
 * Tall content scrolls (`SHEET_MAX_HEIGHT_SHARE`); a list inside that scrolls by itself needs
 * `nestedScrollEnabled` on Android. The sheet rides on top of the soft keyboard
 * (`KeyboardSafeView`, ADR-069), so a field in it stays visible.
 */
export function PixelModal({
  visible,
  title,
  onClose,
  closeLabel = 'Close',
  children,
  testID,
}: Props) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const keyboardShown = useKeyboardShown();
  const { height } = useWindowDimensions();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent>
      <KeyboardSafeView>
        <View style={[styles.root, { paddingTop: insets.top + Spacing.md }]} testID={testID}>
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
          />
          <View
            style={[
              styles.sheet,
              { paddingBottom: (keyboardShown ? 0 : insets.bottom) + Spacing.md },
            ]}>
            <PixelFrame
              variant="raised"
              padding={Spacing.lg}
              style={styles.shrink}
              contentStyle={styles.shrink}>
              <ScrollView
                style={[styles.shrink, { maxHeight: height * SHEET_MAX_HEIGHT_SHARE }]}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                testID={testID && `${testID}-scroll`}>
                <PixelText variant="title" accessibilityRole="header">
                  {title}
                </PixelText>
                {children}
                <PixelButton
                  label={closeLabel}
                  variant="secondary"
                  onPress={onClose}
                  testID={testID && `${testID}-close`}
                />
              </ScrollView>
            </PixelFrame>
          </View>
        </View>
      </KeyboardSafeView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.ink,
    opacity: 0.75,
  },
  sheet: {
    flexShrink: 1,
    paddingHorizontal: Spacing.md,
  },
  // With the keyboard open there may be less room than the max height: the sheet then shrinks to
  // the space below the status bar and its content scrolls.
  shrink: {
    flexShrink: 1,
  },
  content: {
    gap: Spacing.md,
  },
});
