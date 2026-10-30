import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { overlayEntries } from '@/domain/overlayEdit';
import { t } from '@/i18n';
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
      title={t('Progressions')}
      icon="quill"
      variant="arcane"
      testID="settings-progressions">
      <PixelText variant="small" tone="textMuted" testID="settings-progressions-count">
        {count === 0
          ? t('You use the built-in tree. Edit a skill from its page, or add your own.')
          : count === 1
            ? t('You changed 1 skill of the tree.')
            : t('You changed {n} skills of the tree.', { n: count })}
      </PixelText>
      <PixelButton
        label={t('My progressions')}
        icon="quill"
        variant="secondary"
        onPress={() => router.push('/progressions')}
        accessibilityHint={t('Your changes to the tree, sharing and importing')}
        testID="open-progressions"
      />
    </DetailSection>
  );
}
