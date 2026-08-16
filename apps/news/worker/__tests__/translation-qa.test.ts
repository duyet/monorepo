import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  QA_RATING_THRESHOLD,
  ratePendingTranslations,
} from "../translation-qa.js";
import type { Env } from "../types.js";

const env: Env = {
  DB: {} as D1Database,
  NEWS_INGEST: {} as Workflow,
  ANYROUTER_BASE_URL: "https://anyrouter.dev/api/v1",
  ANYROUTER_MODEL: "test-model",
  ANYROUTER_API_KEY: "test-key",
  NEWS_ADMIN_TOKEN: "test-token",
};

function sseBody(events: unknown[]): string {
  return `${events
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("")}data: [DONE]\n\n`;
}

function completion(content: string): Response {
  return new Response(sseBody([{ choices: [{ delta: { content } }] }]), {
    status: 200,
  });
}

interface Row {
  id: string;
  en_title: string;
  en_summary: string | null;
  vi_title: string;
  vi_summary: string;
}

/** Fake D1 that answers the pending-QA select with `pending` and records
 * every UPDATE statement's bound args for assertions. Statements are
 * distinguished by whether the SQL starts with SELECT/UPDATE, matching how
 * ratePendingTranslations issues them. */
function makeDb(pending: Row[]) {
  const updates: { sql: string; args: unknown[] }[] = [];
  const db = {
    prepare(sql: string) {
      if (sql.trim().startsWith("SELECT")) {
        return { all: async () => ({ results: pending }) };
      }
      return {
        bind: (...args: unknown[]) => {
          updates.push({ sql, args });
          return { run: async () => ({ success: true }) };
        },
      };
    },
  };
  return { db: db as unknown as D1Database, updates };
}

const baseRow: Row = {
  id: "item1",
  en_title: "Company launches new model",
  en_summary: "The company launches a new model with better performance.",
  vi_title: "Công ty đã thực hiện việc ra mắt mô hình mới",
  vi_summary: "Công ty đã thực hiện việc ra mắt một mô hình mới.",
};

describe("ratePendingTranslations", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing when there are no pending rows", async () => {
    const { db } = makeDb([]);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await ratePendingTranslations({ ...env, DB: db });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stores the rating and leaves the translation untouched when >= threshold", async () => {
    const { db, updates } = makeDb([baseRow]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        completion(
          JSON.stringify({ results: [{ i: 0, rating: 0.85, critique: "" }] })
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    await ratePendingTranslations({ ...env, DB: db });

    expect(fetchMock).toHaveBeenCalledTimes(1); // one judge call, no retranslate
    expect(updates).toHaveLength(1);
    expect(updates[0].sql).toContain("UPDATE translations SET qa_rating");
    expect(updates[0].sql).not.toContain("title = ?");
    expect(updates[0].args[0]).toBe(0.85);
  });

  it("triggers exactly one retranslate + rejudge for a rating below threshold", async () => {
    const { db, updates } = makeDb([baseRow]);
    const fetchMock = vi
      .fn()
      // judge
      .mockResolvedValueOnce(
        completion(
          JSON.stringify({
            results: [
              { i: 0, rating: 0.4, critique: "stiff passive voice, calqued" },
            ],
          })
        )
      )
      // retranslate
      .mockResolvedValueOnce(
        completion(
          JSON.stringify({
            title: "Hãng ra mắt mô hình mới",
            summary: "Hãng vừa ra mắt mô hình mới, hiệu suất tốt hơn.",
          })
        )
      )
      // rejudge
      .mockResolvedValueOnce(
        completion(
          JSON.stringify({ results: [{ i: 0, rating: 0.9, critique: "" }] })
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    await ratePendingTranslations({ ...env, DB: db });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    // retranslate call includes the critique as guidance
    const retranslateBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    const retranslateUserMsg = retranslateBody.messages.find(
      (m: { role: string }) => m.role === "user"
    ).content;
    expect(retranslateUserMsg).toContain("stiff passive voice, calqued");

    expect(updates).toHaveLength(1);
    expect(updates[0].sql).toContain("title = ?");
    expect(updates[0].args).toEqual([
      "Hãng ra mắt mô hình mới",
      "Hãng vừa ra mắt mô hình mới, hiệu suất tốt hơn.",
      0.9,
      expect.any(Number),
      "item1",
    ]);
  });

  it("keeps the better of the two attempts when the retry doesn't improve", async () => {
    const { db, updates } = makeDb([baseRow]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        completion(
          JSON.stringify({
            results: [{ i: 0, rating: 0.5, critique: "calque" }],
          })
        )
      )
      .mockResolvedValueOnce(
        completion(
          JSON.stringify({
            title: "Mô hình mới",
            summary: "Mô hình mới ra mắt.",
          })
        )
      )
      // rejudge scores worse than the original
      .mockResolvedValueOnce(
        completion(
          JSON.stringify({ results: [{ i: 0, rating: 0.3, critique: "" }] })
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    await ratePendingTranslations({ ...env, DB: db });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(updates).toHaveLength(1);
    // No retranslated text kept — the original translation stays, just rated.
    expect(updates[0].sql).not.toContain("title = ?");
    expect(updates[0].args[0]).toBe(0.5);
  });

  it("QA_RATING_THRESHOLD is 0.7", () => {
    expect(QA_RATING_THRESHOLD).toBe(0.7);
  });
});
