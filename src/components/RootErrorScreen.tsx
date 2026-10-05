import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from './theme';
import { EmptyState } from './ui';

type Props = {
  /** Renders the app again (expo-router's `retry`). */
  onRetry: () => void;
};

/**
 * What the root error boundary shows (PLAN 7.0a) when a screen throws while rendering: a short
 * note and "Try again" instead of a blank or crashed app. It sits outside `DataGate`, so it reads
 * nothing from the store.
 */
export function RootErrorScreen({ onRetry }: Props) {
  return (
    <View style={styles.container} testID="root-error">
      <EmptyState
        icon="potion"
        title="Something went wrong"
        message="This screen hit an error. Your data is safe on this device."
        action={{ label: 'Try again', onPress: onRetry, testID: 'root-error-retry' }}
      />
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
