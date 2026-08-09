'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatMoney } from '@/lib/format';

type Person = {
  id: string;
  name: string;
  phone?: string;
};

type Payment = {
  from: string;
  to: string;
  amount: number;
  paid: boolean;
};

type PaymentDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  people: Person[];
  onTogglePaid: () => void;
};

function PersonRow({
  role,
  person,
}: {
  role: string;
  person: Person | undefined;
}) {
  return (
    <div className="rounded-2xl bg-sunken p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {role}
      </div>
      <div className="flex items-center gap-3">
        <Avatar name={person?.name ?? '?'} personId={person?.id ?? ''} size="md" />
        <div className="min-w-0">
          <div className="truncate font-semibold text-ink">{person?.name}</div>
          {person?.phone && (
            <a
              href={`tel:${person.phone}`}
              className="text-sm tabular-nums text-brand-strong underline-offset-2 hover:underline"
            >
              {person.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentDetailModal({
  isOpen,
  onClose,
  payment,
  people,
  onTogglePaid,
}: PaymentDetailModalProps) {
  const t = useTranslations();

  if (!payment) return null;

  const payer = people.find(p => p.id === payment.from);
  const receiver = people.find(p => p.id === payment.to);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('summary.transferDetails')}
      closeLabel={t('common.close')}
      footer={
        <Button
          variant={payment.paid ? 'secondary' : 'primary'}
          fullWidth
          size="lg"
          onClick={onTogglePaid}
        >
          {payment.paid ? t('summary.markUnpaid') : t('summary.markPaid')}
        </Button>
      }
    >
      <div className="space-y-3">
        <PersonRow role={t('summary.payer')} person={payer} />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <div className="flex items-center gap-2 rounded-full bg-brand-tint px-4 py-2">
            <svg
              className="h-4 w-4 shrink-0 text-brand-strong"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            <span className="text-lg font-bold tabular-nums text-ink">
              {formatMoney(payment.amount)} ฿
            </span>
          </div>
          <div className="h-px flex-1 bg-line" />
        </div>

        <PersonRow role={t('summary.receiver')} person={receiver} />

        <div
          className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
            payment.paid
              ? 'bg-positive-tint text-positive'
              : 'bg-sunken text-ink-soft'
          }`}
        >
          {payment.paid && (
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {payment.paid ? t('summary.paid') : t('summary.unpaid')}
        </div>
      </div>
    </Modal>
  );
}
