import { describe, expect, test } from "vitest";
import {
  isShortformFile,
  parseShortform,
  resolveEmbeds,
  shortformId,
} from "../shortform-parse";

describe("shortformId", () => {
  test("prefers explicit slug", () => {
    expect(shortformId("2026-06-08-ax", "ax")).toBe("ax");
  });

  test("strips YYYY-MM-DD prefix from filename", () => {
    expect(shortformId("2026-06-08-ax")).toBe("ax");
    expect(shortformId("2026-08-17-system-prompt-vs-tool-schema")).toBe(
      "system-prompt-vs-tool-schema",
    );
  });

  test("slugifies undated filenames", () => {
    expect(shortformId("Chrome Devtools MCP")).toBe("chrome-devtools-mcp");
  });
});

describe("isShortformFile", () => {
  // The live loader globs `/_shortforms/*.md`, so the two prebuild scripts have
  // to reject exactly what the glob would not have matched. A note that only one
  // of the three accepts gets a generated .md / sitemap entry / OG card for a
  // page the router 404s on (or the reverse).
  test("accepts a top-level note", () => {
    expect(isShortformFile("2026-06-08-ax.md")).toBe(true);
    expect(isShortformFile("ax.md")).toBe(true);
  });

  test("rejects README.md regardless of case", () => {
    expect(isShortformFile("README.md")).toBe(false);
    expect(isShortformFile("readme.md")).toBe(false);
  });

  test("rejects non-markdown entries", () => {
    expect(isShortformFile("diagram.png")).toBe(false);
    expect(isShortformFile("notes.txt")).toBe(false);
  });
});

describe("resolveEmbeds", () => {
  const lookup = (name: string) =>
    name === "chart.png" ? "/media/notes/chart.png" : undefined;

  test("rewrites a resolvable embed to a markdown image", () => {
    expect(resolveEmbeds("![[chart.png]]", lookup)).toBe(
      "![chart.png](/media/notes/chart.png)",
    );
  });

  test("uses the alt text when given, and trims it", () => {
    expect(resolveEmbeds("![[chart.png| My chart ]]", lookup)).toBe(
      "![My chart](/media/notes/chart.png)",
    );
  });

  test("leaves an unresolvable embed verbatim", () => {
    expect(resolveEmbeds("![[missing.png]]", lookup)).toBe(
      "![[missing.png]]",
    );
  });

  test("matches the attachment name after trimming whitespace", () => {
    expect(resolveEmbeds("![[  chart.png  ]]", lookup)).toBe(
      "![chart.png](/media/notes/chart.png)",
    );
  });

  test("leaves ordinary markdown images and links alone", () => {
    const body = "![alt](/img.png) and [text](https://example.com)";
    expect(resolveEmbeds(body, lookup)).toBe(body);
  });

  test("rewrites every occurrence", () => {
    expect(resolveEmbeds("![[chart.png]]\n![[chart.png]]", lookup)).toBe(
      "![chart.png](/media/notes/chart.png)\n![chart.png](/media/notes/chart.png)",
    );
  });
});

describe("parseShortform", () => {
  const raw = [
    "---",
    "date: 2026-06-08",
    "title: Ax",
    "---",
    "",
    "Body with ![[chart.png]]",
  ].join("\n");

  test("derives the id from the filename and reads the frontmatter", () => {
    const note = parseShortform("2026-06-08-ax.md", raw, () => undefined);
    expect(note.id).toBe("ax");
    expect(note.title).toBe("Ax");
    expect(note.date).toBe("2026-06-08");
  });

  test("returns the date as the raw frontmatter string, not a Date", () => {
    // Consumers coerce it themselves: the browser loader to a Date for sorting,
    // generate-og to keep the string for a lexicographic sort. Coercing here
    // would make an invalid date silently become an epoch instead of NaN.
    expect(parseShortform("ax.md", raw, () => undefined).date).toBe(
      "2026-06-08",
    );
  });

  test("resolves embeds through the supplied lookup before excerpting", () => {
    const note = parseShortform("ax.md", raw, () => "/media/notes/chart.png");
    expect(note.body).toBe("Body with ![chart.png](/media/notes/chart.png)");
    // `toExcerpt` drops images entirely (both `![[..]]` and `![..](..)`), so
    // the excerpt is the surrounding prose either way — which is exactly why
    // it is safe for a public OG description.
    expect(note.excerpt).toBe("Body with");
  });

  test("the excerpt is built from the resolved body, not the raw one", () => {
    // An unresolved embed survives into the body; toExcerpt must still strip
    // it, or a public OG description leaks Obsidian syntax.
    const note = parseShortform("ax.md", raw, () => undefined);
    expect(note.body).toBe("Body with ![[chart.png]]");
    expect(note.excerpt).toBe("Body with");
  });

  test("prefers an explicit slug over the filename", () => {
    const note = parseShortform("2026-06-08-ax.md", raw.replace(
      "title: Ax",
      "title: Ax\nslug: custom"
    ), () => undefined);
    expect(note.id).toBe("custom");
  });
});
