import { describe, expect, it } from "vitest";
import init, { escape_reg_exp, slugify } from "./stub";

/**
 * `stub.ts` is the JS stand-in for `@duyet/wasm/pkg/utils/utils.js`, aliased in
 * by four vitest configs (packages/components, apps/agent-ui,
 * apps/llm-timeline) so tests run without a built `pkg/`. It is therefore
 * load-bearing test infrastructure, not a dead placeholder — its behaviour is
 * what most of the repo's test runs actually observe.
 *
 * The Rust original lives in `crates/utils/src/lib.rs`; `pnpm run wasm:test`
 * covers that side. These tests pin the *fallback* so a divergence shows up as
 * a failure here rather than as a silently different answer in CI.
 */

describe("escape_reg_exp", () => {
  it("leaves strings with no regex metacharacters untouched", () => {
    expect(escape_reg_exp("hello")).toBe("hello");
    expect(escape_reg_exp("hello world 123")).toBe("hello world 123");
    expect(escape_reg_exp("")).toBe("");
  });

  it("escapes every metacharacter the Rust version documents", () => {
    // Same 13 characters as crates/utils/src/lib.rs — the character class must
    // not drift from the crate it stands in for.
    expect(escape_reg_exp("hello+world")).toBe("hello\\+world");
    expect(escape_reg_exp("a.b")).toBe("a\\.b");
    expect(escape_reg_exp("a*b")).toBe("a\\*b");
    expect(escape_reg_exp("a?b")).toBe("a\\?b");
    expect(escape_reg_exp("a^b")).toBe("a\\^b");
    expect(escape_reg_exp("a$b")).toBe("a\\$b");
    expect(escape_reg_exp("a{b}")).toBe("a\\{b\\}");
    expect(escape_reg_exp("a(b)")).toBe("a\\(b\\)");
    expect(escape_reg_exp("a|b")).toBe("a\\|b");
    expect(escape_reg_exp("a[b]")).toBe("a\\[b\\]");
    expect(escape_reg_exp("a\\b")).toBe("a\\\\b");
  });

  it("produces a pattern that matches the input literally", () => {
    // The whole point of escaping: round-trip through RegExp, not string compare.
    const input = "a.b*c+d?e";
    expect(new RegExp(escape_reg_exp(input)).test(input)).toBe(true);
    expect(new RegExp(escape_reg_exp(input)).test("axbXcYdZe")).toBe(false);
  });
});

describe("slugify", () => {
  it("lowercases and hyphen-joins words", () => {
    expect(slugify("Hello")).toBe("hello");
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify(" Hello World ")).toBe("hello-world");
    expect(slugify("a---b")).toBe("a-b");
    expect(slugify("a_b c")).toBe("a-b-c");
    expect(slugify("ABC123")).toBe("abc123");
    expect(slugify("9 lives")).toBe("9-lives");
  });

  it("strips emoji and non-ASCII letters", () => {
    expect(slugify(" Hello World 😹")).toBe("hello-world");
    expect(slugify("😆 Hello World 😹")).toBe("hello-world");
    expect(slugify("café")).toBe("caf");
    expect(slugify("😆😹")).toBe("");
  });

  it("never leaves a leading or trailing hyphen", () => {
    // Collapse-then-trim order: the `+` collapses the run first, so a single
    // leading/trailing strip is enough.
    expect(slugify("- -")).toBe("");
    expect(slugify("---")).toBe("");
    expect(slugify("!hello!")).toBe("hello");
  });

  it("returns an empty string for empty or separator-only input", () => {
    expect(slugify("")).toBe("");
  });

  it("hyphenates every non-alphanumeric run, including punctuation", () => {
    expect(slugify("Hello & World!")).toBe("hello-world");
    expect(slugify("note_file.md")).toBe("note-file-md");
    expect(slugify("a[[b]]c")).toBe("a-b-c");
  });

  it("CHARACTERIZATION: does not truncate and ignores max_length", () => {
    // WRONG RELATIVE TO THE CRATE, pinned deliberately. The Rust
    // `slugify(input, max_length)` defaults to 100 and truncates without
    // breaking a word; this stub takes one argument and never truncates. Any
    // caller that reaches the fallback with a long string gets a longer slug
    // than production would.
    const long = "x".repeat(150);
    expect(slugify(long)).toHaveLength(150);
    expect(
      (slugify as unknown as (input: string, max: number) => string)(
        "Hello World",
        5,
      ),
    ).toBe("hello-world");
  });

  it("CHARACTERIZATION: collapses non-alphanumerics the crate instead drops", () => {
    // WRONG RELATIVE TO THE CRATE, pinned deliberately. Rust only treats
    // space/`-`/`_` as separators and *silently drops* everything else, so the
    // crate yields "note-filemd" and "abc" where this yields
    // "note-file-md" and "a-b-c". That is exactly the drift the repo's
    // slugify golden tests were written to police, so it is worth a failing
    // signal if it ever changes in either direction.
    expect(slugify("note_file.md")).toBe("note-file-md");
    expect(slugify("a[[b]]c")).toBe("a-b-c");
  });
});

describe("init", () => {
  it("resolves to an empty object, matching the no-op WASM surface", () => {
    // Callers do `await mod.default()` before touching the exports; the stub
    // has nothing to initialise.
    return expect(init()).resolves.toEqual({});
  });
});
