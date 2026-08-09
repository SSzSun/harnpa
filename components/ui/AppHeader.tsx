'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';

type AppHeaderProps = {
  appName: string;
  /** Renders a back arrow to the left of the logo. */
  showBack?: boolean;
  backLabel?: string;
  /** Right-aligned actions (share, locale switcher, ...). */
  actions?: ReactNode;
};

export function AppHeader({ appName, showBack, backLabel, actions }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-4">
        {showBack && (
          <Link
            href="/"
            aria-label={backLabel}
            className="-ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-xl">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-bold text-ink"
          >
            ฿
          </span>
          <span className="truncate text-base font-bold tracking-tight text-ink">
            {appName}
          </span>
        </Link>

        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
