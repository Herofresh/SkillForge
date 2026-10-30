import { Fragment, type ReactNode } from 'react';

import { useAppStore } from '@/store/useAppStore';

/**
 * Remounts its children when the language changes (PLAN 7.8 FB-8, ADR-080): every screen is
 * rebuilt with the new texts, including module-level labels and memoised strings. The navigation
 * starts over on the first tab, which is fine for a change made in Settings.
 */
export function LocaleKey({ children }: { children: ReactNode }) {
  const locale = useAppStore((state) => state.locale);
  return <Fragment key={locale}>{children}</Fragment>;
}
