'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

type Person = {
  id: string;
  name: string;
};

type PersonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: { id: string; name: string }) => void;
  onDelete?: () => void;
  person?: Person | null;
};

export function PersonModal({ isOpen, onClose, onSave, onDelete, person }: PersonModalProps) {
  const t = useTranslations();
  const [name, setName] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setName(person?.name ?? '');
    setConfirmingDelete(false);
  }, [person, isOpen]);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: person?.id || Date.now().toString(),
      name: name.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={person ? t('person.edit') : t('bill.addPerson')}
      closeLabel={t('common.close')}
      footer={
        confirmingDelete ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-soft">{t('person.deleteConfirm')}</p>
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
                {t('person.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            {person && onDelete && (
              <Button variant="dangerGhost" onClick={() => setConfirmingDelete(true)}>
                {t('person.delete')}
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
      <TextField
        label={t('person.name')}
        required
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={t('person.namePlaceholder')}
        autoComplete="off"
        onKeyDown={e => {
          if (e.key === 'Enter' && canSave) handleSave();
        }}
      />
    </Modal>
  );
}
