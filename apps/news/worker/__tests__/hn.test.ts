import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hnAdapter } from "../sources/hn.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(
    path.join(dirname, "../sources/__fixtures__/hn-algolia.json"),
    "utf-8"
  )
);

describe("hnAdapter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () => new Response(JSON.stringify(fixture)))
    );
  });

  it("filters to AI-keyword titles and dedupes across the two searches", async () => {
    const items = await hnAdapter.fetchItems({}, 0);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(items.map((i) => i.url).sort()).toEqual(
      [
        "https://example.com/claude-model",
        "https://example.com/agent-framework",
      ].sort()
    );
  });

  it("excludes non-AI stories like the todo app", async () => {
    const items = await hnAdapter.fetchItems({}, 0);
    expect(items.some((i) => i.url === "https://example.com/todo-app")).toBe(
      false
    );
  });

  it("maps points/comments correctly", async () => {
    const items = await hnAdapter.fetchItems({}, 0);
    const claude = items.find((i) => i.externalId === "1001");
    expect(claude).toMatchObject({ points: 250, comments: 80 });
  });

  it("attaches a single 'discussion' source pointing at the HN thread", async () => {
    const items = await hnAdapter.fetchItems({}, 0);
    const claude = items.find((i) => i.externalId === "1001");
    expect(claude?.sources).toEqual([
      {
        kind: "discussion",
        author: "someuser",
        postedAt: 1780000000,
        url: "https://news.ycombinator.com/item?id=1001",
      },
    ]);
  });
});
