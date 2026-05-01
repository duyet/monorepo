import { cn } from "@duyet/libs/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart,
  BookOpen,
  FileText,
  Link as LinkIcon,
  Server,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { BuildDate } from "../components/BuildDate";
import { FooterInteractive } from "../components/FooterInteractive";
import { KeyboardFeatures } from "../components/KeyboardFeatures";

export const Route = createFileRoute("/")({
  component: HomePage,
});

interface AppItem {
  name: string;
  href: string;
  host: string;
  utmContent: string;
  description: string;
  screenshot?: string;
}

const apps: AppItem[] = [
  {
    name: "LLM Timeline",
    href: "/",
    host: "llm-timeline.duyet.net",
    utmContent: "llm_timeline_bento",
    description: "Interactive timeline of 50+ LLM models from 2017-2025",
    screenshot: "/screenshots/llm-timeline.png",
  },
  {
    name: "AI Agents",
    href: "/agents",
    host: "agents.duyet.net",
    utmContent: "agents_bento",
    description: "AI chat interface with Cloudflare Workers AI and streaming",
    screenshot: "/screenshots/ai-agents.png",
  },
  {
    name: "OpenClaw",
    href: "/claw",
    host: "claw.duyet.net",
    utmContent: "claw_bento",
    description: "OpenClaw Management Dashboard",
    screenshot: "/screenshots/openclaw.png",
  },
  {
    name: "MCP Tools",
    href: "/mcp",
    host: "mcp.duyet.net",
    utmContent: "mcp_bento",
    description: "Model Context Protocol tools and integrations",
    screenshot: "/screenshots/mcp-tools-art.png",
  },
  {
    name: "Rust Tiếng Việt",
    href: "/rust",
    host: "rust-tieng-viet.github.io",
    utmContent: "rust_bento",
    description: "Rust programming language documentation in Vietnamese",
    screenshot: "/screenshots/rust-art.png",
  },
  {
    name: "ClickHouse Monitoring",
    href: "/clickhouse-monitoring",
    host: "clickhouse.duyet.net",
    utmContent: "ch_monitor_bento",
    description: "Real-time monitoring dashboard for ClickHouse clusters",
    screenshot: "/screenshots/ch-monitor.png",
  },
  {
    name: "Claude Plugins",
    href: "/claude-plugins",
    host: "github.com/duyet/claude-plugins",
    utmContent: "claude_plugins_bento",
    description: "Official plugins for Claude Code and AI SDK",
  },
  {
    name: "Stamp",
    href: "/stamp",
    host: "stamp.duyet.net",
    utmContent: "stamp_bento",
    description: "URL shortener with analytics and custom domains",
    screenshot: "/screenshots/stamp.png",
  },
  {
    name: "AgentState",
    href: "/agentstate",
    host: "agentstate.app",
    utmContent: "agentstate_bento",
    description: "AI agent state management and debugging tools",
  },
  {
    name: "okie.one",
    href: "/okie",
    host: "okie.one",
    utmContent: "okie_bento",
    description: "Vietnamese community platform for developers",
    screenshot: "/screenshots/okie.png",
  },
  {
    name: "pageview",
    href: "https://pageview.duyet.net",
    host: "pageview.duyet.net",
    utmContent: "pageview_bento",
    description: "Simple, privacy-friendly analytics for websites",
  },
];

const capabilities = [
  {
    title: "Write",
    description:
      "Deep dives into data engineering architecture, distributed systems, AI agents, and lessons learned from scaling open source.",
    href: addUtmParams("https://blog.duyet.net", "homepage", "blog_card"),
    icon: BookOpen,
    className: "bg-white",
  },
  {
    title: "Build",
    description:
      "Scalable data infrastructure, intelligent applications, and production systems that stay fast as usage grows.",
    href: addUtmParams("https://cv.duyet.net", "homepage", "resume_card"),
    icon: Workflow,
    className: "bg-[#bfdbfe]",
  },
  {
    title: "Measure",
    description:
      "Live analytics for coding activity, site traffic, token usage, and operational systems across the Duyet network.",
    href: addUtmParams(
      "https://insights.duyet.net",
      "homepage",
      "insights_card"
    ),
    icon: BarChart,
    className: "bg-[#a7f3d0]",
  },
  {
    title: "Document",
    description:
      "Clear project surfaces for Rust, ClickHouse, MCP tools, AI agents, and the small systems that make them useful.",
    href: "/about",
    icon: FileText,
    className: "bg-[#fecaca]",
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

      <div className="min-h-screen bg-[#f8f8f2] text-[#1a1a1a]">
        <header className="sticky top-0 z-50 bg-[#f8f8f2]/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
            <Link to="/" className="flex items-center gap-3">
              <DuyetMark />
              <span className="text-xl font-semibold tracking-tight">
                Duyet Le
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
              <a href="https://blog.duyet.net">Blog</a>
              <a href="https://cv.duyet.net">Experience</a>
              <a href="https://insights.duyet.net">Insights</a>
              <Link to="/about">About</Link>
            </nav>

            <a
              href={addUtmParams(
                "https://status.duyet.net",
                "homepage",
                "header_status"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-24 items-center justify-end gap-2 text-sm font-medium"
            >
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              <span>Status</span>
            </a>
          </div>
        </header>

        <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] pb-16 2xl:rounded-b-[4rem]">
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
              {visualApps.slice(0, 6).map((item, index) => (
                <ProjectCard
                  key={item.name}
                  item={item}
                  shortcutNumber={index + 1}
                />
              ))}
            </div>

            <div className="my-10 flex justify-center lg:my-14">
              <a
                href="#apps"
                className="rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] lg:px-8 lg:text-lg"
              >
                View more apps
              </a>
            </div>
          </section>

          <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl xl:text-4xl">
              What I do
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:gap-8">
              {capabilities.map((item) => (
                <CapabilityCard key={item.title} {...item} />
              ))}
            </div>

            <div className="my-10 flex justify-center lg:my-14">
              <Link
                to="/about"
                className="rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] lg:px-8 lg:text-lg"
              >
                More about Duyet
              </Link>
            </div>
          </section>

          <section
            id="apps"
            className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40"
          >
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl xl:text-4xl">
                Apps
              </h2>
              <p className="text-base font-medium text-[#1a1a1a]/70">
                Managed by @duyetbot AI Agent
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
              {visualApps.slice(6).map((item, index) => (
                <ProjectCard
                  key={item.name}
                  item={item}
                  shortcutNumber={index < 4 ? index + 7 : undefined}
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
              {compactApps.map((item) => (
                <CompactAppCard key={item.name} item={item} />
              ))}
            </div>
          </section>

          <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
            <Link
              to="/ls"
              className="group grid gap-5 rounded-xl bg-white p-6 transition-colors hover:bg-[#f2f2eb] md:grid-cols-[1fr_auto] md:items-center lg:p-8"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a1a1a] text-white">
                  <LinkIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    duyet.net/ls
                  </h3>
                  <p className="mt-1 text-base font-medium text-[#1a1a1a]/70">
                    All short URLs and redirects
                  </p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Link>
          </section>
        </main>

        <footer className="sticky bottom-0 bg-white px-5 pb-12 pt-24 sm:px-8 lg:px-10 lg:pb-16 lg:pt-28 xl:pb-20">
          <div className="mx-auto max-w-[1280px]">
            <h2 className="max-w-[820px] text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Build useful systems, then explain them clearly.
            </h2>
            <div className="my-12 flex flex-wrap items-center gap-4 md:my-16">
              <a
                href={addUtmParams(
                  "https://github.com/duyet",
                  "homepage",
                  "footer_github"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] lg:px-8 lg:text-lg"
              >
                GitHub
              </a>
              <a
                href={addUtmParams(
                  "https://linkedin.com/in/duyet",
                  "homepage",
                  "footer_linkedin"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#1a1a1a]/15 px-6 py-4 text-base font-medium transition-colors hover:border-[#1a1a1a] lg:px-8 lg:text-lg"
              >
                LinkedIn
              </a>
            </div>

            <hr className="border-[#1a1a1a]/15" />

            <div className="grid gap-6 pt-10 text-base font-medium md:grid-cols-2 md:pt-16">
              <div className="flex flex-wrap items-center gap-6">
                <span>© Duyet Le</span>
                <a href="/llms.txt" className="underline underline-offset-2">
                  llms.txt
                </a>
                <Suspense fallback={<div className="h-10 w-10" />}>
                  <FooterInteractive />
                </Suspense>
              </div>
              <div className="flex flex-wrap items-center gap-6 md:justify-end">
                <BuildDate />
                <a
                  href={addUtmParams(
                    "https://status.duyet.net",
                    "homepage",
                    "footer_status"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <span className="h-3 w-3 rounded-full bg-orange-500" />
                  <span>All Systems Operational</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function DuyetMark() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#1a1a1a]" />
      <span className="translate-y-1 bg-[#1a1a1a]" />
      <span className="-translate-y-1 bg-[#1a1a1a]" />
      <span className="bg-[#1a1a1a]" />
    </span>
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
      className="group relative overflow-hidden rounded-xl bg-[#1a1a1a]"
      shortcutNumber={shortcutNumber}
    >
      <div className="absolute inset-0 z-10 h-1/2 bg-gradient-to-b from-black/65 to-transparent" />
      <img
        src={item.screenshot}
        alt={item.name}
        loading="lazy"
        className="aspect-[16/10] h-full w-full rounded-xl object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
      />
      <div className="absolute left-6 top-6 z-20 text-white lg:left-8 lg:top-8">
        <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
        <p className="mt-1 text-xs font-medium text-white/80">
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
  icon: typeof BookOpen;
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
      className="group flex min-h-36 flex-col rounded-xl bg-white p-5 transition-colors hover:bg-[#f2f2eb] lg:p-6"
    >
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a1a1a] text-white">
        <Server className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{item.name}</h3>
      <p className="mt-2 text-sm font-medium leading-snug text-[#1a1a1a]/70">
        {item.description}
      </p>
      <p className="mt-auto pt-6 text-sm font-medium text-[#1a1a1a]/55">
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
        target="_blank"
        rel="noopener noreferrer"
        className={className}
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
