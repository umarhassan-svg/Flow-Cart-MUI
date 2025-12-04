// src/components/cart/CartDrawer.tsx
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Button,
  List,
  ListItem,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import type { CartItem } from "../../types/Cart";
// import { useCart } from "../../context/CartContext";
import useCart from "../../store/hooks/useCart";
import CartItemCard from "../ui/CartItemCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Responsive width
 */
const drawerWidth = { xs: "100%", sm: 480, md: 560 };

const CartDrawer = ({ open, onClose }: Props) => {
  const {
    items,
    increment,
    decrement,
    setQty,
    removeFromCart,
    clearCart,
    totals,
  } = useCart();
  const navigate = useNavigate();
  const { can } = useAuth();

  const handleCheckout = () => {
    // This should route to checkout page - keep placeholder for now
    // example: navigate("/checkout") from parent
    // console.log("Checkout", totals);
    navigate("/checkout");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: drawerWidth } }}
      sx={{ zIndex: 9999 }}
    >
      <Box
        sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <ShoppingCartIcon />
          <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>
            Cart ({totals.itemsCount})
          </Typography>

          <IconButton onClick={onClose} aria-label="Close cart">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider />

        {/* items list */}
        <Box sx={{ mt: 1, mb: 2, flex: 1, overflow: "auto" }}>
          {items.length === 0 ? (
            <Box sx={{ display: "grid", placeItems: "center", height: "100%" }}>
              <Typography color="text.secondary">Your cart is empty</Typography>
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
        </Box>

        <Divider />

        {/* bill summary */}
        <Box sx={{ mt: 2 }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                }).format(totals.subtotal)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Shipping</Typography>
              <Typography>
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                }).format(totals.shipping)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Tax</Typography>
              <Typography>
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                }).format(totals.tax)}
              </Typography>
            </Stack>

            {totals.discount > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Discount</Typography>
                <Typography color="success.main">
                  -
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "USD",
                  }).format(totals.discount)}
                </Typography>
              </Stack>
            )}

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 1 }}
            >
              <Typography sx={{ fontWeight: 700 }}>Total</Typography>
              <Typography sx={{ fontWeight: 900, fontSize: "1.1rem" }}>
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                }).format(totals.total)}
              </Typography>
            </Stack>
          </Stack>

          {/* actions */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mt: 2 }}
          >
            {can("orders:create") ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                Checkout
              </Button>
            ) : (
              <Button variant="contained" fullWidth disabled>
                Not Allowed to checkout
              </Button>
            )}

            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => clearCart()}
              disabled={items.length === 0}
            >
              Clear cart
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
