import { useEffect, useMemo, useState } from "react";
import { apps } from "../data/projects";
import {
  groupProjects,
  matchesQuery,
  type ViewMode,
} from "./filter-utils";
import { ProjectsEmpty } from "./ProjectsEmpty";
import { ProjectsGridView } from "./ProjectsGridView";
import { ProjectsListView } from "./ProjectsListView";
import { ProjectsSearchBar } from "./ProjectsSearchBar";

const VIEW_KEY = "projects-view";

export function ProjectsCatalog() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY) as ViewMode | null;
    if (saved === "list" || saved === "grid") setView(saved);
  }, []);

  function setViewAndSave(next: ViewMode) {
    setView(next);
    localStorage.setItem(VIEW_KEY, next);
  }

  const filtered = useMemo(
    () => apps.filter((item) => matchesQuery(item, query)),
    [query],
  );
  const grouped = useMemo(() => groupProjects(filtered), [filtered]);

  return (
    <>
      <ProjectsSearchBar
        searchQuery={query}
        setSearchQuery={setQuery}
        view={view}
        setView={setViewAndSave}
        filteredCount={filtered.length}
        totalCount={apps.length}
      />
      {filtered.length === 0 ? (
        <ProjectsEmpty query={query} onClear={() => setQuery("")} />
      ) : view === "grid" ? (
        <ProjectsGridView grouped={grouped} />
      ) : (
        <ProjectsListView
          items={filtered}
          grouped={grouped}
          searchQuery={query}
        />
      )}
    </>
  );
}
