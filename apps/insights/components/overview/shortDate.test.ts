import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { shortDate } from "./helpers";

const fixture = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "__fixtures__", "short-date.json"),
    "utf-8",
  ),
) as { iso: string; formatted: string; invalid: string };

describe("shortDate", () => {
  test("formats the fixture timestamp as a short UTC date", () => {
    expect(shortDate(fixture.iso)).toBe(fixture.formatted);
  });

  test("returns an unparseable fixture string unchanged", () => {
    expect(shortDate(fixture.invalid)).toBe(fixture.invalid);
  });
});
