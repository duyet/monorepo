import {
  Eyebrow,
  Reveal,
  SecHead,
} from "@duyet/components";
import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Code,
  Cpu,
  Database,
  FolderKanban,
  GitBranch,
  Newspaper,
  Server,
  Wrench,
  Zap,
} from "lucide-react";
import { useMemo, useState, type ReactElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  getPostsByAllYear,
} from "@/lib/posts";
import { getShortforms } from "@/lib/shortforms";

// ---------------------------------------------------------------------------
// Route & loader (unchanged data contract; added tags + series)
// ---------------------------------------------------------------------------
export const Route = createFileRoute("/")({
  loader: async () => {
    const [postsByYear, shortforms] = await Promise.all([
      getPostsByAllYear(),
      Promise.resolve(getShortforms(3)),
    ]);
    return { postsByYear, shortforms };
  },
  component: HomePage,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function formatPostDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return dateFormat(d, "MMM d, yyyy");
}

// ---------------------------------------------------------------------------
// Category icon mapping (lucide-react)
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Record<string, typeof Database> = {
  Data: Database,
  "Data Engineering": Database,
  Rust: Cpu,
  AI: Bot,
  "Machine Learning": Bot,
  Web: Code,
  Javascript: Code,
  Kubernetes: Server,
  Infrastructure: Server,
  Linux: Server,
  Airflow: GitBranch,
  Git: GitBranch,
  Story: BookOpen,
  News: Newspaper,
  Project: FolderKanban,
  Productivity: Zap,
  "Software Engineering": Wrench,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? BookOpen;
}

import { yearColor } from "@/lib/colors";

// ---------------------------------------------------------------------------
// Blog intro text
// ---------------------------------------------------------------------------
const BLOG_INTRO =
  "Notes on data engineering, distributed systems, Rust, and — lately — AI agents. I've been writing here since 2015; some posts are reference docs I keep coming back to, others are thinking out loud.";

// ---------------------------------------------------------------------------
// Category filter chip
// ---------------------------------------------------------------------------
function CatChip({
  name,
  count,
  active,
  onClick,
}: {
  name: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`rd-chip rd-chip-btn ${active ? "rd-on" : ""}`}
      onClick={onClick}
    >
      {name}
      {count != null && (
        <span className="opacity-[0.55] ml-[2px]">{count}</span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Featured post card (terminal block + post details)
// ---------------------------------------------------------------------------
function FeaturedPost({ post }: { post: Post }) {
  const code = `npm i ${post.category_slug}`;

  return (
    <Link
      to="/$year/$month/$slug/"
      params={postParams(post)}
      className="rd-card overflow-hidden grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
    >
      {/* Terminal block */}
      <div
        className="rd-termblock py-[30px] px-[32px] flex flex-col min-h-[260px]"
      >
        <div className="flex gap-[7px]">
          <i />
          <i />
          <i />
        </div>
        <div
          className="font-[var(--font-mono)] mt-auto text-[clamp(20px,2.4vw,30px)] text-[var(--rd-accent)]"
        >
          <span className="opacity-[0.55]">$</span> {code}
          <span className="rd-caret" />
        </div>
        <div
          className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs mt-[18px]"
        />
      </div>

      {/* Post details */}
      <div
        className="p-[clamp(26px,3vw,38px)] flex flex-col justify-center"
      >
        <div
          className="flex gap-[10px] items-center mb-4"
        >
          <span className="rd-chip font-[var(--font-mono)] text-[10.5px]">
            {post.category}
          </span>
          <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
            {formatPostDate(post.date)} &middot;{" "}
            {Math.max(1, Math.round(post.readingTime ?? 1))} min
          </span>
        </div>
        <h2
          className="text-[clamp(1.5rem,2.6vw,2rem)] tracking-[-0.035em] leading-[1.08]"
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p
            className="text-[var(--rd-text-2)] mt-[14px] text-[15.5px] max-w-[44ch]"
          >
            {post.excerpt}
          </p>
        )}
        <div
          className="mt-[22px] flex items-center gap-2 text-[var(--rd-accent-ink)] text-sm font-[550]"
        >
          Read the post <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Category bento tile
// ---------------------------------------------------------------------------
function CategoryBentoTile({
  name,
  count,
  onSelect,
}: {
  name: string;
  count: number;
  onSelect: () => void;
}) {
  const Ic = getCategoryIcon(name);

  return (
    <button
      type="button"
      className="rd-card flex items-center gap-3 text-left cursor-pointer px-4 py-3"
      onClick={onSelect}
    >
      <span className="rd-cat-ic">
        <Ic size={15} />
      </span>
      <span className="font-semibold text-sm tracking-[-0.01em]">{name}</span>
      <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] ml-auto">{count}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------
function HomePage(): ReactElement {
  const { postsByYear } = Route.useLoaderData();

  const years = useMemo(
    () =>
      Object.keys(postsByYear)
        .map((y) => Number.parseInt(y, 10))
        .sort((a, b) => b - a),
    [postsByYear],
  );

  const allPosts = useMemo(
    () =>
      years.flatMap((y) =>
        [...postsByYear[y]].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      ),
    [years, postsByYear],
  );

  const featured = allPosts[0];

  // Derive categories + counts dynamically from the loaded posts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allPosts) {
      const c = p.category;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [allPosts]);

  

  // Stats
  const totalPosts = allPosts.length;
  const totalYears = years.length;
  const sinceYear = years[years.length - 1];

  // Category filter state
  const [activeCategory, setActiveCategory] = useState("All");

  // Filtered posts for the list
  const filteredPosts = useMemo(() => {
    return activeCategory === "All"
      ? allPosts
      : allPosts.filter((p) => p.category === activeCategory);
  }, [allPosts, activeCategory]);

  return (
    <div>
      {/* ── Blog header ─────────────────────────────────────────────── */}
      <section
        className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(44px,6vw,76px)] pb-[clamp(28px,4vw,44px)]"
      >
        <Eyebrow>BLOG &middot; blog.duyet.net</Eyebrow>
        <h1
          className="rd-display text-[clamp(2.4rem,5.5vw,4rem)] mt-5"
        >
          Notes, mostly on data &amp; agents.
        </h1>
        <p
          className="rd-lead mt-[22px] max-w-[64ch] text-[clamp(1.02rem,1.4vw,1.18rem)]"
        >
          {BLOG_INTRO}
        </p>
        <div
          className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[13px] mt-[22px] flex gap-5 flex-wrap"
        >
          <span>
            <strong className="text-[var(--rd-text)]">{totalPosts}</strong>{" "}
            posts
          </span>
          <span>
            <strong className="text-[var(--rd-text)]">{totalYears}</strong>{" "}
            years
          </span>
          <span>since {sinceYear}</span>
          <Link to="/archives/" className="rd-ulink cursor-pointer">archive</Link>
          <Link to="/series/" className="rd-ulink cursor-pointer">series</Link>
          <Link to="/tags/" className="rd-ulink cursor-pointer">tags</Link>
        </div>
      </section>

      {/* ── Featured post ────────────────────────────────────────────── */}
      {featured && (
        <section
          className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] pt-0"
        >
          <Reveal>
            <FeaturedPost post={featured} />
          </Reveal>
        </section>
      )}

      {/* ── Browse by category — compact grid ─────────────────────── */}
      <section id="topics" className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
        <SecHead eyebrow="Topics" title="Browse by category" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {categories.map((cat) => (
            <CategoryBentoTile
              key={cat.name}
              name={cat.name}
              count={cat.count}
              onSelect={() => {
                setActiveCategory(cat.name);
                setTimeout(() => {
                  document
                    .getElementById("latest")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 30);
              }}
            />
          ))}
        </div>
      </section>


      {/* ── Recent posts ─────────────────────────────────────────────── */}
      <section
        id="latest"
        className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]"
      >
        <div className="rd-sechead">
          <div>
            <Eyebrow>Latest</Eyebrow>
            <h2 className="rd-h-sec mt-3">
              Recent posts
            </h2>
          </div>
        </div>

        {/* Category filter chips */}
        <div
          className="flex gap-2 flex-wrap mb-[18px]"
        >
          <CatChip
            name="All"
            active={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
          />
          {categories.map((cat) => (
            <CatChip
              key={cat.name}
              name={cat.name}
              count={cat.count}
              active={activeCategory === cat.name}
              onClick={() => setActiveCategory(cat.name)}
            />
          ))}
        </div>

        {/* Post rows */}
        <div className="rd-rows">
          {filteredPosts.map((post) => {
            const tokens = post.tokenCount || Math.round((post.readingTime ?? 1) * 200);
            const tokenLabel = tokens >= 1000
              ? `${(tokens / 1000).toFixed(1)}k`
              : tokens;
            return (
              <Link
                key={post.slug}
                to="/$year/$month/$slug/"
                params={postParams(post)}
                className="rd-row cursor-pointer no-underline text-inherit"
                style={{ gridTemplateColumns: "auto 1fr auto" }}
              >
                <span
                  className="font-[var(--font-mono)] text-base font-bold leading-none shrink-0"
                  style={{ color: yearColor(new Date(post.date).getFullYear()) }}
                >
                  {new Date(post.date).getFullYear()}
                </span>
                <span className="truncate">
                  <span className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight">
                    {post.title}
                  </span>
                  {post.excerpt && (
                    <>
                      <span className="text-[var(--rd-text-3)] mx-1.5">—</span>
                      <span className="text-[var(--rd-text-2)] text-[13px]">{post.excerpt}</span>
                    </>
                  )}
                </span>
                <span className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="rd-tag-pill text-[10.5px] !py-[1px] !px-1.5">
                    {post.category}
                  </span>
                  <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px] w-[52px] text-right">
                    {tokenLabel} tok
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Archive link */}
        <Link
          to="/archives/"
          className="rd-btn rd-btn-ghost mt-[26px]"
        >
          See all {totalPosts} posts <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
