import { useRouter } from 'expo-router';

import { EquipmentProfileEditor } from '@/components/equipment/EquipmentProfileEditor';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';

/** Step 2: review the Home and Park equipment sets, edit them, add your own. */
export default function EquipmentStep() {
  const router = useRouter();
  return (
    <OnboardingScaffold
      step="equipment"
      icon="bar"
      title="Your armory"
      subtitle="Where do you train? Workouts only use the equipment of the place you pick."
      onBack={() => router.back()}
      next={{ label: 'Next', onPress: () => router.push('/onboarding/goals') }}
      testID="onboarding-equipment">
      <EquipmentProfileEditor />
    </OnboardingScaffold>
  );
}
