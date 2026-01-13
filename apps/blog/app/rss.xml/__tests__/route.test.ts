/**
 * Tests for RSS feed generation
 */

// Set up mocks before importing
import { mock } from "bun:test";

// Mock the module - the second parameter must be a function that returns the module
mock.module("@duyet/libs/getPost", () => ({
  getAllPosts: () => [
    {
      slug: "/2024/01/test-post",
      title: "Test Post",
      excerpt: "This is a test post",
      date: "2024-01-01",
    },
    {
      slug: "/2024/01/another-post",
      title: "Another Post",
      excerpt: "Another test post",
      date: "2024-01-02",
    },
  ],
}));

import { describe, test, expect } from "bun:test";
import { GET, dynamic } from "../route";

describe("RSS Feed Route", () => {
  test("should return valid RSS XML", async () => {
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<rss");
    expect(xml).toContain("</rss>");
    expect(response.status).toBe(200);
  });

  test("should include blog metadata", async () => {
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<![CDATA[Tôi là Duyệt]]>");
    expect(xml).toContain("<![CDATA[Sr. Data Engineer. Rustacean at night]]>");
    expect(xml).toContain("https://blog.duyet.net");
  });

  test("should include posts in RSS feed", async () => {
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<![CDATA[Test Post]]>");
    expect(xml).toContain("<![CDATA[This is a test post]]>");
    expect(xml).toContain("https://blog.duyet.net//2024/01/test-post");

    expect(xml).toContain("<![CDATA[Another Post]]>");
    expect(xml).toContain("<![CDATA[Another test post]]>");
  });

  test("should have correct content type", async () => {
    const response = await GET();
    const contentType = response.headers.get("Content-Type");

    expect(contentType).toBe("text/xml");
  });

  test("should be statically generated", () => {
    expect(dynamic).toBe("force-static");
  });

  test("should format XML with indentation", async () => {
    const response = await GET();
    const xml = await response.text();

    // Check that XML is indented (has newlines and spaces)
    expect(xml).toMatch(/\n\s+</);
  });
});
