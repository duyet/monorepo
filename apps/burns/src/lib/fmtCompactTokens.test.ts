import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { fmtCompactTokens } from "./sources";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "__fixtures__",
      "compact-tokens.json"
    ),
    "utf-8"
  )
) as Array<{ n: number; expected: string }>;

describe("fmtCompactTokens", () => {
  test("compacts the fixture counts", () => {
    for (const row of fixture) {
      expect(fmtCompactTokens(row.n)).toBe(row.expected);
    }
  });
});
