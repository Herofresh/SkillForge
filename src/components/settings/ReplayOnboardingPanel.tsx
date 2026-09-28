import { useState } from 'react';

import { useAppStore } from '@/store/useAppStore';

import { DetailSection } from '../node/DetailSection';
import { PixelButton, PixelModal, PixelText } from '../ui';

/**
 * "Replay onboarding" (PLAN 5.10, ADR-046): runs the first-run intro again after a confirmation.
 * Nothing is deleted; the tabs layout sees the cleared flag and opens the intro.
 */
export function ReplayOnboardingPanel() {
  const replayOnboarding = useAppStore((state) => state.replayOnboarding);
  const [confirming, setConfirming] = useState(false);
  return (
    <DetailSection title="Intro" icon="flame" testID="settings-intro">
      <PixelText variant="small" tone="textMuted">
        Walk through the first-run steps again: hero, equipment, goals and the optional Trials.
      </PixelText>
      <PixelButton
        label="Replay onboarding"
        variant="secondary"
        onPress={() => setConfirming(true)}
        testID="replay-onboarding"
      />
      <PixelModal
        visible={confirming}
        title="Replay the intro?"
        onClose={() => setConfirming(false)}
        closeLabel="Cancel"
        testID="replay-dialog">
        <PixelText>
          Your data stays. Only the intro runs again, starting from your current hero name,
          equipment and goals. A Trial you log there is saved like any other session.
        </PixelText>
        <PixelButton
          label="Replay intro"
          onPress={() => {
            setConfirming(false);
            replayOnboarding();
          }}
          testID="replay-confirm"
        />
      </PixelModal>
    </DetailSection>
  );
}
