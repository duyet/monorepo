import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseModelNamesFromParam } from "./compare-utils";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "__fixtures__",
      "model-names.json",
    ),
    "utf-8",
  ),
) as { param: string; names: string[] };

describe("parseModelNamesFromParam", () => {
  it("keeps the first four non-empty names from the fixture", () => {
    expect(parseModelNamesFromParam(fixture.param)).toEqual(fixture.names);
  });

  it("returns an empty list when the param is missing", () => {
    expect(parseModelNamesFromParam(undefined)).toEqual([]);
    expect(parseModelNamesFromParam("")).toEqual([]);
  });
});
