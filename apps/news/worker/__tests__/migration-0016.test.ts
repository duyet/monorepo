import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(
  path.join(dirname, "../../migrations/0016_llm_calls_usage.sql"),
  "utf-8"
);

describe("migration 0016_llm_calls_usage", () => {
  it("adds prompt/completion/cached token columns", () => {
    expect(sql).toContain(
      "ALTER TABLE llm_calls ADD COLUMN prompt_tokens INTEGER"
    );
    expect(sql).toContain(
      "ALTER TABLE llm_calls ADD COLUMN completion_tokens INTEGER"
    );
    expect(sql).toContain(
      "ALTER TABLE llm_calls ADD COLUMN cached_tokens INTEGER"
    );
  });
});
