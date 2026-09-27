import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Spacing } from '@/components/theme';
import {
  PixelButton,
  PixelChip,
  PixelFrame,
  PixelIcon,
  PixelText,
  PixelTextInput,
} from '@/components/ui';
import { EQUIPMENT_TAG_LABELS, toggleEquipmentTag } from '@/domain/equipment';
import { EQUIPMENT_TAGS, type EquipmentTag } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

/** Tags a new profile starts with: every place has a floor. */
const NEW_PROFILE_TAGS: readonly EquipmentTag[] = ['floor'];

/** Step 2: review the Home and Park equipment sets, edit them, add your own. */
export default function EquipmentStep() {
  const router = useRouter();
  const profiles = useAppStore((state) => state.equipmentProfiles);
  const updateProfile = useAppStore((state) => state.updateEquipmentProfile);
  const createProfile = useAppStore((state) => state.createEquipmentProfile);
  const deleteProfile = useAppStore((state) => state.deleteEquipmentProfile);
  const [newName, setNewName] = useState('');
  const canAdd = newName.trim().length > 0;

  const add = () => {
    if (!canAdd) return;
    createProfile(newName, NEW_PROFILE_TAGS);
    setNewName('');
  };

  return (
    <OnboardingScaffold
      step="equipment"
      icon="bar"
      title="Your armory"
      subtitle="Where do you train? Workouts only use the equipment of the place you pick."
      onBack={() => router.back()}
      next={{ label: 'Next', onPress: () => router.push('/onboarding/goals') }}
      testID="onboarding-equipment">
      {profiles.map((profile) => (
        <PixelFrame key={profile.id} testID={`profile-${profile.id}`} contentStyle={styles.card}>
          <View style={styles.cardHeader}>
            <PixelIcon name="shield" />
            <PixelText variant="heading" accessibilityRole="header" style={styles.flex}>
              {profile.name}
            </PixelText>
          </View>
          <View style={styles.tags}>
            {EQUIPMENT_TAGS.map((tag) => (
              <PixelChip
                key={tag}
                label={EQUIPMENT_TAG_LABELS[tag]}
                selected={profile.tags.includes(tag)}
                accessibilityLabel={`${profile.name}: ${EQUIPMENT_TAG_LABELS[tag]}`}
                onPress={() =>
                  updateProfile(profile.id, { tags: toggleEquipmentTag(profile.tags, tag) })
                }
                testID={`tag-${profile.id}-${tag}`}
              />
            ))}
          </View>
          {profiles.length > 1 && (
            <PixelButton
              label={`Remove ${profile.name}`}
              variant="danger"
              onPress={() => deleteProfile(profile.id)}
              testID={`remove-${profile.id}`}
            />
          )}
        </PixelFrame>
      ))}
      <PixelFrame variant="raised" contentStyle={styles.card}>
        <PixelTextInput
          label="Add a place"
          value={newName}
          onChangeText={setNewName}
          placeholder="e.g. Gym, Office"
          returnKeyType="done"
          onSubmitEditing={add}
          testID="new-profile-input"
        />
        <PixelButton
          label="Add profile"
          icon="scroll"
          variant="secondary"
          onPress={add}
          disabled={!canAdd}
          testID="add-profile"
        />
      </PixelFrame>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
