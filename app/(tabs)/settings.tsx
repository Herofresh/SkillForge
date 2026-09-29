import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EquipmentProfileEditor } from '@/components/equipment/EquipmentProfileEditor';
import { DetailSection } from '@/components/node/DetailSection';
import { AboutPanel } from '@/components/settings/AboutPanel';
import { BackupPanel } from '@/components/settings/BackupPanel';
import { ProgressionsPanel } from '@/components/settings/ProgressionsPanel';
import { ReplayOnboardingPanel } from '@/components/settings/ReplayOnboardingPanel';
import { Spacing } from '@/components/theme';
import { PixelButton, PixelModal, PixelText, PixelTextInput, Screen } from '@/components/ui';
import { HERO_NAME_MAX_LENGTH, normalizeHeroName } from '@/domain/onboarding';
import type { EquipmentProfile } from '@/domain/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * Settings (PLAN 4.6): the hero's name, equipment profiles (add, edit tags, rename, remove with a
 * confirmation), backups (export, import with a "replaces all your data" confirmation, undo the last
 * import), "My progressions" (tree changes and sharing, PLAN 4.7–4.8), "Replay onboarding" (PLAN
 * 5.10), about and credits, and the dev-only Style Guide. There are no units or other preferences
 * yet.
 */
export default function SettingsScreen() {
  const router = useRouter();
  // Re-mounts the name field when the stored name changes elsewhere (e.g. an import).
  const heroName = useAppStore((state) => state.profile?.heroName ?? '');
  const [renaming, setRenaming] = useState<EquipmentProfile | undefined>();

  return (
    <Screen testID="settings-screen">
      <HeroNamePanel key={heroName} />

      <View style={styles.gap} testID="settings-equipment">
        <PixelText variant="label" tone="rune" accessibilityRole="header">
          Equipment profiles
        </PixelText>
        <PixelText variant="small" tone="textMuted">
          Workouts only use the equipment of the place you pick on the Train tab.
        </PixelText>
        <EquipmentProfileEditor onRename={setRenaming} />
      </View>

      <ProgressionsPanel />
      <BackupPanel />
      <ReplayOnboardingPanel />
      <AboutPanel />

      {__DEV__ && (
        <PixelButton
          label="Style Guide"
          icon="scroll"
          variant="secondary"
          onPress={() => router.push('/styleguide')}
          testID="open-styleguide"
        />
      )}

      {renaming && <RenameSheet profile={renaming} onClose={() => setRenaming(undefined)} />}
    </Screen>
  );
}

/** The hero's name, editable (the same rules as onboarding: `normalizeHeroName`). */
function HeroNamePanel() {
  const storedName = useAppStore((state) => state.profile?.heroName ?? '');
  const setHeroName = useAppStore((state) => state.setHeroName);
  const [name, setName] = useState(storedName);
  const normalized = normalizeHeroName(name);
  const changed = normalized !== undefined && normalized !== storedName;
  const save = () => {
    if (changed) setHeroName(name);
  };
  return (
    <DetailSection title="Hero" icon="helmet" testID="settings-hero">
      <PixelTextInput
        label="Hero name"
        value={name}
        onChangeText={setName}
        maxLength={HERO_NAME_MAX_LENGTH}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={save}
        testID="settings-hero-name"
      />
      <PixelButton
        label="Save name"
        variant="secondary"
        onPress={save}
        disabled={!changed}
        testID="save-hero-name"
      />
    </DetailSection>
  );
}

/** Rename one equipment profile. Mounted to open, so it starts from the current name. */
function RenameSheet({ profile, onClose }: { profile: EquipmentProfile; onClose: () => void }) {
  const updateProfile = useAppStore((state) => state.updateEquipmentProfile);
  const [name, setName] = useState(profile.name);
  const valid = name.trim().length > 0;
  const save = () => {
    if (!valid) return;
    updateProfile(profile.id, { name });
    onClose();
  };
  return (
    <PixelModal
      visible
      title="Rename profile"
      onClose={onClose}
      closeLabel="Cancel"
      testID="rename-sheet">
      <PixelTextInput
        label="Name"
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={save}
        testID="rename-input"
      />
      <PixelButton label="Save" onPress={save} disabled={!valid} testID="rename-save" />
    </PixelModal>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.md,
  },
});
