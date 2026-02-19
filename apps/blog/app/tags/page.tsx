import { ContentCard } from "@duyet/components";
import Container from "@duyet/components/Container";
import type { TagCount } from "@duyet/interfaces";
import { getAllTags } from "@duyet/libs/getPost";
import { getSlug } from "@duyet/libs/getSlug";
import { getTagMetadata } from "@/lib/tag-metadata";

export const dynamic = "force-static";

export default function Tags() {
  const tags: TagCount = getAllTags();
  const tagEntries = Object.entries(tags).sort(([, a], [, b]) => b - a);
  const totalPosts = Object.values(tags).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen">
      <Container>
        <div className="mb-12">
          <h1 className="mb-6 font-serif text-5xl font-bold text-neutral-900 md:text-6xl lg:text-7xl">
            Topics
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-neutral-700">
            Explore my writing organized by{" "}
            <strong className="font-semibold text-neutral-900">
              {tagEntries.length} diverse topics
            </strong>
            , spanning programming languages, frameworks, data engineering,
            cloud infrastructure, and career development. {totalPosts} posts
            tagged and organized for you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
