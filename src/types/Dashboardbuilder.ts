export type WidgetType = "chart" | "table" | "metric";

export type ChartType = "line" | "bar" | "pie";

export interface WidgetConfig {
  // A minimal config — extend this with data source, chartType, filters, etc.
  dataSource?: string; // URL or key for data source
  // for demo, allow inline data as CSV-ish string
  inlineData?: string;
  chartType?: ChartType;
}


export interface Widget {
id: string;
type: WidgetType;
title: string;
config: WidgetConfig;
}


// layout item used by react-grid-layout
export interface DashboardLayoutItem {
i: string; // widget id
x: number;
y: number;
w: number;
h: number;
}