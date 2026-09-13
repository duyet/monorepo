import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  categoryOf,
  FILTER_KEYS,
  type FilterKey,
  liveCount,
} from "../components.projects/filter-utils";
import { ProjectGrid } from "../components.projects/ProjectGrid";
import { ProjectList } from "../components.projects/ProjectList";
import { ViewToggle } from "../components.projects/ViewToggle";
import { apps } from "../data/projects";
import { tw } from "../lib/tw";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Projects | Duyet Le" },
      {
        name: "description",
        content:
          "A complete list of Duyet Le projects, apps, dashboards, AI tools, and open source work.",
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/projects" }],
  }),
});

function ProjectsPage() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [view, setView] = useState<"grid" | "list">("list");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      if (filter === "Live" || filter === "OSS") {
        if (categoryOf(a) !== filter) return false;
      } else if (filter !== "All" && !a.tags?.includes(filter)) {
        return false;
      }
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.host.toLowerCase().includes(q) ||
        (a.domain?.toLowerCase().includes(q) ?? false) ||
        (a.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [filter, query]);

  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <section>
        <div className="mx-auto w-full max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(3.5rem,8vw,6.5rem)] pb-[clamp(2.5rem,5vw,4rem)]">
          <div className="min-w-0 max-w-[46rem]">
            <h1 className="m-0 flex flex-col gap-3">
              <span className={tw.display}>Projects</span>
              <span className={tw.title}>
                Everything I&apos;ve built &amp; kept running.
              </span>
            </h1>
            <p className={tw.lead}>
              Products, small tools, and open source — most of it live on a
              subdomain or a GitHub repo. {liveCount} are running right now.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pb-[clamp(56px,8vw,96px)]">
        <div className="mb-6 flex flex-col gap-4">
            <label className="flex items-center gap-2 rounded-full border border-[var(--rd-border)] bg-[var(--rd-surface)] px-3 py-2 text-[var(--rd-text-3)]">
              <Search size={16} strokeWidth={1.6} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, tag, or domain"
                aria-label="Search projects"
                className="min-w-0 flex-1 border-0 bg-transparent text-[0.9rem] text-[var(--rd-text)] outline-none"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label="Project filters"
              >
                {FILTER_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={filter === key}
                    className={`rounded-full border px-3 py-1 text-[0.75rem] font-medium tracking-[0.02em] ${
                      filter === key
                        ? "border-[var(--rd-text)] bg-[var(--rd-text)] text-[var(--rd-bg)]"
                        : "border-[var(--rd-border)] bg-transparent text-[var(--rd-text-2)]"
                    }`}
                    onClick={() => setFilter(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <ViewToggle view={view} setView={setView} />
            </div>
        </div>

        {list.length === 0 ? (
          <p className="text-[0.9rem] text-[var(--rd-text-3)]">
            No projects match that search.
          </p>
        ) : view === "grid" ? (
          <ProjectGrid items={list} />
        ) : (
          <ProjectList items={list} />
        )}
      </section>
    </div>
  );
}
