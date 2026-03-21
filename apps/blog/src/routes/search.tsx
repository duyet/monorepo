import Container from "@duyet/components/Container";
import type { CategoryCount, Post, TagCount } from "@duyet/interfaces";
import { createFileRoute } from "@tanstack/react-router";
import { SearchClient } from "@/components/blog/search-client";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/posts";

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
  loader: async () => {
    const [allPosts, categories, tags] = await Promise.all([
      getAllPosts(),
      getAllCategories(),
      getAllTags(),
    ]);
    return { allPosts, categories, tags };
  },
  component: SearchPage,
});

function SearchPage() {
  const { allPosts, categories, tags } = Route.useLoaderData() as {
    allPosts: Post[];
    categories: CategoryCount;
    tags: TagCount;
  };

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
