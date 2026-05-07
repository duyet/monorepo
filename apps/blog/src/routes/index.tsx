import Container from "@duyet/components/Container";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PostCard } from "@/components/post/PostCard";
import { FeaturedPost } from "@/components/post/FeaturedPost";
import { YearPost } from "@/components/post/YearPost";
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
  const olderByYear = groupByYear(allPosts.slice(7));

  return (
    <div className="bg-[#faf9f5] dark:bg-[#0d0e0c] min-h-screen">
      <Container className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        {/* Large serif hero */}
        <div className="pt-16 sm:pt-24 lg:pt-32">
          <h1
            className="font-serif text-[48px] font-normal leading-[1.05] tracking-[-1px] text-[#141413] dark:text-[#f8f8f2] sm:text-[64px] sm:tracking-[-1.5px]"
          >
            Notes on data,
            <br />
            systems &amp; engineering
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.55] text-[#3d3d3a] dark:text-[#f8f8f2]/60">
            {allPosts.length} posts. Explore{" "}
            <Link
              to="/feed/"
              className="text-[#cc785c] underline underline-offset-4"
            >
              latest
            </Link>
            ,{" "}
            <Link
              to="/tags/"
              className="text-[#cc785c] underline underline-offset-4"
            >
              topics
            </Link>
            , or{" "}
            <Link
              to="/featured/"
              className="text-[#cc785c] underline underline-offset-4"
            >
              featured
            </Link>
            .
          </p>
        </div>

        {/* Featured post — dark surface */}
        {featured && (
          <div className="mt-16">
            <FeaturedPost post={featured} />
          </div>
        )}

        {/* Recent posts as cream cards */}
        {recentCards.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentCards.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {/* Older posts grouped by year */}
        {olderByYear.map(([year, posts]) => (
          <YearPost key={year} year={year} posts={posts} className="mt-16" />
        ))}

        <div className="pb-24" />
      </Container>
    </div>
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
