import { describe, expect, it } from "vitest";
import type { Model } from "./data";
import { groupByYear } from "./utils";

const model = (name: string, date: string): Model => ({
  name,
  date,
  org: "Test Org",
  params: null,
  type: "model",
  license: "open",
  desc: `${name} description`,
});

describe("groupByYear", () => {
  it("groups models by release year, newest first within each year", () => {
    const gpt4 = model("GPT-4", "2023-03-14");
    const llama2 = model("Llama 2", "2023-07-18");
    const gpt4o = model("GPT-4o", "2024-05-13");

    const groups = groupByYear([gpt4, gpt4o, llama2]);

    expect(Array.from(groups.keys())).toEqual([2023, 2024]);
    expect(groups.get(2023)).toEqual([llama2, gpt4]);
    expect(groups.get(2024)).toEqual([gpt4o]);
  });

  it("returns an empty map for no models", () => {
    expect(groupByYear([])).toEqual(new Map());
  });
});
