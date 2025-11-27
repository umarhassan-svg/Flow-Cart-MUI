/* src/components/order/OrdersTable/OrdersTable.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { Order } from "../../../types/Order";
import CustomTable from "../../CustomUI/CustomTable/CustomTable";
import type { Column } from "../../../types/TableColumn";
import "./orderstable.css";
export interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  total: number;
  page: number; // zero-based page from parent
  rowsPerPage: number;
  onPageChange?: (event: unknown, page: number) => void; // parent handler expecting (event, page)
  onRowsPerPageChange?: (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => void;
  onEdit?: (o?: Order) => void;
  onDelete?: (o: Order) => void;
  onCancel?: (o: Order) => void;
  onFulfill?: (o: Order) => void;
  onViewPayment?: (o: Order) => void;
  onViewDetails?: (o: Order) => void;
  onSelectionChange?: (selected: Array<string | number>) => void;
  onRowClick?: (row: Order, idx: number) => void;
  onSearch?: (q: string) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
}

export default function OrdersTable({
  orders,
  loading,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onCancel,
  onFulfill,
  onViewPayment,
  onViewDetails,
  onSelectionChange,
  onRowClick,
  onSearch,
  onCreate,
  onRefresh,
}: OrdersTableProps) {
  // local page state for CustomTable (1-based)
  const [localPage, setLocalPage] = useState<number>(Math.max(1, page + 1));
  const [localPageSize, setLocalPageSize] = useState<number>(rowsPerPage);

  // search state (debounced inside this component)
  const [searchTyping, setSearchTyping] = useState<string>("");

  useEffect(() => {
    setLocalPage(Math.max(1, page + 1));
  }, [page]);

  useEffect(() => {
    setLocalPageSize(rowsPerPage);
  }, [rowsPerPage]);

  // debounce and notify parent
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof onSearch === "function") onSearch(searchTyping.trim());
      // ask parent to reset to first page (0-based)
      if (onPageChange) {
        try {
          onPageChange(null, 0);
        } catch {
          /* ignore */
        }
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTyping]);

  // build columns for CustomTable
  const columns: Column<Order>[] = [
    {
      id: "id",
      header: "Order",
      render: (o: Order) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700 }}>{o.orderNumber}</div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>#{o.id}</div>
        </div>
      ),
      width: "220px",
    },
    {
      id: "date",
      header: "Date",
      accessor: (o: Order) => o.date,
      type: "date",
      width: "180px",
    },
    {
      id: "customer",
      header: "Customer",
      render: (o: Order) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 600 }}>{o.customerName ?? "—"}</div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            {o.customerEmail ?? "—"}
          </div>
        </div>
      ),
      width: "260px",
    },
    {
      id: "total",
      header: "Total",
      render: (o: Order) => (
        <div style={{ fontWeight: 700 }}>
          {o.currency} {Number(o.total || 0).toFixed(2)}
        </div>
      ),
      width: "120px",
      align: "right",
    },
    {
      id: "status",
      header: "Status",
      accessor: (o: Order) => o.status,
      type: "status",
      width: "140px",
      align: "center",
    },
    {
      id: "actions",
      header: "Actions",
      type: "buttons",
      options: [
        {
          key: "details",
          label: "Details",
          variant: "primary",
          onClick: (o: Order) => {
            if (onViewDetails) onViewDetails(o);
          },
        },
        {
          key: "payment",
          label: "Payment",
          variant: "default",
          onClick: (o: Order) => {
            if (onViewPayment) onViewPayment(o);
          },
        },
        {
          key: "edit",
          label: "Edit",
          variant: "default",
          onClick: (o: Order) => {
            if (onEdit) onEdit(o);
          },
        },
        {
          key: "cancel",
          label: "Cancel",
          variant: "danger",
          onClick: (o: Order) => {
            if (onCancel) onCancel(o);
          },
        },
        {
          key: "fulfill",
          label: "Fulfill",
          variant: "default",
          onClick: (o: Order) => {
            if (onFulfill) onFulfill(o);
          },
        },
        {
          key: "delete",
          label: "Delete",
          variant: "danger",
          onClick: (o: Order) => {
            if (onDelete) onDelete(o);
          },
        },
      ],
      width: "150px",
      align: "center",
    },
  ];

  // bridge CustomTable page change (1-based) -> parent (0-based)
  const handleInternalPageChange = (newPage: number, newPageSize: number) => {
    setLocalPage(newPage);
    setLocalPageSize(newPageSize);

    if (onPageChange) {
      try {
        onPageChange(null, Math.max(0, newPage - 1));
      } catch {
        // ignore
      }
    }

    if (newPageSize !== rowsPerPage && onRowsPerPageChange) {
      const syntheticEvent = {
        target: { value: String(newPageSize) },
      } as unknown as ChangeEvent<HTMLSelectElement>;
      onRowsPerPageChange(syntheticEvent);
    }
  };

  const handleCreateClick = () => {
    if (onCreate) onCreate();
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    else if (onPageChange) {
      try {
        onPageChange(null, page);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="orders-table-root">
      {/* Header / search - plain divs (no MUI) */}
      <div className="orders-table-header">
        <div className="orders-table-title">
          <div className="title-main">Orders</div>
          <div className="title-sub">List of orders and actions</div>
        </div>

        <div className="orders-table-controls">
          <div className="search-wrapper">
            <input
              type="search"
              className="search-input"
              placeholder="Search order #, customer, email..."
              value={searchTyping}
              onChange={(e) => setSearchTyping(e.target.value)}
              aria-label="Search orders"
            />
            {searchTyping ? (
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearchTyping("");
                  if (onSearch) onSearch("");
                }}
              >
                ✕
              </button>
            ) : null}
          </div>

          <div className="actions-right">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleRefresh}
            >
              Refresh
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateClick}
            >
              + Add order
            </button>
          </div>
        </div>
      </div>

      {/* table body */}
      <div className="orders-table-body">
        <CustomTable<Order>
          columns={columns}
          data={orders}
          pagination
          loading={loading}
          total={total}
          rowKey="id"
          onSelectionChange={onSelectionChange}
          onRowClick={onRowClick}
          serverSide
          onPageChange={(p: number, ps: number) =>
            handleInternalPageChange(p, ps)
          }
          initialPageSize={localPageSize}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </div>
    </div>
  );
}
