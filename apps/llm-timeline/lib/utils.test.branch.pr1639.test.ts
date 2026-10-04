import { describe, expect, it } from "vitest";
import type { Model } from "./data";
import { DEFAULT_FILTERS, filterModels } from "./utils";

const models: Model[] = [
  {
    name: "GPT-4o",
    date: "2024-05-13",
    org: "OpenAI",
    params: "200B",
    type: "model",
    license: "closed",
    desc: "flagship",
    source: "curated",
    domain: "Language",
  },
  {
    name: "Llama 3",
    date: "2024-04-18",
    org: "Meta",
    params: "8B",
    type: "model",
    license: "open",
    desc: "open weights",
    source: "curated",
    domain: "Language, Vision",
  },
];

describe("filterModels", () => {
  it("returns the models that match a small filter fixture", () => {
    const matched = filterModels(models, {
      ...DEFAULT_FILTERS,
      org: "Meta",
      license: "open",
    });

    expect(matched).toEqual([models[1]]);
  });
});
