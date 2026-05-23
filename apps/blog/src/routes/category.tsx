import type { CategoryCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
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

function Categories(): ReactElement {
  const hasChild = useMatches().some(
    (match) => match.routeId === "/category/$category"
  );
  if (hasChild) return <Outlet />;

  const { categories } = Route.useLoaderData() as { categories: CategoryCount };
  const entries = Object.entries(categories).sort(([, a], [, b]) => b - a);
  const totalPosts = entries.reduce((sum, [, c]) => sum + c, 0);

  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Index</span>
        <h1 className="em-masthead__title">Categories</h1>
        <p className="em-masthead__dek">
          {entries.length} categories across {totalPosts} posts.
        </p>
      </header>

      <div className="em-index">
        {entries.map(([category, count], i) => {
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 12) * 30}ms`,
          };
          return (
            <Link
              key={category}
              to="/category/$category/"
              params={{ category: getSlug(category) }}
              className="em-index__row editorial-enter"
              style={style}
            >
              <span className="em-index__name">{category}</span>
              <span className="em-index__count">
                {count} {count === 1 ? "post" : "posts"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
