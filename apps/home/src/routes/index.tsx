import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { type AppItem, apps } from "../data/projects";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type ProjectRowItem = AppItem & {
  year: string;
  stack: string;
  status: string;
};

// Lightweight meta enrichment for the home row. Year/stack/status are editorial,
// kept here so we don't widen the shared AppItem type for adjacent apps.
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

        <main className="mx-auto max-w-6xl px-6 md:px-8">
          {/* Hero */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-32">
            <h1 className="font-serif text-6xl tracking-tight md:text-7xl">
              Duyet Le
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[color:var(--muted)]">
              Data & AI engineer. I build practical infrastructure and small
              tools that stay useful in production.
            </p>
          </section>

          {/* Projects — borderless rows */}
          <section className="pb-20 md:pb-32">
            <div className="mb-10 flex items-baseline justify-between">
              <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
                Selected work
              </h2>
              <Link
                to="/projects"
                className="link-underline text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                All projects
              </Link>
            </div>

            <ul className="flex flex-col">
              {featured.map((item, i) => (
                <ProjectRow key={item.name} item={item} index={i} />
              ))}
            </ul>
          </section>

          {/* Contact — single primary CTA */}
          <section className="pb-20 md:pb-32">
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
              Get in touch
            </h2>
            <p className="mt-4 max-w-2xl text-base text-[color:var(--muted)]">
              Open to work on data infrastructure, AI agents, and OSS.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
              <a
                href="mailto:me@duyet.net"
                className="link-underline text-[color:var(--foreground)]"
              >
                me@duyet.net
              </a>
              <a
                href="https://linkedin.com/in/duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                GitHub
              </a>
              <Link
                to="/ls"
                className="link-underline text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
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

function ProjectRow({
  item,
  index,
}: {
  item: ProjectRowItem;
  index: number;
}) {
  return (
    <li
      className="group animate-fade-in py-6 md:py-7"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <ProjectLink item={item}>
        <div className="grid items-baseline gap-2 md:grid-cols-[1fr_auto]">
          <h3 className="font-serif text-2xl tracking-tight text-[color:var(--foreground)] transition-transform duration-150 ease-out group-hover:-translate-y-px">
            <span className="link-underline">{item.name}</span>
          </h3>
          <p className="font-mono text-xs tabular-nums text-[color:var(--subtle)] md:text-right">
            {item.year} · {item.stack} · {item.status}
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
  item: ProjectRowItem;
  children: ReactNode;
}) {
  const href = addUtmParams(item.href, "homepage", item.utmContent, item.host);

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
