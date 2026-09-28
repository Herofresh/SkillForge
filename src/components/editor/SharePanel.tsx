import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { PROGRESSIONS_GUIDE_URL } from '@/domain/overlay';
import { useAppStore } from '@/store/useAppStore';

import { DetailSection } from '../node/DetailSection';
import { Spacing } from '../theme';
import { PixelButton, PixelIcon, PixelText } from '../ui';

type Props = {
  /** The user has changes to share (the share button is off without them). */
  hasChanges: boolean;
};

type Outcome = { kind: 'shared' } | { kind: 'error'; message: string };

const errorText = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong.';

/**
 * Sharing progressions (PLAN 4.8, ADR-036): "Share my progressions" hands the overlay as a YAML
 * file to the share sheet, "Import progressions" opens the import preview, and "Suggest to the
 * project" explains that the same YAML can go into a GitHub issue or pull request.
 */
export function SharePanel({ hasChanges }: Props) {
  const router = useRouter();
  const shareOverlay = useAppStore((state) => state.shareOverlay);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | undefined>();

  const share = async () => {
    setBusy(true);
    try {
      await shareOverlay();
      setOutcome({ kind: 'shared' });
    } catch (error) {
      setOutcome({ kind: 'error', message: errorText(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DetailSection title="Share" icon="scroll" testID="progressions-share">
        <PixelText variant="small" tone="textMuted">
          Your changes as one YAML file, in the same format as the app’s own progressions. A friend
          can import it, or you can keep it as a copy.
        </PixelText>
        <PixelButton
          label="Share my progressions"
          icon="scroll"
          onPress={share}
          disabled={busy || !hasChanges}
          testID="share-progressions"
        />
        <PixelButton
          label="Import progressions"
          variant="secondary"
          icon="rune"
          onPress={() => router.push('/progressions/import')}
          testID="import-progressions"
        />
        {outcome && (
          <View
            style={styles.row}
            accessibilityLiveRegion="polite"
            testID={`share-${outcome.kind}`}>
            <PixelIcon name={outcome.kind === 'error' ? 'alert' : 'check'} />
            <PixelText
              variant="small"
              tone={outcome.kind === 'error' ? 'danger' : 'success'}
              style={styles.flex}>
              {outcome.kind === 'error' ? outcome.message : 'Handed to the share sheet.'}
            </PixelText>
          </View>
        )}
      </DetailSection>

      <DetailSection
        title="Suggest to project"
        icon="star"
        variant="parchment"
        testID="suggest-project">
        <PixelText tone="textOnParchment">
          Found a better standard or a missing exercise? SkillForge’s progressions are open. Share
          your YAML, then paste it into a GitHub issue or pull request. The contributor guide
          explains the fields and asks for a source for every standard.
        </PixelText>
        <PixelButton
          label="Open the contributor guide"
          icon="scroll"
          variant="secondary"
          onPress={() => void Linking.openURL(PROGRESSIONS_GUIDE_URL)}
          accessibilityHint="Opens content/progressions/README.md on GitHub in the browser"
          testID="open-contributor-guide"
        />
      </DetailSection>
    </>
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
