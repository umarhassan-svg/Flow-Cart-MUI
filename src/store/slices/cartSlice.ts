/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/slices/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types/Product";
import type { CartItem } from "../../types/Cart";

/**
 * Keep the same migration/normalization logic as your original context
 * so older shapes / legacy persisted data are handled.
 */
const STORAGE_KEY = "flowcart_cart_v1";

function normalizeStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parsed;

    if (parsed && typeof parsed === "object") {
      if (Array.isArray((parsed as any).items)) return (parsed as any).items;
      if (Array.isArray((parsed as any).cart)) return (parsed as any).cart;

      const values = Object.values(parsed);
      if (
        values.length &&
        values.every((v) => v && typeof v === "object") &&
        values.every(
          (v: any) =>
            ("id" in v && "product" in v && "qty" in v) ||
            ("product" in v && "qty" in v)
        )
      ) {
        return values as CartItem[];
      }
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

/* Constants from your original context */
const FREE_SHIPPING_OVER = 50;
const SHIPPING_COST = 6.99;
const TAX_RATE = 0.08;

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: normalizeStoredCart(
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
  ),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // fully replace items list (internal usage / migration)
    setItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },

    addToCart(
      state,
      action: PayloadAction<{ product: Product; qty?: number }>
    ) {
      const { product, qty = 1 } = action.payload;
      const idx = state.items.findIndex((i) => i.id === product.id);
      const max = product.stock ?? 9999;
      if (idx >= 0) {
        state.items[idx].qty = Math.min((state.items[idx].qty ?? 0) + qty, max);
      } else {
        state.items.unshift({
          id: product.id,
          product,
          qty: Math.min(qty, max),
        });
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    increment(state, action: PayloadAction<string>) {
      state.items = state.items.map((it) =>
        it.id === action.payload
          ? { ...it, qty: Math.min(it.qty + 1, it.product.stock ?? 9999) }
          : it
      );
    },

    decrement(state, action: PayloadAction<string>) {
      state.items = state.items
        .map((it) =>
          it.id === action.payload
            ? { ...it, qty: Math.max(1, it.qty - 1) }
            : it
        )
        .filter((it) => it.qty > 0);
    },

    setQty(
      state,
      action: PayloadAction<{
        id: string;
        qty: number;
      }>
    ) {
      state.items = state.items
        .map((it) => {
          if (it.id !== action.payload.id) return it;
          const allowed = Math.max(
            1,
            Math.min(action.payload.qty, it.product.stock ?? 9999)
          );
          return { ...it, qty: allowed };
        })
        .filter((it) => it.qty > 0);
    },

    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  setItems,
  addToCart,
  removeFromCart,
  increment,
  decrement,
  setQty,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

/* Export some constants for external use if needed */
export { FREE_SHIPPING_OVER, SHIPPING_COST, TAX_RATE, STORAGE_KEY };
