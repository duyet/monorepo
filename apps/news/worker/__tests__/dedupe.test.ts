import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildMergePlan,
  type Cluster,
  clusterByTitleSimilarity,
  clusterSimilar,
  type ExistingCandidate,
  isTitleNearDuplicate,
  type MergeCandidate,
  mergeClusters,
  normalizeTitleForDedupe,
  selectCanonical,
  titleSimilarity,
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

  it("sends only the first id when ANYROUTER_MODEL is a fallback chain", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(chatResponse(JSON.stringify({ clusters: [] })));
    vi.stubGlobal("fetch", fetchMock);
    await clusterSimilar(
      { ...env, ANYROUTER_MODEL: "anyrouter/auto,google/gemma-4-26b-a4b-it" },
      [{ i: 0, title: "A" }],
      []
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
      model: string;
    };
    expect(body.model).toBe("anyrouter/auto");
  });
});

describe("title similarity dedupe", () => {
  it("treats $7B / $8B Stripe OpenRouter rewrites as the same story", () => {
    expect(
      isTitleNearDuplicate(
        "Stripe Buys OpenRouter for $8B, More Than 5x Its May Valuation",
        "Stripe Buys OpenRouter for Over $7 Billion, Five Times its May Valuation"
      )
    ).toBe(true);
    expect(
      isTitleNearDuplicate(
        "Stripe Buys OpenRouter for Over $7 Billion, 5 Times May Valuation",
        "Stripe Buys OpenRouter for Over $7 Billion in 5.4x Valuation Leap Since May"
      )
    ).toBe(true);
    expect(
      isTitleNearDuplicate(
        "Stripe Buys OpenRouter for $8B, More Than 5x Its May Valuation",
        "Stripe Buys OpenRouter for Over $8 Billion to Flip Its AI Business Model"
      )
    ).toBe(true);
  });

  it("does not merge unrelated OpenRouter headlines", () => {
    expect(
      isTitleNearDuplicate(
        "Stripe Buys OpenRouter for $8B, More Than 5x Its May Valuation",
        "Launch HN: Speko (YC S26) – OpenRouter for Voice AI"
      )
    ).toBe(false);
    expect(
      isTitleNearDuplicate(
        "Stripe Buys OpenRouter for $8B, More Than 5x Its May Valuation",
        "Sakana AI Debuts Namazu on OpenRouter Using Kimi K2.6 for Japanese Business Context"
      )
    ).toBe(false);
  });

  it("matches an exact title that only differs by punctuation", () => {
    expect(
      isTitleNearDuplicate(
        `AI-Generated GitHub Copilot "Autofix" Allowed Compromise of Snowflake's Jira`,
        "AI-Generated GitHub Copilot “Autofix” Allowed Compromise of Snowflake's Jira"
      )
    ).toBe(true);
    expect(
      titleSimilarity(
        `AI-Generated GitHub Copilot "Autofix" Allowed Compromise of Snowflake's Jira`,
        "AI-Generated GitHub Copilot “Autofix” Allowed Compromise of Snowflake's Jira"
      )
    ).toBe(1);
  });

  it("strips UPDATE: and folds billion/x units", () => {
    expect(normalizeTitleForDedupe("UPDATE: Foo raises $5 billion, 2x")).toBe(
      "foo raises 5b 2"
    );
  });

  it("clusters new items with each other and with an existing title", () => {
    const clusters = clusterByTitleSimilarity(
      [
        {
          i: 0,
          title:
            "Stripe Buys OpenRouter for $8B, More Than 5x Its May Valuation",
        },
        { i: 1, title: "Unrelated story about a new GPU" },
        {
          i: 2,
          title:
            "Stripe Buys OpenRouter for Over $7 Billion, Five Times its May Valuation",
        },
      ],
      [
        {
          id: "existing-1",
          title:
            "Stripe Buys OpenRouter for Over $8 Billion to Flip Its AI Business Model",
        },
      ]
    );
    const stripe = clusters.find((c) => c.new.includes(0) || c.new.includes(2));
    expect(stripe).toBeTruthy();
    expect(stripe?.new.sort()).toEqual([0, 2]);
    expect(stripe?.existing).toContain("existing-1");
    expect(clusters.every((c) => !c.new.includes(1) || c.new.length > 1)).toBe(
      true
    );
    expect(clusters.some((c) => c.new.length === 1 && c.new[0] === 1)).toBe(
      false
    );
  });

  it("merges LLM clusters with title clusters via union-find", () => {
    const merged = mergeClusters([
      [{ new: [0, 1], existing: [] }],
      [{ new: [1, 2], existing: ["old"] }],
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].new.sort()).toEqual([0, 1, 2]);
    expect(merged[0].existing).toEqual(["old"]);
  });

  it("returns no clusters when nothing overlaps", () => {
    expect(
      clusterByTitleSimilarity(
        [{ i: 0, title: "OpenAI ships GPT-6" }],
        [{ id: "x", title: "A totally different story" }]
      )
    ).toEqual([]);
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
      topics: ["anthropic", "claude"],
    },
    {
      i: 1,
      id: "new-b",
      url: "https://example.com/b",
      sourceId: "huggingnews",
      points: 50,
      comments: 5,
      rank: 8,
      topics: ["anthropic", "multi-agent"],
    },
    {
      i: 2,
      id: "new-c",
      url: "https://example.com/c",
      sourceId: "hn",
      points: 10,
      comments: 1,
      rank: 1,
      topics: ["open-source"],
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
    // topics from both merged items (new-b, kept independent, is excluded)
    expect(update?.extraTopics).toEqual(["anthropic", "claude", "open-source"]);
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
    // canonical's own topics (new-b) are unioned with the merged items'
    // too, in cluster iteration order (new-a, then new-b's own, then new-c)
    expect(update?.extraTopics).toEqual([
      "anthropic",
      "claude",
      "multi-agent",
      "open-source",
    ]);
  });

  it("respects a custom topic cap when unioning topics across a merge", () => {
    const clusters: Cluster[] = [{ new: [0, 1, 2], existing: [] }];
    const plan = buildMergePlan(clusters, candidates, new Map(), 8, 3);
    const update = plan.canonicalUpdates.get("new-b");
    expect(update?.extraTopics.length).toBeLessThanOrEqual(3);
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
