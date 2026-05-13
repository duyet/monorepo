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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 pb-20 pt-12 sm:px-8 md:pt-16 lg:px-10">
        <section className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] md:items-start">
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            Apps, tools, dashboards, and open source systems
          </h1>
          <p className="max-w-sm text-base leading-7 text-[var(--muted-foreground)] md:pt-2">
            A complete list of public project surfaces across data engineering,
            AI infrastructure, analytics, developer tooling, and writing.
          </p>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-[var(--hairline)] pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((item) => (
            <ProjectIndexItem key={item.name} item={item} />
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProjectIndexItem({
  item,
}: {
  item: AppItem;
}) {
  return (
    <ProjectLink
      item={item}
      className="group block min-w-0 rounded-md text-[var(--foreground)] no-underline outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/30"
    >
      <article className="min-w-0">
        <h2 className="w-fit max-w-full text-xl font-semibold leading-7 transition-colors group-hover:text-[var(--muted-foreground)]">
          <span className="break-words">{item.name}</span>
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {item.description}
        </p>
        <p className="mt-3 truncate font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
          {item.host}
        </p>
      </article>
    </ProjectLink>
  );
}

function ProjectLink({
  item,
  className,
  children,
}: {
  item: AppItem;
  className?: string;
  children: ReactNode;
}) {
  const href = addUtmParams(item.href, "projects", item.utmContent, item.host);

  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return <Link to={href} className={className}>{children}</Link>;
}
