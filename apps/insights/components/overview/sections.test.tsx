/**
 * Component-level assertions for the overview sections.
 *
 * These are deliberately *not* render-equivalence tests — that is
 * `src/routes/index.render.test.tsx` against a golden file, and duplicating it
 * per component would just be a worse copy. What is worth asserting here is the
 * thing a golden cannot: that a section renders the value it was handed, and
 * that its emptiness guard fires.
 *
 * The tempting failure mode is a test that only asserts the component does not
 * throw. A section that silently renders `undefined` passes such a test. Every
 * case below reads a specific number or label back out of the markup.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OverviewHeader } from "./OverviewHeader";
import { KpiTiles } from "./KpiTiles";
import { CodingAndAiSplit } from "./CodingAndAiSplit";
import { TokenBurnRow } from "./TokenBurnRow";
import { CacheAndRhythm } from "./CacheAndRhythm";
import { HourlyRhythm } from "./HourlyRhythm";
import { TokenComposition } from "./TokenComposition";
import { TopPosts } from "./TopPosts";
import { RepoGrid } from "./RepoGrid";
import { ProjectLeaderboard } from "./ProjectLeaderboard";
import type { KpiTileData } from "./KpiTile";
import type { BurnMetrics, Share, TokenTotals } from "./derive";
import type { AiMetrics, PostHogPath } from "./types";

const html = (node: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(node);

const emptyAiMetrics: AiMetrics = {
  activeDays: 0,
  cacheTokens: 0,
  dailyAverage: 0,
  topModel: "",
  totalCost: 0,
  totalTokens: 0,
};

describe("OverviewHeader", () => {
  it("stamps the generated date when there is one", () => {
    expect(html(<OverviewHeader generatedAt="15 Aug 2026" />)).toContain(
      "Last updated 15 Aug 2026"
    );
  });

  it("falls back to the window label when there is no date", () => {
    const out = html(<OverviewHeader generatedAt={null} />);
    expect(out).toContain("Last 30 days");
    expect(out).not.toContain("Last updated");
  });
});

describe("KpiTiles", () => {
  const kpis: KpiTileData[] = [
    { k: "Coding hours", v: "40", unit: "h", sub: "1.3h avg", trend: "+2.0%", spark: [1, 2] },
    { k: "Page views", v: "92.3K", unit: "", sub: "Cloudflare", trend: "—", spark: [] },
  ];

  it("renders each tile's value and unit", () => {
    const out = html(<KpiTiles kpis={kpis} />);
    expect(out).toContain("Coding hours");
    expect(out).toContain("40");
    expect(out).toContain("92.3K");
  });

  it("renders one tile per entry, in order", () => {
    const out = html(<KpiTiles kpis={kpis} />);
    expect(out.indexOf("Coding hours")).toBeLessThan(out.indexOf("Page views"));
  });

  it("renders the grid for an empty list rather than nothing", () => {
    expect(html(<KpiTiles kpis={[]} />)).toContain("rd-g4");
  });
});

describe("CodingAndAiSplit", () => {
  it("renders the language and model shares with their anchors", () => {
    const out = html(
      <CodingAndAiSplit
        languageShare={[{ name: "TypeScript", pct: 62.5 }]}
        modelShare={[{ name: "opus 4 6", pct: 30 }]}
        totalTokens={11_164_457_176}
      />
    );
    expect(out).toContain('id="ins-coding"');
    expect(out).toContain('id="ins-models"');
    expect(out).toContain("TypeScript");
    expect(out).toContain("62.5%");
    expect(out).toContain("opus 4 6");
  });

  it("formats the model card's badge as a compact token count", () => {
    const out = html(
      <CodingAndAiSplit
        languageShare={[]}
        modelShare={[]}
        totalTokens={11_164_457_176}
      />
    );
    expect(out).toContain("11.2B");
  });

  it("keeps both card shells when both shares are empty", () => {
    const out = html(
      <CodingAndAiSplit languageShare={[]} modelShare={[]} totalTokens={0} />
    );
    expect(out).toContain('id="ins-coding"');
    expect(out).toContain('id="ins-models"');
  });
});

describe("TokenBurnRow", () => {
  const burn: BurnMetrics = {
    ioRatio: "46.5",
    avgTokensPerDay: "429.4M",
    cacheRate: "1%",
    projectCount: 8,
  };
  const tokenSums: TokenTotals = { input: 82_200_000, output: 1_800_000, cache: 0 };

  it("renders all four burn values", () => {
    const out = html(
      <TokenBurnRow burn={burn} tokenSums={tokenSums} aiMetrics={emptyAiMetrics} />
    );
    expect(out).toContain("46.5");
    expect(out).toContain("429.4M");
    expect(out).toContain("1%");
    expect(out).toContain("distinct project directories");
  });

  it("renders the token sums in the ratio sub-line", () => {
    const out = html(
      <TokenBurnRow burn={burn} tokenSums={tokenSums} aiMetrics={emptyAiMetrics} />
    );
    expect(out).toContain("82.2M in · 1.8M out");
  });

  it("stringifies the project count", () => {
    const out = html(
      <TokenBurnRow
        burn={{ ...burn, projectCount: 12 }}
        tokenSums={tokenSums}
        aiMetrics={emptyAiMetrics}
      />
    );
    expect(out).toContain(">12<");
  });
});

describe("CacheAndRhythm", () => {
  it("labels both charts", () => {
    const out = html(
      <CacheAndRhythm
        cacheRatio={[{ date: "5 Jan", pct: 40, tokens: 100 }]}
        weekday={[{ label: "Mon", Tokens: 10, key: 1 }]}
      />
    );
    expect(out).toContain("Daily cache hit ratio over the last 30 days");
    expect(out).toContain("Token volume by day of week");
  });

  it("keeps both card shells when the series are empty", () => {
    const out = html(<CacheAndRhythm cacheRatio={[]} weekday={[]} />);
    expect(out).toContain("Cache hit ratio");
    expect(out).toContain("Activity by weekday");
  });
});

describe("HourlyRhythm", () => {
  it("labels the hourly chart", () => {
    expect(
      html(<HourlyRhythm hourly={[{ label: "09:00", Tokens: 5, key: 9 }]} />)
    ).toContain("Token volume by hour of day");
  });
});

describe("TokenComposition", () => {
  const shares: Share[] = [
    { name: "Input", cost: 30, pct: 30 },
    { name: "Output", cost: 10, pct: 10 },
    { name: "Cache", cost: 60, pct: 60 },
  ];

  it("labels both donuts", () => {
    const out = html(
      <TokenComposition tokenTypeShares={shares} costTypeShares={shares} />
    );
    expect(out).toContain("Token type breakdown over the last 30 days");
    expect(out).toContain("Cost type breakdown over the last 30 days");
  });

  it("renders each share's percentage in the legend", () => {
    const out = html(
      <TokenComposition tokenTypeShares={shares} costTypeShares={[]} />
    );
    expect(out).toContain("Input · 30%");
    expect(out).toContain("Cache · 60%");
  });
});

describe("TopPosts", () => {
  const posts: PostHogPath[] = [
    { path: "/posts/a", views: 1000, visitors: 300 },
    { path: "/posts/b", views: 500, visitors: 150 },
  ];

  it("links each post at the blog URL", () => {
    const out = html(<TopPosts posts={posts} blogUrl="https://blog.example" />);
    expect(out).toContain('href="https://blog.example/posts/a"');
    expect(out).toContain('href="https://blog.example/posts/b"');
  });

  it("falls back to the canonical blog host when the URL is empty", () => {
    const out = html(<TopPosts posts={posts} blogUrl="" />);
    expect(out).toContain('href="https://blog.duyet.net/posts/a"');
  });

  it("scales the meter against the top post, not the total", () => {
    const out = html(<TopPosts posts={posts} blogUrl="https://blog.example" />);
    expect(out).toContain("width:100%");
    expect(out).toContain("width:50%");
  });

  it("renders the visitor count, not the view count", () => {
    const out = html(<TopPosts posts={posts} blogUrl="https://blog.example" />);
    expect(out).toContain(">300<");
    expect(out).toContain(">150<");
  });

  it("renders nothing at all when there are no posts", () => {
    // Not an empty card: the guard has to produce zero bytes, or the golden's
    // empty-window case would gain a shell.
    expect(html(<TopPosts posts={[]} blogUrl="https://blog.example" />)).toBe("");
  });
});

describe("RepoGrid", () => {
  const repos = [
    { name: "monorepo", stars: 41, language: "TypeScript", license: "MIT" },
    { name: "wasm-labs", stars: 12, language: null, license: null },
  ];

  it("links each repo at the GitHub owner", () => {
    const out = html(<RepoGrid repos={repos} totalStars={53} />);
    expect(out).toContain('href="https://github.com/duyet/monorepo"');
    expect(out).toContain('href="https://github.com/duyet/wasm-labs"');
  });

  it("counts the *visible* repos but sums *every* star", () => {
    // The link says "2 repos" from the six-card slice and "53 stars" from the
    // whole account, so the two numbers describe different sets on purpose.
    const out = html(<RepoGrid repos={repos} totalStars={53} />);
    expect(out).toContain("2 repos · 53 stars");
  });

  it("drops the language and license chips when they are absent", () => {
    const out = html(<RepoGrid repos={repos} totalStars={53} />);
    expect(out.match(/rd-chip/g)).toHaveLength(1);
    expect(out).toContain("MIT");
  });

  it("renders nothing at all when there are no repos", () => {
    expect(html(<RepoGrid repos={[]} totalStars={0} />)).toBe("");
  });
});

describe("ProjectLeaderboard", () => {
  const projects = [
    { name: "monorepo", pct: 40, tokens: 2_000_000, cost: 100 },
    { name: "insights", pct: 30, tokens: 1_000_000, cost: 50 },
  ];

  it("renders each project with a compact token count", () => {
    const out = html(<ProjectLeaderboard projects={projects} />);
    expect(out).toContain("monorepo");
    expect(out).toContain("insights");
    expect(out).toContain(">2M<");
    expect(out).toContain(">1M<");
  });

  it("is not a list of links", () => {
    expect(html(<ProjectLeaderboard projects={projects} />)).not.toContain("<a ");
  });

  it("renders nothing at all when the leaderboard is empty", () => {
    expect(html(<ProjectLeaderboard projects={[]} />)).toBe("");
  });
});
