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

  it("omits known BYOK-only ids from every live chain", () => {
    const byokOnly = [
      "aisingapore/gemma-sea-lion-v4-27b-it",
      "google/gemini-3.7-flash",
      "google/gemini-3.6-flash",
      "qwen/qwen3.7-flash",
    ];
    for (const name of [
      "ANYROUTER_MODEL",
      "ANYROUTER_TRANSLATE_MODEL",
      "ANYROUTER_TLDR_MODEL",
    ]) {
      const match = wrangler.match(new RegExp(`${name} = "([^"]+)"`));
      const ids = (match?.[1] ?? "").split(",").map((s) => s.trim());
      for (const blocked of byokOnly) {
        expect(ids, name).not.toContain(blocked);
      }
    }
  });
});

describe("translation upsert", () => {
  const workflow = readFileSync(
    path.join(newsRoot, "worker/workflow.ts"),
    "utf-8"
  );

  it("writes title on conflict so backfill can replace an empty title_vi", () => {
    const upserts = workflow.match(
      /ON CONFLICT\(item_id, lang\) DO UPDATE SET[\s\S]{0,80}/g
    );
    expect(upserts?.length).toBeGreaterThanOrEqual(2);
    for (const sql of upserts ?? []) {
      expect(sql).toContain("title = excluded.title");
    }
  });
});

describe("translate batch size", () => {
  const llm = readFileSync(path.join(newsRoot, "worker/llm.ts"), "utf-8");

  it("chunks translateItems by 3 so a 15-item JSON blob cannot eat the hang-cap", () => {
    expect(llm).toMatch(/TRANSLATE_BATCH_SIZE = 3/);
    expect(llm).toMatch(/chunk\(needLlm, TRANSLATE_BATCH_SIZE\)/);
    expect(algorithm).toMatch(/batches of 3/);
  });

  it("caps each model attempt at 25s so leftover reaches fallbacks", () => {
    expect(llm).toMatch(/MODEL_SLICE_MAX_MS = 25_000/);
    expect(llm).toMatch(/FALLBACK_FLOOR_MS = 20_000/);
  });
});

describe("backfill-translate checkpoints", () => {
  const workflow = readFileSync(
    path.join(newsRoot, "worker/workflow.ts"),
    "utf-8"
  );

  it("persists each 3-item slice in its own Workflow step", () => {
    expect(workflow).toContain("backfill-translate-load");
    expect(workflow).toContain("backfill-translate-${offset}");
    expect(workflow).toContain("TRANSLATE_BATCH_SIZE");
    expect(workflow).toContain("if (!row || !result.title) continue");
  });
});
