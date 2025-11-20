import type { Product } from "./Product";
export type CartItem = {
  id: string;
  product: Product;
  qty: number;
};

export type CartTotals = {
  itemsCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
};