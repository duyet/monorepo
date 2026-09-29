/**
 * The graph search box: highlight-nodes input plus its suggestion dropdown.
 *
 * Presentational — the viewer owns the query state and passes it down. Enter
 * submits, arrows walk the suggestions, Escape clears.
 */

import type { ReactElement } from "react";
import type { GraphNode } from "../../lib/graph-types";
import { type GraphTheme, nodeColor } from "./graph-theme";

interface GraphSearchBoxProps {
  query: string;
  onQueryChange: (value: string) => void;
  /** Escape: drop the query and hide the dropdown, but keep the panel state. */
  onClear: () => void;
  showSuggestions: boolean;
  onShowSuggestions: (show: boolean) => void;
  activeSuggestion: number;
  onActiveSuggestionChange: (index: number) => void;
  suggestions: GraphNode[];
  matchCount: number;
  onSubmit: () => void;
  onSelect: (id: string) => void;
  theme: GraphTheme;
}

export function GraphSearchBox({
  query,
  onQueryChange,
  onClear,
  showSuggestions,
  onShowSuggestions,
  activeSuggestion,
  onActiveSuggestionChange,
  suggestions,
  matchCount,
  onSubmit,
  onSelect,
  theme,
}: GraphSearchBoxProps): ReactElement {
  return (
    <div className="relative">
      <input
        id="graph-search"
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => onShowSuggestions(true)}
        onBlur={() => setTimeout(() => onShowSuggestions(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            onShowSuggestions(true);
            onActiveSuggestionChange(
              Math.min(
                activeSuggestion + 1,
                Math.max(suggestions.length - 1, 0)
              )
            );
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            onActiveSuggestionChange(Math.max(activeSuggestion - 1, 0));
          } else if (e.key === "Enter") {
            onSubmit();
          } else if (e.key === "Escape") {
            onClear();
          }
        }}
        placeholder="Highlight nodes…"
        className="h-8 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      />
      {query.trim() && (
        <p className="mt-1 text-[10px] font-mono text-zinc-500">
          {matchCount} match{matchCount === 1 ? "" : "es"}
        </p>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-9 z-20 max-h-56 overflow-y-auto rounded-md border border-zinc-700 bg-zinc-900 shadow-lg">
          {suggestions.map((n, i) => (
            <li key={n.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => onActiveSuggestionChange(i)}
                onClick={() => onSelect(n.id)}
                className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-800 ${
                  i === activeSuggestion ? "bg-zinc-800" : ""
                }`}
              >
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: nodeColor(n.kind, n.memoryType, theme) }}
                />
                <span className="truncate">{n.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
