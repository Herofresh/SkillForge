import { useEffect, useState } from 'react';

import { MS_PER_SECOND } from '@/lib/time';

/**
 * The screen clock while `active`: re-renders once a second. Countdowns and timers compute what they
 * show from timestamps and this `now`, never by counting ticks, so a missed tick (background, slow
 * frame) costs nothing.
 */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), MS_PER_SECOND);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}
