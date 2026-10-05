import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { singleQuote } from "./codegen";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "__fixtures__",
      "single-quote.json",
    ),
    "utf-8",
  ),
) as Array<{ input: string; expected: string }>;

describe("singleQuote", () => {
  it("escapes the fixture strings for a TypeScript single-quoted literal", () => {
    for (const row of fixture) {
      expect(singleQuote(row.input)).toBe(row.expected);
    }
  });
});
