import Container from "@duyet/components/Container";
import Feed from "@duyet/components/Feed";
import type { Post } from "@duyet/interfaces";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/posts";

export const Route = createFileRoute("/feed")({
  loader: async () => {
    const allPosts = await getAllPosts();
    const posts = allPosts.slice(0, 10);
    return { posts };
  },
  component: FeedPage,
});

function FeedPage() {
  const { posts } = Route.useLoaderData() as { posts: Post[] };

  return (
    <Container className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      <Feed posts={posts} />

      <Link to="/archives/">
        <div className="mt-12 rounded-lg py-4 text-center text-base font-medium text-[#141413] hover:text-[#cc785c] dark:text-[#f8f8f2] dark:hover:text-[#cc785c] hover:underline hover:underline-offset-4">
          See more posts
        </div>
      </Link>
    </Container>
  );
}
