/**
 * TEST-ONLY adapter: the subset of expo-sqlite's synchronous `SQLiteDatabase` API that the Drizzle
 * expo-sqlite driver uses, backed by Node's built-in `node:sqlite` (ADR-027). It lets Jest run the
 * real schema, migrations, driver and repositories in plain Node. Never import it from app code.
 */
import { DatabaseSync, type SQLInputValue, type StatementSync } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

type Params = SQLInputValue[];

interface RunResult {
  changes: number;
  lastInsertRowId: number;
  getAllSync(): unknown[];
  getFirstSync(): unknown;
}

function returnsRows(statement: StatementSync): boolean {
  return statement.columns().length > 0;
}

function prepareSync(database: DatabaseSync, source: string) {
  const objects = database.prepare(source);
  let arrays: StatementSync | undefined; // prepared on first raw (array-mode) read
  const arrayStatement = (): StatementSync => {
    if (!arrays) {
      arrays = database.prepare(source);
      arrays.setReturnArrays(true);
    }
    return arrays;
  };
  return {
    executeSync(params: Params = []): RunResult {
      if (returnsRows(objects)) {
        const rows = objects.all(...params);
        return {
          changes: 0,
          lastInsertRowId: 0,
          getAllSync: () => rows,
          getFirstSync: () => rows[0],
        };
      }
      const { changes, lastInsertRowid } = objects.run(...params);
      return {
        changes: Number(changes),
        lastInsertRowId: Number(lastInsertRowid),
        getAllSync: () => [],
        getFirstSync: () => undefined,
      };
    },
    executeForRawResultSync(params: Params = []) {
      const statement = arrayStatement();
      if (!returnsRows(statement)) {
        statement.run(...params);
        return { getAllSync: () => [] };
      }
      const rows = statement.all(...params);
      return { getAllSync: () => rows };
    },
    finalizeSync() {},
  };
}

export interface NodeSqliteClient {
  /** Pass this to `createDatabase`. */
  client: SQLiteDatabase;
  /** The underlying Node database, e.g. to inspect tables in a test. */
  raw: DatabaseSync;
  close(): void;
}

/** Opens a database at `path` (default: in memory). Reopen the same file to simulate an app restart. */
export function openNodeSqliteClient(path = ':memory:'): NodeSqliteClient {
  const raw = new DatabaseSync(path);
  const client = {
    execSync: (source: string) => raw.exec(source),
    prepareSync: (source: string) => prepareSync(raw, source),
    closeSync: () => raw.close(),
  };
  return {
    // Only the methods above are used by the driver (see drizzle-orm/expo-sqlite/session.js).
    client: client as unknown as SQLiteDatabase,
    raw,
    close: () => raw.close(),
  };
}
