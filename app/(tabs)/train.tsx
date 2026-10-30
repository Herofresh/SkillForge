import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/components/theme';
import { PixelButton, PixelChip, PixelFrame, PixelIcon, PixelText, Screen } from '@/components/ui';
import { DEFAULT_SESSION_MINUTES, SESSION_MINUTES, sessionCounts } from '@/domain/train';
import type { TrainingType } from '@/domain/types';
import { k, t } from '@/i18n';
import { useAppStore } from '@/store/useAppStore';

/**
 * The Train tab (PLAN 4.4): "Train now" with an equipment profile, a time and the kind of session
 * (Standard / Recovery / Challenging, PLAN 7.8 FB-5), which opens the plan preview. While a session
 * is in progress (also after a restart) it offers to resume it instead.
 */
export default function TrainScreen() {
  const activeSession = useAppStore((state) => state.activeSession);
  return (
    <Screen insetBottom={false} testID="train-screen">
      <PixelFrame variant="raised" contentStyle={styles.gap}>
        <PixelText variant="label" tone="rune">
          {t('Training Grounds')}
        </PixelText>
        <PixelText variant="title" accessibilityRole="header">
          {activeSession ? t('Session in progress') : t('Train now')}
        </PixelText>
        <PixelText variant="small" tone="textMuted">
          {activeSession
            ? t('Your sets are saved as you go. Pick up where you left off.')
            : t('Pick your equipment and time; the grimoire suggests a session for your goals.')}
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
          {t('{logged} of {planned} sets logged', {
            logged: counts.setsLogged,
            planned: counts.setsPlanned,
          })}
        </PixelText>
      </View>
      <PixelButton
        label={t('Resume session')}
        icon="sword"
        onPress={() => router.push('/train/session')}
        testID="resume-session"
      />
    </PixelFrame>
  );
}

const TRAINING_TYPE_OPTIONS: readonly { type: TrainingType; label: string; text: string }[] = [
  {
    type: 'standard',
    label: k('Standard'),
    text: k('Skills, strength and core for your goals, with a short cool-down.'),
  },
  {
    type: 'recovery',
    label: k('Recovery'),
    text: k(
      'Mobility, a cool-down and light skill practice. No hard strength, no straight-arm work.',
    ),
  },
  {
    type: 'challenging',
    label: k('Challenging'),
    text: k('More sets, the harder end of each range, and a Trial if one is due.'),
  },
];

function SetupPanel() {
  const router = useRouter();
  const profiles = useAppStore((state) => state.equipmentProfiles);
  const planTraining = useAppStore((state) => state.planTraining);
  const [profileId, setProfileId] = useState<string | undefined>(profiles[0]?.id);
  const [minutes, setMinutes] = useState<number>(DEFAULT_SESSION_MINUTES);
  const [trainingType, setTrainingType] = useState<TrainingType>('standard');
  const typeOption =
    TRAINING_TYPE_OPTIONS.find((option) => option.type === trainingType) ??
    TRAINING_TYPE_OPTIONS[0];
  const chosen = profiles.find((profile) => profile.id === profileId) ?? profiles[0];

  const trainNow = () => {
    if (!chosen) return;
    planTraining(chosen.id, minutes, trainingType);
    router.push('/train/preview');
  };

  return (
    <>
      <PixelFrame contentStyle={styles.gap}>
        <View style={styles.row}>
          <PixelIcon name="bar" />
          <PixelText variant="label" tone="rune" accessibilityRole="header">
            {t('Equipment')}
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
            {t('No equipment profile yet: add one in Settings.')}
          </PixelText>
        )}
      </PixelFrame>
      <PixelFrame contentStyle={styles.gap}>
        <View style={styles.row}>
          <PixelIcon name="potion" />
          <PixelText variant="label" tone="rune" accessibilityRole="header">
            {t('Time')}
          </PixelText>
        </View>
        <View style={styles.chips} accessibilityRole="tablist">
          {SESSION_MINUTES.map((option) => (
            <PixelChip
              key={option}
              label={t('{n} min', { n: option })}
              role="tab"
              selected={option === minutes}
              onPress={() => setMinutes(option)}
              testID={`minutes-${option}`}
            />
          ))}
        </View>
      </PixelFrame>
      <PixelFrame contentStyle={styles.gap}>
        <View style={styles.row}>
          <PixelIcon name="flame" />
          <PixelText variant="label" tone="rune" accessibilityRole="header">
            {t('Training type')}
          </PixelText>
        </View>
        <View style={styles.chips} accessibilityRole="tablist">
          {TRAINING_TYPE_OPTIONS.map((option) => (
            <PixelChip
              key={option.type}
              label={t(option.label)}
              role="tab"
              selected={option.type === trainingType}
              onPress={() => setTrainingType(option.type)}
              testID={`training-type-${option.type}`}
            />
          ))}
        </View>
        <PixelText variant="small" tone="textMuted" testID="training-type-text">
          {t(typeOption.text)}
        </PixelText>
      </PixelFrame>
      <PixelButton
        label={t('Plan my session')}
        icon="scroll"
        onPress={trainNow}
        disabled={!chosen}
        accessibilityHint={t('Suggests a session you can change before starting')}
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
