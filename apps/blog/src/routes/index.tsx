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

// Distinct color per year — cycles through a curated palette
const YEAR_COLORS = [
  "var(--rd-accent)",     // orange
  "#6366f1",              // indigo
  "#0ea5e9",              // sky
  "#8b5cf6",              // violet
  "#10b981",              // emerald
  "#f59e0b",              // amber
  "#ec4899",              // pink
  "#14b8a6",              // teal
  "#ef4444",              // red
  "#84cc16",              // lime
];

function yearColor(year: number): string {
  const idx = (year - 2015) % YEAR_COLORS.length;
  return YEAR_COLORS[Math.abs(idx)] ?? YEAR_COLORS[0];
}

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
      className="rd-card rd-card-hover overflow-hidden grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
    >
      {/* Terminal block */}
      <div
        className="rd-termblock py-[30px] px-[32px] flex flex-col min-h-[260px]"
      >
        <div className="rd-term-dots">
          <i />
          <i />
          <i />
        </div>
        <div
          className="rd-mono mt-auto text-[clamp(20px,2.4vw,30px)] text-[var(--rd-accent)]"
        >
          <span className="opacity-[0.55]">$</span> {code}
          <span className="rd-caret" />
        </div>
        <div
          className="rd-mono rd-dim text-xs mt-[18px]"
        />
      </div>

      {/* Post details */}
      <div
        className="p-[clamp(26px,3vw,38px)] flex flex-col justify-center"
      >
        <div
          className="flex gap-[10px] items-center mb-4"
        >
          <span className="rd-chip rd-mono text-[10.5px]">
            {post.category}
          </span>
          <span className="rd-mono rd-dim text-xs">
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
            className="rd-muted mt-[14px] text-[15.5px] max-w-[44ch]"
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
      className="rd-card rd-card-hover flex items-center gap-3 text-left cursor-pointer px-4 py-3"
      onClick={onSelect}
    >
      <span className="rd-cat-ic">
        <Ic size={15} />
      </span>
      <span className="font-semibold text-sm tracking-[-0.01em]">{name}</span>
      <span className="rd-mono rd-dim text-[11px] ml-auto">{count}</span>
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

  // Filtered posts for the list (exclude featured from the top)
  const filteredPosts = useMemo(() => {
    const posts =
      activeCategory === "All"
        ? allPosts
        : allPosts.filter((p) => p.category === activeCategory);
    return posts.filter((p) => p.slug !== featured?.slug);
  }, [allPosts, activeCategory, featured?.slug]);

  return (
    <div>
      {/* ── Blog header ─────────────────────────────────────────────── */}
      <section
        className="rd-wrap pt-[clamp(44px,6vw,76px)] pb-[clamp(28px,4vw,44px)]"
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
          className="rd-mono rd-dim text-[13px] mt-[22px] flex gap-5 flex-wrap"
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
          className="rd-wrap rd-section-tight pt-0"
        >
          <Reveal>
            <FeaturedPost post={featured} />
          </Reveal>
        </section>
      )}

      {/* ── Browse by category — compact grid ─────────────────────── */}
      <section id="topics" className="rd-wrap rd-section-tight">
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
        className="rd-wrap rd-section-tight pb-[clamp(56px,8vw,96px)]"
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
            const tokens = post.tokenCount ?? 0;
            const tokenLabel = tokens >= 1000
              ? `${(tokens / 1000).toFixed(1)}k`
              : tokens;
            const tags = post.tags?.slice(0, 3) ?? [];
            return (
              <Link
                key={post.slug}
                to="/$year/$month/$slug/"
                params={postParams(post)}
                className="rd-row-extended cursor-pointer no-underline text-inherit py-3"
              >
                <div className="flex gap-3.5 items-baseline">
                  <span
                    className="rd-mono text-xl font-bold leading-none shrink-0 w-[52px]"
                    style={{ color: yearColor(new Date(post.date).getFullYear()) }}
                  >
                    {new Date(post.date).getFullYear()}
                  </span>
                  <span className="font-[550] text-[clamp(15px,1.5vw,17px)] tracking-tight leading-snug">
                    {post.title}
                  </span>
                </div>
                {post.excerpt && (
                  <p className="rd-muted mt-1.5 ml-[66px] text-[13px] leading-snug max-w-[60ch] truncate">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-1.5 ml-[66px] flex items-center gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <span key={tag} className="rd-tag-pill text-[11px] !py-[2px] !px-2">
                      <span className="rd-hash">#</span>{tag.toLowerCase()}
                    </span>
                  ))}
                  <span className="rd-mono rd-dim text-[11px]">
                    {tokenLabel} tokens
                  </span>
                </div>
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
