import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findHeaderRowIndex } from "./csv";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "__fixtures__",
      "header-rows.json",
    ),
    "utf-8",
  ),
) as {
  aliases: Record<string, string[]>;
  sheet: string[][];
  headerIndex: number;
  noHeader: string[][];
  noHeaderIndex: number;
};

describe("findHeaderRowIndex", () => {
  it("returns the fixture header row", () => {
    expect(findHeaderRowIndex(fixture.sheet, fixture.aliases)).toBe(
      fixture.headerIndex,
    );
  });

  it("returns -1 when the fixture has no header row", () => {
    expect(findHeaderRowIndex(fixture.noHeader, fixture.aliases)).toBe(
      fixture.noHeaderIndex,
    );
  });
});
