import { afterEach, describe, expect, it, vi } from "vitest";
import { generateCardDescription } from "./openrouter.js";

const INPUT = {
  apiKey: "sk-test",
  content: "blog content",
  systemPrompt: "be witty",
};

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("generateCardDescription", () => {
  it("posts to the chat completions endpoint with the bearer key", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ choices: [{ message: { content: "A description." } }] })
      );
    vi.stubGlobal("fetch", fetchMock);

    const description = await generateCardDescription(INPUT);

    expect(description).toBe("A description.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer sk-test"
    );
    expect(JSON.parse(String(init.body))).toEqual({
      messages: [
        { content: "be witty", role: "system" },
        { content: "Content to describe:\n\nblog content", role: "user" },
      ],
      max_tokens: 200,
      model: "z-ai/glm-4.5-air:free",
    });
  });

  it("strips special tokens and trims the result", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({
            choices: [{ message: { content: " <s>Hi [OUT]<INS> there " } }],
          })
        )
    );

    expect(await generateCardDescription(INPUT)).toBe("Hi  there");
  });

  it("falls back to the top-level content field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ content: "fallback text" }))
    );

    expect(await generateCardDescription(INPUT)).toBe("fallback text");
  });

  it("returns an empty string when no content is present", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({})));

    expect(await generateCardDescription(INPUT)).toBe("");
  });

  it("throws with the status and body on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => '{"error":"Missing Authentication header"}',
      } as unknown as Response)
    );

    await expect(generateCardDescription(INPUT)).rejects.toThrow(
      'OpenRouter error: 401 - {"error":"Missing Authentication header"}'
    );
  });
});
