// src/components/checkout/CheckoutForm.tsx
import { useMemo, useState } from "react";
// import { useCart } from "../../context/CartContext";
import useCart from "../../store/hooks/useCart";
import CustomForm from "../CustomUI/CustomForms/CustomForm";
import { checkoutSchema } from "../CustomUI/Tests/CheckoutForm/checkoutSchema"; // <-- import schema
import {
  createOrderFromCheckout,
  type CheckoutPayload,
} from "../../utils/createOrder";
import { useAuth } from "../../context/AuthContext";
import MessageDialogBox from "../CustomUI/MessageDialogBox/MessageDialogBox";
import type {
  DialogAction,
  DialogVariant,
} from "../../types/MessageDialogBoxTypes";

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

  const dialogactions: DialogAction[] = useMemo(() => {
    return [
      {
        key: "close",
        label: "Close",
        // MessageDialogBox will call onClose after this action, so this can be a no-op
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          /* no-op */
          e.stopPropagation();
        },
        isPrimary: true,
      },
    ];
  }, []);

  return (
    <>
      <CustomForm
        title="Checkout Form"
        schema={checkoutSchema} // <-- use schema
        onSubmit={handleSubmit}
        submitLabel={`Pay ${formatCurrency(totals.total)}`}
      />

      {openDialog && (
        <MessageDialogBox
          isOpen={openDialog} // local state controls visibility
          onClose={() => setOpenDialog(false)}
          maintext={dialogMessage}
          actions={dialogactions}
          variant={"success" as DialogVariant}
        />
      )}
    </>
  );
};

export default CheckoutForm;
