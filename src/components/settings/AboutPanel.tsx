import Constants from 'expo-constants';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { CONTENT_SOURCES, FONT_CREDITS, OFL_CREDIT, type Credit } from '@/data/credits';

import { DetailSection } from '../node/DetailSection';
import { Spacing, TOUCH_TARGET } from '../theme';
import { PixelText } from '../ui';

function CreditLink({ credit }: { credit: Credit }) {
  return (
    <Pressable
      onPress={() => void Linking.openURL(credit.url).catch(() => undefined)}
      accessibilityRole="link"
      accessibilityLabel={`${credit.name}: ${credit.note}`}
      accessibilityHint="Opens the website"
      style={styles.link}>
      <PixelText tone="rune">{credit.name}</PixelText>
      <PixelText variant="small" tone="textMuted">
        {credit.note}
      </PixelText>
    </Pressable>
  );
}

/** About and credits (PLAN 4.6): version, content sources and the fonts' licences. */
export function AboutPanel() {
  const version = Constants.expoConfig?.version ?? 'dev';
  return (
    <DetailSection title="About" icon="rune" testID="settings-about">
      <PixelText>
        {`SkillForge ${version}. A calisthenics skill tree: the app suggests, you decide.`}
      </PixelText>
      <PixelText variant="small" tone="textMuted">
        Exercise content is a draft built from the sources below and not yet reviewed by a coach.
        Train within your limits.
      </PixelText>
      <PixelText variant="label" tone="gold" accessibilityRole="header">
        Sources
      </PixelText>
      <View style={styles.list}>
        {CONTENT_SOURCES.map((credit) => (
          <CreditLink key={credit.name} credit={credit} />
        ))}
      </View>
      <PixelText variant="label" tone="gold" accessibilityRole="header">
        Fonts
      </PixelText>
      <View style={styles.list}>
        {FONT_CREDITS.map((credit) => (
          <CreditLink key={credit.name} credit={credit} />
        ))}
        <CreditLink credit={OFL_CREDIT} />
      </View>
    </DetailSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.xs,
  },
  link: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
  },
});
