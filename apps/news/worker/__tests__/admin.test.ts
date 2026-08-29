import { afterEach, describe, expect, it, vi } from "vitest";
import { checkAuth } from "../admin/auth.js";
import {
  getLlmCalls,
  isHandlerError,
  listItems,
  pushItems,
  regenerateTldr,
  reprocessToday,
  sha256Hex,
  triggerIngest,
  updateItem,
  upsertSource,
} from "../admin/handlers.js";
import { handleMcpRequest } from "../admin/mcp.js";
import * as llm from "../llm.js";
import { tldrSnapshotDate } from "../tldr.js";
import type { Env } from "../types.js";

/**
 * Minimal in-memory D1 fake, tailored to the exact statements
 * worker/admin/handlers.ts issues. Not a general SQL engine — routes on
 * the fixed set of query shapes used by this module.
 */
class FakeD1 {
  items = new Map<string, Record<string, unknown>>();
  sources = new Map<string, Record<string, unknown>>();
  translations = new Map<string, Record<string, unknown>>();
  workflowRuns: Record<string, unknown>[] = [];
  llmCalls: Record<string, unknown>[] = [];
  topics = new Map<string, Record<string, unknown>>();
  tldrSnapshots = new Map<string, Record<string, unknown>>();

  prepare(sql: string) {
    const db = this;
    const normalized = sql.replace(/\s+/g, " ").trim();
    return {
      bind(...args: unknown[]) {
        return {
          first: async () => db.exec(normalized, args),
          run: async () => db.exec(normalized, args),
          all: async () => db.exec(normalized, args),
        };
      },
      first: async () => db.exec(normalized, []),
      run: async () => db.exec(normalized, []),
      all: async () => db.exec(normalized, []),
    };
  }

  async batch(statements: { run: () => Promise<unknown> }[]) {
    const results = [];
    for (const s of statements) results.push(await s.run());
    return results;
  }

  private exec(sql: string, args: unknown[]): unknown {
    if (sql.startsWith("SELECT id FROM workflow_runs WHERE id = ?")) {
      const [id] = args as [string];
      const row = this.workflowRuns.find((r) => r.id === id);
      return row ? { id: row.id } : null;
    }

    if (
      sql.startsWith("SELECT id FROM workflow_runs") &&
      sql.includes("ORDER BY") &&
      sql.includes("LIMIT 1") &&
      !sql.includes("WHERE")
    ) {
      const normalize = sql.includes("WHEN started_at");
      const epoch = (value: unknown): number => {
        const n = Number(value ?? 0);
        return normalize && n > 1_000_000_000_000 ? n / 1000 : n;
      };
      const rows = [...this.workflowRuns].sort(
        (a: Record<string, unknown>, b: Record<string, unknown>): number => {
          const byStarted = epoch(b.started_at) - epoch(a.started_at);
          if (byStarted !== 0) return byStarted;
          return String(b.id ?? "").localeCompare(String(a.id ?? ""));
        }
      );
      return rows[0] ? { id: rows[0].id } : null;
    }

    if (sql.startsWith("SELECT id FROM items WHERE id = ?")) {
      const [id] = args as [string];
      const row = this.items.get(id);
      return row ? { id: row.id } : null;
    }

    if (sql.startsWith("INSERT INTO items")) {
      const [
        id,
        source_id,
        external_id,
        url,
        title,
        summary,
        published_at,
        fetched_at,
        points,
        comments,
        llm_relevance,
        llm_importance,
        llm_quality,
        category,
        tags,
        rank_score,
        status,
      ] = args;
      const existing = this.items.get(id as string);
      const row = {
        id,
        source_id,
        external_id,
        url,
        title,
        summary,
        published_at,
        fetched_at,
        points,
        comments,
        llm_relevance,
        llm_importance,
        llm_quality,
        category,
        tags,
        rank_score,
        status,
      };
      if (existing) {
        Object.assign(existing, {
          title,
          summary,
          points,
          comments,
          category,
          tags,
          status,
        });
      } else {
        this.items.set(id as string, row);
      }
      return { success: true };
    }

    if (sql.startsWith("INSERT INTO translations")) {
      const [item_id, title, summary] = args;
      this.translations.set(`${item_id}:vi`, {
        item_id,
        lang: "vi",
        title,
        summary,
      });
      return { success: true };
    }

    if (sql.startsWith("SELECT * FROM sources")) {
      return { results: Array.from(this.sources.values()) };
    }

    if (sql.startsWith("INSERT INTO sources")) {
      const [id, name, type, config, enabled] = args;
      this.sources.set(id as string, { id, name, type, config, enabled });
      return { success: true };
    }

    if (sql.startsWith("DELETE FROM sources WHERE id = ?")) {
      const [id] = args as [string];
      this.sources.delete(id);
      return { success: true };
    }

    if (sql.startsWith("SELECT * FROM workflow_runs")) {
      return {
        results: [...this.workflowRuns]
          .sort((a, b) => (b.started_at as number) - (a.started_at as number))
          .slice(0, 10),
      };
    }

    if (sql.startsWith("SELECT * FROM llm_calls ORDER BY ts DESC LIMIT ?")) {
      const [limit] = args as [number];
      return {
        results: [...this.llmCalls]
          .sort((a, b) => (b.ts as number) - (a.ts as number))
          .slice(0, limit),
      };
    }

    if (
      sql.startsWith(
        "SELECT id, title, summary, source_id, points, comments, published_at FROM items WHERE status = 'published' AND published_at >= ?"
      )
    ) {
      const [since] = args as [number];
      return {
        results: Array.from(this.items.values()).filter(
          (row) =>
            row.status === "published" && (row.published_at as number) >= since
        ),
      };
    }

    if (
      sql.startsWith(
        "UPDATE items SET llm_relevance = ?, llm_importance = ?, llm_quality = ?, category = ?"
      )
    ) {
      const [
        llm_relevance,
        llm_importance,
        llm_quality,
        category,
        tags,
        rank_score,
        id,
      ] = args;
      const row = this.items.get(id as string);
      if (row) {
        Object.assign(row, {
          llm_relevance,
          llm_importance,
          llm_quality,
          category,
          tags,
          rank_score,
        });
      }
      return { success: true };
    }

    if (sql.startsWith("SELECT name, canonical FROM topics")) {
      return { results: Array.from(this.topics.values()) };
    }

    if (sql.startsWith("INSERT INTO topics")) {
      const [name, canonical, count, last_seen] = args;
      this.topics.set(name as string, {
        name,
        canonical,
        count,
        last_seen,
      });
      return { success: true };
    }

    if (
      sql.startsWith(
        "SELECT date, created_at FROM tldr_snapshots WHERE date = ?"
      ) ||
      sql.startsWith(
        "SELECT date, created_at, bullets_en, bullets_vi FROM tldr_snapshots WHERE date = ?"
      )
    ) {
      const [date] = args as [string];
      const row = this.tldrSnapshots.get(date);
      return row
        ? {
            date: row.date,
            created_at: row.created_at ?? 0,
            bullets_en: row.bullets_en ?? "[]",
            bullets_vi: row.bullets_vi ?? "[]",
          }
        : null;
    }

    if (sql.startsWith("DELETE FROM tldr_snapshots WHERE date = ?")) {
      const [date] = args as [string];
      this.tldrSnapshots.delete(date);
      return { success: true };
    }

    if (
      sql.startsWith("SELECT i.id, i.title, i.summary, tr.title AS title_vi")
    ) {
      const [since] = args as [number];
      return {
        results: Array.from(this.items.values())
          .filter(
            (row) =>
              row.status === "published" &&
              (row.published_at as number) >= since
          )
          .sort((a, b) => (b.rank_score as number) - (a.rank_score as number)),
      };
    }

    if (sql.startsWith("INSERT INTO tldr_snapshots")) {
      const [date, bullets_en, bullets_vi, created_at] = args;
      this.tldrSnapshots.set(date as string, {
        date,
        bullets_en,
        bullets_vi,
        created_at,
      });
      return { success: true };
    }

    if (
      sql.startsWith("SELECT id, source_id, title, url, status, published_at")
    ) {
      const [limit] = args as [number];
      return {
        results: Array.from(this.items.values())
          .sort(
            (a, b) => (b.published_at as number) - (a.published_at as number)
          )
          .slice(0, limit),
      };
    }

    if (
      sql.startsWith(
        "SELECT id, points, comments, published_at, llm_relevance, llm_importance, llm_quality FROM items WHERE id = ?"
      )
    ) {
      const [id] = args as [string];
      return this.items.get(id) ?? null;
    }

    if (sql.startsWith("UPDATE items SET status = ? WHERE id = ?")) {
      const [status, id] = args as [string, string];
      const row = this.items.get(id);
      if (row) row.status = status;
      return { success: true };
    }

    if (
      sql.startsWith(
        "UPDATE items SET llm_relevance = ?, llm_importance = ?, llm_quality = ?, rank_score = ? WHERE id = ?"
      )
    ) {
      const [llm_relevance, llm_importance, llm_quality, rank_score, id] =
        args as [number, number, number, number, string];
      const row = this.items.get(id);
      if (row) {
        Object.assign(row, {
          llm_relevance,
          llm_importance,
          llm_quality,
          rank_score,
        });
      }
      return { success: true };
    }

    if (sql.startsWith("SELECT * FROM items WHERE id = ?")) {
      const [id] = args as [string];
      return this.items.get(id) ?? null;
    }

    if (
      sql.startsWith(
        "SELECT date, created_at FROM tldr_snapshots ORDER BY date DESC"
      )
    ) {
      const rows = Array.from(this.tldrSnapshots.values()).sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      );
      return rows[0] ?? null;
    }

    if (sql.startsWith("SELECT channel, item_id")) {
      return { results: [] };
    }

    if (sql.startsWith("INSERT INTO workflow_runs")) {
      const [
        id,
        started_at,
        finished_at,
        items_fetched,
        items_new,
        error,
        stats,
      ] = args as [
        string,
        number,
        number,
        number,
        number,
        string | null,
        string | null,
      ];
      const existing = this.workflowRuns.find((r) => r.id === id);
      const row = {
        id,
        started_at,
        finished_at,
        items_fetched,
        items_new,
        error,
        stats,
      };
      if (existing) Object.assign(existing, row);
      else this.workflowRuns.push(row);
      return {
        success: true,
        id,
        started_at,
        results: [{ id, started_at }],
        meta: { changes: 1, rows_written: 1 },
      };
    }

    if (sql.startsWith("INSERT INTO admin_audit")) {
      return { success: true };
    }

    if (sql.startsWith("SELECT ts, action, detail FROM admin_audit")) {
      return { results: [] };
    }

    if (sql.startsWith("SELECT status, COUNT(*)")) {
      const counts = new Map<string, number>();
      for (const item of this.items.values()) {
        const status = item.status as string;
        counts.set(status, (counts.get(status) ?? 0) + 1);
      }
      return {
        results: Array.from(counts.entries()).map(([status, c]) => ({
          status,
          c,
        })),
      };
    }

    throw new Error(`unhandled SQL in FakeD1: ${sql}`);
  }
}

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    DB: new FakeD1() as unknown as D1Database,
    NEWS_INGEST: {
      create: vi.fn().mockResolvedValue({ id: "wf-123" }),
    } as unknown as Workflow,
    ANYROUTER_BASE_URL: "https://anyrouter.dev/api/v1",
    ANYROUTER_MODEL: "test-model",
    ANYROUTER_API_KEY: "test-key",
    NEWS_ADMIN_TOKEN: "secret-token",
    ...overrides,
  };
}

describe("checkAuth", () => {
  it("returns 500 when admin API is disabled (no token configured)", async () => {
    const env = makeEnv({ NEWS_ADMIN_TOKEN: "" });
    const req = new Request("https://x/", {
      headers: { Authorization: "Bearer whatever" },
    });
    const res = checkAuth(req, env);
    expect(res?.status).toBe(500);
    expect(await res?.json()).toEqual({ error: "admin API disabled" });
  });

  it("returns 401 on wrong bearer token", () => {
    const env = makeEnv();
    const req = new Request("https://x/", {
      headers: { Authorization: "Bearer wrong-token" },
    });
    const res = checkAuth(req, env);
    expect(res?.status).toBe(401);
  });

  it("returns null (pass) on correct bearer token", () => {
    const env = makeEnv();
    const req = new Request("https://x/", {
      headers: { Authorization: "Bearer secret-token" },
    });
    expect(checkAuth(req, env)).toBeNull();
  });
});

describe("sha256Hex", () => {
  it("is stable for the same input across calls", async () => {
    const a = await sha256Hex("https://example.com/a");
    const b = await sha256Hex("https://example.com/a");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("pushItems", () => {
  it("sets status 'new' when no score fields are given", async () => {
    const env = makeEnv();
    const result = await pushItems(env, {
      url: "https://example.com/1",
      title: "Item one",
    });
    expect(isHandlerError(result)).toBe(false);
    if (isHandlerError(result)) throw new Error("unreachable");
    expect(result.inserted).toBe(1);
    expect(result.updated).toBe(0);
    const id = await sha256Hex("https://example.com/1");
    expect((env.DB as unknown as FakeD1).items.get(id)?.status).toBe("new");
  });

  it("sets status 'published' when relevance/importance/quality given", async () => {
    const env = makeEnv();
    await pushItems(env, {
      url: "https://example.com/2",
      title: "Item two",
      relevance: 0.9,
      importance: 7,
      quality: 8,
    });
    const id = await sha256Hex("https://example.com/2");
    expect((env.DB as unknown as FakeD1).items.get(id)?.status).toBe(
      "published"
    );
  });

  it("reports correct inserted/updated counts for array input", async () => {
    const env = makeEnv();
    const first = await pushItems(env, [
      { url: "https://example.com/a", title: "A" },
      { url: "https://example.com/b", title: "B" },
    ]);
    if (isHandlerError(first)) throw new Error("unreachable");
    expect(first.inserted).toBe(2);
    expect(first.updated).toBe(0);

    const second = await pushItems(env, [
      { url: "https://example.com/a", title: "A updated" },
      { url: "https://example.com/c", title: "C" },
    ]);
    if (isHandlerError(second)) throw new Error("unreachable");
    expect(second.inserted).toBe(1);
    expect(second.updated).toBe(1);
  });

  it("rejects items missing url or title", async () => {
    const env = makeEnv();
    const result = await pushItems(env, { url: "", title: "no url" });
    expect(isHandlerError(result)).toBe(true);
  });
});

describe("upsertSource", () => {
  it("rejects a type that is neither registered nor 'push'", async () => {
    const env = makeEnv();
    const result = await upsertSource(env, "custom", {
      name: "Custom",
      type: "not-a-real-adapter",
    });
    expect(isHandlerError(result)).toBe(true);
  });

  it("accepts the 'push' pseudo-type", async () => {
    const env = makeEnv();
    const result = await upsertSource(env, "external", {
      name: "External pusher",
      type: "push",
    });
    expect(isHandlerError(result)).toBe(false);
  });

  it("accepts registered adapter types", async () => {
    const env = makeEnv();
    const result = await upsertSource(env, "hn2", {
      name: "HN mirror",
      type: "hn",
      config: { query: "AI" },
    });
    expect(isHandlerError(result)).toBe(false);
  });
});

describe("getLlmCalls", () => {
  function seed(env: Env, n: number): void {
    const db = env.DB as unknown as FakeD1;
    for (let i = 0; i < n; i++) {
      db.llmCalls.push({
        id: i + 1,
        ts: i, // ascending insert order, oldest first
        task: "score",
        model: "test-model",
        ok: 1,
        tokens: 10,
        duration_ms: 5,
        error: null,
        prompt_chars: 100,
        response_snippet: "snippet",
      });
    }
  }

  it("returns rows newest-first", async () => {
    const env = makeEnv();
    seed(env, 3);

    const result = await getLlmCalls(env);
    expect(result.calls.map((c: any) => c.ts)).toEqual([2, 1, 0]);
  });

  it("defaults to a limit of 100", async () => {
    const env = makeEnv();
    seed(env, 150);

    const result = await getLlmCalls(env);
    expect(result.calls).toHaveLength(100);
  });

  it("respects an explicit limit", async () => {
    const env = makeEnv();
    seed(env, 10);

    const result = await getLlmCalls(env, "5");
    expect(result.calls).toHaveLength(5);
  });

  it("caps the limit at 500 even when a larger value is requested", async () => {
    const env = makeEnv();
    seed(env, 600);

    const result = await getLlmCalls(env, "10000");
    expect(result.calls).toHaveLength(500);
  });

  it("falls back to the default for a non-numeric limit", async () => {
    const env = makeEnv();
    seed(env, 150);

    const result = await getLlmCalls(env, "not-a-number");
    expect(result.calls).toHaveLength(100);
  });
});

describe("reprocessToday", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function seedPublished(env: Env, id: string, publishedAt: number): void {
    const db = env.DB as unknown as FakeD1;
    db.items.set(id, {
      id,
      source_id: "hn",
      external_id: null,
      url: `https://example.com/${id}`,
      title: `Title ${id}`,
      summary: "summary",
      published_at: publishedAt,
      fetched_at: publishedAt,
      points: 10,
      comments: 2,
      llm_relevance: 0.5,
      llm_importance: 5,
      llm_quality: 5,
      category: null,
      tags: "[]",
      rank_score: 1,
      status: "published",
    });
  }

  it("updates existing item rows in place without inserting duplicates", async () => {
    const env = makeEnv();
    const todaySec = Math.floor(Date.now() / 1000);
    seedPublished(env, "item-1", todaySec);

    vi.spyOn(llm, "scoreItems").mockResolvedValue([
      {
        i: 0,
        relevance: 0.9,
        importance: 8,
        quality: 7,
        category: "Models",
        tags: [],
        tokens: 10,
      },
    ]);

    const result = await reprocessToday(env, { steps: ["score"] });
    expect(isHandlerError(result)).toBe(false);
    if (isHandlerError(result)) throw new Error("unreachable");
    expect(result.processed).toBe(1);
    expect(result.scored).toBe(1);

    const db = env.DB as unknown as FakeD1;
    expect(db.items.size).toBe(1);
    const row = db.items.get("item-1");
    expect(row?.llm_importance).toBe(8);
    expect(row?.category).toBe("Models");
  });

  it("upserts translations by item id via reprocess without duplicates", async () => {
    const env = makeEnv();
    const todaySec = Math.floor(Date.now() / 1000);
    seedPublished(env, "item-2", todaySec);

    vi.spyOn(llm, "translateItems").mockResolvedValue([
      { i: 0, title: "Tiêu đề", summary: "Tóm tắt", tokens: 5 },
    ]);

    const result = await reprocessToday(env, { steps: ["translate"] });
    if (isHandlerError(result)) throw new Error("unreachable");
    expect(result.translated).toBe(1);

    const db = env.DB as unknown as FakeD1;
    expect(db.translations.size).toBe(1);
    expect(db.translations.get("item-2:vi")?.title).toBe("Tiêu đề");
  });

  it("returns 409 when called while already running", async () => {
    const env = makeEnv();
    const todaySec = Math.floor(Date.now() / 1000);
    seedPublished(env, "item-3", todaySec);

    let resolveScore!: (v: unknown) => void;
    vi.spyOn(llm, "scoreItems").mockReturnValue(
      new Promise((resolve) => {
        resolveScore = resolve;
      }) as any
    );

    const first = reprocessToday(env, { steps: ["score"] });
    const second = await reprocessToday(env, { steps: ["score"] });
    expect(isHandlerError(second)).toBe(true);
    if (!isHandlerError(second)) throw new Error("unreachable");
    expect(second.status).toBe(409);
    expect(second.error).toBe("reprocess already running");

    resolveScore([]);
    await first;
  });
});

describe("regenerateTldr", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deletes today's snapshot then regenerates it", async () => {
    const env = makeEnv();
    const db = env.DB as unknown as FakeD1;
    const today = tldrSnapshotDate();
    db.tldrSnapshots.set(today, {
      date: today,
      bullets_en: "[]",
      bullets_vi: "[]",
      created_at: 1,
    });
    db.items.set("t1", {
      id: "t1",
      title: "Top story",
      summary: "s",
      status: "published",
      published_at: Math.floor(Date.now() / 1000),
      rank_score: 10,
    });

    vi.spyOn(llm, "generateTldr").mockResolvedValue({
      bullets_en: [{ text: "bullet", item_ids: ["t1"] }],
      bullets_vi: [{ text: "bullet vi", item_ids: ["t1"] }],
      tokens: 3,
    });

    const result = await regenerateTldr(env);
    expect(result.generated).toBe(true);
    expect(db.tldrSnapshots.has(today)).toBe(true);
    expect(
      JSON.parse(db.tldrSnapshots.get(today)?.bullets_en as string)
    ).toEqual([{ text: "bullet", item_ids: ["t1"] }]);
  });
});

describe("listItems", () => {
  function seed(env: Env, id: string, publishedAt: number): void {
    const db = env.DB as unknown as FakeD1;
    db.items.set(id, {
      id,
      source_id: "hn",
      external_id: null,
      url: `https://example.com/${id}`,
      title: `Title ${id}`,
      summary: "summary",
      published_at: publishedAt,
      fetched_at: publishedAt,
      points: 10,
      comments: 2,
      llm_relevance: 0.5,
      llm_importance: 5,
      llm_quality: 5,
      category: null,
      tags: "[]",
      rank_score: 1,
      status: "published",
    });
  }

  it("returns rows newest-first across all statuses", async () => {
    const env = makeEnv();
    seed(env, "a", 100);
    seed(env, "b", 300);
    seed(env, "c", 200);
    (env.DB as unknown as FakeD1).items.get("a")!.status = "rejected";

    const result = await listItems(env);
    expect(result.items.map((i: any) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("caps the limit at 200", async () => {
    const env = makeEnv();
    for (let i = 0; i < 250; i++) seed(env, `id-${i}`, i);

    const result = await listItems(env, "1000");
    expect(result.items).toHaveLength(200);
  });
});

describe("updateItem", () => {
  function seed(env: Env, id: string): void {
    const db = env.DB as unknown as FakeD1;
    db.items.set(id, {
      id,
      source_id: "hn",
      external_id: null,
      url: `https://example.com/${id}`,
      title: `Title ${id}`,
      summary: "summary",
      published_at: Math.floor(Date.now() / 1000),
      fetched_at: Math.floor(Date.now() / 1000),
      points: 10,
      comments: 2,
      llm_relevance: 0.5,
      llm_importance: 5,
      llm_quality: 5,
      category: null,
      tags: "[]",
      rank_score: 1,
      status: "published",
    });
  }

  it("returns 404 for an unknown id", async () => {
    const env = makeEnv();
    const result = await updateItem(env, { id: "missing", action: "reject" });
    expect(isHandlerError(result)).toBe(true);
    if (!isHandlerError(result)) throw new Error("unreachable");
    expect(result.status).toBe(404);
  });

  it("reject sets status to rejected", async () => {
    const env = makeEnv();
    seed(env, "item-1");
    const result = await updateItem(env, { id: "item-1", action: "reject" });
    expect(isHandlerError(result)).toBe(false);
    expect((env.DB as unknown as FakeD1).items.get("item-1")?.status).toBe(
      "rejected"
    );
  });

  it("restore sets status back to published", async () => {
    const env = makeEnv();
    seed(env, "item-2");
    (env.DB as unknown as FakeD1).items.get("item-2")!.status = "rejected";
    const result = await updateItem(env, { id: "item-2", action: "restore" });
    expect(isHandlerError(result)).toBe(false);
    expect((env.DB as unknown as FakeD1).items.get("item-2")?.status).toBe(
      "published"
    );
  });

  it("rate clamps importance/quality and recomputes rank_score", async () => {
    const env = makeEnv();
    seed(env, "item-3");
    const result = await updateItem(env, {
      id: "item-3",
      action: "rate",
      importance: 99,
      quality: -5,
    });
    expect(isHandlerError(result)).toBe(false);
    const row = (env.DB as unknown as FakeD1).items.get("item-3");
    expect(row?.llm_importance).toBe(10);
    expect(row?.llm_quality).toBe(0);
    expect(row?.rank_score).not.toBe(1);
  });
});

describe("triggerIngest", () => {
  it("creates a workflow instance when no scheduler is bound", async () => {
    const env = makeEnv();
    const result = await triggerIngest(env);
    expect(result.skipped).toBe(false);
    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(env.NEWS_INGEST.create).toHaveBeenCalledWith({ id: result.id });
    const runs = (env.DB as unknown as FakeD1).workflowRuns;
    expect(runs).toHaveLength(1);
    expect(runs[0]?.id).toBe(result.id);
  });

  it("returns a skipped tick from the scheduler without creating a workflow", async () => {
    const create = vi.fn();
    const canStart = vi.fn().mockResolvedValue({
      id: null,
      skipped: true,
      reason: "ran recently",
    });
    const startInstance = vi.fn();
    const env = makeEnv({
      NEWS_INGEST: { create } as unknown as Workflow,
      NEWS_INGEST_SCHEDULER: {
        idFromName: () => "id",
        get: () => ({
          tick: vi.fn(),
          canStart,
          startInstance,
          markStarted: vi.fn(),
          ensureArmed: vi.fn(),
        }),
      } as unknown as DurableObjectNamespace,
    });
    const result = await triggerIngest(env);
    expect(result).toEqual({
      id: null,
      skipped: true,
      reason: "ran recently",
    });
    expect(create).not.toHaveBeenCalled();
    expect(startInstance).not.toHaveBeenCalled();
    expect((env.DB as unknown as FakeD1).workflowRuns).toHaveLength(0);
  });

  it("persists workflow_runs before Worker create({ id }) when force is set", async () => {
    const canStart = vi.fn().mockResolvedValue({
      id: null,
      skipped: false,
    });
    const startInstance = vi.fn();
    const markStarted = vi.fn();
    const create = vi.fn(async (opts?: { id?: string }) => ({
      id: opts?.id,
    }));
    const env = makeEnv({
      NEWS_INGEST: { create } as unknown as Workflow,
      NEWS_INGEST_SCHEDULER: {
        idFromName: () => "id",
        get: () => ({
          tick: vi.fn(),
          canStart,
          startInstance,
          markStarted,
          ensureArmed: vi.fn(),
        }),
      } as unknown as DurableObjectNamespace,
    });
    const result = await triggerIngest(env, { force: true });
    expect(canStart).toHaveBeenCalledWith({ force: true });
    expect(result.skipped).toBe(false);
    expect(startInstance).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith({ id: result.id });
    expect(markStarted).toHaveBeenCalledWith(result.id);
    const runs = (env.DB as unknown as FakeD1).workflowRuns;
    expect(runs).toHaveLength(1);
    expect(runs[0]?.id).toBe(result.id);
  });

  it("force persist beats a leftover millisecond lastRun row", async () => {
    const leftover = "42d830a9-689c-4e9a-9e91-98e812016b97";
    const env = makeEnv();
    (env.DB as unknown as FakeD1).workflowRuns.push({
      id: leftover,
      started_at: 1_787_761_102_000,
      finished_at: 1_787_761_102_000,
      items_fetched: 0,
      items_new: 0,
      error: null,
      stats: "{}",
    });
    const result = await triggerIngest(env, { force: true });
    expect(result.skipped).toBe(false);
    expect(result.id).not.toBe(leftover);
    const runs = (env.DB as unknown as FakeD1).workflowRuns;
    const last = [...runs].sort((a, b) => {
      const epoch = (value: unknown): number => {
        const n = Number(value ?? 0);
        return n > 1_000_000_000_000 ? n / 1000 : n;
      };
      return epoch(b.started_at) - epoch(a.started_at);
    })[0];
    expect(last?.id).toBe(result.id);
  });
});

describe("MCP server", () => {
  const url = "https://news.duyet.net/api/mcp";

  it("tools/list returns the 6 admin tools", async () => {
    const env = makeEnv();
    const req = new Request(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer secret-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    const res = await handleMcpRequest(req, env);
    const json = (await res.json()) as any;
    expect(json.result.tools.map((t: any) => t.name).sort()).toEqual(
      [
        "push_items",
        "list_sources",
        "upsert_source",
        "delete_source",
        "trigger_ingest",
        "get_status",
      ].sort()
    );
  });

  it("tools/call push_items happy path", async () => {
    const env = makeEnv();
    const req = new Request(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer secret-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "push_items",
          arguments: {
            items: { url: "https://example.com/mcp", title: "Via MCP" },
          },
        },
      }),
    });
    const res = await handleMcpRequest(req, env);
    const json = (await res.json()) as any;
    const payload = JSON.parse(json.result.content[0].text);
    expect(payload.inserted).toBe(1);
  });

  it("tools/call get_status happy path", async () => {
    const env = makeEnv();
    await pushItems(env, {
      url: "https://example.com/status-check",
      title: "X",
    });
    const req = new Request(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer secret-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "get_status", arguments: {} },
      }),
    });
    const res = await handleMcpRequest(req, env);
    const json = (await res.json()) as any;
    const payload = JSON.parse(json.result.content[0].text);
    expect(Array.isArray(payload.runs)).toBe(true);
    expect(payload.itemsByStatus).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: "new", c: 1 })])
    );
  });

  it("returns checkAuth's plain 401 Response on auth failure (not a JSON-RPC error)", async () => {
    const env = makeEnv();
    const req = new Request(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer wrong",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 4, method: "tools/list" }),
    });
    const res = await handleMcpRequest(req, env);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "unauthorized" });
  });
});
