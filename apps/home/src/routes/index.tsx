import Icons from "@duyet/components/Icons";
import {
  Activity,
  BarChart3,
  Bot,
  Box,
  BookOpen,
  Clock,
  Cloud,
  Cpu,
  Database,
  ExternalLink,
  FileCode,
  FileText,
  HardDrive,
  Languages,
  Layers,
  Mail,
  Plug,
  Puzzle,
  Save,
  Sparkles,
  Terminal,
  Type,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { type AppItem, apps } from "../data/projects";
import { type SiblingApp, siblingApps } from "../data/sibling-apps";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type ProjectRowItem = AppItem & {
  year: string;
  stack: string;
  status: string;
};

const rowMeta: Record<string, { year: string; stack: string; status: string; techs: string[] }> = {
  AnyRouter: {
    year: "2026",
    stack: "Cloudflare · TS",
    status: "Live",
    techs: ["CF", "TS", "Rs", "Ob"]
  },
  "ClickHouse Monitoring": {
    year: "2026",
    stack: "Next.js · ClickHouse",
    status: "Live",
    techs: ["CH", "Nx", "AI", "TS"]
  },
  ShareHTML: {
    year: "2025",
    stack: "Workers · TS",
    status: "Live",
    techs: ["CF", "TS", "Md", "KV"]
  },
  "AI Agents": {
    year: "2026",
    stack: "Agents SDK",
    status: "Beta",
    techs: ["AI", "Nx", "St", "CF"]
  },
  "Agent State": {
    year: "2026",
    stack: "Durable Objects",
    status: "Beta",
    techs: ["Db", "DO", "Rs", "TS"]
  },
  "MCP Tools": {
    year: "2025",
    stack: "MCP · TS",
    status: "Live",
    techs: ["MC", "TS", "Is", "CF"]
  },
  "Claude Codex Plugins": {
    year: "2026",
    stack: "Claude · TS",
    status: "OSS",
    techs: ["Cl", "TS", "Pl", "Co"]
  },
  Stamps: {
    year: "2024",
    stack: "Workers · KV",
    status: "Live",
    techs: ["CF", "KV", "TS", "Db"]
  },
  PageView: {
    year: "2024",
    stack: "Workers · D1",
    status: "Live",
    techs: ["CF", "D1", "TS", "An"]
  },
  "LLM Timeline": {
    year: "2026",
    stack: "TanStack Start",
    status: "Live",
    techs: ["Nx", "TS", "TL", "Vn"]
  },
  "Rust Tieng Viet": {
    year: "2022",
    stack: "mdBook · Rust",
    status: "OSS",
    techs: ["Rs", "Md", "Bk", "Vn"]
  },
  "Duyet Serif": {
    year: "2024",
    stack: "Fonts",
    status: "OSS",
    techs: ["Ft", "Vn", "Op", "Sf"]
  },
};

const TECH_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  CF: { icon: Cloud, label: "Cloudflare" },
  TS: { icon: FileCode, label: "TypeScript" },
  Rs: { icon: Cpu, label: "Rust" },
  Ob: { icon: Activity, label: "Observability" },
  CH: { icon: Database, label: "ClickHouse" },
  Nx: { icon: Layers, label: "Next.js" },
  AI: { icon: Bot, label: "AI" },
  Md: { icon: FileText, label: "Markdown" },
  KV: { icon: Box, label: "KV" },
  St: { icon: Save, label: "State" },
  Db: { icon: Database, label: "Database" },
  DO: { icon: HardDrive, label: "Durable Objects" },
  MC: { icon: Plug, label: "MCP" },
  Is: { icon: Cpu, label: "Isolates" },
  Cl: { icon: Sparkles, label: "Claude" },
  Pl: { icon: Puzzle, label: "Plugins" },
  Co: { icon: Terminal, label: "Code" },
  D1: { icon: Database, label: "D1" },
  An: { icon: BarChart3, label: "Analytics" },
  TL: { icon: Clock, label: "Timeline" },
  Vn: { icon: Languages, label: "Vietnamese" },
  Bk: { icon: BookOpen, label: "Book" },
  Ft: { icon: Type, label: "Fonts" },
  Op: { icon: Type, label: "OpenType" },
  Sf: { icon: Type, label: "Serif" },
};

const featured: (ProjectRowItem & { techs: string[] })[] = apps.slice(0, 6).map((item) => {
  const meta = rowMeta[item.name] ?? {
    year: "—",
    stack: "—",
    status: "Live",
    techs: ["TS"]
  };
  return {
    ...item,
    year: meta.year,
    stack: meta.stack,
    status: meta.status,
    techs: meta.techs,
  };
});

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="bg-background text-foreground">
        <main className="mx-auto max-w-[1200px] px-4 py-12 md:py-20 sm:px-6 lg:px-8">

          {/* Profile header */}
          <section className="mb-16 md:mb-24">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Profile · 2026
            </p>
            <h1 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight">
              Duyet Le
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl">
              Data Engineer and AI Engineer · building agents, data platforms, and small useful things
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge variant="secondary">AI Agents</Badge>
              <Badge variant="secondary">Cloudflare</Badge>
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">ClickHouse</Badge>
              <Badge variant="secondary">Rust</Badge>
              <Badge variant="secondary">TypeScript</Badge>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 border-b pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-1">
                  Email
                </span>
                <a
                  href="mailto:me@duyet.net"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Mail size={14} /> me@duyet.net
                </a>
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-1">
                  Pronouns
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <User size={14} /> he/him
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-8 space-y-3">
              <p className="text-lg md:text-xl leading-relaxed font-light">
                I build AI agents and the data platforms that keep them honest — end-to-end, obsessing over the small details that make software feel right to use.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                Right now I'm shipping autonomous <a href="https://agents.duyet.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline underline-offset-4">agents</a>, moving petabyte-scale lakes into ClickHouse, writing in the <a href="https://blog.duyet.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline underline-offset-4">blog</a>, publishing live telemetry in <a href="https://insights.duyet.net" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline underline-offset-4">insights</a>, and open-sourcing whatever else I make in <a href="/projects" className="font-semibold text-foreground hover:underline underline-offset-4">projects</a>.
              </p>
            </div>

            {/* Primary CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="https://blog.duyet.net" target="_blank" rel="noopener noreferrer">
                  Read the blog
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/projects">Browse projects</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://agents.duyet.net" target="_blank" rel="noopener noreferrer">
                  Try the agent
                </a>
              </Button>
            </div>

            {/* Status indicator */}
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Now Playing &mdash; Build Optimizer (79x speedup)</span>
            </div>

            {/* Social Row */}
            <div className="flex items-center gap-5 mt-6">
              <a
                href="https://x.com/_duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter / X"
              >
                <Icons.Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/duyet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Icons.Github className="w-5 h-5" />
              </a>
              <a
                href="https://blog.duyet.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Blog"
              >
                <ExternalLink size={20} />
              </a>
              <a
                href="mailto:me@duyet.net"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </section>

          {/* Featured Projects */}
          <section className="mb-20 md:mb-32">
            <div className="mb-12">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                01 / SHIPPED & MAINTAINED
              </span>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight mt-2">
                Featured Projects
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Open-source systems, AI router protocols, and analytics software compiled and optimized for high scale.
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border">
              {featured.map((item) => (
                <li key={item.name} className="bg-background">
                  <ProjectCard item={item} />
                </li>
              ))}
            </ul>

            <div className="flex justify-center mt-12">
              <Button variant="outline" asChild>
                <Link to="/projects">View All Projects</Link>
              </Button>
            </div>
          </section>

          {/* Sibling Monorepo Applications */}
          <section id="sites" className="mb-20 md:mb-32 border-t pt-16">
            <div className="mb-10">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                02 / INDEPENDENT SERVICES
              </span>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight mt-2">
                Monorepo Sibling Sites
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
                Companion utilities and databases built, integrated, and deployed dynamically on independent domains.
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                {siblingApps.map((item) => (
                  <SiteRow key={item.domain} item={item} />
                ))}
              </CardContent>
            </Card>
          </section>

        </main>
      </div>
    </>
  );
}

function ProjectCard({ item }: { item: ProjectRowItem & { techs: string[] } }) {
  return (
    <ProjectLink item={item}>
      <article className="flex h-full flex-col gap-2 p-5 transition-colors hover:bg-muted">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {item.domain || item.host}
        </p>
        <h3 className="text-base font-medium tracking-tight">{item.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {item.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            {item.techs.map((tech) => {
              const entry = TECH_ICONS[tech];
              if (!entry) return null;
              const Icon = entry.icon;
              return (
                <Icon
                  key={tech}
                  size={14}
                  aria-label={entry.label}
                />
              );
            })}
          </div>
          <Badge variant="outline">{item.status}</Badge>
        </div>
      </article>
    </ProjectLink>
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
        className="block h-full no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="block h-full no-underline">
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
      className="group grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3 border-b py-4 text-foreground hover:bg-muted px-6 transition-colors last:border-b-0"
    >
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-sm text-foreground">
          {item.domain}
        </span>
        <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground">{item.name}</span> — {item.description}
        </p>
      </div>
    </a>
  );
}
