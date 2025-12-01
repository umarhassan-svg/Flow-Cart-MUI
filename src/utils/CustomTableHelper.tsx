/* eslint-disable react-refresh/only-export-components */
import type { Column } from "../types/TableColumn";
import "../components/CustomUI/CustomTable/CustomTable.css";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";
/* ---------- helper components (internal) ---------- */

import { useEffect, useRef, useState } from "react";

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
    confirmed: "status-active",

    processing: "status-pending",
    pending: "status-pending",

    inactive: "status-inactive",
    disabled: "status-inactive",

    error: "status-danger",
    cancelled: "status-danger",

    fulfilled: "status-success",
    shipped: "status-success",

    // Optional safe defaults
    draft: "status-default",
    unknown: "status-unknown",
    default: "status-default",
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const MENU_MAX_WIDTH = 200; // maximum width of menu in px

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 40 * (options?.length ?? 1);

      // vertical position (flip if near bottom)
      const top =
        rect.bottom + menuHeight > window.innerHeight
          ? rect.top - menuHeight
          : rect.bottom;

      // horizontal position (prevent overflow right)
      let left = rect.left;
      if (left + MENU_MAX_WIDTH > window.innerWidth) {
        left = window.innerWidth - MENU_MAX_WIDTH - 8; // 8px padding from edge
      }
      if (left < 8) left = 8; // 8px padding from left edge

      setPopoverPosition({
        top: top + window.scrollY,
        left: left + window.scrollX,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, options]);

  useEffect(() => {
    if (!open) return;

    // use pointerdown to cover mouse/touch/stylus
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      // if click is inside trigger button or inside popover, do nothing
      if (
        (triggerRef.current && triggerRef.current.contains(target)) ||
        (popoverRef.current && popoverRef.current.contains(target))
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="menu-root">
      <button
        className="menu-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((s) => !s);
        }}
        title="Actions"
      >
        <IconDots />
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="menu-popover"
            role="menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left,
              maxWidth: MENU_MAX_WIDTH,
              width: "auto",
              zIndex: 9999,
              position: "absolute",
            }}
          >
            {options?.map((opt, i) => (
              <>
                <button
                  key={opt.key ?? `${i}`}
                  role="menuitem"
                  className={`menu-item menu-item-${opt.variant ?? "default"}`}
                  onClick={(e) => {
                    // stopPropagation just in case
                    e.stopPropagation();
                    if (opt.onClick) opt.onClick(row);
                    setOpen(false);
                  }}
                >
                  <span key={`icon-${i}`} className="menu-item-icons">
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              </>
            ))}
          </div>,
          document.body
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
            <IoMdClose />
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
