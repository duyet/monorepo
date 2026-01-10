import Link from "next/link";

import { YearPost } from "@/components/year-post";
import { getTagColorClass, getTagMetadata } from "@/lib/tag-metadata";
import Container from "@duyet/components/Container";
import type { Post } from "@duyet/interfaces";
import { getAllTags, getPostsByTag } from "@duyet/libs/getPost";
import { getSlug } from "@duyet/libs/getSlug";

export const dynamic = "force-static";
export const dynamicParams = false;

interface Params {
  tag: string;
}

interface PostsByTagProps {
  params: Promise<Params>;
}

export async function generateStaticParams() {
  const tags = getAllTags();

  return Object.keys(tags).map((tag: string) => ({
    tag: getSlug(tag),
  }));
}

export default async function PostsByTag({ params }: PostsByTagProps) {
  const { tag } = await params;
  const posts = await getPosts(tag);

  // Get the tag display name (reverse slug to title)
  const tags = getAllTags();
  const tagName = Object.keys(tags).find((t) => getSlug(t) === tag) || tag;

  // Get the index for consistent color rotation
  const tagIndex = Object.keys(tags)
    .sort((a, b) => tags[b] - tags[a])
    .indexOf(tagName);

  // Group posts by year
  const postsByYear = posts.reduce((acc: Record<number, Post[]>, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {});

  const postCount = posts.length;
  const yearCount = Object.keys(postsByYear).length;

  // Get dynamic metadata
  const metadata = getTagMetadata(tagName, postCount, tagIndex);
  const colorClass = getTagColorClass(metadata.color, "light");

  return (
    <div className="min-h-screen">
      <Container>
        {/* Hero Banner */}
        <div className={`${colorClass} mb-12 rounded-3xl p-8 md:p-12 lg:p-16`}>
          <div className="mb-4">
            <Link
              href="/tags"
              className="inline-flex items-center text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              All Topics
            </Link>
          </div>

          <h1 className="mb-6 font-serif text-4xl font-bold text-neutral-900 md:text-5xl lg:text-6xl">
            {tagName}
          </h1>

          <p className="mb-6 max-w-2xl text-lg leading-relaxed text-neutral-700">
            {metadata.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm font-medium text-neutral-600">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>
                {postCount} {postCount === 1 ? "post" : "posts"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {yearCount} {yearCount === 1 ? "year" : "years"}
              </span>
            </div>
          </div>
        </div>

        {/* Posts organized by year */}
        <div className="flex flex-col gap-12">
          {Object.entries(postsByYear)
            .sort(([a], [b]) => Number.parseInt(b) - Number.parseInt(a))
            .map(([year, yearPosts]) => (
              <YearPost
                key={year}
                year={Number.parseInt(year)}
                posts={yearPosts}
              />
            ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-neutral-600">
              No posts found with this tag yet.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}

async function getPosts(tag: Params["tag"]) {
  return getPostsByTag(tag, ["slug", "date", "title", "category", "featured"]);
}
