import Constants from 'expo-constants';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import {
  CONTENT_SOURCES,
  FONT_CREDITS,
  NOT_AFFILIATED_NOTE,
  OFL_CREDIT,
  PRIVACY_POLICY,
  type Credit,
} from '@/data/credits';
import { t } from '@/i18n';

import { HealthNotice } from '../HealthNotice';
import { DetailSection } from '../node/DetailSection';
import { Spacing, TOUCH_TARGET } from '../theme';
import { PixelText } from '../ui';

function CreditLink({ credit, testID }: { credit: Credit; testID?: string }) {
  return (
    <Pressable
      onPress={() => void Linking.openURL(credit.url).catch(() => undefined)}
      accessibilityRole="link"
      accessibilityLabel={`${t(credit.name)}: ${t(credit.note)}`}
      accessibilityHint={t('Opens the website')}
      style={styles.link}
      testID={testID}>
      <PixelText tone="rune">{t(credit.name)}</PixelText>
      <PixelText variant="small" tone="textMuted">
        {t(credit.note)}
      </PixelText>
    </Pressable>
  );
}

/** About and credits (PLAN 4.6): version, privacy policy, content sources and the fonts' licences. */
export function AboutPanel() {
  const version = Constants.expoConfig?.version ?? 'dev';
  return (
    <DetailSection title={t('About')} icon="rune" testID="settings-about">
      <PixelText>
        {t('SkillForge {version}. A calisthenics skill tree: the app suggests, you decide.', {
          version,
        })}
      </PixelText>
      <HealthNotice testID="about-health-notice" />
      <CreditLink credit={PRIVACY_POLICY} testID="about-privacy-policy" />
      <PixelText variant="small" tone="textMuted">
        {t(
          'The progressions are community-sourced from the sources below and not yet reviewed by a coach.',
        )}
      </PixelText>
      <PixelText variant="label" tone="gold" accessibilityRole="header">
        {t('Sources')}
      </PixelText>
      <View style={styles.list}>
        {CONTENT_SOURCES.map((credit) => (
          <CreditLink key={credit.name} credit={credit} />
        ))}
      </View>
      <PixelText variant="small" tone="textMuted" testID="about-not-affiliated">
        {t(NOT_AFFILIATED_NOTE)}
      </PixelText>
      <PixelText variant="label" tone="gold" accessibilityRole="header">
        {t('Fonts')}
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
