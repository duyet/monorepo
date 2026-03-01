import { describe, test, expect, mock, beforeEach } from "bun:test";
import {
  searchBlog,
  getAbout,
  getAnalytics,
  getCVData,
  getBlogPostContent,
  getGitHubActivity,
} from "./mcp-client";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = originalFetch;
});

describe("searchBlog", () => {
  test("returns matching posts from llms.txt", async () => {
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

    const result = await searchBlog("Spark");
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.length).toBeGreaterThan(0);
    expect(result.data![0].title).toBe("Apache Spark Tutorial");
    expect(result.data![0].url).toBe("https://blog.duyet.net/spark-tutorial");
  });

  test("returns empty array when no matches found", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response("# Blog\nNo posts here", { status: 200 })
      )
    ) as typeof fetch;

    const result = await searchBlog("nonexistent-xyz-topic");
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  test("respects limit parameter", async () => {
    const lines = Array.from({ length: 10 }, (_, i) =>
      [`## Post ${i + 1} about Rust`, `URL: https://blog.duyet.net/rust-${i + 1}`, ""].join("\n")
    ).join("\n");

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(`# Blog\n${lines}`, { status: 200 }))
    ) as typeof fetch;

    const result = await searchBlog("Rust", 3);
    expect(result.success).toBe(true);
    expect(result.data!.length).toBeLessThanOrEqual(3);
  });

  test("returns error on fetch failure", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Network error"))
    ) as typeof fetch;

    const result = await searchBlog("test");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Network error");
  });

  test("returns error on non-OK HTTP response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Server Error", { status: 500 }))
    ) as typeof fetch;

    const result = await searchBlog("test");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("getAbout", () => {
  test("returns about information with expected fields", async () => {
    const result = await getAbout();
    expect(result.success).toBe(true);
    expect(result.data).toContain("Duyet Le");
    expect(result.data).toContain("data engineer");
    expect(result.data).toContain("github.com/duyet");
    expect(result.data).toContain("blog.duyet.net");
  });

  test("does not require fetch (pure function)", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Should not be called"))
    ) as typeof fetch;

    const result = await getAbout();
    expect(result.success).toBe(true);
  });
});

describe("getAnalytics", () => {
  test("returns analytics report for default summary type", async () => {
    const result = await getAnalytics();
    expect(result.success).toBe(true);
    expect(result.data).toContain("Analytics Report");
    expect(result.data).toContain("summary");
    expect(result.data).toContain("insights.duyet.net");
  });

  test("includes requested report_type in response", async () => {
    const result = await getAnalytics({ report_type: "daily_trends" });
    expect(result.success).toBe(true);
    expect(result.data).toContain("daily_trends");
  });

  test("handles all supported report types", async () => {
    const types = [
      "summary",
      "purpose_breakdown",
      "daily_trends",
      "recent_activity",
      "custom_period",
    ] as const;

    for (const type of types) {
      const result = await getAnalytics({ report_type: type });
      expect(result.success).toBe(true);
      expect(result.data).toContain(type);
    }
  });
});

describe("getCVData", () => {
  test("returns summary format with key info", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("CV page content", { status: 200 }))
    ) as typeof fetch;

    const result = await getCVData("summary");
    expect(result.success).toBe(true);
    expect(result.data).toContain("Duyet Le");
    expect(result.data).toContain("Data Engineer");
    expect(result.data).toContain("github.com/duyet");
  });

  test("returns detailed format including fetched text", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response("Detailed resume content from cv.duyet.net", { status: 200 })
      )
    ) as typeof fetch;

    const result = await getCVData("detailed");
    expect(result.success).toBe(true);
    expect(result.data).toContain("Detailed resume content");
    expect(result.data).toContain("cv.duyet.net");
  });

  test("returns JSON format without fetching page content", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("{}", { status: 200 }))
    ) as typeof fetch;

    const result = await getCVData("json");
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.data as string);
    expect(parsed.name).toBe("Duyet Le");
    expect(Array.isArray(parsed.skills)).toBe(true);
    expect(parsed.github).toContain("github.com/duyet");
  });

  test("uses summary format by default", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("page content", { status: 200 }))
    ) as typeof fetch;

    const result = await getCVData();
    expect(result.success).toBe(true);
    expect(result.data).toContain("Duyet Le");
  });

  test("returns error on fetch failure", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Connection refused"))
    ) as typeof fetch;

    const result = await getCVData("summary");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Connection refused");
  });

  test("returns error on non-OK HTTP response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Not Found", { status: 404 }))
    ) as typeof fetch;

    const result = await getCVData("summary");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("getBlogPostContent", () => {
  test("returns parsed content for valid blog.duyet.net URL", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          "<html><title>My Spark Post | Tôi là Duyệt</title><body><p>Post content here</p></body></html>",
          { status: 200 }
        )
      )
    ) as typeof fetch;

    const result = await getBlogPostContent({ url: "https://blog.duyet.net/2024/spark" });
    expect(result.success).toBe(true);
    expect(result.data!.title).toBe("My Spark Post");
    expect(result.data!.content).toContain("Post content here");
    expect(result.data!.url).toBe("https://blog.duyet.net/2024/spark");
  });

  test("returns parsed content for duyet.net URL", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          "<html><title>About | Tôi là Duyệt</title><body>About page</body></html>",
          { status: 200 }
        )
      )
    ) as typeof fetch;

    const result = await getBlogPostContent({ url: "https://duyet.net/about" });
    expect(result.success).toBe(true);
    expect(result.data!.title).toBe("About");
  });

  test("returns error for invalid external URL", async () => {
    const result = await getBlogPostContent({ url: "https://evil.com/hack" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid URL");
  });

  test("returns error on non-OK HTTP response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Gone", { status: 410 }))
    ) as typeof fetch;

    const result = await getBlogPostContent({ url: "https://blog.duyet.net/old-post" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns error on fetch failure", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("DNS resolution failed"))
    ) as typeof fetch;

    const result = await getBlogPostContent({ url: "https://blog.duyet.net/test" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("DNS resolution failed");
  });

  test("strips HTML tags from content", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          "<html><title>Test | Tôi là Duyệt</title><body><h1>Heading</h1><script>alert(1)</script><p>Clean text</p></body></html>",
          { status: 200 }
        )
      )
    ) as typeof fetch;

    const result = await getBlogPostContent({ url: "https://blog.duyet.net/test" });
    expect(result.success).toBe(true);
    expect(result.data!.content).not.toContain("<h1>");
    expect(result.data!.content).not.toContain("<script>");
    expect(result.data!.content).toContain("Clean text");
  });
});

describe("getGitHubActivity", () => {
  test("returns formatted activity on success", async () => {
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

    const result = await getGitHubActivity({ limit: 5 });
    expect(result.success).toBe(true);
    expect(result.data).toContain("Pushed to duyet/monorepo");
    expect(result.data).toContain("PR opened in duyet/clickhouse-rs");
    expect(result.data).toContain("github.com/duyet");
  });

  test("respects limit parameter", async () => {
    const events = Array.from({ length: 10 }, (_, i) => ({
      type: "PushEvent",
      repo: { name: `duyet/repo-${i}` },
      created_at: new Date().toISOString(),
    }));

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(events), { status: 200 }))
    ) as typeof fetch;

    const result = await getGitHubActivity({ limit: 2 });
    expect(result.success).toBe(true);
    const lines = (result.data as string).split("\n").filter((l) => l.startsWith("- "));
    expect(lines.length).toBe(2);
  });

  test("defaults to limit 5 when not specified", async () => {
    const events = Array.from({ length: 10 }, (_, i) => ({
      type: "PushEvent",
      repo: { name: `duyet/repo-${i}` },
      created_at: new Date().toISOString(),
    }));

    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(events), { status: 200 }))
    ) as typeof fetch;

    const result = await getGitHubActivity();
    expect(result.success).toBe(true);
    const lines = (result.data as string).split("\n").filter((l) => l.startsWith("- "));
    expect(lines.length).toBe(5);
  });

  test("returns error on non-OK GitHub API response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Rate limited", { status: 403 }))
    ) as typeof fetch;

    const result = await getGitHubActivity();
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns error on fetch failure", async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error("Network unreachable"))
    ) as typeof fetch;

    const result = await getGitHubActivity();
    expect(result.success).toBe(false);
    expect(result.error).toContain("Network unreachable");
  });

  test("handles unknown event types gracefully", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify([
            {
              type: "SomeUnknownEvent",
              repo: { name: "duyet/test" },
              created_at: "2024-01-15T10:00:00Z",
            },
          ]),
          { status: 200 }
        )
      )
    ) as typeof fetch;

    const result = await getGitHubActivity({ limit: 1 });
    expect(result.success).toBe(true);
    expect(result.data).toContain("SomeUnknownEvent in duyet/test");
  });
});
