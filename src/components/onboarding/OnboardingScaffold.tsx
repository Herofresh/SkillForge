import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ONBOARDING_STEPS, onboardingStepNumber, type OnboardingStep } from '@/domain/onboarding';
import { useAppStore } from '@/store/useAppStore';

import { Border, Colors, Spacing } from '../theme';
import {
  KeyboardSafeView,
  PixelButton,
  PixelIcon,
  PixelText,
  Screen,
  SegmentedBar,
  type IconName,
  useKeyboardShown,
} from '../ui';

type Action = { label: string; onPress: () => void; disabled?: boolean };

type Props = {
  step: OnboardingStep;
  icon: IconName;
  title: string;
  subtitle: string;
  children?: ReactNode;
  /** The main button (gold). */
  next: Action;
  /** Secondary buttons; omit where a step has none (the first step has no Back). */
  onBack?: () => void;
  skip?: Action;
  testID?: string;
};

/**
 * The frame of every onboarding step: a "STEP n / 5" quest bar, the step's title, its scrolling
 * content and a footer with Back / Skip / Next. Content and footer sit in a `KeyboardSafeView`, so
 * the footer rides on top of the soft keyboard and a focused field stays visible (FB-1).
 * During a replay of a completed onboarding (PLAN 7.0a) it also offers "Back to the app".
 */
export function OnboardingScaffold({
  step,
  icon,
  title,
  subtitle,
  children,
  next,
  onBack,
  skip,
  testID,
}: Props) {
  const insets = useSafeAreaInsets();
  const keyboardShown = useKeyboardShown();
  const replaying = useAppStore((state) => state.onboardingReplay);
  const leaveReplay = useAppStore((state) => state.leaveOnboardingReplay);
  const number = onboardingStepNumber(step);
  const total = ONBOARDING_STEPS.length;
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View
        style={styles.progress}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Setup"
        accessibilityValue={{
          min: 1,
          max: total,
          now: number,
          text: `Step ${number} of ${total}`,
        }}>
        <PixelText variant="label" tone="rune">
          Step {number} / {total}
        </PixelText>
        <View style={styles.bar}>
          <SegmentedBar fraction={number / total} segments={total} color={Colors.rune} height={8} />
        </View>
      </View>
      <KeyboardSafeView>
        <Screen testID={testID}>
          {replaying && (
            <PixelButton
              label="Back to the app"
              variant="secondary"
              onPress={leaveReplay}
              accessibilityHint="Leaves the intro. What you already saved on its steps stays."
              testID="onboarding-leave"
            />
          )}
          <View style={styles.header}>
            <PixelIcon name={icon} size={48} />
            <View style={styles.headerText}>
              <PixelText variant="title" accessibilityRole="header">
                {title}
              </PixelText>
              <PixelText tone="textMuted">{subtitle}</PixelText>
            </View>
          </View>
          {children}
        </Screen>
        <View
          style={[
            styles.footer,
            { paddingBottom: (keyboardShown ? 0 : insets.bottom) + Spacing.md },
          ]}>
          {onBack && (
            <PixelButton
              label="Back"
              variant="secondary"
              onPress={onBack}
              testID="onboarding-back"
              style={styles.side}
            />
          )}
          {skip && (
            <PixelButton
              label={skip.label}
              variant="secondary"
              onPress={skip.onPress}
              disabled={skip.disabled}
              testID="onboarding-skip"
              style={styles.side}
            />
          )}
          <PixelButton
            label={next.label}
            onPress={next.onPress}
            disabled={next.disabled}
            testID="onboarding-next"
            style={styles.main}
          />
        </View>
      </KeyboardSafeView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  bar: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: Border.line,
    borderTopColor: Colors.goldDark,
  },
  side: {
    flex: 1,
  },
  main: {
    // Wider than Back/Skip, but leaves them room for a one-word label on a phone.
    flex: 1.4,
  },
});
