import type { ReactNode } from 'react';

import { EmptyState, Screen, type IconName } from './ui';

type Props = {
  title: string;
  subtitle: string;
  icon: IconName;
  /** Optional content below the panel (e.g. a small proof that stored data loads). */
  children?: ReactNode;
};

/** Temporary tab body until the tab's real UI lands (Phase 4): a pixel empty state. */
export function PlaceholderScreen({ title, subtitle, icon, children }: Props) {
  return (
    <Screen centered>
      <EmptyState icon={icon} title={title} message={subtitle} note="COMING SOON" />
      {children}
    </Screen>
  );
}
