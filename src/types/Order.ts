import type { CartItem } from "./Cart";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "fulfilled"
  | "shipped"
  | "cancelled";

export type PaymentInfo = {
  gateway: string;
  status: string;
  amount: number;
  currency: string;
  txnId?: string;
  paidAt?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  date: string; // ISO
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  status: OrderStatus;
  items: CartItem[]; // uses CartItem (product + qty)
  total: number;
  currency: string;
  payment?: PaymentInfo;
  assignedTo?: string;
  internalNotes?: string;
};

export const ORDER_STATUS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "fulfilled",
  "shipped",
  "cancelled",
];
