'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { Footer } from '@/components/ui/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  getBillHistory,
  removeBillFromHistory,
  type BillHistoryItem,
} from '@/lib/billHistory';
import { formatMoney, formatRelativeTime } from '@/lib/format';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [history, setHistory] = useState<BillHistoryItem[]>([]);
  // History lives in localStorage, so it can only be read after mount. Gate the
  // list on this to avoid flashing the empty state before the read lands.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHistory(getBillHistory());
    setHydrated(true);
  }, []);

  const createBill = () => router.push(`/bill/${Date.now()}`);

  const deleteBill = (billId: string) => {
    removeBillFromHistory(billId);
    setHistory(getBillHistory());
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <AppHeader
        appName={t('app.name')}
        actions={
          <div className="flex gap-2">
            <ThemeToggle />
            <LocaleSwitcher label={t('common.language')} />
          </div>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16">
        <section className="py-10 text-center sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t('home.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft sm:text-base">
            {t('home.subtitle')}
          </p>
          <Button size="lg" onClick={createBill} className="mt-7 px-8">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('app.createBill')}
          </Button>
        </section>

        <section aria-labelledby="history-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="history-heading" className="text-lg font-semibold tracking-tight text-ink">
              {t('home.history')}
            </h2>
            {history.length > 0 && (
              <span className="text-xs tabular-nums text-ink-faint">
                {t('home.billCount', { count: history.length })}
              </span>
            )}
          </div>

          {!hydrated ? (
            <div className="space-y-2.5" aria-hidden="true">
              {[0, 1].map(i => (
                <div key={i} className="h-[92px] animate-pulse rounded-2xl bg-surface/70" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl bg-surface shadow-card">
              <EmptyState
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                title={t('home.emptyTitle')}
                description={t('home.emptyBody')}
              />
            </div>
          ) : (
            <ul className="space-y-2.5">
              {history.map(bill => (
                <li key={bill.billId} className="relative">
                  <Link
                    href={`/bill/${bill.billId}`}
                    className="block rounded-2xl bg-surface p-4 pr-14 shadow-card transition-all hover:shadow-lift"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="truncate font-semibold text-ink">{bill.billName}</h3>
                      <span className="shrink-0 text-base font-bold tabular-nums text-ink">
                        {formatMoney(bill.totalAmount)}
                        <span className="ml-0.5 text-xs font-semibold text-ink-faint">฿</span>
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                      <span className="tabular-nums">
                        {t('home.itemCount', { count: bill.itemsCount })}
                      </span>
                      <span aria-hidden="true" className="text-ink-faint">·</span>
                      <span className="tabular-nums">
                        {t('home.peopleCount', { count: bill.peopleCount })}
                      </span>
                      <span aria-hidden="true" className="text-ink-faint">·</span>
                      <span className="text-ink-faint">
                        {formatRelativeTime(bill.lastAccessed, locale)}
                      </span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => deleteBill(bill.billId)}
                    aria-label={t('home.removeBill', { name: bill.billName })}
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-ink-faint transition-colors hover:bg-negative-tint hover:text-negative"
                  >
                    <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {hydrated && history.length > 0 && (
            <p className="mt-4 text-center text-xs text-ink-faint">
              {t('home.localOnlyNote')}
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
