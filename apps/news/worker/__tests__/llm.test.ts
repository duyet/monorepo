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

/** Anyrouter only answers large prompts inline when the request sets
 * `stream: true`, so every mocked response is an SSE body. */
function sseBody(events: unknown[]): string {
  return `${events
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("")}data: [DONE]\n\n`;
}

function sseResponse(events: unknown[]): Response {
  return new Response(sseBody(events), { status: 200 });
}

function chatResponse(content: string): Response {
  return sseResponse([{ choices: [{ delta: { content } }] }]);
}

function reasoningResponse(reasoning: string, content = ""): Response {
  return sseResponse([{ choices: [{ delta: { content, reasoning } }] }]);
}

function chatResponseWithUsage(content: string, totalTokens: number): Response {
  return sseResponse([
    { choices: [{ delta: { content } }] },
    { usage: { totalTokens } },
  ]);
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

describe("streaming anyrouter responses", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  /** Splits an SSE body into fixed-size chunks so `data:` lines land across
   * chunk boundaries, the way they do on a real connection. */
  function chunkedResponse(body: string, chunkSize: number): Response {
    const bytes = new TextEncoder().encode(body);
    let offset = 0;
    return new Response(
      new ReadableStream<Uint8Array>({
        pull(controller) {
          if (offset >= bytes.length) {
            controller.close();
            return;
          }
          controller.enqueue(bytes.slice(offset, offset + chunkSize));
          offset += chunkSize;
        },
      }),
      { status: 200 }
    );
  }

  // Captured verbatim from a live anyrouter stream. Usage arrives twice: once
  // top-level in snake_case on the penultimate chunk, once nested camelCase in
  // the trailing anyrouter_metadata frame. Also exercises the `p` padding
  // field, `reasoning: null`, empty content deltas, and empty `choices`.
  it("reads usage from a real anyrouter stream tail", async () => {
    const tail = [
      {
        p: "a3ff8e4286",
        id: "gen-1786868498-zFY2O9DpqT4HnClmpHRa",
        object: "chat.completion.chunk",
        choices: [
          {
            index: 0,
            delta: { content: "", role: "assistant", reasoning: null },
            finish_reason: "stop",
          },
        ],
      },
      {
        p: "c2e8",
        object: "chat.completion.chunk",
        choices: [{ index: 0, delta: { content: "", role: "assistant" } }],
        usage: {
          prompt_tokens: 21,
          completion_tokens: 90,
          total_tokens: 111,
          cost: 0.00005,
        },
      },
      {
        id: "req_32da69d84d50409790065d25",
        object: "chat.completion.chunk",
        choices: [],
        anyrouter_metadata: {
          requestId: "req_32da69d84d50409790065d25",
          usage: {
            inputTokens: 21,
            outputTokens: 90,
            cachedTokens: 0,
            totalTokens: 111,
          },
          finishReason: "stop",
        },
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          sseResponse([
            { choices: [{ delta: { content: scorePayload } }] },
            ...tail,
          ])
        )
    );

    const results = await scoreItems(env, scoreInput);
    expect(results).toHaveLength(1);
    expect(results[0].tokens).toBe(111);
  });

  // The Vietnamese house style lives in a system message; losing it silently
  // regresses output to literal, calqued translation.
  it("sends the Vietnamese style rules as a system message when translating", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(chatResponse(JSON.stringify({ results: [] })));
    vi.stubGlobal("fetch", fetchMock);

    await translateItems(env, [{ i: 0, title: "New model released" }]);

    const { messages } = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toMatch(/natural, fluent Vietnamese/);
    expect(messages[0].content).toMatch(/mã nguồn mở/);
    expect(messages[1].role).toBe("user");
  });

  it("requests a stream so anyrouter answers inline instead of queuing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(chatResponse(JSON.stringify({ results: [] })));
    vi.stubGlobal("fetch", fetchMock);

    await scoreItems(env, scoreInput);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).stream).toBe(true);
  });

  it("joins content deltas split across chunk boundaries", async () => {
    const body = sseBody(
      // One delta per character, so reassembly is doing real work.
      [...scorePayload].map((char) => ({
        choices: [{ delta: { content: char } }],
      }))
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(chunkedResponse(body, 7)));

    const results = await scoreItems(env, scoreInput);
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe("Models");
  });

  it("takes tokens from the camelCase usage on the final metadata event", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          sseResponse([
            { choices: [{ delta: { content: scorePayload } }] },
            { usage: { inputTokens: 40, outputTokens: 60, totalTokens: 100 } },
          ])
        )
    );

    const results = await scoreItems(env, scoreInput);
    expect(results[0].tokens).toBe(100);
  });

  // The trailing frame is documented as carrying an `anyrouter_metadata`
  // envelope, so usage must be found there too or token accounting reads zero.
  it("takes tokens from usage nested in the metadata envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        sseResponse([
          { choices: [{ delta: { content: scorePayload } }] },
          {
            type: "response.anyrouter.metadata",
            anyrouter_metadata: { usage: { totalTokens: 88 } },
          },
        ])
      )
    );

    const results = await scoreItems(env, scoreInput);
    expect(results[0].tokens).toBe(88);
  });

  it("sums input/output tokens when no total is reported", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          sseResponse([
            { choices: [{ delta: { content: scorePayload } }] },
            { usage: { inputTokens: 40, outputTokens: 60 } },
          ])
        )
    );

    const results = await scoreItems(env, scoreInput);
    expect(results[0].tokens).toBe(100);
  });

  it("still accepts snake_case usage from a non-streaming-shaped event", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          sseResponse([
            { choices: [{ delta: { content: scorePayload } }] },
            { usage: { total_tokens: 77 } },
          ])
        )
    );

    const results = await scoreItems(env, scoreInput);
    expect(results[0].tokens).toBe(77);
  });

  it("falls back to reasoning deltas when no content is streamed", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          sseResponse([
            { choices: [{ delta: { reasoning: "Thinking. Final answer: " } }] },
            { choices: [{ delta: { reasoning: scorePayload } }] },
          ])
        )
    );

    const results = await scoreItems(env, scoreInput);
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe("Models");
  });

  it("skips the batch when the stream carries no parseable events", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("data: {not json\n\ndata: [DONE]\n\n", { status: 200 })
        )
    );

    expect(await scoreItems(env, scoreInput)).toEqual([]);
  });

  // Streaming is supposed to bypass the queue; if a queue receipt ever comes
  // back anyway it must fail cleanly rather than look like an empty answer.
  it("surfaces a queue receipt as an error and skips the batch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          object: "chat.completion.queued",
          id: "req_abc123",
          choices: [],
          queue_position: 3,
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    expect(await scoreItems(env, scoreInput)).toEqual([]);
    // No re-post: the queue has no retrieval endpoint, so retrying is pointless.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("model fallback chain", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  function sseResponse(events: unknown[]): Response {
    return new Response(
      `${events
        .map((event) => `data: ${JSON.stringify(event)}\n\n`)
        .join("")}data: [DONE]\n\n`,
      { status: 200 }
    );
  }

  function completion(content: string): Response {
    return sseResponse([{ choices: [{ delta: { content } }] }]);
  }

  function modelsOf(fetchMock: ReturnType<typeof vi.fn>): string[] {
    return fetchMock.mock.calls.map(
      (call) => JSON.parse(call[1].body).model as string
    );
  }

  const chain = {
    ...env,
    ANYROUTER_MODEL: "first/model,second/model,third/model",
  };

  it("uses the single configured model when no chain is set", async () => {
    const fetchMock = vi.fn().mockResolvedValue(completion(scorePayload));
    vi.stubGlobal("fetch", fetchMock);

    await scoreItems(env, scoreInput);
    expect(modelsOf(fetchMock)).toEqual(["test-model"]);
  });

  it("stops at the first model that succeeds", async () => {
    const fetchMock = vi.fn().mockResolvedValue(completion(scorePayload));
    vi.stubGlobal("fetch", fetchMock);

    const results = await scoreItems(chain, scoreInput);
    expect(modelsOf(fetchMock)).toEqual(["first/model"]);
    expect(results).toHaveLength(1);
  });

  it("advances past a transport error and a non-200", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("connection reset"))
      .mockResolvedValueOnce(new Response("upstream down", { status: 502 }))
      .mockResolvedValueOnce(completion(scorePayload));
    vi.stubGlobal("fetch", fetchMock);

    const results = await scoreItems(chain, scoreInput);
    expect(modelsOf(fetchMock)).toEqual([
      "first/model",
      "second/model",
      "third/model",
    ]);
    expect(results[0].category).toBe("Models");
  });

  it("advances when a model streams an empty completion", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sseResponse([{ choices: [{ delta: {} }] }]))
      .mockResolvedValueOnce(completion(scorePayload));
    vi.stubGlobal("fetch", fetchMock);

    const results = await scoreItems(chain, scoreInput);
    expect(modelsOf(fetchMock)).toEqual(["first/model", "second/model"]);
    expect(results).toHaveLength(1);
  });

  it("skips the batch when every model in the chain fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("nope", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    expect(await scoreItems(chain, scoreInput)).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("tolerates blank entries and whitespace in the chain", async () => {
    const fetchMock = vi.fn().mockResolvedValue(completion(scorePayload));
    vi.stubGlobal("fetch", fetchMock);

    await scoreItems(
      { ...env, ANYROUTER_MODEL: " , solo/model , " },
      scoreInput
    );
    expect(modelsOf(fetchMock)).toEqual(["solo/model"]);
  });

  it("prefers the per-task translate model over ANYROUTER_MODEL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(completion(JSON.stringify({ results: [] })));
    vi.stubGlobal("fetch", fetchMock);

    await translateItems(
      { ...chain, ANYROUTER_TRANSLATE_MODEL: "aisingapore/gemma-sea-lion" },
      [{ i: 0, title: "Story" }]
    );
    expect(modelsOf(fetchMock)).toEqual(["aisingapore/gemma-sea-lion"]);
  });

  it("prefers the per-task tldr model over ANYROUTER_MODEL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      completion(
        JSON.stringify({
          bullets_en: [{ text: "A", item_id: "1" }],
          bullets_vi: [{ text: "B", item_id: "1" }],
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await generateTldr({ ...chain, ANYROUTER_TLDR_MODEL: "tldr/model" }, [
      { id: "1", title: "Story" },
    ]);
    expect(modelsOf(fetchMock)).toEqual(["tldr/model"]);
  });

  it("falls back to ANYROUTER_MODEL when the per-task override is unset", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(completion(JSON.stringify({ results: [] })));
    vi.stubGlobal("fetch", fetchMock);

    await translateItems(chain, [{ i: 0, title: "Story" }]);
    expect(modelsOf(fetchMock)).toEqual(["first/model"]);
  });

  it("uses the whole chain when a per-task override lists several models", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce(completion(JSON.stringify({ results: [] })));
    vi.stubGlobal("fetch", fetchMock);

    await translateItems(
      { ...env, ANYROUTER_TRANSLATE_MODEL: "vi/primary,vi/backup" },
      [{ i: 0, title: "Story" }]
    );
    expect(modelsOf(fetchMock)).toEqual(["vi/primary", "vi/backup"]);
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
        chatResponse(
          JSON.stringify({
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
          })
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
