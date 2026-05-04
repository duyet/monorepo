import { cn } from "@duyet/libs/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChartNoAxesCombined,
  FileUser,
  Link as LinkIcon,
  Newspaper,
  Server,
  UserRound,
} from "lucide-react";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { type AppItem, apps } from "../data/projects";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const capabilities = [
  {
    title: "Blog",
    description:
      "Deep dives into data engineering architecture, distributed systems, AI agents, and lessons learned from scaling open source.",
    href: addUtmParams("https://blog.duyet.net", "homepage", "blog_card"),
    icon: Newspaper,
    className: "bg-white dark:bg-[#1a1a1a]",
  },
  {
    title: "Resume",
    description:
      "Scalable data infrastructure, intelligent applications, and production systems that stay fast as usage grows.",
    href: addUtmParams("https://cv.duyet.net", "homepage", "resume_card"),
    icon: FileUser,
    className: "bg-[#bfdbfe] dark:bg-[#1f3a5f]",
  },
  {
    title: "Insights",
    description:
      "Live analytics for coding activity, site traffic, token usage, and operational systems across the Duyet network.",
    href: addUtmParams(
      "https://insights.duyet.net",
      "homepage",
      "insights_card"
    ),
    icon: ChartNoAxesCombined,
    className: "bg-[#a7f3d0] dark:bg-[#164634]",
  },
  {
    title: "About",
    description:
      "Clear project surfaces for Rust, ClickHouse, MCP tools, AI agents, and the small systems that make them useful.",
    href: "/about",
    icon: UserRound,
    className: "bg-[#fecaca] dark:bg-[#4f1f1f]",
  },
];

function HomePage() {
  const visualApps = apps.filter((item) => item.screenshot);
  const compactApps = apps.filter((item) => !item.screenshot);

  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="min-h-screen bg-[#f8f8f2] text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2]">
        <SiteHeader />

        <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] pb-16 dark:bg-[#0d0e0c] 2xl:rounded-b-[4rem]">
          <section className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 md:py-18 lg:px-10 lg:py-24 xl:py-28">
            <div className="max-w-[860px] space-y-6">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Data & AI Engineering
              </h1>
              <p className="max-w-[540px] text-lg font-medium leading-snug tracking-tight lg:text-xl">
                Building scalable data infrastructure and AI-powered systems. I
                design data pipelines, engineer intelligent applications, and
                architect robust distributed systems.
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl xl:text-4xl">
              Explore the work
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:gap-8">
              {capabilities.map((item) => (
                <CapabilityCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section
            id="apps"
            className="mx-auto mt-16 max-w-[1280px] px-5 sm:px-8 lg:mt-20 lg:px-10 xl:mt-24"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl xl:text-4xl">
                Apps
              </h2>
              <p className="text-base font-medium text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
                Managed by @duyetbot AI Agent
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
              {visualApps.map((item, index) => (
                <ProjectCard
                  key={item.name}
                  item={item}
                  shortcutNumber={index < 10 ? index + 1 : undefined}
                />
              ))}
            </div>

            <div className="my-10 flex justify-center lg:my-14">
              <Link
                to="/projects"
                className="rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] dark:bg-[#f8f8f2] dark:text-[#0d0e0c] dark:hover:bg-white lg:px-8 lg:text-lg"
              >
                View more projects
              </Link>
            </div>

            {compactApps.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
                {compactApps.map((item) => (
                  <CompactAppCard key={item.name} item={item} />
                ))}
              </div>
            )}
          </section>

          <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
            <Link
              to="/ls"
              className="group grid gap-5 rounded-xl bg-white p-6 transition-colors dark:bg-[#1a1a1a] md:grid-cols-[1fr_auto] md:items-center lg:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a1a1a] text-white dark:bg-[#f8f8f2] dark:text-[#0d0e0c]">
                  <LinkIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    duyet.net/ls
                  </h3>
                  <p className="mt-1 text-base font-medium text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
                    All short URLs and redirects
                  </p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
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
    <AppLink
      item={item}
      className={`group overflow-hidden rounded-xl ${item.tone ?? "bg-[#1a1a1a]"} transition-transform hover:-translate-y-0.5`}
      shortcutNumber={shortcutNumber}
    >
      <div className="p-5 text-white">
        <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-white/80">
          {item.description}
        </p>
        <p className="mt-5 truncate text-sm font-medium text-white/60">
          {item.host}
        </p>
      </div>
    </AppLink>
  );
}

function CapabilityCard({
  title,
  description,
  href,
  icon: Icon,
  className,
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof Newspaper;
  className: string;
}) {
  const isExternal = href.startsWith("http");
  const children = (
    <>
      <div className="flex items-start justify-between gap-6">
        <h3 className="text-base font-medium lg:text-lg">{title}</h3>
        <Icon className="h-7 w-7 shrink-0 lg:h-8 lg:w-8" />
      </div>
      <p className="mt-auto max-w-[560px] text-lg font-medium leading-tight tracking-tight md:text-xl">
        {description}
      </p>
    </>
  );

  const classes = cn(
    "flex min-h-[220px] flex-col rounded-xl p-5 transition-transform hover:-translate-y-0.5 lg:min-h-[240px] lg:p-6",
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={classes}>
      {children}
    </Link>
  );
}

function CompactAppCard({ item }: { item: AppItem }) {
  return (
    <AppLink
      item={item}
      className="group flex min-h-36 flex-col rounded-xl bg-white p-5 transition-colors dark:bg-[#1a1a1a] lg:p-6"
    >
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a1a1a] text-white dark:bg-[#f8f8f2] dark:text-[#0d0e0c]">
        <Server className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
      <p className="mt-2 text-sm font-medium leading-snug text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
        {item.description}
      </p>
      <p className="mt-auto pt-6 text-sm font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
        {item.host}
      </p>
    </AppLink>
  );
}

function AppLink({
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
  const href = addUtmParams(item.href, "homepage", item.utmContent, item.host);
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
