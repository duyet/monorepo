import { ArrowSquareOut } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { apps, type AppItem } from "../data/projects";

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
  return (
    <div className="min-h-screen relative bg-[color:var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--foreground)] selection:text-[color:var(--background)] overflow-x-hidden">
      {/* Clean full grid background overlay */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-[0.8] dark:opacity-[0.4]" />

      <SiteHeader />

      <main className="mx-auto max-w-[1040px] px-6 py-12 md:py-24 md:px-8 relative z-10">
        <header className="mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--subtle)]">
            DIRECTORY / CODEBASES
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[color:var(--foreground)] mt-2">
            Projects
          </h1>
          <p className="mt-4 max-w-xl text-sm text-[color:var(--muted)] font-light leading-relaxed">
            A complete list of public project surfaces across data engineering,
            AI infrastructure, analytics, and developer tooling.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((item, i) => (
            <ProjectCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ProjectCard({ item, index }: { item: AppItem; index: number }) {
  const glowClass = [
    "project-glow-blue",
    "project-glow-orange",
    "project-glow-purple",
    "project-glow-green",
  ][index % 4];

  return (
    <div
      className="border border-[color:var(--hairline)] rounded-2xl overflow-hidden bg-[color:var(--card-bg)] shadow-xs relative group/card hover:border-[color:var(--foreground)] hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full min-h-[220px]"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      {/* Dynamic Glowing Radial Backdrop Layer */}
      <div className={`absolute inset-0 pointer-events-none z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 ${glowClass}`} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <ProjectLink item={item}>
          {/* Browser Top Bar Mockup */}
          <div className="bg-[color:var(--faint)] px-4 py-2 flex items-center justify-between border-b border-[color:var(--hairline)]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 dark:bg-red-500/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/80 dark:bg-yellow-500/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 dark:bg-emerald-500/60" />
            </div>
            <div className="text-[9px] font-mono text-[color:var(--subtle)] bg-[color:var(--background)] border border-[color:var(--hairline)] rounded-md px-2 py-0.5 truncate max-w-[60%] select-none">
              {item.domain || item.host}
            </div>
            <div className="w-4" />
          </div>

          <div className="p-5 flex flex-col gap-3">
            <h2 className="font-bold text-base tracking-tight text-[color:var(--foreground)] group-hover/card:text-[color:var(--foreground)] transition-colors duration-150">
              {item.name}
            </h2>
            <p className="text-xs text-[color:var(--muted)] leading-relaxed font-light line-clamp-3">
              {item.description}
            </p>
          </div>
        </ProjectLink>

        <div className="px-5 pb-4 pt-0 mt-auto flex items-center justify-between text-[10px] font-mono text-[color:var(--subtle)] border-t border-[color:var(--hairline)] pt-3 relative z-20">
          <span className="truncate max-w-[150px]" title={item.host}>
            <span>{item.host}</span>
          </span>
          <span className="text-[10px] font-mono text-[color:var(--muted)]">
            {item.domain && item.domain !== item.host ? item.domain : "Live"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProjectLink({
  item,
  children,
}: {
  item: AppItem;
  children: ReactNode;
}) {
  const href = addUtmParams(item.href, "projects", item.utmContent, item.host);

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className="block no-underline h-full"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="block no-underline h-full">
      {children}
    </Link>
  );
}
