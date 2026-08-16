import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  _normalizeTldrForTests as normalizeTldr,
  _parseJsonForTests as parseJson,
  generateTldr,
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
      parseJson<{ a: number }>('Sure, here is the result: {"a":1} Hope that helps!')
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
  return new Response(
    JSON.stringify({ choices: [{ message: { content } }] }),
    { status: 200 }
  );
}

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
    expect(result).toEqual({ bullets_en: [], bullets_vi: [] });
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
