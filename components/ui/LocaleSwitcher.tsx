'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

const LABELS: Record<string, string> = {
  th: 'TH',
  en: 'EN',
};

export function LocaleSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-0.5 rounded-full bg-sunken p-0.5"
    >
      {routing.locales.map(code => {
        const isActive = code === locale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={isActive}
            // Replace so locale switches don't stack up in history.
            onClick={() => router.replace(pathname, { locale: code })}
            className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-faint hover:text-ink'
            }`}
          >
            {LABELS[code] ?? code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
