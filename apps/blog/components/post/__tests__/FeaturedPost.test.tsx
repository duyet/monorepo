import { vi } from "vitest";
import { render } from "@testing-library/react";
import type { Post } from "@duyet/interfaces";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    params,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    params?: Record<string, string>;
    [key: string]: unknown;
  }) => {
    let href = to;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        href = href.replace(`$${key}`, value);
      }
    }

    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

const { describe, expect, it } = await import("vitest");
const { FeaturedPost } = await import("../FeaturedPost");

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    slug: "/2024/01/test-post",
    title: "Test Post Title",
    date: new Date("2024-01-15"),
    category: "Engineering",
    category_slug: "engineering",
    tags: [],
    tags_slug: [],
    featured: false,
    ...overrides,
  };
}

describe("FeaturedPost", () => {
  it("renders title and category", () => {
    const post = makePost({ title: "My Featured Article", category: "Data" });
    const { getAllByText } = render(<FeaturedPost post={post} />);

    expect(getAllByText("My Featured Article").length).toBe(2);
    expect(getAllByText("Data").length).toBe(2);
  });

  it("renders route link with slug params", () => {
    const post = makePost({ slug: "/2024/03/spring-post" });
    const { container } = render(<FeaturedPost post={post} />);

    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("/2024/03/spring-post/");
  });

  it("renders formatted date text", () => {
    const post = makePost({ date: new Date("2024-03-15") });
    const { container } = render(<FeaturedPost post={post} />);

    const time = container.querySelector("time");
    expect(time).not.toBeNull();
    expect(time?.textContent).toContain("2024");
  });

  it("renders excerpt when provided", () => {
    const post = makePost({ excerpt: "This is a great post excerpt." });
    const { getByText } = render(<FeaturedPost post={post} />);

    expect(getByText("This is a great post excerpt.")).toBeDefined();
  });

  it("does not render excerpt paragraph when excerpt is absent", () => {
    const post = makePost({ excerpt: undefined });
    const { container } = render(<FeaturedPost post={post} />);

    const paragraph = container.querySelector("p");
    expect(paragraph).toBeNull();
  });

  it("does not render reading time even when provided", () => {
    const post = makePost({ readingTime: 7 });
    const { container } = render(<FeaturedPost post={post} />);

    expect(container.textContent).not.toContain("7 min read");
  });

  it("omits reading time when not provided", () => {
    const post = makePost({ readingTime: undefined });
    const { container } = render(<FeaturedPost post={post} />);

    expect(container.textContent).not.toContain("min read");
  });
});
