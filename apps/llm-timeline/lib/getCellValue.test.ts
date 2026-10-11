import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getCellValue } from "./csv";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "__fixtures__",
      "cell-value.json",
    ),
    "utf-8",
  ),
) as {
  row: string[];
  cases: Array<{ index: number; expected: string }>;
};

describe("getCellValue", () => {
  it("returns the trimmed fixture cell, or an empty string when the index is unusable", () => {
    for (const row of fixture.cases) {
      expect(getCellValue(fixture.row, row.index)).toBe(row.expected);
    }
    expect(getCellValue(fixture.row, undefined)).toBe("");
  });
});
