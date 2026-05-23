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

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-32">
        <header className="max-w-3xl">
          <h1 className="font-serif text-5xl tracking-tight md:text-6xl">
            Projects
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[color:var(--muted)]">
            A complete list of public project surfaces across data engineering,
            AI infrastructure, analytics, and developer tooling.
          </p>
        </header>

        <ul className="mt-16 flex flex-col">
          {apps.map((item, i) => (
            <ProjectRow key={item.name} item={item} index={i} />
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProjectRow({ item, index }: { item: AppItem; index: number }) {
  return (
    <li
      className="group animate-fade-in py-6 md:py-7"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <ProjectLink item={item}>
        <div className="grid items-baseline gap-2 md:grid-cols-[1fr_auto]">
          <h2 className="font-serif text-2xl tracking-tight text-[color:var(--foreground)] transition-transform duration-150 ease-out group-hover:-translate-y-px">
            <span className="link-underline">{item.name}</span>
          </h2>
          <p className="truncate font-mono text-xs tabular-nums text-[color:var(--subtle)] md:text-right">
            {item.host}
          </p>
        </div>
        <p className="mt-2 max-w-3xl text-base text-[color:var(--muted)]">
          {item.description}
        </p>
      </ProjectLink>
    </li>
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
        className="block no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="block no-underline">
      {children}
    </Link>
  );
}
