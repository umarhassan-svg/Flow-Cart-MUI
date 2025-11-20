// src/pages/CheckoutPage.tsx (Example)
import {
  Box,
  Container,
  Grid,
  Typography,
  Divider,
  Stack,
  Paper,
  List,
  ListItem,
} from "@mui/material";
import CheckoutForm from "../components/forms/CheckoutForm";
import CartItemCard from "../components/ui/CartItemCard";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../types/Cart";
import LayoutMain from "../components/layout/layoutMain";

const CheckoutPage = () => {
  const { items, totals, increment, decrement, setQty, removeFromCart } =
    useCart();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <>
      <LayoutMain>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontSize: {
                xs: "1.25rem", // extra-small screens (mobile)
                sm: "1.5rem", // small screens
                md: "1.75rem", // medium screens
                lg: "2rem", // large screens
              },
            }}
          >
            Checkout
          </Typography>

          <Grid container spacing={4}>
            {/* === LEFT COLUMN: Bill Summary & Cart Items === */}
            <Grid size={{ xs: 12, md: 7 }}>
              {/* --- TOP LEFT: Bill Summary --- */}
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Order Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  {/* Subtotal */}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">
                      Subtotal ({totals.itemsCount} items)
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {formatCurrency(totals.subtotal)}
                    </Typography>
                  </Stack>

                  {/* Shipping */}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography>
                      {totals.shipping === 0
                        ? "FREE"
                        : formatCurrency(totals.shipping)}
                    </Typography>
                  </Stack>

                  {/* Tax */}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">
                      Tax ({Math.round(0.08 * 100)}%)
                    </Typography>
                    <Typography>{formatCurrency(totals.tax)}</Typography>
                  </Stack>

                  {/* Discount (Conditional) */}
                  {totals.discount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Discount</Typography>
                      <Typography color="success.main" sx={{ fontWeight: 700 }}>
                        -{formatCurrency(totals.discount)}
                      </Typography>
                    </Stack>
                  )}

                  <Divider sx={{ my: 1 }} />

                  {/* TOTAL */}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 900, color: "primary.main" }}
                    >
                      {formatCurrency(totals.total)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* --- BOTTOM LEFT: Cart Items List --- */}
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Cart Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper elevation={0} sx={{ maxHeight: 400, overflowY: "auto" }}>
                  {items.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        Your cart is empty. Please return to the shop.
                      </Typography>
                    </Box>
                  ) : (
                    <List disablePadding>
                      {items.map((it: CartItem) => (
                        <ListItem key={it.id} disableGutters sx={{ py: 0 }}>
                          <Paper sx={{ width: "100%", px: 1, py: 0.5 }}>
                            <CartItemCard
                              item={it}
                              onIncrement={(id) => increment(id)}
                              onDecrement={(id) => decrement(id)}
                              onSetQty={(id, q) => setQty(id, q)}
                              onRemove={(id) => removeFromCart(id)}
                            />
                          </Paper>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Box>
            </Grid>

            {/* === RIGHT COLUMN: Checkout Form === */}
            <Grid size={{ xs: 12, md: 5 }}>
              <CheckoutForm />
            </Grid>
          </Grid>
        </Container>
      </LayoutMain>
    </>
  );
};

export default CheckoutPage;
