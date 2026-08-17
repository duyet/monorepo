import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllArticles, getAllInbox, getAllMemory } from "../../lib/content";
import { buildSearchIndex } from "../../lib/search-index";
import type { SearchKind } from "../../lib/search";
import { KbSearch } from "../components/KbSearch";

type SearchParams = {
  q?: string;
  kind?: SearchKind;
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
    kind:
      search.kind === "memory" ||
      search.kind === "article" ||
      search.kind === "daily"
        ? search.kind
        : undefined,
  }),
  loader: () => {
    const docs = buildSearchIndex(
      getAllArticles(),
      getAllMemory(),
      getAllInbox()
    );
    return { docs, count: docs.length };
  },
  head: () => ({
    meta: [
      { title: "Search | Knowledge Base | duyet.net" },
      {
        name: "description",
        content:
          "Search memory notes, articles, and daily inbox on kb.duyet.net.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { docs, count } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
          <Link to="/" className="hover:text-foreground transition-colors">
            KB
          </Link>{" "}
          / Search
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Search</h1>
        <p className="text-muted-foreground text-sm">
          {count} notes and articles. Query is in the URL so you can share it.
        </p>
      </div>
      <KbSearch docs={docs} />
    </main>
  );
}
