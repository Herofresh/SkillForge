import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Spacing } from '@/components/theme';
import { PixelFrame, PixelText, PixelTextInput } from '@/components/ui';
import { HERO_NAME_MAX_LENGTH, normalizeHeroName } from '@/domain/onboarding';
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
      title="Welcome to SkillForge"
      subtitle="Every rep forges your hero. Unlock skills, level up, become a legend."
      next={{ label: 'Next', onPress: next, disabled: !valid }}
      testID="onboarding-hero">
      <PixelFrame variant="parchment" contentStyle={styles.scroll}>
        <PixelText variant="heading" tone="textOnParchment" accessibilityRole="header">
          The quest
        </PixelText>
        <PixelText tone="textOnParchment">
          Your training is a skill tree of bodyweight progressions. Train to earn XP, pass Trials to
          unlock harder skills, and let the forge suggest each workout. You decide what to follow.
        </PixelText>
      </PixelFrame>
      <PixelTextInput
        label="Name your hero"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Aria Stormhand"
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
