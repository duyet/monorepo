import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
import { getAllCategories, getArticlesByCategory } from "../../../lib/content";

export const Route = createFileRoute("/c/")({
  loader: () => {
    const categories = getAllCategories();
    return {
      categories: categories.map((cat) => ({
        name: cat,
        articles: getArticlesByCategory(cat),
      })),
    };
  },
  head: () => ({
    meta: [
      { title: "Categories | Knowledge Base | duyet.net" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
          <Link to="/" className="hover:text-foreground transition-colors">
            KB
          </Link>{" "}
          / Categories
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">No categories yet.</p>
      ) : (
        <ul className="space-y-4">
          {categories.map(({ name, articles }) => (
            <li key={name}>
              <Link
                to="/c/$category"
                params={{ category: name }}
                className="group flex items-center justify-between border border-border rounded-md px-4 py-3 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="size-4 text-muted-foreground" />
                  <span className="font-medium text-sm capitalize">{name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {articles.length} article{articles.length !== 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
