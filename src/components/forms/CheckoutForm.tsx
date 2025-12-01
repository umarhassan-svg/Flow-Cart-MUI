// src/components/checkout/CheckoutForm.tsx
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CustomDialogbox from "../ui/CustomDialogbox";
import CustomForm from "../CustomUI/CustomForms/CustomForm";
import { checkoutSchema } from "../CustomUI/Tests/CheckoutForm/checkoutSchema"; // <-- import schema
import {
  createOrderFromCheckout,
  type CheckoutPayload,
} from "../../utils/createOrder";
import { useAuth } from "../../context/AuthContext";

const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    amount ?? 0
  );

const CheckoutForm = () => {
  const { totals, items, clearCart } = useCart();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const { user } = useAuth();

  // Initial values can override schema defaults

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
        title="Checkout Form"
        schema={checkoutSchema} // <-- use schema
        onSubmit={handleSubmit}
        submitLabel={`Pay ${formatCurrency(totals.total)}`}
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
