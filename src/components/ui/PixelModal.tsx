import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '../theme';

import { PixelButton } from './PixelButton';
import { PixelFrame } from './PixelFrame';
import { PixelText } from './PixelText';

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
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root} testID={testID}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}>
          <PixelFrame variant="raised" padding={Spacing.lg} contentStyle={styles.content}>
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
          </PixelFrame>
        </View>
      </View>
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
    paddingHorizontal: Spacing.md,
  },
  content: {
    gap: Spacing.md,
  },
});
