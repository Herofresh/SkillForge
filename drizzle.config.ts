import { defineConfig } from 'drizzle-kit';

/** `npm run db:generate` writes a new migration for schema changes (ADR-026). */
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
});
