// src/store/hooks/useCart.ts
import { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../index";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  increment as incrementAction,
  decrement as decrementAction,
  setQty as setQtyAction,
  clearCart as clearCartAction,
  setItems as setItemsAction,
  STORAGE_KEY,
  FREE_SHIPPING_OVER,
  SHIPPING_COST,
  TAX_RATE,
} from "../slices/cartSlice";
import type { Product } from "../../types/Product";
import type { CartItem, CartTotals } from "../../types/Cart";

/**
 * useCart hook — exposes same API shape as your original CartContext:
 * {
 *   items, addToCart, removeFromCart, increment, decrement, setQty, clearCart, totals
 * }
 */
export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((s: RootState) => s.cart.items ?? []);

  // migrate legacy localStorage shape if present (only once)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // if a non-array legacy shape exists, normalize + overwrite Redux state
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          dispatch(setItemsAction(JSON.parse(raw)));
        }
      }
    } catch {
      // ignore
    }
    // run only once (lint disabled because dispatch stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist to localStorage for backward-compat & migration (optional if using redux-persist)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items ?? []));
    } catch {
      // ignore quota errors
    }
  }, [items]);

  const addToCart = (product: Product, qty = 1) =>
    dispatch(addToCartAction({ product, qty }));

  const removeFromCart = (id: string) => dispatch(removeFromCartAction(id));
  const increment = (id: string) => dispatch(incrementAction(id));
  const decrement = (id: string) => dispatch(decrementAction(id));
  const setQty = (id: string, qty: number) =>
    dispatch(setQtyAction({ id, qty }));
  const clearCart = () => dispatch(clearCartAction());

  // totals computation (same rules as before)
  const totals: CartTotals = useMemo(() => {
    const safeItems: CartItem[] = Array.isArray(items) ? items : [];

    const subtotal = safeItems.reduce((sum, it) => {
      const price =
        (it && it.product && (it.product.discountPrice ?? it.product.price)) ?? 0;
      const qty = (it && it.qty) ?? 0;
      return sum + price * qty;
    }, 0);

    const itemsCount = safeItems.reduce((s, it) => s + (it.qty ?? 0), 0);

    const shipping =
      subtotal >= FREE_SHIPPING_OVER || itemsCount === 0 ? 0 : SHIPPING_COST;
    const tax = subtotal * TAX_RATE;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

    return {
      itemsCount: Math.max(0, Math.floor(itemsCount)),
      subtotal: round(subtotal),
      shipping: round(shipping),
      tax: round(tax),
      discount: round(discount),
      total: round(total),
    };
  }, [items]);

  return {
    items,
    addToCart,
    removeFromCart,
    increment,
    decrement,
    setQty,
    clearCart,
    totals,
  };
};

export default useCart;
