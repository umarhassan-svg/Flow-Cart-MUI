/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import type { Column } from "../../../types/TableColumn";
import "./CustomTable.css"; // keep your file name

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
  pagination?: boolean; // enable pagination UI (client-side by default)
  initialPageSize?: number;
  pageSizeOptions?: number[]; // e.g. [10,25,50]
  serverSide?: boolean; // true if you load pages from server
  total?: number; // required for server-side to show total count (optional otherwise)
  onPageChange?: (page: number, pageSize: number) => void; // used in serverSide mode (but also called on page changes in client-side)
  loading?: boolean; // toggle loading overlay
}

export default function GenericTable<T>({
  columns = [],
  data = [],
  rowKey,
  selectable = false,
  onSelectionChange,
  dense = false,
  className = "",
  onRowClick,
  /* pagination props with defaults */
  pagination = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  serverSide = false,
  total,
  onPageChange,
  loading = false,
}: GenericTableProps<T>) {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  // pagination state (internal). If serverSide, user should handle fetching when onPageChange is called.
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // ensure page valid when data/total/pageSize changes
  useEffect(() => {
    const effectiveTotal = serverSide
      ? typeof total === "number"
        ? total
        : data.length
      : data.length;
    const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [data, total, pageSize, serverSide, page]);

  // expose page changes to parent if requested (serverSide typical)
  useEffect(() => {
    if (onPageChange) {
      onPageChange(page, pageSize);
    }
    // only call when page or pageSize changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /* ---------- compute paging ---------- */
  const effectiveTotal = serverSide
    ? typeof total === "number"
      ? total
      : data.length
    : data.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

  // client-side paged rows
  const pagedData = useMemo(() => {
    if (!pagination) return data;
    if (serverSide) return data; // server provides the current page slice already
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize, pagination, serverSide]);

  /* ---------- pagination helpers for UI ---------- */
  const goTo = (p: number) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    setPage(clamped);
  };

  const handlePageSizeChange = (nextSize: number) => {
    // when page size changes, reset to page 1 for predictable behavior
    setPageSize(nextSize);
    setPage(1);
  };

  /* ---------- render ---------- */
  return (
    <div
      className={`generic-table-wrapper ${dense ? "dense" : ""} ${className}`}
    >
      <div className="table-scroll" style={{ position: "relative" }}>
        {/* Loading overlay */}
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
                    <td className="col-select">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${rIdx + 1}`}
                        checked={selected.has(k)}
                        onChange={() => toggleSelect(k)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}

                  {columns.map((col) => {
                    let value: React.ReactNode;
                    if (col.accessor !== undefined) {
                      if (typeof col.accessor === "function") {
                        value = col.accessor(row);
                      } else {
                        value = (row as any)[col.accessor];
                      }
                    } else {
                      value = (row as any)[col.id];
                    }

                    const content = col.render
                      ? col.render(row, rIdx)
                      : value ?? "";

                    return (
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
                        {content}
                      </td>
                    );
                  })}
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
          <span>{selected.size} selected</span>
          <button
            onClick={() => {
              setSelected(new Set());
              if (onSelectionChange) onSelectionChange([]);
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* ---------- pagination UI ---------- */}
      {pagination && (
        <div
          className="table-pagination"
          role="navigation"
          aria-label="Table pagination"
        >
          <div className="pagination-info">
            {/* Showing range: */}
            <span>
              Showing {effectiveTotal === 0 ? 0 : (page - 1) * pageSize + 1} –{" "}
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

            {/* page numbers: show current +/- 2 with first/last when necessary */}
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

            {/* page size */}
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
    </div>
  );
}
