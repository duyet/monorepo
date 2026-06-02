import {
  Eyebrow,
  Reveal,
  SecHead,
} from "@duyet/components";
import { useMemo, useState, type ReactElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  getPostsByAllYear,
} from "@/lib/posts";
import { getShortforms } from "@/lib/shortforms";
import type { Shortform } from "@/lib/shortforms";
import { distanceToNow } from "@duyet/libs/date";
import { FeaturedPost } from "@/components/home/FeaturedPost";
import { CategoryBentoTile } from "@/components/home/CategoryBentoTile";
import { PostList } from "@/components/home/PostList";

// ---------------------------------------------------------------------------
// Route & loader
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
// Blog intro text
// ---------------------------------------------------------------------------
const BLOG_INTRO =
  "Notes on data engineering, distributed systems, Rust, and — lately — AI agents. I've been writing here since 2015; some posts are reference docs I keep coming back to, others are thinking out loud.";

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------
function HomePage(): ReactElement {
  const { postsByYear, shortforms } = Route.useLoaderData() as {
    postsByYear: Record<string, any[]>;
    shortforms: Shortform[];
  };

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

      {/* ── Browse by category ─────────────────────────────────────── */}
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

      {/* ── Quick Notes ────────────────────────────────────────────── */}
      {shortforms && shortforms.length > 0 && (
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] border-t">
          <div className="flex justify-between items-baseline mb-8">
            <SecHead eyebrow="Notes" title="Quick Thoughts" />
            <Link
              to="/notes/"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              View all notes →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shortforms.map((note) => (
              <article
                key={note.id}
                className="relative group flex flex-col justify-between p-6 bg-card border rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-foreground/30 transition-all duration-300 ease-out"
              >
                <Link
                  to="/note/$id/"
                  params={{ id: note.id }}
                  className="absolute inset-0 z-10"
                  aria-label={note.title || note.excerpt}
                />
                <div>
                  <time className="text-[11px] font-mono text-muted-foreground">
                    {distanceToNow(note.date)}
                  </time>
                  {note.title && (
                    <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {note.title}
                    </h3>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {note.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t flex justify-end relative z-20">
                  <span className="text-[11px] font-semibold text-primary group-hover:underline flex items-center gap-0.5">
                    Read note
                    <svg
                      className="w-3 h-3 transition-transform duration-200 transform group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent posts ─────────────────────────────────────────────── */}
      <PostList
        filteredPosts={filteredPosts}
        activeCategory={activeCategory}
        categories={categories}
        setActiveCategory={setActiveCategory}
        totalPosts={totalPosts}
      />
    </div>
  );
}
