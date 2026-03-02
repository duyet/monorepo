/**
 * epoch.ts — DataSourceAdapter for Epoch.ai data
 */

import type { Model, DataSourceAdapter } from "../../lib/types";
import { parseCsv, detectColumns, getCellValue } from "../../lib/csv";
import {
  normalizeDate,
  mapAccessibility,
  convertNumericParams,
  normalizeText,
  formatTrainingCompute,
} from "../../lib/normalizers";

const EPOCH_CSV_URL = "https://epoch.ai/data/all_ai_models.csv";

const EPOCH_COLUMN_ALIASES: Record<string, string[]> = {
  name: ["model name", "model", "name", "system"],
  org: [
    "organization",
    "organization(s)",
    "org",
    "lab",
    "institution",
    "company",
  ],
  date: ["publication date", "release date", "date", "announced", "published"],
  params: [
    "parameters",
    "parameters (count)",
    "params",
    "model size",
    "# parameters",
  ],
  license: [
    "model accessibility",
    "accessibility",
    "license",
    "availability",
    "open source?",
  ],
  desc: ["notes", "description", "summary", "details", "comments"],
  domain: ["domain", "domain(s)", "application domain"],
  task: ["task", "task(s)", "task type"],
  approach: ["approach", "method", "architecture type"],
  trainingCompute: ["training compute", "compute", "flops", "training flops"],
  trainingHardware: ["training hardware", "hardware", "hardware used"],
  trainingDataset: ["training dataset", "dataset", "training data"],
  link: ["link", "url", "paper", "publication"],
  authors: ["authors", "author(s)", "researchers"],
};

export const epoch: DataSourceAdapter = {
  name: "epoch",
  label: "Epoch AI",
  priority: 50,
  urls: [EPOCH_CSV_URL],

  async fetch({ verbose = false } = {}): Promise<Model[]> {
    if (verbose) {
      console.log(`  Fetching Epoch.ai CSV from ${EPOCH_CSV_URL}...`);
    }

    let csvText: string;
    try {
      const res = await fetch(EPOCH_CSV_URL);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      csvText = await res.text();
    } catch (err) {
      throw new Error(`Failed to fetch Epoch.ai data: ${err}`);
    }

    const rows = parseCsv(csvText);
    if (rows.length < 2) {
      throw new Error(`CSV has no data rows (only ${rows.length} rows total)`);
    }

    // First row is the header row
    const headers = rows[0];
    const dataRows = rows.slice(1);
    const colMap = detectColumns(headers, EPOCH_COLUMN_ALIASES);

    if (verbose) {
      console.log(`  Header row: ${headers.slice(0, 10).join(" | ")}...`);
      console.log(`  Data rows: ${dataRows.length}`);
      console.log(`  Column mapping:`);
      for (const [field, idx] of Object.entries(colMap)) {
        console.log(`    ${field} → col[${idx}] = "${headers[idx]}"`);
      }
      const missing = ["name", "org", "date", "params", "license"].filter(
        (f) => !(f in colMap)
      );
      if (missing.length > 0) {
        console.log(`    Not mapped: ${missing.join(", ")}`);
      }
    }

    const required = ["name", "org", "date"];
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

      const name = normalizeText(getCellValue(row, colMap.name));
      const org = normalizeText(getCellValue(row, colMap.org));
      const rawDate = getCellValue(row, colMap.date);

      if (!name || !org || !rawDate) {
        skipped++;
        if (verbose && skipped <= 5) {
          console.log(`    Skip row ${i + 2}: ${row.slice(0, 3).join(" | ")}`);
        }
        continue;
      }

      const date = normalizeDate(rawDate);
      if (!date) {
        skipped++;
        if (verbose && skipped <= 5) {
          console.log(`    Skip row ${i + 2}: unparseable date "${rawDate}"`);
        }
        continue;
      }

      // Parse params: try float first, then convertNumericParams, else use as-is
      const rawParams = getCellValue(row, colMap.params);
      let params: string | null = null;
      if (rawParams) {
        const numParams = parseFloat(rawParams.replace(/,/g, ""));
        if (!isNaN(numParams)) {
          params = convertNumericParams(numParams);
        } else {
          params = rawParams || null;
        }
      }

      const accessibility = getCellValue(row, colMap.license);
      const license = mapAccessibility(accessibility);

      const rawDesc = getCellValue(row, colMap.desc);
      const desc = rawDesc ? normalizeText(rawDesc) : `AI model by ${org}`;

      const model: Model = {
        name,
        date,
        org,
        params,
        type: "model",
        license,
        desc,
        source: "epoch",
      };

      // Flat metadata — only set fields with values
      const domain = getCellValue(row, colMap.domain);
      if (domain) model.domain = normalizeText(domain);

      const link = getCellValue(row, colMap.link);
      if (link) model.link = link;

      const rawCompute = getCellValue(row, colMap.trainingCompute);
      if (rawCompute) {
        const computeNum = parseFloat(rawCompute.replace(/,/g, ""));
        model.trainingCompute = !isNaN(computeNum)
          ? formatTrainingCompute(computeNum)
          : rawCompute;
      }

      const trainingHardware = getCellValue(row, colMap.trainingHardware);
      if (trainingHardware)
        model.trainingHardware = normalizeText(trainingHardware);

      const trainingDataset = getCellValue(row, colMap.trainingDataset);
      if (trainingDataset)
        model.trainingDataset = normalizeText(trainingDataset);

      const authors = getCellValue(row, colMap.authors);
      if (authors) model.authors = normalizeText(authors);

      models.push(model);
    }

    if (verbose) {
      console.log(
        `  Parsed ${dataRows.length} rows → ${models.length} valid, ${skipped} skipped`
      );
      if (models.length > 0) {
        console.log(
          `  Date range: ${models[0]?.date} to ${models[models.length - 1]?.date}`
        );
      }
    }

    models.sort((a, b) => a.date.localeCompare(b.date));
    return models;
  },
};
