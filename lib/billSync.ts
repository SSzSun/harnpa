import { ref, set, onValue, off, get } from 'firebase/database';
import { database } from './firebase';

type Person = {
  id: string;
  name: string;
  phone?: string;
};

type Item = {
  id: string;
  name: string;
  price: number;
  payerId: string;
  sharedBy: string[];
  createdAt?: number;
};

type Payment = {
  from: string;
  to: string;
  amount: number;
  paid: boolean;
};

export type BillData = {
  billName: string;
  people: Person[];
  items: Item[];
  payments: Payment[];
  updatedAt: number;
};

function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function saveBillToFirebase(billId: string, data: BillData): Promise<void> {
  const billRef = ref(database, `bills/${billId}`);
  return set(billRef, stripUndefined({ ...data, updatedAt: Date.now() }));
}

export function subscribeToBill(
  billId: string,
  callback: (data: BillData | null) => void
): () => void {
  const billRef = ref(database, `bills/${billId}`);

  onValue(billRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });

  return () => off(billRef);
}

export async function loadBillFromFirebase(billId: string): Promise<BillData | null> {
  const billRef = ref(database, `bills/${billId}`);
  const snapshot = await get(billRef);
  return snapshot.val();
}
