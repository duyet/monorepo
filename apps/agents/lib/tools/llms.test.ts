import { describe, test, expect, mock, beforeEach } from "bun:test";
import { fetchLlmsTxtTool, getLlmsDomains } from "./llms";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = originalFetch;
});

describe("fetchLlmsTxtTool", () => {
  test("fetches known domain key (blog)", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response("# blog.duyet.net llms.txt\nSome content", { status: 200 })
      )
    ) as typeof fetch;

    const result = await fetchLlmsTxtTool("blog");
    expect(result.content).toContain("blog.duyet.net llms.txt");
    expect(result.sources.length).toBe(1);
    expect(result.sources[0].type).toBe("llms-txt");
    expect(result.sources[0].url).toBe("https://blog.duyet.net/llms.txt");
    expect(result.sources[0].title).toBe("blog llms.txt");
  });

  test("fetches full URL input directly", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response("# custom llms.txt content", { status: 200 })
      )
    ) as typeof fetch;

    const result = await fetchLlmsTxtTool("https://custom.example.com/llms.txt");
    expect(result.content).toContain("custom llms.txt content");
    expect(result.sources[0].url).toBe("https://custom.example.com/llms.txt");
  });

  test("constructs URL for unknown string domain", async () => {
    let capturedUrl = "";
    globalThis.fetch = mock((url: RequestInfo | URL) => {
      capturedUrl = url.toString();
      return Promise.resolve(
        new Response("# Unknown domain content", { status: 200 })
      );
    }) as typeof fetch;

    const result = await fetchLlmsTxtTool("unknowndomain");
    expect(capturedUrl).toBe("https://unknowndomain.duyet.net/llms.txt");
    expect(result.content).toContain("Unknown domain content");
    expect(result.sources[0].url).toBe("https://unknowndomain.duyet.net/llms.txt");
  });

  test("returns content on success response", async () => {
    const sampleContent = "# llms.txt\n\nSome markdown content for LLMs.";
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(sampleContent, { status: 200 }))
    ) as typeof fetch;

    const result = await fetchLlmsTxtTool("home");
    expect(result.content).toBe(sampleContent);
    expect(result.sources.length).toBe(1);
  });

  test("returns error message on non-OK response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Not Found", { status: 404, statusText: "Not Found" }))
    ) as typeof fetch;

    const result = await fetchLlmsTxtTool("cv");
    expect(result.content).toContain("Failed to fetch llms.txt");
    expect(result.content).toContain("404");
    expect(result.sources).toEqual([]);
  });

  test("returns error message on fetch failure", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Network timeout"))
    ) as typeof fetch;

    const result = await fetchLlmsTxtTool("insights");
    expect(result.content).toContain("Error fetching llms.txt");
    expect(result.content).toContain("Network timeout");
    expect(result.sources).toEqual([]);
  });

  test("limits content to 10000 characters", async () => {
    const longContent = "x".repeat(20000);
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(longContent, { status: 200 }))
    ) as typeof fetch;

    const result = await fetchLlmsTxtTool("blog");
    expect(result.content.length).toBe(10000);
  });
});

describe("getLlmsDomains", () => {
  test("returns all expected domain entries", () => {
    const domains = getLlmsDomains();
    expect(domains.length).toBe(7);

    const keys = domains.map((d) => d.key);
    expect(keys).toContain("home");
    expect(keys).toContain("blog");
    expect(keys).toContain("insights");
    expect(keys).toContain("llmTimeline");
    expect(keys).toContain("cv");
    expect(keys).toContain("photos");
    expect(keys).toContain("homelab");
  });

  test("returns correct URL for each domain", () => {
    const domains = getLlmsDomains();
    const byKey = Object.fromEntries(domains.map((d) => [d.key, d.url]));

    expect(byKey.home).toBe("https://duyet.net/llms.txt");
    expect(byKey.blog).toBe("https://blog.duyet.net/llms.txt");
    expect(byKey.cv).toBe("https://cv.duyet.net/llms.txt");
    expect(byKey.insights).toBe("https://insights.duyet.net/llms.txt");
    expect(byKey.llmTimeline).toBe("https://llm-timeline.duyet.net/llms.txt");
    expect(byKey.photos).toBe("https://photos.duyet.net/llms.txt");
    expect(byKey.homelab).toBe("https://homelab.duyet.net/llms.txt");
  });

  test("all URLs use https and end with /llms.txt", () => {
    for (const d of getLlmsDomains()) {
      expect(d.url).toMatch(/^https:\/\/.+\/llms\.txt$/);
    }
  });
});
