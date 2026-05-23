import { ArrowSquareOut } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { type AppItem, apps } from "../data/projects";
import { type SiblingApp, siblingApps } from "../data/sibling-apps";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type ProjectRowItem = AppItem & {
  year: string;
  stack: string;
  status: string;
};

// Editorial meta enrichment
const rowMeta: Record<string, { year: string; stack: string; status: string }> =
  {
    AnyRouter: { year: "2026", stack: "Cloudflare · TS", status: "Live" },
    "ClickHouse Monitoring": {
      year: "2026",
      stack: "Next.js · ClickHouse",
      status: "Live",
    },
    ShareHTML: { year: "2025", stack: "Workers · TS", status: "Live" },
    "AI Agents": { year: "2026", stack: "Agents SDK", status: "Beta" },
    "Agent State": { year: "2026", stack: "Durable Objects", status: "Beta" },
    "MCP Tools": { year: "2025", stack: "MCP · TS", status: "Live" },
    "Claude Codex Plugins": {
      year: "2026",
      stack: "Claude · TS",
      status: "OSS",
    },
    Stamps: { year: "2024", stack: "Workers · KV", status: "Live" },
    PageView: { year: "2024", stack: "Workers · D1", status: "Live" },
    "LLM Timeline": { year: "2026", stack: "TanStack Start", status: "Live" },
    "Rust Tieng Viet": { year: "2022", stack: "mdBook · Rust", status: "OSS" },
    "Duyet Serif": { year: "2024", stack: "Fonts", status: "OSS" },
  };

const featured: ProjectRowItem[] = apps.slice(0, 6).map((item) => ({
  ...item,
  ...(rowMeta[item.name] ?? {
    year: "—",
    stack: "—",
    status: "Live",
  }),
}));

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
        <SiteHeader />

        <main className="mx-auto max-w-[1200px] px-6 md:px-8">
          {/* Asymmetric Hero Section */}
          <section className="pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 lg:gap-16 items-center">
              {/* Left Side: Editorial Content */}
              <div className="flex flex-col items-start text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] mb-4">
                  Data & AI Engineer
                </span>
                <h1 className="font-medium text-5xl md:text-7xl tracking-tight leading-[1.05] text-[color:var(--foreground)]">
                  Duyet Le
                </h1>
                <p className="mt-6 max-w-xl text-lg text-[color:var(--muted)] leading-relaxed">
                  I build practical infrastructure, robust AI integrations, and lightweight tools that remain simple and effective in production.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="mailto:me@duyet.net"
                    className="inline-flex items-center justify-center rounded-lg bg-[color:var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-[color:var(--accent)]/10"
                  >
                    Get in touch
                  </a>
                  <Link
                    to="/projects"
                    className="inline-flex items-center justify-center rounded-lg border border-[color:var(--hairline)] bg-transparent px-5 py-2.5 text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--faint)] transition-all cursor-pointer"
                  >
                    View Projects
                  </Link>
                </div>
              </div>

              {/* Right Side: Elegant Live-Activity Card */}
              <div className="w-full max-w-md lg:max-w-none">
                <div className="card-v2 p-6 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[color:var(--accent)]/10 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--accent)] bg-[color:var(--accent)]/10 px-2.5 py-0.5 rounded-full font-semibold">
                      Live Status
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--accent)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--accent)]"></span>
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold tracking-tight text-[color:var(--foreground)]">Active Worktree</h4>
                    <p className="mt-1 text-xs text-[color:var(--muted)] font-mono">v2/home-refresh</p>
                  </div>
                  <div className="border-t border-[color:var(--hairline)] pt-3 flex items-center justify-between text-[11px] font-mono text-[color:var(--subtle)]">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Sync: 100% OK</span>
                    </span>
                    <span className="tabular-nums">2026-05-23</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Premium Grid Project Section */}
          <section className="pb-20 md:pb-32">
            <div className="mb-10 flex items-baseline justify-between">
              <h2 className="text-3xl font-medium tracking-tight md:text-4xl text-[color:var(--foreground)]">
                Selected work
              </h2>
              <Link
                to="/projects"
                className="link-underline text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                All projects
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((item, i) => (
                <ProjectCard key={item.name} item={item} index={i} />
              ))}
            </div>
          </section>

          {/* Sites Section — sibling apps in the monorepo */}
          <section
            id="sites"
            className="pb-20 md:pb-32"
          >
            <div className="mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--accent)] mb-3 block">
                Monorepo Directory
              </span>
              <h2 className="text-3xl font-medium tracking-tight md:text-4xl text-[color:var(--foreground)]">
                Sites
              </h2>
              <p className="mt-4 max-w-2xl text-base text-[color:var(--muted)] leading-relaxed">
                Live applications deployed from this monorepo. Each ships directly to its own production domain.
              </p>
            </div>

            <div className="border-t border-[color:var(--hairline)]">
              {siblingApps.map((item) => (
                <SiteRow key={item.domain} item={item} />
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="pb-20 md:pb-32">
            <h2 className="text-3xl font-medium tracking-tight md:text-4xl text-[color:var(--foreground)]">
              Get in touch
            </h2>
            <p className="mt-4 max-w-2xl text-base text-[color:var(--muted)] leading-relaxed">
              Open to work on data infrastructure, AI agents, and open-source software.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <a
                href="mailto:me@duyet.net"
                className="link-underline text-[color:var(--foreground)] font-medium"
              >
                me@duyet.net
              </a>
              <a
                href="https://linkedin.com/in/duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-[color:var(--muted)] hover:text-[color:var(--foreground)] font-medium"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-[color:var(--muted)] hover:text-[color:var(--foreground)] font-medium"
              >
                GitHub
              </a>
              <Link
                to="/ls"
                className="link-underline text-[color:var(--muted)] hover:text-[color:var(--foreground)] font-medium"
              >
                Short URLs
              </Link>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

function ProjectCard({
  item,
  index,
}: {
  item: ProjectRowItem;
  index: number;
}) {
  return (
    <div
      className="card-v2 p-5 flex flex-col justify-between h-full group animate-fade-in relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <ProjectLink item={item}>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-lg tracking-tight text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors duration-150">
              {item.name}
            </h3>
            <span className="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition-colors duration-150">
              <ArrowSquareOut size={18} weight="bold" />
            </span>
          </div>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        <div className="mt-6 border-t border-[color:var(--hairline)] pt-3 flex items-center justify-between text-[11px] font-mono text-[color:var(--subtle)]">
          <span className="tabular-nums font-semibold">{item.year}</span>
          <div className="flex items-center gap-2">
            <span>{item.stack}</span>
            <span className="h-1 w-1 rounded-full bg-[color:var(--hairline)]" />
            <span className="text-[color:var(--accent)] font-semibold">{item.status}</span>
          </div>
        </div>
      </ProjectLink>
    </div>
  );
}

function ProjectLink({
  item,
  children,
}: {
  item: ProjectRowItem;
  children: ReactNode;
}) {
  const href = addUtmParams(item.href, "homepage", item.utmContent, item.host);

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className="block no-underline h-full"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="block no-underline h-full">
      {children}
    </Link>
  );
}

function SiteRow({ item }: { item: SiblingApp }) {
  return (
    <a
      href={`https://${item.domain}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid gap-4 border-b border-[color:var(--hairline)] py-5 text-[color:var(--foreground)] transition-colors duration-150 ease-out hover:text-[color:var(--accent)] sm:grid-cols-[180px_1fr_220px] sm:gap-8 items-center"
    >
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-snug transition-transform duration-150 ease-out group-hover:translate-x-0.5 text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
          {item.name}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-[color:var(--muted)] sm:max-w-2xl">
        {item.description}
      </p>
      <p className="truncate font-mono text-xs tabular-nums text-[color:var(--subtle)] transition-colors duration-150 ease-out group-hover:text-[color:var(--accent)] sm:text-right">
        {item.domain}
      </p>
    </a>
  );
}
