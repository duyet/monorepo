import { ContentCard } from "@duyet/components";
import Container from "@duyet/components/Container";
import type { CategoryCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute } from "@tanstack/react-router";
import { getCategoryMetadata } from "@/lib/category-metadata";
import { getAllCategories } from "@/lib/posts";

export const Route = createFileRoute("/category")({
  head: () => ({
    meta: [
      { title: "Categories | Tôi là Duyệt" },
      { name: "description", content: "Browse posts by category." },
    ],
  }),
  loader: async () => {
    const categories = await getAllCategories();
    return { categories };
  },
  component: Categories,
});

function Categories() {
  const { categories } = Route.useLoaderData() as { categories: CategoryCount };
  const categoryEntries = Object.entries(categories).sort(
    ([, a], [, b]) => b - a
  );
  const totalPosts = Object.values(categories).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="min-h-screen bg-white pb-14 dark:bg-[#0d0e0c]">
      <Container>
        <div className="mb-12 max-w-3xl pt-8 sm:pt-12">
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-neutral-950 dark:text-[#f8f8f2] sm:text-5xl lg:text-6xl">
            Categories
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-neutral-600 dark:text-[#f8f8f2]/70 sm:text-base">
            Explore my writing organized by{" "}
            <strong className="font-semibold text-neutral-950 dark:text-[#f8f8f2]">
              {categoryEntries.length} main categories
            </strong>
            , covering everything from data engineering and machine learning to
            web development and career insights. {totalPosts} posts and
            counting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryEntries.map(([category, count], index) => {
            const metadata = getCategoryMetadata(category, count, index);

            return (
              <ContentCard
                key={category}
                title={category}
                href={`/category/${getSlug(category)}`}
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
