/**
 * Per-run telemetry persisted as a single JSON column on `workflow_runs`
 * (see migrations/0012_run_stats.sql), so the admin /system dashboard can
 * show a richer breakdown than the existing items_fetched/items_new/error
 * columns without another ALTER TABLE every time a new metric is wanted.
 */

/** One step's self-reported explanation of what it did (or didn't do) and
 * why, e.g. `{ name: "dedupe", action: "0 new", reason: "27 already in db" }`.
 * Recorded best-effort by the workflow — see `recordStep` below. */
export interface RunStepInfo {
  name: string;
  action: string;
  reason?: string;
}

export interface RunStats {
  /** Items fetched this run, per source id. */
  bySource: Record<string, number>;
  /** Per-step summary of what happened and why, in run order. */
  steps: RunStepInfo[];
  new: number;
  merged: number;
  rejected: number;
  published: number;
  /** Total LLM tokens burned across every step this run (scoring,
   *  translation, backfill, QA, suggestion/submission review, TL;DR). */
  tokens: number;
  backfilledSummaries: number;
  backfilledTranslations: number;
  qaRated: number;
  qaAdjusted: number;
  suggestionsReviewed: number;
  submissionsReviewed: number;
  tldrGenerated: boolean;
  emailsSent: number;
}

/** Every field defaults to zero/false/empty so a missing or failed step
 * never leaves `undefined` in the persisted JSON. */
export function buildRunStats(partial: Partial<RunStats> = {}): RunStats {
  return {
    bySource: partial.bySource ?? {},
    steps: partial.steps ?? [],
    new: partial.new ?? 0,
    merged: partial.merged ?? 0,
    rejected: partial.rejected ?? 0,
    published: partial.published ?? 0,
    tokens: partial.tokens ?? 0,
    backfilledSummaries: partial.backfilledSummaries ?? 0,
    backfilledTranslations: partial.backfilledTranslations ?? 0,
    qaRated: partial.qaRated ?? 0,
    qaAdjusted: partial.qaAdjusted ?? 0,
    suggestionsReviewed: partial.suggestionsReviewed ?? 0,
    submissionsReviewed: partial.submissionsReviewed ?? 0,
    tldrGenerated: partial.tldrGenerated ?? false,
    emailsSent: partial.emailsSent ?? 0,
  };
}

export function serializeRunStats(stats: RunStats): string {
  return JSON.stringify(stats);
}

/** Appends a step explanation to `steps`, swallowing any error so a bug in
 * self-reporting (e.g. a non-serializable reason) never fails the run. */
export function recordStep(
  steps: RunStepInfo[],
  name: string,
  action: string,
  reason?: string
): void {
  try {
    steps.push({ name, action, reason });
  } catch {
    // never let step-explanation bookkeeping break the run
  }
}
