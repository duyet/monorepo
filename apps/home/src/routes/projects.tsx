import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Layers, AlignJustify } from "lucide-react";
import { addUtmParams } from "../../app/lib/utm";
import { apps, type AppItem } from "../data/projects";
import { SecHead, Reveal } from "@duyet/components";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

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

// ---------------------------------------------------------------------------
// Filter derivation — category (Live/OSS) + tag-based
// ---------------------------------------------------------------------------

type FilterKey = "All" | "Live" | "OSS" | string;

function categoryOf(item: AppItem): "Live" | "OSS" {
  return item.host === "github.com" ? "OSS" : "Live";
}

/** Unique tags across all projects, sorted alphabetically. */
const ALL_TAGS = [...new Set(apps.flatMap((a) => a.tags ?? []))].sort();

const FILTER_KEYS: FilterKey[] = ["All", "Live", "OSS", ...ALL_TAGS];

const liveCount = apps.filter((a) => a.host !== "github.com").length;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// View toggle
// ---------------------------------------------------------------------------

function ViewToggle({
  view,
  setView,
}: {
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
}) {
  const btnBase =
    "inline-flex items-center justify-center w-8 h-8 border rounded-[var(--rd-r-sm)] bg-transparent cursor-pointer";

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        aria-label="Grid view"
        onClick={() => setView("grid")}
        className={cn(
          btnBase,
          view === "grid"
            ? "border-[var(--rd-text)] text-[var(--rd-text)]"
            : "border-[var(--rd-border)] text-[var(--rd-text-3)]",
        )}
      >
        <Layers size={15} />
      </button>
      <button
        type="button"
        aria-label="List view"
        onClick={() => setView("list")}
        className={cn(
          btnBase,
          view === "list"
            ? "border-[var(--rd-text)] text-[var(--rd-text)]"
            : "border-[var(--rd-border)] text-[var(--rd-text-3)]",
        )}
      >
        <AlignJustify size={15} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid view — rd-work-grid / rd-work-card pattern
// ---------------------------------------------------------------------------

function ProjectGrid({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-work-grid">
      {items.map((item, i) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host,
        );
        const cat = categoryOf(item);
        const isExternal = href.startsWith("http");

        const cardClass =
          "rd-card flex flex-col p-5 min-h-[176px] no-underline text-inherit h-full";

        return (
          <Reveal key={item.name} delay={i * 25}>
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                <WorkCardBody item={item} cat={String(cat)} />
              </a>
            ) : (
              <Link to={href} className={cardClass}>
                <WorkCardBody item={item} cat={String(cat)} />
              </Link>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

function WorkCardBody({ item, cat }: { item: AppItem; cat: string }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2.5">
        <span className="font-[var(--font-mono)] rd-work-dom">
          {item.domain || item.host}
        </span>
      </div>
      <h3 className="text-[1.18rem] tracking-[-0.03em] mt-[15px]">{item.name}</h3>
      <p className="rd-work-desc">{item.description}</p>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1 flex-wrap">
          {item.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
          ))}
          <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{cat}</Badge>
        </div>
        <span className="text-[var(--rd-text-4)]">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// List view — rd-rows / rd-row pattern
// ---------------------------------------------------------------------------

function ProjectList({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-rows">
      {items.map((item) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host,
        );
        const isExternal = href.startsWith("http");
        const inner = (
          <>
            <span
              className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px] w-[200px] overflow-hidden text-ellipsis whitespace-nowrap shrink-0"
            >
              {item.domain || item.host}
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-semibold mr-3 tracking-[-0.02em]">
                {item.name}
              </span>
              <span className="text-[var(--rd-text-2)] text-sm">
                {item.description}
              </span>
            </span>
            <div className="flex gap-1 shrink-0">
              {item.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
              ))}
            </div>
          </>
        );

        const rowClass = "rd-row flex items-center gap-4 no-underline text-inherit cursor-pointer";

        return isExternal ? (
          <a
            key={item.name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass}
          >
            {inner}
          </a>
        ) : (
          <Link
            key={item.name}
            to={href}
            className={rowClass}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
