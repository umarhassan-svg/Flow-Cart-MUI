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
  Tooltip,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import type { Order } from "../types/Order";
import ManageOrder from "../components/order/ManageOrder/ManageOrder";
import OrderActionsMenu from "../components/order/OrderActionsMenu/OrderActionsMenu";
import { ViewPayment } from "../components/order/ViewPayment/ViewPayment";
import { useAuth } from "../context/AuthContext";
import { ordersService } from "../services/orders.service";
import LayoutMain from "../components/layout/layoutMain";
import type { PaymentInfo } from "../components/order/ViewPayment/ViewPayment";
import OrderDetailsDialog from "../components/order/OrderDetailsDialog/OrderDetailsDialog";

export default function OrderList() {
  const { can, user } = useAuth();
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const data = await ordersService.getAll();
        if (!mounted) return; // component unmounted -> ignore
        setRows(data);
      } catch (err) {
        console.error("Failed to load orders", err);
        // optionally set an error state
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []); // empty deps -> runs only on mount / reload

  // --- place inside your component, replacing `filtered` and `pageRows` logic ---

  // helper: treat users with any staff-level permission as staff (see note)
  const isStaff = useMemo(() => {
    // Adjust which permissions you consider "staff" in your app
    return (
      can("orders:update") ||
      can("orders:delete") ||
      can("orders:fulfill") ||
      can("orders:create")
    );
  }, [can]);

  // Visible rows = either all (for staff) or only the customer's orders.
  // Also handle common mismatch where order.customerId uses a different id scheme:
  // we'll accept match by customerId === user.id OR customerEmail === user.email.
  const visibleRows = useMemo(() => {
    if (!can("orders:read")) return []; // no permission -> nothing

    if (isStaff) return rows; // staff: see all orders

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

  // Now apply search query on top of visibleRows
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

  // Reset page when query or visibleRows length changes so user doesn't get empty page
  useEffect(() => {
    setPage(0);
  }, [query, visibleRows.length]);

  const pageRows = searchedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  const handleSaveOrder = async (partial: Partial<Order>) => {
    if (!partial) return;
    if (partial.id) {
      const updated = await ordersService.update(
        partial.id,
        partial as Partial<Order>
      );
      if (updated)
        setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)));
    } else {
      const created = await ordersService.create(partial as Partial<Order>);
      setRows((r) => [created, ...r]);
    }
  };

  const handleDelete = async (order: Order) => {
    const ok = await ordersService.delete(order.id);
    if (ok) setRows((r) => r.filter((x) => x.id !== order.id));
  };

  const handleCancel = async (order: Order) => {
    const updated = await ordersService.cancel(order.id);
    if (updated)
      setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleFulfill = async (order: Order) => {
    const updated = await ordersService.fulfill(order.id);
    if (updated)
      setRows((r) => r.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleViewPayment = (order: Order) => {
    setPaymentPayload(order.payment ?? ({} as PaymentInfo));
    setPaymentOpen(true);
  };
  return (
    <>
      <LayoutMain>
        {" "}
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
                    xs: "1.25rem", // extra-small screens (mobile)
                    sm: "1.5rem", // small screens
                    md: "1.75rem", // medium screens
                    lg: "2rem", // large screens
                  },
                }}
              >
                Orders
              </Typography>
            </Box>
          </Stack>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <TextField
                size="small"
                placeholder="Search by order #, customer"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1}>
                <Chip
                  label={
                    loading ? "Loading..." : `Total: ${searchedRows.length}`
                  }
                />
              </Stack>
            </Stack>
          </Paper>

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
                              : "primary"
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
                          {can("orders:cancel") &&
                            user?.id === row.customerId &&
                            row.status !== "cancelled" && (
                              <Tooltip title="Cancel order">
                                <IconButton
                                  size="small"
                                  onClick={() => handleCancel(row)}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            )}

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
        </Box>
        {!can("orders:read") ? (
          <Alert severity="warning">
            You do not have permission to view orders.
          </Alert>
        ) : searchedRows.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.secondary">
            No orders found.
          </Typography>
        ) : null}
      </LayoutMain>
    </>
  );
}
