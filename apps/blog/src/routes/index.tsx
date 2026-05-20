import Container from "@duyet/components/Container";
import { dateFormat } from "@duyet/libs/date";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FeaturedPost } from "@/components/post/FeaturedPost";
import { YearPost } from "@/components/post/YearPost";
import { getPostsByAllYear } from "@/lib/posts";
import type { Post } from "@duyet/interfaces";
import type { ReactElement } from "react";

export const Route = createFileRoute("/")({
  loader: async () => {
    const postsByYear = await getPostsByAllYear();
    return { postsByYear };
  },
  component: HomePage,
});

function HomePage(): ReactElement {
  const { postsByYear } = Route.useLoaderData();

  const allPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([, posts]) => posts);

  const featured = allPosts[0];
  const railPosts = allPosts.slice(1, 5);
  const allByYear = groupByYear(allPosts);

  return (
    <Container className="blog-home-shell mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
      <section className="blog-focus-grid" aria-label="Blog focus areas">
        {focusAreas.map((area) => (
          <Link key={area.title} to={area.href} className="blog-focus-card">
            <h2>{area.title}</h2>
            <p>{area.description}</p>
          </Link>
        ))}
      </section>

      {featured && (
        <section className="blog-home-feature" aria-label="Latest writing">
          <FeaturedPost post={featured} />

          {railPosts.length > 0 && (
            <aside className="blog-recent-rail" aria-label="Recent posts">
              {railPosts.map((post) => (
                <RecentPostLink key={post.slug} post={post} />
              ))}
            </aside>
          )}
        </section>
      )}

      <section className="blog-archive-section" aria-label="All posts">
        <div className="blog-section-heading">
          <p>{allPosts.length} published notes</p>
          <h2>Archive</h2>
        </div>

        <div className="blog-archive-years">
          {allByYear.map(([year, posts]) => (
            <YearPost key={year} year={year} posts={posts} />
          ))}
        </div>
      </section>

      <div className="pb-24" />
    </Container>
  );
}

const focusAreas = [
  {
    title: "AI Systems",
    description:
      "Agents, model tooling, and the practical edges of building with LLMs.",
    href: "/category/ai/",
  },
  {
    title: "Data Engineering",
    description:
      "Pipelines, warehouses, data platforms, and the operational work around them.",
    href: "/category/data-engineering/",
  },
  {
    title: "ClickHouse",
    description:
      "Notes from running analytical databases, Kubernetes, UDFs, and observability.",
    href: "/tag/clickhouse/",
  },
  {
    title: "Rust & Tools",
    description:
      "Systems programming, developer workflows, and small tools that survive real use.",
    href: "/category/rust/",
  },
];

function RecentPostLink({ post }: { post: Post }): ReactElement {
  const [, year, month, slug] = post.slug.split("/");

  return (
    <Link
      to="/$year/$month/$slug/"
      params={{ year, month, slug }}
      className="blog-recent-item"
    >
      <div className="blog-recent-meta">
        <span>{post.category}</span>
        <time>{formatPostDate(post.date)}</time>
      </div>
      <h3>{post.title}</h3>
      {post.excerpt && <p>{post.excerpt}</p>}
    </Link>
  );
}

function groupByYear(posts: Post[]): [number, Post[]][] {
  const map = new Map<number, Post[]>();
  for (const post of posts) {
    const y = new Date(post.date).getFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(post);
  }
  return [...map.entries()].sort(([a], [b]) => b - a);
}

function formatPostDate(date: Date | string): string {
  return dateFormat(date instanceof Date ? date : new Date(date), "MMM d, yyyy");
}
