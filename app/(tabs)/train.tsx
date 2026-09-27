import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/components/theme';
import { PixelButton, PixelChip, PixelFrame, PixelIcon, PixelText, Screen } from '@/components/ui';
import { SESSION_MINUTES, sessionCounts } from '@/domain/train';
import { useAppStore } from '@/store/useAppStore';

/**
 * The Train tab (PLAN 4.4): "Train now" with an equipment profile and a time, which opens the plan
 * preview. While a session is in progress (also after a restart) it offers to resume it instead.
 */
export default function TrainScreen() {
  const activeSession = useAppStore((state) => state.activeSession);
  return (
    <Screen testID="train-screen">
      <PixelFrame variant="raised" contentStyle={styles.gap}>
        <PixelText variant="label" tone="rune">
          Training Grounds
        </PixelText>
        <PixelText variant="title" accessibilityRole="header">
          {activeSession ? 'Session in progress' : 'Train now'}
        </PixelText>
        <PixelText variant="small" tone="textMuted">
          {activeSession
            ? 'Your sets are saved as you go. Pick up where you left off.'
            : 'Pick your equipment and time; the grimoire suggests a session for your goals.'}
        </PixelText>
      </PixelFrame>
      {activeSession ? <ResumePanel /> : <SetupPanel />}
    </Screen>
  );
}

function ResumePanel() {
  const router = useRouter();
  const session = useAppStore((state) => state.activeSession);
  if (!session) return null;
  const counts = sessionCounts(session);
  return (
    <PixelFrame variant="gold" contentStyle={styles.gap} testID="resume-panel">
      <View style={styles.row}>
        <PixelIcon name="flame" />
        <PixelText variant="heading">
          {`${counts.setsLogged} of ${counts.setsPlanned} sets logged`}
        </PixelText>
      </View>
      <PixelButton
        label="Resume session"
        icon="sword"
        onPress={() => router.push('/train/session')}
        testID="resume-session"
      />
    </PixelFrame>
  );
}

function SetupPanel() {
  const router = useRouter();
  const profiles = useAppStore((state) => state.equipmentProfiles);
  const planTraining = useAppStore((state) => state.planTraining);
  const [profileId, setProfileId] = useState<string | undefined>(profiles[0]?.id);
  const [minutes, setMinutes] = useState<number>(SESSION_MINUTES[0]);
  const chosen = profiles.find((profile) => profile.id === profileId) ?? profiles[0];

  const trainNow = () => {
    if (!chosen) return;
    planTraining(chosen.id, minutes);
    router.push('/train/preview');
  };

  return (
    <>
      <PixelFrame contentStyle={styles.gap}>
        <View style={styles.row}>
          <PixelIcon name="bar" />
          <PixelText variant="label" tone="rune" accessibilityRole="header">
            Equipment
          </PixelText>
        </View>
        <View style={styles.chips} accessibilityRole="tablist">
          {profiles.map((profile) => (
            <PixelChip
              key={profile.id}
              label={profile.name}
              role="tab"
              selected={profile.id === chosen?.id}
              onPress={() => setProfileId(profile.id)}
              testID={`profile-${profile.id}`}
            />
          ))}
        </View>
        {profiles.length === 0 && (
          <PixelText variant="small" tone="textMuted">
            No equipment profile yet: add one in Settings.
          </PixelText>
        )}
      </PixelFrame>
      <PixelFrame contentStyle={styles.gap}>
        <View style={styles.row}>
          <PixelIcon name="potion" />
          <PixelText variant="label" tone="rune" accessibilityRole="header">
            Time
          </PixelText>
        </View>
        <View style={styles.chips} accessibilityRole="tablist">
          {SESSION_MINUTES.map((option) => (
            <PixelChip
              key={option}
              label={`${option} min`}
              role="tab"
              selected={option === minutes}
              onPress={() => setMinutes(option)}
              testID={`minutes-${option}`}
            />
          ))}
        </View>
      </PixelFrame>
      <PixelButton
        label="Plan my session"
        icon="scroll"
        onPress={trainNow}
        disabled={!chosen}
        accessibilityHint="Suggests a session you can change before starting"
        testID="train-now"
      />
    </>
  );
}

const styles = StyleSheet.create({
  gap: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
