import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getAllCategories, getArticlesByCategory } from "../../lib/content";

export const Route = createFileRoute("/graph")({
  loader: () => {
    const categories = getAllCategories();
    return {
      tree: categories.map((cat) => ({
        category: cat,
        articles: getArticlesByCategory(cat),
      })),
    };
  },
  head: () => ({
    meta: [
      { title: "Graph | Knowledge Base | duyet.net" },
      {
        name: "description",
        content: "Overview of all categories and articles in the knowledge base.",
      },
    ],
  }),
  component: GraphPage,
});

function GraphPage() {
  const { tree } = Route.useLoaderData();
  const total = tree.reduce((n, c) => n + c.articles.length, 0);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
          <Link to="/" className="hover:text-foreground transition-colors">
            KB
          </Link>{" "}
          / Graph
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Graph</h1>
        <p className="text-muted-foreground text-sm">
          {total} article{total !== 1 ? "s" : ""} across{" "}
          {tree.length} categor{tree.length !== 1 ? "ies" : "y"}.
        </p>
      </div>

      {tree.length === 0 ? (
        <p className="text-muted-foreground text-sm">No content yet.</p>
      ) : (
        <div className="space-y-8">
          {tree.map(({ category, articles }) => (
            <section key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Link
                  to="/c/$category"
                  params={{ category }}
                  className="text-sm font-mono font-semibold uppercase tracking-widest capitalize hover:underline underline-offset-4"
                >
                  {category}
                </Link>
                <span className="text-xs text-muted-foreground">
                  ({articles.length})
                </span>
              </div>
              <ul className="space-y-1 pl-4 border-l border-border">
                {articles.map((article) => (
                  <li
                    key={article.slug}
                    className="flex items-start gap-1.5"
                  >
                    <ChevronRight className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <Link
                        to="/k/$slug"
                        params={{ slug: article.slug }}
                        className="text-sm hover:underline underline-offset-4"
                      >
                        {article.title}
                      </Link>
                      {article.links.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          links: {article.links.join(", ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
