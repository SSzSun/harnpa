'use client';

import { useRef } from 'react';

export type TabItem<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

type SegmentedTabsProps<T extends string> = {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  idPrefix: string;
};

export function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
  idPrefix,
}: SegmentedTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  // Left/Right arrows move between tabs, matching native tablist behaviour.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();

    const current = tabs.findIndex(tab => tab.id === active);
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const next = (current + delta + tabs.length) % tabs.length;

    onChange(tabs[next].id);
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className="flex gap-1 rounded-2xl bg-surface p-1.5 shadow-card"
    >
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand text-ink shadow-sm'
                : 'text-ink-soft hover:bg-sunken hover:text-ink'
            }`}
          >
            <span className="truncate">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                  isActive ? 'bg-ink/10 text-ink' : 'bg-sunken text-ink-faint'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
