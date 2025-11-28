/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  // Add Snackbar components for better error display (optional)
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import type { Order } from "../types/Order";
import ManageOrder from "../components/order/ManageOrder/ManageOrder";
import OrderActionsMenu from "../components/order/OrderActionsMenu/OrderActionsMenu";
import ViewPayment from "../components/order/ViewPayment/ViewPayment";
import { useAuth } from "../context/AuthContext";
import { ordersService } from "../services/orders.service";
import LayoutMain from "../components/layout/layoutMain";
import type { PaymentInfo } from "../components/order/ViewPayment/ViewPayment";
import OrderDetailsDialog from "../components/order/OrderDetailsDialog/OrderDetailsDialog";

const OrdersListPage = () => {
  const { can, user } = useAuth();
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for API errors
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [query, setQuery] = useState("");

  const [manageOpen, setManageOpen] = useState(false);
  const [manageMode, setManageMode] = useState<"create" | "edit">("edit");
  const [activeOrder, setActiveOrder] = useState<Order | undefined>(undefined);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState<PaymentInfo>(
    {} as PaymentInfo
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<Order | undefined>(
    undefined
  );

  // --- Initial Data Fetch ---
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null); // Clear previous errors

    (async () => {
      try {
        const data = await ordersService.getAll();
        if (!mounted) return; // component unmounted -> ignore
        setRows(data);
      } catch (err: unknown) {
        console.error("Failed to load orders", err);
        // Set user-friendly error message
        setError((err as string) || "Failed to load orders from API.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Utility Hooks (Correctly Implemented) ---
  const isStaff = useMemo(() => {
    // Check if the user has any staff-level permission for orders
    return (
      can("orders:update") ||
      can("orders:delete") ||
      can("orders:fulfill") ||
      can("orders:audit")
    );
  }, [can]);

  const visibleRows = useMemo(() => {
    if (!can("orders:read")) return [];

    if (isStaff) return rows;

    // customer: only their orders
    if (!user) return [];
    return rows.filter(
      (r) =>
        r.customerId === user.id ||
        (user.email &&
          r.customerEmail &&
          r.customerEmail.toLowerCase() === user.email.toLowerCase())
    );
  }, [rows, user, can, isStaff]);

  const searchedRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleRows;
    return visibleRows.filter(
      (r) =>
        (r.orderNumber ?? "").toLowerCase().includes(q) ||
        (r.customerName ?? "").toLowerCase().includes(q) ||
        (r.customerEmail ?? "").toLowerCase().includes(q)
    );
  }, [visibleRows, query]);

  useEffect(() => {
    setPage(0);
  }, [query, visibleRows.length]);

  const pageRows = searchedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // --- Pagination Handlers ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openEdit = (order?: Order) => {
    setActiveOrder(order);
    setManageMode(order ? "edit" : "create");
    setManageOpen(true);
  };

  // --- CRUD Action Handlers with API Error Handling ---

  const handleSaveOrder = async (partial: Partial<Order>) => {
    if (!partial) return;
    setLoading(true);
    setError(null);
    try {
      if (partial.id) {
        // UPDATE
        const updated = await ordersService.update(
          partial.id,
          partial as Partial<Order>
        );
        if (updated)
          setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        // CREATE
        const created = await ordersService.create(partial as Partial<Order>);
        setRows((r) => [created, ...r]);
      }
      setManageOpen(false); // Close dialog on success
    } catch (err: any) {
      console.error("Failed to save order:", err);
      setError(
        (err.message as string) ||
          "Failed to save order. Check network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (order: Order) => {
    setLoading(true);
    setError(null);
    try {
      const ok = await ordersService.delete(order.id);
      if (ok) {
        setRows((r) => r.filter((x) => x.id !== order.id));
      } else {
        setError(
          `Failed to delete order ${order.orderNumber}. It might not exist.`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to delete order:", err);
      setError(err.message || "Failed to delete order due to an API error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (order: Order) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await ordersService.cancel(order.id);
      if (updated)
        setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)));
      else
        setError(
          `Failed to cancel order ${order.orderNumber}. Order not found or already cancelled.`
        );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      setError(err.message || "Failed to cancel order due to an API error.");
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (order: Order) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await ordersService.fulfill(order.id);
      if (updated)
        setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)));
      else
        setError(
          `Failed to fulfill order ${order.orderNumber}. Order not found.`
        );
    } catch (err: any) {
      console.error("Failed to fulfill order:", err);
      setError(err.message || "Failed to fulfill order due to an API error.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (order: Order) => {
    setPaymentPayload(order.payment ?? ({} as PaymentInfo));
    setPaymentOpen(true);
  };

  return (
    <>
      <LayoutMain>
        {/* Display Loading Indicator */}
        {loading && (
          <Alert severity="info" sx={{ m: 2 }}>
            Loading orders...
          </Alert>
        )}

        <Box p={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  fontSize: {
                    xs: "1.25rem",
                    sm: "1.5rem",
                    md: "1.75rem",
                    lg: "2rem",
                  },
                }}
              >
                Orders
              </Typography>
            </Box>
          </Stack>

          {/* Display API Error Message */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 2 }}
            >
              Error: {error}
            </Alert>
          )}

          {/* Search Bar */}
          <Paper
            sx={{
              p: 2,
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              my: 2,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search by order #, customer"
                value={query}
                fullWidth
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  // Added a clear button for search
                  endAdornment: query ? (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setQuery("")} size="small">
                        <CancelIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Box>
          </Paper>

          {/* Table Display */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {row.orderNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{row.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(row.date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography>{row.customerName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.customerEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.currency} {row.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={
                            row.status === "cancelled"
                              ? "default"
                              : row.status === "fulfilled"
                              ? "success"
                              : row.status === "pending" ||
                                row.status === "confirmed"
                              ? "warning"
                              : "primary" // processing/shipped
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <OrderActionsMenu
                            order={row}
                            onEdit={(o) => openEdit(o)}
                            onDelete={handleDelete}
                            onCancelOrder={handleCancel}
                            onFulfill={handleFulfill}
                            onViewPayment={handleViewPayment}
                            onViewDetails={(o) => {
                              setDetailsOrder(o);
                              setDetailsOpen(true);
                            }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={searchedRows.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        </Box>

        {/* Bottom Messages */}
        {!can("orders:read") ? (
          <Alert severity="warning" sx={{ m: 2 }}>
            You do not have permission to view orders.
          </Alert>
        ) : !loading && searchedRows.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.secondary">
            No orders found matching your criteria.
          </Typography>
        ) : null}

        {/* Modals/Dialogs */}
        <ManageOrder
          open={manageOpen}
          onClose={() => setManageOpen(false)}
          order={activeOrder}
          mode={manageMode}
          onSave={handleSaveOrder}
        />

        <ViewPayment
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          payment={paymentPayload}
        />

        <OrderDetailsDialog
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setDetailsOrder(undefined);
          }}
          order={detailsOrder}
          onEdit={(o) => {
            setDetailsOpen(false);
            openEdit(o);
          }}
          onCancel={async (o) => {
            await handleCancel(o);
            setDetailsOpen(false);
          }}
          onFulfill={async (o) => {
            await handleFulfill(o);
            setDetailsOpen(false);
          }}
          onViewPayment={(o) => handleViewPayment(o)}
        />
      </LayoutMain>
    </>
  );
};

export default OrdersListPage;
