import {
  Eyebrow,
  Reveal,
  SecHead,
} from "@duyet/components";
import type { Post, Series } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { dateFormat } from "@duyet/libs/date";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Code,
  Cpu,
  Database,
  FolderKanban,
  GitBranch,
  Layers,
  Newspaper,
  Server,
  Wrench,
  Zap,
} from "lucide-react";
import { useMemo, useState, type ReactElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  getAllSeries,
  getAllTags,
  getPostsByAllYear,
} from "@/lib/posts";
import { getShortforms } from "@/lib/shortforms";

// ---------------------------------------------------------------------------
// Route & loader (unchanged data contract; added tags + series)
// ---------------------------------------------------------------------------
export const Route = createFileRoute("/")({
  loader: async () => {
    const [postsByYear, shortforms, allTags, allSeries] = await Promise.all([
      getPostsByAllYear(),
      Promise.resolve(getShortforms(3)),
      getAllTags(),
      getAllSeries(),
    ]);
    return { postsByYear, shortforms, allTags, allSeries };
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
        <span style={{ opacity: 0.55, marginLeft: 2 }}>{count}</span>
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
      className="rd-card rd-card-hover"
      style={{
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
      }}
    >
      {/* Terminal block */}
      <div
        className="rd-termblock"
        style={{
          padding: "30px 32px",
          display: "flex",
          flexDirection: "column",
          minHeight: 260,
        }}
      >
        <div className="rd-term-dots">
          <i />
          <i />
          <i />
        </div>
        <div
          className="rd-mono"
          style={{
            marginTop: "auto",
            fontSize: "clamp(20px, 2.4vw, 30px)",
            color: "var(--rd-accent)",
          }}
        >
          <span style={{ opacity: 0.55 }}>$</span> {code}
          <span className="rd-caret" />
        </div>
        <div
          className="rd-mono rd-dim"
          style={{ fontSize: 12, marginTop: 18 }}
        />
      </div>

      {/* Post details */}
      <div
        style={{
          padding: "clamp(26px, 3vw, 38px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span className="rd-chip rd-mono" style={{ fontSize: 10.5 }}>
            {post.category}
          </span>
          <span className="rd-mono rd-dim" style={{ fontSize: 12 }}>
            {formatPostDate(post.date)} &middot;{" "}
            {Math.max(1, Math.round(post.readingTime ?? 1))} min
          </span>
        </div>
        <h2
          style={{
            fontSize: "clamp(1.5rem, 2.6vw, 2rem)",
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
          }}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p
            className="rd-muted"
            style={{ marginTop: 14, fontSize: 15.5, maxWidth: "44ch" }}
          >
            {post.excerpt}
          </p>
        )}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--rd-accent-ink)",
            fontSize: 14,
            fontWeight: 550,
          }}
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
  maxCount,
  samplePosts,
  isFeatured,
  isWide,
  onSelect,
}: {
  name: string;
  count: number;
  maxCount: number;
  samplePosts: Post[];
  isFeatured: boolean;
  isWide: boolean;
  onSelect: () => void;
}) {
  const Ic = getCategoryIcon(name);
  const meterPct = Math.round((count / maxCount) * 100);
  const tileClass = [
    "rd-card rd-card-hover rd-card-pad rd-cat-tile",
    isFeatured ? "rd-feat" : "",
    isWide ? "rd-wide" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={tileClass}
      onClick={onSelect}
      style={{ textAlign: "left" }}
    >
      <div className="rd-cat-head">
        <span className="rd-cat-ic">
          <Ic size={isFeatured ? 22 : 18} />
        </span>
        <span className="rd-rowarrow">
          <ArrowUpRight size={14} />
        </span>
      </div>

      <div
        className="rd-bigstat"
        style={{ marginTop: isFeatured ? 20 : 14 }}
      >
        {count}
      </div>
      <div style={{ fontWeight: 600, marginTop: 3 }}>{name}</div>

      {/* Proportional meter */}
      <div className="rd-cat-meter" style={{ marginTop: 14 }}>
        <i style={{ width: `${meterPct}%` }} />
      </div>

      {/* Sample post links — only for featured + wide tiles */}
      {(isFeatured || isWide) && samplePosts.length > 0 && (
        <div className="rd-cat-sample">
          {samplePosts.map((p) => (
            <Link
              key={p.slug}
              to="/$year/$month/$slug/"
              params={postParams(p)}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="rd-dot" />
              {p.title}
            </Link>
          ))}
        </div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Series card
// ---------------------------------------------------------------------------
function SeriesCard({ series }: { series: Series }) {
  const sorted = [...series.posts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const preview = sorted.slice(0, 3);

  return (
    <Link
      to="/series/$slug/"
      params={{ slug: series.slug }}
      className="rd-card rd-card-hover rd-series-card"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="rd-sc-top">
        <div className="rd-sc-ic">
          <Layers size={20} />
        </div>
        <div className="rd-sc-meta">
          <div className="rd-sc-name">{series.name}</div>
          <div className="rd-sc-count">
            {series.posts.length}{" "}
            {series.posts.length === 1 ? "post" : "posts"}
          </div>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="rd-sc-list">
          {preview.map((p, i) => (
            <Link
              key={p.slug}
              to="/$year/$month/$slug/"
              params={postParams(p)}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="rd-sn">{String(i + 1).padStart(2, "0")}</span>
              {p.title}
            </Link>
          ))}
        </div>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------
function HomePage(): ReactElement {
  const { postsByYear, allTags, allSeries } = Route.useLoaderData();

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

  // Per-category sample posts (latest 2)
  const categorySamples = useMemo(() => {
    const map: Record<string, Post[]> = {};
    for (const { name } of categories) {
      map[name] = allPosts
        .filter((p) => p.category === name)
        .slice(0, 2);
    }
    return map;
  }, [allPosts, categories]);

  const maxCatCount = categories[0]?.count ?? 1;

  // Stats
  const totalPosts = allPosts.length;
  const totalYears = years.length;
  const sinceYear = years[years.length - 1];

  // Top tags for cloud (max 30 by count)
  const topTags = useMemo(
    () =>
      Object.entries(allTags)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 30),
    [allTags],
  );

  // Series with at least 2 posts, sorted by count desc
  const featuredSeries = useMemo(
    () =>
      [...allSeries]
        .filter((s) => s.posts.length >= 2)
        .sort((a, b) => b.posts.length - a.posts.length)
        .slice(0, 4),
    [allSeries],
  );

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
        className="rd-wrap"
        style={{
          paddingTop: "clamp(44px, 6vw, 76px)",
          paddingBottom: "clamp(28px, 4vw, 44px)",
        }}
      >
        <Eyebrow>BLOG &middot; blog.duyet.net</Eyebrow>
        <h1
          className="rd-display"
          style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)", marginTop: 20 }}
        >
          Notes, mostly on data &amp; agents.
        </h1>
        <p
          className="rd-lead"
          style={{
            marginTop: 22,
            maxWidth: "64ch",
            fontSize: "clamp(1.02rem, 1.4vw, 1.18rem)",
          }}
        >
          {BLOG_INTRO}
        </p>
        <div
          className="rd-mono rd-dim"
          style={{
            fontSize: 13,
            marginTop: 22,
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <span>
            <strong style={{ color: "var(--rd-text)" }}>{totalPosts}</strong>{" "}
            posts
          </span>
          <span>
            <strong style={{ color: "var(--rd-text)" }}>{totalYears}</strong>{" "}
            years
          </span>
          <span>since {sinceYear}</span>
          <Link
            to="/archives/"
            className="rd-ulink"
            style={{ cursor: "pointer" }}
          >
            full archive &rarr;
          </Link>
        </div>
      </section>

      {/* ── Featured post ────────────────────────────────────────────── */}
      {featured && (
        <section
          className="rd-wrap rd-section-tight"
          style={{ paddingTop: 0 }}
        >
          <Reveal>
            <FeaturedPost post={featured} />
          </Reveal>
        </section>
      )}

      {/* ── Browse by category — bento grid ─────────────────────────── */}
      <section id="topics" className="rd-wrap rd-section-tight">
        <SecHead num="—" eyebrow="Topics" title="Browse by category" />
        <div className="rd-cat-bento">
          {categories.map((cat, i) => (
            <CategoryBentoTile
              key={cat.name}
              name={cat.name}
              count={cat.count}
              maxCount={maxCatCount}
              samplePosts={categorySamples[cat.name] ?? []}
              isFeatured={i === 0}
              isWide={i === 1}
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

      {/* ── Series ───────────────────────────────────────────────────── */}
      {featuredSeries.length > 0 && (
        <section className="rd-wrap rd-section-tight">
          <SecHead num="—" eyebrow="Reading paths" title="Series" />
          <div className="rd-series-grid">
            {featuredSeries.map((s) => (
              <SeriesCard key={s.slug} series={s} />
            ))}
          </div>
          <Link
            to="/series/"
            className="rd-btn rd-btn-ghost"
            style={{ marginTop: 20 }}
          >
            All series <ArrowRight size={16} />
          </Link>
        </section>
      )}

      {/* ── Tag cloud ────────────────────────────────────────────────── */}
      {topTags.length > 0 && (
        <section className="rd-wrap rd-section-tight">
          <SecHead num="—" eyebrow="Index" title="Tags" />
          <div className="rd-tag-cloud">
            {topTags.map(([tag, count]) => (
              <Link
                key={tag}
                to="/tag/$tag/"
                params={{ tag: getSlug(tag) }}
                className="rd-tag-pill"
              >
                <span className="rd-hash">#</span>
                {tag}
                <span className="rd-tc">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent posts ─────────────────────────────────────────────── */}
      <section
        id="latest"
        className="rd-wrap rd-section-tight"
        style={{ paddingBottom: "clamp(56px, 8vw, 96px)" }}
      >
        <div className="rd-sechead">
          <div>
            <Eyebrow>Latest</Eyebrow>
            <h2 className="rd-h-sec" style={{ marginTop: 12 }}>
              Recent posts
            </h2>
          </div>
        </div>

        {/* Category filter chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
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
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              to="/$year/$month/$slug/"
              params={postParams(post)}
              className="rd-row"
              style={{
                gridTemplateColumns: "auto 1fr auto auto",
                cursor: "pointer",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span
                className="rd-mono rd-dim"
                style={{ fontSize: 12.5, width: 46 }}
              >
                {new Date(post.date).getFullYear()}
              </span>
              <span
                style={{
                  fontWeight: 550,
                  fontSize: "clamp(15px, 1.6vw, 17px)",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {post.title}
              </span>
              <span className="rd-chip rd-mono" style={{ fontSize: 10.5 }}>
                {post.category}
              </span>
              <span
                className="rd-mono rd-dim"
                style={{ fontSize: 12, width: 56, textAlign: "right" }}
              >
                {Math.max(1, Math.round(post.readingTime ?? 1))} min
              </span>
            </Link>
          ))}
        </div>

        {/* Archive link */}
        <Link
          to="/archives/"
          className="rd-btn rd-btn-ghost"
          style={{ marginTop: 26 }}
        >
          See all {totalPosts} posts <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
