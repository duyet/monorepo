import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChartNoAxesCombined,
  FileUser,
  Newspaper,
  Server,
  UserRound,
} from "lucide-react";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { WorkStackSection } from "../components/WorkStackSection";
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
  },
  {
    title: "Resume",
    description:
      "Scalable data infrastructure, intelligent applications, and production systems that stay fast as usage grows.",
    href: addUtmParams("https://cv.duyet.net", "homepage", "resume_card"),
    icon: FileUser,
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
  },
  {
    title: "About",
    description:
      "Clear project surfaces for Rust, ClickHouse, MCP tools, AI agents, and the small systems that make them useful.",
    href: "/about",
    icon: UserRound,
  },
];

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">
        <SiteHeader />

        <main className="relative z-10">
          {/* Hero Section */}
          <section className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 md:py-20 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
              <div className="space-y-[var(--gap-md)]">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                    Duyet Le
                  </p>
                  <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
                    Data engineer building practical AI systems
                  </h1>
                </div>
                <p className="max-w-2xl text-base leading-7 text-[var(--body)] sm:text-lg">
                  I build scalable data infrastructure and intelligent systems that
                  stay clear, useful, and reliable in production.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/about"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--foreground)] px-5 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground)]/85"
                  >
                    About me
                  </Link>
                  <a
                    href={addUtmParams(
                      "https://github.com/duyet",
                      "homepage",
                      "hero_cta"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center px-1 text-sm font-medium underline underline-offset-4 transition-colors hover:text-[var(--muted-foreground)]"
                  >
                    GitHub
                  </a>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="border-y border-[var(--hairline)] py-2">
                  {[
                    ["Data systems", "Pipelines, warehouses, observability"],
                    ["AI products", "Agents, routing, evaluation"],
                    ["Open source", "Rust, TypeScript, Cloudflare"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[140px_1fr] gap-8 border-t border-[var(--hairline)] py-4 first:border-t-0"
                    >
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {label}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Capabilities Section */}
          <section className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Network
              </h2>
            </div>

            <div className="border-y border-[var(--hairline)]">
              {capabilities.map((item) => (
                <CapabilityRow key={item.title} {...item} />
              ))}
            </div>
          </section>

          {/* WorkStack Band */}
          <section className="border-y border-[var(--hairline)] bg-[var(--background-secondary)] py-12 lg:py-16">
            <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
              <WorkStackSection
                repositoryUrl={addUtmParams(
                  "https://github.com/duyet",
                  "homepage",
                  "skills_github"
                )}
              />
            </div>
          </section>

          {/* Apps Section */}
          <section
            id="apps"
            className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14"
          >
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  Apps
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
                  A curated collection of production tools, experimental
                  interfaces, and data systems managed by <span className="text-[var(--foreground)]">@duyetbot</span>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-10 border-y border-[var(--hairline)] md:grid-cols-2 lg:grid-cols-3">
              {apps.map((item) => (
                <AppRow key={item.name} item={item} />
              ))}
            </div>

            <div className="mt-8 flex justify-start">
              <Link
                to="/projects"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--muted-foreground)]"
              >
                View all projects
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  Let’s build
                </h2>
                <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">
                  Interested in data infrastructure, AI agents, or open source
                  collaboration? I’m always open to discussing new projects and
                  ideas.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:me@duyet.net"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--foreground)] px-5 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground)]/85"
                >
                  Send an email
                </a>
                <a
                  href="https://linkedin.com/in/duyet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center px-1 text-sm font-medium underline underline-offset-4 transition-colors hover:text-[var(--muted-foreground)]"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-[1180px] px-5 pb-16 sm:px-8 lg:px-10">
            <Link
              to="/ls"
              className="group flex flex-col justify-between gap-6 border-y border-[var(--hairline)] py-8 text-[var(--foreground)] transition-colors hover:text-[var(--muted-foreground)] md:flex-row md:items-center"
            >
              <div>
                <h3 className="text-2xl font-semibold sm:text-3xl">
                  duyet.net/ls
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
                  Browse redirects, short URLs, and connected apps in the network.
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

function AppRow({
  item,
}: {
  item: AppItem;
}) {
  return (
    <AppLink
      item={item}
      className="group flex items-start gap-4 border-t border-[var(--hairline)] py-5 text-[var(--foreground)] transition-colors first:border-t-0 hover:text-[var(--muted-foreground)]"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center text-[var(--muted-foreground)]">
        <Server className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-snug">
          {item.name}
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)] line-clamp-2">
          {item.description}
        </p>
      </div>
    </AppLink>
  );
}

function CapabilityRow({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof Newspaper;
}) {
  const isExternal = href.startsWith("http");
  const children = (
    <div className="grid gap-4 py-6 md:grid-cols-[32px_180px_1fr] md:items-start">
      <div className="pt-1">
        <Icon className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );

  const classes =
    "block border-t border-[var(--hairline)] text-[var(--foreground)] transition-colors first:border-t-0 hover:text-[var(--muted-foreground)]";

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

function AppLink({
  item,
  className,
  children,
}: {
  item: AppItem;
  className?: string;
  children: ReactNode;
}) {
  const href = addUtmParams(item.href, "homepage", item.utmContent, item.host);

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}
