'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatMoney, formatShortDate } from '@/lib/format';
import { getPersonPalette } from '@/lib/personColors';
import type { Item, Person } from '@/lib/settlement';

type ItemsListProps = {
  items: Item[];
  people: Person[];
  onSelect: (item: Item) => void;
  onAdd: () => void;
  onAddPerson: () => void;
  onDeleteMultiple?: (itemIds: string[]) => void;
};

export function ItemsList({ items, people, onSelect, onAdd, onAddPerson, onDeleteMultiple }: ItemsListProps) {
  const t = useTranslations();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // An item needs someone to pay and someone to share it, so people come first.
  if (people.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        title={t('bill.needPeopleTitle')}
        description={t('bill.needPeopleBody')}
        action={<Button onClick={onAddPerson}>{t('bill.addPerson')}</Button>}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        }
        title={t('bill.noItemsTitle')}
        description={t('bill.noItemsBody')}
        action={<Button onClick={onAdd}>{t('bill.addItem')}</Button>}
      />
    );
  }

  const toggleSelection = (itemId: string) => {
    const next = new Set(selectedIds);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setSelectedIds(next);
  };

  const handleDelete = () => {
    if (selectedIds.size === 0 || !onDeleteMultiple) return;
    onDeleteMultiple(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const cancelSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2.5">
        {items.map(item => {
          const payer = people.find(p => p.id === item.payerId);
          const sharers = item.sharedBy
            .map(id => people.find(p => p.id === id))
            .filter((p): p is Person => Boolean(p));
          const perPerson = sharers.length > 0 ? item.price / sharers.length : 0;
          const isSelected = selectedIds.has(item.id);

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => (selectionMode ? toggleSelection(item.id) : onSelect(item))}
                className={`w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'border-brand bg-brand-tint shadow-card'
                    : 'border-line bg-surface hover:border-line-strong hover:shadow-card'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {selectionMode && (
                    <div className="pt-1">
                      <div
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors ${
                          isSelected
                            ? 'border-brand bg-brand text-surface'
                            : 'border-line-strong bg-surface'
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {item.createdAt && (
                      <div className="text-[11px] tabular-nums text-ink-faint">
                        {formatShortDate(item.createdAt)}
                      </div>
                    )}
                    <div className="truncate font-semibold text-ink">{item.name}</div>
                    {item.note && (
                      <div className="mt-0.5 truncate text-xs text-ink-soft">{item.note}</div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-lg font-bold tabular-nums text-ink">
                      {formatMoney(item.price)}
                    </div>
                    {sharers.length > 1 && (
                      <div className="text-[11px] tabular-nums text-ink-faint">
                        {t('item.perPerson', { amount: formatMoney(perPerson) })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-2.5">
                  {payer && (
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="text-ink-faint">{t('item.paidBy')}</span>
                      <span
                        className={`flex items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2 font-medium ${
                          getPersonPalette(payer.id).solid
                        }`}
                      >
                        <Avatar name={payer.name} personId={payer.id} size="xs" inverted />
                        {payer.name}
                      </span>
                    </span>
                  )}

                  <span className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-ink-faint">{t('item.split')}</span>
                    {sharers.map(person => (
                      <span
                        key={person.id}
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          getPersonPalette(person.id).soft
                        }`}
                      >
                        {person.name}
                      </span>
                    ))}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {selectionMode ? (
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1 whitespace-nowrap" onClick={cancelSelection}>
            {t('bill.cancel')}
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleDelete}
            disabled={selectedIds.size === 0}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('bill.delete')} ({selectedIds.size})
          </Button>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onAdd}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('bill.addItem')}
          </Button>
          {onDeleteMultiple && items.length > 1 && (
            <Button variant="dangerGhost" onClick={() => setSelectionMode(true)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
