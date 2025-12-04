// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useMemo,
//   useState,
// } from "react";
// import NotificationContainer from "../components/CustomUI/NotificationContainer/NotificationContainer";
// import {
//   uid,
//   DEFAULT_DURATION,
//   DEFAULT_MAX_VISIBLE,
// } from "../utils/notifications";
// import type {
//   NotificationItem,
//   NotifyOptions,
//   NotificationsContextValue,
// } from "../types/Notification";

// const NotificationsContext = createContext<NotificationsContextValue | null>(
//   null
// );

// export type ProviderProps = {
//   children: React.ReactNode;
//   maxVisible?: number;
//   position?:
//     | "top-right"
//     | "top-left"
//     | "bottom-right"
//     | "bottom-left"
//     | "top-center"
//     | "bottom-center";
//   defaultDuration?: number;
// };

// export function NotificationProvider({
//   children,
//   maxVisible = DEFAULT_MAX_VISIBLE,
//   position = "top-right",
//   defaultDuration = DEFAULT_DURATION,
// }: ProviderProps) {
//   const [items, setItems] = useState<NotificationItem[]>([]);

//   // return id if user wants to dismiss manually
//   // NOTE: since id was generated inside setItems for duplicates it's not available here for that branch;
//   // But for new notifications we created id inside setItems scope, so instead we return undefined for duplicates.
//   // If you must always return id, create id before setItems. Simpler: create id before setItems:

//   // Small tweak: create an id before setItems to always return it
//   const notifyWithId = useCallback(
//     (message: string, opts: NotifyOptions = {}) => {
//       const id = uid();
//       const now = Date.now();
//       setItems((prev) => {
//         const variant = opts.variant ?? "info";
//         const dupIndex = prev.findIndex(
//           (p) => p.message === message && p.variant === variant
//         );

//         if (dupIndex >= 0) {
//           const next = prev.slice();
//           const existing = next[dupIndex];
//           next.splice(dupIndex, 1);
//           const updated: NotificationItem = {
//             ...existing,
//             createdAt: now,
//             duration:
//               typeof opts.duration === "number"
//                 ? opts.duration
//                 : existing.duration,
//             count: (existing.count ?? 1) + 1,
//             title: opts.title ?? existing.title,
//             action: opts.action ?? existing.action,
//             priority: opts.priority ?? existing.priority ?? 0,
//             // keep same id so UI can reuse element if desired:
//             id: existing.id,
//           };
//           return [updated, ...next];
//         }

//         const item: NotificationItem = {
//           id,
//           message,
//           title: opts.title,
//           variant,
//           duration:
//             typeof opts.duration === "number" ? opts.duration : defaultDuration,
//           action: opts.action,
//           createdAt: now,
//           priority: opts.priority ?? 0,
//           count: 1,
//         };

//         const next = [item, ...prev];
//         next.sort((a, b) => {
//           const pa = a.priority ?? 0;
//           const pb = b.priority ?? 0;
//           if (pa !== pb) return pb - pa;
//           return (b.createdAt ?? 0) - (a.createdAt ?? 0);
//         });
//         return next;
//       });

//       return id;
//     },
//     [defaultDuration]
//   );

//   const dismiss = useCallback((id: string) => {
//     setItems((prev) => prev.filter((p) => p.id !== id));
//   }, []);

//   const clearAll = useCallback(() => setItems([]), []);

//   const api = useMemo(
//     () => ({
//       notify: notifyWithId,
//       success: (message: string, opts?: NotifyOptions) =>
//         notifyWithId(message, { ...opts, variant: "success" }),
//       info: (message: string, opts?: NotifyOptions) =>
//         notifyWithId(message, { ...opts, variant: "info" }),
//       warning: (message: string, opts?: NotifyOptions) =>
//         notifyWithId(message, { ...opts, variant: "warning" }),
//       error: (message: string, opts?: NotifyOptions) =>
//         notifyWithId(message, { ...opts, variant: "error" }),
//       dismiss,
//       clearAll,
//     }),
//     [notifyWithId, dismiss, clearAll]
//   );

//   return (
//     <NotificationsContext.Provider value={api}>
//       {children}
//       <NotificationContainer
//         items={items}
//         dismiss={dismiss}
//         maxVisible={maxVisible}
//         position={position}
//       />
//     </NotificationsContext.Provider>
//   );
// }

// // eslint-disable-next-line react-refresh/only-export-components
// export function useNotifications(): NotificationsContextValue {
//   const ctx = useContext(NotificationsContext);
//   if (!ctx)
//     throw new Error(
//       "useNotifications must be used inside NotificationProvider"
//     );
//   return ctx;
// }
