import { describe, test, expect } from "bun:test";
import { extractHeadings } from "./extractHeadings";

describe("extractHeadings", () => {
  test("extracts h2 and h3 headings", async () => {
    const md = `# Title\n## Section One\n### Subsection\n## Section Two`;
    const result = await extractHeadings(md);
    expect(result).toEqual([
      { id: "section-one", text: "Section One", level: 2 },
      { id: "subsection", text: "Subsection", level: 3 },
      { id: "section-two", text: "Section Two", level: 2 },
    ]);
  });

  test("skips only the first h1", async () => {
    const md = `# First Title\n# Second Title\n## Under Second`;
    const result = await extractHeadings(md);
    expect(result).toEqual([
      { id: "second-title", text: "Second Title", level: 1 },
      { id: "under-second", text: "Under Second", level: 2 },
    ]);
  });

  test("includes h1 headings after the first", async () => {
    const md = `# First\n# Second\n# Third`;
    const result = await extractHeadings(md);
    expect(result.length).toBe(2);
    expect(result[0].text).toBe("Second");
    expect(result[1].text).toBe("Third");
  });

  test("returns empty array for empty content", async () => {
    const result = await extractHeadings("");
    expect(result).toEqual([]);
  });

  test("returns empty array when no headings", async () => {
    const md = `This is just a paragraph.\n\nAnother paragraph.`;
    const result = await extractHeadings(md);
    expect(result).toEqual([]);
  });

  test("ignores h4 and deeper headings", async () => {
    const md = `## Section\n#### Deep heading\n##### Deeper`;
    const result = await extractHeadings(md);
    expect(result).toEqual([{ id: "section", text: "Section", level: 2 }]);
  });

  test("generates slugs from text", async () => {
    const md = `## Hello World\n## TypeScript & React`;
    const result = await extractHeadings(md);
    expect(result[0].id).toBe("hello-world");
    expect(result[1].id).toBe("typescript--react");
  });

  test("handles duplicate heading text with unique slugs", async () => {
    const md = `## Section\n## Section\n## Section`;
    const result = await extractHeadings(md);
    expect(result[0].id).toBe("section");
    expect(result[1].id).toBe("section-1");
    expect(result[2].id).toBe("section-2");
  });

  test("handles only an h1 (first h1 skipped, returns empty)", async () => {
    const md = `# Only Title`;
    const result = await extractHeadings(md);
    expect(result).toEqual([]);
  });
});
