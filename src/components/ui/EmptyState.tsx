import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '../theme';

import { PixelButton } from './PixelButton';
import { PixelFrame } from './PixelFrame';
import { PixelIcon } from './PixelIcon';
import { PixelText } from './PixelText';
import type { ButtonVariant } from '../theme';

import type { IconName } from './icons';

type Props = {
  icon: IconName;
  title: string;
  message: string;
  /** A short caps note under the message, e.g. "Coming soon". */
  note?: string;
  action?: {
    label: string;
    onPress: () => void;
    icon?: IconName;
    variant?: ButtonVariant;
    testID?: string;
  };
  children?: ReactNode;
  testID?: string;
};

/** A centred panel for "nothing here yet": big icon, title, message, optional action. */
export function EmptyState({ icon, title, message, note, action, children, testID }: Props) {
  return (
    <PixelFrame testID={testID} padding={Spacing.lg} contentStyle={styles.content}>
      <PixelIcon name={icon} size={48} />
      <PixelText variant="title" align="center" accessibilityRole="header">
        {title}
      </PixelText>
      <PixelText align="center">{message}</PixelText>
      {note !== undefined && (
        <PixelText variant="label" tone="rune" align="center">
          {note}
        </PixelText>
      )}
      {action && (
        <View style={styles.action}>
          <PixelButton
            label={action.label}
            onPress={action.onPress}
            icon={action.icon}
            variant={action.variant}
            testID={action.testID}
          />
        </View>
      )}
      {children}
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  action: {
    marginTop: Spacing.sm,
    alignSelf: 'stretch',
  },
});
