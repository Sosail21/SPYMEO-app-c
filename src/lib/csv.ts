// src/lib/csv.ts
export function toCsv<T extends Record<string, any>>(rows: T[], headers?: string[]): string {
  if (!rows || rows.length === 0) return "";
  const cols = headers ?? Object.keys(rows[0]);

  const esc = (v: any) => {
    if (v == null) return "";
    const s = String(v);
    // échapper guillemets + forcer quotes si ; ou \n
    const needsQuote = s.includes(";") || s.includes("\n") || s.includes('"');
    const safe = s.replace(/"/g, '""');
    return needsQuote ? `"${safe}"` : safe;
  };

  const head = cols.join(";");
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(";")).join("\n");
  return head + "\n" + body;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }); // BOM UTF-8
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
