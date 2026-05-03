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
    <div className="mx-auto max-w-[820px] px-5 sm:px-8 lg:px-10">
      <div className="pt-10 sm:pt-14 lg:pt-20">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
          Search
        </h1>
        <p className="mt-5 text-lg font-medium leading-7 tracking-tight text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
          Search through {allPosts.length} blog posts by title, category,
          tags, or date range.
        </p>
      </div>

      <SearchClient posts={allPosts} categories={categories} tags={tags} />
    </div>
  );
}
