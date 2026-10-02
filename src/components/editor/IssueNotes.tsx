import { StyleSheet, View } from 'react-native';

import { Spacing } from '../theme';
import { PixelFrame, PixelIcon, PixelText } from '../ui';

type Props = {
  /** Plain-language problems (already worded by the domain). Nothing renders when empty. */
  messages: readonly string[];
  title?: string;
  /** Advice that doesn't stop a save (ADR-052): a gold frame instead of the danger one. */
  advice?: boolean;
  testID?: string;
};

const ADVICE_TITLE = 'Worth a look (you can still save)';

/**
 * Validator issues shown inline (PLAN 4.7): a danger frame with an alert, one line per problem.
 * These are content errors, not safeguards: a tree with them is never saved. With `advice` they
 * are the validator's warnings instead (gold frame), which never stop a save.
 */
export function IssueNotes({ messages, title, advice = false, testID }: Props) {
  if (messages.length === 0) return null;
  return (
    <PixelFrame
      variant={advice ? 'gold' : 'danger'}
      shadow={false}
      contentStyle={styles.content}
      testID={testID}>
      <View style={styles.row} accessibilityLiveRegion="polite">
        <PixelIcon name={advice ? 'scroll' : 'alert'} />
        <PixelText variant="label" tone={advice ? 'gold' : 'danger'} style={styles.flex}>
          {title ?? (advice ? ADVICE_TITLE : 'Fix this to save')}
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
