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
    <div className="min-h-screen bg-[#f8f8f2] pb-14 dark:bg-[#0d0e0c]">
      <Container className="max-w-[1280px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pt-20">
        <div className="mb-10 max-w-3xl">
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
            Featured
          </h1>
          <p className="max-w-2xl text-sm font-medium leading-6 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 sm:text-base">
            This page highlights{" "}
            <strong className="font-semibold text-[#1a1a1a] dark:text-[#f8f8f2]">
              {postCount} featured blog posts
            </strong>
            . You can also explore{" "}
            <Link
              to="/"
              className="font-medium text-[#1a1a1a] underline underline-offset-4 transition-colors hover:text-[#1a1a1a]/65 dark:text-[#f8f8f2] dark:hover:text-[#f8f8f2]/70"
            >
              all posts
            </Link>{" "}
            or{" "}
            <Link
              to="/tags/"
              className="font-medium text-[#1a1a1a] underline underline-offset-4 transition-colors hover:text-[#1a1a1a]/65 dark:text-[#f8f8f2] dark:hover:text-[#f8f8f2]/70"
            >
              by the topics
            </Link>
            .
          </p>
        </div>

        <div className="grid max-w-6xl gap-8 md:grid-cols-2">
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
