import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Page,
});

const NAV_GROUPS = [
  {
    label: "Getting started",
    links: [
      { href: "#welcome", text: "Welcome" },
      { href: "#installation", text: "Installation" },
      { href: "#quickstart", text: "Quickstart" },
    ],
  },
  {
    label: "Apps",
    links: [
      { href: "https://duyet.net", text: "Home" },
      { href: "https://blog.duyet.net", text: "Blog" },
      { href: "https://insights.duyet.net", text: "Insights" },
      { href: "https://llm-timeline.duyet.net", text: "LLM Timeline" },
      { href: "https://homelab.duyet.net", text: "Homelab" },
      { href: "https://photos.duyet.net", text: "Photos" },
      { href: "https://ai-percentage.duyet.net", text: "AI Percentage" },
      { href: "https://cv.duyet.net", text: "CV" },
    ],
  },
  {
    label: "Architecture",
    links: [
      { href: "#monorepo", text: "Monorepo layout" },
      { href: "#tanstack-ssg", text: "TanStack Start SSG" },
      { href: "#cloudflare-pages", text: "Cloudflare Pages" },
      { href: "#clickhouse", text: "ClickHouse" },
      { href: "#wakatime", text: "WakaTime" },
    ],
  },
  {
    label: "References",
    links: [
      { href: "https://github.com/duyet/monorepo", text: "GitHub" },
      { href: "#roadmap", text: "Roadmap" },
      { href: "#changelog", text: "Changelog" },
    ],
  },
];

const TOC = [
  { id: "welcome", label: "Welcome" },
  { id: "installation", label: "Installation" },
  { id: "quickstart", label: "Quickstart" },
  { id: "apps-overview", label: "Apps overview" },
  { id: "architecture", label: "Architecture" },
];

function Sidebar() {
  return (
    <aside className="hidden lg:block space-y-8">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            {group.label}
          </p>
          <ul className="space-y-1.5">
            {group.links.map((link) => (
              <li key={link.text}>
                <a
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md transition-colors"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}

function TableOfContents() {
  return (
    <aside className="hidden xl:block">
      <p className="text-sm font-medium mb-3">Table of contents</p>
      <ul className="space-y-2 text-sm">
        {TOC.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={
                i === 0
                  ? "block text-foreground hover:text-foreground transition-colors"
                  : "block text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Content() {
  return (
    <main className="min-w-0">
      <p className="text-sm text-muted-foreground mb-8">
        <a href="/" className="hover:text-foreground transition-colors">
          Documentation
        </a>
        <span className="mx-2">/</span>
        Getting started
      </p>

      <h1 className="text-3xl font-bold tracking-tight mb-4">
        Getting started
      </h1>
      <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-2xl">
        Everything you need to know about the duyet.net monorepo — apps,
        packages, architecture decisions, and deployment workflows.
      </p>

      <h2
        id="welcome"
        className="text-2xl font-semibold tracking-tight mt-12 mb-4 scroll-mt-24"
      >
        Welcome
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        This knowledge base documents the{" "}
        <a
          href="https://github.com/duyet/monorepo"
          className="text-foreground underline underline-offset-4 hover:no-underline"
        >
          duyet/monorepo
        </a>{" "}
        — a Bun + Turborepo monorepo hosting all personal web apps and shared
        packages. Apps are statically pre-rendered with TanStack Start and
        served from Cloudflare Pages.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        The monorepo is in early-stage active development with no backward
        compatibility concerns, so changes move fast and debt is kept near zero.
      </p>

      <h2
        id="installation"
        className="text-2xl font-semibold tracking-tight mt-12 mb-4 scroll-mt-24"
      >
        Installation
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Prerequisites: Git, Bun (latest), Node.js 20+. Clone the repo and
        install workspace dependencies:
      </p>
      <pre className="bg-muted border rounded-md p-4 text-sm overflow-x-auto font-mono mb-4">
        {`git clone https://github.com/duyet/monorepo
cd monorepo
bun install`}
      </pre>
      <p className="text-muted-foreground leading-relaxed">
        All packages and apps share a single lockfile. Workspaces are resolved
        via the root <code className="text-foreground font-mono text-sm">package.json</code> glob{" "}
        <code className="text-foreground font-mono text-sm">apps/*</code> and{" "}
        <code className="text-foreground font-mono text-sm">packages/*</code>.
      </p>

      <h2
        id="quickstart"
        className="text-2xl font-semibold tracking-tight mt-12 mb-4 scroll-mt-24"
      >
        Quickstart
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Run any app individually or all apps in parallel via Turborepo:
      </p>
      <pre className="bg-muted border rounded-md p-4 text-sm overflow-x-auto font-mono mb-4">
        {`# Run a specific app
cd apps/blog && bun dev

# Run all apps in parallel (Turbo)
bun run dev`}
      </pre>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Root-level commands:
      </p>
      <ul className="space-y-2 text-muted-foreground text-sm mb-4 pl-4">
        <li>
          <code className="text-foreground font-mono">bun run lint</code> — Biome
          lint across all packages
        </li>
        <li>
          <code className="text-foreground font-mono">bun run check-types</code>{" "}
          — TypeScript type-check via Turbo
        </li>
        <li>
          <code className="text-foreground font-mono">bun run test</code> — Run
          all tests (~100ms cached)
        </li>
        <li>
          <code className="text-foreground font-mono">bun run cf:deploy:prod</code>{" "}
          — Deploy all apps to Cloudflare Pages production
        </li>
      </ul>

      <h2
        id="apps-overview"
        className="text-2xl font-semibold tracking-tight mt-12 mb-4 scroll-mt-24"
      >
        Apps overview
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Each app lives under <code className="text-foreground font-mono text-sm">apps/</code>, has its own{" "}
        <code className="text-foreground font-mono text-sm">wrangler.toml</code>, and deploys to its own
        Cloudflare Pages project:
      </p>
      <ul className="space-y-3 text-sm">
        {[
          {
            name: "home",
            url: "https://duyet.net",
            desc: "Personal homepage",
          },
          {
            name: "blog",
            url: "https://blog.duyet.net",
            desc: "393 posts, SSG with WASM markdown rendering",
          },
          {
            name: "insights",
            url: "https://insights.duyet.net",
            desc: "WakaTime, GitHub activity dashboards via ClickHouse",
          },
          {
            name: "llm-timeline",
            url: "https://llm-timeline.duyet.net",
            desc: "Timeline of 3 700+ LLM releases (1950–present)",
          },
          {
            name: "homelab",
            url: "https://homelab.duyet.net",
            desc: "Home server infrastructure docs",
          },
          {
            name: "photos",
            url: "https://photos.duyet.net",
            desc: "Photo gallery",
          },
          {
            name: "ai-percentage",
            url: "https://ai-percentage.duyet.net",
            desc: "AI vs human code ratio tracker",
          },
          {
            name: "cv",
            url: "https://cv.duyet.net",
            desc: "Resume / curriculum vitae",
          },
        ].map((app) => (
          <li key={app.name} className="flex gap-3 items-baseline">
            <a
              href={app.url}
              className="text-foreground font-mono text-sm min-w-[140px] hover:underline underline-offset-4"
            >
              {app.name}
            </a>
            <span className="text-muted-foreground">{app.desc}</span>
          </li>
        ))}
      </ul>

      <h2
        id="architecture"
        className="text-2xl font-semibold tracking-tight mt-12 mb-4 scroll-mt-24"
      >
        Architecture
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Key architectural decisions and constraints:
      </p>
      <ul className="space-y-3 text-sm text-muted-foreground pl-4">
        <li>
          <span className="text-foreground font-medium">TanStack Start SSG</span>{" "}
          — all apps are statically pre-rendered. Cloudflare Rocket Loader
          rewrites <code className="text-foreground font-mono">type="module"</code> scripts, which breaks
          Vite SPAs — SSG sidesteps the issue entirely.
        </li>
        <li>
          <span className="text-foreground font-medium">Cloudflare Pages</span>{" "}
          — each app deploys to an independent CF Pages project named{" "}
          <code className="text-foreground font-mono">duyet-&lt;app&gt;</code>. Deployment is gated by{" "}
          <code className="text-foreground font-mono">wrangler.toml</code> presence + a{" "}
          <code className="text-foreground font-mono">cf:deploy:prod</code> script.
        </li>
        <li>
          <span className="text-foreground font-medium">Rust/WASM</span> — 7
          Rust crates compiled to WASM. Blog markdown rendering is 79x faster
          than the JS equivalent. WASM must be built before the blog build or
          600+ posts silently fail to prerender.
        </li>
        <li>
          <span className="text-foreground font-medium">ClickHouse + MotherDuck</span>{" "}
          — time-series data (WakaTime, GitHub activity) is synced to ClickHouse
          and mirrored to MotherDuck for dashboards.
        </li>
        <li>
          <span className="text-foreground font-medium">Shared packages</span>{" "}
          — <code className="text-foreground font-mono">@duyet/components</code>,{" "}
          <code className="text-foreground font-mono">@duyet/libs</code>,{" "}
          <code className="text-foreground font-mono">@duyet/config</code>,{" "}
          <code className="text-foreground font-mono">@duyet/tailwind-config</code>,{" "}
          <code className="text-foreground font-mono">@duyet/tsconfig</code> are consumed by all apps.
        </li>
      </ul>

      <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
        Source:{" "}
        <a
          href="https://github.com/duyet/monorepo"
          className="text-foreground hover:underline underline-offset-4"
        >
          github.com/duyet/monorepo
        </a>{" "}
        · Public URL:{" "}
        <a
          href="https://kb.duyet.net"
          className="text-foreground hover:underline underline-offset-4"
        >
          kb.duyet.net
        </a>
      </div>
    </main>
  );
}

function Page() {
  return (
    <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_240px] gap-8 px-4 sm:px-6 lg:px-8 py-12">
      <Sidebar />
      <Content />
      <TableOfContents />
    </div>
  );
}
