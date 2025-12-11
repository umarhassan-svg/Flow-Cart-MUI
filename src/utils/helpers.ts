// Parse inline CSV-ish string into [{label, value}] for charts/metrics
export const parseInlineData = (raw: string) => {
  if (!raw) return [] as { label: string; value: number }[];
  return raw
    .split(/\n|\r\n/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((row) => {
      const parts = row.split(/,|\t/).map((p) => p.trim());
      const label = parts[0] ?? "";
      const value = Number(parts[1]) || 0;
      return { label, value };
    });
};

// Parse inline CSV-ish string into headers + rows for multi-column tables
export const parseInlineTable = (raw: string) => {
  const rows = raw
    .split(/\n|\r\n/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((row) => row.split(/,|\t/).map((p) => p.trim()));

  if (!rows.length) return { headers: ["Label", "Value"], rows: [] as string[][] };

  const headers = rows[0].length > 2 ? rows[0] : ["Label", "Value"];
  const dataRows = rows[0].length > 2 ? rows.slice(1) : rows;

  return { headers, rows: dataRows };
};