import Container from "@duyet/components/Container";
import type { CategoryCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
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
  const hasChild = useMatches().some((m) => m.id === "/category/$category");
  if (hasChild) return <Outlet />;

  const { categories } = Route.useLoaderData() as { categories: CategoryCount };
  const categoryEntries = Object.entries(categories).sort(
    ([, a], [, b]) => b - a
  );
  const totalPosts = Object.values(categories).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <Container className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      <div className="blog-page-head mb-12 max-w-[820px]">
        <h1>
          Categories
        </h1>
        <p>
          Explore my writing organized by{" "}
          <strong className="font-semibold text-[#1a1a1a] dark:text-[#f8f8f2]">
            {categoryEntries.length} main categories
          </strong>
          , covering everything from data engineering and machine learning to
          web development and career insights. {totalPosts} posts and
          counting.
        </p>
      </div>

      <div className="blog-link-grid">
        {categoryEntries.map(([category, count]) => (
          <Link
            key={category}
            to="/category/$category/"
            params={{ category: getSlug(category) }}
          >
            <div>
              <h2>{category}</h2>
              <p>Posts grouped by this category.</p>
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
