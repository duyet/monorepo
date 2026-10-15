import { describe, expect, it } from "vitest";
import { hnItemId, parseHnThread } from "./hn-thread";

describe("parseHnThread", () => {
  it("keeps nesting and counts every live comment", () => {
    const thread = parseHnThread({
      id: 1,
      children: [
        {
          id: 2,
          author: "a",
          text: "<p>top</p>",
          created_at_i: 10,
          children: [
            { id: 3, author: "b", text: "reply", created_at_i: 11, children: [] },
          ],
        },
        { id: 4, author: "c", text: "second", created_at_i: 12, children: [] },
      ],
    });
    expect(thread.total).toBe(3);
    expect(thread.comments.map((c) => c.id)).toEqual([2, 4]);
    expect(thread.comments[0].children[0].author).toBe("b");
  });

  it("drops deleted comments but promotes their live replies", () => {
    const thread = parseHnThread({
      id: 1,
      children: [
        {
          id: 2,
          author: null,
          text: null,
          children: [
            { id: 3, author: "b", text: "survivor", created_at_i: 1, children: [] },
          ],
        },
      ],
    });
    expect(thread.comments.map((c) => c.id)).toEqual([3]);
    expect(thread.total).toBe(1);
  });
});

describe("hnItemId", () => {
  it("reads the id from an item link and rejects others", () => {
    expect(hnItemId("https://news.ycombinator.com/item?id=49869107")).toBe("49869107");
    expect(hnItemId("https://news.ycombinator.com/")).toBeNull();
  });
});
