import type { Post } from "@duyet/interfaces";
import {
  afterEach,
  cleanup,
  describe,
  expect,
  it,
  render,
} from "../../../test-setup";
import { YearPost } from "../YearPost";

afterEach(cleanup);

function makePost(slug: string, title: string, date: Date = new Date("2024-06-15")): Post {
  return {
    slug,
    title,
    date,
    category: "Engineering",
    category_slug: "engineering",
    tags: [],
    tags_slug: [],
    featured: false,
  };
}

describe("YearPost", () => {
  it("returns null when posts array is empty", () => {
    const { container } = render(<YearPost year={2024} posts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a heading with the year", () => {
    const posts = [makePost("/2024/01/first-post", "First Post")];
    const { getByText } = render(<YearPost year={2024} posts={posts} />);
    expect(getByText("2024")).toBeDefined();
  });

  it("renders h2 element for the year heading", () => {
    const posts = [makePost("/2024/01/first-post", "First Post")];
    const { container } = render(<YearPost year={2024} posts={posts} />);
    const heading = container.querySelector("h2");
    expect(heading).toBeDefined();
    expect(heading?.textContent).toBe("2024");
  });

  it("renders all provided posts", () => {
    const posts = [
      makePost("/2024/01/post-one", "Post One"),
      makePost("/2024/02/post-two", "Post Two"),
      makePost("/2024/03/post-three", "Post Three"),
    ];
    const { getByText } = render(<YearPost year={2024} posts={posts} />);
    expect(getByText("Post One")).toBeDefined();
    expect(getByText("Post Two")).toBeDefined();
    expect(getByText("Post Three")).toBeDefined();
  });

  it("renders a link for each post", () => {
    const posts = [
      makePost("/2024/01/post-a", "Post A"),
      makePost("/2024/02/post-b", "Post B"),
    ];
    const { container } = render(<YearPost year={2024} posts={posts} />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(2);
  });

  it("renders formatted date for each post", () => {
    const posts = [
      makePost("/2024/06/summer-post", "Summer Post", new Date("2024-06-15")),
    ];
    const { container } = render(<YearPost year={2024} posts={posts} />);
    const time = container.querySelector("time");
    expect(time).toBeDefined();
    // Date formatted as "MMM dd" e.g. "Jun 15"
    expect(time?.textContent).toMatch(/Jun/);
  });

  it("applies year-post-group class to the root div", () => {
    const posts = [makePost("/2024/01/test", "Test Post")];
    const { container } = render(<YearPost year={2024} posts={posts} />);
    const root = container.firstElementChild;
    expect(root?.className).toContain("year-post-group");
  });

  it("applies custom className alongside year-post-group", () => {
    const posts = [makePost("/2024/01/test", "Test Post")];
    const { container } = render(
      <YearPost year={2024} posts={posts} className="my-custom-class" />
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain("year-post-group");
    expect(root?.className).toContain("my-custom-class");
  });

  it("renders year-post-list wrapper around the links", () => {
    const posts = [makePost("/2024/01/list-test", "List Test")];
    const { container } = render(<YearPost year={2024} posts={posts} />);
    const list = container.querySelector(".year-post-list");
    expect(list).toBeDefined();
    expect(list).not.toBeNull();
  });

  it("each post link has year-post-row class", () => {
    const posts = [makePost("/2024/01/row-test", "Row Test")];
    const { container } = render(<YearPost year={2024} posts={posts} />);
    const row = container.querySelector(".year-post-row");
    expect(row).toBeDefined();
    expect(row).not.toBeNull();
  });

  it("each post title is wrapped in year-post-title div", () => {
    const posts = [makePost("/2024/01/title-test", "Title Test Post")];
    const { container } = render(<YearPost year={2024} posts={posts} />);
    const titleEl = container.querySelector(".year-post-title");
    expect(titleEl).toBeDefined();
    expect(titleEl?.textContent).toBe("Title Test Post");
  });

  it("renders correctly with a single post", () => {
    const posts = [makePost("/2023/12/solo", "Solo Post", new Date("2023-12-01"))];
    const { getByText } = render(<YearPost year={2023} posts={posts} />);
    expect(getByText("Solo Post")).toBeDefined();
    expect(getByText("2023")).toBeDefined();
  });

  it("uses different year values in heading", () => {
    const posts = [makePost("/2020/03/old-post", "Old Post", new Date("2020-03-05"))];
    const { getByText } = render(<YearPost year={2020} posts={posts} />);
    expect(getByText("2020")).toBeDefined();
  });

  it("does not render when posts is empty even with className provided", () => {
    const { container } = render(
      <YearPost year={2024} posts={[]} className="should-not-render" />
    );
    expect(container.firstChild).toBeNull();
  });
});