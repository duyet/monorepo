import {
  ArrowSquareOut,
  MapPin,
  User,
  GithubLogo,
  TwitterLogo,
  EnvelopeSimple
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { Suspense, useMemo } from "react";
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

const rowMeta: Record<string, { year: string; stack: string; status: string; glow: string; techs: string[] }> = {
  AnyRouter: {
    year: "2026",
    stack: "Cloudflare · TS",
    status: "Live",
    glow: "project-glow-blue",
    techs: ["CF", "TS", "Rs", "Ob"]
  },
  "ClickHouse Monitoring": {
    year: "2026",
    stack: "Next.js · ClickHouse",
    status: "Live",
    glow: "project-glow-orange",
    techs: ["CH", "Nx", "AI", "TS"]
  },
  ShareHTML: {
    year: "2025",
    stack: "Workers · TS",
    status: "Live",
    glow: "project-glow-purple",
    techs: ["CF", "TS", "Md", "KV"]
  },
  "AI Agents": {
    year: "2026",
    stack: "Agents SDK",
    status: "Beta",
    glow: "project-glow-green",
    techs: ["AI", "Nx", "St", "CF"]
  },
  "Agent State": {
    year: "2026",
    stack: "Durable Objects",
    status: "Beta",
    glow: "project-glow-blue",
    techs: ["Db", "DO", "Rs", "TS"]
  },
  "MCP Tools": {
    year: "2025",
    stack: "MCP · TS",
    status: "Live",
    glow: "project-glow-purple",
    techs: ["MC", "TS", "Is", "CF"]
  },
  "Claude Codex Plugins": {
    year: "2026",
    stack: "Claude · TS",
    status: "OSS",
    glow: "project-glow-green",
    techs: ["Cl", "TS", "Pl", "Co"]
  },
  Stamps: {
    year: "2024",
    stack: "Workers · KV",
    status: "Live",
    glow: "project-glow-orange",
    techs: ["CF", "KV", "TS", "Db"]
  },
  PageView: {
    year: "2024",
    stack: "Workers · D1",
    status: "Live",
    glow: "project-glow-blue",
    techs: ["CF", "D1", "TS", "An"]
  },
  "LLM Timeline": {
    year: "2026",
    stack: "TanStack Start",
    status: "Live",
    glow: "project-glow-green",
    techs: ["Nx", "TS", "TL", "Vn"]
  },
  "Rust Tieng Viet": {
    year: "2022",
    stack: "mdBook · Rust",
    status: "OSS",
    glow: "project-glow-purple",
    techs: ["Rs", "Md", "Bk", "Vn"]
  },
  "Duyet Serif": {
    year: "2024",
    stack: "Fonts",
    status: "OSS",
    glow: "project-glow-orange",
    techs: ["Ft", "Vn", "Op", "Sf"]
  },
};

const featured: (ProjectRowItem & { glow: string; techs: string[] })[] = apps.slice(0, 6).map((item) => {
  const meta = rowMeta[item.name] ?? {
    year: "—",
    stack: "—",
    status: "Live",
    glow: "project-glow-blue",
    techs: ["TS"]
  };
  return {
    ...item,
    year: meta.year,
    stack: meta.stack,
    status: meta.status,
    glow: meta.glow,
    techs: meta.techs,
  };
});

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15,
    },
  },
};

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="min-h-screen relative bg-[color:var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--foreground)] selection:text-[color:var(--background)] overflow-x-hidden">
        {/* Clean full grid background overlay */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-[0.8] dark:opacity-[0.4]" />

        <SiteHeader />

        <main className="mx-auto max-w-[1040px] px-6 py-12 md:py-24 md:px-8 relative z-10">
          
          {/* ── Siddharth-Style Profile Header ── */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 md:mb-24"
          >
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-center">
              <img
                src="https://github.com/duyet.png"
                alt="Duyet Le"
                className="h-16 w-16 md:h-20 md:w-20 rounded-2xl border border-[color:var(--hairline)] hover:scale-105 transition-transform duration-300 shadow-xs bg-[color:var(--faint)]"
              />
              <div>
                <p className="eyebrow-mono mb-2">Profile · 2026</p>
                <h1 className="display-tight text-4xl md:text-5xl text-[color:var(--foreground)]">
                  Duyet Le
                </h1>
                <p className="text-sm font-normal text-[color:var(--muted)] mt-1">
                  AI engineer · building agents, data platforms, and small useful things
                </p>
              </div>
            </div>

            {/* 3-Column Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 border-b border-[color:var(--hairline)] pb-6">
              <div>
                <span className="eyebrow-mono block mb-1">
                  Location
                </span>
                <span className="text-sm text-[color:var(--muted)] flex items-center gap-1.5 font-light">
                  <MapPin size={14} className="text-[color:var(--subtle)]" /> Ho Chi Minh City, VN
                </span>
              </div>
              <div>
                <span className="eyebrow-mono block mb-1">
                  Email
                </span>
                <a
                  href="mailto:me@duyet.net"
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors flex items-center gap-1.5 font-light"
                >
                  <EnvelopeSimple size={14} className="text-[color:var(--subtle)]" /> me@duyet.net
                </a>
              </div>
              <div>
                <span className="eyebrow-mono block mb-1">
                  Pronouns
                </span>
                <span className="text-sm text-[color:var(--muted)] flex items-center gap-1.5 font-light">
                  <User size={14} className="text-[color:var(--subtle)]" /> he/him
                </span>
              </div>
            </div>

            {/* Bio — builder-voice, links to every surface */}
            <div className="mt-8 space-y-3">
              <p className="text-lg md:text-xl text-[color:var(--foreground)] leading-relaxed font-light">
                I build AI agents and the data platforms that keep them honest — end-to-end, obsessing over the small details that make software feel right to use.
              </p>
              <p className="text-base md:text-lg text-[color:var(--muted)] leading-relaxed font-light">
                Right now I'm shipping autonomous <a href="https://agents.duyet.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-[color:var(--foreground)] hover:underline underline-offset-4 decoration-emerald-500 decoration-2 transition-all">agents</a>, moving petabyte-scale lakes into ClickHouse, writing in the <a href="https://blog.duyet.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-[color:var(--foreground)] hover:underline underline-offset-4 decoration-blue-500 decoration-2 transition-all">blog</a>, publishing live telemetry in <a href="https://insights.duyet.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-[color:var(--foreground)] hover:underline underline-offset-4 decoration-amber-500 decoration-2 transition-all">insights</a>, and open-sourcing whatever else I make in <a href="/projects" className="font-semibold text-[color:var(--foreground)] hover:underline underline-offset-4 decoration-purple-500 decoration-2 transition-all">projects</a>.
              </p>
            </div>

            {/* Primary CTAs — minimal pill outlines */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://blog.duyet.net"
                target="_blank"
                rel="noopener noreferrer"
                className="pill-outline"
              >
                Read the blog
              </a>
              <Link to="/projects" className="pill-outline">
                Browse projects
              </Link>
              <a
                href="https://agents.duyet.net"
                target="_blank"
                rel="noopener noreferrer"
                className="pill-outline"
              >
                Try the agent
              </a>
            </div>

            {/* Aligned Spotify Player Status */}
            <div className="mt-6 flex items-center gap-2 text-xs md:text-sm text-[color:var(--muted)] font-light">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Now Playing &mdash; Build Optimizer (79x speedup)</span>
            </div>

            {/* Profile Social Row */}
            <div className="flex items-center gap-5 mt-6">
              <a
                href="https://x.com/_duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--subtle)] hover:text-[color:var(--foreground)] transition-colors"
                aria-label="Twitter / X"
              >
                <TwitterLogo size={20} weight="bold" />
              </a>
              <a
                href="https://github.com/duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--subtle)] hover:text-[color:var(--foreground)] transition-colors"
                aria-label="GitHub"
              >
                <GithubLogo size={20} weight="bold" />
              </a>
              <a
                href="https://blog.duyet.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--subtle)] hover:text-[color:var(--foreground)] transition-colors"
                aria-label="Blog"
              >
                <ArrowSquareOut size={20} weight="bold" />
              </a>
              <a
                href="mailto:me@duyet.net"
                className="text-[color:var(--subtle)] hover:text-[color:var(--foreground)] transition-colors"
                aria-label="Email"
              >
                <EnvelopeSimple size={20} weight="bold" />
              </a>
            </div>
          </motion.section>

          {/* ── Mock GitHub Contribution Calendar ── */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-20 md:mb-32 border border-[color:var(--hairline)] rounded-2xl p-6 bg-[color:var(--card-bg)] shadow-xs"
          >
            {/* Month labels above the calendar grid */}
            <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-[color:var(--subtle)] select-none">
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>

            {/* Simulated Contribution Calendar Grid */}
            <div className="overflow-x-auto scrollbar-none pb-2 select-none">
              <MockContributionCalendar />
            </div>

            {/* Telemetry statistics and legend at the bottom */}
            <div className="flex items-center justify-between mt-4 text-[10px] font-mono text-[color:var(--subtle)] select-none">
              <span className="uppercase tracking-wider">
                1,492 contributions &middot; {new Date().getFullYear() - 1}&ndash;{String(new Date().getFullYear()).slice(2)}
              </span>
              <div className="flex items-center gap-1.5">
                <span>LESS</span>
                <span className="w-2.5 h-2.5 rounded-[1px] bg-neutral-100 dark:bg-neutral-900/60" />
                <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-100 dark:bg-emerald-950/30" />
                <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-300 dark:bg-emerald-800/50" />
                <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-400 dark:bg-emerald-600/70" />
                <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-500" />
                <span>MORE</span>
              </div>
            </div>
          </motion.section>

          {/* ── Curated Projects (Featured Mockups with Radial Glows) ── */}
          <section className="mb-20 md:mb-32">
            <div className="mb-12">
              <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--subtle)]">
                01 / SHIPPED & MAINTAINED
              </span>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[color:var(--foreground)] mt-2">
                Featured Projects
              </h2>
              <p className="text-sm text-[color:var(--muted)] font-light mt-1 max-w-xl">
                Open-source systems, AI router protocols, and analytics software compiled and optimized for high scale.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {featured.map((item) => (
                <motion.div variants={itemVariants} key={item.name} className="relative group">
                  <ProjectCard item={item} />
                </motion.div>
              ))}
            </motion.div>

            <div className="flex justify-center mt-12">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--hairline)] hover:border-[color:var(--foreground)] px-6 py-2.5 text-xs font-mono uppercase tracking-widest text-[color:var(--foreground)] hover:bg-[color:var(--faint)] transition-all group cursor-pointer"
              >
                <span>View All Projects</span>
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
              </Link>
            </div>
          </section>

          {/* ── Sibling Monorepo Applications ── */}
          <section id="sites" className="mb-20 md:mb-32 border-t border-[color:var(--hairline)] pt-16">
            <div className="mb-10">
              <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--subtle)]">
                02 / INDEPENDENT SERVICES
              </span>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[color:var(--foreground)] mt-2">
                Monorepo Sibling Sites
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)] font-light leading-relaxed max-w-xl">
                Companion utilities and databases built, integrated, and deployed dynamically on independent domains.
              </p>
            </div>

            <div className="border border-[color:var(--hairline)] rounded-2xl overflow-hidden bg-[color:var(--card-bg)] shadow-xs">
              {siblingApps.map((item) => (
                <SiteRow key={item.domain} item={item} />
              ))}
            </div>
          </section>

        </main>

        <SiteFooter />
      </div>
    </>
  );
}

function MockContributionCalendar() {
  const cells = useMemo(() => {
    return Array.from({ length: 371 }, (_, i) => {
      // Create clustered green densities mimicking realistic commit calendars
      const factor = Math.sin(i * 0.05) * Math.cos(i * 0.09) + Math.sin(i * 0.018) + (i % 7 === 0 ? 0.3 : 0);
      let level = 0;
      if (factor > 0.85) level = 4;
      else if (factor > 0.45) level = 3;
      else if (factor > 0.1) level = 2;
      else if (factor > -0.3) level = 1;
      return { id: i, level };
    });
  }, []);

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-[3px] min-w-[760px]">
      {cells.map((cell) => {
        const colorClass = [
          "bg-neutral-100 dark:bg-neutral-900/60",
          "bg-emerald-100 dark:bg-emerald-950/30",
          "bg-emerald-300 dark:bg-emerald-800/50",
          "bg-emerald-400 dark:bg-emerald-600/70",
          "bg-emerald-500",
        ][cell.level];
        return (
          <div
            key={cell.id}
            className={`w-[10px] h-[10px] rounded-[1.5px] transition-colors duration-300 ${colorClass}`}
          />
        );
      })}
    </div>
  );
}

function ProjectCard({ item }: { item: ProjectRowItem & { glow: string; techs: string[] } }) {
  return (
    <div className="border border-[color:var(--hairline)] rounded-2xl overflow-hidden bg-[color:var(--card-bg)] shadow-xs relative group/card hover:border-[color:var(--foreground)] hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full min-h-[380px]">
      
      {/* Dynamic Glowing Radial Backdrop Layer */}
      <div className={`absolute inset-0 pointer-events-none z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 ${item.glow}`} />

      <div className="relative z-10 flex flex-col flex-grow">
        
        {/* Browser Top Bar Mockup */}
        <div className="bg-[color:var(--faint)] px-4 py-2.5 border-b border-[color:var(--hairline)] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500/80" />
            <span className="w-2 h-2 rounded-full bg-yellow-400 dark:bg-yellow-500/80" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
          </div>
          <div className="text-[10px] font-mono text-[color:var(--subtle)] bg-[color:var(--background)] border border-[color:var(--hairline)] rounded px-2.5 py-0.5 truncate max-w-[60%] select-none">
            {item.domain || item.host}
          </div>
          <div className="w-6" /> {/* Balance spacer */}
        </div>

        {/* Browser Page body */}
        <div className="p-6 flex-grow flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold tracking-tight text-[color:var(--foreground)]">
                {item.name}
              </h3>
              <ProjectLink item={item}>
                <span className="text-[color:var(--subtle)] group-hover/card:text-[color:var(--foreground)] transition-colors duration-200 cursor-pointer">
                  <ArrowSquareOut size={16} weight="bold" />
                </span>
              </ProjectLink>
            </div>
            <p className="text-sm text-[color:var(--muted)] leading-relaxed font-light line-clamp-4">
              {item.description}
            </p>
          </div>

          <div className="flex items-end justify-between border-t border-[color:var(--hairline)] pt-4 mt-auto">
            <div className="flex items-center gap-1.5">
              {item.techs.map((tech) => (
                <span key={tech} className="h-6 w-6 rounded-full bg-[color:var(--faint)] border border-[color:var(--hairline)] flex items-center justify-center text-[9px] font-mono text-[color:var(--muted)] font-semibold select-none">
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-mono text-[color:var(--subtle)]">
              <span>{item.year}</span>
              <span className="h-1 w-1 rounded-full bg-[color:var(--hairline)]" />
              <span className="uppercase font-semibold tracking-wider text-[9px] px-1.5 py-0.5 rounded bg-[color:var(--faint)] border border-[color:var(--hairline)]">
                {item.status}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ProjectLink({
  item,
  children,
}: {
  item: AppItem;
  children: ReactNode;
}) {
  const href = addUtmParams(item.href, "homepage", item.utmContent, item.host);

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className="no-underline cursor-pointer"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="no-underline cursor-pointer">
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
      className="group grid grid-cols-1 sm:grid-cols-[160px_1fr_200px] gap-3 border-b border-[color:var(--hairline)] py-5 text-[color:var(--foreground)] hover:bg-[color:var(--faint)] px-6 transition-all duration-200 items-center last:border-b-0"
    >
      <div>
        <h3 className="text-sm font-semibold text-[color:var(--foreground)] group-hover:pl-1 transition-all duration-200 flex items-center gap-1.5">
          {item.name}
          <ArrowSquareOut size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
      </div>
      <div>
        <p className="text-xs text-[color:var(--muted)] font-light leading-relaxed">
          {item.description}
        </p>
      </div>
      <div className="sm:text-right">
        <span className="font-mono text-xs text-[color:var(--subtle)] group-hover:text-[color:var(--foreground)] transition-colors duration-200">
          {item.domain}
        </span>
      </div>
    </a>
  );
}
