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

const statusDot: Record<string, string> = {
  Live: "bg-emerald-500",
  Beta: "bg-amber-500",
  OSS: "bg-[color:var(--subtle)]",
};

const featured: ProjectRowItem[] = apps.slice(0, 5).map((item) => ({
  ...item,
  ...(rowMeta[item.name] ?? { year: "—", stack: "—", status: "Live" }),
}));

const metrics = [
  { value: "10+", label: "Years building" },
  { value: "12", label: "Projects shipped" },
  { value: "7", label: "Open source" },
  { value: "79x", label: "WASM speedup" },
];

const expertise = [
  {
    title: "Data Infrastructure",
    description:
      "Real-time analytics with ClickHouse, observability pipelines, and monitoring dashboards that handle production traffic at scale.",
  },
  {
    title: "AI & Agent Tools",
    description:
      "LLM-powered agents, MCP servers, Claude plugins, and streaming tool-use interfaces built on Cloudflare's edge.",
  },
  {
    title: "Edge Computing",
    description:
      "Cloudflare Workers, Durable Objects, and Rust-to-WASM modules compiled for near-zero cold starts at the edge.",
  },
];

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="min-h-screen overflow-x-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
        <SiteHeader />

        <main className="mx-auto max-w-[1200px] px-6 md:px-8">
          {/* ── Hero ── */}
          <section className="pt-16 pb-10 md:pt-20 md:pb-12">
            <div className="max-w-2xl">
              <h1 className="font-medium text-4xl md:text-6xl tracking-tight leading-[1.1] text-[color:var(--foreground)]">
                Duyet Le
              </h1>
              <p className="mt-4 max-w-lg text-base md:text-lg text-[color:var(--muted)] leading-relaxed">
                Data engineer and AI engineer building infrastructure,
                agents, and lightweight tools that stay simple in production.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:me@duyet.net"
                  className="inline-flex items-center justify-center rounded-lg bg-[color:var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Get in touch
                </a>
                <Link
                  to="/projects"
                  className="inline-flex items-center justify-center rounded-lg border border-[color:var(--hairline)] px-5 py-2.5 text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--faint)] transition-all cursor-pointer"
                >
                  View projects
                </Link>
              </div>
            </div>
          </section>

          {/* ── Metrics ── */}
          <section className="py-6 md:py-8 border-y border-[color:var(--hairline)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-2xl md:text-3xl font-medium tracking-tight tabular-nums text-[color:var(--foreground)]">
                    {m.value}
                  </p>
                  <p className="mt-0.5 text-xs text-[color:var(--muted)]">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Selected Work ── */}
          <section className="py-12 md:py-16">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-2xl font-medium tracking-tight md:text-3xl text-[color:var(--foreground)]">
                Selected work
              </h2>
              <Link
                to="/projects"
                className="link-underline text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                All projects
              </Link>
            </div>

            <div className="grid grid-flow-dense grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((item, i) => (
                <div
                  key={item.name}
                  className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}
                >
                  <ProjectCard item={item} index={i} featured={i === 0} />
                </div>
              ))}
            </div>
          </section>

          {/* ── What I Build ── */}
          <section className="py-12 md:py-16">
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl text-[color:var(--foreground)] mb-6">
              What I build
            </h2>
            <div className="border-t border-[color:var(--hairline)]">
              {expertise.map((area) => (
                <div
                  key={area.title}
                  className="group py-5 border-b border-[color:var(--hairline)] flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8"
                >
                  <h3 className="text-base font-semibold tracking-tight text-[color:var(--foreground)] md:w-48 shrink-0 group-hover:text-[color:var(--accent)] transition-colors duration-150">
                    {area.title}
                  </h3>
                  <p className="text-sm text-[color:var(--muted)] leading-relaxed max-w-2xl">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Sites ── */}
          <section id="sites" className="py-12 md:py-16">
            <div className="mb-6">
              <h2 className="text-2xl font-medium tracking-tight md:text-3xl text-[color:var(--foreground)]">
                Sites
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[color:var(--muted)] leading-relaxed">
                Live applications deployed from this monorepo. Each ships
                directly to its own production domain.
              </p>
            </div>
            <div className="border-t border-[color:var(--hairline)]">
              {siblingApps.map((item) => (
                <SiteRow key={item.domain} item={item} />
              ))}
            </div>
          </section>

          {/* ── Contact ── */}
          <section className="py-12 md:py-16">
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl text-[color:var(--foreground)]">
              Get in touch
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--muted)] leading-relaxed">
              Open to work on data infrastructure, AI agents, and open-source
              software.
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
  featured = false,
}: {
  item: ProjectRowItem;
  index: number;
  featured?: boolean;
}) {
  return (
    <div
      className="card-v2 p-4 md:p-5 flex flex-col justify-between h-full group animate-fade-in relative"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <ProjectLink item={item}>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`font-semibold tracking-tight text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors duration-150 ${
                featured ? "text-xl md:text-2xl" : "text-lg"
              }`}
            >
              {item.name}
            </h3>
            <span className="text-[color:var(--muted)] group-hover:text-[color:var(--accent)] transition-colors duration-150">
              <ArrowSquareOut size={18} weight="bold" />
            </span>
          </div>
          <p
            className={`text-[color:var(--muted)] leading-relaxed ${
              featured ? "text-base" : "text-sm"
            } ${featured ? "line-clamp-4" : "line-clamp-3"}`}
          >
            {item.description}
          </p>
        </div>

        <div className="mt-6 border-t border-[color:var(--hairline)] pt-3 flex items-center justify-between text-[11px] font-mono text-[color:var(--subtle)]">
          <span className="tabular-nums font-semibold">{item.year}</span>
          <div className="flex items-center gap-2">
            <span>{item.stack}</span>
            <span className="h-1 w-1 rounded-full bg-[color:var(--hairline)]" />
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  statusDot[item.status] ?? "bg-[color:var(--hairline)]"
                }`}
              />
              <span className="font-semibold">{item.status}</span>
            </span>
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
      className="group grid gap-3 border-b border-[color:var(--hairline)] py-3.5 text-[color:var(--foreground)] transition-colors duration-150 ease-out hover:text-[color:var(--accent)] sm:grid-cols-[160px_1fr_200px] sm:gap-6 items-center"
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
