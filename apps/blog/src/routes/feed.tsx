import Container from "@duyet/components/Container";
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
    <Container className="mx-auto max-w-[960px] px-5 sm:px-8 lg:px-10">
      <header className="blog-page-head border-b border-[var(--border-faint)] pb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] dark:text-[var(--on-dark)] sm:text-5xl">
          Feed
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/75">
          Latest posts from the blog.
        </p>
      </header>

      <div className="mt-10 divide-y divide-[var(--border-faint)]">
        {posts.map((post) => {
          const [, year, month, slug] = post.slug.split("/");
          return (
            <Link
              key={post.slug}
              to="/$year/$month/$slug/"
              params={{ year, month, slug }}
              className="block py-5 transition-colors hover:bg-[var(--surface-soft)]"
            >
              <time className="text-sm text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)] dark:text-[var(--on-dark)]">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#1a1a1a]/65 dark:text-[#f8f8f2]/65">
                  {post.excerpt}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 border-t border-[var(--border-faint)] pt-5">
        <Link
          to="/archives/"
          className="text-sm font-medium text-[var(--ink)] underline underline-offset-4 transition-colors hover:text-[var(--body)]"
        >
          See more posts
        </Link>
      </div>
    </Container>
  );
}
