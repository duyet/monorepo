import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { apps } from "../data/projects";
import { SecHead, Reveal } from "@duyet/components";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  type FilterKey,
  categoryOf,
  FILTER_KEYS,
  liveCount,
} from "../components.projects/filter-utils";
import { ViewToggle } from "../components.projects/ViewToggle";
import { ProjectGrid } from "../components.projects/ProjectGrid";
import { ProjectList } from "../components.projects/ProjectList";

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
  }),
});

function ProjectsPage() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  const list = filter === "All"
    ? apps
    : filter === "Live" || filter === "OSS"
      ? apps.filter((a) => categoryOf(a) === filter)
      : apps.filter((a) => a.tags?.includes(filter));

  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <section
        className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(44px,6vw,76px)] pb-[clamp(56px,8vw,96px)]"
      >
        <Reveal>
          <SecHead
            eyebrow={`Projects · ${apps.length} total`}
            title="Everything I've built & kept running."
            links={[
              {
                label: "GitHub",
                href: "https://github.com/duyet",
              },
            ]}
          />
          <p className="rd-lead mt-4 max-w-[60ch]">
            Products, small tools, and open source — most of it live on a
            subdomain or a GitHub repo. {liveCount} are running right now.
          </p>
        </Reveal>

        {/* filter + view toggle toolbar */}
        <Reveal delay={60}>
          <div className="flex items-center justify-between gap-4 flex-wrap mt-8 mb-5">
            <div className="flex gap-2 flex-wrap">
              {FILTER_KEYS.map((key) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "font-[var(--font-mono)] text-[13px]",
                    filter === key && "bg-muted font-medium",
                  )}
                  onClick={() => setFilter(key)}
                >
                  {key}
                </Button>
              ))}
            </div>
            <ViewToggle view={view} setView={setView} />
          </div>
        </Reveal>

        {view === "grid" ? (
          <ProjectGrid items={list} />
        ) : (
          <ProjectList items={list} />
        )}
      </section>
    </div>
  );
}
