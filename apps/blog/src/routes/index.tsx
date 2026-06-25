import {
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
import { PostList } from "@/components/home/PostList";

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
          <Reveal>
            <FeaturedPost post={featured} />
          </Reveal>
        </section>
      )}

      {/* ── Quick Notes ────────────────────────────────────────────── */}
      {shortforms && shortforms.length > 0 && (
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(32px,4vw,52px)] border-t">
          <div className="flex justify-between items-baseline mb-5">
            <SecHead eyebrow="Notes" title="Quick Thoughts" />
            <Link
              to="/notes/"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              View all notes →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-visible border border-[var(--rd-border)] bg-[var(--rd-border)] md:grid-cols-3">
            {shortforms.map((note, index) => {
              const isFeatured = index === 0

              return (
                <Link
                  key={note.id}
                  to="/note/$id/"
                  params={{ id: note.id }}
                  className={`group/bento relative flex flex-col overflow-hidden bg-[var(--rd-bg)] p-5 no-underline transition-colors hover:bg-[var(--rd-surface-1)] ${
                    isFeatured ? 'md:col-span-3' : ''
                  }`}
                >
                  {/* Corner decorations on featured card */}
                  {isFeatured && (
                    <>
                      <div
                        className="pointer-events-none absolute z-30 bg-[var(--rd-bg)]"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '1px solid var(--rd-border)',
                          borderRadius: '3px',
                          left: '-7px',
                          top: '-7px',
                        }}
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute z-30 bg-[var(--rd-bg)]"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '1px solid var(--rd-border)',
                          borderRadius: '3px',
                          right: '-7px',
                          top: '-7px',
                        }}
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute z-30 bg-[var(--rd-bg)]"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '1px solid var(--rd-border)',
                          borderRadius: '3px',
                          left: '-7px',
                          bottom: '-7px',
                        }}
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute z-30 bg-[var(--rd-bg)]"
                        style={{
                          width: '14px',
                          height: '14px',
                          border: '1px solid var(--rd-border)',
                          borderRadius: '3px',
                          right: '-7px',
                          bottom: '-7px',
                        }}
                        aria-hidden="true"
                      />
                    </>
                  )}

                  <div className="mb-3 flex items-center justify-between">
                    <time className="text-[var(--rd-text-3)] font-mono text-xs tabular-nums">
                      {distanceToNow(note.date)}
                    </time>
                    {note.tags?.[0] && (
                      <span className="text-[var(--rd-accent-ink)] font-mono text-xs tracking-widest uppercase">
                        {note.tags[0]}
                      </span>
                    )}
                  </div>

                  <div className="mb-4 flex-1">
                    <h3 className="text-[var(--rd-text)] mb-2 text-base font-medium leading-snug">
                      {note.title || note.excerpt}
                    </h3>
                    {note.title && (
                      <p className="text-[var(--rd-text-2)] line-clamp-2 text-sm leading-relaxed">
                        {note.excerpt}
                      </p>
                    )}
                  </div>

                  <span className="text-[var(--rd-text-3)] inline-flex w-fit items-center gap-2 text-sm font-medium underline-offset-4 group-focus-within/bento:underline group-hover/bento:underline">
                    {note.title ? 'Read note' : 'View more'}
                    <svg
                      className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover/bento:translate-x-0.5"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </Link>
              )
            })}
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
