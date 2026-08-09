'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ItemModal } from '@/components/ItemModal';
import { PaymentDetailModal } from '@/components/PaymentDetailModal';
import { PersonModal } from '@/components/PersonModal';
import { ItemsList } from '@/components/bill/ItemsList';
import { PeopleList } from '@/components/bill/PeopleList';
import { StatCards } from '@/components/bill/StatCards';
import { SummaryList } from '@/components/bill/SummaryList';
import { AppHeader } from '@/components/ui/AppHeader';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { Toast } from '@/components/ui/Toast';
import { Footer } from '@/components/ui/Footer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { addToBillHistory } from '@/lib/billHistory';
import { saveBillToFirebase, subscribeToBill } from '@/lib/billSync';
import {
  computeSettlement,
  type Item,
  type Payment,
  type Person,
} from '@/lib/settlement';

type TabId = 'people' | 'items' | 'summary';

type BillState = {
  billName: string;
  people: Person[];
  items: Item[];
  payments: Payment[];
};

const EMPTY: BillState = { billName: '', people: [], items: [], payments: [] };

/**
 * Content fingerprint, deliberately excluding `updatedAt`. Two tabs open on the
 * same bill would otherwise ping-pong forever: every write bumps the timestamp,
 * the peer reads it as a change, writes back, and round it goes.
 */
function fingerprint(state: BillState): string {
  return JSON.stringify([state.billName, state.people, state.items, state.payments]);
}

const EMPTY_PRINT = fingerprint(EMPTY);

function PanelSkeleton() {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-sunken" />
      ))}
    </div>
  );
}

export default function BillPage() {
  const t = useTranslations();
  const billId = useParams().id as string;

  const [state, setState] = useState<BillState>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('people');

  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [openPayment, setOpenPayment] = useState<Payment | null>(null);
  const [toast, setToast] = useState('');

  // Fingerprint of whatever Firebase last confirmed, so we can tell a genuine
  // local edit from an echo of our own write.
  const syncedRef = useRef(EMPTY_PRINT);

  // `onValue` fires once with the current value on attach, so this both loads
  // and subscribes. A separate get() would race against it.
  useEffect(() => {
    const unsubscribe = subscribeToBill(billId, remote => {
      const next: BillState = {
        billName: remote?.billName ?? '',
        people: remote?.people ?? [],
        items: remote?.items ?? [],
        payments: remote?.payments ?? [],
      };
      const print = fingerprint(next);

      // Our own write coming back: record it, but don't stomp local state and
      // risk yanking the caret out of the name field mid-typing.
      if (print !== syncedRef.current) {
        syncedRef.current = print;
        setState(next);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [billId]);

  // Debounced write. Typing a bill name used to fire one request per keystroke.
  useEffect(() => {
    if (isLoading) return;

    const print = fingerprint(state);
    if (print === syncedRef.current) return;

    const timer = setTimeout(() => {
      syncedRef.current = print;
      saveBillToFirebase(billId, { ...state, updatedAt: Date.now() }).catch(err => {
        // Let the next edit retry rather than dropping the user's work silently.
        syncedRef.current = '';
        console.error('Failed to save bill:', err);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [billId, state, isLoading]);

  const totalAmount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.price, 0),
    [state.items]
  );

  // Local history index, so the home page can list this bill again.
  useEffect(() => {
    if (isLoading) return;
    if (fingerprint(state) === EMPTY_PRINT) return;

    addToBillHistory({
      billId,
      billName: state.billName.trim() || t('bill.untitled'),
      lastAccessed: Date.now(),
      totalAmount,
      peopleCount: state.people.length,
      itemsCount: state.items.length,
    });
  }, [billId, state, totalAmount, isLoading, t]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  /**
   * Single funnel for people/items edits. Payments are derived data, so they get
   * recomputed here rather than at each call site — the old code recalculated on
   * item edits but not on person deletes, leaving payments pointing at ids that
   * no longer existed.
   */
  const applyEdit = useCallback(
    (edit: (current: BillState) => Pick<BillState, 'people' | 'items'>) => {
      setState(current => {
        const { people, items } = edit(current);
        return {
          ...current,
          people,
          items,
          payments: computeSettlement(items, people, current.payments),
        };
      });
    },
    []
  );

  const savePerson = (person: Person) =>
    applyEdit(({ people, items }) => ({
      items,
      people: people.some(p => p.id === person.id)
        ? people.map(p => (p.id === person.id ? person : p))
        : [...people, person],
    }));

  const deletePerson = (personId: string) =>
    applyEdit(({ people, items }) => ({
      people: people.filter(p => p.id !== personId),
      // Drop items they alone shared; otherwise just remove them from the split.
      items: items
        .filter(item => item.payerId !== personId)
        .map(item => ({
          ...item,
          sharedBy: item.sharedBy.filter(id => id !== personId),
        }))
        .filter(item => item.sharedBy.length > 0),
    }));

  const saveItem = (item: Item) =>
    applyEdit(({ people, items }) => ({
      people,
      items: items.some(i => i.id === item.id)
        ? items.map(i => (i.id === item.id ? item : i))
        : [...items, item],
    }));

  const deleteItem = (itemId: string) =>
    applyEdit(({ people, items }) => ({
      people,
      items: items.filter(i => i.id !== itemId),
    }));

  const deleteMultipleItems = (itemIds: string[]) =>
    applyEdit(({ people, items }) => ({
      people,
      items: items.filter(i => !itemIds.includes(i.id)),
    }));

  const togglePaid = (target: Payment) =>
    setState(current => ({
      ...current,
      payments: current.payments.map(p =>
        p.from === target.from && p.to === target.to ? { ...p, paid: !p.paid } : p
      ),
    }));

  const shareBill = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ url, title: state.billName || t('bill.untitled') });
        return;
      } catch {
        // Dismissed the share sheet, or it's unavailable — fall through to copy.
      }
    }

    // Fallback for iOS Safari without HTTPS: use a temporary textarea
    if (!navigator.clipboard) {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setToast(t('bill.linkCopied'));
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
      document.body.removeChild(textarea);
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setToast(t('bill.linkCopied'));
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const tabs = [
    { id: 'people' as const, label: t('tabs.people') },
    { id: 'items' as const, label: t('tabs.items') },
    { id: 'summary' as const, label: t('tabs.summary') },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <AppHeader
        appName={state.billName.trim() || t('bill.untitled')}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={shareBill}
              aria-label={t('bill.share')}
              className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-sunken"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <ThemeToggle />
            <LocaleSwitcher label={t('common.language')} />
          </div>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20">
        <section className="mb-5">
          <label htmlFor="bill-name" className="sr-only">
            {t('bill.name')}
          </label>
          <input
            id="bill-name"
            type="text"
            value={state.billName}
            onChange={e => setState(s => ({ ...s, billName: e.target.value }))}
            placeholder={t('bill.namePlaceholder')}
            className="w-full border-0 bg-transparent px-0 py-2 text-2xl font-bold tracking-tight text-ink placeholder:text-ink-faint focus:outline-none focus:ring-0 sm:text-3xl"
          />
        </section>

        <section className="mb-6">
          <StatCards
            itemsCount={state.items.length}
            totalAmount={totalAmount}
            peopleCount={state.people.length}
          />
        </section>

        <section>
          <SegmentedTabs
            tabs={tabs}
            active={activeTab}
            onChange={id => setActiveTab(id as TabId)}
            idPrefix="bill-tabs"
          />

          <div className="mt-5">
            {isLoading ? (
              <PanelSkeleton />
            ) : activeTab === 'people' ? (
              <PeopleList
                people={state.people}
                items={state.items}
                onSelect={person => {
                  setEditingPerson(person);
                  setIsPersonModalOpen(true);
                }}
                onAdd={() => {
                  setEditingPerson(null);
                  setIsPersonModalOpen(true);
                }}
              />
            ) : activeTab === 'items' ? (
              <ItemsList
                items={state.items}
                people={state.people}
                onSelect={item => {
                  setEditingItem(item);
                  setIsItemModalOpen(true);
                }}
                onAdd={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                onAddPerson={() => {
                  setEditingPerson(null);
                  setIsPersonModalOpen(true);
                }}
                onDeleteMultiple={deleteMultipleItems}
              />
            ) : (
              <SummaryList
                payments={state.payments}
                people={state.people}
                hasItems={state.items.length > 0}
                onSelect={setOpenPayment}
                onTogglePaid={togglePaid}
              />
            )}
          </div>
        </section>
      </main>

      <PersonModal
        isOpen={isPersonModalOpen}
        person={editingPerson}
        onClose={() => setIsPersonModalOpen(false)}
        onSave={savePerson}
        onDelete={editingPerson ? () => deletePerson(editingPerson.id) : undefined}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        item={editingItem}
        people={state.people}
        onClose={() => setIsItemModalOpen(false)}
        onSave={saveItem}
        onDelete={editingItem ? () => deleteItem(editingItem.id) : undefined}
      />

      {openPayment && (
        <PaymentDetailModal
          isOpen
          payment={openPayment}
          people={state.people}
          onClose={() => setOpenPayment(null)}
          onTogglePaid={() => togglePaid(openPayment)}
        />
      )}

      {toast && <Toast message={toast} show />}

      <Footer />
    </div>
  );
}

