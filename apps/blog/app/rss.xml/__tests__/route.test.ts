/**
 * Tests for RSS feed generation
 * Tests the RSS generation logic used by scripts/generate-static-files.ts
 */

import { mock } from "bun:test";

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

import { describe, expect, test } from "bun:test";
import RSS from "rss";
import type { Post } from "@duyet/interfaces";
import { getAllPosts } from "@duyet/libs/getPost";

const SITE_URL = "https://blog.duyet.net";

function buildRssFeed() {
  const posts = getAllPosts(["slug", "title", "excerpt", "date"], 50);

  const feed = new RSS({
    title: "Tôi là Duyệt",
    description: "Sr. Data Engineer. Rustacean at night",
    feed_url: `${SITE_URL}/rss.xml`,
    site_url: SITE_URL,
  });

  for (const post of posts as Post[]) {
    feed.item({
      title: post.title || "",
      description: post.excerpt || "",
      url: `${SITE_URL}${post.slug}`,
      date: post.date,
    });
  }

  return feed.xml({ indent: true });
}

describe("RSS Feed Generation", () => {
  test("should return valid RSS XML", () => {
    const xml = buildRssFeed();

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<rss");
    expect(xml).toContain("</rss>");
  });

  test("should include blog metadata", () => {
    const xml = buildRssFeed();

    expect(xml).toContain("<![CDATA[Tôi là Duyệt]]>");
    expect(xml).toContain("<![CDATA[Sr. Data Engineer. Rustacean at night]]>");
    expect(xml).toContain("https://blog.duyet.net");
  });

  test("should include posts in RSS feed", () => {
    const xml = buildRssFeed();

    expect(xml).toContain("<![CDATA[Test Post]]>");
    expect(xml).toContain("<![CDATA[This is a test post]]>");
    expect(xml).toContain("https://blog.duyet.net/2024/01/test-post");

    expect(xml).toContain("<![CDATA[Another Post]]>");
    expect(xml).toContain("<![CDATA[Another test post]]>");
  });

  test("should format XML with indentation", () => {
    const xml = buildRssFeed();

    // Check that XML is indented (has newlines and spaces)
    expect(xml).toMatch(/\n\s+</);
  });
});
