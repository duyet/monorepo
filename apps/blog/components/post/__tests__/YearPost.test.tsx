import type { Post } from "@duyet/interfaces";
import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  mock,
  render,
} from "../../../test-setup";

mock.module("@tanstack/react-router", () => ({
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

const { YearPost } = await import("../YearPost");

afterEach(cleanup);

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    slug: "/2024/01/test-post",
    title: "Test Post",
    date: new Date("2024-06-15"),
    category: "Engineering",
    category_slug: "engineering",
    tags: [],
    tags_slug: [],
    featured: false,
    ...overrides,
  };
}

describe("YearPost", () => {
  it("returns null when posts array is empty", () => {
    const { container } = render(<YearPost year={2024} posts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders year heading and post titles", () => {
    const posts = [
      makePost({ slug: "/2024/01/post-one", title: "Post One" }),
      makePost({ slug: "/2024/02/post-two", title: "Post Two" }),
    ];

    const { getByText } = render(<YearPost year={2024} posts={posts} />);
    expect(getByText("2024")).toBeDefined();
    expect(getByText("Post One")).toBeDefined();
    expect(getByText("Post Two")).toBeDefined();
  });

  it("renders one link per post with route params resolved", () => {
    const posts = [
      makePost({ slug: "/2024/01/post-one", title: "Post One" }),
      makePost({ slug: "/2024/02/post-two", title: "Post Two" }),
    ];

    const { container } = render(<YearPost year={2024} posts={posts} />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(2);
    expect(links[0]?.getAttribute("href")).toBe("/2024/01/post-one/");
    expect(links[1]?.getAttribute("href")).toBe("/2024/02/post-two/");
  });

  it("renders formatted date text", () => {
    const posts = [
      makePost({ slug: "/2024/06/summer-post", title: "Summer Post" }),
    ];

    const { container } = render(<YearPost year={2024} posts={posts} />);
    const time = container.querySelector("time");
    expect(time).not.toBeNull();
    expect(time?.textContent).toMatch(/Jun/);
  });

  it("applies custom className to the root wrapper", () => {
    const posts = [makePost()];
    const { container } = render(
      <YearPost year={2024} posts={posts} className="my-custom-class" />
    );

    const root = container.firstElementChild;
    expect(root?.className).toContain("my-custom-class");
  });
});
