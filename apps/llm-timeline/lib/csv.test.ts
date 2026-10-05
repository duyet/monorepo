import { describe, expect, test } from "vitest";
import { detectColumns, parseCsv } from "./csv";

const aliases = {
  name: ["model", "name"],
  date: ["announced", "date"],
  org: ["organization", "org"],
  params: ["parameters (b)", "parameters"],
};

describe("parseCsv", () => {
  test("returns rows from a small RFC 4180 fixture", () => {
    const rows = parseCsv('name,desc\n"hello, world",test\n');

    expect(rows).toEqual([
      ["name", "desc"],
      ["hello, world", "test"],
    ]);
  });
});

describe("detectColumns", () => {
  test("maps a small header fixture to column indexes", () => {
    expect(
      detectColumns(
        ["Model", "Announced\n▼", "Organization", "Parameters \n(B)"],
        aliases
      )
    ).toEqual({
      name: 0,
      date: 1,
      org: 2,
      params: 3,
    });
  });
});