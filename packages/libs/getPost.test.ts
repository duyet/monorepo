import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getPostByPath } from "./getPost";

// Create a temp directory for test markdown files
const TEST_DIR = join(tmpdir(), `getPost-test-${Date.now()}`);

const VALID_SLUG = "/2024/01/test-post";

function writeTempPost(filename: string, frontmatter: string, body = "Post body text"): string {
  const fullPath = join(TEST_DIR, filename);
  writeFileSync(fullPath, `---\n${frontmatter}\n---\n\n${body}`);
  return fullPath;
}

beforeAll(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
  try {
    const { readdirSync } = require("node:fs");
    const files = readdirSync(TEST_DIR);
    for (const f of files) {
      unlinkSync(join(TEST_DIR, f));
    }
    require("node:fs").rmdirSync(TEST_DIR);
  } catch {
    // best-effort cleanup
  }
});

describe("getPostByPath – thumbnail field", () => {
  test("sets thumbnail when data.thumbnail is a URL string", () => {
    const path = writeTempPost("thumb-url.md", [
      `slug: ${VALID_SLUG}`,
      "title: Test Post",
      "date: 2024-01-15",
      "thumbnail: /media/2024/01/cover.jpg",
    ].join("\n"));

    const post = getPostByPath(path, ["slug", "thumbnail"]);
    expect(post.thumbnail).toBe("/media/2024/01/cover.jpg");
  });

  test("sets thumbnail to undefined when data.thumbnail is absent", () => {
    const path = writeTempPost("thumb-absent.md", [
      `slug: ${VALID_SLUG}`,
      "title: Test Post",
      "date: 2024-01-15",
    ].join("\n"));

    const post = getPostByPath(path, ["slug", "thumbnail"]);
    expect(post.thumbnail).toBeUndefined();
  });

  test("sets thumbnail to undefined when data.thumbnail is empty string", () => {
    const path = writeTempPost("thumb-empty.md", [
      `slug: ${VALID_SLUG}`,
      "title: Test Post",
      "date: 2024-01-15",
      "thumbnail: ''",
    ].join("\n"));

    const post = getPostByPath(path, ["slug", "thumbnail"]);
    expect(post.thumbnail).toBeUndefined();
  });

  test("does not set thumbnail when 'thumbnail' is not in fields list", () => {
    const path = writeTempPost("thumb-nofield.md", [
      `slug: ${VALID_SLUG}`,
      "title: Test Post",
      "date: 2024-01-15",
      "thumbnail: /media/cover.jpg",
    ].join("\n"));

    const post = getPostByPath(path, ["slug", "title"]);
    // thumbnail should remain the default (undefined) since it wasn't requested
    expect(post.thumbnail).toBeUndefined();
  });

  test("returns full thumbnail URL when data.thumbnail is an absolute URL", () => {
    const url = "https://example.com/images/cover.png";
    const path = writeTempPost("thumb-abs.md", [
      `slug: ${VALID_SLUG}`,
      "title: Test Post",
      "date: 2024-01-15",
      `thumbnail: ${url}`,
    ].join("\n"));

    const post = getPostByPath(path, ["slug", "thumbnail"]);
    expect(post.thumbnail).toBe(url);
  });

  test("thumbnail coexists correctly with other fields", () => {
    const path = writeTempPost("thumb-multi.md", [
      `slug: ${VALID_SLUG}`,
      "title: Multi Field Post",
      "date: 2024-03-20",
      "thumbnail: /media/multi-cover.svg",
    ].join("\n"), "Some content here for reading time.");

    const post = getPostByPath(path, ["slug", "title", "thumbnail", "date"]);
    expect(post.title).toBe("Multi Field Post");
    expect(post.thumbnail).toBe("/media/multi-cover.svg");
    expect(post.date).toBeInstanceOf(Date);
  });
});
