import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  path.join(dirname, "../../migrations/0011_translation_qa.sql"),
  "utf-8"
);

describe("migration 0011_translation_qa", () => {
  it("only adds columns via ALTER TABLE, same idempotent-shaped pattern as 0009", () => {
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    expect(statements.length).toBeGreaterThan(0);
    for (const statement of statements) {
      expect(statement).toMatch(/^ALTER TABLE translations ADD COLUMN/);
    }
  });

  it("adds qa_rating as REAL and qa_at as INTEGER", () => {
    expect(sql).toContain("ADD COLUMN qa_rating REAL");
    expect(sql).toContain("ADD COLUMN qa_at INTEGER");
  });
});
