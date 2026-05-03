import Container from "@duyet/components/Container";
import type { TagCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  const tagTones = [
    "bg-white dark:bg-[#1a1a1a]",
    "bg-[#bfdbfe] dark:bg-[#1f3a5f]",
    "bg-[#a7f3d0] dark:bg-[#164634]",
    "bg-[#fecaca] dark:bg-[#4f1f1f]",
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f2] pb-14 dark:bg-[#0d0e0c]">
      <Container className="max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div className="mb-12 max-w-3xl pt-8 sm:pt-12">
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
            Topics
          </h1>
          <p className="max-w-2xl text-sm font-medium leading-6 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 sm:text-base">
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
            const tone = tagTones[index % tagTones.length];

            return (
              <Link
                key={tag}
                to="/tag/$tag"
                params={{ tag: getSlug(tag) }}
                className={`${tone} group flex min-h-[170px] flex-col rounded-xl p-5 text-[#1a1a1a] transition-colors hover:bg-[#f2f2eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] dark:text-[#f8f8f2] dark:hover:bg-[#242420]`}
              >
                <span className="text-sm font-medium text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
                  {count} {count === 1 ? "post" : "posts"}
                </span>
                <h2 className="mt-5 text-lg font-semibold leading-tight tracking-tight">
                  {tag}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
                  {metadata.description}
                </p>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
