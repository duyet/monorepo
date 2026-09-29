import { describe, expect, it } from "vitest"
import { splitFrontmatter, stripFrontmatter } from "./frontmatter"

/**
 * The three fence regexes this module replaced, transcribed **verbatim** from
 * before the consolidation:
 *
 * - `apps/kb/lib/content.ts` `parseFrontmatter`
 * - `apps/blog/lib/shortform-parse.ts` `parseFrontmatter`
 * - `apps/kb/lib/markdown.ts` `stripFrontmatter`
 *
 * They are kept here as an oracle, so the compatibility claim below is pinned
 * against the code that actually shipped rather than against a restatement of
 * the new code.
 */
const KB_PARSER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const BLOG_PARSER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
const KB_STRIP = /^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|(?=\S)|$)/;

/** Every document shape the three implementations could be handed. */
const DOCUMENTS: Record<string, string> = {
  "plain LF": "---\ntitle: A\n---\nbody\n",
  "plain CRLF": "---\r\ntitle: A\r\n---\r\nbody\r\n",
  "BOM + LF": "\uFEFF---\ntitle: A\n---\nbody\n",
  "BOM + CRLF": "\uFEFF---\r\ntitle: A\r\n---\r\nbody\r\n",
  "no trailing newline": "---\ntitle: A\n---\nbody",
  "empty body": "---\ntitle: A\n---\n",
  "no frontmatter": "just body\n",
  "unterminated fence": "---\ntitle: A\nbody\n",
  "empty frontmatter block": "---\n---\nbody\n",
  "`---` inside the body": "---\ntitle: A\n---\nbody\n---\nstill body\n",
  "fence with no line break after": "---\ntitle: A\n---foo",
  "frontmatter only": "---\ntitle: A\n---",
  "trailing space on fences": "--- \ntitle: A\n--- \nbody\n",
  "multi-line frontmatter": "---\ntitle: A\ntags:\n  - x\n  - y\n---\nbody\n",
  "empty document": "",
  "fence-like line in body": "text\n---\nmore text\n",
  "quoted value": '---\ntitle: "A: B"\n---\nbody\n',
  "list value": "---\ntags: [1, 2]\n---\nbody\n",
  "CRLF empty body": "---\r\ntitle: A\r\n---\r\n",
}

describe("splitFrontmatter is a strict superset of the three regexes it replaced", () => {
  it("returns a byte-identical body for every document the old parsers accepted", () => {
    // The load-bearing claim. If an input matched before, the body must be
    // identical now — otherwise a consolidation has silently changed a page.
    let verified = 0
    for (const [name, raw] of Object.entries(DOCUMENTS)) {
      for (const [label, pattern] of [
        ["kb", KB_PARSER],
        ["blog", BLOG_PARSER],
      ] as const) {
        const old = raw.match(pattern)
        if (old === null) continue
        expect(`${name}/${label}: ${splitFrontmatter(raw)?.body}`).toBe(
          `${name}/${label}: ${old[2]}`
        )
        verified++
      }
      // `stripFrontmatter`'s contract: the body, or the input unchanged. Only
      // comparable where the old expression actually matched — where it did
      // not, the old function returned the input verbatim, which is a case
      // this one now handles instead (asserted separately below).
      if (KB_STRIP.test(raw)) {
        expect(`${name}/strip: ${stripFrontmatter(raw)}`).toBe(
          `${name}/strip: ${raw.replace(KB_STRIP, "")}`
        )
        verified++
      }
    }
    // Guards the sweep from degenerating into a vacuous pass.
    expect(verified).toBeGreaterThan(30)
  })

  it("strips an empty frontmatter block, which the old stripper left in place", () => {
    // The old expression needed `\r?\n` before the closing fence, so
    // `---\n---\n` was not recognised and the fence leaked into the rendered
    // body as literal text. Correcting it changes output for that input, so it
    // is called out rather than hidden inside the superset claim.
    expect(KB_STRIP.test("---\n---\nbody\n")).toBe(false)
    expect(stripFrontmatter("---\n---\nbody\n")).toBe("body\n")
  })

  it("accepts the three shapes the old parsers rejected", () => {
    // A BOM-prefixed article previously had its frontmatter stripped for
    // display while the loader read none of it — two code paths disagreeing
    // about the same file.
    expect(splitFrontmatter("\uFEFF---\ntitle: A\n---\nbody\n")).toEqual({
      frontmatter: "title: A",
      body: "body\n",
    })
    // An empty block is valid YAML and a legitimate authoring choice.
    expect(splitFrontmatter("---\n---\nbody\n")).toEqual({
      frontmatter: "",
      body: "body\n",
    })
    // A closing fence with no line break after it, which the blog parser
    // rejected outright (its `\r?\n` was mandatory).
    expect(splitFrontmatter("---\ntitle: A\n---foo")).toEqual({
      frontmatter: "title: A",
      body: "foo",
    })
  })
})

describe("splitFrontmatter", () => {
  it("returns null when there is no complete fence", () => {
    expect(splitFrontmatter("just body\n")).toBeNull()
    expect(splitFrontmatter("---\ntitle: A\nbody\n")).toBeNull()
    expect(splitFrontmatter("")).toBeNull()
  })

  it("stops at the first closing fence, leaving later `---` in the body", () => {
    // A markdown body can legitimately contain a horizontal rule. Anchoring
    // the pattern at the end would swallow everything after it.
    expect(splitFrontmatter("---\ntitle: A\n---\nbefore\n---\nafter")).toEqual({
      frontmatter: "title: A",
      body: "before\n---\nafter",
    })
  })

  it("consumes at most one line break after the closing fence", () => {
    // Consuming greedily would eat the first blank line of every body.
    expect(splitFrontmatter("---\na: 1\n---\n\n\nbody")?.body).toBe("\n\nbody")
  })

  it("keeps the raw YAML untrimmed so YAML error positions stay accurate", () => {
    // Trimming here would shift the line/column `js-yaml` reports.
    expect(splitFrontmatter("---\n  a: 1\n---\nbody")?.frontmatter).toBe("  a: 1")
  })

  it("preserves multi-line and structured frontmatter for a YAML parser", () => {
    // The point of not parsing here: a regex parser would flatten or mangle
    // these, which is exactly what the blog's three `^key:` regexes do.
    const split = splitFrontmatter("---\ntags:\n  - x\n  - y\n---\nbody\n")
    expect(split?.frontmatter).toBe("tags:\n  - x\n  - y")
    expect(split?.body).toBe("body\n")
  })
})

describe("stripFrontmatter", () => {
  it("returns the input unchanged when there is no fence", () => {
    expect(stripFrontmatter("just body\n")).toBe("just body\n")
    expect(stripFrontmatter("")).toBe("")
  })

  it("is the body whenever a fence is present", () => {
    expect(stripFrontmatter("---\na: 1\n---\nbody\n")).toBe("body\n")
    expect(stripFrontmatter("\uFEFF---\na: 1\n---\nbody\n")).toBe("body\n")
  })
})
