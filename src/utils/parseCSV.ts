// src/utils/parseCSV.ts
import Papa from "papaparse";

export type ParsedRow = Record<string, string>;

export type ParseCSVOptions = {
  /** If provided, parse only first n rows for preview (Papaparse `preview`) */
  previewRows?: number;
  /** Use worker thread for large files (default: true) */
  worker?: boolean;
  /** Called for each parsed chunk (streaming) */
  onChunk?: (rows: ParsedRow[]) => void;
  /** Whether to skip empty lines (default true) */
  skipEmptyLines?: boolean;
};

/**
 * parseCSV
 * Parse a CSV file into an array of rows (objects keyed by header).
 * Resolves with { data, headers } or rejects with an Error.
 */
export async function parseCSV(
  file: File,
  opts: ParseCSVOptions = {}
): Promise<{ data: ParsedRow[]; headers: string[] }> {
  const { previewRows, worker = true, onChunk, skipEmptyLines = true } = opts;

  return new Promise((resolve, reject) => {
    try {
      Papa.parse<ParsedRow>(file, {
        header: true,
        skipEmptyLines,
        preview: previewRows,
        worker,
        chunk: onChunk
          ? function (results) {
              // results.data is typed as any[] by papaparse types, cast safely
              const rows = (results.data || []) as ParsedRow[];
              onChunk(rows);
            }
          : undefined,
        complete(results) {
          const data = (results.data || []) as ParsedRow[];
          const headers = (results.meta.fields || []) as string[];
          resolve({ data, headers });
        },
        error(err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        },
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
