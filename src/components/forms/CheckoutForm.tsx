// src/components/checkout/CheckoutForm.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Divider,
  Paper,
  MenuItem,
  Select,
} from "@mui/material";

import { useCart } from "../../context/CartContext";
import CustomDialogbox from "../ui/CustomDialogbox";

// NEW: import the createOrder helper
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

const CheckoutForm = () => {
  const { totals, items, clearCart } = useCart();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    zipCode: "",
    country: "US",
    paymentMethod: "visa",
    // card fields
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Your cart is empty. Please add items to checkout.");
      return;
    }

    // Build a minimal payload matching createOrderFromCheckout
    const payload: CheckoutPayload = {
      userId: user?.id,
      email: formData.email,
      fullName: formData.fullName,
      shipping: {
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      paymentMethod: formData.paymentMethod,
      cardNumber: formData.cardNumber,
      expiry: formData.expiry,
      cvc: formData.cvc,
    };

    setIsSubmitting(true);

    try {
      const createdOrder = await createOrderFromCheckout(
        payload,
        items,
        totals,
        { currency: "USD" }
      );

      // success
      clearCart();
      setDialogMessage(
        `Order placed successfully! Order #: ${
          createdOrder.orderNumber ?? createdOrder.id
        }`
      );
      setOpenDialog(true);
    } catch (err: unknown) {
      console.error("Checkout failed:", err);
      const message =
        err instanceof Error ? err.message : "Failed to place order";
      setDialogMessage(`Order failed: ${message}`);
      setOpenDialog(true);
    } finally {
      setIsSubmitting(false);
      // Keep fields in case user needs to retry — but you can clear on success if you prefer
    }
  };

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
        Shipping & Payment
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Contact Information */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Contact Information
            </Typography>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <TextField
              required
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
          </Box>

          {/* Shipping Address */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Shipping Address
            </Typography>
            <TextField
              required
              fullWidth
              label="Address Line 1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="Address Line 2 (Optional)"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              margin="normal"
              size="small"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                required
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                margin="normal"
                size="small"
              />
              <TextField
                required
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                margin="normal"
                size="small"
              />
            </Stack>
            <TextField
              required
              select
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              margin="normal"
              size="small"
            >
              {COUNTRIES.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Payment Method - Simplified */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Payment Method
            </Typography>
            <Select
              required
              fullWidth
              value={formData.paymentMethod}
              onChange={(e) =>
                handleChange(e as React.ChangeEvent<HTMLInputElement>)
              }
              size="small"
              name="paymentMethod"
              label="Payment Method"
              margin="none"
              inputProps={{ "aria-label": "Payment Method" }}
            >
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="PayPal">PayPal</MenuItem>
              <MenuItem value="Bitcoin">Bitcoin</MenuItem>
              <MenuItem value="Ethereum">Ethereum</MenuItem>
            </Select>
            <TextField
              required
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              margin="normal"
              size="small"
              inputProps={{ inputMode: "numeric", pattern: "\\d*" }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                required
                fullWidth
                label="Expiry Date (MM/YY)"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                margin="normal"
                size="small"
              />
              <TextField
                required
                fullWidth
                label="CVC"
                name="cvc"
                value={formData.cvc}
                onChange={handleChange}
                margin="normal"
                size="small"
              />
            </Stack>
          </Box>
        </Stack>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4, py: 1.5, fontSize: "1.1rem" }}
          disabled={items.length === 0 || isSubmitting}
        >
          {isSubmitting
            ? "Placing Order..."
            : `Pay ${new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "USD",
              }).format(totals.total)}`}
        </Button>
      </form>
      {openDialog && (
        <CustomDialogbox
          title="Order Placement"
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          message={dialogMessage}
        />
      )}
    </Paper>
  );
};

export default CheckoutForm;
