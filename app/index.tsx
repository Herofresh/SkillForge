import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/useAppStore';

/** The app opens on the skill tree, or on the first-run flow until onboarding is done (PLAN 4.1). */
export default function Index() {
  const onboarded = useAppStore((state) => state.onboardingCompletedAt !== undefined);
  return <Redirect href={onboarded ? '/tree' : '/onboarding'} />;
}
