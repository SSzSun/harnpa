export type Person = {
  id: string;
  name: string;
};

export type Item = {
  id: string;
  name: string;
  price: number;
  payerId: string;
  sharedBy: string[];
  note?: string;
  createdAt?: number;
};

export type Payment = {
  from: string;
  to: string;
  amount: number;
  paid: boolean;
};

/** Amounts below this are treated as settled — guards against float dust. */
const EPSILON = 0.01;

export type Balance = {
  /** Total this person fronted for the group. */
  paidFirst: number;
  /** Total share of items they consumed. */
  owes: number;
  /** Positive means the group owes them. */
  net: number;
};

export function computeBalance(items: Item[], personId: string): Balance {
  let paidFirst = 0;
  let owes = 0;

  for (const item of items) {
    if (item.payerId === personId) {
      paidFirst += item.price;
    }
    if (item.sharedBy.length > 0 && item.sharedBy.includes(personId)) {
      owes += item.price / item.sharedBy.length;
    }
  }

  return { paidFirst, owes, net: paidFirst - owes };
}

/**
 * Greedy settlement: repeatedly match the largest creditor against the largest
 * debtor. Produces at most (people - 1) transfers, which is the minimum for the
 * general case.
 *
 * `people` is required so that removing a person drops the payments that
 * referenced them instead of leaving rows pointing at a missing id.
 * `previousPayments` only carries the `paid` flags forward.
 */
export function computeSettlement(
  items: Item[],
  people: Person[],
  previousPayments: Payment[] = []
): Payment[] {
  const known = new Set(people.map(p => p.id));
  const balances = new Map<string, number>();
  for (const person of people) balances.set(person.id, 0);

  for (const item of items) {
    const sharers = item.sharedBy.filter(id => known.has(id));
    if (sharers.length === 0 || !known.has(item.payerId)) continue;

    const share = item.price / sharers.length;
    for (const id of sharers) {
      balances.set(id, (balances.get(id) ?? 0) - share);
    }
    balances.set(item.payerId, (balances.get(item.payerId) ?? 0) + item.price);
  }

  // Largest amounts first so the greedy match clears whole debts early.
  const creditors = [...balances.entries()]
    .filter(([, amt]) => amt > EPSILON)
    .sort((a, b) => b[1] - a[1]);
  const debtors = [...balances.entries()]
    .filter(([, amt]) => amt < -EPSILON)
    .sort((a, b) => a[1] - b[1]);

  const payments: Payment[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const [creditorId, credit] = creditors[i];
    const [debtorId, debt] = debtors[j];
    const amount = Math.min(credit, -debt);

    const previous = previousPayments.find(
      p => p.from === debtorId && p.to === creditorId
    );

    payments.push({
      from: debtorId,
      to: creditorId,
      amount,
      paid: previous?.paid ?? false,
    });

    creditors[i][1] = credit - amount;
    debtors[j][1] = debt + amount;

    if (creditors[i][1] <= EPSILON) i++;
    if (debtors[j][1] >= -EPSILON) j++;
  }

  return payments;
}
