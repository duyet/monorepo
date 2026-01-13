import Link from "next/link";

import Container from "@duyet/components/Container";
import { getPostsByAllYear } from "@duyet/libs/getPost";
import { YearPost } from "@/components/post";

export default function Featured() {
  const postsByYear = getPostsByAllYear(
    ["slug", "title", "date", "category", "featured"],
    -1,
    true
  );

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
              href="/"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              all posts
            </Link>{" "}
            or{" "}
            <Link
              href="/tags"
              className="text-neutral-900 underline underline-offset-4 transition-colors hover:text-neutral-600"
            >
              by the topics
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {Object.entries(postsByYear)
            .sort(([a], [b]) => Number.parseInt(b) - Number.parseInt(a))
            .map(([year, posts]) => (
              <YearPost key={year} year={Number.parseInt(year)} posts={posts} />
            ))}
        </div>
      </Container>
    </div>
  );
}
