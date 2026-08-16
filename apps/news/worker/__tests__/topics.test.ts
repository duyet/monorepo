import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dedupeNormalized,
  MAX_TAGS_PER_ITEM,
  normalizeTopicName,
  normalizeTopics,
  parseTopicMappingResponse,
  rankTopics,
  topRankedTopics,
  unionTopics,
} from "../topics.js";
import type { Env } from "../types.js";

describe("normalizeTopicName", () => {
  it("lowercases and trims", () => {
    expect(normalizeTopicName("  OpenAI  ")).toBe("openai");
  });

  it("collapses spaces and underscores into a single dash", () => {
    expect(normalizeTopicName("open source")).toBe("open-source");
    expect(normalizeTopicName("open_source")).toBe("open-source");
    expect(normalizeTopicName("open   source")).toBe("open-source");
  });

  it("drops characters outside [a-z0-9-]", () => {
    expect(normalizeTopicName("GPT-5.5!")).toBe("gpt-55");
    expect(normalizeTopicName("C++")).toBe("c");
  });

  it("collapses repeated dashes and trims leading/trailing dashes", () => {
    expect(normalizeTopicName("--open--source--")).toBe("open-source");
  });

  it("is idempotent: normalizing an already-normalized name is a no-op", () => {
    expect(normalizeTopicName("open-source")).toBe("open-source");
    expect(normalizeTopicName("multi-agent")).toBe("multi-agent");
  });
});

describe("dedupeNormalized", () => {
  it("normalizes and dedupes variants that collapse to the same name", () => {
    expect(
      dedupeNormalized(["Open Source", "open-source", "OPEN_SOURCE"])
    ).toEqual(["open-source"]);
  });

  it("drops entries that normalize to empty", () => {
    expect(dedupeNormalized(["!!!", "valid-tag", "   "])).toEqual([
      "valid-tag",
    ]);
  });

  it("preserves first-seen order (not sorted)", () => {
    expect(dedupeNormalized(["b", "a", "b", "c"])).toEqual(["b", "a", "c"]);
  });
});

describe("unionTopics", () => {
  it("dedupes, base first", () => {
    expect(unionTopics(["a", "b"], ["b", "c"], 8)).toEqual(["a", "b", "c"]);
  });

  it("caps at the given limit", () => {
    const many = Array.from({ length: 10 }, (_, i) => `t${i}`);
    expect(unionTopics(many, [], 8)).toHaveLength(8);
  });
});

describe("parseTopicMappingResponse", () => {
  it("maps a well-formed response", () => {
    const result = parseTopicMappingResponse(
      JSON.stringify({ mappings: [{ name: "llms", canonical: "llm" }] }),
      ["llms"]
    );
    expect(result.get("llms")).toBe("llm");
  });

  it("defaults every unseen name to itself before applying the response", () => {
    const result = parseTopicMappingResponse(JSON.stringify({ mappings: [] }), [
      "new-concept",
    ]);
    expect(result.get("new-concept")).toBe("new-concept");
  });

  it("ignores a mapping for a name that wasn't asked about", () => {
    const result = parseTopicMappingResponse(
      JSON.stringify({
        mappings: [{ name: "unasked", canonical: "something" }],
      }),
      ["llms"]
    );
    expect(result.get("llms")).toBe("llms"); // still defaulted to itself
    expect(result.has("unasked")).toBe(false);
  });

  it("normalizes both name and canonical in the response before applying", () => {
    const result = parseTopicMappingResponse(
      JSON.stringify({
        mappings: [{ name: "LLMs", canonical: "Open Source" }],
      }),
      ["llms"]
    );
    expect(result.get("llms")).toBe("open-source");
  });

  it("tolerates fenced/prose-wrapped JSON", () => {
    const result = parseTopicMappingResponse(
      `\`\`\`json\n${JSON.stringify({
        mappings: [{ name: "llms", canonical: "llm" }],
      })}\n\`\`\``,
      ["llms"]
    );
    expect(result.get("llms")).toBe("llm");
  });

  it("degrades to identity mapping on unparseable content, never throws", () => {
    const result = parseTopicMappingResponse("not json", ["a", "b"]);
    expect(result.get("a")).toBe("a");
    expect(result.get("b")).toBe("b");
  });

  it("degrades to identity mapping when mappings is missing/not an array", () => {
    const result = parseTopicMappingResponse(JSON.stringify({}), ["a"]);
    expect(result.get("a")).toBe("a");
  });

  it("skips malformed entries (missing name/canonical) without crashing", () => {
    const result = parseTopicMappingResponse(
      JSON.stringify({
        mappings: [{ name: "llms" }, { canonical: "llm" }, "garbage"],
      }),
      ["llms"]
    );
    expect(result.get("llms")).toBe("llms");
  });
});

describe("rankTopics", () => {
  it("counts occurrences and sorts most-frequent first", () => {
    const result = rankTopics([["a", "b"], ["a"], ["a", "c"], ["b"]], 10);
    expect(result).toEqual([
      { topic: "a", count: 3 },
      { topic: "b", count: 2 },
      { topic: "c", count: 1 },
    ]);
  });

  it("respects the limit", () => {
    const result = rankTopics([["a"], ["b"], ["c"]], 2);
    expect(result).toHaveLength(2);
  });

  it("returns [] for no items", () => {
    expect(rankTopics([], 10)).toEqual([]);
  });
});

const env: Env = {
  DB: {} as D1Database,
  NEWS_INGEST: {} as Workflow,
  ANYROUTER_BASE_URL: "https://anyrouter.dev/api/v1",
  ANYROUTER_MODEL: "test-model",
  ANYROUTER_API_KEY: "test-key",
  NEWS_ADMIN_TOKEN: "test-token",
};

function chatResponse(content: string): Response {
  return new Response(
    `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`,
    { status: 200 }
  );
}

function makeDb(opts: {
  existingTopics: { name: string; canonical: string }[];
}) {
  const statements: { sql: string; args: unknown[] }[] = [];
  const db = {
    prepare(sql: string) {
      const bound = () => ({
        all: async () => ({ results: opts.existingTopics }),
        first: async () => null,
        run: async () => ({ success: true }),
      });
      return {
        ...bound(),
        bind: (...args: unknown[]) => {
          statements.push({ sql, args });
          return bound();
        },
      };
    },
    batch: async (stmts: unknown[]) => {
      statements.push({ sql: `BATCH(${stmts.length})`, args: [] });
      return [];
    },
  };
  return { db: db as unknown as D1Database, statements };
}

describe("normalizeTopics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rewrites raw tags to their existing canonical without calling the LLM", async () => {
    const { db } = makeDb({
      existingTopics: [{ name: "llms", canonical: "llm" }],
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await normalizeTopics(
      { ...env, DB: db },
      new Map([["item1", ["LLMs"]]]),
      1_700_000_000_000
    );

    expect(result.get("item1")).toEqual(["llm"]);
    expect(fetchMock).not.toHaveBeenCalled(); // no unseen variants
  });

  it("calls the LLM only for genuinely unseen normalized names", async () => {
    const { db } = makeDb({ existingTopics: [] });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        chatResponse(
          JSON.stringify({
            mappings: [{ name: "open-source-ai", canonical: "open-source" }],
          })
        )
      )
    );

    const result = await normalizeTopics(
      { ...env, DB: db },
      new Map([["item1", ["Open Source AI"]]]),
      1_700_000_000_000
    );

    expect(result.get("item1")).toEqual(["open-source"]);
  });

  it("caps the rewritten tags per item at MAX_TAGS_PER_ITEM", async () => {
    const { db } = makeDb({ existingTopics: [] });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(chatResponse(JSON.stringify({ mappings: [] })))
    );

    const manyTags = Array.from({ length: 10 }, (_, i) => `topic-${i}`);
    const result = await normalizeTopics(
      { ...env, DB: db },
      new Map([["item1", manyTags]]),
      1_700_000_000_000
    );

    expect(result.get("item1")?.length).toBeLessThanOrEqual(MAX_TAGS_PER_ITEM);
  });

  it("persists a topics row per normalized variant via a batched upsert", async () => {
    const { db, statements } = makeDb({ existingTopics: [] });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(chatResponse(JSON.stringify({ mappings: [] })))
    );

    await normalizeTopics(
      { ...env, DB: db },
      new Map([["item1", ["new-topic"]]]),
      1_700_000_000_000
    );

    const upsert = statements.find((s) => s.sql.includes("INSERT INTO topics"));
    expect(upsert).toBeDefined();
    expect(upsert?.args).toContain("new-topic");
    expect(statements.some((s) => s.sql.startsWith("BATCH"))).toBe(true);
  });

  it("returns empty arrays for items with no tags, without touching the DB", async () => {
    const { db, statements } = makeDb({ existingTopics: [] });
    const result = await normalizeTopics(
      { ...env, DB: db },
      new Map([["item1", []]]),
      1_700_000_000_000
    );
    expect(result.get("item1")).toEqual([]);
    expect(statements).toHaveLength(0);
  });
});

describe("topRankedTopics", () => {
  it("scans items.tags for published items in the window and ranks them", async () => {
    const db = {
      prepare() {
        return {
          bind: () => ({
            all: async () => ({
              results: [
                { tags: JSON.stringify(["llm", "openai"]) },
                { tags: JSON.stringify(["llm"]) },
                { tags: "not json" }, // skipped defensively
              ],
            }),
          }),
        };
      },
    } as unknown as D1Database;

    const result = await topRankedTopics(db, { sinceSec: 0, limit: 10 });
    expect(result).toEqual([
      { topic: "llm", count: 2 },
      { topic: "openai", count: 1 },
    ]);
  });
});
