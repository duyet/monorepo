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
            <div className="max-w-[920px] space-y-8">
              <div className="space-y-4">
                <p className="font-serif text-xl italic text-[var(--primary)] lg:text-2xl">
                  Duyet Le
                </p>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-[72px] xl:text-[84px]">
                  Data Engineer & <br />
                  <span className="text-[var(--primary)] italic">
                    AI Agent Engineer
                  </span>
                </h1>
              </div>
              <p className="max-w-[680px] text-lg font-normal leading-relaxed text-[var(--body)] sm:text-xl lg:text-[24px] lg:leading-snug">
                I build scalable data infrastructure and intelligent systems that
                feel human — engineered with clarity for production at scale.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/about"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-base font-medium text-white transition-all hover:bg-[var(--primary-active)] hover:shadow-lg active:scale-95"
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
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-6 text-base font-medium transition-all hover:bg-[var(--muted)] active:scale-95"
                >
                  GitHub
                </a>
              </div>
            </div>
          </section>

          {/* Capabilities Section */}
          <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 lg:py-20">
            <div className="mb-12">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-[56px]">
                Network.
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
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-[56px]">
                  Apps.
                </h2>
                <p className="mt-4 max-w-xl text-lg font-medium text-[var(--muted-foreground)] lg:text-xl">
                  A curated collection of production tools, experimental
                  interfaces, and data systems managed by <span className="text-[var(--foreground)]">@duyetbot</span>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apps.map((item) => (
                <AppRow key={item.name} item={item} />
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                to="/projects"
                className="group inline-flex items-center gap-2 font-serif text-xl hover:text-[var(--primary)] transition-colors lg:text-2xl"
              >
                View all artifacts
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 lg:py-20">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-[56px]">
                  Let’s build.
                </h2>
                <p className="mt-4 text-xl text-[var(--muted-foreground)] lg:text-2xl">
                  Interested in data infrastructure, AI agents, or open source
                  collaboration? I’m always open to discussing new projects and
                  ideas.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:me@duyet.net"
                  className="inline-flex h-14 items-center justify-center rounded-xl bg-[var(--foreground)] px-8 text-lg font-medium text-[var(--background)] transition-all hover:bg-[var(--foreground)]/90 hover:shadow-lg active:scale-95"
                >
                  Send an email
                </a>
                <a
                  href="https://linkedin.com/in/duyet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] px-8 text-lg font-medium transition-all hover:bg-[var(--muted)] active:scale-95"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </section>

          {/* Footer Callout (Coral Band) */}
          <section className="mx-auto max-w-[1200px] px-6 pb-20 sm:px-10">
            <Link
              to="/ls"
              className="group flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[var(--primary)] px-10 py-16 text-center text-white transition-all hover:scale-[1.01] active:scale-[0.99] lg:py-24"
            >
              <h3 className="font-serif text-4xl sm:text-5xl lg:text-[72px]">
                duyet.net/ls
              </h3>
              <p className="mt-6 max-w-lg text-lg text-white/90 lg:text-xl">
                Browse the complete directory of redirects, short URLs, and
                connected apps in the network.
              </p>
              <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[var(--primary)] transition-transform group-hover:rotate-45">
                <ArrowRight className="h-7 w-7" />
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
      className="group flex items-start gap-4 rounded-xl border border-[var(--border)] p-5 transition-all hover:bg-[var(--surface-soft)] hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--background)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all group-hover:scale-110">
        <Server className="h-6 w-6" />
      </div>
      <div className="min-w-0 pt-1">
        <h3 className="font-serif text-xl leading-snug tracking-tight group-hover:text-[var(--primary)] transition-colors">
          {item.name}
        </h3>
        <p className="mt-2 text-[15px] font-normal leading-relaxed text-[var(--muted-foreground)] line-clamp-2">
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
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-8 w-8 shrink-0 lg:h-10 lg:w-10 text-[var(--foreground)] opacity-20" />
        <span className="font-serif text-xl opacity-40">0{title === "Blog" ? 1 : title === "Resume" ? 2 : title === "Insights" ? 3 : 4}</span>
      </div>
      <div className="mt-8">
        <h3 className="font-serif text-2xl lg:text-[32px]">{title}</h3>
        <p className="mt-3 text-lg font-normal leading-snug text-[var(--body)] lg:text-xl">
          {description}
        </p>
      </div>
    </div>
  );

  const classes = cn(
    "flex min-h-[240px] flex-col rounded-2xl transition-all hover:-translate-y-2 hover:shadow-xl lg:min-h-[280px]",
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
