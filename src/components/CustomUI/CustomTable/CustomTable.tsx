/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import type { Column } from "../../../types/TableColumn";
import { exportTableCSV } from "../../../utils/generateCSV";
import {
  StatusBadge,
  ChipOverflowDialog,
  Chip,
  SimpleMenu,
  formatDate,
} from "../../../utils/CustomTableHelper";

/* ---------- new pagination + loading props ---------- */
export interface GenericTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((row: T) => string | number);
  selectable?: boolean;
  onSelectionChange?: (selected: Array<string | number>) => void;
  dense?: boolean;
  className?: string;
  onRowClick?: (row: T, idx: number) => void;

  /* pagination / loading */
  pagination?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  serverSide?: boolean;
  total?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  loading?: boolean;
}

/* ===================================================== */
export default function GenericTable<T>({
  columns = [],
  data = [],
  rowKey,
  selectable = false,
  onSelectionChange,
  dense = false,
  className = "",
  onRowClick,
  pagination = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  serverSide = false,
  total,
  onPageChange,
  loading = false,
}: GenericTableProps<T>) {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [chipDialog, setChipDialog] = useState<{
    open: boolean;
    items: string[];
  }>({ open: false, items: [] });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    const effectiveTotal = serverSide
      ? typeof total === "number"
        ? total
        : data.length
      : data.length;
    const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

    const set_page = (p: number) => {
      setPage(p);
    };

    if (page > totalPages) set_page(totalPages);
  }, [data, total, pageSize, serverSide, page]);

  useEffect(() => {
    if (onPageChange) {
      onPageChange(page, pageSize);
    }
  }, [page, pageSize]);

  const keyFor = (row: T, idx: number): string | number => {
    if (typeof rowKey === "function") return rowKey(row);
    if (typeof rowKey === "string") {
      return (row as any)[rowKey] ?? idx;
    }
    return idx;
  };

  const toggleSelect = (k: string | number) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(k)) copy.delete(k);
      else copy.add(k);
      const arr = Array.from(copy);
      if (onSelectionChange) onSelectionChange(arr);
      return copy;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (prev.size === data.length) {
        if (onSelectionChange) onSelectionChange([]);
        return new Set<string | number>();
      } else {
        const all = new Set<string | number>(data.map((r, i) => keyFor(r, i)));
        if (onSelectionChange) onSelectionChange(Array.from(all));
        return all;
      }
    });
  };

  const hasSelection = selected.size > 0;

  const effectiveTotal = serverSide
    ? typeof total === "number"
      ? total
      : data.length
    : data.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

  const pagedData = useMemo(() => {
    if (!pagination) return data;
    if (serverSide) return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize, pagination, serverSide]);

  const goTo = (p: number) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    setPage(clamped);
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
  };

  const renderCellContent = (col: Column<T>, row: T, rIdx: number) => {
    if (col.render) return col.render(row, rIdx);

    const value = col.accessor
      ? typeof col.accessor === "function"
        ? col.accessor(row)
        : (row as any)[col.accessor]
      : (row as any)[col.id];

    if (col.type === "date") return <span>{formatDate(value)}</span>;

    if (col.type === "status") return <StatusBadge value={value} />;

    if (col.type === "chip") {
      const text = typeof value === "string" ? value : String(value ?? "");
      if (!text) return <span className="muted">—</span>;
      return <Chip text={text} />;
    }

    if (col.type === "chips") {
      const arr: string[] = Array.isArray(value)
        ? value.map((v) => String(v))
        : value
        ? [String(value)]
        : [];
      if (arr.length === 0) return <span className="muted">—</span>;
      if (arr.length === 1) return <Chip text={arr[0]} />;
      const restCount = arr.length - 1;
      return (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Chip text={arr[0]} />
          <button
            className="chip-overflow"
            onClick={(e) => {
              e.stopPropagation();
              setChipDialog({ open: true, items: arr });
            }}
            aria-haspopup
          >
            +{restCount}
          </button>
        </div>
      );
    }

    if (col.type === "buttons") {
      const opts =
        col.options ?? ((row as any).actions as Column<T>["options"]) ?? [];
      if (!opts || opts.length === 0) return <span className="muted">—</span>;
      return <SimpleMenu options={opts} row={row} />;
    }

    if (value === null || value === undefined || value === "")
      return <span className="muted">—</span>;
    return <span>{String(value)}</span>;
  };

  const handleExport = (mode: "all" | "page" | "selected") => {
    let rowsToExport: T[] = [];
    if (mode === "selected") {
      if (selected.size === 0) return;
      const selectedSet = new Set(selected);
      rowsToExport = data.filter((row, idx) =>
        selectedSet.has(keyFor(row, idx))
      );
    } else if (mode === "page") {
      rowsToExport = pagedData;
    } else {
      rowsToExport = data;
    }

    const filename = `table-export-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.csv`;

    exportTableCSV(columns, rowsToExport, filename);
    setExportMenuOpen(false);
  };

  return (
    <div
      className={`generic-table-wrapper ${dense ? "dense" : ""} ${className}`}
    >
      {/* Top header bar with export button - OUTSIDE the table */}
      <div className="table-header">
        <div className="export-wrapper">
          <button
            className="export-btn"
            onClick={() => setExportMenuOpen((s) => !s)}
            disabled={loading || data.length === 0}
            aria-haspopup="true"
            aria-expanded={exportMenuOpen}
            title="Export table data to CSV"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          {exportMenuOpen && (
            <div
              className="export-menu"
              role="menu"
              onMouseLeave={() => setExportMenuOpen(false)}
            >
              <button
                className="export-menu-item"
                onClick={() => handleExport("all")}
                role="menuitem"
              >
                📄 Export all rows
              </button>
              <button
                className="export-menu-item"
                onClick={() => handleExport("page")}
                role="menuitem"
              >
                📋 Export current page
              </button>
              <button
                className="export-menu-item"
                onClick={() => handleExport("selected")}
                disabled={!hasSelection}
                role="menuitem"
                title={
                  !hasSelection ? "Select rows to export only selected" : ""
                }
              >
                ✓ Export selected rows
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table scroll container */}
      <div className="table-scroll" style={{ position: "relative" }}>
        {loading && (
          <div className="table-loading-overlay" aria-hidden>
            <div className="table-spinner" />
          </div>
        )}

        <table className="generic-table" role="table">
          <thead>
            <tr>
              {selectable && (
                <th className="col-select">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={selected.size === data.length && data.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: col.width }}
                  className={`col-${col.id} ${
                    col.align ? `align-${col.align}` : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pagedData.map((row, rIdx) => {
              const globalIdx = serverSide
                ? rIdx + (page - 1) * pageSize
                : (page - 1) * pageSize + rIdx;
              const k = keyFor(row, globalIdx);

              return (
                <tr
                  key={String(k)}
                  className={`row ${selected.has(k) ? "row-selected" : ""}`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement | null;
                    if (onRowClick && target) {
                      const tag = (target.tagName || "").toUpperCase();
                      if (tag !== "INPUT" && tag !== "BUTTON" && tag !== "A") {
                        onRowClick(row, rIdx);
                      }
                    }
                  }}
                  tabIndex={0}
                >
                  {selectable && (
                    <td className="col-select" data-label="">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${rIdx + 1}`}
                        checked={selected.has(k)}
                        onChange={() => toggleSelect(k)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}

                  {columns.map((col) => (
                    <td
                      key={col.id}
                      data-label={
                        typeof col.header === "string" ? col.header : ""
                      }
                      className={`cell col-${col.id} ${col.className ?? ""} ${
                        col.align ? `align-${col.align}` : ""
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderCellContent(col, row, rIdx)}
                    </td>
                  ))}
                </tr>
              );
            })}

            {pagedData.length === 0 && (
              <tr className="empty-row">
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasSelection && (
        <div className="table-toolbar">
          <span>
            {selected.size} row{selected.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => {
              setSelected(new Set());
              if (onSelectionChange) onSelectionChange([]);
            }}
          >
            Clear selection
          </button>
        </div>
      )}

      {pagination && (
        <div
          className="table-pagination"
          role="navigation"
          aria-label="Table pagination"
        >
          <div className="pagination-info">
            <span>
              Showing {effectiveTotal === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(
                effectiveTotal,
                (page - 1) * pageSize + pagedData.length
              )}{" "}
              of {effectiveTotal}
            </span>
          </div>

          <div className="pagination-controls">
            <button
              className="pg-btn"
              onClick={() => goTo(1)}
              disabled={page === 1 || loading}
              aria-label="First page"
            >
              «
            </button>
            <button
              className="pg-btn"
              onClick={() => goTo(page - 1)}
              disabled={page === 1 || loading}
              aria-label="Previous page"
            >
              ‹
            </button>

            {(() => {
              const pages: Array<number | "dots"> = [];
              const start = Math.max(1, page - 2);
              const end = Math.min(totalPages, page + 2);

              if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push("dots");
              }
              for (let p = start; p <= end; p++) pages.push(p);
              if (end < totalPages) {
                if (end < totalPages - 1) pages.push("dots");
                pages.push(totalPages);
              }
              return pages.map((p, idx) =>
                p === "dots" ? (
                  <span key={"dots-" + idx} className="pg-dots">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`pg-btn page-number ${
                      p === page ? "active" : ""
                    }`}
                    onClick={() => goTo(p as number)}
                    disabled={p === page || loading}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              );
            })()}

            <button
              className="pg-btn"
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages || loading}
              aria-label="Next page"
            >
              ›
            </button>
            <button
              className="pg-btn"
              onClick={() => goTo(totalPages)}
              disabled={page === totalPages || loading}
              aria-label="Last page"
            >
              »
            </button>

            <select
              className="pg-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={loading}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <ChipOverflowDialog
        open={chipDialog.open}
        onClose={() => setChipDialog({ open: false, items: [] })}
        chips={chipDialog.items}
      />
    </div>
  );
}
