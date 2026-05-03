import { createFileRoute, Link } from "@tanstack/react-router";
import { AppCommandPalette } from "@duyet/components";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
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
    <div className="min-h-screen bg-[#f8f8f2] text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2]">
      <header className="sticky top-0 z-50 bg-[#f8f8f2]/95 backdrop-blur dark:bg-[#0d0e0c]/95">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-semibold tracking-tight"
          >
            <DuyetMark />
            Duyet Le
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a
              href={addUtmParams(
                "https://blog.duyet.net",
                "projects",
                "header_blog"
              )}
            >
              Blog
            </a>
            <a
              href={addUtmParams(
                "https://cv.duyet.net",
                "projects",
                "header_cv"
              )}
            >
              Experience
            </a>
            <a
              href={addUtmParams(
                "https://insights.duyet.net",
                "projects",
                "header_insights"
              )}
            >
              Insights
            </a>
            <Link to="/about">About</Link>
          </nav>
          <AppCommandPalette />
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 pb-20 pt-10 sm:px-8 md:pt-16 lg:px-10">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#1a1a1a]/65 transition-colors hover:text-[#1a1a1a] dark:text-[#f8f8f2]/65 dark:hover:text-[#f8f8f2]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <section className="max-w-3xl">
          <p className="mb-3 text-sm font-medium text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
            Projects
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Apps, tools, dashboards, and open source systems.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
            A complete list of public project surfaces across data engineering,
            AI infrastructure, analytics, developer tooling, and writing.
          </p>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:mt-16 xl:gap-8">
          {apps.map((item, index) =>
            item.screenshot ? (
              <ProjectCard
                key={item.name}
                item={item}
                shortcutNumber={index + 1}
              />
            ) : (
              <CompactProjectCard
                key={item.name}
                item={item}
                shortcutNumber={index + 1}
              />
            )
          )}
        </section>
      </main>
    </div>
  );
}

function ProjectCard({
  item,
  shortcutNumber,
}: {
  item: AppItem;
  shortcutNumber?: number;
}) {
  return (
    <ProjectLink
      item={item}
      className={`group overflow-hidden rounded-xl border border-[#1a1a1a]/10 ${item.tone ?? "bg-[#1a1a1a]"} transition-transform hover:-translate-y-0.5 dark:border-white/10`}
      shortcutNumber={shortcutNumber}
    >
      <div className="overflow-hidden bg-[#1a1a1a]">
        <img
          src={item.screenshot}
          alt={item.name}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
        />
      </div>
      <div className="p-5 text-white">
        <h2 className="text-lg font-semibold tracking-tight">{item.name}</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-white/80">
          {item.description}
        </p>
        <p className="mt-5 truncate text-sm font-medium text-white/60">
          {item.host}
        </p>
      </div>
    </ProjectLink>
  );
}

function CompactProjectCard({
  item,
  shortcutNumber,
}: {
  item: AppItem;
  shortcutNumber?: number;
}) {
  return (
    <ProjectLink
      item={item}
      className="group flex min-h-44 flex-col rounded-xl border border-[#1a1a1a]/10 bg-white p-5 transition-colors dark:border-white/10 dark:bg-[#1a1a1a]"
      shortcutNumber={shortcutNumber}
    >
      <h2 className="text-lg font-semibold tracking-tight">{item.name}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
        {item.description}
      </p>
      <div className="mt-auto flex items-center justify-between gap-4 pt-8 text-sm font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
        <span className="truncate">{item.host}</span>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
      </div>
    </ProjectLink>
  );
}

function ProjectLink({
  item,
  className,
  shortcutNumber,
  children,
}: {
  item: AppItem;
  className?: string;
  shortcutNumber?: number;
  children: ReactNode;
}) {
  const href = addUtmParams(item.href, "projects", item.utmContent, item.host);
  const shortcutId = item.name.toLowerCase().replace(/\s+/g, "-");

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        data-shortcut-id={shortcutId}
        data-shortcut-number={shortcutNumber}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={href}
      className={className}
      data-shortcut-id={shortcutId}
      data-shortcut-number={shortcutNumber}
    >
      {children}
    </Link>
  );
}

function DuyetMark() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="translate-y-1 bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="-translate-y-1 bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
    </span>
  );
}
