import type { Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
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

function HomePage(): ReactElement {
  const { postsByYear } = Route.useLoaderData();

  const allPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([, posts]) => posts);

  const featured = allPosts[0];
  const rest = allPosts.slice(1, 25);

  return (
    <div className="px-6 md:px-8">
      {featured && <HeroRow post={featured} />}

      <section className="em-list" aria-label="Recent writing">
        {rest.map((post, index) => (
          <ListRow key={post.slug} post={post} index={index} />
        ))}
      </section>

      <div className="mx-auto mt-12 max-w-2xl text-sm">
        <Link
          to="/archives/"
          className="inline-flex items-center gap-2 text-[color:var(--em-muted)] underline decoration-[color:var(--em-hairline)] decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--em-foreground)] hover:decoration-[color:var(--em-accent)]"
        >
          See full archive →
        </Link>
      </div>
    </div>
  );
}

function HeroRow({ post }: { post: Post }): ReactElement {
  return (
    <Link
      to="/$year/$month/$slug/"
      params={postParams(post)}
      className="em-hero editorial-enter"
      aria-label={`Read: ${post.title}`}
    >
      <span className="em-hero__eyebrow">Latest</span>
      <h1 className="em-hero__title">{post.title}</h1>
      {post.excerpt && <p className="em-hero__dek">{post.excerpt}</p>}
      <div className="em-hero__meta">
        <time dateTime={new Date(post.date).toISOString()}>
          {formatPostDate(post.date)}
        </time>
        <span>{readingTime(post)}</span>
        {post.category && <span>{post.category}</span>}
      </div>
    </Link>
  );
}

interface ListRowProps {
  post: Post;
  index: number;
}

function ListRow({ post, index }: ListRowProps): ReactElement {
  const style: CSSProperties = {
    animationDelay: `${Math.min(index, 8) * 50}ms`,
  };

  return (
    <Link
      to="/$year/$month/$slug/"
      params={postParams(post)}
      className="em-list__row editorial-enter"
      style={style}
    >
      <h2 className="em-list__title">{post.title}</h2>
      {post.excerpt && <p className="em-list__dek">{post.excerpt}</p>}
      <div className="em-list__meta">
        <time dateTime={new Date(post.date).toISOString()}>
          {formatPostDate(post.date)}
        </time>
        <span>{readingTime(post)}</span>
        {post.category && <span>{post.category}</span>}
      </div>
    </Link>
  );
}
