import { describe, test, expect } from "bun:test";
import { markdownToHtml } from "./markdownToHtml";

describe("markdownToHtml", () => {
  test("converts basic markdown paragraph", async () => {
    const result = await markdownToHtml("Hello **world**");
    expect(result).toContain("<strong>world</strong>");
    expect(result).toContain("Hello");
  });

  test("converts markdown headings", async () => {
    const result = await markdownToHtml("## Section Title");
    expect(result).toContain("<h2");
    expect(result).toContain("Section Title");
  });

  test("converts markdown links", async () => {
    const result = await markdownToHtml("[Click here](https://example.com)");
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain("Click here");
  });

  test("converts GFM table", async () => {
    const md = `| Name | Age |\n| ---- | --- |\n| Alice | 30 |\n| Bob | 25 |`;
    const result = await markdownToHtml(md);
    expect(result).toContain("<table");
    expect(result).toContain("<th");
    expect(result).toContain("Alice");
    expect(result).toContain("Bob");
  });

  test("converts GFM strikethrough (del stripped by sanitizer)", async () => {
    const result = await markdownToHtml("~~deleted~~");
    expect(result).toContain("deleted");
    expect(result).not.toContain("<del>");
  });

  test("converts inline code", async () => {
    const result = await markdownToHtml("`const x = 1`");
    expect(result).toContain("<code>");
    expect(result).toContain("const x = 1");
  });

  test("converts fenced code block", async () => {
    const md = "```js\nconst x = 1;\n```";
    const result = await markdownToHtml(md);
    expect(result).toContain("<pre>");
    expect(result).toContain("<code");
    // syntax highlighting wraps tokens in spans, check for identifier tokens
    expect(result).toContain("const");
  });

  test("adds syntax highlighting classes to code blocks", async () => {
    const md = "```javascript\nconst x = 1;\n```";
    const result = await markdownToHtml(md);
    expect(result).toContain("hljs");
  });

  test("preserves inline math notation without errors", async () => {
    const result = await markdownToHtml("Inline: $E = mc^2$");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("preserves block math notation without errors", async () => {
    const result = await markdownToHtml("Display: $$E = mc^2$$");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test("strips XSS script tags", async () => {
    const result = await markdownToHtml('<script>alert("xss")</script>');
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert(");
  });

  test("strips XSS onclick attributes", async () => {
    const result = await markdownToHtml('<a onclick="evil()">click</a>');
    expect(result).not.toContain("onclick");
  });

  test("strips javascript: href", async () => {
    const result = await markdownToHtml('[evil](javascript:alert(1))');
    expect(result).not.toContain("javascript:");
  });

  test("handles empty string", async () => {
    const result = await markdownToHtml("");
    expect(typeof result).toBe("string");
    expect(result.trim()).toBe("");
  });
});
