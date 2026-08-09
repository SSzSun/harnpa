import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="text-center">
        <div className="mb-6 inline-grid h-20 w-20 place-items-center rounded-full bg-sunken text-ink-faint">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold tabular-nums tracking-tight text-ink">404</h1>
        <p className="mt-2 text-lg text-ink-soft">Page not found</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 font-semibold text-surface transition-colors hover:bg-brand-strong"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('app.name')}
        </Link>
      </div>
    </div>
  );
}
