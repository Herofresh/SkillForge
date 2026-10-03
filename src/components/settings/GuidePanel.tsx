import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GuideButton } from '../guide/GuideButton';
import { DetailSection } from '../node/DetailSection';
import { Spacing } from '../theme';
import { PixelButton, PixelText } from '../ui';

/**
 * Settings → "How SkillForge works" (PLAN 6.10c): opens the guide, and explains the home-screen
 * widgets, which have no screen of their own in the app.
 */
export function GuidePanel() {
  const router = useRouter();
  return (
    <DetailSection title="How SkillForge works" icon="info" testID="settings-guide">
      <PixelText variant="small" tone="textMuted">
        XP, levels, ranks, classes, the companion and the rest, explained. Look for the “i” next to
        each of them in the app too.
      </PixelText>
      <PixelButton
        label="Open the guide"
        icon="scroll"
        variant="secondary"
        onPress={() => router.push('/guide')}
        testID="open-guide"
      />
      <View style={styles.row}>
        <PixelText style={styles.flex}>Home-screen widgets</PixelText>
        <GuideButton topic="widgets" />
      </View>
    </DetailSection>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
