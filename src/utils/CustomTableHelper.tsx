/* eslint-disable react-refresh/only-export-components */
import type { Column } from "../types/TableColumn";
import "../components/CustomUI/CustomTable/CustomTable.css";
/* ---------- helper components (internal) ---------- */

import { useEffect, useState } from "react";

export function formatDate(v: unknown) {
  if (!v && v !== 0) return "—";
  const d = v instanceof Date ? v : new Date(String(v));
  if (isNaN(d.getTime())) return String(v);
  // e.g. Jan 02, 2025
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusBadge({ value }: { value: string | number | undefined }) {
  const text = value ?? "—";
  const v = String(value ?? "").toLowerCase();
  const map: Record<string, string> = {
    active: "status-active",
    enabled: "status-active",
    pending: "status-pending",
    inactive: "status-inactive",
    disabled: "status-inactive",
    error: "status-danger",
    failed: "status-danger",
    success: "status-success",
  };
  const cls = map[v] ?? "status-default";
  return <span className={`status-badge ${cls}`}>{text}</span>;
}

export function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}

export function SimpleMenu<T>({
  options,
  row,
}: {
  options: Column<T>["options"];
  row: T;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="menu-root" onMouseLeave={() => setOpen(false)}>
      <button
        className="menu-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((s) => !s);
        }}
        title="Actions"
      >
        <IconDots />
      </button>
      {open && (
        <div
          className="menu-popover"
          role="menu"
          onClick={(e) => e.stopPropagation()}
        >
          {options?.map((opt, i) => (
            <button
              key={opt.key ?? `${i}`}
              role="menuitem"
              className={`menu-item menu-item-${opt.variant ?? "default"}`}
              onClick={() => {
                if (opt.onClick) opt.onClick(row);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Chip({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="chip"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      {text}
    </button>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function ChipOverflowDialog({
  open,
  onClose,
  chips,
}: {
  open: boolean;
  onClose: () => void;
  chips: string[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="chip-dialog-backdrop" onClick={onClose}>
      <div
        className="chip-dialog"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chip-dialog-header">
          <strong>Items</strong>
          <button
            className="chip-dialog-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="chip-dialog-body">
          {chips.length === 0 ? (
            <div className="chip-empty">No items</div>
          ) : (
            <div className="chip-grid">
              {chips.map((c, i) => (
                <div key={i} className="chip-grid-item">
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
