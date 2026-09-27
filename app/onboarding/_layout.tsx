import { Redirect, Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

import { useAppStore } from '@/store/useAppStore';

/**
 * The first-run flow (PLAN 4.1): hero → equipment → goals → assessment (+ Trial) → summary. Every
 * step writes through store actions right away, so Back shows what was saved. Once onboarding is
 * completed this layout hands over to the tabs.
 */
export default function OnboardingLayout() {
  const completed = useAppStore((state) => state.onboardingCompletedAt !== undefined);
  const reduceMotion = useReducedMotion();
  if (completed) return <Redirect href="/tree" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'slide_from_right',
      }}
    />
  );
}
