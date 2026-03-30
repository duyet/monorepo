import { mock } from "bun:test";

// Mock getPost before importing route
mock.module("@duyet/libs/getPost", () => ({
  getAllPosts: () => [
    {
      slug: "/2024/01/test-post",
      title: "Test Post",
      excerpt: "A test post about data engineering",
      date: "2024-01-15",
      category: "Engineering",
      tags: ["spark", "data"],
    },
    {
      slug: "/2023/06/another-post",
      title: "Another Post",
      excerpt: "Another test post about kubernetes",
      date: "2023-06-10",
      category: "DevOps",
      tags: ["k8s", "docker"],
    },
  ],
}));

import { describe, expect, test } from "bun:test";
import { dynamic, GET } from "../route";

describe("LLMs.txt Route", () => {
  test("should return plain text content type", async () => {
    const response = await GET();
    const contentType = response.headers.get("Content-Type");

    expect(contentType).toBe("text/plain; charset=utf-8");
  });

  test("should return cache control headers", async () => {
    const response = await GET();
    const cacheControl = response.headers.get("Cache-Control");

    expect(cacheControl).toBe("public, max-age=3600, s-maxage=3600");
  });

  test("should be statically generated", () => {
    expect(dynamic).toBe("force-static");
  });

  test("should include blog header information", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("Duyet Le - Technical Blog");
    expect(text).toContain("me@duyet.net");
    expect(text).toContain("https://duyet.net");
  });

  test("should include recent posts", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("Test Post");
    expect(text).toContain("Another Post");
    expect(text).toContain("https://blog.duyet.net/2024/01/test-post");
  });

  test("should include post metadata", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("Engineering");
    expect(text).toContain("DevOps");
    expect(text).toContain("spark, data");
    expect(text).toContain("A test post about data engineering");
  });

  test("should include blog statistics", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("Total Posts: 2");
    expect(text).toContain("Categories:");
    expect(text).toContain("Tags:");
  });

  test("should include popular topics section", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("Popular Topics");
    expect(text).toContain("Data Engineering");
    expect(text).toContain("Cloud & DevOps");
  });

  test("should group posts by year", async () => {
    const response = await GET();
    const text = await response.text();

    expect(text).toContain("2024");
    expect(text).toContain("2023");
  });
});
