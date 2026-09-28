import { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import { EQUIPMENT_TAG_LABELS, toggleEquipmentTag } from '@/domain/equipment';
import { EQUIPMENT_TAGS, type EquipmentProfile, type EquipmentTag } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

import { Spacing } from '../theme';
import { PixelButton, PixelChip, PixelFrame, PixelIcon, PixelText, PixelTextInput } from '../ui';

/** Tags a new profile starts with: every place has a floor. */
export const NEW_PROFILE_TAGS: readonly EquipmentTag[] = ['floor'];

type Props = {
  /** What "Remove" does; deletes the profile right away when omitted (onboarding). */
  onRemove?: (profile: EquipmentProfile) => void;
  /** Shows a "Rename" button per profile (Settings). */
  onRename?: (profile: EquipmentProfile) => void;
};

/**
 * The equipment profiles (ADR-005) as cards of tag chips, plus a form to add a place. Every change
 * goes straight to the store. Used by onboarding step 2 and Settings (PLAN 4.1, 4.6). The last
 * profile can't be removed: the Train tab needs one.
 */
export function EquipmentProfileEditor({ onRemove, onRename }: Props) {
  const profiles = useAppStore((state) => state.equipmentProfiles);
  const updateProfile = useAppStore((state) => state.updateEquipmentProfile);
  const createProfile = useAppStore((state) => state.createEquipmentProfile);
  const deleteProfile = useAppStore((state) => state.deleteEquipmentProfile);
  const [newName, setNewName] = useState('');
  const canAdd = newName.trim().length > 0;
  const remove = onRemove ?? ((profile: EquipmentProfile) => deleteProfile(profile.id));

  const add = () => {
    if (!canAdd) return;
    createProfile(newName, NEW_PROFILE_TAGS);
    setNewName('');
    Keyboard.dismiss();
  };

  return (
    <>
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
          {(onRename || profiles.length > 1) && (
            <View style={styles.actions}>
              {onRename && (
                <PixelButton
                  label="Rename"
                  variant="secondary"
                  accessibilityLabel={`Rename ${profile.name}`}
                  onPress={() => onRename(profile)}
                  testID={`rename-${profile.id}`}
                  style={styles.flex}
                />
              )}
              {profiles.length > 1 && (
                <PixelButton
                  label={onRename ? 'Remove' : `Remove ${profile.name}`}
                  variant="danger"
                  accessibilityLabel={`Remove ${profile.name}`}
                  onPress={() => remove(profile)}
                  testID={`remove-${profile.id}`}
                  style={styles.flex}
                />
              )}
            </View>
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
    </>
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
