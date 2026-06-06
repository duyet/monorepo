import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Brain } from "lucide-react";
import {
  getAllArticles,
  getAllCategories,
  getAllMemory,
  getAllMemoryTypes,
  getMemoryByType,
} from "../../../lib/content";
import type { MemoryType } from "../../../lib/content";

export const Route = createFileRoute("/m/")({
  loader: () => {
    const memory = getAllMemory();
    const memoryTypes = getAllMemoryTypes();
    const articles = getAllArticles();
    const categories = getAllCategories();
    return { memory, memoryTypes, articles, categories };
  },
  head: () => ({
    meta: [
      { title: "Memory | Knowledge Base | duyet.net" },
      {
        name: "description",
        content: "Browse all memory notes grouped by type.",
      },
    ],
  }),
  component: MemoryIndexPage,
});

function MemoryIndexPage() {
  const { memory, memoryTypes, articles, categories } =
    Route.useLoaderData();

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
          <Link to="/" className="hover:text-foreground transition-colors">
            KB
          </Link>{" "}
          / Memory
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Memory</h1>
        <p className="text-muted-foreground text-sm">
          {memory.length} notes across {memoryTypes.length} types.
          Also{" "}
          <Link to="/c" className="underline underline-offset-4">
            {articles.length} articles
          </Link>{" "}
          in {categories.length} categories.
        </p>
      </div>

      {/* Memory by type */}
      <div className="space-y-10">
        {memoryTypes.map((type) => {
          const notes = getMemoryByType(type as MemoryType);
          return (
            <section key={type}>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-mono font-semibold uppercase tracking-widest text-muted-foreground capitalize">
                  {type}
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({notes.length})
                </span>
              </div>
              <ul className="space-y-2 pl-4 border-l border-border">
                {notes.map((note) => (
                  <li key={note.slug}>
                    <Link
                      to="/m/$slug"
                      params={{ slug: note.slug }}
                      className="text-sm hover:underline underline-offset-4"
                    >
                      {note.title}
                    </Link>
                    {note.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {note.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Quick link to articles */}
      <div className="mt-12 pt-8 border-t border-border">
        <Link
          to="/c"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="size-3.5" />
          Browse {articles.length} articles by category
        </Link>
      </div>
    </main>
  );
}
