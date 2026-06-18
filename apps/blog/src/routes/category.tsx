import type { CategoryCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import { PALETTE } from "@/lib/colors";
import { getAllCategories } from "@/lib/posts";
import { getCategoryMetadata } from "@/lib/category-metadata";

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
  const hasChild = useMatches().some(
    (match) => match.routeId === "/category/$category"
  );
  if (hasChild) return <Outlet />;

  const { categories } = Route.useLoaderData() as {
    categories: CategoryCount;
  };

  const sorted = Object.entries(categories).sort(
    ([, a], [, b]) => b - a
  );

  const total = Object.values(categories).reduce((sum, c) => sum + c, 0);

  return (
    <div className="px-4 sm:px-6 md:px-8 max-w-[var(--rd-maxw)] mx-auto">
      <header style={{ marginBottom: 28 }}>
        <p
          className="font-[var(--font-mono)] text-[var(--rd-text-3)]"
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Index
        </p>
        <h1
          className="rd-display"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
            marginTop: 8,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            fontWeight: 600,
          }}
        >
          Categories
        </h1>
        <p
          className="text-[var(--rd-text-2)]"
          style={{ marginTop: 10, fontSize: 16 }}
        >
          {sorted.length} categories across {total} posts.
        </p>
      </header>

      <div className="bento-grid">
        {sorted.map(([name, count], i) => {
          const isFeatured = i < 3;
          const meta = getCategoryMetadata(name, count, i);
          const color = PALETTE[i % PALETTE.length];

          return (
            <Link
              key={name}
              to="/category/$category/"
              params={{ category: getSlug(name) }}
              className={`bento-cell no-underline text-inherit${isFeatured ? " bento-cell--featured" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-[17px] font-[530] tracking-tight text-[var(--rd-text)]">
                    {name}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-[14px] tabular-nums text-[var(--rd-text-3)]">
                  {String(count).padStart(2, "0")}
                </span>
              </div>
              {isFeatured && meta.description && (
                <p className="text-[14px] text-[var(--rd-text-3)] leading-[1.5] mt-2 line-clamp-2">
                  {meta.description}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
