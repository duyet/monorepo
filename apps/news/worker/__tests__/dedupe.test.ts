import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildMergePlan,
  type Cluster,
  clusterSimilar,
  type ExistingCandidate,
  type MergeCandidate,
  selectCanonical,
  unionSources,
} from "../dedupe.js";
import type { FetchedItemSource } from "../sources/types.js";
import type { Env } from "../types.js";

const env: Env = {
  DB: {} as D1Database,
  NEWS_INGEST: {} as Workflow,
  ANYROUTER_BASE_URL: "https://anyrouter.dev/api/v1",
  ANYROUTER_MODEL: "test-model",
  ANYROUTER_API_KEY: "test-key",
  NEWS_ADMIN_TOKEN: "test-token",
};

function chatResponse(content: string, totalTokens = 0): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { total_tokens: totalTokens },
    }),
    { status: 200 }
  );
}

describe("clusterSimilar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses a well-formed clusters response", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          chatResponse(
            JSON.stringify({ clusters: [{ new: [0, 2], existing: ["abc"] }] })
          )
        )
    );

    const clusters = await clusterSimilar(
      env,
      [
        { i: 0, title: "OpenAI ships GPT-6" },
        { i: 1, title: "Unrelated story" },
        { i: 2, title: "GPT-6 released by OpenAI" },
      ],
      [{ id: "abc", title: "OpenAI teases GPT-6" }]
    );

    expect(clusters).toEqual([{ new: [0, 2], existing: ["abc"] }]);
  });

  it("tolerates a fenced, prose-wrapped response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        chatResponse(
          `Here are the clusters:\n\`\`\`json\n${JSON.stringify({
            clusters: [{ new: [0, 1] }],
          })}\n\`\`\``
        )
      )
    );

    const clusters = await clusterSimilar(
      env,
      [
        { i: 0, title: "A" },
        { i: 1, title: "B" },
      ],
      []
    );
    expect(clusters).toEqual([{ new: [0, 1], existing: [] }]);
  });

  it("drops malformed cluster entries and single-member clusters, keeps the rest", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        chatResponse(
          JSON.stringify({
            clusters: [
              "not an object",
              { new: [0] }, // only 1 member total, not a real dup
              { new: [0, 1], existing: ["x", 5, null] }, // non-string existing entries dropped
            ],
          })
        )
      )
    );

    const clusters = await clusterSimilar(
      env,
      [
        { i: 0, title: "A" },
        { i: 1, title: "B" },
      ],
      []
    );
    expect(clusters).toEqual([{ new: [0, 1], existing: ["x"] }]);
  });

  it("returns [] and never throws on a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const clusters = await clusterSimilar(env, [{ i: 0, title: "A" }], []);
    expect(clusters).toEqual([]);
  });

  it("returns [] and never throws on unparseable content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(chatResponse("not json at all"))
    );
    const clusters = await clusterSimilar(env, [{ i: 0, title: "A" }], []);
    expect(clusters).toEqual([]);
  });

  it("returns [] immediately without calling fetch when there are no new items", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const clusters = await clusterSimilar(env, [], [{ id: "x", title: "X" }]);
    expect(clusters).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("selectCanonical", () => {
  it("prefers an existing item over any new items", () => {
    const cluster: Cluster = { new: [0, 1], existing: ["existing-id"] };
    const ranks = new Map([
      [0, 100],
      [1, 200],
    ]);
    expect(selectCanonical(cluster, ranks)).toEqual({
      type: "existing",
      id: "existing-id",
    });
  });

  it("picks the highest-rank new item when there's no existing item", () => {
    const cluster: Cluster = { new: [0, 1, 2], existing: [] };
    const ranks = new Map([
      [0, 1.5],
      [1, 9.9],
      [2, 3.2],
    ]);
    expect(selectCanonical(cluster, ranks)).toEqual({ type: "new", index: 1 });
  });

  it("returns null when no rank is known for any new member and there's no existing item", () => {
    const cluster: Cluster = { new: [0], existing: [] };
    expect(selectCanonical(cluster, new Map())).toBeNull();
  });
});

describe("unionSources", () => {
  it("dedupes by url, base wins on conflict", () => {
    const base: FetchedItemSource[] = [
      { kind: "source", url: "https://a", author: "@base" },
    ];
    const incoming: FetchedItemSource[] = [
      { kind: "support", url: "https://a", author: "@incoming" },
      { kind: "support", url: "https://b" },
    ];
    const result = unionSources(base, incoming, 8);
    expect(result).toEqual([
      { kind: "source", url: "https://a", author: "@base" },
      { kind: "support", url: "https://b" },
    ]);
  });

  it("caps the total at `cap`", () => {
    const base: FetchedItemSource[] = Array.from({ length: 5 }, (_, i) => ({
      kind: "support" as const,
      url: `https://base/${i}`,
    }));
    const incoming: FetchedItemSource[] = Array.from({ length: 5 }, (_, i) => ({
      kind: "support" as const,
      url: `https://incoming/${i}`,
    }));
    const result = unionSources(base, incoming, 8);
    expect(result).toHaveLength(8);
  });

  it("keeps urlless sources as-is, still counted toward the cap", () => {
    const base: FetchedItemSource[] = [{ kind: "discussion" }];
    const incoming: FetchedItemSource[] = [{ kind: "discussion" }];
    const result = unionSources(base, incoming, 8);
    expect(result).toHaveLength(2);
  });
});

describe("buildMergePlan", () => {
  const candidates: MergeCandidate[] = [
    {
      i: 0,
      id: "new-a",
      url: "https://example.com/a",
      sourceId: "hn",
      points: 100,
      comments: 20,
      rank: 5,
      sources: [{ kind: "discussion", url: "https://hn/a" }],
    },
    {
      i: 1,
      id: "new-b",
      url: "https://example.com/b",
      sourceId: "huggingnews",
      points: 50,
      comments: 5,
      rank: 8,
    },
    {
      i: 2,
      id: "new-c",
      url: "https://example.com/c",
      sourceId: "hn",
      points: 10,
      comments: 1,
      rank: 1,
    },
  ];

  it("existing canonical: merges new items into it, takes max points/comments, unions sources with a self-entry per merged item", () => {
    const clusters: Cluster[] = [{ new: [0, 2], existing: ["existing-1"] }];
    const existingById = new Map<string, ExistingCandidate>([
      ["existing-1", { points: 30, comments: 2 }],
    ]);

    const plan = buildMergePlan(clusters, candidates, existingById, 8);

    expect(plan.merged.get("new-a")).toEqual({ duplicateOf: "existing-1" });
    expect(plan.merged.get("new-c")).toEqual({ duplicateOf: "existing-1" });
    expect(plan.merged.has("new-b")).toBe(false);

    const update = plan.canonicalUpdates.get("existing-1");
    expect(update?.isExisting).toBe(true);
    // max(30 existing, 100 from new-a, 10 from new-c)
    expect(update?.maxPoints).toBe(100);
    expect(update?.maxComments).toBe(20);
    // new-a's own source + its self-entry, new-c's self-entry (no own sources)
    expect(update?.extraSources).toEqual([
      { kind: "discussion", url: "https://hn/a" },
      { kind: "source", url: "https://example.com/a", author: "hn" },
      { kind: "source", url: "https://example.com/c", author: "hn" },
    ]);
  });

  it("no existing item: canonical is the highest-rank new item, others merge into it", () => {
    const clusters: Cluster[] = [{ new: [0, 1, 2], existing: [] }];
    const plan = buildMergePlan(clusters, candidates, new Map(), 8);

    // new-b has the highest rank (8)
    expect(plan.merged.get("new-a")).toEqual({ duplicateOf: "new-b" });
    expect(plan.merged.get("new-c")).toEqual({ duplicateOf: "new-b" });
    expect(plan.merged.has("new-b")).toBe(false);

    const update = plan.canonicalUpdates.get("new-b");
    expect(update?.isExisting).toBe(false);
    expect(update?.maxPoints).toBe(100); // max(50 own, 100, 10)
    expect(update?.maxComments).toBe(20);
  });

  it("respects the source cap when unioning", () => {
    const manyCandidates: MergeCandidate[] = Array.from(
      { length: 10 },
      (_, i) => ({
        i,
        id: `new-${i}`,
        url: `https://example.com/${i}`,
        sourceId: "hn",
        points: i,
        comments: i,
        rank: 10 - i, // item 0 has the highest rank -> canonical
      })
    );
    const clusters: Cluster[] = [
      { new: manyCandidates.map((c) => c.i), existing: [] },
    ];

    const plan = buildMergePlan(clusters, manyCandidates, new Map(), 8);
    const update = plan.canonicalUpdates.get("new-0");
    expect(update?.extraSources.length).toBeLessThanOrEqual(8);
  });

  it("returns empty plan for no clusters", () => {
    const plan = buildMergePlan([], candidates, new Map(), 8);
    expect(plan.merged.size).toBe(0);
    expect(plan.canonicalUpdates.size).toBe(0);
  });
});
