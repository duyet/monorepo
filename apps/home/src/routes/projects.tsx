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
    <div className="min-h-screen relative bg-[color:var(--background)] text-[color:var(--foreground)] overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-[0.8] dark:opacity-[0.4]" />

      <SiteHeader />

      <main className="mx-auto max-w-[1040px] px-6 py-12 md:py-16 md:px-8 relative z-10">
        <header className="mb-12">
          <p className="eyebrow-mono">Directory · {apps.length} projects</p>
          <h1 className="display-tight text-3xl md:text-4xl mt-3 text-[color:var(--foreground)]">
            Projects
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[color:var(--muted)] leading-relaxed">
            A complete list of public project surfaces across data engineering,
            AI infrastructure, analytics, and developer tooling.
          </p>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--hairline)] border border-[color:var(--hairline)]">
          {apps.map((item) => (
            <li key={item.name} className="bg-[color:var(--background)]">
              <ProjectLink item={item}>
                <article className="flex h-full flex-col gap-2 p-5 transition-colors hover:bg-[color:var(--faint)]">
                  <p className="eyebrow-mono">{item.domain || item.host}</p>
                  <h2 className="text-base font-medium tracking-tight text-[color:var(--foreground)]">
                    {item.name}
                  </h2>
                  <p className="text-sm text-[color:var(--muted)] leading-relaxed line-clamp-3">
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
