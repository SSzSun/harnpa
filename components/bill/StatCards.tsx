'use client';

import { useTranslations } from 'next-intl';
import { formatMoney, formatMoneyCompact } from '@/lib/format';

type StatCardsProps = {
  itemsCount: number;
  totalAmount: number;
  peopleCount: number;
};

const ICONS = {
  items: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  total: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  people: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
} as const;

function Stat({
  icon,
  label,
  children,
  emphasis = false,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-3.5 shadow-card sm:p-5 ${emphasis ? 'bg-ink' : 'bg-surface'}`}>
      <div className={`flex items-center gap-1.5 ${emphasis ? 'text-brand' : 'text-ink-faint'}`}>
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
        </svg>
        <span className="truncate text-[11px] font-medium uppercase tracking-wide sm:text-xs">
          {label}
        </span>
      </div>
      <div
        className={`mt-1.5 break-all text-xl font-bold tabular-nums tracking-tight sm:text-3xl ${
          emphasis ? 'text-surface' : 'text-ink'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function StatCards({ itemsCount, totalAmount, peopleCount }: StatCardsProps) {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      <Stat icon={ICONS.items} label={t('bill.items')}>
        {itemsCount}
      </Stat>
      <Stat icon={ICONS.total} label={t('bill.totalPrice')} emphasis>
        {formatMoneyCompact(totalAmount)}
        <span className="ml-1 text-sm font-semibold text-brand sm:text-lg">฿</span>
      </Stat>
      <Stat icon={ICONS.people} label={t('bill.people')}>
        {peopleCount}
      </Stat>
    </div>
  );
}
