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
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-32">
        <header className="max-w-3xl mb-16">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl text-[color:var(--foreground)]">
            Projects
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[color:var(--muted)] leading-relaxed">
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
  return (
    <div
      className="card-v2 p-5 flex flex-col justify-between h-full group animate-fade-in relative"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      <ProjectLink item={item}>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-lg tracking-tight text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors duration-150">
              {item.name}
            </h2>
            <span className="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition-colors duration-150">
              <ArrowSquareOut size={18} weight="bold" />
            </span>
          </div>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        <div className="mt-6 border-t border-[color:var(--hairline)] pt-3 flex items-center justify-between text-[11px] font-mono text-[color:var(--subtle)]">
          <span className="truncate max-w-[200px]" title={item.host}>
            {item.host}
          </span>
          <span className="text-[color:var(--accent)] font-semibold uppercase tracking-wider text-[9px] bg-[color:var(--accent)]/10 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>
      </ProjectLink>
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
