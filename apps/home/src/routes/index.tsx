import Icons from "@duyet/components/Icons";
import { ExternalLink, MapPin, User, Mail } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
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

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <SiteHeader />

        <main className="mx-auto max-w-[1040px] px-6 py-12 md:py-24 md:px-8">

          {/* Profile header */}
          <section className="mb-16 md:mb-24">
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-center">
              <img
                src="https://github.com/duyet.png"
                alt="Duyet Le"
                className="h-16 w-16 md:h-20 md:w-20 rounded-md border bg-muted"
              />
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Profile · 2026</p>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  Duyet Le
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  AI engineer · building agents, data platforms, and small useful things
                </p>
              </div>
            </div>

            {/* 3-Column Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 border-b pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-1">
                  Location
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin size={14} /> Ho Chi Minh City, VN
                </span>
              </div>
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

          {/* GitHub Contribution Calendar */}
          <section className="mb-20 md:mb-32">
            <Card>
              <CardContent className="pt-6">
                {/* Month labels */}
                <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-muted-foreground select-none">
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

                {/* Contribution Calendar Grid */}
                <div className="overflow-x-auto pb-2 select-none">
                  <MockContributionCalendar />
                </div>

                {/* Telemetry statistics */}
                <div className="flex items-center justify-between mt-4 text-[10px] font-mono text-muted-foreground select-none">
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
              </CardContent>
            </Card>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featured.map((item) => (
                <ProjectCard key={item.name} item={item} />
              ))}
            </div>

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

        <SiteFooter />
      </div>
    </>
  );
}

function MockContributionCalendar() {
  const cells = useMemo(() => {
    return Array.from({ length: 371 }, (_, i) => {
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
            className={`w-[10px] h-[10px] rounded-[1.5px] ${colorClass}`}
          />
        );
      })}
    </div>
  );
}

function ProjectCard({ item }: { item: ProjectRowItem & { techs: string[] } }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base">{item.name}</CardTitle>
          <CardDescription>{item.domain || item.host}</CardDescription>
        </div>
        <ProjectLink item={item}>
          <ExternalLink size={16} className="shrink-0 text-muted-foreground" />
        </ProjectLink>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {item.techs.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{item.year}</span>
            <Badge variant="outline">{item.status}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
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
      className="group grid grid-cols-1 sm:grid-cols-[160px_1fr_200px] gap-3 border-b py-4 text-foreground hover:bg-muted px-6 transition-colors last:border-b-0"
    >
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          {item.name}
          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
      </div>
      <div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      </div>
      <div className="sm:text-right">
        <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          {item.domain}
        </span>
      </div>
    </a>
  );
}
