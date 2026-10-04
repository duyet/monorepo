import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** Scheduled collectors that bake data the Pages rebuild publishes. */
export const COLLECTOR_WORKFLOWS = [
  "data-sync-wakatime.yml",
  "data-sync-cloudflare.yml",
  "data-sync-posthog.yml",
  "data-sync-llm-timeline.yml",
  "data-sync-github.yml",
  "data-sync-unsplash.yml",
  "data-sync-unsplash-photos.yml",
] as const;

const FAILED = new Set(["failure", "timed_out", "startup_failure"]);

export interface CollectorRun {
  workflowName: string;
  conclusion: string | null;
  createdAt: string;
  url?: string;
  htmlUrl?: string;
}

/** Newest run per workflow whose conclusion means the collector did not succeed. */
export function lastFailedCollector(runs: CollectorRun[]): CollectorRun | null {
  const newest = new Map<string, CollectorRun>();
  for (const run of runs) {
    const prev = newest.get(run.workflowName);
    if (!prev || run.createdAt > prev.createdAt) {
      newest.set(run.workflowName, run);
    }
  }

  let last: CollectorRun | null = null;
  for (const run of newest.values()) {
    if (!run.conclusion || !FAILED.has(run.conclusion)) continue;
    if (!last || run.createdAt > last.createdAt) last = run;
  }
  return last;
}

export function formatCollectorFailureSummary(runs: CollectorRun[]): string {
  const last = lastFailedCollector(runs);
  if (!last) {
    return "### Collector workflows\n\nNo collector workflow failed on its latest run.\n";
  }

  const link = last.url || last.htmlUrl;
  const href = link ? ` — ${link}` : "";
  return `### Collector workflows\n\nLast failed: **${last.workflowName}** (${last.createdAt})${href}\n`;
}

function readFixture(path: string): CollectorRun[] {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as CollectorRun[];
  if (!Array.isArray(parsed)) {
    throw new Error(`fixture ${path} must be a JSON array`);
  }
  return parsed;
}

function fetchRuns(): CollectorRun[] {
  const runs: CollectorRun[] = [];
  for (const workflow of COLLECTOR_WORKFLOWS) {
    const raw = execFileSync(
      "gh",
      [
        "run",
        "list",
        "--workflow",
        workflow,
        "--limit",
        "5",
        "--json",
        "workflowName,conclusion,createdAt,url",
      ],
      { encoding: "utf8" },
    );
    const page = JSON.parse(raw) as CollectorRun[];
    if (Array.isArray(page)) runs.push(...page);
  }
  return runs;
}

function main(): void {
  const fixtureFlag = process.argv.indexOf("--fixture");
  const runs =
    fixtureFlag >= 0
      ? readFixture(process.argv[fixtureFlag + 1] ?? "")
      : fetchRuns();
  process.stdout.write(`${formatCollectorFailureSummary(runs)}\n`);
}

const isDirectRun = process.argv[1]?.endsWith("sync-failure-summary.ts");
if (isDirectRun) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`collector failure summary skipped: ${message}`);
    process.stdout.write(
      "### Collector workflows\n\nCould not read collector run status.\n\n",
    );
  }
}
