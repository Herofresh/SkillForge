import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { guideEntry, type GuideTopic } from '@/domain/guide';

import { Spacing } from '../theme';
import { PixelButton, PixelIcon, PixelModal, PixelText } from '../ui';

import { GUIDE_ICONS } from './guideIcons';

type Props = {
  topic: GuideTopic;
  onClose: () => void;
  testID?: string;
};

/**
 * A guide entry's short summary over the screen that asked for it (PLAN 6.10c, ADR-060), with
 * "More in the guide" to its full page. Mount it to open it; it only ever opens on a tap.
 */
export function GuideSheet({ topic, onClose, testID = 'guide-sheet' }: Props) {
  const router = useRouter();
  const entry = guideEntry(topic);
  const openPage = () => {
    onClose();
    router.push({ pathname: '/guide/[topic]', params: { topic } });
  };
  return (
    <PixelModal visible title={entry.title} onClose={onClose} testID={testID}>
      <View style={styles.row}>
        <PixelIcon name={GUIDE_ICONS[topic]} size={ICON_SIZE} />
        <View style={styles.flex}>
          <PixelText testID={`${testID}-summary`}>{entry.summary}</PixelText>
        </View>
      </View>
      <PixelButton
        label="More in the guide"
        icon="scroll"
        onPress={openPage}
        accessibilityHint="Opens this topic in How SkillForge works"
        testID={`${testID}-more`}
      />
    </PixelModal>
  );
}

/** 12 icon cells × 3 dp: whole dp per cell, so the edges stay sharp. */
const ICON_SIZE = 36;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
  },
});
