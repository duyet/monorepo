import { describe, expect, test } from "bun:test";
import extractHeadings from "../extractHeadings";

describe("extractHeadings", () => {
  test("should extract h2 headings", async () => {
    const markdown = `# Title

## First Heading

Some content here.

## Second Heading

More content.
`;

    const headings = await extractHeadings(markdown);
    expect(headings).toHaveLength(2);
    expect(headings[0].text).toBe("First Heading");
    expect(headings[0].level).toBe(2);
    expect(headings[0].id).toBe("first-heading");
    expect(headings[1].text).toBe("Second Heading");
    expect(headings[1].level).toBe(2);
    expect(headings[1].id).toBe("second-heading");
  });

  test("should extract h3 headings", async () => {
    const markdown = `## Section

### Subsection A

### Subsection B
`;

    const headings = await extractHeadings(markdown);
    expect(headings).toHaveLength(3);
    expect(headings[1].text).toBe("Subsection A");
    expect(headings[1].level).toBe(3);
    expect(headings[2].text).toBe("Subsection B");
    expect(headings[2].level).toBe(3);
  });

  test("should skip the first h1", async () => {
    const markdown = `# Document Title

## First Section
`;

    const headings = await extractHeadings(markdown);
    // First h1 should be skipped (it's the title)
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("First Section");
    expect(headings[0].level).toBe(2);
  });

  test("should include subsequent h1 headings", async () => {
    const markdown = `# Title

## Section

# Another H1
`;

    const headings = await extractHeadings(markdown);
    expect(headings).toHaveLength(2);
    expect(headings[0].text).toBe("Section");
    expect(headings[1].text).toBe("Another H1");
    expect(headings[1].level).toBe(1);
  });

  test("should ignore h4 and deeper headings", async () => {
    const markdown = `## Section

#### Deep heading

##### Even deeper
`;

    const headings = await extractHeadings(markdown);
    // Only h2 should be extracted, h4 and h5 should be skipped
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Section");
  });

  test("should skip empty headings", async () => {
    const markdown = `##

## Valid Heading
`;

    const headings = await extractHeadings(markdown);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Valid Heading");
  });

  test("should generate unique slugs for duplicate headings", async () => {
    const markdown = `## Same Title

## Same Title
`;

    const headings = await extractHeadings(markdown);
    expect(headings).toHaveLength(2);
    expect(headings[0].id).toBe("same-title");
    expect(headings[1].id).toBe("same-title-1");
  });

  test("should return empty array for markdown without headings", async () => {
    const markdown = "Just some paragraph text without any headings.";
    const headings = await extractHeadings(markdown);
    expect(headings).toEqual([]);
  });

  test("should handle markdown with inline code in headings", async () => {
    const markdown = "## Using `useEffect` hook";
    const headings = await extractHeadings(markdown);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Using useEffect hook");
  });

  test("should handle markdown with links in headings", async () => {
    const markdown = "## [Click here](https://example.com)";
    const headings = await extractHeadings(markdown);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Click here");
  });
});
