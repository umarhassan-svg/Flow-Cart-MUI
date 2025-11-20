// File: src/components/orders/OrderActionsMenu.tsx
import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Order } from "../../../types/Order";
import { useAuth } from "../../../context/AuthContext";

export default function OrderActionsMenu({
  order,
  onEdit,
  onDelete,
  onCancelOrder,
  onFulfill,
  onViewPayment,
  onViewDetails,
}: {
  order: Order;
  onEdit: (o: Order) => void;
  onDelete: (o: Order) => Promise<void> | void;
  onCancelOrder: (o: Order) => Promise<void> | void;
  onFulfill: (o: Order) => Promise<void> | void;
  onViewPayment: (o: Order) => void;
  onViewDetails: (o: Order) => void;
}) {
  const { can } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    null | "delete" | "cancel" | "fulfill"
  >(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const ask = (action: "delete" | "cancel" | "fulfill") => {
    setConfirmAction(action);
    setConfirmOpen(true);
    handleClose();
  };

  const runConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction === "delete") await onDelete(order);
    if (confirmAction === "cancel") await onCancelOrder(order);
    if (confirmAction === "fulfill") await onFulfill(order);
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={handleOpen}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {can("orders:update") && (
          <MenuItem
            onClick={() => {
              onEdit(order);
              handleClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}

        {can("orders:view-payment") && (
          <MenuItem
            onClick={() => {
              onViewPayment(order);
              handleClose();
            }}
          >
            <ListItemIcon>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Payment</ListItemText>
          </MenuItem>
        )}

        {can("orders:fulfill") && (
          <MenuItem
            onClick={() => {
              ask("fulfill");
            }}
          >
            <ListItemIcon>
              <LocalShippingIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Fulfill</ListItemText>
          </MenuItem>
        )}

        {can("orders:cancel") && order.status !== "cancelled" && (
          <MenuItem onClick={() => ask("cancel")}>
            <ListItemIcon>
              <CancelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cancel Order</ListItemText>
          </MenuItem>
        )}

        {can("orders:delete") && (
          <MenuItem onClick={() => ask("delete")}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}

        {/* Always allow view details (read) if permission present */}
        {can("orders:read") && (
          <MenuItem
            onClick={() => {
              onViewDetails?.(order);
              handleClose();
            }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmAction === "delete" &&
              "Are you sure you want to delete this order? This action cannot be undone."}
            {confirmAction === "cancel" &&
              "Are you sure you want to cancel this order?"}
            {confirmAction === "fulfill" && "Mark this order as fulfilled?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>No</Button>
          <Button variant="contained" onClick={runConfirm}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
