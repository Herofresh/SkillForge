import { Redirect, Stack } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { stackHeaderOptions } from '@/components/stackHeader';
import {
  AttributeColors,
  Colors,
  Frames,
  Spacing,
  TypeScale,
  type FrameVariant,
  type TextVariant,
} from '@/components/theme';
import {
  EmptyState,
  ICON_NAMES,
  LevelBadge,
  LevelUpBurst,
  PixelButton,
  PixelFrame,
  PixelIcon,
  PixelModal,
  PixelText,
  Screen,
  StatBar,
  TierChip,
  WarningBanner,
  XPBar,
} from '@/components/ui';
import { ATTRIBUTES, TIERS } from '@/domain/types';

/** Sample values for the demo bars only. */
const SAMPLE_ATTRIBUTES = [42, 35, 28, 18, 12, 6];
const SAMPLE_MAX = 42;
const noop = () => undefined;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <PixelText variant="label" tone="rune" accessibilityRole="header">
        {title}
      </PixelText>
      {children}
    </View>
  );
}

/**
 * Dev-only catalogue of the design system (PLAN 4.0, docs/DESIGN.md): every token, component and
 * icon. Reachable from Settings in development builds; release builds redirect away.
 */
export default function StyleGuideScreen() {
  const [ackWarning, setAckWarning] = useState(false);
  const [ackInfo, setAckInfo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  if (!__DEV__) return <Redirect href="/tree" />;

  return (
    <>
      <Stack.Screen options={stackHeaderOptions('Style Guide')} />
      <Screen testID="styleguide">
        <PixelText variant="display">Style Guide</PixelText>

        <Section title="Typography">
          {(Object.keys(TypeScale) as TextVariant[]).map((variant) => (
            <PixelText key={variant} variant={variant}>
              {variant} · The hero trains
            </PixelText>
          ))}
        </Section>

        <Section title="Palette">
          <View style={styles.wrap}>
            {Object.entries(Colors).map(([name, hex]) => (
              <View key={name} style={styles.swatch}>
                <View style={[styles.chip, { backgroundColor: hex }]} />
                <PixelText variant="small" tone="textMuted">
                  {name}
                </PixelText>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Frames">
          {(Object.keys(Frames) as FrameVariant[]).map((variant) => (
            <PixelFrame key={variant} variant={variant}>
              <PixelText tone={variant === 'parchment' ? 'textOnParchment' : 'text'}>
                {variant} frame
              </PixelText>
            </PixelFrame>
          ))}
        </Section>

        <Section title="Buttons">
          <PixelButton label="Start Trial" icon="sword" onPress={noop} />
          <PixelButton label="Swap exercise" variant="secondary" onPress={noop} />
          <PixelButton label="Delete profile" variant="danger" onPress={noop} />
          <PixelButton label="Locked" icon="lock" disabled onPress={noop} />
        </Section>

        <Section title="Bars">
          <XPBar fraction={0.62} valueText="124 / 200 XP" />
          <XPBar fraction={1} label="Mastered" valueText="MAX" color={Colors.rune} />
          {ATTRIBUTES.map((attribute, index) => (
            <StatBar
              key={attribute}
              label={attribute}
              value={SAMPLE_ATTRIBUTES[index]}
              max={SAMPLE_MAX}
              color={AttributeColors[attribute]}
            />
          ))}
        </Section>

        <Section title="Badges and tiers">
          <View style={styles.row}>
            <LevelBadge level={7} />
            <LevelBadge level={42} size="lg" />
          </View>
          <View style={styles.wrap}>
            {TIERS.map((tier) => (
              <TierChip key={tier} tier={tier} />
            ))}
          </View>
        </Section>

        <Section title="Icons">
          <View style={styles.wrap}>
            {ICON_NAMES.map((name) => (
              <View key={name} style={styles.icon}>
                <PixelIcon name={name} size={48} label={name} />
                <PixelText variant="label" tone="textMuted">
                  {name}
                </PixelText>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Warnings">
          <WarningBanner
            testID="demo-warning"
            severity="warning"
            message="Straight-arm work 36 h after the last session. Tendons recover slower than muscles; 48 h is recommended."
            acknowledged={ackWarning}
            onAcknowledge={() => setAckWarning(true)}
          />
          <WarningBanner
            severity="info"
            message="Tuck front lever is locked: its prerequisites aren't met yet. You can still try it."
            acknowledged={ackInfo}
            onAcknowledge={() => setAckInfo(true)}
          />
        </Section>

        <Section title="Modal">
          <PixelButton
            label="Open modal"
            variant="secondary"
            onPress={() => setModalOpen(true)}
            testID="open-modal"
          />
          <PixelModal
            visible={modalOpen}
            title="Choose a profile"
            onClose={() => setModalOpen(false)}>
            <PixelText>Sheets hold short choices and confirmations.</PixelText>
          </PixelModal>
        </Section>

        <Section title="Empty state">
          <EmptyState
            icon="scroll"
            title="No sessions yet"
            message="Your training log fills up as you train."
            action={{ label: 'Train now', onPress: noop }}
          />
        </Section>

        <Section title="Level up">
          <PixelFrame variant="rune">
            <LevelUpBurst key={burstKey} playKey={burstKey} subtitle="Tuck planche · LV 5" />
          </PixelFrame>
          <PixelButton
            label="Replay burst"
            icon="star"
            variant="secondary"
            onPress={() => setBurstKey((key) => key + 1)}
          />
        </Section>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  swatch: {
    width: 96,
    gap: Spacing.xs,
  },
  chip: {
    height: 32,
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  icon: {
    width: 72,
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
