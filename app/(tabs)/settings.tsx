import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { Colors, Spacing } from '@/components/theme';
import { PixelButton, PixelFrame, PixelIcon, PixelText } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsScreen() {
  const profiles = useAppStore((state) => state.equipmentProfiles);
  const router = useRouter();
  return (
    <PlaceholderScreen icon="gear" title="Settings" subtitle="Equipment profiles and backups.">
      {/* Minimal proof that the database loads (PLAN 3.1); the real screen is 4.6. */}
      <PixelFrame variant="parchment" contentStyle={styles.list}>
        <PixelText variant="heading" tone="textOnParchment" accessibilityRole="header">
          Equipment profiles
        </PixelText>
        {profiles.map((profile) => (
          <View key={profile.id} style={styles.item}>
            <PixelIcon name="bar" tint={Colors.bronze} />
            <PixelText tone="textOnParchment">{profile.name}</PixelText>
          </View>
        ))}
      </PixelFrame>
      {__DEV__ && (
        <PixelButton
          label="Style Guide"
          icon="scroll"
          variant="secondary"
          onPress={() => router.push('/styleguide')}
          testID="open-styleguide"
        />
      )}
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
