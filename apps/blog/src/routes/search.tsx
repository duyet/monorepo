import type { CategoryCount, Post, TagCount } from "@duyet/interfaces";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { SearchClient } from "@/components/blog/search-client";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/posts";

type SearchParams = {
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

function SearchPage(): ReactElement {
  const { allPosts, categories, tags } = Route.useLoaderData() as {
    allPosts: Post[];
    categories: CategoryCount;
    tags: TagCount;
  };

  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Find</span>
        <h1 className="em-masthead__title">Search</h1>
        <p className="em-masthead__dek">
          {allPosts.length} posts. Search by title, category, tags, or date.
        </p>
      </header>

      <div className="mx-auto max-w-6xl">
        <SearchClient posts={allPosts} categories={categories} tags={tags} />
      </div>
    </div>
  );
}
