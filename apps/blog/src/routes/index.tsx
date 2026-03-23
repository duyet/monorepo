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

  const topSeriesList = seriesList.slice(0, 3);
  const topTags = Object.entries(allTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  return (
    <div className="min-h-screen pb-10">
      <Container>
        <div className="mb-12 text-center">
          <p className="text-lg leading-relaxed text-neutral-700">
            Lists all{" "}
            <strong className="font-semibold text-neutral-900">
              {postCount} posts
            </strong>{" "}
            of the past {pastYears} years of blogging. You can jump straight to
            the{" "}
            <Link
              to="/feed"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              /feed
            </Link>{" "}
            for latest posts, also explore{" "}
            <Link
              to="/tags"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              by the topics
            </Link>{" "}
            or{" "}
            <Link
              to="/featured"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              my featured posts
            </Link>
            .
          </p>
        </div>

        <HomeCards seriesList={topSeriesList} topTags={topTags} />

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
