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
    <div className="min-h-screen">
      <Container>
        <div className="mb-12">
          <h1 className="mb-6 font-serif text-5xl font-bold text-neutral-900 md:text-6xl lg:text-7xl">
            Categories
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-neutral-700">
            Explore my writing organized by{" "}
            <strong className="font-semibold text-neutral-900">
              {categoryEntries.length} main categories
            </strong>
            , covering everything from data engineering and machine learning to
            web development and career insights. {totalPosts} posts and
            counting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
