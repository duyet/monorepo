import Container from "@duyet/components/Container";
import type { Post } from "@duyet/interfaces";
import { createFileRoute, Link } from "@tanstack/react-router";
import { YearPost } from "@/components/post";
import { getPostsByAllYear } from "@/lib/posts";

export const Route = createFileRoute("/featured")({
  head: () => ({
    meta: [
      { title: "Featured Posts | Tôi là Duyệt" },
      { name: "description", content: "Featured blog posts." },
    ],
  }),
  loader: async () => {
    const postsByYear = await getPostsByAllYear(true);
    return { postsByYear };
  },
  component: Featured,
});

function Featured() {
  const { postsByYear } = Route.useLoaderData() as {
    postsByYear: Record<number, Post[]>;
  };

  const postCount = Object.values(postsByYear).reduce(
    (acc, yearPosts) => acc + yearPosts.length,
    0
  );

  return (
    <div className="min-h-screen bg-white pb-14 dark:bg-[#0d0e0c]">
      <Container>
        <div className="mb-12 rounded-xl border border-neutral-950/10 bg-[#dcefe7] p-6 dark:border-white/10 dark:bg-[#164634] sm:p-8 md:p-10">
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-neutral-950 dark:text-[#f8f8f2] md:text-5xl">
            Featured
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-700 dark:text-[#f8f8f2]/75 sm:text-base">
            This page highlights{" "}
            <strong className="font-semibold text-neutral-950 dark:text-[#f8f8f2]">
              {postCount} featured blog posts
            </strong>
            . You can also explore{" "}
            <Link
              to="/"
              className="font-medium text-neutral-950 underline underline-offset-4 transition-colors hover:text-neutral-600 dark:text-[#f8f8f2] dark:hover:text-[#f8f8f2]/70"
            >
              all posts
            </Link>{" "}
            or{" "}
            <Link
              to="/tags"
              className="font-medium text-neutral-950 underline underline-offset-4 transition-colors hover:text-neutral-600 dark:text-[#f8f8f2] dark:hover:text-[#f8f8f2]/70"
            >
              by the topics
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(postsByYear)
            .sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10))
            .map(([year, posts]) => (
              <YearPost
                key={year}
                year={Number.parseInt(year, 10)}
                posts={posts}
              />
            ))}
        </div>
      </Container>
    </div>
  );
}
