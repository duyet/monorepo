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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteHeader />

      <main className="mx-auto max-w-[1040px] px-6 py-12 md:py-16 md:px-8">
        <header className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Directory · {apps.length} projects
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
            Projects
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed">
            A complete list of public project surfaces across data engineering,
            AI infrastructure, analytics, and developer tooling.
          </p>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border">
          {apps.map((item) => (
            <li key={item.name} className="bg-background">
              <ProjectLink item={item}>
                <article className="flex h-full flex-col gap-2 p-5 transition-colors hover:bg-muted">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {item.domain || item.host}
                  </p>
                  <h2 className="text-base font-medium tracking-tight">
                    {item.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </article>
              </ProjectLink>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
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
        className="block h-full no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="block h-full no-underline">
      {children}
    </Link>
  );
}
