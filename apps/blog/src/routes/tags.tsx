import { ContentCard } from "@duyet/components";
import Container from "@duyet/components/Container";
import type { TagCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute } from "@tanstack/react-router";
import { getTagMetadata } from "@/lib/tag-metadata";
import { getAllTags } from "@/lib/posts";

export const Route = createFileRoute("/tags")({
  head: () => ({
    meta: [
      { title: "Topics | Tôi là Duyệt" },
      { name: "description", content: "Browse posts by topics and tags." },
    ],
  }),
  loader: async () => {
    const tags = await getAllTags();
    return { tags };
  },
  component: Tags,
});

function Tags() {
  const { tags } = Route.useLoaderData() as { tags: TagCount };
  const tagEntries = Object.entries(tags).sort(([, a], [, b]) => b - a);
  const totalPosts = Object.values(tags).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-white pb-14 dark:bg-[#0d0e0c]">
      <Container>
        <div className="mb-12 max-w-3xl pt-8 sm:pt-12">
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-neutral-950 dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
            Topics
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-600 dark:text-[#f8f8f2]/70 sm:text-base">
            Explore my writing organized by{" "}
            <strong className="font-semibold text-neutral-950 dark:text-[#f8f8f2]">
              {tagEntries.length} diverse topics
            </strong>
            , spanning programming languages, frameworks, data engineering,
            cloud infrastructure, and career development. {totalPosts} posts
            tagged and organized for you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tagEntries.map(([tag, count], index) => {
            const metadata = getTagMetadata(tag, count, index);

            return (
              <ContentCard
                key={tag}
                title={tag}
                href={`/tag/${getSlug(tag)}`}
                description={metadata.description}
                color={metadata.color}
                illustration={metadata.illustration}
                tags={[`${count} ${count === 1 ? "post" : "posts"}`]}
              />
            );
          })}
        </div>
      </Container>
    </div>
  );
}
