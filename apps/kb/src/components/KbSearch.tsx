import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import type { SearchDoc, SearchKind } from "../../lib/search";
import { searchDocs } from "../../lib/search";

const KINDS: { id: SearchKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "memory", label: "Memory" },
  { id: "article", label: "Articles" },
  { id: "daily", label: "Daily" },
];

function kindLabel(kind: SearchKind): string {
  if (kind === "memory") return "memory";
  if (kind === "article") return "article";
  return "daily";
}

export function KbSearch({ docs }: { docs: SearchDoc[] }) {
  const navigate = useNavigate({ from: "/search" });
  const { q = "", kind = "all" } = useSearch({ from: "/search" });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hits = useMemo(() => searchDocs(docs, q, kind), [docs, q, kind]);

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="relative mb-6"
      >
        <label htmlFor="kb-search" className="absolute -left-[9999px]">
          Search the knowledge base
        </label>
        <input
          id="kb-search"
          ref={inputRef}
          type="search"
          value={q}
          autoComplete="off"
          spellCheck={false}
          placeholder="Search notes, articles, inbox…"
          onChange={(e) =>
            navigate({
              search: (prev) => ({
                ...prev,
                q: e.target.value || undefined,
              }),
              replace: true,
            })
          }
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </form>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {KINDS.map((k) => {
          const on = kind === k.id;
          return (
            <button
              key={k.id}
              type="button"
              aria-pressed={on}
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    kind: k.id === "all" ? undefined : k.id,
                  }),
                  replace: true,
                })
              }
              className={`rounded-md border px-2.5 py-1 text-xs font-mono ${
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {k.label}
            </button>
          );
        })}
      </div>

      {!q.trim() ? (
        <p className="text-sm text-muted-foreground">
          {docs.length} items indexed. Type to search titles, tags, and bodies.
          Press <kbd className="font-mono text-xs">/</kbd> from anywhere.
        </p>
      ) : hits.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No matches for “{q.trim()}”.
        </p>
      ) : (
        <ul className="space-y-3">
          <li className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {hits.length} result{hits.length === 1 ? "" : "s"}
          </li>
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.slug}`}>
              <a
                href={hit.href}
                className="block rounded-md border border-border px-3 py-2.5 hover:border-foreground/40 transition-colors"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {kindLabel(hit.kind)}
                  </span>
                  <span className="text-sm font-medium">{hit.title}</span>
                </div>
                {hit.subtitle && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {hit.subtitle}
                  </p>
                )}
                {hit.snippet && (
                  <p className="mt-1 text-xs text-muted-foreground/90 line-clamp-2">
                    {hit.snippet}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
