import { eq } from 'drizzle-orm';

import type { HeroProfile } from '@/domain/types';

import type { AppDb } from './database';
import { optional } from './rowGuards';
import { profile } from './schema';

/** The profile table holds one row with this id. */
const PROFILE_ID = 1;

export function createProfile(db: AppDb, now: number): void {
  db.insert(profile).values({ id: PROFILE_ID, createdAt: now }).onConflictDoNothing().run();
}

export function getProfile(db: AppDb): HeroProfile | undefined {
  const row = db.select().from(profile).where(eq(profile.id, PROFILE_ID)).get();
  if (!row) return undefined;
  const heroName = optional(row.heroName);
  return { createdAt: row.createdAt, ...(heroName !== undefined ? { heroName } : {}) };
}

export function setHeroName(db: AppDb, heroName: string): void {
  db.update(profile).set({ heroName }).where(eq(profile.id, PROFILE_ID)).run();
}
