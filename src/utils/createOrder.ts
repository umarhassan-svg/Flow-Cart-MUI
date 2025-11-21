// src/services/createOrder.ts
import { ordersService } from "../services/orders.service";
import type { Order, PaymentInfo } from "../types/Order";
import type { CartItem, CartTotals } from "../types/Cart";

/**
 * Checkout / create-order helpers
 */

// Shipping address shape used by the checkout form
export type ShippingAddress = {
  address1: string;
  address2?: string;
  city: string;
  zipCode: string;
  country: string;
};

// Minimal checkout payload coming from the checkout form
export type CheckoutPayload = {
  userId?: string;
  email: string;
  fullName: string;
  shipping: ShippingAddress;
  paymentMethod: string; // e.g. "visa", "stripe", "paypal", etc
  // Card fields (only used for client-side validation / simulation here)
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  notes?: string; // optional internal notes
};

/**
 * Basic helper to generate a short transaction id for demo/testing.
 * In a real app, this comes from the payment gateway.
 */
function generateTxnId(): string {
  return `txn_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Very small card validation for demo purposes.
 * Replace with proper validator / payment SDK in production.
 */
function validateCard(cardNumber?: string, expiry?: string, cvc?: string) {
  if (!cardNumber || !expiry || !cvc) {
    return { ok: false, reason: "Missing card details" };
  }
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12) return { ok: false, reason: "Card number too short" };
  if (!/^\d{3,4}$/.test(cvc)) return { ok: false, reason: "Invalid CVC" };
  // expiry basic check MM/YY or MM/YYYY
  if (!/^\d{2}\/\d{2,4}$/.test(expiry)) return { ok: false, reason: "Invalid expiry format" };
  return { ok: true };
}

/**
 * The main exported function:
 * Builds an Order partial from the checkout payload + cart, validates the payload,
 * simulates a payment (for the demo) and calls ordersService.create.
 *
 * Returns the created Order from the backend (or throws an Error).
 */
export async function createOrderFromCheckout(
  payload: CheckoutPayload,
  items: CartItem[],
  totals: CartTotals,
  options?: { currency?: string }
): Promise<Order> {
  // Basic validations
  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }
  if (!payload) throw new Error("Missing payload");
  if (!payload.email || !payload.fullName) {
    throw new Error("Customer name and email are required");
  }
  const { shipping } = payload;
  if (!shipping || !shipping.address1 || !shipping.city || !shipping.zipCode || !shipping.country) {
    throw new Error("Complete shipping address is required");
  }

  // Card validation - if using card payment method, validate card fields
  if (payload.paymentMethod === "visa" || payload.paymentMethod === "card") {
    const cardCheck = validateCard(payload.cardNumber, payload.expiry, payload.cvc);
    if (!cardCheck.ok) {
      throw new Error(`Payment validation failed: ${cardCheck.reason}`);
    }
  }

  // Build a human-readable internalNotes string that includes shipping details
  const internalNotes = [
    `Shipping: ${shipping.address1}${shipping.address2 ? ", " + shipping.address2 : ""}`,
    `${shipping.city}, ${shipping.zipCode}, ${shipping.country}`,
    payload.notes ? `Note: ${payload.notes}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  // Simulate payment result (demo only).
  // In production you would call a payment gateway and include returned txn id / status.
  const currency = options?.currency ?? "USD";
  const payment: PaymentInfo = {
    gateway: payload.paymentMethod || "card",
    status: "paid", // optimistic success for demo
    amount: totals.total,
    currency,
    txnId: generateTxnId(),
    paidAt: new Date().toISOString(),
  };

  // Build the partial order object expected by the backend.
    // The backend is responsible for generating id, date, orderNumber, etc.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const orderPartial: Partial<Order> = {
        customerId: payload.userId,
    customerName: payload.fullName,
    customerEmail: payload.email,
    status: "pending", // you may choose 'confirmed' after successful payment
    items: items,
    total: totals.total,
    currency,
    payment,
    internalNotes,
  };

  // Call the orders service to create the order
  try {
    const created = await ordersService.create(orderPartial);
    return created;
  } catch (err) {
    // If payment was "processed" but order create failed, you'd want to handle that case
    // (refund / mark payment as failed) — for demo we just rethrow with a helpful message.
    console.error("Failed to create order:", err);
    throw new Error("Failed to create order. " + (err instanceof Error ? err.message : ""));
  }
}
