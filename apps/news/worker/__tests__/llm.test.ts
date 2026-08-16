import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  _parseJsonForTests as parseJson,
  scoreItems,
  translateItems,
} from "../llm.js";
import type { Env } from "../types.js";

const env: Env = {
  DB: {} as D1Database,
  NEWS_INGEST: {} as Workflow,
  ANYROUTER_BASE_URL: "https://anyrouter.dev/api/v1",
  ANYROUTER_MODEL: "test-model",
  ANYROUTER_API_KEY: "test-key",
  NEWS_ADMIN_TOKEN: "test-token",
};

describe("parseJson", () => {
  it("parses plain JSON", () => {
    expect(parseJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips markdown fences", () => {
    expect(parseJson<{ a: number }>('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("strips fences without language tag", () => {
    expect(parseJson<{ a: number }>('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("throws on malformed JSON", () => {
    expect(() => parseJson("not json")).toThrow();
  });
});

describe("scoreItems / translateItems batch failure handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("skips a batch when the anyrouter call fails, without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("server error", { status: 500 }))
    );

    const results = await scoreItems(env, [
      { i: 0, title: "New AI model released", source: "hn" },
    ]);
    expect(results).toEqual([]);
  });

  it("skips a batch when the response body is malformed JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ choices: [{ message: { content: "not json" } }] }),
            { status: 200 }
          )
        )
    );

    const results = await translateItems(env, [{ i: 0, title: "Hello" }]);
    expect(results).toEqual([]);
  });

  it("parses a well-formed scoring response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    results: [
                      {
                        i: 0,
                        relevance: 0.9,
                        importance: 7,
                        quality: 8,
                        category: "Models",
                        tags: ["gpt"],
                      },
                    ],
                  }),
                },
              },
            ],
          }),
          { status: 200 }
        )
      )
    );

    const results = await scoreItems(env, [
      { i: 0, title: "New model released", source: "hn" },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe("Models");
  });
});
