import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { getAllCategories, getArticlesByCategory } from "../../../lib/content";

export const Route = createFileRoute("/c/$category")({
  loader: ({ params }) => {
    const { category } = params;
    const articles = getArticlesByCategory(category);
    if (articles.length === 0) {
      const known = getAllCategories();
      if (!known.includes(category)) throw notFound();
    }
    return { category, articles };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.category ?? "Category"} | Knowledge Base | duyet.net`,
      },
      {
        name: "description",
        content: `Articles in the ${loaderData?.category} category.`,
      },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, articles } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
          <Link to="/" className="hover:text-foreground transition-colors">
            KB
          </Link>{" "}
          /{" "}
          <Link
            to="/c"
            className="hover:text-foreground transition-colors"
          >
            Categories
          </Link>{" "}
          / {category}
        </p>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {category}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {articles.length} article{articles.length !== 1 ? "s" : ""}
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted-foreground text-sm">No articles in this category yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {articles.map((article) => (
            <li key={article.slug} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    to="/k/$slug"
                    params={{ slug: article.slug }}
                    className="font-medium hover:underline underline-offset-4"
                  >
                    {article.title}
                  </Link>
                  {article.summary && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                  {article.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Tag className="size-3 text-muted-foreground shrink-0" />
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs border border-border rounded px-1.5 py-0.5 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {article.updated && (
                  <p className="text-xs text-muted-foreground shrink-0">
                    {article.updated}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
