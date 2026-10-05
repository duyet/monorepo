import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { Model } from "./types";
import { groupByYearMonth } from "./utils";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "__fixtures__",
      "year-month.json",
    ),
    "utf-8",
  ),
) as {
  models: Array<Pick<Model, "name" | "date">>;
  year: number;
  march: string[];
  june: string[];
};

describe("groupByYearMonth", () => {
  it("groups the fixture by year and month, newest day first", () => {
    const grouped = groupByYearMonth(fixture.models as Model[]);
    const months = grouped.get(fixture.year);

    expect(grouped.size).toBe(1);
    expect(months?.get("2024-03")?.map((model) => model.name)).toEqual(
      fixture.march,
    );
    expect(months?.get("2024-06")?.map((model) => model.name)).toEqual(
      fixture.june,
    );
  });
});
