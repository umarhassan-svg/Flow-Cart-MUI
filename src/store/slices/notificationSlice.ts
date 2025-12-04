// src/store/notificationsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NotificationItem, NotificationVariant, NotificationAction } from "../../types/Notification";
import { nanoid } from "@reduxjs/toolkit";

export type NotifyPayload = {
  message: string;
  title?: string;
  variant?: NotificationVariant;
  duration?: number;
  action?: NotificationAction;
  priority?: number;
};

type NotificationsState = {
  items: NotificationItem[];
};

const initialState: NotificationsState = { items: [] };

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // payload is a partially-built notification (no id/createdAt)
    notify(state, action: PayloadAction<NotifyPayload>) {
      const { message, title, variant = "info", duration, action: act, priority = 0 } = action.payload;
      const now = Date.now();

      // find duplicate by message + variant (same logic as your context)
      const dupIndex = state.items.findIndex((p) => p.message === message && (p.variant ?? "info") === variant);

      if (dupIndex >= 0) {
        const existing = state.items[dupIndex];
        // update existing: bump count, refresh createdAt/duration/title/action/priority but keep id
        const updated: NotificationItem = {
          ...existing,
          createdAt: now,
          duration: typeof duration === "number" ? duration : existing.duration,
          count: (existing.count ?? 1) + 1,
          title: title ?? existing.title,
          action: act ?? existing.action,
          priority: priority ?? existing.priority ?? 0,
          // keep same id
          };
        // remove the old and add updated front
        state.items.splice(dupIndex, 1);
        state.items.unshift(updated);
      } else {
        // new item
        const id = nanoid();
        const item: NotificationItem = {
          id,
          message,
          title,
          variant,
          duration,
          createdAt: now,
          action: act,
          priority,
          count: 1,
        };
        state.items.unshift(item);
          }

      // sort by priority desc then createdAt desc
      state.items.sort((a, b) => {
        const pa = a.priority ?? 0;
        const pb = b.priority ?? 0;
        if (pa !== pb) return pb - pa;
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      });
    },

    dismissNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },

    clearAllNotifications(state) {
      state.items = [];
    },

    // optional: removeOld beyond maxVisible or stale cleanup (not required)
  },
});

export const { notify, dismissNotification, clearAllNotifications } = slice.actions;
export default slice.reducer;
