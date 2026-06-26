import { SecHead } from "@duyet/components";
import { useMemo, useState, type ReactElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  getPostsByAllYear,
} from "@/lib/posts";
import { getShortforms } from "@/lib/shortforms";
import type { Shortform } from "@/lib/shortforms";
import { FeaturedPost } from "@/components/home/FeaturedPost";
import { PostList } from "@/components/home/PostList";
import { NoteCard } from "@/components/blog/NoteCard";

// ---------------------------------------------------------------------------
// Route & loader
// ---------------------------------------------------------------------------
export const Route = createFileRoute("/")({
  loader: async () => {
    const [postsByYear, shortforms] = await Promise.all([
      getPostsByAllYear(),
      Promise.resolve(getShortforms(4)),
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

  // Chaptered posts: top-level drives the flat listing; children nest under
  // their parent in the Recent posts tree and are excluded from flat views.
  const { topLevel, childrenByParent } = useMemo(() => {
    const children = allPosts.filter((p) => p.parent);
    const map: Record<string, typeof allPosts> = {};
    for (const child of children) {
      const parentSlug = child.parent as string;
      if (!map[parentSlug]) map[parentSlug] = [];
      map[parentSlug].push(child);
    }
    // Order each parent's children by the parent's `parts:` array.
    const parentParts: Record<string, string[] | undefined> = {};
    for (const p of allPosts) {
      if (p.parts?.length) parentParts[p.slug] = p.parts;
    }
    for (const [parentSlug, list] of Object.entries(map)) {
      const order = parentParts[parentSlug];
      if (order && order.length > 0) {
        list.sort((a, b) => {
          const ta = a.slug.split("/").pop() ?? "";
          const tb = b.slug.split("/").pop() ?? "";
          const ra = order.indexOf(ta);
          const rb = order.indexOf(tb);
          if (ra === -1 && rb === -1) {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          const indexA = ra === -1 ? Number.MAX_SAFE_INTEGER : ra;
          const indexB = rb === -1 ? Number.MAX_SAFE_INTEGER : rb;
          return indexA - indexB;
        });
      } else {
        list.sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      }
    }
    return {
      topLevel: allPosts.filter((p) => !p.parent),
      childrenByParent: map,
    };
  }, [allPosts]);

  const featured = topLevel[0];

  // Derive categories + counts dynamically from the loaded posts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of topLevel) {
      const c = p.category;
      counts[c] = (counts[c] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [topLevel]);



  // Stats
  const totalPosts = topLevel.length;
  const totalYears = years.length;
  const sinceYear = years[years.length - 1];

  // Category filter state
  const [activeCategory, setActiveCategory] = useState("All");

  // Filtered posts for the list
  const filteredPosts = useMemo(() => {
    return activeCategory === "All"
      ? topLevel
      : topLevel.filter((p) => p.category === activeCategory);
  }, [topLevel, activeCategory]);

  return (
    <div>
      {/* ── Blog header ─────────────────────────────────────────────── */}
      <section
        className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(32px,4.5vw,56px)] pb-[clamp(22px,3vw,36px)]"
      >
        <h1
          className="rd-display text-[clamp(2.4rem,5.5vw,4rem)]"
        >
          Notes, mostly on{" "}
          <span className="text-[var(--rd-accent)]">data &amp; agents</span>.
        </h1>
        <p
          className="rd-lead mt-[16px] max-w-[64ch] text-[clamp(1.02rem,1.4vw,1.18rem)]"
        >
          {BLOG_INTRO}
        </p>
        <div
          className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[13px] mt-[16px] flex gap-5 flex-wrap"
        >
          <span>
            <strong className="text-[var(--rd-accent)]">{totalPosts}</strong>{" "}
            posts
          </span>
          <span>
            <strong className="text-[var(--rd-accent)]">{totalYears}</strong>{" "}
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
          <FeaturedPost post={featured} />
        </section>
      )}

      {/* ── Quick Notes ────────────────────────────────────────────── */}
      {shortforms && shortforms.length > 0 && (
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(32px,4vw,52px)] border-t">
          <div className="flex justify-between items-baseline mb-5 ml-0">
            <SecHead eyebrow="Notes" title="Quick Thoughts" />
            <Link
              to="/notes/"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              View all notes →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-visible border border-[var(--rd-border)] bg-[var(--rd-border)] md:grid-cols-3">
            {shortforms.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                featured={index === 0}
                Link={Link}
                padding="normal"
                headingLevel="h3"
                variant="homepage"
                showExcerpt
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Recent posts ─────────────────────────────────────────────── */}
      <PostList
        filteredPosts={filteredPosts}
        childrenByParent={childrenByParent}
        activeCategory={activeCategory}
        categories={categories}
        setActiveCategory={setActiveCategory}
        totalPosts={totalPosts}
      />
    </div>
  );
}
