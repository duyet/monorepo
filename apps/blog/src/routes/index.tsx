import Container from "@duyet/components/Container";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeCards } from "@/components/layout";
import { YearPost } from "@/components/post";
import { getAllSeries, getAllTags, getPostsByAllYear } from "@/lib/posts";
import type { Post, Series, TagCount } from "@duyet/interfaces";

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
  const { postsByYear, seriesList, allTags } = Route.useLoaderData() as {
    postsByYear: Record<number, Post[]>;
    seriesList: Series[];
    allTags: TagCount;
  };

  const postCount = Object.values(postsByYear).reduce(
    (acc, yearPosts) => acc + yearPosts.length,
    0
  );

  const years = Object.keys(postsByYear).map(Number);
  const pastYears = new Date().getFullYear() - Math.min(...years);

  const topSeriesList = seriesList.slice(0, 4);
  const topTags = Object.entries(allTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  return (
    <div className="bg-[#f8f8f2] pb-14 dark:bg-[#0d0e0c]">
      <Container className="max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div className="mb-10 max-w-4xl pt-10 sm:pt-14 lg:pt-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-[#f8f8f2]/55">
            Blog archive
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[0.98] tracking-tight text-neutral-950 dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
            Notes on data, systems, and engineering craft.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-[#f8f8f2]/70 sm:text-base">
            Lists all{" "}
            <strong className="font-semibold text-neutral-950 dark:text-[#f8f8f2]">
              {postCount} posts
            </strong>{" "}
            of the past {pastYears} years of blogging. You can jump straight to
            the{" "}
            <Link
              to="/feed"
              className="font-medium text-neutral-950 underline underline-offset-4 transition-colors hover:text-neutral-600 dark:text-[#f8f8f2] dark:hover:text-[#f8f8f2]/70"
            >
              /feed
            </Link>{" "}
            for latest posts, also explore{" "}
            <Link
              to="/tags"
              className="font-medium text-neutral-950 underline underline-offset-4 transition-colors hover:text-neutral-600 dark:text-[#f8f8f2] dark:hover:text-[#f8f8f2]/70"
            >
              by the topics
            </Link>{" "}
            or{" "}
            <Link
              to="/featured"
              className="font-medium text-neutral-950 underline underline-offset-4 transition-colors hover:text-neutral-600 dark:text-[#f8f8f2] dark:hover:text-[#f8f8f2]/70"
            >
              my featured posts
            </Link>
            .
          </p>
        </div>

        <HomeCards seriesList={topSeriesList} topTags={topTags} />

        <div className="flex max-w-5xl flex-col gap-8">
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
