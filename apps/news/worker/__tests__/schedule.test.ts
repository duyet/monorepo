import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const newsRoot = path.join(dirname, "../..");
const wrangler = readFileSync(path.join(newsRoot, "wrangler.toml"), "utf-8");
const algorithm = readFileSync(path.join(newsRoot, "ALGORITHM.md"), "utf-8");
const ingestYml = readFileSync(
  path.join(newsRoot, "../../.github/workflows/news-ingest.yml"),
  "utf-8"
);

describe("free-plan hourly ingest", () => {
  it("keeps the news-ingest Workflow binding without paid schedules", () => {
    expect(wrangler).toMatch(/name\s*=\s*"news-ingest"/);
    expect(wrangler).toMatch(/binding\s*=\s*"NEWS_INGEST"/);
    expect(wrangler).toMatch(/class_name\s*=\s*"NewsIngestWorkflow"/);
    expect(wrangler).not.toMatch(/^\s*schedules\s*=/m);
  });

  it("does not add Worker [triggers] crons (Free 5-cron cap)", () => {
    expect(wrangler).not.toMatch(/^[\t ]*\[triggers\]/m);
    expect(wrangler).not.toMatch(/^[\t ]*crons\s*=/m);
  });

  it("keeps run_worker_first for homepage, sitemap, robots, and APIs", () => {
    expect(wrangler).toContain(
      'run_worker_first = ["/", "/sitemap.xml", "/robots.txt", "/api/*"]'
    );
  });

  it("schedules hourly ingest via GitHub Actions admin API, not Workflow schedules", () => {
    expect(ingestYml).toMatch(/cron:\s*"5 \* \* \* \*"/);
    expect(ingestYml).toContain("https://news.duyet.net/api/admin/ingest");
    expect(ingestYml).toContain("secrets.NEWS_ADMIN_TOKEN");
    expect(algorithm).toMatch(/GitHub Actions/);
    expect(algorithm).not.toMatch(/Hourly instances come from `schedules`/);
  });
});

describe("live AnyRouter model chains", () => {
  function firstId(varName: string): string {
    const match = wrangler.match(new RegExp(`${varName} = "([^"]+)"`));
    expect(match, `${varName} missing`).toBeTruthy();
    return match![1].split(",")[0];
  }

  it("leads translate/tldr/score with a native (non-BYOK-only) catalog id", () => {
    const native = [
      "google/gemini-2.5-flash-lite",
      "google/gemini-2.5-flash",
      "google/gemma-4-26b-a4b-it",
      "z-ai/glm-4.7-flash",
      "inclusionai/ling-3.0-flash",
    ];
    expect(native).toContain(firstId("ANYROUTER_TRANSLATE_MODEL"));
    expect(native).toContain(firstId("ANYROUTER_TLDR_MODEL"));
    expect(native).toContain(firstId("ANYROUTER_MODEL"));
  });

  it("does not put BYOK-only hangers first", () => {
    expect(wrangler).not.toMatch(
      /ANYROUTER_TRANSLATE_MODEL = "aisingapore\/gemma-sea-lion/
    );
    expect(wrangler).not.toMatch(
      /ANYROUTER_TRANSLATE_MODEL = "google\/gemini-3\.7-flash/
    );
    expect(wrangler).not.toMatch(
      /ANYROUTER_TRANSLATE_MODEL = "qwen\/qwen3\.7-flash/
    );
  });
});
