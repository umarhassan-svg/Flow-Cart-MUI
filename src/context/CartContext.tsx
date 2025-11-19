// src/context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "../services/product.service";

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
interface CartData {
  items: CartItem[];
  cart: CartItem[];
}

const FREE_SHIPPING_OVER = 50;
const SHIPPING_COST = 6.99;
const TAX_RATE = 0.08;

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totals: CartTotals;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "flowcart_cart_v1";

/**
 * Parse and normalize whatever is stored in localStorage into an array of CartItem.
 * Supports:
 *  - [] (already correct)
 *  - [{...}, ...] (already correct)
 *  - { items: [...] } (legacy)
 *  - { cart: [...] } (legacy)
 *  - { id1: {...}, id2: {...} } (object keyed by id)
 * If parsing fails or shape unexpected -> return []
 */
function normalizeStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (parsed && typeof parsed === "object") {
      if (Array.isArray((parsed as CartData).items))
        return (parsed as CartData).items;
      if (Array.isArray((parsed as CartData).cart))
        return (parsed as CartData).cart;

      // object keyed by id -> convert to values
      const values = Object.values(parsed);
      if (values.length && values.every((v) => v && typeof v === "object")) {
        // attempt to verify shape by checking for id/product/qty keys
        if (
          (values as CartItem[]).every(
            (v: CartItem) =>
              ("id" in v && "product" in v && "qty" in v) ||
              ("product" in v && "qty" in v)
          )
        ) {
          return values as CartItem[];
        }
      }
    }
  } catch (err) {
    // fallthrough -> return []
    console.log(err);
    // console.debug intentionally omitted to keep localStorage parse quiet in prod
  }

  // fallback
  return [];
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // initial state: parse + normalize
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return normalizeStoredCart(raw);
    } catch {
      return [];
    }
  });

  // If the stored value had an unexpected shape, normalize and persist it on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const normalized = normalizeStoredCart(raw);
      // if local storage has something but normalization changed it, overwrite with normalized array
      if (raw && !Array.isArray(JSON.parse(raw))) {
        // migration — persist normalized array and log for developer
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        setItems(normalized);
        // eslint-disable-next-line no-console
        console.warn(
          "[CartProvider] migrated legacy/invalid cart shape to normalized array."
        );
      }
    } catch {
      // ignore any parse error and stick with current state
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist on every items change
  //   useEffect(() => {
  //     try {
  //     } catch {
  //       // ignore quota errors
  //     }
  //   }, [items]);

  const addToCart = (product: Product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          qty: Math.min((copy[idx].qty ?? 0) + qty, product.stock ?? 9999),
        };
        return copy;
      }
      const newItem: CartItem = {
        id: product.id,
        product,
        qty: Math.min(qty, product.stock ?? 9999),
      };
      return [newItem, ...prev];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const increment = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, qty: Math.min(it.qty + 1, it.product.stock ?? 9999) }
          : it
      )
    );
  };

  const decrement = (id: string) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it
        )
        .filter((it) => it.qty > 0)
    );
  };

  const setQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id !== id) return it;
          const allowed = Math.max(1, Math.min(qty, it.product.stock ?? 9999));
          return { ...it, qty: allowed };
        })
        .filter((it) => it.qty > 0)
    );
  };

  const clearCart = () => setItems([]);

  // totals: defensive — always treat `items` as array (guard against bad shapes)
  const totals = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];

    try {
      const subtotal = safeItems.reduce((sum, it) => {
        const price =
          (it &&
            it.product &&
            (it.product.discountPrice ?? it.product.price)) ??
          0;
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
    } catch (err) {
      // In the unlikely event something unexpected exists, return zeros (fail-safe)
      // eslint-disable-next-line no-console
      console.error("[CartProvider] error computing totals:", err);
      return {
        itemsCount: 0,
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: 0,
      };
    }
  }, [items]);

  const ctx: CartContextValue = {
    items,
    addToCart,
    removeFromCart,
    increment,
    decrement,
    setQty,
    clearCart,
    totals,
  };

  return <CartContext.Provider value={ctx}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
