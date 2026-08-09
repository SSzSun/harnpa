'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { PersonChip } from '@/components/PersonChip';
import { formatMoney } from '@/lib/format';

type Person = {
  id: string;
  name: string;
};

type Item = {
  id: string;
  name: string;
  price: number;
  payerId: string;
  sharedBy: string[];
  note?: string;
  createdAt?: number;
};

type ItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: {
    id: string;
    name: string;
    price: number;
    payerId: string;
    sharedBy: string[];
    note?: string;
    createdAt: number;
  }) => void;
  onDelete?: () => void;
  people: Person[];
  item?: Item | null;
};

const NAME_LIMIT = 40;
const NOTE_LIMIT = 100;

export function ItemModal({ isOpen, onClose, onSave, onDelete, people, item }: ItemModalProps) {
  const t = useTranslations();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [payerId, setPayerId] = useState('');
  const [sharedBy, setSharedBy] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price.toString());
      setPayerId(item.payerId);
      setSharedBy(item.sharedBy);
      setNote(item.note ?? '');
    } else {
      setName('');
      setPrice('');
      setPayerId('');
      setSharedBy(people.map(p => p.id));
      setNote('');
    }
    setConfirmingDelete(false);
  }, [item, isOpen, people]);

  const parsedPrice = parseFloat(price);
  const priceIsValid = Number.isFinite(parsedPrice) && parsedPrice > 0;
  const canSave = priceIsValid && payerId !== '' && sharedBy.length > 0;
  const perPerson = sharedBy.length > 0 && priceIsValid ? parsedPrice / sharedBy.length : 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: item?.id || Date.now().toString(),
      name: name.trim() || t('item.untitled'),
      price: parsedPrice,
      payerId,
      sharedBy,
      note: note.trim() || undefined,
      createdAt: item?.createdAt ?? Date.now(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? t('item.edit') : t('bill.addItem')}
      closeLabel={t('common.close')}
      size="lg"
      footer={
        confirmingDelete ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft">{t('item.deleteConfirm')}</p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmingDelete(false)}>
                {t('bill.cancel')}
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={() => {
                  onDelete?.();
                  onClose();
                }}
              >
                {t('item.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            {item && onDelete && (
              <Button variant="dangerGhost" onClick={() => setConfirmingDelete(true)}>
                {t('item.delete')}
              </Button>
            )}
            <Button variant="secondary" className="flex-1 whitespace-nowrap" onClick={onClose}>
              {t('bill.cancel')}
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={!canSave}>
              {t('bill.save')}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5">
        <TextField
          label={t('item.name')}
          value={name}
          onChange={e => setName(e.target.value.slice(0, NAME_LIMIT))}
          placeholder={t('item.namePlaceholder')}
          counter={`${[...name].length} / ${NAME_LIMIT}`}
          autoComplete="off"
        />

        <TextField
          label={t('item.note')}
          value={note}
          onChange={e => setNote(e.target.value.slice(0, NOTE_LIMIT))}
          placeholder={t('item.notePlaceholder')}
          counter={`${[...note].length} / ${NOTE_LIMIT}`}
          autoComplete="off"
        />

        <TextField
          label={t('item.price')}
          required
          type="text"
          inputMode="decimal"
          value={price}
          onChange={e => {
            const val = e.target.value;
            if (val === '' || /^\d*\.?\d*$/.test(val)) {
              setPrice(val);
            }
          }}
          placeholder={t('item.pricePlaceholder')}
          suffix="฿"
        />

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-ink">
              {t('item.sharedBy')} <span className="text-negative">*</span>
            </span>
            {sharedBy.length > 0 && priceIsValid && (
              <span className="text-xs font-medium tabular-nums text-ink-soft">
                {t('item.perPerson', { amount: formatMoney(perPerson) })}
              </span>
            )}
          </div>
          <PersonChip
            people={people}
            selectedIds={sharedBy}
            onSelectionChange={setSharedBy}
            mode="multiple"
            showSelectAll
            selectAllLabel={t('item.selectAll')}
            clearAllLabel={t('item.clearAll')}
            groupLabel={t('item.sharedBy')}
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-ink">
            {t('item.payer')} <span className="text-negative">*</span>
          </span>
          <PersonChip
            people={people}
            selectedIds={payerId ? [payerId] : []}
            onSelectionChange={ids => setPayerId(ids[0] ?? '')}
            mode="single"
            groupLabel={t('item.payer')}
          />
        </div>
      </div>
    </Modal>
  );
}
