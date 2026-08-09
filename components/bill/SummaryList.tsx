'use client';

import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatMoney } from '@/lib/format';
import type { Payment, Person } from '@/lib/settlement';

type SummaryListProps = {
  payments: Payment[];
  people: Person[];
  hasItems: boolean;
  onSelect: (payment: Payment) => void;
  onTogglePaid: (payment: Payment) => void;
};

export function SummaryList({
  payments,
  people,
  hasItems,
  onSelect,
  onTogglePaid,
}: SummaryListProps) {
  const t = useTranslations();

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title={hasItems ? t('summary.allSettledTitle') : t('summary.noItemsTitle')}
        description={hasItems ? t('summary.allSettledBody') : t('summary.noItemsBody')}
      />
    );
  }

  const outstanding = payments.filter(p => !p.paid).length;

  return (
    <div className="space-y-4">
      <ul className="space-y-2.5">
        {payments.map(payment => {
          const from = people.find(p => p.id === payment.from);
          const to = people.find(p => p.id === payment.to);

          return (
            <li
              key={`${payment.from}-${payment.to}`}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                payment.paid
                  ? 'border-line bg-sunken/60'
                  : 'border-line bg-surface'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(payment)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <Avatar name={from?.name ?? '?'} personId={payment.from} size="sm" />
                  <span className="truncate text-sm font-medium text-ink">{from?.name}</span>
                </span>

                <svg
                  className="h-4 w-4 shrink-0 text-ink-faint"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>

                <span className="flex min-w-0 items-center gap-1.5">
                  <Avatar name={to?.name ?? '?'} personId={payment.to} size="sm" />
                  <span className="truncate text-sm font-medium text-ink">{to?.name}</span>
                </span>

                <span
                  className={`ml-auto shrink-0 pl-2 text-base font-bold tabular-nums ${
                    payment.paid ? 'text-ink-faint line-through' : 'text-ink'
                  }`}
                >
                  {formatMoney(payment.amount)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onTogglePaid(payment)}
                role="switch"
                aria-checked={payment.paid}
                aria-label={t('summary.togglePaidFor', {
                  from: from?.name ?? '',
                  to: to?.name ?? '',
                })}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  payment.paid
                    ? 'border-positive bg-positive text-surface'
                    : 'border-line-strong text-transparent hover:border-brand hover:bg-brand-tint'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="rounded-2xl bg-sunken px-4 py-3 text-xs leading-relaxed text-ink-soft">
        <p className="font-semibold text-ink">
          {outstanding === 0
            ? t('summary.allPaid')
            : t('summary.outstanding', { count: outstanding })}
        </p>
        <p className="mt-1">{t('summary.explanation')}</p>
      </div>
    </div>
  );
}
