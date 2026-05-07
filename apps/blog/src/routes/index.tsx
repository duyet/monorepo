import Container from "@duyet/components/Container";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FeaturedPost, PostCard } from "@/components/post";
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

  // Flatten all posts sorted newest-first
  const allPosts: Post[] = Object.entries(postsByYear)
    .sort(([a], [b]) => Number(b) - Number(a))
    .flatMap(([, posts]) => posts);

  const featured = allPosts[0];
  const rest = allPosts.slice(1);

  return (
    <Container className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1080px] pt-10 sm:pt-14 lg:pt-20">
        {/* Featured post hero */}
        {featured && <FeaturedPost post={featured} className="mb-10" />}

        {/* Post grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Archive link */}
        <div className="mt-14 flex items-center justify-center gap-3 pb-10 text-sm font-medium text-[#1a1a1a]/50 dark:text-[#f8f8f2]/50">
          <span>{allPosts.length} posts</span>
          <span>·</span>
          <Link
            to="/archives/"
            className="text-[#1a1a1a]/70 underline underline-offset-4 transition-colors hover:text-[#1a1a1a] dark:text-[#f8f8f2]/70 dark:hover:text-[#f8f8f2]"
          >
            View archives
          </Link>
        </div>
      </div>
    </Container>
  );
}
