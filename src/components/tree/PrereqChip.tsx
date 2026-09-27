import { Pressable, StyleSheet, View } from 'react-native';

import { BRANCH_NAMES } from '@/data/skills/branches';
import { PROFICIENT_LEVEL } from '@/domain/progression';
import type { PrerequisiteView } from '@/domain/treeView';

import { Border, Colors, Spacing, TOUCH_TARGET } from '../theme';
import { PixelFrame, PixelIcon, PixelText } from '../ui';

/** Visual chip height; the hit slop tops it up to the 48 dp touch target. */
const CHIP_HEIGHT = 36;
const HIT_SLOP = (TOUCH_TARGET - CHIP_HEIGHT) / 2;

/** "proficient" for a level-5 gate, else "level 3" (what the prerequisite asks for). */
export function requiredLevelText(minLevel: number): string {
  return minLevel >= PROFICIENT_LEVEL ? 'proficient' : `level ${minLevel}`;
}

type Props = {
  link: PrerequisiteView;
  onPress: (nodeId: string) => void;
  testID?: string;
};

/**
 * A small linked chip for a prerequisite that the column can't draw as a chain (another branch or
 * further up): ✓/✗ and the node name (screen readers also hear its branch). Opens that node.
 */
export function PrereqChip({ link, onPress, testID }: Props) {
  const { node, met, crossBranch, prerequisite } = link;
  const label = [
    `Needs ${node.name} ${requiredLevelText(prerequisite.minLevel)}`,
    crossBranch ? `from ${BRANCH_NAMES[node.branch]}` : undefined,
    met ? 'met' : 'not met',
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <Pressable
      onPress={() => onPress(node.id)}
      hitSlop={HIT_SLOP}
      accessibilityRole="link"
      accessibilityLabel={label}
      testID={testID}>
      {({ pressed }) => (
        <PixelFrame
          frame={{
            lines: [Colors.ink, met ? Colors.goldDark : Colors.border],
            fill: Colors.surface,
          }}
          shadow={false}
          pressed={pressed}
          padding={Spacing.xs}>
          <View style={styles.row}>
            <PixelIcon name={met ? 'check' : 'cross'} />
            <PixelText variant="small" tone={met ? 'text' : 'textMuted'}>
              {node.name}
            </PixelText>
          </View>
        </PixelFrame>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    // Frame lines (2 × 2 lines of 2 dp) + padding (2 × 4 dp) + this = CHIP_HEIGHT.
    minHeight: CHIP_HEIGHT - 2 * Spacing.xs - 4 * Border.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingRight: Spacing.xs,
  },
});
