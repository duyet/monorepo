import type { CategoryCount, Post, TagCount } from "@duyet/interfaces";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { SearchClient } from "@/components/blog/search-client";
import { getTopLevelPosts } from "@/lib/posts";

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
    const allPosts = await getTopLevelPosts();
    const categories: CategoryCount = allPosts.reduce((acc, post) => {
      if (post.category) acc[post.category] = (acc[post.category] ?? 0) + 1;
      return acc;
    }, {} as CategoryCount);
    const tags: TagCount = allPosts.reduce((acc, post) => {
      for (const tag of post.tags ?? []) {
        acc[tag] = (acc[tag] ?? 0) + 1;
      }
      return acc;
    }, {} as TagCount);
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
      <header className="pt-24 md:pt-28 pb-10 mx-auto">
        <span className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5">
          Find
        </span>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
          Search
        </h1>
        <p className="mt-4 text-base leading-[1.6] text-muted-foreground max-w-xl">
          {allPosts.length} posts. Search by title, category, tags, or date.
        </p>
      </header>

      <div className="mx-auto max-w-6xl">
        <SearchClient posts={allPosts} categories={categories} tags={tags} />
      </div>
    </div>
  );
}
