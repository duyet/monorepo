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
    <Container className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[820px] pt-10 sm:pt-14 lg:pt-20">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
          Archives
        </h1>
        <p className="mt-5 text-lg font-medium leading-7 tracking-tight text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
          Lists all {postCount} posts of the past {pastYears} years. You can also
          explore <Link to="/tags/">by the topics</Link>.
        </p>
      </div>
      <div className="mx-auto mt-14 max-w-[820px] flex flex-col gap-8">
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
