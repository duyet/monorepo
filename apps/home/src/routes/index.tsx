import { cn } from "@duyet/libs/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart,
  BookOpen,
  Camera,
  FileText,
  User,
} from "lucide-react";
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
  fallbackIcon?: React.ReactNode;
  fallbackGradientClass?: string;
  fallbackBgImage?: string;
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

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>
      <main className="flex min-h-screen items-center bg-neutral-50 text-neutral-900 selection:bg-neutral-200 dark:bg-black dark:text-neutral-100 dark:selection:bg-white/20 transition-colors-smooth">
        <div className="w-full py-12 sm:py-20 lg:py-24 font-sans focus:outline-none">
          {/* Header Section */}
          <div className="animate-fade-in-fast mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
            <div className="mb-4 flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                Duyet Le
              </span>
            </div>

            <h1 className="mb-4 font-sans text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
              Data Engineering
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg font-normal dark:text-neutral-400">
              Building scalable data infrastructure and architecting robust
              distributed systems. I design data pipelines and engineer
              intelligent applications.
            </p>
          </div>

          {/* Primary Navigation Grid (Bento Style) */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BentoCard
              href={addUtmParams(
                "https://blog.duyet.net",
                "homepage",
                "blog_card"
              )}
              className="lg:col-span-2 sm:row-span-2 p-6 justify-between animate-fade-in-delay-1"
              shortcutId="blog"
              shortcutNumber={1}
            >
              <div>
                <div className="mb-6 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                  <BookOpen className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                </div>
                <h3 className="mb-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Technical Writing
                </h3>
                <p className="max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Deep dives into data engineering architecture, distributed
                  systems patterns, building AI agents, and lessons learned from
                  scaling Open Source.
                </p>
              </div>
              <div className="mt-8 flex items-center text-sm font-medium text-neutral-900 dark:text-white">
                Read the Blog{" "}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </BentoCard>

            <BentoCard
              href={addUtmParams(
                "https://cv.duyet.net",
                "homepage",
                "resume_card"
              )}
              className="p-6 justify-between animate-fade-in-delay-2"
              shortcutId="cv"
              shortcutNumber={2}
            >
              <div>
                <div className="mb-4 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                  <FileText className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                </div>
                <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  Experience
                </h3>
                <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                  Building scalable data infrastructure and leading engineering
                  teams.
                </p>
              </div>
              <div>
                <BuildDate />
              </div>
            </BentoCard>

            <BentoCard
              href={addUtmParams(
                "https://insights.duyet.net",
                "homepage",
                "insights_card"
              )}
              className="p-6 justify-between animate-fade-in-delay-3"
              shortcutId="insights"
              shortcutNumber={3}
            >
              <div>
                <div className="mb-4 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                  <BarChart className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                </div>
                <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  Insights Dashboard
                </h3>
                <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                  Live analytics of coding metrics, site traffic, and LLM token
                  usage.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {["Stats", "Traffic", "LLMs"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </BentoCard>

            <BentoCard
              href={addUtmParams(
                "https://photos.duyet.net",
                "homepage",
                "photos_card"
              )}
              className="p-0 overflow-hidden sm:col-span-2 lg:col-span-1 animate-fade-in-delay-4"
              shortcutId="photos"
              shortcutNumber={4}
            >
              <div className="relative h-full w-full min-h-[220px]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1760809974561-545e45bea13e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="mb-3 inline-flex self-start rounded-lg border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md">
                    <Camera className="h-4 w-4" />
                  </div>
                  <h3 className="mb-1 text-lg font-bold tracking-tight text-white">
                    Photography
                  </h3>
                  <p className="text-sm text-neutral-200 line-clamp-2">
                    Visual stories from scattered travels.
                  </p>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              href="/about"
              className="p-6 justify-between sm:col-span-2 lg:col-span-2 xl:col-span-1 animate-fade-in-delay-5"
              shortcutId="about"
              shortcutNumber={5}
            >
              <div>
                <div className="mb-4 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                  <User className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                </div>
                <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  About Me
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  My background, core skills, and engineering philosophy.
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-medium text-neutral-900 dark:text-white">
                Learn More{" "}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </BentoCard>
          </div>

          {/* Apps & Projects Showcase */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-20">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6 dark:border-white/10 animate-fade-in-delay-6">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                Apps
              </h2>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Managed by @duyetbot AI Agent
              </span>
            </div>

            {/* Apps with screenshots */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {apps
                .filter((item) => item.screenshot)
                .map((item, index) => {
                  const shortcutNumber = index < 4 ? index + 6 : undefined;
                  const delayClass = `animate-fade-in-delay-${Math.min(index + 7, 8)}`;

                  return (
                    <BentoCard
                      key={item.name}
                      href={addUtmParams(
                        item.href,
                        "homepage",
                        item.utmContent,
                        item.host
                      )}
                      className="group flex flex-col overflow-hidden p-0"
                      shortcutId={item.name.toLowerCase().replace(/\s+/g, "-")}
                      shortcutNumber={shortcutNumber}
                      animationClass={delayClass}
                    >
                      <div className="relative aspect-[16/9] w-full border-b border-neutral-200 flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-[#0a0a0a] dark:border-white/10">
                        <img
                          src={item.screenshot}
                          alt={item.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-opacity group-hover:opacity-100"
                        />
                      </div>
                      <div className="p-4 flex flex-col justify-center bg-white dark:bg-[#111]">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.name}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-1">
                          {item.description}
                        </p>
                        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 break-all">
                          {item.host}
                        </div>
                      </div>
                    </BentoCard>
                  );
                })}
            </div>

            {/* Apps without screenshots — compact row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mt-4">
              {apps
                .filter((item) => !item.screenshot)
                .map((item, index) => {
                  const visualIndex = index + apps.filter((i) => i.screenshot).length;
                  const delayClass = `animate-fade-in-delay-${Math.min(visualIndex + 7, 8)}`;
                  const shortcutNumber = visualIndex < 4 ? visualIndex + 6 : undefined;

                  return (
                    <BentoCard
                      key={item.name}
                      href={addUtmParams(
                        item.href,
                        "homepage",
                        item.utmContent,
                        item.host
                      )}
                      className="group flex flex-col overflow-hidden p-4"
                      shortcutId={item.name.toLowerCase().replace(/\s+/g, "-")}
                      shortcutNumber={shortcutNumber}
                      animationClass={delayClass}
                    >
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.name}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 break-all">
                        {item.host}
                      </div>
                    </BentoCard>
                  );
                })}
            </div>
          </div>

          {/* Short URLs CTA */}
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-12">
            <Link
              to="/ls"
              className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-white/10 dark:bg-[#111] dark:hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2 dark:border-white/10 dark:bg-white/5">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </span>
                <div>
                  <span className="block text-sm font-semibold text-neutral-900 dark:text-white">
                    duyet.net/ls
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    All short URLs and redirects
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1 dark:text-neutral-500" />
            </Link>
          </div>

          {/* Footer Connections */}
          <footer className="mx-auto max-w-5xl px-4 pt-10 border-t border-neutral-200 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center space-x-6">
                <a
                  href={addUtmParams(
                    "https://github.com/duyet",
                    "homepage",
                    "footer_github"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-neutral-900 dark:hover:text-white"
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
                  className="transition-colors hover:text-neutral-900 dark:hover:text-white"
                >
                  LinkedIn
                </a>
                <a
                  href="/llms.txt"
                  className="transition-colors hover:text-neutral-900 dark:hover:text-white"
                >
                  llms.txt
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Suspense fallback={<div className="w-8 h-8" />}>
                  <FooterInteractive />
                </Suspense>
                <a
                  href={addUtmParams(
                    "https://status.duyet.net",
                    "homepage",
                    "footer_status"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 transition-colors hover:text-neutral-900 dark:hover:text-white"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 relative flex items-center justify-center">
                    <div className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></div>
                  </div>
                  <span>All Systems Operational</span>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}

// Static Bento Card component - no JS required for initial render
interface BentoCardProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  shortcutId?: string;
  shortcutNumber?: number;
  animationClass?: string;
}

function BentoCard({
  children,
  href,
  className = "",
  shortcutId,
  shortcutNumber,
  animationClass = "",
}: BentoCardProps) {
  const isExternal = href.startsWith("http");
  const classes = cn(
    "w-full group flex flex-col overflow-hidden rounded-xl border bg-white transition-all hover:shadow-sm",
    "dark:bg-[#111] border-neutral-200 hover:border-neutral-300 dark:border-white/10 dark:hover:border-white/20",
    "relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
    "dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
    className,
    animationClass
  );

  if (isExternal) {
    return (
      <a
        href={href}
        data-shortcut-id={shortcutId}
        data-shortcut-number={shortcutNumber}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={href}
      data-shortcut-id={shortcutId}
      data-shortcut-number={shortcutNumber}
      className={classes}
    >
      {children}
    </Link>
  );
}
