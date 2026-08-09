'use client';

import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatMoney } from '@/lib/format';
import { computeBalance, type Item, type Person } from '@/lib/settlement';

type PeopleListProps = {
  people: Person[];
  items: Item[];
  onSelect: (person: Person) => void;
  onAdd: () => void;
};

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-ink-faint">{label}</div>
      <div className="tabular-nums text-ink-soft">{formatMoney(value)}</div>
    </div>
  );
}

export function PeopleList({ people, items, onSelect, onAdd }: PeopleListProps) {
  const t = useTranslations();

  if (people.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        }
        title={t('bill.noPeopleTitle')}
        description={t('bill.noPeopleBody')}
        action={<Button onClick={onAdd}>{t('bill.addPerson')}</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {people.map(person => {
          const balance = computeBalance(items, person.id);
          const settled = Math.abs(balance.net) < 0.01;

          return (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => onSelect(person)}
                className="w-full rounded-2xl border border-line bg-surface p-4 text-left transition-all hover:border-line-strong hover:shadow-card active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={person.name} personId={person.id} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink">{person.name}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`text-lg font-bold tabular-nums ${
                        settled ? 'text-ink-faint' : balance.net > 0 ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {!settled && (balance.net > 0 ? '+' : '−')}
                      {formatMoney(Math.abs(balance.net))}
                    </div>
                    <div className="text-[11px] font-medium text-ink-faint">
                      {settled
                        ? t('person.settled')
                        : balance.net > 0
                          ? t('person.shouldReceive')
                          : t('person.shouldPay')}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-6 border-t border-line pt-2.5 text-xs">
                  <Figure label={t('person.paidFirst')} value={balance.paidFirst} />
                  <Figure label={t('person.owes')} value={balance.owes} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <Button variant="secondary" fullWidth onClick={onAdd}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {t('bill.addPerson')}
      </Button>
    </div>
  );
}
