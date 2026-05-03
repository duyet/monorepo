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
    <Container className="max-w-[1280px] px-5 sm:px-8 lg:px-10">
      <div className="mb-12 max-w-[820px] pt-10 sm:pt-14 lg:pt-20">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
          Topics
        </h1>
        <p className="mt-5 text-lg font-medium leading-7 tracking-tight text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
          Explore my writing organized by{" "}
          <strong className="font-semibold text-[#1a1a1a] dark:text-[#f8f8f2]">
            {tagEntries.length} diverse topics
          </strong>
          , spanning programming languages, frameworks, data engineering,
          cloud infrastructure, and career development. {totalPosts} posts
          tagged and organized for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tagEntries.map(([tag, count], index) => {
          const metadata = getTagMetadata(tag, count, index);

          return (
            <ContentCard
              key={tag}
              title={tag}
              href={`/tag/${getSlug(tag)}/`}
              description={metadata.description}
              color={metadata.color}
              illustration={metadata.illustration}
              tags={[`${count} ${count === 1 ? "post" : "posts"}`]}
            />
          );
        })}
      </div>
    </Container>
  );
}
