import Container from "@duyet/components/Container";
import type { TagCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, Link } from "@tanstack/react-router";
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
      <div className="blog-page-head mb-12 max-w-[820px]">
        <h1>
          Topics
        </h1>
        <p>
          Explore my writing organized by{" "}
          <strong className="font-semibold text-[#1a1a1a] dark:text-[#f8f8f2]">
            {tagEntries.length} diverse topics
          </strong>
          , spanning programming languages, frameworks, data engineering,
          cloud infrastructure, and career development. {totalPosts} posts
          tagged and organized for you.
        </p>
      </div>

      <div className="blog-link-grid">
        {tagEntries.map(([tag, count]) => (
          <Link key={tag} to="/tag/$tag/" params={{ tag: getSlug(tag) }}>
            <div>
              <h2>{tag}</h2>
              <p>Posts filed under this topic.</p>
            </div>
            <span className="meta">
              {count} {count === 1 ? "post" : "posts"}
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
