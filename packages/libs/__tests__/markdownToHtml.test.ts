import { describe, expect, test } from "bun:test";
import markdownToHtml from "../markdownToHtml";

describe("markdownToHtml", () => {
  test("should convert basic markdown to HTML", async () => {
    const markdown = "Hello **world**";
    const html = await markdownToHtml(markdown);
    expect(html).toContain("<strong>world</strong>");
  });

  test("should convert headings with ids", async () => {
    const markdown = "## Hello World";
    const html = await markdownToHtml(markdown);
    expect(html).toContain("<h2");
    expect(html).toContain('id="hello-world"');
    expect(html).toContain("Hello World");
  });

  test("should convert inline code", async () => {
    const markdown = "Use `console.log` to debug";
    const html = await markdownToHtml(markdown);
    expect(html).toContain("<code>");
    expect(html).toContain("console.log");
  });

  test("should convert links", async () => {
    const markdown = "[Visit](https://example.com)";
    const html = await markdownToHtml(markdown);
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain("Visit");
  });

  test("should convert lists", async () => {
    const markdown = "- Item 1\n- Item 2\n- Item 3";
    const html = await markdownToHtml(markdown);
    expect(html).toContain("<li>");
    expect(html).toContain("Item 1");
    expect(html).toContain("Item 2");
    expect(html).toContain("Item 3");
  });

  test("should convert GFM tables", async () => {
    const markdown = `| A | B |
| --- | --- |
| 1 | 2 |`;
    const html = await markdownToHtml(markdown);
    expect(html).toContain("<table>");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
  });

  test("should sanitize dangerous HTML", async () => {
    const markdown =
      '<script>alert("xss")</script>\n\nSafe content here.';
    const html = await markdownToHtml(markdown);
    expect(html).not.toContain("<script>");
    expect(html).toContain("Safe content here.");
  });

  test("should handle empty markdown", async () => {
    const html = await markdownToHtml("");
    expect(typeof html).toBe("string");
  });

  test("should add autolink to headings", async () => {
    const markdown = "## Section Title";
    const html = await markdownToHtml(markdown);
    // rehype-autolink-headings adds anchor links to headings
    expect(html).toContain("section-title");
  });
});
