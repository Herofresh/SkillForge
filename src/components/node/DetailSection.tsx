import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing, type FrameVariant } from '../theme';
import { PixelFrame, PixelIcon, PixelText, type IconName } from '../ui';

type Props = {
  title: string;
  icon: IconName;
  variant?: FrameVariant;
  children: ReactNode;
  testID?: string;
};

/** A titled panel of the node detail: a caps heading with an icon over its content. */
export function DetailSection({ title, icon, variant = 'stone', children, testID }: Props) {
  const onParchment = variant === 'parchment';
  return (
    <PixelFrame variant={variant} contentStyle={styles.content} testID={testID}>
      <View style={styles.heading}>
        <PixelIcon name={icon} />
        <PixelText
          variant="label"
          tone={onParchment ? 'textOnParchment' : 'rune'}
          accessibilityRole="header">
          {title}
        </PixelText>
      </View>
      {children}
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
