import { Pressable, StyleSheet, View } from 'react-native';

import { BRANCH_NAMES } from '@/data/skills/branches';
import type { PrerequisiteView } from '@/domain/treeView';

import { Colors, PIXEL, Spacing, TOUCH_TARGET } from '../theme';
import { requiredLevelText } from '../tree/PrereqChip';
import { PixelIcon, PixelText } from '../ui';

type Props = {
  prerequisites: readonly PrerequisiteView[];
  onOpen: (nodeId: string) => void;
};

/**
 * The node's prerequisites with ✓/✗: what each asks for, its branch when it is another one, the
 * alternatives that satisfy it as well (ADR-019) and which node met it. Each row opens that node.
 */
export function PrerequisiteList({ prerequisites, onOpen }: Props) {
  if (prerequisites.length === 0) {
    return (
      <PixelText tone="textMuted" testID="prereq-none">
        None. This is where the path starts.
      </PixelText>
    );
  }
  return (
    <View style={styles.list}>
      {prerequisites.map((view) => {
        const { prerequisite, node, met, satisfiedBy, alternatives, crossBranch } = view;
        const recommended = prerequisite.kind === 'recommended';
        const requirement = `${requiredLevelText(prerequisite.minLevel)}${recommended ? ' (recommended)' : ''}`;
        const viaAlternative = satisfiedBy !== undefined && satisfiedBy.id !== node.id;
        const lines = [
          crossBranch ? BRANCH_NAMES[node.branch] : undefined,
          alternatives.length > 0
            ? `Also met by ${alternatives.map((entry) => entry.name).join(', ')}`
            : undefined,
          viaAlternative ? `Met through ${satisfiedBy.name}` : undefined,
          prerequisite.note,
        ].filter((line): line is string => line !== undefined);
        return (
          <Pressable
            key={node.id}
            onPress={() => onOpen(node.id)}
            accessibilityRole="link"
            accessibilityLabel={`${node.name}, ${requirement}, ${met ? 'met' : 'not met'}${lines.length > 0 ? `. ${lines.join('. ')}` : ''}`}
            testID={`prereq-${node.id}`}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <PixelIcon name={met ? 'check' : 'cross'} />
            <View style={styles.text}>
              <PixelText variant="heading" tone={met ? 'text' : 'textMuted'}>
                {node.name}
              </PixelText>
              <PixelText variant="label" tone={met ? 'success' : recommended ? 'gold' : 'danger'}>
                {`${met ? 'Met' : 'Not met'} · ${requirement}`}
              </PixelText>
              {lines.map((line) => (
                <PixelText key={line} variant="small" tone="textMuted">
                  {line}
                </PixelText>
              ))}
            </View>
            <PixelIcon name="chain" />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pressed: {
    backgroundColor: Colors.surfaceRaised,
  },
  text: {
    flex: 1,
    gap: PIXEL,
  },
});
