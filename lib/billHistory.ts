export type BillHistoryItem = {
  billId: string;
  billName: string;
  lastAccessed: number;
  totalAmount: number;
  peopleCount: number;
  itemsCount: number;
};

const HISTORY_KEY = 'bill-history';

export function getBillHistory(): BillHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load bill history:', err);
    return [];
  }
}

export function addToBillHistory(item: BillHistoryItem): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getBillHistory();
    const existingIndex = history.findIndex(h => h.billId === item.billId);

    if (existingIndex >= 0) {
      history[existingIndex] = item;
    } else {
      history.push(item);
    }

    history.sort((a, b) => b.lastAccessed - a.lastAccessed);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save bill history:', err);
  }
}

export function removeBillFromHistory(billId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getBillHistory();
    const filtered = history.filter(h => h.billId !== billId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to remove from bill history:', err);
  }
}
