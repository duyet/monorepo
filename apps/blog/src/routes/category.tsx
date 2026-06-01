import type { CategoryCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import type { ReactElement } from "react";
import { getCategoryMetadata } from "@/lib/category-metadata";
import { PALETTE } from "@/lib/colors";
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
    <div className="px-4 sm:px-6 md:px-8 max-w-[var(--rd-maxw)] mx-auto">
      <header style={{ marginBottom: 40 }}>
        <p className="rd-mono rd-dim" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Index
        </p>
        <h1
          className="rd-display"
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            marginTop: 8,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            fontWeight: 600,
          }}
        >
          Categories
        </h1>
        <p className="rd-muted" style={{ marginTop: 10, fontSize: 14 }}>
          {entries.length} categories across {totalPosts} posts.
        </p>
      </header>

      <div className="bento-grid">
        {entries.map(([category, count], i) => {
          const featured = i < 2;
          const color = PALETTE[i % PALETTE.length];
          const meta = getCategoryMetadata(category, count, i);
          return (
            <Link
              key={category}
              to="/category/$category/"
              params={{ category: getSlug(category) }}
              className={`bento-cell${featured ? " bento-cell--featured" : ""}`}
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <h2
                    style={{
                      fontSize: featured ? "1.25rem" : "1rem",
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      color: "var(--rd-text)",
                      lineHeight: 1.2,
                    }}
                  >
                    {category}
                  </h2>
                </div>
                <p className="rd-muted" style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
                  {meta.description}
                </p>
              </div>
              <span
                className="rd-mono"
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: "var(--rd-text-3)",
                  letterSpacing: "0.04em",
                }}
              >
                {count} {count === 1 ? "post" : "posts"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
