// In-memory orders service for local dev / tests.
// Replace with real API in production.

import type { Order, OrderStatus } from "../types/Order";
import type { Product } from "../types/Product";
import type { CartItem } from "../types/Cart";


const generateId = (prefix = "ord") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

// Small helper product fixture generator (for demo only)
const makeProduct = (i: number): Product => ({
  id: `prod_${i}`,
  title: `Product ${i}`,
  price: 10 + i,
  currency: "USD",
  images: [],
  stock: 100,
});

// Starter orders array
const ORDERS: Order[] = Array.from({ length: 8 }).map((_, i) => {
  const items: CartItem[] = [
    { id: `ci_${i}_1`, product: makeProduct(i * 2 + 1), qty: 1 + (i % 3) },
    { id: `ci_${i}_2`, product: makeProduct(i * 2 + 2), qty: 1 },
  ];
  const total = items.reduce((s, it) => s + (it.product.discountPrice ?? it.product.price) * it.qty, 0);
  const status: OrderStatus = i % 4 === 0 ? "fulfilled" : i % 3 === 0 ? "processing" : "pending";

  return {
    id: generateId(),
    orderNumber: `#100${i + 1}`,
    date: new Date(Date.now() - i * 86400000).toISOString(),
    customerId: `c_${i + 1}`,
    customerName: `Customer ${i + 1}`,
    customerEmail: `customer${i + 1}@example.com`,
    status,
    items,
    total,
    currency: "USD",
    payment: { gateway: "stripe", status: i % 2 === 0 ? "paid" : "pending", amount: total, currency: "USD", txnId: `txn_${i}`, paidAt: new Date().toISOString() },
    internalNotes: "",
  };
});

// shallow clone helper
const clone = <T,>(v: T) => JSON.parse(JSON.stringify(v)) as T;

export const ordersService = {
  getAll: async (): Promise<Order[]> => {
        // In real world: support pagination/filters
    return Promise.resolve(clone(ORDERS));
  },

  getById: async (id: string): Promise<Order | undefined> => {
    const found = ORDERS.find((o) => o.id === id);
    return Promise.resolve(found ? clone(found) : undefined);
  },

  create: async (partial: Partial<Order>): Promise<Order> => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      id: generateId(),
      orderNumber: partial.orderNumber ?? `#${Math.floor(Math.random() * 900000) + 100000}`,
      date: partial.date ?? now,
      customerId: partial.customerId,
      customerName: partial.customerName ?? "",
      customerEmail: partial.customerEmail ?? "",
      status: (partial.status ?? "pending") as OrderStatus,
      items: (partial.items ?? []) as Order["items"],
      total: partial.total ?? (partial.items ? partial.items.reduce((s, it) => s + ((it.product.discountPrice ?? it.product.price) * it.qty), 0) : 0),
      currency: partial.currency ?? "USD",
      payment: partial.payment,
      assignedTo: partial.assignedTo,
      internalNotes: partial.internalNotes,
    };
    ORDERS.unshift(newOrder);
    return Promise.resolve(clone(newOrder));
  },

  update: async (id: string, patch: Partial<Order>): Promise<Order | undefined> => {
    const idx = ORDERS.findIndex((o) => o.id === id);
    if (idx === -1) return Promise.resolve(undefined);
    ORDERS[idx] = { ...ORDERS[idx], ...patch };
    return Promise.resolve(clone(ORDERS[idx]));
  },

  delete: async (id: string): Promise<boolean> => {
    const idx = ORDERS.findIndex((o) => o.id === id);
    if (idx === -1) return Promise.resolve(false);
    ORDERS.splice(idx, 1);
    return Promise.resolve(true);
  },

  cancel: async (id: string): Promise<Order | undefined> => {
    const o = ORDERS.find((x) => x.id === id);
    if (!o) return Promise.resolve(undefined);
    o.status = "cancelled";
    return Promise.resolve(clone(o));
  },

  fulfill: async (id: string): Promise<Order | undefined> => {
    const o = ORDERS.find((x) => x.id === id);
    if (!o) return Promise.resolve(undefined);
    o.status = "fulfilled";
    return Promise.resolve(clone(o));
  },

  // test helper
  __replaceAllForTests: (arr: Order[]) => {
    ORDERS.length = 0;
    ORDERS.push(...arr.map((a) => ({ ...a })));
  },
};
