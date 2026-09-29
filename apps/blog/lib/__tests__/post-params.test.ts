import { describe, expect, test } from "vitest";
import { childParams, postParams } from "../post-params";
import { buildTree } from "../post-tree";
import type { Post } from "@duyet/interfaces";

/** Only the fields buildTree / the param helpers read. */
function post(slug: string, date = "2026-01-01"): Post {
  return { slug, date: new Date(date) } as Post;
}

describe("postParams", () => {
  test("splits a top-level post slug into route params", () => {
    expect(postParams(post("/2026/09/grok-bot"))).toEqual({
      year: "2026",
      month: "09",
      slug: "grok-bot",
    });
  });

  test("a slug without a leading slash is read positionally, leading segment dropped", () => {
    // `postParams` skips segment 0, so it assumes the absolute `/yyyy/mm/slug`
    // form that `getPostByPath` validates. Recorded here so the assumption is
    // visible: a relative slug silently shifts by one segment.
    expect(postParams(post("2026/09/grok-bot"))).toEqual({
      year: "09",
      month: "grok-bot",
      slug: undefined,
    });
  });
});

describe("childParams", () => {
  test("splits a chapter slug into route params", () => {
    expect(childParams(post("/2026/01/coding-agent/opencode"))).toEqual({
      year: "2026",
      month: "01",
      slug: "coding-agent",
      child: "opencode",
    });
  });
});

describe("buildTree", () => {
  test("nests four-segment slugs under their parent", () => {
    const tree = buildTree([
      post("/2026/01/coding-agent"),
      post("/2026/01/coding-agent/opencode"),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.post.slug).toBe("/2026/01/coding-agent");
    expect(tree[0]?.children.map((c) => c.slug)).toEqual([
      "/2026/01/coding-agent/opencode",
    ]);
  });

  test("leaves three-segment slugs at the top level", () => {
    const tree = buildTree([post("/2026/01/grok-bot")]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toEqual([]);
  });

  test("orders top-level posts oldest first", () => {
    const tree = buildTree([
      post("/2026/03/newer", "2026-03-01"),
      post("/2024/01/older", "2024-01-01"),
    ]);
    expect(tree.map((n) => n.post.slug)).toEqual([
      "/2024/01/older",
      "/2026/03/newer",
    ]);
  });

  test("an orphan child (no parent in the list) is dropped, not top-level", () => {
    const tree = buildTree([post("/2026/01/coding-agent/opencode")]);
    expect(tree).toEqual([]);
  });

  test("several chapters keep input order within a parent", () => {
    const tree = buildTree([
      post("/2026/01/parent"),
      post("/2026/01/parent/b"),
      post("/2026/01/parent/a"),
    ]);
    expect(tree[0]?.children.map((c) => c.slug)).toEqual([
      "/2026/01/parent/b",
      "/2026/01/parent/a",
    ]);
  });

  test("an empty list yields an empty tree", () => {
    expect(buildTree([])).toEqual([]);
  });
});
