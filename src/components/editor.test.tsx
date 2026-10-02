import { act, fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { ALL_NODES } from '@/data/skills';
import { openTestDatabase, type TestDatabase } from '@/db/testing/testDatabase';
import { addPrerequisite, setDescription, setName } from '@/domain/nodeEditor';
import { branchColumn } from '@/domain/treeView';
import { createAppStore, type AppStore } from '@/store/appStore';
import { setAppStore } from '@/store/useAppStore';

import { CustomBadge } from './editor/CustomBadge';
import { NodeEditorBody } from './editor/NodeEditorBody';
import { OverlayEntryRow } from './editor/OverlayEntryRow';
import { NodeTile } from './tree/NodeTile';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
type BeforeRemove = (event: { preventDefault: () => void; data: { action: unknown } }) => void;
/** The editor's 'beforeRemove' listener and what it dispatched (the unsaved-changes guard). */
const mockNavigation = {
  listener: undefined as BeforeRemove | undefined,
  addListener: jest.fn((_: string, listener: BeforeRemove) => {
    mockNavigation.listener = listener;
    return () => undefined;
  }),
  dispatch: jest.fn(),
};
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  Stack: { Screen: () => null },
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
  useNavigation: () => mockNavigation,
}));

/** Simulates back / Cancel: returns whether the editor stopped the navigation. */
async function leave(): Promise<boolean> {
  const preventDefault = jest.fn();
  await act(async () => {
    mockNavigation.listener?.({ preventDefault, data: { action: { type: 'GO_BACK' } } });
  });
  return preventDefault.mock.calls.length > 0;
}

const NOW = 1_790_000_000_000;

let test: TestDatabase;
let store: AppStore;
beforeEach(async () => {
  test = await openTestDatabase();
  store = createAppStore({ db: test.db, baseNodes: ALL_NODES, now: () => NOW });
  store.getState().loadAll();
  setAppStore(store);
});
afterEach(() => test.close());

/** Saves "Towel hang" after Dead hang, needing Dead hang. */
function saveTowelHang(): void {
  const state = store.getState();
  const draft = addPrerequisite(
    setDescription(
      setName(state.newNodeDraft('v_pull', 'dead_hang'), 'Towel hang'),
      'A dead hang gripping a towel over the bar.',
    ),
    'dead_hang',
  );
  expect(state.saveNodeDraft(draft).issues).toEqual([]);
}

describe('NodeEditorBody', () => {
  it('asks before leaving with unsaved changes, and leaves when discarded', async () => {
    mockNavigation.dispatch.mockClear();
    const user = userEvent.setup();
    await render(
      <NodeEditorBody
        initial={store.getState().nodeDraft('dead_hang')!}
        title="Edit Dead hang"
        saveLabel="Save changes"
        onSaved={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(await leave()).toBe(false); // nothing changed yet
    await user.press(screen.getByTestId('editor-trial-target-plus'));
    expect(await leave()).toBe(true);
    expect(screen.getByTestId('editor-discard-dialog')).toBeTruthy();
    await user.press(screen.getByTestId('editor-discard'));
    expect(mockNavigation.dispatch).toHaveBeenCalledWith({ type: 'GO_BACK' });
  });

  it('adds a custom exercise with a prerequisite', async () => {
    const onSaved = jest.fn();
    const user = userEvent.setup();
    await render(
      <NodeEditorBody
        initial={store.getState().newNodeDraft('v_pull', 'dead_hang')}
        title="New exercise"
        saveLabel="Add to the tree"
        onSaved={onSaved}
        onCancel={jest.fn()}
      />,
    );
    // No name yet: the validator's issue shows under the name field and Save is off.
    expect(screen.getByTestId('editor-issues-name')).toHaveTextContent(/name must not be empty/);
    expect(screen.getByTestId('editor-save')).toBeDisabled();
    await user.type(screen.getByTestId('editor-name'), 'Towel hang');
    expect(screen.queryByTestId('editor-issues-name')).toBeNull();
    expect(screen.getByTestId('editor-position')).toHaveTextContent('Dead hang');

    await user.press(screen.getByTestId('editor-add-prerequisite'));
    await user.press(screen.getByTestId('option-dead_hang'));
    expect(screen.getByTestId('editor-prereq-dead_hang')).toHaveTextContent(/Dead hang/);

    // A custom exercise needs a description (PLAN 6.2): Save stays off until it has one.
    expect(screen.getByTestId('editor-issues-description')).toHaveTextContent(
      /description is missing/,
    );
    expect(screen.getByTestId('editor-save')).toBeDisabled();
    // changeText: typing a whole sentence key by key re-renders the form too often for a test.
    await act(async () => {
      fireEvent.changeText(
        screen.getByTestId('editor-description-input'),
        'A dead hang gripping a towel over the bar.',
      );
    });
    expect(screen.queryByTestId('editor-issues-description')).toBeNull();

    await user.press(screen.getByTestId('editor-save'));
    expect(onSaved).toHaveBeenCalledWith('user_towel_hang');
    expect(store.getState().nodes.find((node) => node.id === 'user_towel_hang')).toMatchObject({
      description: 'A dead hang gripping a towel over the bar.',
      prerequisites: [{ nodeId: 'dead_hang', kind: 'hard' }],
    });
    // Types a name key by key through the whole form: slow when the full suite runs in parallel.
  }, 20_000);

  it('shows a cycle inline, keeps Save off, and saves once it is removed', async () => {
    saveTowelHang();
    const onSaved = jest.fn();
    const user = userEvent.setup();
    await render(
      <NodeEditorBody
        initial={store.getState().nodeDraft('dead_hang')!}
        title="Edit Dead hang"
        saveLabel="Save changes"
        onSaved={onSaved}
        onCancel={jest.fn()}
      />,
    );
    expect(screen.queryByTestId('editor-identity')).toBeNull(); // built-in: no name/position
    await user.press(screen.getByTestId('editor-add-prerequisite'));
    await user.type(screen.getByTestId('prerequisite-sheet-search'), 'Towel');
    await user.press(screen.getByTestId('option-user_towel_hang'));
    expect(screen.getByTestId('editor-issues-prerequisites')).toHaveTextContent(/cycle/);
    expect(screen.getByTestId('editor-status')).toHaveTextContent(/^1 problem to fix/);
    expect(screen.getByTestId('editor-save')).toBeDisabled();

    await user.press(screen.getByTestId('editor-prereq-remove-user_towel_hang'));
    await user.press(screen.getByTestId('editor-trial-target-plus'));
    expect(screen.getByTestId('editor-save')).toBeEnabled();
    await user.press(screen.getByTestId('editor-save'));
    expect(onSaved).toHaveBeenCalledWith('dead_hang');
    expect(Object.keys(store.getState().overlay.edited)).toEqual(['dead_hang']);
  });
});

describe('custom markers', () => {
  it('labels the badge for screen readers', async () => {
    await render(<CustomBadge kind="edited" testID="badge" />);
    expect(screen.getByLabelText('Custom: changed by you')).toBeOnTheScreen();
  });

  it('tags a custom tile and says so in its label', async () => {
    const tile = branchColumn(ALL_NODES, 'v_pull', {}, []).find(
      (entry) => entry.node.id === 'dead_hang',
    )!;
    await render(<NodeTile tile={tile} onOpen={jest.fn()} custom />);
    expect(screen.getByTestId('tile-custom-dead_hang')).toHaveTextContent('Custom');
    expect(screen.getByRole('button', { name: /Dead hang, .*custom/ })).toBeOnTheScreen();
  });

  it('describes an overlay entry and runs its action', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    await render(
      <OverlayEntryRow
        entry={{ nodeId: 'pull_up', name: 'Pull-up', kind: 'edited', fields: ['Trial'] }}
        actionLabel="Reset"
        onAction={onAction}
        replacesYours
      />,
    );
    expect(screen.getByText('Changed: Trial')).toBeOnTheScreen();
    expect(screen.getByText('Replaces yours')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Reset Pull-up' }));
    expect(onAction).toHaveBeenCalled();
  });
});
