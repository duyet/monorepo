import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OldPostWarning } from "./-old-post-warning";
import type { Post } from "@duyet/interfaces";

const post = (date: string): Post =>
  ({
    slug: "2013/07/hadoop-la-gi",
    title: "Hadoop là gì",
    date: new Date(date),
    category: "Data",
    category_slug: "data",
    tags: [],
    tags_slug: [],
    featured: false,
  }) as Post;

describe("OldPostWarning", () => {
  it("hides posts younger than the threshold", () => {
    const { container } = render(
      <OldPostWarning post={post("2026-01-01")} year={5} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("fills the 68ch text column with a muted background", () => {
    const { container } = render(
      <OldPostWarning post={post("2013-07-01")} year={5} />,
    );
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside?.textContent).toMatch(/This post is over \d+ years old/);
    expect(aside?.className).toContain("w-full");
    expect(aside?.className).toContain("max-w-[68ch]");
    expect(aside?.className).toContain("bg-muted");
  });
});
