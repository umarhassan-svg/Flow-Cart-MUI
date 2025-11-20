import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Stack,
  Typography,
  Divider,
  Chip,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import type { Order } from "../../../types/Order";
import ShowProductItem from "../ShowOrderItem/ShowOrderItem";

export default function OrderDetailsDialog({
  open,
  onClose,
  order,
  onEdit,
  onCancel,
  onFulfill,
  onViewPayment,
}: {
  open: boolean;
  onClose: () => void;
  order?: Order | null;
  onEdit?: (o: Order) => void;
  onCancel?: (o: Order) => Promise<void> | void;
  onFulfill?: (o: Order) => Promise<void> | void;
  onViewPayment?: (o: Order) => void;
}) {
  const { can, user } = useAuth();

  if (!order) return null;

  const isCustomer =
    !!user &&
    (user.id === order.customerId ||
      (user.email &&
        user.email.toLowerCase() ===
          (order.customerEmail ?? "").toLowerCase()));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" component="div">
              Order {order.orderNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(order.date).toLocaleString()} • #{order.id}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={order.status}
              color={
                order.status === "cancelled"
                  ? "default"
                  : order.status === "fulfilled"
                  ? "success"
                  : "primary"
              }
              size="small"
            />
            <Typography variant="subtitle2">
              {order.currency} {order.total.toFixed(2)}
            </Typography>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          maxHeight: "50vh",
          overflowY: "auto",
        }}
      >
        <Grid container spacing={2}>
          {/* Customer / Shipping card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2">Customer</Typography>
                <Typography>{order.customerName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.customerEmail}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2">Order Info</Typography>
                <Typography variant="body2">
                  Assigned: {order.assignedTo ?? "—"}
                </Typography>
                <Typography variant="body2">
                  Payment status: {order.payment?.status ?? "—"}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  {order.payment ? (
                    <Button size="small" onClick={() => onViewPayment?.(order)}>
                      View Payment
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No payment info
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Items */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="subtitle2" gutterBottom>
              Items ({order.items.length})
            </Typography>

            <Stack spacing={1}>
              {order.items.map((it) => (
                <ShowProductItem key={it.id} item={it} />
              ))}
            </Stack>
          </Grid>

          {/* Notes / internal */}
          <Grid size={{ xs: 12 }}>
            <Divider />
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Internal Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.internalNotes ?? "—"}
            </Typography>
          </Grid>

          {/* Minimal audit stub */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="caption" color="text.secondary">
                Timeline & audit (recent)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {/* Replace with real timeline */}
                {order.payment?.paidAt
                  ? `Paid: ${new Date(order.payment.paidAt).toLocaleString()}`
                  : ""}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Stack direction="row" spacing={1} sx={{ width: "100%", px: 1 }}>
          {/* Left: contextual action area */}
          <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
            {/* Edit (staff or allowed users) */}
            {can("orders:update") && (
              <Button size="small" onClick={() => onEdit?.(order)}>
                Edit
              </Button>
            )}

            {/* Cancel — customer (their own order) or staff with cancel permission */}
            {can("orders:cancel") &&
              order.status !== "cancelled" &&
              (isCustomer || can("orders:update")) && (
                <Button size="small" onClick={() => onCancel?.(order)}>
                  Cancel
                </Button>
              )}

            {/* Fulfill — staff */}
            {can("orders:fulfill") && order.status !== "fulfilled" && (
              <Button size="small" onClick={() => onFulfill?.(order)}>
                Fulfill
              </Button>
            )}
          </Stack>

          {/* Right: close */}
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
