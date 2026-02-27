import { describe, test, expect, mock, beforeEach } from "bun:test";
import {
  searchBlogTool,
  getBlogPostTool,
  getCVTool,
  getGitHubTool,
  getAnalyticsTool,
  getAboutTool,
} from "./index";

// Mock fetch globally
const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = originalFetch;
});

describe("searchBlogTool", () => {
  test("returns formatted results on success", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          [
            "# Blog",
            "## Apache Spark Tutorial",
            "URL: https://blog.duyet.net/spark-tutorial",
            "",
            "## ClickHouse Performance Guide",
            "URL: https://blog.duyet.net/clickhouse-perf",
          ].join("\n"),
          { status: 200 }
        )
      )
    ) as typeof fetch;

    const result = await searchBlogTool("Spark");
    expect(result.results).toContain("Apache Spark Tutorial");
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources[0].type).toBe("blog");
    expect(result.sources[0].url).toBe("https://blog.duyet.net/spark-tutorial");
  });

  test("returns fallback message when no matches found", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("# Empty blog\nNo posts here", { status: 200 }))
    ) as typeof fetch;

    const result = await searchBlogTool("nonexistent-topic-xyz");
    expect(result.results).toContain("Found 0 blog post(s)");
    expect(result.sources).toEqual([]);
  });

  test("returns fallback on fetch error", async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error("Network error"))) as typeof fetch;

    const result = await searchBlogTool("test");
    expect(result.results).toContain("couldn't find any blog posts");
    expect(result.sources).toEqual([]);
  });
});

describe("getBlogPostTool", () => {
  test("returns content for valid blog URL", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          "<html><title>My Post | Tôi là Duyệt</title><body>Content here</body></html>",
          { status: 200 }
        )
      )
    ) as typeof fetch;

    const result = await getBlogPostTool("https://blog.duyet.net/2024/my-post");
    expect(result.content).toContain("My Post");
    expect(result.sources.length).toBe(1);
    expect(result.sources[0].type).toBe("blog");
  });

  test("returns error for invalid URL", async () => {
    const result = await getBlogPostTool("https://evil.com/hack");
    expect(result.content).toContain("Invalid URL");
    expect(result.sources).toEqual([]);
  });

  test("returns error on fetch failure", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Not Found", { status: 404 }))
    ) as typeof fetch;

    const result = await getBlogPostTool("https://blog.duyet.net/missing");
    expect(result.content).toContain("Error");
    expect(result.sources).toEqual([]);
  });
});

describe("getCVTool", () => {
  test("returns summary by default", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("CV content here", { status: 200 }))
    ) as typeof fetch;

    const result = await getCVTool("summary");
    expect(result.content).toContain("Duyet Le");
    expect(result.content).toContain("Data Engineer");
    expect(result.sources[0].type).toBe("cv");
  });

  test("returns detailed format with full text", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Detailed CV content", { status: 200 }))
    ) as typeof fetch;

    const result = await getCVTool("detailed");
    expect(result.content).toContain("Detailed CV content");
    expect(result.content).toContain("cv.duyet.net");
  });

  test("handles fetch error gracefully", async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error("Timeout"))) as typeof fetch;

    const result = await getCVTool();
    expect(result.content).toContain("Error");
    expect(result.sources).toEqual([]);
  });
});

describe("getGitHubTool", () => {
  test("returns formatted activity", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            {
              type: "PushEvent",
              repo: { name: "duyet/monorepo" },
              created_at: "2024-01-15T10:00:00Z",
            },
            {
              type: "PullRequestEvent",
              repo: { name: "duyet/clickhouse-rs" },
              payload: { action: "opened" },
              created_at: "2024-01-14T09:00:00Z",
            },
          ]),
          { status: 200 }
        )
      )
    ) as typeof fetch;

    const result = await getGitHubTool(2);
    expect(result.activity).toContain("Pushed to duyet/monorepo");
    expect(result.activity).toContain("PR opened in duyet/clickhouse-rs");
    expect(result.sources[0].type).toBe("github");
  });

  test("handles GitHub API error", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Rate limited", { status: 403 }))
    ) as typeof fetch;

    const result = await getGitHubTool();
    expect(result.activity).toContain("Error");
    expect(result.sources).toEqual([]);
  });
});

describe("getAnalyticsTool", () => {
  test("returns analytics report", async () => {
    const result = await getAnalyticsTool("summary");
    expect(result.analytics).toContain("Analytics Report");
    expect(result.analytics).toContain("summary");
    expect(result.sources[0].url).toBe("https://insights.duyet.net");
  });

  test("supports different report types", async () => {
    const result = await getAnalyticsTool("daily_trends");
    expect(result.analytics).toContain("daily_trends");
  });
});

describe("getAboutTool", () => {
  test("returns about information", async () => {
    const result = await getAboutTool();
    expect(result.about).toContain("Duyet Le");
    expect(result.about).toContain("data engineer");
    expect(result.about).toContain("github.com/duyet");
  });
});
