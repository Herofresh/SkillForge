import 'react-native-gesture-handler/jestSetup';

import { render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { PROFICIENT_LEVEL, xpForLevel } from '@/domain/progression';
import { mapFocus, mapLayout, mapTiles } from '@/domain/treeMap';
import { BRANCHES, type NodeProgress } from '@/domain/types';

import { BranchTabs } from './BranchTabs';
import { TreeMap } from './tree/map/TreeMap';
import { TreeModeTabs } from './tree/TreeModeTabs';

const proficient = (nodeId: string): NodeProgress => ({
  nodeId,
  xp: xpForLevel(PROFICIENT_LEVEL, 0),
  level: PROFICIENT_LEVEL,
  trialPassed: true,
  firstTrainedAt: 1,
});

const layout = mapLayout(ALL_NODES);

async function renderMap(goals: string[] = [], progress = {}) {
  const state = mapTiles(ALL_NODES, progress, goals);
  const onOpen = jest.fn();
  const onSwitchToList = jest.fn();
  await render(
    <TreeMap
      layout={layout}
      state={state}
      focus={mapFocus(layout, state, goals)}
      customized={new Set(['dead_hang'])}
      onOpen={onOpen}
      onSwitchToList={onSwitchToList}
    />,
  );
  return { onOpen, onSwitchToList };
}

describe('TreeMap', () => {
  it('renders every node as a labelled button that opens it', async () => {
    const { onOpen } = await renderMap();
    for (const node of ALL_NODES) {
      expect(screen.getByTestId(`map-node-${node.id}`)).toBeOnTheScreen();
    }
    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: /^Dead hang, Ready/ }));
    expect(onOpen).toHaveBeenCalledWith('dead_hang');
  });

  it('shows the same states as the column tiles, goals and customs', async () => {
    await renderMap(['scapular_pull'], { dead_hang: proficient('dead_hang') });
    expect(screen.getByTestId('map-state-dead_hang')).toHaveTextContent('LV 5');
    expect(screen.getByTestId('map-state-scapular_pull')).toHaveTextContent('Ready');
    expect(screen.getByTestId('map-state-one_arm_chin_up')).toHaveTextContent('Legendary');
    expect(
      screen.getByTestId('map-goal-scapular_pull', { includeHiddenElements: true }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: /^Dead hang, Proficient, level 5, .*custom/ }),
    ).toBeOnTheScreen();
  });

  it('offers focus, zoom and a switch back to the list', async () => {
    const { onSwitchToList } = await renderMap(['scapular_pull']);
    expect(screen.getByRole('button', { name: 'Focus goals' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: 'Switch to list' }));
    expect(onSwitchToList).toHaveBeenCalled();
  });

  it('draws a lane for every branch, the new Flexibility and Mobility ones too (PLAN 6.3a)', async () => {
    await renderMap();
    for (const title of ['Flexibility', 'Mobility', 'Acrobatics']) {
      // Lane titles are decorative (hidden from screen readers), like the chains.
      expect(screen.getByText(title, { includeHiddenElements: true })).toBeOnTheScreen();
    }
    expect(screen.getByRole('button', { name: /^King pigeon, Locked/ })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Cat-cow, Ready/ })).toBeOnTheScreen();
  });

  it('focuses what can be trained when there are no goals', async () => {
    await renderMap();
    expect(screen.getByRole('button', { name: 'Focus on what you can train' })).toBeOnTheScreen();
  });
});

describe('TreeModeTabs', () => {
  it('marks the current mode and switches', async () => {
    const onChange = jest.fn();
    await render(<TreeModeTabs value="columns" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: /^Columns/, selected: true })).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole('tab', { name: /^Map/ }));
    expect(onChange).toHaveBeenCalledWith('map');
  });
});

describe('BranchTabs', () => {
  it('has a tab per branch, Mobility last (PLAN 6.3a), and switches to it', async () => {
    const onChange = jest.fn();
    await render(<BranchTabs value="flexibility" onChange={onChange} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(BRANCHES.length);
    expect(tabs.at(-1)).toHaveTextContent('Mobility');
    expect(screen.getByRole('tab', { name: 'Flexibility', selected: true })).toBeOnTheScreen();
    const user = userEvent.setup();
    await user.press(screen.getByRole('tab', { name: 'Mobility' }));
    expect(onChange).toHaveBeenCalledWith('mobility');
  });
});
