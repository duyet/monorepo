import { describe, expect, it } from "vitest";
import {
  buildGraphData,
  type Article,
  type InboxNote,
  type KbContent,
  type MemoryNote,
  renderArticleMarkdown,
  renderInboxMarkdown,
  renderLlmsFull,
  renderLlmsTxt,
  renderMemoryMarkdown,
  renderRobots,
  renderSitemap,
  SITE_URL,
} from "./static-sections";

// These emitters were eight sequential top-level blocks inside
// `generate-static-files.ts`. They are pure functions of their input now, so the
// shape of every committed `public/` file is asserted here from fixture content.

const article = (over: Partial<Article> = {}): Article => ({
  slug: "alpha",
  title: "Alpha",
  category: "guides",
  tags: ["ts"],
  links: ["beta"],
  summary: "First note.",
  updated: "2026-05-26",
  raw: "Alpha body.",
  ...over,
});

const memory = (over: Partial<MemoryNote> = {}): MemoryNote => ({
  slug: "user-duyet",
  name: "user-duyet",
  title: "Duyet",
  description: "Who the user is.",
  memoryType: "user",
  category: "general",
  tags: ["identity"],
  related: ["alpha"],
  sources: ["https://example.com"],
  aliases: ["duyet"],
  created: "2026-01-01",
  updated: "2026-02-02",
  timestamp: "2026-02-02T00:00:00Z",
  raw: "Memory body.",
  ...over,
});

const inbox = (over: Partial<InboxNote> = {}): InboxNote => ({
  slug: "2026-08-10",
  date: "2026-08-10",
  title: "A Monday",
  links: ["alpha"],
  raw: "Inbox body.",
  ...over,
});

const content = (over: Partial<KbContent> = {}): KbContent => ({
  articles: [article()],
  categories: ["guides", "workflows"],
  memory: [memory()],
  inbox: [inbox()],
  ...over,
});

describe("renderRobots", () => {
  const txt = renderRobots();

  it("allows every crawler and names the sitemap", () => {
    expect(txt).toContain("User-agent: *\nAllow: /\n");
    expect(txt).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it("advertises both llms.txt endpoints", () => {
    expect(txt).toContain(`# llms.txt: ${SITE_URL}/llms.txt`);
    expect(txt).toContain(`# llms-full.txt: ${SITE_URL}/llms-full.txt`);
  });

  it("takes the site URL as an argument rather than hardcoding it", () => {
    expect(renderRobots("https://example.test")).toContain(
      "Sitemap: https://example.test/sitemap.xml"
    );
  });
});

describe("renderSitemap", () => {
  const xml = renderSitemap(content());
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it("is a well-formed urlset envelope", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xml.trimEnd().endsWith("</urlset>")).toBe(true);
  });

  it("emits the two top-level pages first, then categories in sorted order", () => {
    expect(locs.slice(0, 4)).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/search`,
      `${SITE_URL}/c/guides`,
      `${SITE_URL}/c/workflows`,
    ]);
  });

  it("emits one URL per article, memory note, and daily note", () => {
    expect(locs).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/search`,
      `${SITE_URL}/c/guides`,
      `${SITE_URL}/c/workflows`,
      `${SITE_URL}/k/alpha`,
      `${SITE_URL}/m`,
      `${SITE_URL}/m/user-duyet`,
      `${SITE_URL}/d`,
      `${SITE_URL}/d/2026-08-10`,
    ]);
  });

  it("emits <lastmod> when a note carries an updated date", () => {
    expect(xml).toContain(
      `<loc>${SITE_URL}/k/alpha</loc>\n    <lastmod>2026-05-26</lastmod>`
    );
    expect(xml).toContain(
      `<loc>${SITE_URL}/m/user-duyet</loc>\n    <lastmod>2026-02-02</lastmod>`
    );
  });

  it("omits <lastmod> for an undated article", () => {
    const undated = renderSitemap(content({ articles: [article({ updated: "" })] }));
    expect(undated).toContain(
      `  <url>\n    <loc>${SITE_URL}/k/alpha</loc>\n  </url>`
    );
    expect(undated).not.toContain("<lastmod>2026-05-26</lastmod>");
  });

  it("always emits <lastmod> for a daily note, since its slug is the date", () => {
    expect(xml).toContain(
      `<loc>${SITE_URL}/d/2026-08-10</loc>\n    <lastmod>2026-08-10</lastmod>`
    );
  });

  it("percent-encodes a slug containing a space or slash", () => {
    const weird = renderSitemap(
      content({ articles: [article({ slug: "a b/c" })] })
    );
    expect(weird).toContain(`<loc>${SITE_URL}/k/a%20b%2Fc</loc>`);
  });

  it("emits every category even when no article carries it", () => {
    // A category can outlive its last article; the sitemap is built from the
    // distinct set the walk collected, not from the article list.
    const c = content({ articles: [], categories: ["orphan"] });
    const locs2 = [...renderSitemap(c).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1]
    );
    expect(locs2).toContain(`${SITE_URL}/c/orphan`);
  });
});

describe("renderLlmsTxt", () => {
  const txt = renderLlmsTxt(content());

  it("leads with the header, the URL, and the sitemap pointer", () => {
    expect(txt.split("\n").slice(0, 6)).toEqual([
      "# duyet.net Knowledge Base",
      "",
      `URL: ${SITE_URL}`,
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      `Raw Markdown: ${SITE_URL}/k/<slug>.md`,
      "",
    ]);
  });

  it("states the content counts", () => {
    expect(txt).toContain(
      "1 articles across 2 categories, 1 memory notes, 1 inbox notes."
    );
  });

  it("gives every article a URL, a raw-markdown URL, and its category", () => {
    expect(txt).toContain(
      [
        "### Alpha",
        `URL: ${SITE_URL}/k/alpha`,
        `Markdown: ${SITE_URL}/k/alpha.md`,
        "Category: guides",
        "Updated: 2026-05-26",
        "Summary: First note.",
      ].join("\n")
    );
  });

  it("labels a memory note with its raw type and re-encodes related as wikilinks", () => {
    expect(txt).toContain(
      [
        "### Duyet",
        `URL: ${SITE_URL}/m/user-duyet`,
        `Markdown: ${SITE_URL}/m/user-duyet.md`,
        "Type: user",
        "Updated: 2026-02-02",
        "Description: Who the user is.",
      ].join("\n")
    );
  });

  it("gives every daily note a Date line", () => {
    expect(txt).toContain(
      [
        "### A Monday",
        `URL: ${SITE_URL}/d/2026-08-10`,
        `Markdown: ${SITE_URL}/d/2026-08-10.md`,
        "Date: 2026-08-10",
      ].join("\n")
    );
  });

  it("omits Updated, Summary, and Description when the fields are empty", () => {
    const bare = renderLlmsTxt(
      content({
        articles: [article({ updated: "", summary: "" })],
        memory: [memory({ updated: "", description: "" })],
      })
    );
    expect(bare).not.toContain("Updated:");
    expect(bare).not.toContain("Summary:");
    expect(bare).not.toContain("Description:");
  });

  it("has the three content sections in articles, memory, inbox order", () => {
    expect(txt.indexOf("## Articles")).toBeLessThan(txt.indexOf("## Memory"));
    expect(txt.indexOf("## Memory")).toBeLessThan(txt.indexOf("## Inbox"));
  });
});

describe("renderLlmsFull", () => {
  const txt = renderLlmsFull(content());

  it("opens with the full-content header and a rule", () => {
    expect(txt.split("\n").slice(0, 6)).toEqual([
      "# duyet.net Knowledge Base — Full Content",
      "",
      `URL: ${SITE_URL}`,
      "",
      "---",
      "",
    ]);
  });

  it("includes every note body", () => {
    expect(txt).toContain("Alpha body.");
    expect(txt).toContain("Memory body.");
    expect(txt).toContain("Inbox body.");
  });

  it("concatenates articles, then memory notes, then daily notes", () => {
    expect(txt.indexOf("Alpha body.")).toBeLessThan(txt.indexOf("Memory body."));
    expect(txt.indexOf("Memory body.")).toBeLessThan(txt.indexOf("Inbox body."));
  });

  it("preserves the caller's input order within a section", () => {
    const many = renderLlmsFull(
      content({
        articles: [
          article({ slug: "a", title: "A", raw: "body A." }),
          article({ slug: "b", title: "B", raw: "body B." }),
        ],
      })
    );
    expect(many.indexOf("body A.")).toBeLessThan(many.indexOf("body B."));
  });

  it("closes each note with a rule", () => {
    // header rule + one per note
    expect(txt.split("\n").filter((l) => l === "---")).toHaveLength(4);
  });
});

describe("renderArticleMarkdown", () => {
  it("emits frontmatter then the body, with a trailing newline", () => {
    const md = renderArticleMarkdown(article());
    expect(md).toBe(
      [
        "---",
        'title: "Alpha"',
        'category: "guides"',
        'tags: ["ts"]',
        'links: ["beta"]',
        'summary: "First note."',
        'updated: "2026-05-26"',
        "---",
        "Alpha body.",
        "",
      ].join("\n")
    );
  });

  it("always emits links frontmatter, empty when there are none", () => {
    // Raw-markdown consumers read `links:`; dropping the key breaks them.
    const md = renderArticleMarkdown(article({ links: [] }));
    expect(md).toContain("links: []");
  });

  it("omits tags, summary, and updated when empty", () => {
    const md = renderArticleMarkdown(
      article({ tags: [], summary: "", updated: "" })
    );
    expect(md).not.toContain("tags:");
    expect(md).not.toContain("summary:");
    expect(md).not.toContain("updated:");
  });

  it("JSON-quotes a title containing a colon", () => {
    expect(renderArticleMarkdown(article({ title: "Note: one" }))).toContain(
      'title: "Note: one"'
    );
  });
});

describe("renderMemoryMarkdown", () => {
  const md = renderMemoryMarkdown(memory());

  it("emits the full note with related re-encoded as wikilinks", () => {
    expect(md).toBe(
      [
        "---",
        'name: "user-duyet"',
        'title: "Duyet"',
        'description: "Who the user is."',
        'type: "user"',
        'category: "general"',
        'tags: ["identity"]',
        'related: ["[[alpha]]"]',
        'sources: ["https://example.com"]',
        'aliases: ["duyet"]',
        'created: "2026-01-01"',
        'updated: "2026-02-02"',
        "---",
        "Memory body.",
        "",
      ].join("\n")
    );
  });

  it("passes an author's unrecognised type through verbatim", () => {
    // The generator deliberately does NOT validate `type` the way the runtime
    // loader does; this is the documented divergence.
    expect(renderMemoryMarkdown(memory({ memoryType: "invented" }))).toContain(
      'type: "invented"'
    );
  });

  it("omits every optional list and date when empty", () => {
    const bare = renderMemoryMarkdown(
      memory({
        category: "",
        tags: [],
        related: [],
        sources: [],
        aliases: [],
        created: "",
        updated: "",
      })
    );
    for (const key of [
      "category:",
      "tags:",
      "related:",
      "sources:",
      "aliases:",
      "created:",
      "updated:",
    ]) {
      expect(bare).not.toContain(key);
    }
    expect(bare).toContain('description: "Who the user is."');
  });

  it("keeps only the guaranteed keys for a bare note", () => {
    const bare = renderMemoryMarkdown(
      memory({
        category: "",
        description: "",
        title: "",
        tags: [],
        related: [],
        sources: [],
        aliases: [],
        created: "",
        updated: "",
      })
    );
    const keys = bare
      .split("\n")
      .filter((l) => l.includes(":"))
      .map((l) => l.split(":")[0]);
    expect(keys).toEqual(["name", "title", "description", "type"]);
  });
});

describe("renderInboxMarkdown", () => {
  it("emits title, date, and links", () => {
    expect(renderInboxMarkdown(inbox())).toBe(
      [
        "---",
        'title: "A Monday"',
        'date: "2026-08-10"',
        'links: ["alpha"]',
        "---",
        "Inbox body.",
        "",
      ].join("\n")
    );
  });

  it("omits links when the note has none", () => {
    expect(renderInboxMarkdown(inbox({ links: [] }))).not.toContain("links:");
  });
});

describe("buildGraphData", () => {
  const { nodes, edges } = buildGraphData(content());

  it("emits one node per note plus one per distinct tag", () => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    expect(byId.get("alpha")).toMatchObject({
      label: "Alpha",
      kind: "article",
      href: "/k/alpha",
      updated: "2026-05-26",
    });
    expect(byId.get("user-duyet")).toMatchObject({
      kind: "memory",
      memoryType: "user",
      href: "/m/user-duyet",
    });
    expect(byId.get("2026-08-10")).toMatchObject({
      kind: "inbox",
      href: "/d/2026-08-10",
      updated: "2026-08-10",
    });
    expect(byId.get("#ts")).toMatchObject({ kind: "tag", label: "#ts" });
    expect(byId.get("#identity")).toMatchObject({ kind: "tag" });
  });

  it("resolves declared links and related to link edges", () => {
    // `beta` must exist as a note — a ref naming nothing is dropped, not emitted.
    const c = content({
      articles: [article(), article({ slug: "beta", title: "Beta", links: [], tags: [] })],
    });
    const g = buildGraphData(c);
    expect(g.edges).toContainEqual({
      source: "alpha",
      target: "beta",
      kind: "link",
    });
    expect(g.edges).toContainEqual({
      source: "user-duyet",
      target: "alpha",
      kind: "link",
    });
    expect(g.edges).toContainEqual({
      source: "2026-08-10",
      target: "alpha",
      kind: "link",
    });
  });

  it("adds a tag-membership edge for every tag on an article or memory note", () => {
    expect(edges).toContainEqual({ source: "alpha", target: "#ts", kind: "tag" });
    expect(edges).toContainEqual({
      source: "user-duyet",
      target: "#identity",
      kind: "tag",
    });
  });

  it("resolves a ref through a memory title, a memory alias, and a body wikilink", () => {
    const c = content({
      articles: [
        article({
          slug: "by-title",
          title: "By Title",
          links: ["Duyet", "duyet"],
          tags: [],
          raw: "See [[By Alias]] and [[user-duyet]].",
        }),
        article({ slug: "by-alias", title: "By Alias", links: [], tags: [] }),
      ],
      memory: [
        memory({ aliases: ["duyet"], related: [] }),
        memory({
          slug: "user-other",
          name: "user-other",
          title: "Other",
          aliases: ["other-alias"],
          tags: [],
          related: ["by-alias"],
        }),
      ],
      inbox: [],
      categories: [],
    });
    const refs = buildGraphData(c).edges
      .filter((e) => e.kind === "link")
      .sort((a, b) => a.source.localeCompare(b.source));
    expect(refs).toEqual([
      // "Duyet" (title), "duyet" (alias), and [[user-duyet]] (slug) all
      // resolve to user-duyet, and the three collapse to one edge.
      { source: "by-title", target: "user-duyet", kind: "link" },
      { source: "by-title", target: "by-alias", kind: "link" },
      { source: "user-other", target: "by-alias", kind: "link" },
    ]);
  });

  it("drops a ref that names no known slug", () => {
    const c = content({
      articles: [article({ links: ["nowhere"], raw: "And [[also-nowhere]]." })],
      memory: [],
      inbox: [],
      categories: [],
    });
    expect(buildGraphData(c).edges.filter((e) => e.kind === "link")).toEqual([]);
  });

  it("drops self-edges and duplicate edges", () => {
    const c = content({
      articles: [article({ slug: "self", links: ["self", "self"], raw: "[[self]]" })],
      memory: [],
      inbox: [],
      categories: [],
    });
    expect(buildGraphData(c).edges.filter((e) => e.kind === "link")).toEqual([]);
  });

  it("creates one tag node for a tag used by several notes", () => {
    const c = content({
      articles: [article({ tags: ["shared"], links: [] })],
      memory: [memory({ tags: ["shared"] })],
      inbox: [],
      categories: [],
    });
    const g = buildGraphData(c);
    expect(g.nodes.filter((n) => n.id === "#shared")).toHaveLength(1);
    expect(g.edges.filter((e) => e.kind === "tag")).toHaveLength(2);
  });

  it("leaves the `generated` timestamp to the caller", () => {
    expect(buildGraphData(content())).not.toHaveProperty("generated");
  });
});
