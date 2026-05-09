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
    className: "bg-[#efe9de] dark:bg-[#252320]",
  },
  {
    title: "Resume",
    description:
      "Scalable data infrastructure, intelligent applications, and production systems that stay fast as usage grows.",
    href: addUtmParams("https://cv.duyet.net", "homepage", "resume_card"),
    icon: FileUser,
    className: "bg-[#f5f0e8] dark:bg-[#1f1e1b]",
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
    className: "bg-[#e8e0d2] dark:bg-[#2a2824]",
  },
  {
    title: "About",
    description:
      "Clear project surfaces for Rust, ClickHouse, MCP tools, AI agents, and the small systems that make them useful.",
    href: "/about",
    icon: UserRound,
    className: "bg-[#faf9f5] border border-[var(--border)] dark:bg-[#181715]",
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
          <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 md:py-16 lg:py-20 xl:py-24">
            <div className="max-w-[920px] space-y-6">
              <h1 className="font-serif text-5xl leading-tight sm:text-6xl lg:text-[64px]">
                Meet your <span className="text-[var(--primary)] italic">thinking partner</span> in Data & AI.
              </h1>
              <p className="max-w-[620px] text-lg font-normal leading-relaxed text-[var(--body)] sm:text-xl lg:text-[22px] lg:leading-snug">
                Building scalable data infrastructure and intelligent systems that feel human, written with clarity and engineered for production.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/about"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-base font-medium text-white transition-colors hover:bg-[var(--primary-active)]"
                >
                  Learn about my work
                </Link>
                <a
                  href={addUtmParams("https://github.com/duyet", "homepage", "hero_cta")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-6 text-base font-medium transition-colors hover:bg-[var(--muted)]"
                >
                  View GitHub
                </a>
              </div>
            </div>
          </section>

          {/* Capabilities Section */}
          <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 lg:py-20">
            <div className="mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px]">
                Explore the network.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              {capabilities.map((item) => (
                <CapabilityCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          {/* WorkStack (Cream Card Band) */}
          <section className="bg-[var(--muted)] py-16 lg:py-24">
            <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
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
            className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 lg:py-20"
          >
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[48px]">
                  Apps
                </h2>
                <p className="mt-2 text-lg font-medium text-[var(--muted-foreground)] lg:text-xl">
                  A curated collection of production tools, experimental interfaces, and data systems.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)] text-[8px]">
                  ✱
                </span>
                Managed by @duyetbot
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {apps.map((item) => (
                <AppRow key={item.name} item={item} />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                to="/projects"
                className="group inline-flex items-center gap-2 font-serif text-lg hover:text-[var(--primary)] transition-colors lg:text-xl"
              >
                View all artifacts
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </section>

          {/* Footer Callout (Coral Band) */}
          <section className="mx-auto max-w-[1200px] px-6 pb-16 sm:px-10">
            <Link
              to="/ls"
              className="group flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[var(--primary)] px-10 py-12 text-center text-white transition-transform hover:scale-[1.01] active:scale-[0.99] lg:py-20"
            >
              <h3 className="font-serif text-3xl sm:text-5xl lg:text-[64px]">
                https://duyet.net/ls
              </h3>
              <p className="mt-4 text-lg text-white/90 lg:text-xl">
                Browse the complete directory of redirects and short URLs.
              </p>
              <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--primary)] transition-transform group-hover:rotate-45">
                <ArrowRight className="h-6 w-6" />
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
      className="group flex items-start gap-4 rounded-xl border border-[var(--border)] p-4 transition-all hover:bg-[var(--surface-card)] hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
        <Server className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-serif text-lg leading-snug tracking-tight group-hover:text-[var(--primary)] transition-colors">
          {item.name}
        </h3>
        <p className="mt-1 text-sm font-normal leading-relaxed text-[var(--muted-foreground)] line-clamp-2">
          {item.description}
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
    <div className="flex h-full flex-col justify-between p-6 lg:p-7">
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-7 w-7 shrink-0 lg:h-8 lg:w-8 text-[var(--foreground)] opacity-20" />
        <span className="font-serif text-lg opacity-40">0{title === "Blog" ? 1 : title === "Resume" ? 2 : title === "Insights" ? 3 : 4}</span>
      </div>
      <div className="mt-6">
        <h3 className="font-serif text-xl lg:text-[28px]">{title}</h3>
        <p className="mt-2 text-base font-normal leading-snug text-[var(--body)] lg:text-lg">
          {description}
        </p>
      </div>
    </div>
  );

  const classes = cn(
    "flex min-h-[220px] flex-col rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg lg:min-h-[240px]",
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
