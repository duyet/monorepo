import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { BookOpen, ChevronRight, FolderOpen } from "lucide-react";
import {
  getAllArticles,
  getAllCategories,
  getAllMemory,
  getArticlesByCategory,
} from "../../lib/content";

const KnowledgeGraph = lazy(() =>
  import("../components/KnowledgeGraph").then((m) => ({
    default: m.KnowledgeGraph,
  })),
);

export const Route = createFileRoute("/")({
  loader: () => {
    const articles = getAllArticles();
    const categories = getAllCategories();
    const memory = getAllMemory();
    const categoryStats = categories.map((cat) => ({
      name: cat,
      count: getArticlesByCategory(cat).length,
    }));
    const tree = categories.map((cat) => ({
      category: cat,
      articles: getArticlesByCategory(cat),
    }));
    return { articles, categories, memory, categoryStats, tree };
  },
  head: () => ({
    meta: [
      { title: "Knowledge Base | duyet.net" },
      {
        name: "description",
        content:
          "Browse all articles, memory notes, and the knowledge graph at duyet.net.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const { categoryStats, articles, memory, tree } = Route.useLoaderData();
  const totalCount = articles.length + memory.length;

  return (
    <main>
      {/* 3D Knowledge Graph */}
      <section className="border-b border-border">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[420px] text-muted-foreground text-sm font-mono">
              Loading graph...
            </div>
          }
        >
          <KnowledgeGraph />
        </Suspense>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        {/* Stats */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Knowledge Base
          </p>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            duyet.net / kb
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl">
            {totalCount} entries ({articles.length} articles +{" "}
            {memory.length} memory notes) across {categoryStats.length}{" "}
            categories. If you are an AI agent, read{" "}
            <a
              href="/llms.txt"
              className="underline underline-offset-4 hover:no-underline"
            >
              /llms.txt
            </a>
            .
          </p>
        </div>

        {/* Category grid */}
        {categoryStats.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                Categories
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoryStats.map((cat) => (
                <Link
                  key={cat.name}
                  to="/c/$category"
                  params={{ category: cat.name }}
                  className="group border border-border rounded-md px-4 py-3 hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-sm group-hover:text-foreground transition-colors capitalize">
                    {cat.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cat.count} article{cat.count !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Articles by category (tree) */}
        {tree.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                Articles
              </h2>
            </div>
            <div className="space-y-8">
              {tree.map(({ category, articles: catArticles }) => (
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
                      ({catArticles.length})
                    </span>
                  </div>
                  <ul className="space-y-1 pl-4 border-l border-border">
                    {catArticles.map((article) => (
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
            <Link
              to="/m"
              className="mt-8 inline-block text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Browse all {totalCount} entries &rarr;
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
