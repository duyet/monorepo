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
    <div className="min-h-screen">
      <Container>
        <div className="bg-cactus-light mb-12 rounded-3xl p-12 md:p-16">
          <h1 className="mb-8 font-serif text-4xl font-bold text-neutral-900 md:text-5xl lg:text-6xl">
            Featured
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-neutral-700">
            This page highlights{" "}
            <strong className="font-semibold text-neutral-900">
              {postCount} featured blog posts
            </strong>
            . You can also explore{" "}
            <Link
              to="/"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              all posts
            </Link>{" "}
            or{" "}
            <Link
              to="/tags"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              by the topics
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-12">
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
