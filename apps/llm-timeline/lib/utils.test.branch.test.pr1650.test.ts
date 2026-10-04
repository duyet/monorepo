import { describe, expect, it } from "vitest";
import type { Model } from "./data";
import { getStats } from "./utils";

const fixture: Model[] = [
  {
    name: "GPT-4",
    date: "2023-03-14",
    org: "OpenAI",
    params: "1.8T",
    type: "model",
    license: "closed",
    desc: "A large multimodal model",
    source: "curated",
  },
  {
    name: "Llama 2",
    date: "2024-07-18",
    org: "Meta",
    params: "70B",
    type: "model",
    license: "open",
    desc: "An open weight model",
    source: "epoch",
  },
  {
    name: "GPT-4o",
    date: "2024-05-13",
    org: "OpenAI",
    params: null,
    type: "model",
    license: "closed",
    desc: "An omni model",
    source: "curated",
  },
  {
    name: "Transformer paper",
    date: "2017-06-12",
    org: "Google",
    params: null,
    type: "milestone",
    license: "open",
    desc: "Attention is all you need",
  },
];

describe("getStats", () => {
  it("aggregates a small fixture into counts and source totals", () => {
    expect(getStats(fixture)).toEqual({
      total: 4,
      models: 3,
      milestones: 1,
      organizations: 3,
      years: 3,
      open: 2,
      closed: 2,
      sources: { curated: 2, epoch: 1 },
    });
  });
});
