import { useRef, useState, useEffect } from "react";
import type { NotificationItem } from "../../../types/Notification";
import { DEFAULT_DURATION } from "../../../utils/notifications";
import { IoMdClose } from "react-icons/io";
import "./NotificationToast.css";

// React Icons
import {
  AiOutlineCheckCircle,
  AiOutlineInfoCircle,
  AiOutlineCloseCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";

function IconForVariant({ variant }: { variant: string }) {
  switch (variant) {
    case "success":
      return <AiOutlineCheckCircle className="nt-icon" />;
    case "error":
    case "danger":
      return <AiOutlineCloseCircle className="nt-icon" />;
    case "pending":
    case "warning":
      return <AiOutlineExclamationCircle className="nt-icon" />;
    case "info":
    case "active":
    default:
      return <AiOutlineInfoCircle className="nt-icon" />;
  }
}

function NotificationToast({
  item,
  dismiss, // <- changed
}: {
  item: NotificationItem;
  dismiss: (id: string) => void;
}) {
  const {
    id,
    title,
    message,
    variant = "info",
    duration = DEFAULT_DURATION,
    action,
  } = item;

  const [paused, setPaused] = useState(false);
  const startTsRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(duration);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (duration === 0) return; // sticky
    startTsRef.current = performance.now();
    let start = startTsRef.current;

    const tick = (now: number) => {
      if (reduced || paused) {
        start = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - (start ?? now);
      const left = Math.max(0, remainingRef.current - elapsed);

      if (progressRef.current) {
        const pct = 1 - left / duration;
        progressRef.current.style.transform = `scaleX(${Math.min(
          1,
          Math.max(0, pct)
        )})`;
      }

      if (left <= 16) dismiss(id); // use dismiss(id)
      else rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, paused, dismiss, reduced, id]);

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);
  const handleFocus = () => setPaused(true);
  const handleBlur = () => setPaused(false);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") dismiss(id);
  };

  const cls = `status-${variant}`;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={onKey}
      className={`nt-toast ${cls}`}
      aria-label={title ? `${title}: ${message}` : message}
    >
      <div className="nt-body">
        <div className="nt-icon-wrap" aria-hidden>
          <IconForVariant variant={variant} />
        </div>

        <div className="nt-content">
          {title && <div className="nt-title">{title}</div>}
          <div className="nt-message">{message}</div>
        </div>

        <div className="nt-controls">
          {action && (
            <button
              className="nt-action"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(id, () => dismiss(id));
              }}
              aria-label={action.label}
            >
              {action.label}
            </button>
          )}
          <button
            aria-label="Dismiss notification"
            className="nt-close"
            onClick={(e) => {
              e.stopPropagation();
              dismiss(id);
            }}
          >
            <IoMdClose />
          </button>
        </div>
      </div>

      {duration > 0 && (
        <div className="nt-progress" aria-hidden>
          <div ref={progressRef} className="nt-progress-bar" />
        </div>
      )}
    </div>
  );
}

export default NotificationToast;
