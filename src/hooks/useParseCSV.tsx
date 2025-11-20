// src/hooks/useParseCSV.ts
import { useCallback, useState } from "react";
import type { ParsedRow, ParseCSVOptions } from "../utils/parseCSV";
import { parseCSV } from "../utils/parseCSV";

export function useParseCSV() {
  const [data, setData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData([]);
    setHeaders([]);
    setError(null);
    setLoading(false);
  }, []);

  const parseFile = useCallback(
    async (file: File | undefined, opts?: ParseCSVOptions) => {
      if (!file) return;
      setLoading(true);
      setError(null);
      try {
        const { data: rows, headers: hdrs } = await parseCSV(file, opts);
        setData(rows);
        setHeaders(hdrs);
        return { rows, headers: hdrs };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        return { rows: [], headers: [] as string[] };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    headers,
    loading,
    error,
    parseFile,
    reset,
  } as const;
}
