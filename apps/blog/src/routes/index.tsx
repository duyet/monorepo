import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { getPostsByAllYear } from "@/lib/posts";

export const Route = createFileRoute("/")({
  loader: async () => {
    const postsByYear = await getPostsByAllYear();
    return { postsByYear };
  },
  component: HomePage,
});

const WORDS_PER_MINUTE = 220;

function readingTime(post: Post): string {
  if (typeof post.readingTime === "number" && post.readingTime > 0) {
    return `${post.readingTime} min read`;
  }
  const raw = (post.content ?? post.excerpt ?? "") as string;
  const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function formatPostDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return dateFormat(d, "MMM d, yyyy");
}

function PostThumbnail({ post, size = "grid" }: { post: Post; size?: "hero" | "grid" }) {
  if (post.thumbnail) {
    return (
      <div className={`relative overflow-hidden w-full ${size === "hero" ? "aspect-[16/9] rounded-[24px]" : "aspect-[16/10] rounded-[16px]"} bg-neutral-100 dark:bg-neutral-900 border border-[color:var(--em-hairline)] group`}>
        <img
          src={post.thumbnail}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const getGlowStyles = (category: string, slug: string) => {
    const text = (category + slug).toLowerCase();
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 60) % 360;
    
    return {
      background: `radial-gradient(circle at 75% 25%, hsla(${h1}, 75%, 55%, 0.3) 0%, transparent 60%), radial-gradient(circle at 25% 75%, hsla(${h2}, 80%, 45%, 0.2) 0%, transparent 65%), #0c0c0e`,
      borderColor: `hsla(${h1}, 40%, 40%, 0.12)`
    };
  };

  const style = getGlowStyles(post.category || "Tech", post.slug);

  return (
    <div 
      className={`relative overflow-hidden w-full ${size === "hero" ? "aspect-[16/9] rounded-[24px]" : "aspect-[16/10] rounded-[16px]"} border border-[#1b1b1f] flex flex-col items-center justify-center p-6 group select-none transition-all duration-300`}
      style={{ background: style.background, borderColor: style.borderColor }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff02_1px,transparent_1px)] bg-[size:16px_16px] opacity-80" />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="px-5 py-2.5 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-[1.03]">
          <span className="font-mono text-xs md:text-sm font-bold tracking-widest text-white/90 uppercase">
            {post.category || "ENGINEERING"}
          </span>
        </div>
      </div>

      <span className="absolute bottom-3 right-4 font-mono text-[9px] text-white/20 select-none uppercase tracking-wider">
        sys {"//"} verified
      </span>
    </div>
  );
}

function HomePage(): ReactElement {
  const { postsByYear } = Route.useLoaderData();

  const allPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([, posts]) => posts);

  const featured = allPosts[0];
  const gridPosts = allPosts.slice(1, 5); // 4-column latest news grid
  const listPosts = allPosts.slice(5, 30); // Older posts row list

  return (
    <div className="mx-auto max-w-[1040px] px-6 py-8 md:py-16 md:px-8 selection:bg-[color:var(--em-foreground)] selection:text-[color:var(--em-background)]">
      {/* Hero featured post */}
      {featured && (
        <section className="mb-16 md:mb-24">
          <Link
            to="/$year/$month/$slug/"
            params={postParams(featured)}
            className="group grid grid-cols-1 lg:grid-cols-[1.1fr_1.5fr] gap-8 md:gap-12 items-center text-decoration-none text-inherit cursor-pointer"
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Latest post
                </span>
                <span className="text-xs font-mono text-[color:var(--em-muted)] ml-3">
                  {formatPostDate(featured.date)}
                </span>
              </div>

              <h1 className="display-tight text-3xl md:text-5xl text-[color:var(--em-foreground)] mt-6 group-hover:underline decoration-1 underline-offset-4">
                {featured.title}
              </h1>

              <p className="mt-4 text-sm md:text-base text-[color:var(--em-muted)] leading-relaxed font-light">
                {featured.excerpt || featured.snippet}
              </p>

              <span className="inline-flex items-center justify-center rounded-full bg-[color:var(--em-foreground)] text-[color:var(--em-background)] px-6 py-2.5 text-xs font-medium hover:opacity-95 hover:shadow-md transition-all mt-6 cursor-pointer gap-1">
                Read More
                <span className="font-mono">→</span>
              </span>
            </div>

            <div>
              <PostThumbnail post={featured} size="hero" />
            </div>
          </Link>
        </section>
      )}

      {/* Latest posts grid (4 columns, borderless) */}
      {gridPosts.length > 0 && (
        <section className="mb-20 md:mb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {gridPosts.map((post) => (
              <Link
                key={post.slug}
                to="/$year/$month/$slug/"
                params={postParams(post)}
                className="group flex flex-col text-decoration-none text-inherit cursor-pointer"
              >
                <PostThumbnail post={post} size="grid" />
                
                <p className="eyebrow-mono mt-4">
                  {formatPostDate(post.date)} · {readingTime(post)}
                </p>
                
                <h3 className="text-sm font-semibold tracking-tight text-[color:var(--em-foreground)] mt-2 group-hover:underline leading-snug">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All posts list */}
      <section className="border-t border-[color:var(--em-hairline)] pt-12 md:pt-16">
        <h2 className="display-tight text-2xl md:text-3xl text-[color:var(--em-foreground)] mb-8">
          All posts
        </h2>

        <div className="flex flex-col">
          {listPosts.map((post) => (
            <Link
              key={post.slug}
              to="/$year/$month/$slug/"
              params={postParams(post)}
              className="group grid grid-cols-1 md:grid-cols-[1fr_120px] gap-2 border-b border-[color:var(--em-hairline)] py-5 text-decoration-none text-inherit hover:bg-[color:var(--em-faint)] px-3 transition-colors duration-150 items-start cursor-pointer"
            >
              <div>
                <h3 className="text-sm md:text-base font-semibold text-[color:var(--em-foreground)] group-hover:underline leading-snug">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-[color:var(--em-muted)] leading-relaxed font-light mt-1 max-w-3xl">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <div className="md:text-right text-xs font-mono text-[color:var(--em-subtle)] md:pt-1">
                {formatPostDate(post.date)}
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            to="/archives/"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--em-hairline)] hover:border-[color:var(--em-foreground)] px-6 py-2.5 text-xs font-mono uppercase tracking-widest text-[color:var(--em-foreground)] hover:bg-[color:var(--em-faint)] transition-all group"
          >
            <span>See full archive</span>
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
