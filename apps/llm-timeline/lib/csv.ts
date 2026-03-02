/**
 * Shared CSV parsing and column detection utilities
 * Used by all data source adapters
 */

/**
 * RFC 4180 compliant CSV parser
 * Handles quoted fields, embedded commas, and newlines
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;

  while (i < text.length) {
    const row: string[] = [];

    while (i < text.length) {
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = "";
        while (i < text.length) {
          if (text[i] === '"' && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (text[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            field += text[i++];
          }
        }
        row.push(field);
        if (text[i] === ",") i++;
        else if (text[i] === "\r") i++;
      } else {
        // Unquoted field — read until comma or newline
        let field = "";
        while (
          i < text.length &&
          text[i] !== "," &&
          text[i] !== "\n" &&
          text[i] !== "\r"
        ) {
          field += text[i++];
        }
        row.push(field.trim());
        if (text[i] === ",") i++;
        else if (text[i] === "\r") i++;
      }

      // End of row
      if (i >= text.length || text[i] === "\n") {
        i++; // skip newline
        break;
      }
    }

    if (row.length > 0 && !(row.length === 1 && row[0] === "")) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Normalize a header cell for alias matching:
 * - Lowercase
 * - Replace newlines/tabs with space
 * - Remove characters that aren't alphanumeric, space, or parentheses
 * - Collapse multiple spaces
 * - Trim
 *
 * e.g. "Parameters \n(B)" → "parameters (b)"
 *      "Announced\n▼"     → "announced"
 *      "Public?"          → "public"
 */
export function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[\n\r\t]/g, " ")
    .replace(/[^a-z0-9 ()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generic column detection — maps field names to column indices
 * using a provided alias map
 *
 * @param headers - Raw header row from CSV
 * @param aliases - Map of field names to possible header variants
 * @returns Map of field name → column index
 */
export function detectColumns(
  headers: string[],
  aliases: Record<string, string[]>
): Record<string, number> {
  const mapping: Record<string, number> = {};
  const normalizedHeaders = headers.map(normalizeHeader);

  for (const [field, fieldAliases] of Object.entries(aliases)) {
    // Exact match first
    let idx = normalizedHeaders.findIndex(
      (h) => h.length > 0 && fieldAliases.includes(h)
    );
    // Then prefix match for long headers like "parameters b tokens trained b"
    if (idx === -1) {
      idx = normalizedHeaders.findIndex(
        (h) =>
          h.length > 2 &&
          fieldAliases.some(
            (a) => a.length > 2 && (h.startsWith(a) || a.startsWith(h))
          )
      );
    }
    if (idx !== -1) {
      mapping[field] = idx;
    }
  }

  return mapping;
}

/**
 * Find the row index that contains actual column headers.
 * Scans from the top and returns the first row where we can match
 * at least 2 of the required fields.
 *
 * @param rows - All CSV rows
 * @param aliases - Column alias map
 * @param requiredFields - Fields that must be present (default: name, date, org)
 */
export function findHeaderRowIndex(
  rows: string[][],
  aliases: Record<string, string[]>,
  requiredFields: string[] = ["name", "date", "org"]
): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const colMap = detectColumns(rows[i], aliases);
    const matchedRequired = requiredFields.filter((f) => f in colMap);
    // Require at least 2 required columns and that they map to distinct indices
    const indices = matchedRequired.map((f) => colMap[f]);
    const uniqueIndices = new Set(indices);
    if (
      matchedRequired.length >= 2 &&
      uniqueIndices.size === matchedRequired.length
    ) {
      return i;
    }
  }
  return -1;
}

/**
 * Get cell value safely from row
 */
export function getCellValue(row: string[], index: number | undefined): string {
  if (index === undefined || index < 0 || index >= row.length) return "";
  return (row[index] || "").trim();
}
