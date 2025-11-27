/* src/pages/OrdersListPage.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { Box, Alert, Typography, Stack } from "@mui/material";
import type { Order, PaymentInfo } from "../../types/Order";
import ManageOrder from "../../components/order/ManageOrder/ManageOrder";
import ViewPayment from "../../components/order/ViewPayment/ViewPayment";
import OrderDetailsDialog from "../../components/order/OrderDetailsDialog/OrderDetailsDialog";
import LayoutMain from "../../components/layout/layoutMain";
import OrdersTable from "../../components/CustomUI/OrdersTable/OrdersTable";
import { ordersService } from "../../services/orders.service";
import { useAuth } from "../../context/AuthContext";

const OrdersListPage = () => {
  const { can, user } = useAuth();
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0); // zero-based
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

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

  // initial fetch
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await ordersService.getAll();
        if (!mounted) return;
        setRows(data);
      } catch (err: unknown) {
        console.error("Failed to load orders", err);
        setError((err as Error)?.message || "Failed to load orders from API.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // derived visibility by permission
  const isStaff = useMemo(() => {
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
    if (!user) return [];
    return rows.filter(
      (r) =>
        r.customerId === user.id ||
        (user.email &&
          r.customerEmail &&
          r.customerEmail.toLowerCase() === user.email.toLowerCase())
    );
  }, [rows, user, can, isStaff]);

  // search/filter (server-side could be used instead)
  const searchedRows = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return visibleRows;
    return visibleRows.filter(
      (r) =>
        (r.orderNumber ?? "").toLowerCase().includes(q) ||
        (r.customerName ?? "").toLowerCase().includes(q) ||
        (r.customerEmail ?? "").toLowerCase().includes(q)
    );
  }, [visibleRows, searchQuery]);

  // update page when search changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery, visibleRows.length]);

  // server-side paging is supported by CustomTable; here we slice client-side
  const pagedData = useMemo(() => {
    const start = page * rowsPerPage;
    return searchedRows.slice(start, start + rowsPerPage);
  }, [searchedRows, page, rowsPerPage]);

  // handlers (CRUD)
  const openEdit = (order?: Order) => {
    setActiveOrder(order);
    setManageMode(order ? "edit" : "create");
    setManageOpen(true);
  };

  const handleSaveOrder = async (partial: Partial<Order>) => {
    if (!partial) return;
    setLoading(true);
    setError(null);
    try {
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
      setManageOpen(false);
    } catch (err: any) {
      console.error("Failed to save order:", err);
      setError((err as Error)?.message || "Failed to save order.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (order: Order) => {
    setLoading(true);
    setError(null);
    try {
      const ok = await ordersService.delete(order.id);
      if (ok) setRows((r) => r.filter((x) => x.id !== order.id));
      else setError(`Failed to delete order ${order.orderNumber}.`);
    } catch (err: any) {
      console.error("Failed to delete order:", err);
      setError((err as Error)?.message || "Failed to delete order.");
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
      else setError(`Failed to cancel order ${order.orderNumber}.`);
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      setError((err as Error)?.message || "Failed to cancel order.");
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
      else setError(`Failed to fulfill order ${order.orderNumber}.`);
    } catch (err: any) {
      console.error("Failed to fulfill order:", err);
      setError((err as Error)?.message || "Failed to fulfill order.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (order: Order) => {
    setPaymentPayload(order.payment ?? ({} as PaymentInfo));
    setPaymentOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    setDetailsOrder(order);
    setDetailsOpen(true);
  };

  // pagination callbacks from OrdersTable -> (parent expects zero-based page)
  const handlePageChange = (_: unknown, newPageZeroBased: number) => {
    setPage(newPageZeroBased);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <LayoutMain>
      {loading && (
        <Alert severity="info" sx={{ m: 2 }}>
          Loading orders...
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      <OrdersTable
        orders={pagedData} // current page slice (serverSide=true in CustomTable expects server to provide page slice)
        loading={loading}
        total={searchedRows.length} // total matching rows used for pagination UI
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={(o) => openEdit(o)}
        onDelete={(o) => handleDelete(o)}
        onCancel={(o) => handleCancel(o)}
        onFulfill={(o) => handleFulfill(o)}
        onViewPayment={(o) => handleViewPayment(o)}
        onViewDetails={(o) => handleViewDetails(o)}
        onSearch={(q) => setSearchQuery(q)}
        onCreate={() => openEdit(undefined)}
        onRefresh={async () => {
          setLoading(true);
          setError(null);
          try {
            const data = await ordersService.getAll();
            setRows(data);
          } catch (err: any) {
            setError((err as Error)?.message || "Failed to reload orders.");
          } finally {
            setLoading(false);
          }
        }}
      />

      {!can("orders:read") ? (
        <Alert severity="warning" sx={{ m: 2 }}>
          You do not have permission to view orders.
        </Alert>
      ) : !loading && searchedRows.length === 0 ? (
        <Typography sx={{ p: 2 }} color="text.secondary">
          No orders found matching your criteria.
        </Typography>
      ) : null}

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
  );
};

export default OrdersListPage;
