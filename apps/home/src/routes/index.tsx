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
import { HomeAgentsChat } from "../components/HomeAgentsChat";
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
    className: "bg-[var(--muted)]",
  },
  {
    title: "Resume",
    description:
      "Scalable data infrastructure, intelligent applications, and production systems that stay fast as usage grows.",
    href: addUtmParams("https://cv.duyet.net", "homepage", "resume_card"),
    icon: FileUser,
    className: "bg-[#bfdbfe] dark:bg-blue-900/30",
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
    className: "bg-[#a7f3d0] dark:bg-emerald-900/30",
  },
  {
    title: "About",
    description:
      "Clear project surfaces for Rust, ClickHouse, MCP tools, AI agents, and the small systems that make them useful.",
    href: "/about",
    icon: UserRound,
    className: "bg-[#fecaca] dark:bg-rose-900/30",
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

      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">
        <SiteHeader />

        <main className="relative z-10">
          {/* Hero Section */}
          <section className="mx-auto max-w-[1200px] px-6 py-20 sm:px-10 md:py-28 lg:py-36 xl:py-44">
            <div className="max-w-[920px] space-y-10">
              <h1 className="font-serif text-5xl leading-[1.1] tracking-[-0.03em] sm:text-7xl lg:text-8xl">
                Meet your <span className="text-[var(--primary)] italic">thinking partner</span> in Data & AI.
              </h1>
              <p className="max-w-[620px] text-xl font-normal leading-relaxed text-[var(--body)] sm:text-2xl lg:text-3xl lg:leading-snug">
                Building scalable data infrastructure and intelligent systems that feel human, written with clarity and engineered for production.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/about"
                  className="inline-flex h-14 items-center justify-center rounded-lg bg-[var(--primary)] px-8 text-lg font-medium text-white transition-colors hover:bg-[var(--primary-active)]"
                >
                  Learn about my work
                </Link>
                <a
                  href={addUtmParams("https://github.com/duyet", "homepage", "hero_cta")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-8 text-lg font-medium transition-colors hover:bg-[var(--muted)]"
                >
                  View GitHub
                </a>
              </div>
            </div>
          </section>

          {/* Product/Agent Section (Dark Band) */}
          <section className="bg-[var(--surface-dark)] py-20 lg:py-32">
            <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
              <div className="mb-12 flex flex-col justify-between gap-6 lg:mb-20 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <h2 className="font-serif text-4xl text-[var(--on-dark)] sm:text-5xl lg:text-6xl">
                    Autonomous assistance.
                  </h2>
                  <p className="mt-6 text-xl text-[var(--on-dark-soft)] lg:text-2xl">
                    Experience the next generation of data engineering with AI agents that help you build, monitor, and optimize.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[var(--on-dark-soft)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Live Agent System
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl bg-[#1f1e1b] shadow-2xl ring-1 ring-white/10">
                <HomeAgentsChat />
              </div>
            </div>
          </section>

          {/* Capabilities Section */}
          <section className="mx-auto max-w-[1200px] px-6 py-24 sm:px-10 lg:py-36">
            <div className="mb-16">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl">
                Explore the network.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10">
              {capabilities.map((item) => (
                <CapabilityCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          {/* WorkStack (Cream Card Band) */}
          <section className="bg-[var(--muted)] py-24 lg:py-36">
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
            className="mx-auto max-w-[1200px] px-6 py-24 sm:px-10 lg:py-36"
          >
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl">
                  Featured Systems.
                </h2>
                <p className="mt-4 text-xl font-medium text-[var(--muted-foreground)] lg:text-2xl">
                  Production-grade tools and experimental interfaces.
                </p>
              </div>
              <div className="flex items-center gap-2 text-base font-medium text-[var(--muted-foreground)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)] text-[10px]">
                  ✱
                </span>
                Managed by @duyetbot
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {visualApps.map((item) => (
                <ProjectCard key={item.name} item={item} />
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Link
                to="/projects"
                className="group inline-flex items-center gap-2 font-serif text-2xl hover:text-[var(--primary)] transition-colors lg:text-3xl"
              >
                View all artifacts
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {compactApps.length > 0 && (
              <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {compactApps.map((item) => (
                  <CompactAppCard key={item.name} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Footer Callout (Coral Band) */}
          <section className="mx-auto max-w-[1200px] px-6 pb-24 sm:px-10">
            <Link
              to="/ls"
              className="group flex flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-[var(--primary)] px-10 py-20 text-center text-white transition-transform hover:scale-[1.01] active:scale-[0.99] lg:py-32"
            >
              <h3 className="font-serif text-4xl sm:text-6xl lg:text-7xl">
                Looking for a link?
              </h3>
              <p className="mt-6 text-xl text-white/90 lg:text-2xl">
                Browse the complete directory of redirects and short URLs.
              </p>
              <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--primary)] transition-transform group-hover:rotate-45">
                <ArrowRight className="h-8 w-8" />
              </div>
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
}: {
  item: AppItem;
}) {
  return (
    <AppLink
      item={item}
      className={`group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-[var(--border)] p-8 transition-all hover:-translate-y-1 hover:shadow-xl ${item.tone ?? "bg-[var(--muted)]"}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
      <div className="relative z-10 text-white">
        <h3 className="font-serif text-2xl lg:text-3xl">
          {item.name}
        </h3>
        <p className="mt-3 text-lg font-normal leading-snug text-white/90 line-clamp-2">
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
    <div className="flex h-full flex-col justify-between p-8 lg:p-10">
      <div className="flex items-start justify-between gap-6">
        <Icon className="h-10 w-10 shrink-0 lg:h-12 lg:w-12 text-[var(--foreground)] opacity-20" />
        <span className="font-serif text-xl opacity-40">0{title === "Blog" ? 1 : title === "Resume" ? 2 : title === "Insights" ? 3 : 4}</span>
      </div>
      <div className="mt-12">
        <h3 className="font-serif text-3xl lg:text-4xl">{title}</h3>
        <p className="mt-4 text-xl font-normal leading-relaxed text-[var(--body)] lg:text-2xl">
          {description}
        </p>
      </div>
    </div>
  );

  const classes = cn(
    "flex min-h-[320px] flex-col rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg lg:min-h-[400px]",
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
      className={`group flex min-h-48 flex-col justify-between rounded-2xl border border-[var(--border)] p-8 transition-all hover:bg-[var(--muted)] lg:p-10`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]">
        <Server className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-serif text-2xl tracking-tight">{item.name}</h3>
        <p className="mt-2 text-lg font-normal leading-snug text-[var(--muted-foreground)]">
          {item.description}
        </p>
      </div>
    </AppLink>
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

