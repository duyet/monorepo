import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  _extractLastJsonObjectForTests as extractLastJsonObject,
  generateTldr,
  _normalizeTldrForTests as normalizeTldr,
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

  it("extracts a JSON object wrapped in prose, with no fence", () => {
    expect(
      parseJson<{ a: number }>(
        'Sure, here is the result: {"a":1} Hope that helps!'
      )
    ).toEqual({ a: 1 });
  });

  it("extracts a JSON array wrapped in prose", () => {
    expect(parseJson<number[]>("The list is [1,2,3] as requested.")).toEqual([
      1, 2, 3,
    ]);
  });

  it("throws on malformed JSON", () => {
    expect(() => parseJson("not json")).toThrow();
  });

  it("throws when there's no JSON-shaped content at all", () => {
    expect(() => parseJson("no braces or brackets here")).toThrow();
  });
});

function chatResponse(content: string): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
  });
}

function reasoningResponse(reasoning: string, content = ""): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content, reasoning } }] }),
    { status: 200 }
  );
}

function chatResponseWithUsage(content: string, totalTokens: number): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { total_tokens: totalTokens },
    }),
    { status: 200 }
  );
}

describe("extractLastJsonObject", () => {
  it("returns null when there's no closing brace", () => {
    expect(extractLastJsonObject("no json here")).toBeNull();
  });

  it("extracts a single top-level object", () => {
    expect(extractLastJsonObject('some reasoning... {"a":1}')).toBe('{"a":1}');
  });

  it("extracts the LAST of multiple objects, respecting nested braces", () => {
    const text =
      'Let me think: {"draft":1} actually wait, final answer: {"a":{"nested":1},"b":2}';
    expect(extractLastJsonObject(text)).toBe('{"a":{"nested":1},"b":2}');
  });
});

describe("normalizeTldr", () => {
  it("accepts the documented bullets_en/bullets_vi shape", () => {
    const result = normalizeTldr({
      bullets_en: [{ text: "A", item_id: "1" }],
      bullets_vi: [{ text: "B", item_id: "2" }],
    });
    expect(result).toEqual({
      bullets_en: [{ text: "A", item_id: "1" }],
      bullets_vi: [{ text: "B", item_id: "2" }],
    });
  });

  it("accepts the alternate {bullets: {en, vi}} shape", () => {
    const result = normalizeTldr({
      bullets: {
        en: [{ text: "A", item_id: "1" }],
        vi: [{ text: "B", item_id: "2" }],
      },
    });
    expect(result).toEqual({
      bullets_en: [{ text: "A", item_id: "1" }],
      bullets_vi: [{ text: "B", item_id: "2" }],
    });
  });

  it("tolerates bullets missing item_id and plain-string bullets", () => {
    const result = normalizeTldr({
      bullets_en: [{ text: "No id here" }, "Just a string bullet"],
      bullets_vi: [],
    });
    expect(result.bullets_en).toEqual([
      { text: "No id here", item_id: "" },
      { text: "Just a string bullet", item_id: "" },
    ]);
  });

  it("returns empty arrays for garbage input", () => {
    expect(normalizeTldr(null)).toEqual({ bullets_en: [], bullets_vi: [] });
    expect(normalizeTldr("a string")).toEqual({
      bullets_en: [],
      bullets_vi: [],
    });
    expect(normalizeTldr({})).toEqual({ bullets_en: [], bullets_vi: [] });
  });
});

describe("generateTldr", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses a well-formed fenced response on the first attempt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        chatResponse(
          `\`\`\`json\n${JSON.stringify({
            bullets_en: [{ text: "A", item_id: "1" }],
            bullets_vi: [{ text: "B", item_id: "1" }],
          })}\n\`\`\``
        )
      )
    );

    const result = await generateTldr(env, [{ id: "1", title: "Story" }]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.bullets_en).toHaveLength(1);
  });

  it("accepts a prose-wrapped alternate-shape response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        chatResponse(
          `Here you go: ${JSON.stringify({
            bullets: {
              en: [{ text: "A", item_id: "1" }],
              vi: [{ text: "B", item_id: "1" }],
            },
          })}`
        )
      )
    );

    const result = await generateTldr(env, [{ id: "1", title: "Story" }]);
    expect(result.bullets_en).toEqual([{ text: "A", item_id: "1" }]);
    expect(result.bullets_vi).toEqual([{ text: "B", item_id: "1" }]);
  });

  it("retries once when the first attempt returns empty bullets, then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        chatResponse(JSON.stringify({ bullets_en: [], bullets_vi: [] }))
      )
      .mockResolvedValueOnce(
        chatResponse(
          JSON.stringify({
            bullets_en: [{ text: "A", item_id: "1" }],
            bullets_vi: [{ text: "B", item_id: "1" }],
          })
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateTldr(env, [{ id: "1", title: "Story" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.bullets_en).toHaveLength(1);
  });

  it("retries once when the first attempt is unparseable, then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(chatResponse("not json at all, no braces"))
      .mockResolvedValueOnce(
        chatResponse(
          JSON.stringify({
            bullets_en: [{ text: "A", item_id: "1" }],
            bullets_vi: [{ text: "B", item_id: "1" }],
          })
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateTldr(env, [{ id: "1", title: "Story" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.bullets_en).toHaveLength(1);
  });

  it("gives up after two empty/unparseable attempts and returns empty, never throwing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(chatResponse("still no json"))
      .mockResolvedValueOnce(
        chatResponse(JSON.stringify({ bullets_en: [], bullets_vi: [] }))
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateTldr(env, [{ id: "1", title: "Story" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.bullets_en).toEqual([]);
    expect(result.bullets_vi).toEqual([]);
    expect(result.tokens).toBe(0); // no usage field in these mocked responses
  });
});

describe("queued anyrouter responses", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Anyrouter answers long prompts with a queue receipt instead of a
  // completion, and offers no endpoint to collect the result by id, so the
  // only recovery is re-posting the identical request.
  function queuedResponse(estimatedWaitMs = 0): Response {
    return new Response(
      JSON.stringify({
        object: "chat.completion.queued",
        id: "req_abc123",
        choices: [],
        queue_position: 3,
        estimated_wait_ms: estimatedWaitMs,
      }),
      { status: 200 }
    );
  }

  const scoreInput = [{ i: 0, title: "Story", source: "hn" }];
  const scorePayload = JSON.stringify({
    results: [
      {
        i: 0,
        relevance: 0.9,
        importance: 7,
        quality: 8,
        category: "Models",
        tags: ["ai"],
      },
    ],
  });

  it("re-posts after a queued response and returns the completion", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(queuedResponse())
      .mockResolvedValueOnce(chatResponse(scorePayload));
    vi.stubGlobal("fetch", fetchMock);

    const results = await scoreItems(env, scoreInput);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe("Models");
  });

  it("gives up after the re-post budget and skips the batch", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => queuedResponse());
    vi.stubGlobal("fetch", fetchMock);

    const results = await scoreItems(env, scoreInput);
    // One initial post plus two bounded re-posts, then the batch is skipped.
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(results).toEqual([]);
  });

  it("stops immediately when the queue is longer than the budget", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => queuedResponse(120_000));
    vi.stubGlobal("fetch", fetchMock);

    const results = await scoreItems(env, scoreInput);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results).toEqual([]);
  });

  it("does not re-post an ordinary response that merely lacks content", async () => {
    const fetchMock = vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ choices: [{ message: {} }] }), {
          status: 200,
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const results = await scoreItems(env, scoreInput);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results).toEqual([]);
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

  it("sends a generous max_tokens so reasoning can't starve the answer", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(chatResponse(JSON.stringify({ results: [] })));
    vi.stubGlobal("fetch", fetchMock);

    await scoreItems(env, [{ i: 0, title: "Story", source: "hn" }]);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.max_tokens).toBeGreaterThanOrEqual(4096);
  });

  it("sends app-attribution headers so usage shows up in the anyrouter dashboard", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(chatResponse(JSON.stringify({ results: [] })));
    vi.stubGlobal("fetch", fetchMock);

    await scoreItems(env, [{ i: 0, title: "Story", source: "hn" }]);

    const { headers } = fetchMock.mock.calls[0][1];
    expect(headers["HTTP-Referer"]).toBe("https://news.duyet.net");
    expect(headers["X-Title"]).toBe("AI News (news.duyet.net)");
  });

  it("falls back to extracting JSON from message.reasoning when content is empty (reasoning-model quirk)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        reasoningResponse(
          `Let me analyze this story... it's clearly about AI. Final answer: ${JSON.stringify(
            {
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
            }
          )}`
        )
      )
    );

    const results = await scoreItems(env, [
      { i: 0, title: "New model released", source: "hn" },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe("Models");
  });

  it("skips the batch when both content and reasoning are empty/missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ choices: [{ message: {} }] }), {
          status: 200,
        })
      )
    );

    const results = await scoreItems(env, [
      { i: 0, title: "Story", source: "hn" },
    ]);
    expect(results).toEqual([]);
  });

  it("attributes a batch's total tokens evenly across every requested item, rounding up", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        chatResponseWithUsage(
          JSON.stringify({
            results: [
              {
                i: 0,
                relevance: 0.9,
                importance: 7,
                quality: 8,
                category: "Models",
                tags: [],
              },
              {
                i: 1,
                relevance: 0.8,
                importance: 6,
                quality: 7,
                category: "Products",
                tags: [],
              },
              {
                i: 2,
                relevance: 0.7,
                importance: 5,
                quality: 6,
                category: "Research",
                tags: [],
              },
            ],
          }),
          100 // 100 tokens / 3 items -> ceil(33.33) = 34 per item
        )
      )
    );

    const results = await scoreItems(env, [
      { i: 0, title: "A", source: "hn" },
      { i: 1, title: "B", source: "hn" },
      { i: 2, title: "C", source: "hn" },
    ]);

    expect(results).toHaveLength(3);
    for (const result of results) {
      expect(result.tokens).toBe(34);
    }
  });

  it("attributes tokens by the batch's requested size, not the model's returned result count", async () => {
    // The model only returned 1 of 2 requested items (e.g. it dropped one),
    // but the full batch's token cost should still divide by the requested
    // batch size, not by how many results actually came back.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        chatResponseWithUsage(
          JSON.stringify({
            results: [
              {
                i: 0,
                relevance: 0.9,
                importance: 7,
                quality: 8,
                category: "Models",
                tags: [],
              },
            ],
          }),
          50
        )
      )
    );

    const results = await scoreItems(env, [
      { i: 0, title: "A", source: "hn" },
      { i: 1, title: "B", source: "hn" },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].tokens).toBe(25); // 50 / 2 requested, not 50 / 1 returned
  });

  it("attributes translateItems tokens evenly across the batch too", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        chatResponseWithUsage(
          JSON.stringify({
            results: [
              { i: 0, title: "Tiêu đề A", summary: "Tóm tắt A" },
              { i: 1, title: "Tiêu đề B", summary: "Tóm tắt B" },
            ],
          }),
          60
        )
      )
    );

    const results = await translateItems(env, [
      { i: 0, title: "Title A" },
      { i: 1, title: "Title B" },
    ]);

    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(result.tokens).toBe(30);
    }
  });
});
