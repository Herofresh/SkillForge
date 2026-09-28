import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { overlayEntries } from '@/domain/overlayEdit';
import { useAppStore } from '@/store/useAppStore';

import { DetailSection } from '../node/DetailSection';
import { PixelButton, PixelText } from '../ui';

/** Settings → "My progressions" (PLAN 4.7–4.8): how many tree changes there are, and the way in. */
export function ProgressionsPanel() {
  const router = useRouter();
  const overlay = useAppStore((state) => state.overlay);
  const baseNodes = useAppStore((state) => state.baseNodes);
  const count = useMemo(() => overlayEntries(overlay, baseNodes).length, [overlay, baseNodes]);
  return (
    <DetailSection
      title="Progressions"
      icon="quill"
      variant="arcane"
      testID="settings-progressions">
      <PixelText variant="small" tone="textMuted" testID="settings-progressions-count">
        {count === 0
          ? 'You use the built-in tree. Edit a skill from its page, or add your own.'
          : `You changed ${count} ${count === 1 ? 'skill' : 'skills'} of the tree.`}
      </PixelText>
      <PixelButton
        label="My progressions"
        icon="quill"
        variant="secondary"
        onPress={() => router.push('/progressions')}
        accessibilityHint="Your changes to the tree, sharing and importing"
        testID="open-progressions"
      />
    </DetailSection>
  );
}
