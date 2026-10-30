import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { HealthNotice } from '@/components/HealthNotice';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Spacing } from '@/components/theme';
import { PixelFrame, PixelText, PixelTextInput } from '@/components/ui';
import { HERO_NAME_MAX_LENGTH, normalizeHeroName } from '@/domain/onboarding';
import { t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';

/** Step 1: welcome and "Name your hero". */
export default function HeroStep() {
  const router = useRouter();
  const storedName = useAppStore((state) => state.profile?.heroName);
  const setHeroName = useAppStore((state) => state.setHeroName);
  const [name, setName] = useState(storedName ?? '');
  const valid = normalizeHeroName(name) !== undefined;

  const next = () => {
    if (!valid) return;
    setHeroName(name);
    router.push('/onboarding/equipment');
  };

  return (
    <OnboardingScaffold
      step="hero"
      icon="helmet"
      title={t('Welcome to SkillForge')}
      subtitle={t('Every rep forges your hero. Unlock skills, level up, become a legend.')}
      next={{ label: t('Next'), onPress: next, disabled: !valid }}
      testID="onboarding-hero">
      <PixelFrame variant="parchment" contentStyle={styles.scroll}>
        <PixelText variant="heading" tone="textOnParchment" accessibilityRole="header">
          {t('The quest')}
        </PixelText>
        <PixelText tone="textOnParchment">
          {t(
            'Your training is a skill tree of bodyweight progressions. Train to earn XP, pass Trials to unlock harder skills, and let the forge suggest each workout. You decide what to follow.',
          )}
        </PixelText>
      </PixelFrame>
      <HealthNotice />
      <PixelTextInput
        label={t('Name your hero')}
        value={name}
        onChangeText={setName}
        placeholder={t('e.g. Aria Stormhand')}
        maxLength={HERO_NAME_MAX_LENGTH}
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={next}
        testID="hero-name-input"
      />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: Spacing.sm,
  },
});
