/**
 * Keeps the home-screen widget current (PLAN 6.6, ADR-055). After `loadAll`, the app writes a fresh
 * `WidgetSnapshot` and redraws the widget; then again whenever the parts the widget shows change
 * (a finished session or Trial, a test-out, an import, an edited tree) and whenever the app comes to
 * the foreground (the day may have changed). One store subscription covers every action that
 * changes the data, so no store action needs to know about the widget.
 */
import { AppState as NativeAppState } from 'react-native';

import { widgetSnapshot, type WidgetSnapshot } from '@/domain/widget';
import type { AppState, AppStore } from '@/store/appStore';

import { loadNativeWidget } from './widgetModule';
import { writeWidgetSnapshot } from './widgetStorage';

export interface WidgetSyncDeps {
  write: (snapshot: WidgetSnapshot) => void;
  redraw: () => Promise<void>;
  /** Calls back when the app returns to the foreground; returns an unsubscribe. */
  onForeground: (listener: () => void) => () => void;
  /** Where a failed write or redraw goes (the widget must never break the app). */
  onError: (error: unknown) => void;
}

const snapshotOf = (state: AppState): WidgetSnapshot =>
  widgetSnapshot({ nodes: state.nodes, engine: state.engine });

/** Wires a store to the widget; returns a stop function. Pure wiring, tested with fakes. */
export function syncWidget(store: AppStore, deps: WidgetSyncDeps): () => void {
  let written: string | undefined;

  const push = (force: boolean) => {
    const state = store.getState();
    if (!state.loaded) return;
    try {
      const snapshot = snapshotOf(state);
      const text = JSON.stringify(snapshot);
      if (text !== written) {
        deps.write(snapshot);
        written = text;
      } else if (!force) {
        return;
      }
      deps.redraw().catch(deps.onError);
    } catch (error) {
      deps.onError(error);
    }
  };

  push(true);
  const unsubscribeStore = store.subscribe((state, previous) => {
    if (
      state.loaded !== previous.loaded ||
      state.engine !== previous.engine ||
      state.nodes !== previous.nodes
    ) {
      push(false);
    }
  });
  const unsubscribeForeground = deps.onForeground(() => push(true));
  return () => {
    unsubscribeStore();
    unsubscribeForeground();
  };
}

/** Starts the sync in a build with the widget's native code; a no-op in Expo Go and tests. */
export function startWidgetSync(store: AppStore): void {
  const native = loadNativeWidget();
  if (!native) return;
  syncWidget(store, {
    write: writeWidgetSnapshot,
    redraw: native.redrawWidgets,
    onForeground: (listener) => {
      const subscription = NativeAppState.addEventListener('change', (status) => {
        if (status === 'active') listener();
      });
      return () => subscription.remove();
    },
    onError: (error) => console.warn('Could not update the home-screen widget', error),
  });
}
