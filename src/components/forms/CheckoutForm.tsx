// src/components/checkout/CheckoutForm.tsx
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CustomDialogbox from "../ui/CustomDialogbox";
import CustomForm, { type Field } from "../ui/CustomForm";
import {
  createOrderFromCheckout,
  type CheckoutPayload,
} from "../../utils/createOrder";
import { useAuth } from "../../context/AuthContext";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
];
const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    amount ?? 0
  );

const CheckoutForm = () => {
  const { totals, items, clearCart } = useCart();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const { user } = useAuth();

  // Updated Fields with Sections
  const fields: Field[] = [
    // --- Section 1: Contact ---
    {
      name: "sec_contact",
      label: "Contact Information",
      type: "header", // NEW
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      width: 12,
    }, // Full width email
    { name: "fullName", label: "Full Name", required: true, width: 12 },

    // --- Section 2: Shipping ---
    {
      name: "sec_shipping",
      label: "Shipping Address",
      type: "header", // NEW
    },
    { name: "address1", label: "Address Line 1", required: true, width: 12 },
    {
      name: "address2",
      label: "Address Line 2 (Optional)",
      type: "text",
      width: 12,
    },
    { name: "city", label: "City", required: true, width: 6 },
    { name: "zipCode", label: "ZIP / Postal Code", required: true, width: 6 },
    {
      name: "country",
      label: "Country",
      type: "select",
      options: COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
      required: true,
      width: 12,
    },

    // --- Section 3: Payment ---
    {
      name: "sec_payment",
      label: "Payment Details",
      type: "header", // NEW
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      options: [
        { value: "card", label: "Credit / Debit Card" },
        { value: "paypal", label: "PayPal" },
      ],
      required: true,
      width: 12,
    },
    // Card fields (visual grouping 12, 6, 6)
    { name: "cardNumber", label: "Card Number", required: true, width: 12 },
    { name: "expiry", label: "Expiry (MM/YY)", required: true, width: 6 },
    { name: "cvc", label: "CVC / CVV", required: true, width: 6 },
  ];

  // Initial values
  const initialValues = {
    email: user?.email ?? "",
    country: "US",
    paymentMethod: "card",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleSubmit(values: Record<string, any>) {
    if (!items || items.length === 0) {
      setDialogMessage("Your cart is empty. Please add items to checkout.");
      setOpenDialog(true);
      throw new Error("Cart empty");
    }

    const payload: CheckoutPayload = {
      userId: user?.id,
      email: values.email,
      fullName: values.fullName,
      shipping: {
        address1: values.address1,
        address2: values.address2,
        city: values.city,
        zipCode: values.zipCode,
        country: values.country,
      },
      paymentMethod: values.paymentMethod,
      cardNumber: values.cardNumber,
      expiry: values.expiry,
      cvc: values.cvc,
    };

    try {
      const createdOrder = await createOrderFromCheckout(
        payload,
        items,
        totals,
        { currency: "USD" }
      );

      clearCart();
      setDialogMessage(
        `Order placed successfully! Order #: ${
          createdOrder.orderNumber ?? createdOrder.id
        }`
      );
      setOpenDialog(true);

      return createdOrder;
    } catch (err: unknown) {
      console.error("Checkout failed:", err);
      const message =
        err instanceof Error ? err.message : "Failed to place order";
      setDialogMessage(`Order failed: ${message}`);
      setOpenDialog(true);
      throw err;
    }
  }

  return (
    <>
      <CustomForm
        title="Secure Checkout"
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={`Pay ${formatCurrency(totals.total)}`}
        maxWidth={700}
      />

      {openDialog && (
        <CustomDialogbox
          title="Order Status"
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          message={dialogMessage}
        />
      )}
    </>
  );
};

export default CheckoutForm;
