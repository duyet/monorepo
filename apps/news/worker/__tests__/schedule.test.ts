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

  it("binds a SQLite Durable Object scheduler instead of a cron", () => {
    expect(wrangler).toMatch(/name\s*=\s*"NEWS_INGEST_SCHEDULER"/);
    expect(wrangler).toMatch(/class_name\s*=\s*"NewsIngestScheduler"/);
    expect(wrangler).toMatch(
      /new_sqlite_classes\s*=\s*\["NewsIngestScheduler"\]/
    );
  });

  it("keeps run_worker_first for homepage, sitemap, robots, and APIs", () => {
    expect(wrangler).toContain(
      'run_worker_first = ["/", "/sitemap.xml", "/robots.txt", "/api/*"]'
    );
  });

  it("schedules ingest via a Durable Object alarm plus GitHub Actions watchdog", () => {
    expect(ingestYml).toMatch(/cron:\s*"5 \* \* \* \*"/);
    expect(ingestYml).toMatch(/cron:\s*"20 \* \* \* \*"/);
    expect(ingestYml).toMatch(/cron:\s*"35 \* \* \* \*"/);
    expect(ingestYml).toMatch(/cron:\s*"50 \* \* \* \*"/);
    expect(ingestYml).toContain("https://news.duyet.net/api/admin/ingest");
    expect(ingestYml).toContain("secrets.NEWS_ADMIN_TOKEN");
    expect(algorithm).toMatch(/GitHub Actions/);
    expect(algorithm).toMatch(/Durable Object/);
    expect(algorithm).not.toMatch(/Hourly instances come from `schedules`/);
  });
});

describe("live AnyRouter model chains", () => {
  function idsOf(varName: string): string[] {
    const match = wrangler.match(new RegExp(`${varName} = "([^"]+)"`));
    expect(match, `${varName} missing`).toBeTruthy();
    return match![1].split(",").map((s) => s.trim());
  }

  it("keeps a real fallback chain on every live task (no single-model setup)", () => {
    for (const name of [
      "ANYROUTER_MODEL",
      "ANYROUTER_TRANSLATE_MODEL",
      "ANYROUTER_TLDR_MODEL",
    ]) {
      expect(idsOf(name).length, name).toBeGreaterThanOrEqual(2);
    }
  });

  it("leads score/tldr with anyrouter/auto and translate with Gemma 4", () => {
    expect(idsOf("ANYROUTER_MODEL")[0]).toBe("anyrouter/auto");
    expect(idsOf("ANYROUTER_TLDR_MODEL")[0]).toBe("anyrouter/auto");
    expect(idsOf("ANYROUTER_TRANSLATE_MODEL")[0]).toBe(
      "google/gemma-4-26b-a4b-it"
    );
    expect(idsOf("ANYROUTER_TRANSLATE_MODEL")).toContain("anyrouter/auto");
  });

  it("reports three scoring fallbacks so /data can show (+3 fallback)", () => {
    expect(idsOf("ANYROUTER_MODEL")).toEqual([
      "anyrouter/auto",
      "google/gemma-4-26b-a4b-it",
      "z-ai/glm-4.7-flash",
      "inclusionai/ling-3.0-flash",
    ]);
    expect(idsOf("ANYROUTER_TLDR_MODEL")).toEqual(idsOf("ANYROUTER_MODEL"));
  });

  it("omits delisted, BYOK-only, paid gemini, and rejected replacement ids", () => {
    const blocked = [
      "stealth/ox-alpha",
      "poolside/laguna-s-2.1",
      "deepseek/DeepSeek-V4-Flash",
      "stepfun-ai/step-3.7-flash",
      "aisingapore/gemma-sea-lion-v4-27b-it",
      "google/gemini-2.5-flash-lite",
      "google/gemini-2.5-flash",
      "google/gemini-3.5-flash",
      "google/gemini-3.7-flash",
      "google/gemini-3.6-flash",
      "qwen/qwen3.7-flash",
    ];
    for (const name of [
      "ANYROUTER_MODEL",
      "ANYROUTER_TRANSLATE_MODEL",
      "ANYROUTER_TLDR_MODEL",
    ]) {
      const ids = idsOf(name);
      for (const id of blocked) {
        expect(ids, name).not.toContain(id);
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

  it("caps translate attempts at 25s so leftover reaches fallbacks", () => {
    expect(llm).toMatch(/MODEL_SLICE_MAX_MS = 25_000/);
    expect(llm).toMatch(/SCORE_SLICE_MAX_MS = 70_000/);
    expect(llm).toMatch(/TLDR_SLICE_MAX_MS = 90_000/);
    expect(llm).toMatch(/FALLBACK_FLOOR_MS = 20_000/);
    expect(llm).toMatch(/SCORE_BATCH_SIZE = 5/);
    expect(algorithm).toMatch(/batches of 5/);
  });
});

describe("backfill-translate checkpoints", () => {
  const workflow = readFileSync(
    path.join(newsRoot, "worker/workflow.ts"),
    "utf-8"
  );

  it("persists each 3-item slice in its own Workflow step", () => {
    expect(workflow).toContain("backfill-translate-load");
    expect(workflow).toMatch(/backfill-translate-\$\{offset\}/);
    expect(workflow).toContain("TRANSLATE_BATCH_SIZE");
    expect(workflow).toContain("BACKFILL_TRANSLATE_STEP");
    expect(workflow).toContain("LLM_STEP");
    expect(workflow).toMatch(/retries:\s*\{\s*limit:\s*0/);
    expect(workflow).toContain("safeStep(");
    expect(workflow).toContain('"score"');
    expect(workflow).toContain('"translate"');
    expect(workflow).toContain('"tldr"');
    expect(workflow).toContain('"open-run"');
    expect(workflow).toContain('"close-run"');
    expect(workflow).toContain("persistWorkflowRun");
    expect(workflow).toContain("if (!row || !result.title) continue");
  });

  it("does not rethrow after setting runError so close-run can persist", () => {
    expect(workflow).toContain("ingest run failed:");
    expect(workflow).not.toMatch(/runError[\s\S]{0,80}throw error/);
    expect(workflow).toContain("persistWorkflowRun");
  });

  it("opens a workflow_runs row before fetch/LLM steps", () => {
    const openIdx = workflow.indexOf('"open-run"');
    const fetchIdx = workflow.indexOf("load-sources");
    expect(openIdx).toBeGreaterThan(0);
    expect(openIdx).toBeLessThan(fetchIdx);
  });

  it("persists workflow_runs before pruneLlmCalls and without safeStep", () => {
    const persistIdx = workflow.indexOf(
      'persistOpenedWorkflowRun(this.env.DB, runId, startedAt, "open-run")'
    );
    const pruneIdx = workflow.indexOf("await pruneLlmCalls(this.env)");
    expect(persistIdx).toBeGreaterThan(0);
    expect(persistIdx).toBeLessThan(pruneIdx);
    expect(workflow).not.toMatch(/safeStep\(\s*step,\s*"open-run"/);
  });
});
