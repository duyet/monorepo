import Container from "@duyet/components/Container";
import type { Post } from "@duyet/interfaces";
import { createFileRoute, Link } from "@tanstack/react-router";
import { YearPost } from "@/components/post";
import { getPostsByAllYear } from "@/lib/posts";

export const Route = createFileRoute("/archives")({
  head: () => ({
    meta: [
      { title: "Archives | Tôi là Duyệt" },
      { name: "description", content: "All blog posts archived by year." },
    ],
  }),
  loader: async () => {
    const postsByYear = await getPostsByAllYear();
    return { postsByYear };
  },
  component: Archives,
});

function Archives() {
  const { postsByYear } = Route.useLoaderData() as {
    postsByYear: Record<number, Post[]>;
  };

  const postCount = Object.values(postsByYear).reduce(
    (acc, yearPosts) => acc + yearPosts.length,
    0
  );

  const years = Object.keys(postsByYear).map(Number);
  const pastYears = new Date().getFullYear() - Math.min(...years);

  return (
    <Container className="max-w-[1280px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pt-20">
      <div className="mb-10 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-[#f8f8f2]/70 sm:text-base">
        Lists all {postCount} posts of the past {pastYears} years. You can also
        explore <Link to="/tags">by the topics</Link>.
      </div>
      <div className="flex max-w-4xl flex-col gap-10">
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
  );
}
