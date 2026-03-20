import Container from "@duyet/components/Container";
import { getAllCategories, getAllPosts, getAllTags } from "@duyet/libs/getPost";
import { createFileRoute } from "@tanstack/react-router";
import { SearchClient } from "@/components/blog/search-client";

export type SearchParams = {
  q?: string;
  category?: string;
  tags?: string;
  from?: string;
  to?: string;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    tags: typeof search.tags === "string" ? search.tags : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search | Tôi là Duyệt" },
      {
        name: "description",
        content: "Search blog posts by title, category, tags, and date range.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const allPosts = getAllPosts(
    ["slug", "title", "date", "category", "featured", "excerpt", "tags"],
    10000
  );

  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="mb-4 font-serif text-5xl font-bold text-neutral-900 dark:text-neutral-100 sm:text-6xl md:mb-6 md:text-7xl">
            Search
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Search through {allPosts.length} blog posts by title, category,
            tags, or date range.
          </p>
        </div>

        <SearchClient posts={allPosts} categories={categories} tags={tags} />
      </div>
    </Container>
  );
}
