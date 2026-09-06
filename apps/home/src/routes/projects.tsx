import { Reveal } from "@duyet/components";
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
  const [view, setView] = useState<"grid" | "list">("grid");
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
      <section className="home-hero">
        <div className="home-hero-inner">
          <Reveal>
            <div className="home-hero-copy home-fade-up">
              <h1 className="home-hero-heading">
                <span className="home-hero-brand">Projects</span>
                <span className="home-hero-title">
                  Everything I&apos;ve built &amp; kept running.
                </span>
              </h1>
              <p className="home-hero-lead home-fade-up-delay">
                Products, small tools, and open source — most of it live on a
                subdomain or a GitHub repo. {liveCount} are running right now.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pb-[clamp(56px,8vw,96px)]">
        <Reveal delay={40}>
          <div className="home-dir mb-6">
            <label className="home-dir-search">
              <Search size={16} strokeWidth={1.6} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, tag, or domain"
                aria-label="Search projects"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div
                className="home-dir-filters"
                role="tablist"
                aria-label="Project filters"
              >
                {FILTER_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={filter === key}
                    className={`home-dir-pill ${filter === key ? "is-active" : ""}`}
                    onClick={() => setFilter(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <ViewToggle view={view} setView={setView} />
            </div>
          </div>
        </Reveal>

        {list.length === 0 ? (
          <p className="home-dir-empty">No projects match that search.</p>
        ) : view === "grid" ? (
          <ProjectGrid items={list} />
        ) : (
          <ProjectList items={list} />
        )}
      </section>
    </div>
  );
}
