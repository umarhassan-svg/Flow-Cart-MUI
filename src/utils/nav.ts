import type { ReactNode } from "react";

// src/types/nav.ts
export type NavItem = {
  key: string;
  label: string;
  path: string;
  permission?: string | string[] | null;
  order?: number;
  icon?: ReactNode;
  children?: NavItem[];
};
