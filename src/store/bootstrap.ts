/**
 * App start (PLAN 3.1/3.2): open the database, run the migrations, create the store and load the
 * history. `DataGate` calls it before any screen that reads data renders. Errors are thrown to the
 * caller (which shows them); nothing here deletes or resets data.
 */
import { ALL_NODES } from '@/data/skills';
import { migrateDatabase } from '@/db/migrate';
import { openAppDatabase } from '@/db/openAppDatabase';

import { createAppStore, type AppStore } from './appStore';
import { setAppStore } from './useAppStore';

let started: Promise<AppStore> | undefined;

/** Starts the app once; later calls (e.g. a re-mounted gate) get the same promise. */
export function startApp(): Promise<AppStore> {
  started ??= boot();
  return started;
}

async function boot(): Promise<AppStore> {
  const db = openAppDatabase();
  await migrateDatabase(db, Date.now());
  const store = createAppStore({ db, nodes: ALL_NODES });
  store.getState().loadAll();
  setAppStore(store);
  return store;
}
