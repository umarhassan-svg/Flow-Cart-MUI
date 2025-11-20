// File: src/components/orders/ViewPayment.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
} from "@mui/material";

export type PaymentInfo = {
  gateway: string;
  status: string;
  amount: number;
  currency: string;
  txnId?: string;
  paidAt?: string;
};

export function ViewPayment({
  open,
  onClose,
  payment,
}: {
  open: boolean;
  onClose: () => void;
  payment?: PaymentInfo;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment Details</DialogTitle>
      <DialogContent>
        {!payment ? (
          <Typography>No payment information available.</Typography>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Gateway</Typography>
              <Typography>{payment.gateway}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Status</Typography>
              <Typography>{payment.status}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Amount</Typography>
              <Typography>
                {(payment.amount ?? 0).toFixed(2)} {payment.currency}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2">Transaction ID</Typography>
              <Typography>{payment.txnId ?? "-"}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider />
              <Typography variant="caption" color="text.secondary">
                Paid at: {payment.paidAt ?? "-"}
              </Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
