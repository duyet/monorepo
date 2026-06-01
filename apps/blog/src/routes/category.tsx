import type { CategoryCount, Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { type ReactElement, useMemo, useState } from "react";
import { PostCard } from "@/components/post/PostCard";
import { getAllCategories, getAllPosts } from "@/lib/posts";

export const Route = createFileRoute("/category")({
  head: () => ({
    meta: [
      { title: "Categories | Tôi là Duyệt" },
      { name: "description", content: "Browse posts by category." },
    ],
  }),
  loader: async () => {
    const [categories, posts] = await Promise.all([
      getAllCategories(),
      getAllPosts(),
    ]);
    return { categories, posts };
  },
  component: Categories,
});

type SortOrder = "newest" | "oldest";
type ViewMode = "grid" | "list";

function Categories(): ReactElement {
  const hasChild = useMatches().some(
    (match) => match.routeId === "/category/$category"
  );
  if (hasChild) return <Outlet />;

  const { categories, posts } = Route.useLoaderData() as {
    categories: CategoryCount;
    posts: Post[];
  };

  const [active, setActive] = useState<string>("All");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [view, setView] = useState<ViewMode>("grid");

  const tabs = useMemo(
    () =>
      Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .map(([name]) => name),
    [categories]
  );

  const visiblePosts = useMemo(() => {
    const filtered =
      active === "All"
        ? posts
        : posts.filter((post) => post.category === active);
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sort === "newest" ? -diff : diff;
    });
  }, [posts, active, sort]);

  const tabClass = (name: string): string =>
    name === active
      ? "text-[var(--rd-text)] font-semibold"
      : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]";

  return (
    <div className="px-4 sm:px-6 md:px-8 max-w-[var(--rd-maxw)] mx-auto">
      <header style={{ marginBottom: 28 }}>
        <p
          className="font-[var(--font-mono)] text-[var(--rd-text-3)]"
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Index
        </p>
        <h1
          className="rd-display"
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            marginTop: 8,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            fontWeight: 600,
          }}
        >
          Categories
        </h1>
        <p
          className="text-[var(--rd-text-2)]"
          style={{ marginTop: 10, fontSize: 14 }}
        >
          {tabs.length} categories across {posts.length} posts.
        </p>
      </header>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-[var(--rd-surface)] border-b border-[var(--rd-border)] py-3 mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: category tabs */}
        <nav
          aria-label="Filter posts by category"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 font-[var(--font-mono)]"
          style={{ fontSize: 13 }}
        >
          <button
            type="button"
            aria-pressed={active === "All"}
            onClick={() => setActive("All")}
            className={`transition-colors ${tabClass("All")}`}
          >
            All
          </button>
          {tabs.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={name === active}
              onClick={() => setActive(name)}
              className={`transition-colors ${tabClass(name)}`}
            >
              {name}
            </button>
          ))}
        </nav>

        {/* Right: controls */}
        <div
          className="flex items-center gap-2 font-[var(--font-mono)] text-[var(--rd-text-2)]"
          style={{ fontSize: 12 }}
        >
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--rd-border)] hover:text-[var(--rd-text)] transition-colors"
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            <span>Filter</span>
          </button>

          <button
            type="button"
            aria-label={`Sort by ${sort === "newest" ? "oldest" : "newest"} first`}
            onClick={() =>
              setSort((s) => (s === "newest" ? "oldest" : "newest"))
            }
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--rd-border)] hover:text-[var(--rd-text)] transition-colors"
          >
            <span>Sort</span>
            <ChevronDown
              size={14}
              aria-hidden="true"
              style={{
                transform: sort === "oldest" ? "rotate(180deg)" : "none",
                transition: "transform 0.15s",
              }}
            />
          </button>

          <div className="flex items-center border border-[var(--rd-border)]">
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={`flex items-center justify-center p-1.5 transition-colors ${
                view === "grid"
                  ? "text-[var(--rd-text)]"
                  : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
              }`}
            >
              <LayoutGrid size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={`flex items-center justify-center p-1.5 border-l border-[var(--rd-border)] transition-colors ${
                view === "list"
                  ? "text-[var(--rd-text)]"
                  : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
              }`}
            >
              <List size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Posts */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col">
          {visiblePosts.map((post) => {
            const [, year, month, slug] = post.slug.split("/");
            return (
              <li key={post.slug}>
                <Link
                  to="/$year/$month/$slug/"
                  params={{ year, month, slug }}
                  className="flex flex-col gap-1 py-3 border-b border-[var(--rd-border)] sm:flex-row sm:items-baseline sm:gap-4 group"
                >
                  <time
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] shrink-0"
                    style={{ fontSize: 12, minWidth: 96 }}
                  >
                    {dateFormat(post.date, "MMM d, yyyy")}
                  </time>
                  <span
                    className="text-[var(--rd-text)] group-hover:underline"
                    style={{ fontSize: 15, fontWeight: 500 }}
                  >
                    {post.title}
                  </span>
                  <span
                    className="font-[var(--font-mono)] text-[var(--rd-text-3)] sm:ml-auto shrink-0"
                    style={{ fontSize: 12 }}
                  >
                    {post.category}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
