export type NotificationVariant = "success" | "info" | "warning" | "error";

export type NotificationAction = {
  label: string;
  // callback receives id and dismiss function
  onClick: (id: string, dismiss: (id: string) => void) => void;
};

export type NotificationItem = {
  id: string;
  title?: string;
  message: string;
  variant?: NotificationVariant;
  duration?: number; // ms; 0 = sticky
  createdAt?: number;
  action?: NotificationAction;
  // priority: higher priority appears above others (optional)
  priority?: number;
  count?: number;
};

export type NotifyOptions = Partial<
  Pick<NotificationItem, "title" | "variant" | "duration" | "action" | "priority">
>;

export type NotificationsContextValue = {
  notify: (message: string, opts?: NotifyOptions) => string;
  success: (message: string, opts?: NotifyOptions) => string;
  info: (message: string, opts?: NotifyOptions) => string;
  warning: (message: string, opts?: NotifyOptions) => string;
  error: (message: string, opts?: NotifyOptions) => string;
  dismiss: (id: string) => void;
  clearAll: () => void;
};