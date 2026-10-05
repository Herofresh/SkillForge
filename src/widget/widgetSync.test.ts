import { createStore } from 'zustand/vanilla';

import { makeChain } from '@/data/testFixtures';
import { INITIAL_ENGINE_STATE } from '@/domain/recompute';
import type { WidgetSnapshot } from '@/domain/widget';
import type { AppState, AppStore } from '@/store/appStore';

import { widgetsAvailable } from './widgetModule';
import { startWidgetSync, syncWidget, type WidgetSyncDeps } from './widgetSync';

jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: {} }));

function fakeStore(loaded = true): AppStore {
  const state = {
    loaded,
    nodes: makeChain(),
    engine: INITIAL_ENGINE_STATE,
    profile: { heroName: 'Aria', createdAt: 0 },
    activeSession: undefined,
  } as unknown as AppState;
  return createStore<AppState>()(() => state);
}

function fakeDeps() {
  const written: WidgetSnapshot[] = [];
  let foreground: () => void = () => undefined;
  const deps: WidgetSyncDeps = {
    write: (snapshot) => written.push(snapshot),
    redraw: jest.fn(() => Promise.resolve()),
    onForeground: (listener) => {
      foreground = listener;
      return () => undefined;
    },
    onError: jest.fn(),
  };
  return { deps, written, foreground: () => foreground() };
}

describe('syncWidget', () => {
  it('writes and draws the loaded state at once', () => {
    const { deps, written } = fakeDeps();
    syncWidget(fakeStore(), deps);
    expect(written).toEqual([expect.objectContaining({ level: 1, streak: 0 })]);
    expect(written[0]).not.toHaveProperty('heroName');
    expect(deps.redraw).toHaveBeenCalledTimes(1);
  });

  it('waits for loadAll', () => {
    const { deps, written } = fakeDeps();
    const store = fakeStore(false);
    syncWidget(store, deps);
    expect(written).toHaveLength(0);
    store.setState({ loaded: true });
    expect(written).toHaveLength(1);
  });

  it('pushes again when a session changes the engine, not for unrelated changes', () => {
    const { deps, written } = fakeDeps();
    const store = fakeStore();
    syncWidget(store, deps);
    store.setState({ activeSession: {} as AppState['activeSession'] });
    store.setState({ profile: { heroName: 'Bran', createdAt: 0 } });
    expect(written).toHaveLength(1);
    expect(deps.redraw).toHaveBeenCalledTimes(1);
    store.setState({ engine: { ...INITIAL_ENGINE_STATE, streak: 1, lastSessionAt: 5 } });
    expect(written).toHaveLength(2);
    expect(written[1]).toMatchObject({ streak: 1, lastSessionAt: 5 });
    expect(deps.redraw).toHaveBeenCalledTimes(2);
  });

  it('redraws on foreground (the day may have changed) without rewriting the same data', () => {
    const { deps, written, foreground } = fakeDeps();
    syncWidget(fakeStore(), deps);
    foreground();
    expect(written).toHaveLength(1);
    expect(deps.redraw).toHaveBeenCalledTimes(2);
  });

  it('rewrites and redraws after "Delete all my data", even when the data looks the same', () => {
    const { deps, written } = fakeDeps();
    const store = fakeStore();
    syncWidget(store, deps);
    store.setState({ dataResets: 1 });
    expect(written).toHaveLength(2);
    expect(written[1]).toEqual(written[0]);
    expect(deps.redraw).toHaveBeenCalledTimes(2);
  });

  it('reports a failed write instead of throwing', () => {
    const { deps } = fakeDeps();
    const error = new Error('disk full');
    syncWidget(fakeStore(), {
      ...deps,
      write: () => {
        throw error;
      },
    });
    expect(deps.onError).toHaveBeenCalledWith(error);
  });
});

describe('startWidgetSync', () => {
  it('does nothing without the native widget module (Expo Go, tests)', () => {
    expect(widgetsAvailable()).toBe(false);
    const store = fakeStore();
    const subscribe = jest.spyOn(store, 'subscribe');
    startWidgetSync(store);
    expect(subscribe).not.toHaveBeenCalled();
  });
});
