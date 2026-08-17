import { describe, expect, it } from "vitest";
import { parseSearchTerms, searchDocs, snippetAround } from "./search";
import type { SearchDoc } from "./search";

const docs: SearchDoc[] = [
  {
    slug: "project-anyrouter",
    title: "AnyRouter",
    href: "/m/project-anyrouter",
    kind: "memory",
    subtitle: "Universal multi-provider LLM API gateway",
    tags: ["anyrouter", "llm"],
    haystack: "AnyRouter universal AI model router one API many providers",
  },
  {
    slug: "welcome",
    title: "Welcome",
    href: "/k/welcome",
    kind: "article",
    subtitle: "About this knowledge base",
    tags: ["meta"],
    haystack: "knowledge base articles and memory notes live here anyrouter mention",
  },
  {
    slug: "2026-08-17",
    title: "Inbox 2026-08-17",
    href: "/d/2026-08-17",
    kind: "daily",
    subtitle: "Daily capture",
    tags: [],
    haystack: "chmonitor paid product is host-count licenses",
  },
];

describe("parseSearchTerms", () => {
  it("splits and lowercases, dropping empties", () => {
    expect(parseSearchTerms("  AnyRouter   OS ")).toEqual(["anyrouter", "os"]);
  });
});

describe("searchDocs", () => {
  it("returns nothing for an empty query", () => {
    expect(searchDocs(docs, "   ")).toEqual([]);
  });

  it("requires every term (AND)", () => {
    expect(searchDocs(docs, "anyrouter host-count")).toHaveLength(0);
    expect(searchDocs(docs, "anyrouter gateway")).toHaveLength(1);
    expect(searchDocs(docs, "anyrouter gateway")[0].slug).toBe(
      "project-anyrouter"
    );
  });

  it("ranks title matches above body-only mentions", () => {
    const hits = searchDocs(docs, "anyrouter");
    expect(hits[0].slug).toBe("project-anyrouter");
    expect(hits[1].slug).toBe("welcome");
    expect(hits[0].score).toBeGreaterThan(hits[1].score);
  });

  it("filters by kind", () => {
    const hits = searchDocs(docs, "anyrouter", "article");
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe("article");
  });
});

describe("snippetAround", () => {
  it("centers the first match", () => {
    const s = snippetAround("aaa chmonitor paid product is honor system bbb", "chmonitor", 12);
    expect(s).toMatch(/chmonitor/);
    expect(s.startsWith("…") || s.includes("aaa")).toBe(true);
  });
});
