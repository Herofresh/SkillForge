import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatOgLevel, spokenOgLevel } from '@/domain/format';
import { tierForOgLevel } from '@/domain/tier';
import type { ExerciseNode } from '@/domain/types';

import { InfoButton } from './node/InfoButton';
import { Frames, Spacing, TOUCH_TARGET } from './theme';
import { PixelFrame, PixelIcon, PixelText, TierChip, type IconName } from './ui';

type Props = {
  node: ExerciseNode;
  /** Leading icon (default `rune`: a skill node). */
  icon?: IconName;
  /** Gold-lined "picked" look (goal picker). */
  selected?: boolean;
  /** A short caps status on the right, e.g. "GOAL" or "TESTED OUT". */
  status?: string;
  onPress?: () => void;
  /** `checkbox` when pressing picks the node, `button` when it opens something. */
  role?: 'checkbox' | 'button';
  accessibilityHint?: string;
  /**
   * Opens the exercise info sheet (FB-2, ADR-049): an "i" at the end of the row (`<testID>-info`)
   * and a long press on the row, like the Tree tile. Neither presses the row itself.
   */
  onInfo?: () => void;
  children?: ReactNode;
  testID?: string;
};

/**
 * One skill node as a list row: icon, name, tier chip, OG level and a straight-arm tag, with an
 * optional status and an optional "i" for the exercise info sheet. Used by onboarding (goal picker,
 * assessment, Trial), the Trial screen and the editor's / Train's pick sheets.
 */
export function NodeRow({
  node,
  icon = 'rune',
  selected = false,
  status,
  onPress,
  role = 'button',
  accessibilityHint,
  onInfo,
  children,
  testID,
}: Props) {
  const tier = tierForOgLevel(node.ogLevel);
  const label = [
    node.name,
    spokenOgLevel(node.ogLevel),
    node.straightArm ? 'straight-arm' : undefined,
    status,
  ]
    .filter(Boolean)
    .join(', ');
  const body = (pressed: boolean) => (
    <PixelFrame
      frame={selected ? Frames.selected : Frames.stone}
      pressed={pressed}
      padding={Spacing.sm}>
      <View style={styles.row}>
        <PixelIcon name={icon} />
        <View style={styles.text}>
          <PixelText variant="heading" tone={selected ? 'gold' : 'text'}>
            {node.name}
          </PixelText>
          <View style={styles.meta}>
            <TierChip tier={tier} />
            <PixelText variant="label" tone="textMuted">
              {formatOgLevel(node.ogLevel)}
            </PixelText>
            {node.straightArm && (
              <PixelText variant="label" tone="ember">
                Straight-arm
              </PixelText>
            )}
          </View>
        </View>
        {status !== undefined && (
          <PixelText variant="label" tone={selected ? 'gold' : 'rune'} style={styles.status}>
            {status}
          </PixelText>
        )}
        {onInfo && (
          <InfoButton
            name={node.name}
            onPress={onInfo}
            testID={testID === undefined ? undefined : `${testID}-info`}
          />
        )}
      </View>
      {children}
    </PixelFrame>
  );
  if (!onPress) {
    return (
      <View testID={testID} accessible={!onInfo} accessibilityLabel={label}>
        {body(false)}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onInfo}
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={role === 'checkbox' ? { checked: selected } : undefined}>
      {({ pressed }) => body(pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  status: {
    maxWidth: 96,
    textAlign: 'right',
  },
});
