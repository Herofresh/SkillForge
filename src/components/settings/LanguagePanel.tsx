import { StyleSheet, View } from 'react-native';

import { LANGUAGE_CHOICES, t, type LanguageChoice } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';

import { DetailSection } from '../node/DetailSection';
import { Spacing } from '../theme';
import { PixelChip, PixelText } from '../ui';

/** Each choice in its own language, so a user who picked the wrong one still finds the way back. */
const CHOICE_LABELS: Readonly<Record<LanguageChoice, string>> = {
  system: 'System',
  en: 'English',
  de: 'Deutsch',
};

/** "Language" (PLAN 7.8 FB-8, ADR-080): follow the device, English or German; it takes effect at once. */
export function LanguagePanel() {
  const language = useAppStore((state) => state.language);
  const locale = useAppStore((state) => state.locale);
  const setLanguage = useAppStore((state) => state.setLanguage);
  return (
    <DetailSection title={t('Language')} icon="scroll" testID="settings-language">
      <View style={styles.row} accessibilityRole="tablist">
        {LANGUAGE_CHOICES.map((choice) => (
          <PixelChip
            key={choice}
            role="tab"
            label={CHOICE_LABELS[choice]}
            accessibilityLabel={
              choice === 'system' ? t('Follow the device language') : CHOICE_LABELS[choice]
            }
            selected={choice === language}
            onPress={() => setLanguage(choice)}
            testID={`language-${choice}`}
          />
        ))}
      </View>
      <PixelText variant="small" tone="textMuted" testID="language-text">
        {language === 'system'
          ? t(
              'Follows your device language ({language} now). Exercise names, descriptions and cues change with it.',
              {
                language: CHOICE_LABELS[locale],
              },
            )
          : t(
              'The app stays in {language} whatever the device language. Exercise names, descriptions and cues change with it.',
              {
                language: CHOICE_LABELS[language],
              },
            )}
      </PixelText>
    </DetailSection>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
