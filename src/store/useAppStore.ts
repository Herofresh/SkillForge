import { useStore } from 'zustand';

import type { AppState, AppStore } from './appStore';

let appStore: AppStore | undefined;

/** Registers the app's single store (called once by `startApp`). */
export function setAppStore(store: AppStore): void {
  appStore = store;
}

/**
 * Reads from the app store in a component. Only use it below `DataGate`, which renders its children
 * after `startApp` has created the store.
 */
export function useAppStore<T>(selector: (state: AppState) => T): T {
  if (!appStore) throw new Error('useAppStore used before the app store was started');
  return useStore(appStore, selector);
}
