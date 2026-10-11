import { describe, expect, it } from "vitest"
import { parseFrontmatter } from "./shortform-parse"

/**
 * The fence split moved to `@duyet/libs/frontmatter`; these tests pin the
 * *wiring* at this call site, which the shared module's own tests cannot.
 *
 * The one behaviour that actually changed here: a BOM-prefixed shortform used
 * to match nothing and be treated as a body with no frontmatter, so its `date`
 * silently became `""` and it sorted into an arbitrary position. No file in
 * `_shortforms/` has a BOM today — that is why it went unnoticed.
 */
describe("parseFrontmatter", () => {
  it("reads the three documented keys", () => {
    const parsed = parseFrontmatter(
      "---\ndate: 2026-05-31\ntitle: A Title\nslug: a-title\n---\nbody text\n"
    )
    expect(parsed).toEqual({
      date: "2026-05-31",
      title: "A Title",
      slug: "a-title",
      body: "body text",
    })
  })

  it("treats a document with no fence as all body", () => {
    // The shape of `README.md` and `Untitled.md` in `_shortforms/`.
    expect(parseFrontmatter("just a note")).toEqual({
      date: "",
      title: undefined,
      slug: undefined,
      body: "just a note",
    })
  })

  it("tolerates a missing optional key", () => {
    const parsed = parseFrontmatter("---\ndate: 2026-01-01\n---\nbody")
    expect(parsed.date).toBe("2026-01-01")
    expect(parsed.title).toBeUndefined()
    expect(parsed.slug).toBeUndefined()
  })

  it("handles CRLF line endings", () => {
    const parsed = parseFrontmatter(
      "---\r\ndate: 2026-01-01\r\ntitle: T\r\n---\r\nbody\r\n"
    )
    expect(parsed.date).toBe("2026-01-01")
    expect(parsed.title).toBe("T")
    expect(parsed.body).toBe("body")
  })

  it("reads a BOM-prefixed document instead of dropping its frontmatter", () => {
    // The regression the shared fence fixes. Previously this returned
    // `date: ""`, because the old regex had no `\uFEFF?` and therefore matched
    // nothing at all.
    const parsed = parseFrontmatter(
      "\uFEFF---\ndate: 2026-05-31\ntitle: T\n---\nbody"
    )
    expect(parsed.date).toBe("2026-05-31")
    expect(parsed.title).toBe("T")
    expect(parsed.body).toBe("body")
  })

  it("reads a closing fence that has no line break after it", () => {
    // The old blog regex required `\r?\n` after the closing `---` and so
    // rejected this outright, treating the whole file as body.
    const parsed = parseFrontmatter("---\ndate: 2026-01-01\n---body")
    expect(parsed.date).toBe("2026-01-01")
    expect(parsed.body).toBe("body")
  })

  it("stops at the first closing fence, so a `---` rule in the body survives", () => {
    const parsed = parseFrontmatter(
      "---\ndate: 2026-01-01\n---\nabove\n---\nbelow\n"
    )
    expect(parsed.date).toBe("2026-01-01")
    expect(parsed.body).toBe("above\n---\nbelow")
  })

  it("reads optional discussion links", () => {
    const parsed = parseFrontmatter(
      "---\ndate: 2026-10-01\nx: https://x.com/_duyet/status/1\nhackerNews: https://news.ycombinator.com/item?id=1\n---\nbody"
    )
    expect(parsed.x).toBe("https://x.com/_duyet/status/1")
    expect(parsed.hackerNews).toBe("https://news.ycombinator.com/item?id=1")
  })

  it("keeps the documented limits of the three-key shape", () => {
    // Not fixed by the shared fence, and pinned so the limit is visible: the
    // per-key regexes do not unquote values and do not read lists. Shortforms
    // are documented as this shape; a future author who needs real YAML should
    // route through a YAML parser, and this test should change with them.
    const quoted = parseFrontmatter('---\ndate: 2026-01-01\ntitle: "A: B"\n---\nb')
    expect(quoted.title).toBe('"A: B"')

    const listed = parseFrontmatter("---\ndate: 2026-01-01\ntags:\n  - x\n---\nb")
    expect(listed.title).toBeUndefined()
  })

  it("agrees with every real shortform in the repo", () => {
    // The corpus is the point: the fence change is only safe if it holds for
    // the files that actually ship. Mirrors the filter in `lib/shortforms.ts`,
    // which drops any note whose date does not parse.
    const files = import.meta.glob("/_shortforms/*.md", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;

    const entries = Object.entries(files);
    expect(entries.length).toBeGreaterThan(5);

    const dated = entries.filter(
      ([, raw]) => !Number.isNaN(new Date(parseFrontmatter(raw).date).getTime())
    );
    // `README.md` and the empty `Untitled.md` are in the directory but are not
    // published; everything else is a real note with a real date.
    expect(dated.length).toBeGreaterThan(5);
    expect(dated.length).toBeLessThan(entries.length);

    for (const [path, raw] of dated) {
      const parsed = parseFrontmatter(raw);
      expect(parsed.date, path).toMatch(/^\d{4}-\d{2}-\d{2}/);
      // The body must be the note, not a leaked frontmatter fence.
      expect(parsed.body, path).not.toContain("\n---");
      expect(parsed.body, path).not.toMatch(/^---\n/);
    }
  })
})
