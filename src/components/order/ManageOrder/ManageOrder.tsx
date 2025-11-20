import { useState, useEffect, type ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import type { Order } from "../../../types/Order";
import { ORDER_STATUS } from "../../../types/Order";

export default function ManageOrder({
  open,
  onClose,
  order,
  onSave,
  mode = "edit",
}: {
  open: boolean;
  onClose: () => void;
  order?: Order;
  mode?: "create" | "edit";
  onSave: (o: Partial<Order>) => Promise<void> | void;
}) {
  const [form, setForm] = useState<Partial<Order>>({});

  // initialize form only when dialog opens or order changes
  useEffect(() => {
    if (!open) return;

    const updateForm = () => {
      setForm(order ? { ...order } : {});
    };

    updateForm();
  }, [open, order]);

  const handleChange =
    (key: keyof Order) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
    };

  const handleSave = async () => {
    // basic validation could go here
    await onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create"
          ? "Create Order"
          : `Manage Order ${order?.orderNumber ?? ""}`}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Customer Name"
              value={form.customerName ?? ""}
              onChange={handleChange("customerName" as keyof Order)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Customer Email"
              value={form.customerEmail ?? ""}
              onChange={handleChange("customerEmail" as keyof Order)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={form.status ?? "pending"}
              onChange={handleChange("status" as keyof Order)}
            >
              {ORDER_STATUS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Notes</Typography>
              <TextField
                multiline
                minRows={3}
                value={form.internalNotes ?? ""}
                onChange={handleChange("internalNotes" as keyof Order)}
              />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
