import { describe, expect, it } from "bun:test";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";

// Test that the markdownToHtml pipeline (used to sanitize snippets) strips XSS vectors
describe("Snippet sanitization via markdownToHtml", () => {
  it("strips script tags", async () => {
    const result = await markdownToHtml('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  });

  it("strips javascript: URLs", async () => {
    const result = await markdownToHtml('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain("javascript:");
  });

  it("strips iframe tags", async () => {
    const result = await markdownToHtml('<iframe src="https://evil.com"></iframe>');
    expect(result).not.toContain("<iframe");
  });

  it("strips style tags", async () => {
    const result = await markdownToHtml("<style>body{display:none}</style>");
    expect(result).not.toContain("<style");
  });

  it("allows safe HTML", async () => {
    const result = await markdownToHtml("<p><strong>bold</strong> and <em>italic</em></p>");
    expect(result).toContain("<strong>bold</strong>");
    expect(result).toContain("<em>italic</em>");
  });
});
