import type { Widget, DashboardLayoutItem } from "../types/Dashboardbuilder";

const KEY = "flowcart_dashboard_v1";

export const saveDashboard = (widgets: Widget[], layout: DashboardLayoutItem[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ widgets, layout }));
  } catch (e) {
    console.error("Failed to save dashboard", e);
  }
};

export const loadDashboard = (): { widgets: Widget[]; layout: DashboardLayoutItem[] } | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load dashboard", e);
    return null;
  }
};

export const generateId = (prefix = "w_") =>
  `${prefix}${Math.random().toString(36).slice(2, 9)}`;
