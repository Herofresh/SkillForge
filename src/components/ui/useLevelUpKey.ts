import { useEffect, useRef, useState } from 'react';

/**
 * The level-up reveal key (PLAN 5.2): `undefined` until `level` rises while the screen is mounted,
 * then the new level, so `<LevelUpBurst playKey={key} />` plays once per level gained. A level that
 * was already there on mount never plays (no burst on every visit).
 */
export function useLevelUpKey(level: number): number | undefined {
  const seen = useRef(level);
  const [key, setKey] = useState<number | undefined>();
  useEffect(() => {
    if (level > seen.current) setKey(level);
    seen.current = level;
  }, [level]);
  return key;
}
