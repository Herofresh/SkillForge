import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Spacing } from '@/components/theme';
import { LevelBadge, LevelUpBurst, PixelFrame, PixelIcon, PixelText, XPBar } from '@/components/ui';
import { characterLevelProgress } from '@/domain/character';
import { onboardingSummary } from '@/domain/onboarding';
import { useAppStore } from '@/store/useAppStore';

/** Step 5: "Your journey begins": the hero, goals and tested-out skills, then into the tabs. */
export default function SummaryStep() {
  const router = useRouter();
  const heroName = useAppStore((state) => state.profile?.heroName) ?? 'Hero';
  const nodes = useAppStore((state) => state.nodes);
  const engine = useAppStore((state) => state.engine);
  const goalIds = useAppStore((state) => state.goals);
  const profiles = useAppStore((state) => state.equipmentProfiles);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const summary = useMemo(
    () => onboardingSummary(nodes, engine.progress, engine.totalXp, goalIds),
    [nodes, engine, goalIds],
  );
  const level = characterLevelProgress(engine.totalXp);

  return (
    <OnboardingScaffold
      step="summary"
      icon="flame"
      title="Your journey begins"
      subtitle="The forge is lit. Your first workout waits on the Train tab."
      onBack={() => router.back()}
      // The layout sees the completed flag and hands over to the tabs.
      next={{ label: 'Begin', onPress: completeOnboarding }}
      testID="onboarding-summary">
      <PixelFrame variant="rune" contentStyle={styles.hero}>
        <LevelUpBurst title={heroName} subtitle={summary.character.rank.toUpperCase()} />
        <View style={styles.levelRow}>
          <LevelBadge level={level.level} size="lg" />
          <View style={styles.flex}>
            <XPBar
              label="Hero XP"
              fraction={level.fraction}
              valueText={`${level.xpIntoLevel} / ${level.xpForLevel} XP`}
            />
          </View>
        </View>
      </PixelFrame>
      <Section icon="star" title="Quests" empty="No goals yet. Pick some from the tree any time.">
        {summary.goals.map((node) => node.name)}
      </Section>
      <Section
        icon="check"
        title="Tested out"
        empty="Nothing tested out. Every skill starts fresh.">
        {summary.testedOut.map((node) => node.name)}
      </Section>
      <Section icon="bar" title="Training grounds" empty="No equipment profiles.">
        {profiles.map((profile) => profile.name)}
      </Section>
    </OnboardingScaffold>
  );
}

function Section({
  icon,
  title,
  empty,
  children,
}: {
  icon: 'star' | 'check' | 'bar';
  title: string;
  empty: string;
  children: string[];
}) {
  return (
    <PixelFrame variant="parchment" contentStyle={styles.section}>
      <View style={styles.sectionHeader}>
        <PixelIcon name={icon} />
        <PixelText variant="heading" tone="textOnParchment" accessibilityRole="header">
          {title}
        </PixelText>
      </View>
      {children.length === 0 ? (
        <PixelText tone="textOnParchment">{empty}</PixelText>
      ) : (
        children.map((line) => (
          <PixelText key={line} tone="textOnParchment">
            {`• ${line}`}
          </PixelText>
        ))
      )}
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.md,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
