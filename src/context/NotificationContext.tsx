// NotificationSystem.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  NotificationItem,
  NotifyOptions,
  NotificationsContextValue,
} from "../types/Notification";

import NotificationContainer from "../components/CustomUI/NotificationContainer/NotificationContainer";
import { uid } from "../utils/notifications";

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

export type ProviderProps = {
  children: React.ReactNode;
  // max visible to show at once
  maxVisible?: number;
  // position: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  // default auto-dismiss duration (ms)
  defaultDuration?: number;
};

export function NotificationProvider({
  children,
  maxVisible = 5,
  position = "top-right",
  defaultDuration = 6000,
}: ProviderProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  // Add a notification
  const notify = useCallback(
    (message: string, opts: NotifyOptions = {}) => {
      const id = uid();
      const now = Date.now();
      const item: NotificationItem = {
        id,
        message,
        title: opts.title,
        variant: opts.variant ?? "info",
        duration:
          typeof opts.duration === "number" ? opts.duration : defaultDuration,
        action: opts.action,
        createdAt: now,
        priority: opts.priority ?? 0,
      };

      setItems((prev) => {
        // find existing duplicate (same message + variant)
        const dupIndex = prev.findIndex(
          (p) => p.message === message && p.variant === item.variant
        );

        let next: NotificationItem[];
        if (dupIndex >= 0) {
          // update existing item: create new array where duplicate is replaced and moved to front
          next = prev.slice();
          next.splice(dupIndex, 1); // remove old
          next.unshift({ ...item, id: prev[dupIndex].id }); // reuse id if you prefer, or new id
        } else {
          next = [item, ...prev];
        }

        // stable sort: priority desc, then createdAt desc
        next.sort((a, b) => {
          const pa = a.priority ?? 0;
          const pb = b.priority ?? 0;
          if (pa !== pb) return pb - pa;
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
        });

        return next;
      });

      return id;
    },
    [defaultDuration]
  );

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  const api = useMemo(
    () => ({
      notify,
      success: (message: string, opts?: NotifyOptions) =>
        notify(message, { ...opts, variant: "success" }),
      info: (message: string, opts?: NotifyOptions) =>
        notify(message, { ...opts, variant: "info" }),
      warning: (message: string, opts?: NotifyOptions) =>
        notify(message, { ...opts, variant: "warning" }),
      error: (message: string, opts?: NotifyOptions) =>
        notify(message, { ...opts, variant: "error" }),
      dismiss,
      clearAll,
    }),
    [notify, dismiss, clearAll]
  );

  return (
    <NotificationsContext.Provider value={api}>
      {children}
      <NotificationContainer
        items={items}
        dismiss={dismiss}
        maxVisible={maxVisible}
        position={position}
      />
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  return ctx;
}
