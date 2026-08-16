import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  path.join(dirname, "../../migrations/0013_llm_calls.sql"),
  "utf-8"
);

describe("migration 0013_llm_calls", () => {
  it("creates the llm_calls table", () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS llm_calls/);
  });

  it("has every required column with its documented type/constraint", () => {
    expect(sql).toContain("id INTEGER PRIMARY KEY AUTOINCREMENT");
    expect(sql).toContain("ts INTEGER NOT NULL");
    expect(sql).toContain("task TEXT NOT NULL");
    expect(sql).toContain("model TEXT NOT NULL");
    expect(sql).toContain("ok INTEGER NOT NULL");
    expect(sql).toContain("tokens INTEGER NOT NULL DEFAULT 0");
    expect(sql).toContain("duration_ms INTEGER NOT NULL DEFAULT 0");
    expect(sql).toContain("error TEXT");
    expect(sql).toContain("prompt_chars INTEGER");
    expect(sql).toContain("response_snippet TEXT");
  });

  it("indexes ts for newest-first admin queries", () => {
    expect(sql).toMatch(
      /CREATE INDEX IF NOT EXISTS idx_llm_calls_ts ON llm_calls \(ts\)/
    );
  });
});
