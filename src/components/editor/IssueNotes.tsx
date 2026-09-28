import { StyleSheet, View } from 'react-native';

import { Spacing } from '../theme';
import { PixelFrame, PixelIcon, PixelText } from '../ui';

type Props = {
  /** Plain-language problems (already worded by the domain). Nothing renders when empty. */
  messages: readonly string[];
  title?: string;
  testID?: string;
};

/**
 * Validator issues shown inline (PLAN 4.7): a danger frame with an alert, one line per problem.
 * These are content errors, not safeguards: a tree with them is never saved.
 */
export function IssueNotes({ messages, title = 'Fix this to save', testID }: Props) {
  if (messages.length === 0) return null;
  return (
    <PixelFrame variant="danger" shadow={false} contentStyle={styles.content} testID={testID}>
      <View style={styles.row} accessibilityLiveRegion="polite">
        <PixelIcon name="alert" />
        <PixelText variant="label" tone="danger" style={styles.flex}>
          {title}
        </PixelText>
      </View>
      {messages.map((message, index) => (
        <PixelText key={`${index}-${message}`} variant="small">
          {`• ${message}`}
        </PixelText>
      ))}
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
