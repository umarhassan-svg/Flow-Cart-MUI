// src/utils/generateCSV.ts
import Papa from "papaparse";
import type { Column } from "../types/TableColumn";

/** Basic date formatter for CSV (ISO). */
export function csvFormatDate(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toISOString();
}

/**
 * Convert columns + rows into array of plain objects suitable for Papa.unparse().
 * - Uses column.header (string) as CSV column name if available, otherwise column.id.
 * - Uses accessor (function or key) or property id to read the raw value.
 * - Applies simple formatting for 'date' and 'chips' types.
 */
export function prepareDataForCSV<T>(
  columns: Column<T>[],
  rows: T[]
): Array<Record<string, unknown>> {
  const headers = columns.map((col) =>
    typeof col.header === "string" ? col.header : String(col.id)
    );
    
    console.log(rows)

  return rows.map((row) => {
    const out: Record<string, unknown> = {};

    for (let idx = 0; idx < columns.length; idx += 1) {
      const col = columns[idx];
        const key = headers[idx] ?? String(col.id);
        


      let rawValue: unknown;

      if (col.accessor != null) {
        if (typeof col.accessor === "function") {
          // accessor as function
          const fn = col.accessor as (r: T) => unknown;
          rawValue = fn(row);
        } else {
          // accessor as key
          const k = String(col.accessor);
          rawValue = (row as Record<string, unknown>)[k];
        }
      } else {
        rawValue = (row as Record<string, unknown>)[String(col.id)];
      }

      if (col.type === "date") {
        out[key] = csvFormatDate(rawValue);
      } else if (col.type === "chips") {
        if (Array.isArray(rawValue)) {
          out[key] = (rawValue as unknown[]).map((v) => String(v)).join("; ");
        } else {
          out[key] = rawValue === undefined || rawValue === null ? "" : String(rawValue);
        }
      } else if (col.type === "chip" || col.type === "status") {
        out[key] = rawValue === undefined || rawValue === null ? "" : String(rawValue);
      } else {
        out[key] = rawValue === undefined || rawValue === null ? "" : rawValue;
      }
    }

    return out;
  });
}

/**
 * Trigger browser download of CSV text using Blob + anchor.
 * Uses Papa.unparse so we retain proper escaping and quoting.
 */
export function exportToCSV(
  data: Array<Record<string, unknown>>,
  filename = `export-${new Date().toISOString()}.csv`,
  delimiter = ","
): void {
  const csv = Papa.unparse(data, { delimiter });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  void URL.revokeObjectURL(url);
}

/**
 * Convenience: build then export
 */
export function exportTableCSV<T>(
  columns: Column<T>[],
  rows: T[],
  filename?: string
): void {
  const prepared = prepareDataForCSV(columns, rows);
  const finalName = filename ?? `export-${new Date().toISOString()}.csv`;
  exportToCSV(prepared, finalName);
}
