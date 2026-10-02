import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { nodeAttributes } from '@/domain/character';
import { EQUIPMENT_TAG_LABELS } from '@/domain/equipment';
import {
  formatOgLevel,
  formatWorkingRange,
  METRIC_LABELS,
  METRIC_UNITS,
  spokenOgLevel,
} from '@/domain/format';
import {
  addCue,
  addEquipmentOption,
  addPrerequisite,
  chainNodes,
  clearTrains,
  editorIssueText,
  issuesBySection,
  MAX_CUE_LENGTH,
  MAX_NODE_NAME_LENGTH,
  METRICS_WITH_TRIAL_REPS,
  nodeAbove,
  placeAfter,
  prerequisiteOptions,
  removeCue,
  removeEquipmentOption,
  removePrerequisite,
  setDescription,
  setMetric,
  setName,
  stepOgLevel,
  stepPrerequisiteLevel,
  stepTrial,
  stepWorkingRange,
  toggleEquipmentTag,
  togglePrerequisiteKind,
  toggleStraightArm,
  toggleTrains,
} from '@/domain/nodeEditor';
import { MAX_DESCRIPTION_LENGTH } from '@/data/validate';
import {
  ATTRIBUTES,
  EQUIPMENT_TAGS,
  METRICS,
  STRAIGHT_ARM_BRANCHES,
  type ExerciseNode,
  type ValidationIssue,
} from '@/domain/types';

import { ATTRIBUTE_LABELS } from '../node/AttributeChips';
import { DetailSection } from '../node/DetailSection';
import { Spacing } from '../theme';
import { NodeOptionSheet } from '../train/NodeOptionSheet';
import {
  NumberStepper,
  PixelButton,
  PixelChip,
  PixelFrame,
  PixelText,
  PixelTextInput,
} from '../ui';

import { IssueNotes } from './IssueNotes';
import { PositionSheet } from './PositionSheet';

type Props = {
  draft: ExerciseNode;
  onChange: (next: ExerciseNode) => void;
  /** The live `applyOverlay` issues of the draft (`nodeDraftIssues`). */
  issues: readonly ValidationIssue[];
  /** The live `applyOverlay` warnings of the draft (`nodeDraftWarnings`); never stop a save. */
  warnings?: readonly ValidationIssue[];
  /** The user's tree (names, pickers and positions). */
  nodes: readonly ExerciseNode[];
  /** A user node: its name, metric, position, difficulty and straight-arm flag can change too. */
  custom: boolean;
};

type Sheet = 'prerequisite' | 'position';

const NO_WARNINGS: readonly ValidationIssue[] = [];

/**
 * The node editor form (PLAN 4.7, ADR-036): every change goes through a pure draft function
 * (`src/domain/nodeEditor.ts`) and the validator's issues show inline in the section they are
 * about. The screen owns the draft and the Save button.
 */
export function NodeEditorForm({
  draft,
  onChange,
  issues,
  warnings = NO_WARNINGS,
  nodes,
  custom,
}: Props) {
  const [sheet, setSheet] = useState<Sheet | undefined>();
  const grouped = useMemo(
    () => issuesBySection(issues, draft.id, nodes),
    [issues, draft.id, nodes],
  );
  const advice = useMemo(
    () => warnings.map((warning) => editorIssueText(warning, draft.id, nodes)),
    [warnings, draft.id, nodes],
  );
  const names = useMemo(() => new Map(nodes.map((node) => [node.id, node.name])), [nodes]);
  const above = nodeAbove(draft, nodes);
  // Issues of the sections a built-in node doesn't show go to the general list.
  const general = custom ? grouped.other : [...grouped.name, ...grouped.position, ...grouped.other];

  return (
    <View style={styles.form}>
      {custom && (
        <DetailSection title="Exercise" icon="quill" variant="arcane" testID="editor-identity">
          <PixelTextInput
            label="Name"
            value={draft.name}
            onChangeText={(name) => onChange(setName(draft, name))}
            maxLength={MAX_NODE_NAME_LENGTH}
            autoCapitalize="sentences"
            placeholder="e.g. Towel hang"
            testID="editor-name"
          />
          <IssueNotes messages={grouped.name} testID="editor-issues-name" />
          <PixelText variant="label" tone="textMuted">
            Measured in
          </PixelText>
          <View style={styles.chips}>
            {METRICS.map((metric) => (
              <PixelChip
                key={metric}
                label={METRIC_LABELS[metric]}
                selected={draft.metric === metric}
                role="tab"
                onPress={() => onChange(setMetric(draft, metric))}
                testID={`editor-metric-${metric}`}
              />
            ))}
          </View>
          <PixelText variant="label" tone="textMuted">
            Comes after
          </PixelText>
          <PixelText testID="editor-position">{above ? above.name : 'Top of the branch'}</PixelText>
          <PixelButton
            label="Change position"
            icon="chain"
            variant="secondary"
            onPress={() => setSheet('position')}
            testID="editor-change-position"
          />
          <NumberStepper
            label="Difficulty"
            valueText={formatOgLevel(draft.ogLevel)}
            onDecrement={() => onChange(stepOgLevel(draft, -1))}
            onIncrement={() => onChange(stepOgLevel(draft, 1))}
            decrementDisabled={draft.ogLevel === 0}
            testID="editor-og-level"
          />
          <PixelText
            variant="small"
            tone="textMuted"
            accessibilityLabel={spokenOgLevel(draft.ogLevel)}>
            Overcoming Gravity level; it sets the tier and the XP. It shouldn’t be below the
            exercise above it.
          </PixelText>
          {!STRAIGHT_ARM_BRANCHES.includes(draft.branch) && (
            <PixelChip
              label="Straight-arm (tendon safeguards)"
              selected={draft.straightArm}
              onPress={() => onChange(toggleStraightArm(draft))}
              testID="editor-straight-arm"
            />
          )}
          <IssueNotes messages={grouped.position} testID="editor-issues-position" />
          <IssueNotes messages={advice} advice testID="editor-advice-position" />
        </DetailSection>
      )}

      <DetailSection title="Description" icon="info" testID="editor-description">
        <PixelText variant="small" tone="textMuted">
          What the exercise is and what it looks like, in 1–3 sentences. The cues go below.
        </PixelText>
        <PixelTextInput
          label="Description"
          value={draft.description}
          onChangeText={(description) => onChange(setDescription(draft, description))}
          maxLength={MAX_DESCRIPTION_LENGTH}
          multiline
          autoCapitalize="sentences"
          placeholder="e.g. Hanging from a towel thrown over the bar, arms straight."
          testID="editor-description-input"
        />
        <IssueNotes messages={grouped.description} testID="editor-issues-description" />
      </DetailSection>

      <DetailSection title="Standards" icon="shield" testID="editor-standards">
        <PixelText variant="small" tone="textMuted">
          {`Working range ${formatWorkingRange(draft.metric, draft.workingRange)}. Pass the Trial to become proficient.`}
        </PixelText>
        <NumberStepper
          label="Range min"
          valueText={formatWorkingRange(draft.metric, {
            min: draft.workingRange.min,
            max: draft.workingRange.min,
          })}
          onDecrement={() => onChange(stepWorkingRange(draft, 'min', -1))}
          onIncrement={() => onChange(stepWorkingRange(draft, 'min', 1))}
          testID="editor-range-min"
        />
        <NumberStepper
          label="Range max"
          valueText={formatWorkingRange(draft.metric, {
            min: draft.workingRange.max,
            max: draft.workingRange.max,
          })}
          onDecrement={() => onChange(stepWorkingRange(draft, 'max', -1))}
          onIncrement={() => onChange(stepWorkingRange(draft, 'max', 1))}
          testID="editor-range-max"
        />
        <NumberStepper
          label="Trial sets"
          valueText={String(draft.trial.sets)}
          onDecrement={() => onChange(stepTrial(draft, 'sets', -1))}
          onIncrement={() => onChange(stepTrial(draft, 'sets', 1))}
          testID="editor-trial-sets"
        />
        <NumberStepper
          label="Trial target"
          valueText={`${draft.trial.target} ${METRIC_UNITS[draft.metric]}`}
          onDecrement={() => onChange(stepTrial(draft, 'target', -1))}
          onIncrement={() => onChange(stepTrial(draft, 'target', 1))}
          testID="editor-trial-target"
        />
        {METRICS_WITH_TRIAL_REPS.includes(draft.metric) && (
          <NumberStepper
            label={draft.metric === 'eccentric_s' ? 'Lowerings' : 'Reps per set'}
            valueText={String(draft.trial.reps ?? 1)}
            onDecrement={() => onChange(stepTrial(draft, 'reps', -1))}
            onIncrement={() => onChange(stepTrial(draft, 'reps', 1))}
            testID="editor-trial-reps"
          />
        )}
        <IssueNotes messages={grouped.standards} testID="editor-issues-standards" />
      </DetailSection>

      <DetailSection title="Prerequisites" icon="chain" testID="editor-prerequisites">
        {draft.prerequisites.length === 0 ? (
          <PixelText variant="small" tone="textMuted">
            None: it is open from the start.
          </PixelText>
        ) : (
          draft.prerequisites.map((prereq) => (
            <PixelFrame
              key={prereq.nodeId}
              variant="raised"
              shadow={false}
              contentStyle={styles.item}
              testID={`editor-prereq-${prereq.nodeId}`}>
              <PixelText variant="heading">{names.get(prereq.nodeId) ?? prereq.nodeId}</PixelText>
              <PixelChip
                label="Required (locks until met)"
                selected={prereq.kind === 'hard'}
                onPress={() => onChange(togglePrerequisiteKind(draft, prereq.nodeId))}
                testID={`editor-prereq-kind-${prereq.nodeId}`}
              />
              <NumberStepper
                label="Level"
                valueText={`LV ${prereq.minLevel}`}
                onDecrement={() => onChange(stepPrerequisiteLevel(draft, prereq.nodeId, -1))}
                onIncrement={() => onChange(stepPrerequisiteLevel(draft, prereq.nodeId, 1))}
                decrementDisabled={prereq.minLevel <= 1}
                testID={`editor-prereq-level-${prereq.nodeId}`}
              />
              <PixelButton
                label="Remove"
                icon="cross"
                variant="secondary"
                onPress={() => onChange(removePrerequisite(draft, prereq.nodeId))}
                accessibilityLabel={`Remove prerequisite ${names.get(prereq.nodeId) ?? prereq.nodeId}`}
                testID={`editor-prereq-remove-${prereq.nodeId}`}
              />
            </PixelFrame>
          ))
        )}
        <PixelButton
          label="Add prerequisite"
          icon="chain"
          variant="secondary"
          onPress={() => setSheet('prerequisite')}
          testID="editor-add-prerequisite"
        />
        <IssueNotes messages={grouped.prerequisites} testID="editor-issues-prerequisites" />
      </DetailSection>

      <DetailSection title="Equipment" icon="bar" testID="editor-equipment">
        <PixelText variant="small" tone="textMuted">
          Each option is one way to do it; it needs all the tags of that option.
        </PixelText>
        {draft.equipment.map((option, index) => (
          <PixelFrame
            key={index}
            variant="raised"
            shadow={false}
            contentStyle={styles.item}
            testID={`editor-equipment-${index}`}>
            <PixelText variant="label" tone="textMuted">
              {`Option ${index + 1}`}
            </PixelText>
            <View style={styles.chips}>
              {EQUIPMENT_TAGS.map((tag) => (
                <PixelChip
                  key={tag}
                  label={EQUIPMENT_TAG_LABELS[tag]}
                  selected={option.includes(tag)}
                  onPress={() => onChange(toggleEquipmentTag(draft, index, tag))}
                  testID={`editor-equipment-${index}-${tag}`}
                />
              ))}
            </View>
            {draft.equipment.length > 1 && (
              <PixelButton
                label="Remove option"
                icon="cross"
                variant="secondary"
                onPress={() => onChange(removeEquipmentOption(draft, index))}
                testID={`editor-equipment-remove-${index}`}
              />
            )}
          </PixelFrame>
        ))}
        <PixelButton
          label="Add option"
          icon="bar"
          variant="secondary"
          onPress={() => onChange(addEquipmentOption(draft))}
          testID="editor-add-equipment"
        />
        <IssueNotes messages={grouped.equipment} testID="editor-issues-equipment" />
      </DetailSection>

      <CueEditor draft={draft} onChange={onChange} />

      <DetailSection title="Trains" icon="heart" testID="editor-trains">
        <PixelText variant="small" tone="textMuted">
          The attributes it builds on your character sheet.
        </PixelText>
        <View style={styles.chips}>
          <PixelChip
            label="Auto"
            selected={draft.trains === undefined}
            onPress={() => onChange(clearTrains(draft))}
            accessibilityLabel="Auto: from the movement pattern"
            testID="editor-trains-auto"
          />
          {ATTRIBUTES.map((attribute) => (
            <PixelChip
              key={attribute}
              label={ATTRIBUTE_LABELS[attribute]}
              selected={nodeAttributes(draft).includes(attribute)}
              onPress={() => onChange(toggleTrains(draft, attribute, nodeAttributes(draft)))}
              testID={`editor-trains-${attribute}`}
            />
          ))}
        </View>
        <IssueNotes messages={grouped.trains} testID="editor-issues-trains" />
      </DetailSection>

      <IssueNotes messages={general} testID="editor-issues-other" />
      {!custom && <IssueNotes messages={advice} advice testID="editor-advice-other" />}

      {sheet === 'prerequisite' && (
        <NodeOptionSheet
          title="Add prerequisite"
          intro="What must be learned first. Search, or pick from this branch."
          options={(query) => prerequisiteOptions(nodes, draft, query)}
          onPick={(nodeId) => {
            onChange(addPrerequisite(draft, nodeId));
            setSheet(undefined);
          }}
          onClose={() => setSheet(undefined)}
          searchable
          empty="No exercise matches."
          testID="prerequisite-sheet"
        />
      )}
      {sheet === 'position' && (
        <PositionSheet
          chain={chainNodes(nodes, draft.branch, draft.id)}
          afterId={above?.id}
          onPick={(afterId) => {
            onChange(placeAfter(draft, nodes, afterId));
            setSheet(undefined);
          }}
          onClose={() => setSheet(undefined)}
        />
      )}
    </View>
  );
}

/** Coaching cues: a parchment list with remove, and a field to add one. */
function CueEditor({
  draft,
  onChange,
}: {
  draft: ExerciseNode;
  onChange: (next: ExerciseNode) => void;
}) {
  const [text, setText] = useState('');
  const add = () => {
    onChange(addCue(draft, text));
    setText('');
  };
  return (
    <DetailSection title="Cues" icon="scroll" testID="editor-cues">
      {draft.cues.map((cue, index) => (
        <PixelFrame
          key={`${index}-${cue}`}
          variant="parchment"
          shadow={false}
          contentStyle={styles.item}>
          <PixelText tone="textOnParchment">{`• ${cue}`}</PixelText>
          <PixelButton
            label="Remove"
            icon="cross"
            variant="secondary"
            onPress={() => onChange(removeCue(draft, index))}
            accessibilityLabel={`Remove cue ${cue}`}
            testID={`editor-cue-remove-${index}`}
          />
        </PixelFrame>
      ))}
      <PixelTextInput
        label="New cue"
        value={text}
        onChangeText={setText}
        maxLength={MAX_CUE_LENGTH}
        placeholder="e.g. Shoulders down and back"
        returnKeyType="done"
        onSubmitEditing={add}
        testID="editor-cue-input"
      />
      <PixelButton
        label="Add cue"
        icon="scroll"
        variant="secondary"
        onPress={add}
        disabled={text.trim() === ''}
        testID="editor-add-cue"
      />
    </DetailSection>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  item: {
    gap: Spacing.sm,
  },
});
