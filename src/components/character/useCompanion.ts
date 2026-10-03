import { useMemo } from 'react';

import { HERO_CLASSES } from '@/data/classes';
import { ACCESSORIES, weaponFor, type CompanionOutfit } from '@/data/companion';
import { wornClass } from '@/domain/classes';
import {
  companionFacts,
  companionLoadout,
  companionMood,
  companionWardrobe,
  moodLine,
  MOOD_TITLES,
  newAccessoryCount,
  type CompanionLookChoice,
  type CompanionMood,
  type SlotRow,
} from '@/domain/companion';
import { useAppStore } from '@/store/useAppStore';

export interface CompanionView {
  mood: CompanionMood;
  title: string;
  line: string;
  outfit: CompanionOutfit;
  look: CompanionLookChoice;
  weaponName: string;
  newCount: number;
  wardrobe: SlotRow[];
}

/**
 * The companion as the Character tab shows it (PLAN 6.10), from the store: mood at `now`, what it
 * wears (accessories and the worn class's weapon) and the customize sheet's rows.
 */
export function useCompanion(now: number): CompanionView {
  const companion = useAppStore((state) => state.companion);
  const classes = useAppStore((state) => state.classes);
  const engine = useAppStore((state) => state.engine);
  const nodes = useAppStore((state) => state.nodes);
  const sessions = useAppStore((state) => state.sessions);
  const sessionResults = useAppStore((state) => state.sessionResults);
  return useMemo(() => {
    const mood = companionMood(engine.lastSessionAt, now);
    const worn = wornClass(HERO_CLASSES, classes);
    const weapon = weaponFor(worn.classId, worn.tier);
    const facts = companionFacts({
      nodes,
      engine,
      sessionCount: sessions.length,
      sessionResults,
      classUnlocks: classes.unlocks,
    });
    return {
      mood,
      title: MOOD_TITLES[mood],
      line: moodLine(mood, engine.lastSessionAt),
      outfit: {
        loadout: companionLoadout(ACCESSORIES, companion),
        weapon: { classId: weapon.classId, upgraded: weapon.upgraded },
      },
      look: companion.look,
      weaponName: weapon.name,
      newCount: newAccessoryCount(companion),
      wardrobe: companionWardrobe(ACCESSORIES, companion, facts),
    };
  }, [companion, classes, engine, nodes, sessions, sessionResults, now]);
}
