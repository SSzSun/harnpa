'use client';

import { Avatar } from '@/components/ui/Avatar';
import { getPersonPalette } from '@/lib/personColors';

type PersonChipProps = {
  people: Array<{ id: string; name: string }>;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  variant?: 'default' | 'compact';
  mode?: 'single' | 'multiple';
  showSelectAll?: boolean;
  selectAllLabel?: string;
  clearAllLabel?: string;
  /** Accessible name for the group of chips. */
  groupLabel?: string;
};

export function PersonChip({
  people,
  selectedIds,
  onSelectionChange,
  variant = 'default',
  mode = 'multiple',
  showSelectAll = false,
  selectAllLabel = 'Select all',
  clearAllLabel,
  groupLabel,
}: PersonChipProps) {
  const togglePerson = (id: string) => {
    if (mode === 'single') {
      onSelectionChange([id]);
      return;
    }
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(sid => sid !== id)
        : [...selectedIds, id]
    );
  };

  const isCompact = variant === 'compact';
  const allSelected = people.length > 0 && selectedIds.length === people.length;

  return (
    <div role="group" aria-label={groupLabel}>
      {mode === 'multiple' && showSelectAll && people.length > 1 && (
        <div className="mb-2.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectionChange(people.map(p => p.id))}
            disabled={allSelected}
            className="text-xs font-semibold text-brand-strong underline-offset-2 hover:underline disabled:opacity-40 disabled:hover:no-underline"
          >
            {selectAllLabel}
          </button>
          {clearAllLabel && (
            <button
              type="button"
              onClick={() => onSelectionChange([])}
              disabled={selectedIds.length === 0}
              className="text-xs font-semibold text-negative underline-offset-2 hover:underline disabled:opacity-40 disabled:hover:no-underline"
            >
              {clearAllLabel}
            </button>
          )}
        </div>
      )}

      <div className={`flex flex-wrap ${isCompact ? 'gap-1.5' : 'gap-2'}`}>
        {people.map(person => {
          const isSelected = selectedIds.includes(person.id);
          const palette = getPersonPalette(person.id);

          return (
            <button
              key={person.id}
              type="button"
              onClick={() => togglePerson(person.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-1.5 rounded-full font-medium transition-all active:scale-[0.97] ${
                isCompact ? 'py-1 pl-1 pr-2.5 text-xs' : 'py-1.5 pl-1.5 pr-3.5 text-sm'
              } ${
                isSelected
                  ? `${palette.solid} shadow-sm`
                  : 'bg-sunken text-ink-soft hover:bg-line'
              }`}
            >
              <Avatar
                name={person.name}
                personId={person.id}
                size={isCompact ? 'xs' : 'sm'}
                inverted={isSelected}
              />
              {person.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
