import { StyleSheet, View } from 'react-native';

import type { SafeguardSeverity } from '@/domain/types';

import { Spacing } from '../theme';

import { PixelButton } from './PixelButton';
import { PixelFrame } from './PixelFrame';
import { PixelIcon } from './PixelIcon';
import { PixelText } from './PixelText';

type Props = {
  /** Plain-language explanation (e.g. `SafeguardWarning.message`). */
  message: string;
  severity: SafeguardSeverity;
  title?: string;
  /** Controlled by the screen/store: whether the user has acknowledged this warning. */
  acknowledged: boolean;
  onAcknowledge: () => void;
  acknowledgeLabel?: string;
  testID?: string;
};

const DEFAULT_TITLES: Readonly<Record<SafeguardSeverity, string>> = {
  warning: 'Take care',
  info: 'Good to know',
};

/**
 * An advisory safeguard (ADR-023): explains the risk and asks for an "I understand". It never
 * blocks anything; the screen decides what acknowledging unlocks (e.g. enabling "Start Trial").
 */
export function WarningBanner({
  message,
  severity,
  title = DEFAULT_TITLES[severity],
  acknowledged,
  onAcknowledge,
  acknowledgeLabel = 'I understand',
  testID,
}: Props) {
  const isWarning = severity === 'warning';
  return (
    <View testID={testID} accessibilityLiveRegion="polite">
      <PixelFrame variant={isWarning ? 'danger' : 'gold'}>
        <View style={styles.header}>
          <PixelIcon name={isWarning ? 'alert' : 'scroll'} />
          <PixelText
            variant="heading"
            tone={isWarning ? 'ember' : 'gold'}
            accessibilityRole="header"
            style={styles.title}>
            {title}
          </PixelText>
        </View>
        <PixelText>{message}</PixelText>
        <View style={styles.footer}>
          {acknowledged ? (
            <View style={styles.acknowledged} testID={testID && `${testID}-acknowledged`}>
              <PixelIcon name="check" />
              <PixelText variant="label" tone="success">
                Acknowledged
              </PixelText>
            </View>
          ) : (
            <PixelButton
              label={acknowledgeLabel}
              variant="secondary"
              onPress={onAcknowledge}
              testID={testID && `${testID}-acknowledge`}
            />
          )}
        </View>
      </PixelFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  footer: {
    marginTop: Spacing.md,
    alignItems: 'flex-start',
  },
  acknowledged: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 48,
  },
});
