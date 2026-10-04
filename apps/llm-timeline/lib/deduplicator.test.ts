import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { formatMergeStats, mergeAllSources } from "./deduplicator";
import type { DataSourceAdapter, MergeStats, Model } from "./types";

const stats: MergeStats = {
  sources: { curated: 2, epoch: 1 },
  duplicates: 1,
  total: 2,
};

describe("formatMergeStats", () => {
  it("returns the real summary lines for a small stats fixture", () => {
    expect(formatMergeStats(stats)).toBe(
      [
        "Merge Statistics:",
        "  curated: 2",
        "  epoch: 1",
        "  Duplicates removed: 1",
        "  Total unique models: 2",
      ].join("\n"),
    );
  });
});

// mergeAllSources shells out to the native duyet-cli binary, which only
// exists after `pnpm run rust:build`. Skip where it is absent (CI does not
// build it) rather than fail on a missing artifact.
const cliExists = existsSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../target/release/duyet-cli"),
);

function source(name: string, priority: number): DataSourceAdapter {
  return {
    name,
    label: name,
    priority,
    urls: [],
    fetch: async () => [],
  };
}

function model(name: string, date: string, desc = ""): Model {
  return {
    name,
    date,
    org: "OpenAI",
    params: null,
    type: "model",
    license: "closed",
    desc,
  };
}

describe.skipIf(!cliExists)("mergeAllSources", () => {
  it("dedupes by name|org|date with the higher-priority source winning", () => {
    const { models, stats } = mergeAllSources([
      {
        source: source("epoch", 50),
        models: [model("GPT-4", "2023-03-14", "Epoch desc")],
      },
      {
        source: source("curated", 100),
        models: [model("GPT-4", "2023-03-14", "Curated desc")],
      },
    ]);

    expect(models).toHaveLength(1);
    expect(models[0].desc).toBe("Curated desc");
    expect(stats).toEqual({
      sources: { curated: 1, epoch: 1 },
      duplicates: 1,
      total: 1,
    });
  });

  it("sorts the merged models by date ascending", () => {
    const { models, stats } = mergeAllSources([
      {
        source: source("curated", 100),
        models: [model("B", "2024-01-01"), model("A", "2023-01-01")],
      },
    ]);

    expect(models.map((m) => m.name)).toEqual(["A", "B"]);
    expect(stats.total).toBe(2);
    expect(stats.duplicates).toBe(0);
  });
});
