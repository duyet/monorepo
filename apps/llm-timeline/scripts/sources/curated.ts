/**
 * curated.ts — DataSourceAdapter for Google Sheets curated data
 */

import {
  detectColumns,
  findHeaderRowIndex,
  getCellValue,
  parseCsv,
} from "../../lib/csv";
import {
  normalizeDate,
  normalizeLicense,
  normalizeParams,
  normalizeText,
  normalizeType,
} from "../../lib/normalizers";
import type { DataSourceAdapter, Model } from "../../lib/types";

const DEFAULT_SHEET_ID = "1kc262HZSMAWI6FVsh0zJwbB-ooYvzhCHaHcNUiA0_hY";
const DEFAULT_SHEET_GID = "1158069878";

const COLUMN_ALIASES: Record<string, string[]> = {
  name: ["name", "model", "model name", "title"],
  date: [
    "date",
    "release date",
    "released",
    "launch date",
    "announced",
    "announced date",
    "release",
  ],
  org: ["org", "organization", "company", "maker", "lab", "laboratory"],
  params: [
    "params",
    "parameters",
    "size",
    "model size",
    "parameters b",
    "params b",
    "parameters b ",
  ],
  type: ["type", "model type", "kind", "tags", "tag", "arch", "architecture"],
  license: [
    "license",
    "licence",
    "access type",
    "public",
    "public ",
    "availability",
  ],
  desc: ["desc", "description", "notes", "summary", "note", "details"],
};

function buildCsvUrl(): string {
  const sheetId = process.env.GOOGLE_SHEET_ID ?? DEFAULT_SHEET_ID;
  const sheetGid = process.env.GOOGLE_SHEET_GID ?? DEFAULT_SHEET_GID;
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;
}

export const curated: DataSourceAdapter = {
  name: "curated",
  label: "Google Sheets (curated)",
  priority: 100,
  get urls() {
    return [buildCsvUrl()];
  },

  async fetch({ verbose = false } = {}): Promise<Model[]> {
    const csvUrl = buildCsvUrl();

    if (verbose) {
      console.log(`  Fetching curated CSV from ${csvUrl}...`);
    }

    let csvText: string;
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      csvText = await res.text();
    } catch (err) {
      throw new Error(`Failed to fetch curated data: ${err}`);
    }

    const rows = parseCsv(csvText);
    if (rows.length < 2) {
      throw new Error(`CSV has no data rows (only ${rows.length} rows total)`);
    }

    const headerRowIdx = findHeaderRowIndex(rows, COLUMN_ALIASES);
    if (headerRowIdx === -1) {
      throw new Error(
        `Could not find header row in first 10 rows.\n` +
          `Update COLUMN_ALIASES in sources/curated.ts to match the sheet headers.`
      );
    }

    const headers = rows[headerRowIdx];
    const dataRows = rows.slice(headerRowIdx + 1);
    const colMap = detectColumns(headers, COLUMN_ALIASES);

    if (verbose) {
      console.log(
        `  Header row at index ${headerRowIdx + 1}, ${dataRows.length} data rows`
      );
      console.log(`  Column mapping:`);
      for (const [field, idx] of Object.entries(colMap)) {
        console.log(`    ${field} → col[${idx}] = "${headers[idx]}"`);
      }
      const missing = Object.keys(COLUMN_ALIASES).filter((f) => !(f in colMap));
      if (missing.length > 0) {
        console.log(
          `    Not mapped: ${missing.join(", ")} (will use defaults)`
        );
      }
    }

    const required = ["name", "date", "org"];
    const missingRequired = required.filter((f) => !(f in colMap));
    if (missingRequired.length > 0) {
      throw new Error(
        `Missing required columns: ${missingRequired.join(", ")}\n` +
          `Detected headers: ${headers.join(", ")}`
      );
    }

    const models: Model[] = [];
    let skipped = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];

      const rawName = getCellValue(row, colMap.name);
      const rawDate = getCellValue(row, colMap.date);
      const rawOrg = getCellValue(row, colMap.org);

      const name = normalizeText(rawName);
      const date = normalizeDate(rawDate);
      const org = normalizeText(rawOrg);

      if (!name || !date || !org) {
        skipped++;
        if (verbose && skipped <= 5) {
          console.log(
            `    Skip row ${headerRowIdx + i + 2}: name=${JSON.stringify(name)} date=${JSON.stringify(rawDate)} org=${JSON.stringify(org)}`
          );
        }
        continue;
      }

      models.push({
        name,
        date,
        org,
        params: normalizeParams(getCellValue(row, colMap.params)),
        type: normalizeType(getCellValue(row, colMap.type)),
        license: normalizeLicense(getCellValue(row, colMap.license)),
        desc: normalizeText(getCellValue(row, colMap.desc)),
        source: "curated",
      });
    }

    if (verbose) {
      console.log(
        `  Parsed ${dataRows.length} rows → ${models.length} valid, ${skipped} skipped`
      );
    }

    models.sort((a, b) => a.date.localeCompare(b.date));
    return models;
  },
};
