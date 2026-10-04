import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("returns rows from a small RFC 4180 fixture", () => {
    const rows = parseCsv('name,desc\n"hello, world",test\n');

    expect(rows).toEqual([
      ["name", "desc"],
      ["hello, world", "test"],
    ]);
  });
});
