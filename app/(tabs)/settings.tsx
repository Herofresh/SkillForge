import { StyleSheet, Text, View } from 'react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { Colors, Spacing } from '@/components/theme';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsScreen() {
  const profiles = useAppStore((state) => state.equipmentProfiles);
  return (
    <PlaceholderScreen title="Settings" subtitle="Equipment profiles and backups.">
      {/* Minimal proof that the database loads (PLAN 3.1); the real screen is 4.6. */}
      <View style={styles.list}>
        <Text style={styles.heading}>Equipment profiles</Text>
        {profiles.map((profile) => (
          <Text key={profile.id} style={styles.item}>
            {profile.name}
          </Text>
        ))}
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  heading: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  item: {
    color: Colors.text,
    fontSize: 16,
  },
});
