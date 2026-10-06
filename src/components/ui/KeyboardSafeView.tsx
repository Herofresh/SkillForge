import { useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';

type Props = {
  children: ReactNode;
  testID?: string;
};

/**
 * Keeps its children above the soft keyboard (PLAN 7.8, FB-1, ADR-069). Wrap a whole screen body
 * that holds a text field in it, with any fixed footer inside, so the footer rides on the keyboard.
 *
 * Android 15+ draws edge-to-edge, so the window is no longer resized for the keyboard
 * (`adjustResize` has no effect) and nothing moves by itself. React Native's
 * `KeyboardAvoidingView` with `behavior="padding"` pads the bottom by the keyboard's overlap.
 * It compares its own layout frame, which is relative to its parent, with the keyboard's screen
 * position; so this wrapper measures where it starts on the screen (below the status bar and a
 * header; a tab bar below it is simply covered by the keyboard) and passes that as
 * `keyboardVerticalOffset`. With the keyboard closed the padding is 0, so
 * there is no gap and no double safe-area inset.
 */
export function KeyboardSafeView({ children, testID }: Props) {
  const outer = useRef<View>(null);
  const [top, setTop] = useState(0);
  const measure = () => {
    // `pageY`, not `measureInWindow`: on Android the latter leaves out the status bar, while the
    // keyboard's `screenY` counts from the top of the screen (edge-to-edge: the root view's top).
    outer.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
      if (Number.isFinite(pageY)) setTop(pageY);
    });
  };
  return (
    <View ref={outer} style={styles.fill} onLayout={measure} collapsable={false}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={top}
        style={styles.fill}
        testID={testID}>
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
