import type { Post, TagCount } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getAllTags, getPostsByTag } from "@/lib/posts";

function findTagBySlug(tags: TagCount, slug: string): string | undefined {
  return (
    Object.keys(tags).find((t) => getSlug(t) === slug) ||
    Object.keys(tags).find((t) => getSlug(t).endsWith(`-${slug}`))
  );
}

function slugToDisplay(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/tag/$tag")({
  head: ({ params }) => {
    const display = slugToDisplay(params.tag);
    return {
      meta: [
        { title: `${display} | Tôi là Duyệt` },
        { name: "description", content: `Blog posts tagged with ${display}.` },
      ],
    };
  },
  loader: async ({ params }) => {
    const [posts, tags] = await Promise.all([
      getPostsByTag(params.tag),
      getAllTags(),
    ]);
    if (!findTagBySlug(tags, params.tag)) throw notFound();
    return { posts, tags };
  },
  component: PostsByTag,
});

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function PostsByTag(): ReactElement {
  const { tag } = Route.useParams();
  const { posts } = Route.useLoaderData() as {
    posts: Post[];
    tags: TagCount;
  };

  const displayName = slugToDisplay(tag);

  const postsByYear = posts.reduce((acc: Record<number, Post[]>, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">
          <Link
            to="/tags/"
            className="transition-colors hover:text-[color:var(--em-foreground)]"
          >
            Tag
          </Link>
        </span>
        <h1 className="em-masthead__title">{displayName}</h1>
        <div className="em-masthead__meta">
          <span>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
          <span>
            {Object.keys(postsByYear).length}{" "}
            {Object.keys(postsByYear).length === 1 ? "year" : "years"}
          </span>
        </div>
      </header>

      {Object.entries(postsByYear)
        .sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10))
        .map(([year, yearPosts]) => (
          <div key={year}>
            <h2 className="em-year">{year}</h2>
            <section className="em-list" aria-label={`Posts from ${year}`}>
              {yearPosts.map((post, i) => {
                const style: CSSProperties = {
                  animationDelay: `${Math.min(i, 8) * 40}ms`,
                };
                return (
                  <Link
                    key={post.slug}
                    to="/$year/$month/$slug/"
                    params={postParams(post)}
                    className="em-list__row editorial-enter"
                    style={style}
                  >
                    <h3 className="em-list__title">{post.title}</h3>
                    <div className="em-list__meta">
                      <time dateTime={new Date(post.date).toISOString()}>
                        {dateFormat(post.date, "MMM d, yyyy")}
                      </time>
                      {post.category && <span>{post.category}</span>}
                    </div>
                  </Link>
                );
              })}
            </section>
          </div>
        ))}

      {posts.length === 0 && (
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-[color:var(--em-muted)]">
          No posts found with this tag yet.
        </p>
      )}
    </div>
  );
}
