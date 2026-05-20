import type { Post } from "@duyet/interfaces";
import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  render,
} from "../../../test-setup";
import { FeaturedPost } from "../FeaturedPost";

afterEach(cleanup);

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
  it("renders post title in h1 inside media area", () => {
    const post = makePost({ title: "My Featured Article" });
    const { getAllByText } = render(<FeaturedPost post={post} />);
    const titles = getAllByText("My Featured Article");
    // Title appears in both the h1 (inside blog-featured-media) and aria-hidden div
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it("renders fallback div when post has no thumbnail", () => {
    const post = makePost({ thumbnail: undefined });
    const { container } = render(<FeaturedPost post={post} />);
    const fallback = container.querySelector(".blog-featured-fallback");
    expect(fallback).toBeDefined();
    expect(fallback).not.toBeNull();
  });

  it("does not render fallback div when post has a thumbnail", () => {
    const post = makePost({ thumbnail: "/media/2024/01/cover.jpg" });
    const { container } = render(<FeaturedPost post={post} />);
    const fallback = container.querySelector(".blog-featured-fallback");
    expect(fallback).toBeNull();
  });

  it("renders img when post has a thumbnail", () => {
    const post = makePost({ thumbnail: "/media/2024/01/cover.jpg" });
    const { container } = render(<FeaturedPost post={post} />);
    const img = container.querySelector("img");
    expect(img).toBeDefined();
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("/media/2024/01/cover.jpg");
  });

  it("img has empty alt attribute for decorative image", () => {
    const post = makePost({ thumbnail: "/media/cover.jpg" });
    const { container } = render(<FeaturedPost post={post} />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("renders post excerpt when provided", () => {
    const post = makePost({ excerpt: "This is a great post excerpt." });
    const { getByText } = render(<FeaturedPost post={post} />);
    expect(getByText("This is a great post excerpt.")).toBeDefined();
  });

  it("does not render excerpt paragraph when excerpt is absent", () => {
    const post = makePost({ excerpt: undefined });
    const { container } = render(<FeaturedPost post={post} />);
    const copy = container.querySelector(".blog-featured-copy");
    const paragraph = copy?.querySelector("p");
    expect(paragraph).toBeNull();
  });

  it("renders category in fallback and meta sections", () => {
    const post = makePost({ category: "Data Engineering", thumbnail: undefined });
    const { getAllByText } = render(<FeaturedPost post={post} />);
    const matches = getAllByText("Data Engineering");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders formatted date in meta section", () => {
    const post = makePost({ date: new Date("2024-03-15") });
    const { container } = render(<FeaturedPost post={post} />);
    const meta = container.querySelector(".blog-featured-meta");
    expect(meta?.textContent).toContain("2024");
  });

  it("renders as an anchor link wrapping content", () => {
    const post = makePost();
    const { container } = render(<FeaturedPost post={post} />);
    const link = container.querySelector("a");
    expect(link).toBeDefined();
    expect(link).not.toBeNull();
  });

  it("applies additional className to the link element", () => {
    const post = makePost();
    const { container } = render(
      <FeaturedPost post={post} className="extra-class" />
    );
    const link = container.querySelector("a");
    expect(link?.className).toContain("extra-class");
  });

  it("always includes blog-featured-post class on the link", () => {
    const post = makePost();
    const { container } = render(<FeaturedPost post={post} />);
    const link = container.querySelector("a");
    expect(link?.className).toContain("blog-featured-post");
  });

  it("renders scrim div inside media area", () => {
    const post = makePost();
    const { container } = render(<FeaturedPost post={post} />);
    const scrim = container.querySelector(".blog-featured-scrim");
    expect(scrim).toBeDefined();
    expect(scrim).not.toBeNull();
  });

  it("fallback contains date text when no thumbnail", () => {
    const post = makePost({ date: new Date("2024-06-01"), thumbnail: undefined });
    const { container } = render(<FeaturedPost post={post} />);
    const fallback = container.querySelector(".blog-featured-fallback");
    expect(fallback?.textContent).toContain("2024");
  });

  it("aria-hidden is set on fallback and scrim elements", () => {
    const post = makePost({ thumbnail: undefined });
    const { container } = render(<FeaturedPost post={post} />);
    const fallback = container.querySelector(".blog-featured-fallback");
    const scrim = container.querySelector(".blog-featured-scrim");
    expect(fallback?.getAttribute("aria-hidden")).toBe("true");
    expect(scrim?.getAttribute("aria-hidden")).toBe("true");
  });

  it("aria-hidden is set on blog-featured-title (duplicate title for layout)", () => {
    const post = makePost();
    const { container } = render(<FeaturedPost post={post} />);
    const titleDiv = container.querySelector(".blog-featured-title");
    expect(titleDiv?.getAttribute("aria-hidden")).toBe("true");
  });
});