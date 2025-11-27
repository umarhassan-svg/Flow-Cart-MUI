/* eslint-disable @typescript-eslint/no-explicit-any */
/***** Types (copy into your shared types if you prefer) *****/
export type Align = "left" | "center" | "right";

export type Column<T> = {
  id: string;
  header: React.ReactNode;
  accessor?: ((row: T) => any) | keyof T;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  width?: string;
  align?: Align;
  className?: string;
  /**
   * Built-in renderer shortcuts. Use any of:
   * - "date" - formats Date or ISO string
   * - "chips" - expects row[col.id] to be string[] or single string
   * - "chip" - single chip
   * - "buttons" - show a compact actions menu; provide `options` below
   * - "status" - show a pill-style status badge
   */
  type?: "date" | "chips" | "chip" | "buttons" | "status" | string;

  /**
   * for buttons/menu columns - array of action definitions
   */
  options?: Array<{
    key?: string;
    label: string;
    onClick?: (row: T) => void;
    /** optional client-side flag for preventing row click */
    stopPropagation?: boolean;
    variant?: "primary" | "danger" | "ghost" | "default";
  }>;
};