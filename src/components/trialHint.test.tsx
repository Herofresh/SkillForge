import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { PROFICIENT_LEVEL, xpForLevel } from '@/domain/progression';
import { sessionPlan } from '@/domain/train';
import { blockViews, type SummaryView } from '@/domain/trainView';
import { branchColumn } from '@/domain/treeView';
import type { NodeProgress, WorkoutPlan } from '@/domain/types';

import { ExerciseCard } from './train/ExerciseCard';
import { SessionResultPanels } from './train/SessionResultPanels';
import { NodeTile } from './tree/NodeTile';

const LOOKUP = new Map(ALL_NODES.map((node) => [node.id, node]));

/** Pull-up trained to the level-5 cap, its Trial not passed (ADR-004). */
const capped = (nodeId: string): NodeProgress => ({
  nodeId,
  xp: xpForLevel(PROFICIENT_LEVEL, LOOKUP.get(nodeId)!.ogLevel) + 30,
  level: PROFICIENT_LEVEL,
  trialPassed: false,
  firstTrainedAt: 1,
});
const PROGRESS = { pull_up: capped('pull_up') };

describe('"Trial needed" (PLAN 7.8 FB-4)', () => {
  it('marks a Tree tile stuck at level 5 and says so to screen readers', async () => {
    const tile = branchColumn(ALL_NODES, 'v_pull', PROGRESS, []).find(
      (entry) => entry.node.id === 'pull_up',
    )!;
    await render(<NodeTile tile={tile} onOpen={jest.fn()} />);
    expect(screen.getByTestId('tile-trial-needed-pull_up')).toHaveTextContent('Trial needed');
    expect(screen.getByTestId('tile-pull_up')).toHaveProp(
      'accessibilityLabel',
      expect.stringContaining('trial needed to level further'),
    );
  });

  it('leaves other tiles alone', async () => {
    const tile = branchColumn(ALL_NODES, 'v_pull', {}, []).find(
      (entry) => entry.node.id === 'pull_up',
    )!;
    await render(<NodeTile tile={tile} onOpen={jest.fn()} />);
    expect(screen.queryByTestId('tile-trial-needed-pull_up')).toBeNull();
  });

  it('tags the exercise card in the plan and the session', async () => {
    const workout: WorkoutPlan = {
      blocks: [
        {
          kind: 'strength',
          exercises: [
            { nodeId: 'pull_up', sets: 3, target: { value: 5 }, metric: 'reps', restSec: 90 },
          ],
        },
      ],
      estimatedMinutes: 10,
      restPace: 1,
      warnings: [],
      notes: [],
    };
    const [block] = blockViews(
      sessionPlan(workout, 'home', 30).exercises,
      LOOKUP,
      undefined,
      PROGRESS,
    );
    await render(<ExerciseCard exercise={block.exercises[0]} testID="card" />);
    expect(screen.getByText('Trial needed')).toBeOnTheScreen();
    expect(screen.getByTestId('card-trial-needed')).toHaveTextContent(
      'Level 5 reached: pass the Trial to keep levelling.',
    );
  });

  it('lists the skills waiting for their Trial on the summary, with the banked XP', async () => {
    const user = userEvent.setup();
    const onOpenNode = jest.fn();
    const view: SummaryView = {
      totalXp: 10,
      exerciseXp: 10,
      completionBonus: 0,
      streakBonus: 0,
      challengeBonus: 0,
      streak: 1,
      exercises: [],
      levelUps: [],
      unlocked: [],
      awaitingTrial: [{ nodeId: 'pull_up', name: 'Pull-up', banked: 30 }],
      warnings: [],
    };
    await render(
      <SessionResultPanels
        view={view}
        celebrate={false}
        playKey="s"
        subtitle="Session"
        onOpenNode={onOpenNode}
      />,
    );
    expect(screen.getByTestId('summary-trial-needed')).toHaveTextContent(
      /Pull-up: Level 5 reached: pass the Trial to keep levelling\. 30 XP banked\./,
    );
    await user.press(screen.getByRole('link', { name: /Pull-up: Level 5 reached/ }));
    expect(onOpenNode).toHaveBeenCalledWith('pull_up');
  });
});
