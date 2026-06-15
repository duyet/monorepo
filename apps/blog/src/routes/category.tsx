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
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
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
        <p
          className="text-[var(--rd-text-2)]"
          style={{ marginTop: 10, fontSize: 14 }}
        >
          {sorted.length} categories across {total} posts.
        </p>
      </header>

      <div className="rd-rows">
        {sorted.map(([name, count]) => (
          <Link
            key={name}
            to="/category/$category/"
            params={{ category: getSlug(name) }}
            className="rd-row cursor-pointer no-underline text-inherit px-2"
            style={{ gridTemplateColumns: "1fr auto" }}
          >
            <span className="font-[550] text-[clamp(14px,1.4vw,16px)] tracking-tight">
              {name}
            </span>
            <span className="rd-tag-pill text-[10.5px] !py-[1px] !px-1.5 shrink-0 ml-2">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
