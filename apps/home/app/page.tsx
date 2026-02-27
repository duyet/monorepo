import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@duyet/components/ThemeToggle";
import { FadeIn, FadeInStagger } from "../components/FadeIn";
import { AuthButtons } from "@duyet/components/header/AuthButtons";
import { ArrowRight, BookOpen, FileText, BarChart, Camera, User, Wrench, Settings, Puzzle, Database, LogIn } from "lucide-react";

export const dynamic = "force-static";
export const revalidate = 3600;

const buildDate = new Date().toISOString().split("T")[0]; 

function addUtmParams(url: string, campaign = "homepage", content?: string): string {
  if (url.startsWith("/")) return url;
  const urlObj = new URL(url);
  urlObj.searchParams.set("utm_source", "home");
  urlObj.searchParams.set("utm_medium", "website");
  urlObj.searchParams.set("utm_campaign", campaign);
  if (content) {
    urlObj.searchParams.set("utm_content", content);
  }
  return urlObj.toString();
}

interface AppItem {
  name: string;
  href: string;
  utmContent: string;
  screenshot?: string;
  fallbackIcon?: React.ReactNode;
  fallbackGradientClass?: string;
  fallbackBgImage?: string;
}

const apps: AppItem[] = [
  {
    name: "LLM Timeline",
    href: process.env.NEXT_PUBLIC_DUYET_LLM_TIMELINE_URL || "https://llm-timeline.duyet.net",
    utmContent: "llm_timeline_bento",
    screenshot: "/screenshots/llm-timeline.png",
  },
  {
    name: "AI Agents",
    href: process.env.NEXT_PUBLIC_DUYET_AGENTS_URL || "https://agents.duyet.net",
    utmContent: "agents_bento",
    screenshot: "/screenshots/ai-agents.png",
  },
  {
    name: "OpenClaw",
    href: "https://claw.duyet.net",
    utmContent: "claw_bento",
    screenshot: "/screenshots/openclaw.png",
  },
  {
    name: "MCP Tools",
    href: "https://mcp.duyet.net",
    utmContent: "mcp_bento",
    screenshot: "/screenshots/mcp-tools-art.png",
    fallbackIcon: <Wrench className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />,
    fallbackGradientClass: "bg-neutral-900",
  },
  {
    name: "Rust Tiếng Việt",
    href: "https://duyet.net/rust",
    utmContent: "rust_bento",
    screenshot: "/screenshots/rust-art.png",
    fallbackIcon: <Settings className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />,
    fallbackGradientClass: "bg-neutral-900",
  },
  {
    name: "ClickHouse Monitoring",
    href: "https://duyet.net/monitor",
    utmContent: "ch_monitor_bento",
    fallbackIcon: <Database className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />,
    fallbackGradientClass: "bg-neutral-900",
    fallbackBgImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop')",
    screenshot: "/screenshots/ch-monitor.png", // Keeping screenshot if available
  },
  {
    name: "Claude Plugins",
    href: "https://github.com/duyet/claude-plugins",
    utmContent: "claude_plugins_bento",
    screenshot: "/screenshots/claude-plugins-art.png",
    fallbackIcon: <Puzzle className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />,
    fallbackGradientClass: "bg-neutral-900",
  },
];

// Flat Bento Card component representing the Vercel style
const BentoCard = ({ 
  children, href, className = ""
}: { 
  children: React.ReactNode; href: string; className?: string;
}) => (
  <FadeIn className="flex h-full w-full">
    <Link
      href={href}
      className={`w-full group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-sm dark:border-white/10 dark:bg-[#111] dark:hover:border-white/20 ${className}`}
    >
      {children}
    </Link>
  </FadeIn>
);

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center bg-neutral-50 text-neutral-900 selection:bg-neutral-200 dark:bg-black dark:text-neutral-100 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="w-full py-12 sm:py-20 lg:py-24 font-sans focus:outline-none">
        
        <FadeInStagger faster>
          {/* Header Section */}
          <FadeIn>
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono tracking-wide text-neutral-500 uppercase dark:text-neutral-400">Duyet Le</span>
            </div>
            <ThemeToggle />
          </div>
          
          <h1 className="mb-4 font-sans text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
            Data Engineering
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg font-normal dark:text-neutral-400">
            Building scalable data infrastructure and architecting robust distributed systems. I design data pipelines and engineer intelligent applications.
          </p>
        </div>

        {/* Primary Navigation Grid (Bento Style) */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          
          <BentoCard
            href={addUtmParams(process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "https://blog.duyet.net", "homepage", "blog_card")}
            className="lg:col-span-2 sm:row-span-2 p-6 justify-between"
          >
            <div>
              <div className="mb-6 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                <BookOpen className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="mb-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Technical Writing</h3>
              <p className="max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                Deep dives into data engineering architecture, distributed systems patterns, building AI agents, and lessons learned from scaling Open Source.
              </p>
            </div>
            <div className="mt-8 flex items-center text-sm font-medium text-neutral-900 dark:text-white">
              Read the Blog <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </BentoCard>

          <BentoCard
            href={addUtmParams(process.env.NEXT_PUBLIC_DUYET_CV_URL || "https://cv.duyet.net", "homepage", "resume_card")}
            className="p-6 justify-between"
          >
            <div>
              <div className="mb-4 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                <FileText className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Experience</h3>
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                Building scalable data infrastructure and leading engineering teams.
              </p>
            </div>
            <div>
              <div className="inline-flex rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-mono text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                Updated {buildDate}
              </div>
            </div>
          </BentoCard>

          <BentoCard
            href={addUtmParams(process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || "https://insights.duyet.net", "homepage", "insights_card")}
            className="p-6 justify-between"
          >
            <div>
              <div className="mb-4 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                <BarChart className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Insights Dashboard</h3>
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                Live analytics of coding metrics, site traffic, and LLM token usage.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
              {["Stats", "Traffic", "LLMs"].map(tag => (
                <span key={tag} className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                  {tag}
                </span>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            href={addUtmParams(process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL || "https://photos.duyet.net", "homepage", "photos_card")}
            className="p-0 overflow-hidden sm:col-span-2 lg:col-span-1"
          >
            <div className="relative h-full w-full min-h-[220px]">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1760809974561-545e45bea13e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="mb-3 inline-flex self-start rounded-lg border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md">
                  <Camera className="h-4 w-4" />
                </div>
                <h3 className="mb-1 text-lg font-bold tracking-tight text-white">Photography</h3>
                <p className="text-sm text-neutral-200 line-clamp-2">Visual stories from scattered travels.</p>
              </div>
            </div>
          </BentoCard>

          <BentoCard href="/about" className="p-6 justify-between sm:col-span-2 lg:col-span-2 xl:col-span-1">
            <div>
              <div className="mb-4 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                <User className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">About Me</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                My background, core skills, and engineering philosophy.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-medium text-neutral-900 dark:text-white">
              Learn More <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </BentoCard>

        </div>

        {/* Apps & Projects Showcase */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-20">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6 dark:border-white/10">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">Apps</h2>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Vibe</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((item) => (
              <BentoCard
                key={item.name}
                href={addUtmParams(item.href, "homepage", item.utmContent)}
                className="group flex flex-col overflow-hidden p-0"
              >
                <div className={`relative aspect-[16/9] w-full border-b border-neutral-200 flex items-center justify-center overflow-hidden dark:border-white/10 ${item.screenshot ? "bg-neutral-100 dark:bg-[#0a0a0a]" : item.fallbackGradientClass || "bg-neutral-50 dark:bg-white/[0.02]"}`}>
                  {item.screenshot ? (
                    <Image 
                      src={item.screenshot} 
                      alt={item.name} 
                      fill 
                      unoptimized 
                      className="object-cover object-top opacity-90 transition-opacity group-hover:opacity-100" 
                    />
                  ) : (
                    <>
                      {item.fallbackBgImage && (
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                          style={{ backgroundImage: item.fallbackBgImage }}
                        />
                      )}
                      {item.fallbackBgImage && (
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                      )}
                      <div className="relative z-10 flex transform items-center justify-center transition-transform duration-500">
                        {item.fallbackIcon || <Database className="w-16 h-16 text-neutral-300 dark:text-neutral-700" />}
                      </div>
                    </>
                  )}
                </div>
                <div className="p-4 flex flex-col justify-center bg-white dark:bg-[#111]">
                  <h4 className="text-sm font-semibold text-neutral-900 truncate dark:text-neutral-100">{item.name}</h4>
                  <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 break-all">{new URL(item.href.startsWith('http') ? item.href : `https://${item.href}`).hostname}</div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>

        {/* Footer Connections */}
        <div className="mx-auto max-w-5xl px-4 pt-10 border-t border-neutral-200 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-6">
              <Link href={addUtmParams("https://github.com/duyet", "homepage", "footer_github")} target="_blank" className="transition-colors hover:text-neutral-900 dark:hover:text-white">GitHub</Link>
              <Link href={addUtmParams("https://linkedin.com/in/duyet", "homepage", "footer_linkedin")} target="_blank" className="transition-colors hover:text-neutral-900 dark:hover:text-white">LinkedIn</Link>
              <Link href="/ls" className="transition-colors hover:text-neutral-900 dark:hover:text-white">Short URLs</Link>
              <a href="/llms.txt" className="transition-colors hover:text-neutral-900 dark:hover:text-white">llms.txt</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href={addUtmParams("https://status.duyet.net", "homepage", "footer_status")} target="_blank" className="flex items-center space-x-2 transition-colors hover:text-neutral-900 dark:hover:text-white">
                <div className="h-2 w-2 rounded-full bg-emerald-500 relative flex items-center justify-center">
                   <div className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></div>
                </div>
                <span>All Systems Operational</span>
              </Link>
              <Link href="/admin" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors" aria-label="Admin Login">
                <LogIn className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
