import Container from "@duyet/components/Container";
import type { Post } from "@duyet/interfaces";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/posts";
import { tw } from "@/lib/tw";

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
    <Container className="mx-auto max-w-[960px] px-5 sm:px-8 lg:px-10">
      <header className={tw.pageHead}>
        <h1 className={tw.pageTitle}>Feed</h1>
        <p className={tw.lead}>Latest posts from the blog.</p>
      </header>

      <div className="mt-10 divide-y divide-border">
        {posts.map((post) => {
          const [, year, month, slug] = post.slug.split("/");
          return (
            <Link
              key={post.slug}
              to="/$year/$month/$slug/"
              params={{ year, month, slug }}
              className="block py-5 transition-colors hover:bg-muted"
            >
              <time className="text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {post.excerpt}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 border-t border-border pt-5">
        <Link
          to="/archives/"
          className="text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
        >
          See more posts
        </Link>
      </div>
    </Container>
  );
}
