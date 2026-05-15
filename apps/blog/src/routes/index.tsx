import Container from "@duyet/components/Container";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PostCard } from "@/components/post/PostCard";
import { FeaturedPost } from "@/components/post/FeaturedPost";
import { YearPost } from "@/components/post/YearPost";
import { BlogHeader } from "@/components/layout/BlogHeader";
import { BlogPillNav } from "@/components/layout/BlogPillNav";
import { getAllSeries, getAllTags, getPostsByAllYear } from "@/lib/posts";
import type { Post } from "@duyet/interfaces";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [postsByYear, seriesList, allTags] = await Promise.all([
      getPostsByAllYear(),
      getAllSeries(),
      getAllTags(),
    ]);
    return { postsByYear, seriesList, allTags };
  },
  component: HomePage,
});

function HomePage() {
  const { postsByYear } = Route.useLoaderData();

  const allPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([, posts]) => posts);

  const featured = allPosts[0];
  const recentCards = allPosts.slice(1, 7);
  const allByYear = groupByYear(allPosts);

  const categoryPills = [
    { label: "Latest", href: "/feed/" },
    { label: "Topics", href: "/tags/" },
    { label: "Featured", href: "/featured/" },
    { label: "Series", href: "/series/" },
    { label: "Archives", href: "/archives/" },
  ];

  return (
    <Container className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
      <BlogHeader
        eyebrow="Blog"
        title="Notes on data,"
        titleEmphasis="systems and engineering"
        intro={
          <>
            {allPosts.length} posts on data engineering, distributed systems,
            and open source. Explore{" "}
            <Link to="/feed/">latest</Link>,{" "}
            <Link to="/tags/">topics</Link>, or{" "}
            <Link to="/featured/">featured</Link>.
          </>
        }
      >
        <BlogPillNav items={categoryPills} />
      </BlogHeader>

      {featured && (
        <div className="mt-14">
          <FeaturedPost post={featured} />
        </div>
      )}

      {recentCards.length > 0 && (
        <div className="mt-10 card-grid">
          {recentCards.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* All posts grouped by year */}
      {allByYear.map(([year, posts]) => (
        <YearPost key={year} year={year} posts={posts} className="mt-14" />
      ))}

      <div className="pb-24" />
    </Container>
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
