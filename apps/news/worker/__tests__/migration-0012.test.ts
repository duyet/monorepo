import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  path.join(dirname, "../../migrations/0012_workflow_run_stats.sql"),
  "utf-8"
);

describe("migration 0012_workflow_run_stats", () => {
  it("adds a single idempotent-shaped ALTER TABLE ADD COLUMN statement", () => {
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      "ALTER TABLE workflow_runs ADD COLUMN stats TEXT"
    );
  });
});
