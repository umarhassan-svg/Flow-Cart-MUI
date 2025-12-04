// src/hooks/useNotifications.ts
import { useMemo } from "react";
import { useAppDispatch } from "../store/hooks/useNotifications";
import {
  notify,
  dismissNotification,
  clearAllNotifications,
} from "../store/slices/notificationSlice";
import type { NotifyPayload } from "../store/slices/notificationSlice";

export function useNotifications() {
  const dispatch = useAppDispatch();

  const api = useMemo(() => {
    const notifyWith = (message: string, opts: Partial<NotifyPayload> = {}) =>
      dispatch(notify({ message, ...opts }));

    return {
      notify: notifyWith,
      success: (message: string, opts: Partial<NotifyPayload> = {}) =>
        notifyWith(message, { ...opts, variant: "success" }),
      info: (message: string, opts: Partial<NotifyPayload> = {}) =>
        notifyWith(message, { ...opts, variant: "info" }),
      warning: (message: string, opts: Partial<NotifyPayload> = {}) =>
        notifyWith(message, { ...opts, variant: "warning" }),
      error: (message: string, opts: Partial<NotifyPayload> = {}) =>
        notifyWith(message, { ...opts, variant: "error" }),
      dismiss: (id: string) => dispatch(dismissNotification(id)),
      clearAll: () => dispatch(clearAllNotifications()),
    };
  }, [dispatch]);

  return api;
}
