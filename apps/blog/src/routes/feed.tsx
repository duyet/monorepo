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
    <div className="min-h-screen">
      <Container>
        <Feed posts={posts} />

        <Link to="/archives">
          <div className="mt-12 rounded-lg py-4 text-center text-base font-medium text-neutral-800 dark:text-neutral-200 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline hover:underline-offset-4">
            See more posts
          </div>
        </Link>
      </Container>
    </div>
  );
}
