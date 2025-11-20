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
} from "@mui/material";

import { useCart } from "../../context/CartContext";
import CustomDialogbox from "../ui/CustomDialogbox";

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Your cart is empty. Please add items to checkout.");
      return;
    }

    setIsSubmitting(true);

    // Simulate a successful checkout process
    setTimeout(() => {
      console.log("Submitting Order:", { formData, totals });
      clearCart(); // Clear the cart after successful checkout
      setIsSubmitting(false);
      setOpenDialog(true);
      setDialogMessage("Order placed successfully!");
      // In a real application, you'd redirect to an order confirmation page
    }, 2000);
    //clear all fields
    setFormData({
      email: "",
      fullName: "",
      address1: "",
      address2: "",
      city: "",
      zipCode: "",
      country: "US",
      paymentMethod: "visa",
    });
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
            <TextField
              required
              fullWidth
              label="Card Number"
              name="cardNumber"
              margin="normal"
              size="small"
              // Placeholder for actual card number input
            />
            <Stack direction="row" spacing={2}>
              <TextField
                required
                fullWidth
                label="Expiry Date (MM/YY)"
                name="expiry"
                margin="normal"
                size="small"
              />
              <TextField
                required
                fullWidth
                label="CVC"
                name="cvc"
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
