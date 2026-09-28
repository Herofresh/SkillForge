import { Pressable, StyleSheet, View } from 'react-native';

import {
  describeOverlayEntry as entryDescription,
  type CustomizationKind,
  type OverlayEntry,
} from '@/domain/overlayEdit';

import { Spacing, TOUCH_TARGET } from '../theme';
import { PixelButton, PixelFrame, PixelIcon, PixelText, type IconName } from '../ui';

type Props = {
  entry: OverlayEntry;
  /** Opens the node (not for hidden nodes: they are not in the tree). */
  onOpen?: () => void;
  /** An optional action button (reset, show, delete). */
  actionLabel?: string;
  onAction?: () => void;
  /** Marks an import entry that replaces one of the user's own changes. */
  replacesYours?: boolean;
};

const KIND_ICONS: Readonly<Record<CustomizationKind, IconName>> = {
  added: 'rune',
  edited: 'quill',
  hidden: 'cross',
};

/** One changed node in "My progressions" or an import preview, with an action (reset, show, …). */
export function OverlayEntryRow({ entry, onOpen, actionLabel, onAction, replacesYours }: Props) {
  const text = (
    <View style={styles.text}>
      <PixelText variant="heading">{entry.name}</PixelText>
      <PixelText variant="small" tone="textMuted">
        {entryDescription(entry)}
      </PixelText>
      {replacesYours && (
        <PixelText variant="label" tone="ember">
          Replaces yours
        </PixelText>
      )}
    </View>
  );
  return (
    <PixelFrame
      variant="raised"
      shadow={false}
      contentStyle={styles.content}
      testID={`entry-${entry.nodeId}`}>
      {onOpen ? (
        <Pressable
          onPress={onOpen}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={`${entry.name}, ${entryDescription(entry)}`}
          accessibilityHint="Opens the skill">
          <PixelIcon name={KIND_ICONS[entry.kind]} />
          {text}
        </Pressable>
      ) : (
        <View style={styles.row}>
          <PixelIcon name={KIND_ICONS[entry.kind]} />
          {text}
        </View>
      )}
      {actionLabel !== undefined && onAction && (
        <PixelButton
          label={actionLabel}
          variant="secondary"
          onPress={onAction}
          accessibilityLabel={`${actionLabel} ${entry.name}`}
          testID={`entry-action-${entry.nodeId}`}
        />
      )}
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
  },
});
