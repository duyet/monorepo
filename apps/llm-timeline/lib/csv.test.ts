import { describe, expect, test } from "vitest";
import { detectColumns } from "./csv";

const aliases = {
  name: ["model", "name"],
  date: ["announced", "date"],
  org: ["organization", "org"],
  params: ["parameters (b)", "parameters"],
};

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
