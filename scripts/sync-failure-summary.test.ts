import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  type CollectorRun,
  formatCollectorFailureSummary,
  lastFailedCollector,
} from "./sync-failure-summary.ts";

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures/collector-runs.json",
);

describe("formatCollectorFailureSummary", () => {
  it("names the collector whose latest run failed most recently", () => {
    const runs = JSON.parse(
      readFileSync(fixturePath, "utf8"),
    ) as CollectorRun[];
    const summary = formatCollectorFailureSummary(runs);

    expect(lastFailedCollector(runs)?.workflowName).toBe(
      "Data Sync (PostHog)",
    );
    expect(summary).toContain("**Data Sync (PostHog)**");
    expect(summary).toContain("2026-10-05T03:04:00Z");
    expect(summary).toContain(
      "https://github.com/duyet/monorepo/actions/runs/1546",
    );
    expect(summary).not.toContain("**Data Sync (Cloudflare)**");
  });

  it("stays quiet when every latest collector run succeeded", () => {
    const runs = JSON.parse(
      readFileSync(fixturePath, "utf8"),
    ) as CollectorRun[];
    const healthy = runs.map((run) => {
      const failedLatest =
        run.createdAt === "2026-10-05T03:04:00Z" ||
        run.workflowName === "Data Sync (Cloudflare)";
      return failedLatest ? { ...run, conclusion: "success" } : run;
    });

    expect(formatCollectorFailureSummary(healthy)).toContain(
      "No collector workflow failed",
    );
  });
});
