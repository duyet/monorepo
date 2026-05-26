import Icons from "@duyet/components/Icons";
import {
  Activity,
  BarChart3,
  Bot,
  Box,
  BookOpen,
  Check,
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
  Rocket,
  Save,
  Sparkles,
  Terminal,
  Type,
  User,
  Users,
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@duyet/components";

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

        {/* Role Switcher — Who is it for? */}
        <RoleTabsSection />

        {/* FAQ */}
        <FaqSection />

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

type RoleTab = {
  value: string;
  label: string;
  icon: typeof Database;
  roleTitle: string;
  bullets: string[];
  quote: string;
  attributionName: string;
  attributionRole: string;
};

const roleTabs: RoleTab[] = [
  {
    value: "data",
    label: "Data Engineer",
    icon: Database,
    roleTitle: "Data Engineer",
    bullets: [
      "Move petabyte-scale data into ClickHouse",
      "Real-time streaming + batch via Airflow",
      "Open-source ClickHouse monitoring tools",
      "Write about data infra weekly on the blog",
    ],
    quote: "I read Duyet's ClickHouse Monitor source when I was scoping our own observability — saved us a quarter of work.",
    attributionName: "Reader feedback",
    attributionRole: "Senior data engineer",
  },
  {
    value: "ai",
    label: "AI Engineer",
    icon: Bot,
    roleTitle: "AI Engineer",
    bullets: [
      "Ship autonomous agents on Cloudflare",
      "Route models with AnyRouter (BYOK + fallback)",
      "Track human vs AI commit share over time",
      "Build agent UIs with TanStack + shadcn",
    ],
    quote: "Honest writing about what works and what doesn't with agent loops. No vendor hype.",
    attributionName: "AI engineering newsletter",
    attributionRole: "Subscriber",
  },
  {
    value: "indie",
    label: "Indie Hacker",
    icon: Rocket,
    roleTitle: "Indie Hacker",
    bullets: [
      "Eight live products, all open source",
      "Cloudflare-only stack — no infra surprises",
      "Static SSG with TanStack Start",
      "Edge SQL with D1 + KV",
    ],
    quote: "I cloned the homelab dashboard pattern and shipped my own in an afternoon.",
    attributionName: "Indie dev",
    attributionRole: "Side-project shipper",
  },
  {
    value: "teams",
    label: "Teams",
    icon: Users,
    roleTitle: "Teams",
    bullets: [
      "Reference implementations for shadcn + TanStack",
      "Shared design tokens across 8 sibling apps",
      "Public roadmap and changelog",
      "Open-source repos with real production usage",
    ],
    quote: "We mirrored the apps directory pattern when standardizing our company landing pages.",
    attributionName: "Platform team lead",
    attributionRole: "B2B SaaS",
  },
];

function RoleTabsSection() {
  return (
    <section className="border-t py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          WHO IS IT FOR?
        </p>
        <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
          Built for engineers and tinkerers
        </h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Data engineers, AI engineers, indie hackers — whatever you're shipping, the toolkit here is the one I use every day.
        </p>

        <Tabs defaultValue="data" className="mt-12 max-w-3xl mx-auto">
          <TabsList>
            {roleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  <Icon size={14} />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {roleTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="grid gap-8 md:grid-cols-2 mt-8 text-left">
                <div className="text-left">
                  <h3 className="text-2xl font-semibold tracking-tight">{tab.roleTitle}</h3>
                  <ul className="mt-4 space-y-3">
                    {tab.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check size={16} className="mt-0.5 shrink-0 text-foreground" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <Card>
                  <CardContent className="p-8">
                    <blockquote className="text-base">"{tab.quote}"</blockquote>
                    <p className="mt-6 text-sm font-medium">{tab.attributionName}</p>
                    <p className="text-xs text-muted-foreground">{tab.attributionRole}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

type FaqItem = { q: string; a: string };
type FaqTab = { value: string; label: string; items: FaqItem[] };

const faqTabs: FaqTab[] = [
  {
    value: "site",
    label: "This site",
    items: [
      {
        q: "What is duyet.net?",
        a: "A personal homepage that doubles as the front door for eight sibling apps (blog, insights, llm-timeline, homelab, photos, cv, ai-percentage). Press ⌘K anywhere to jump between them.",
      },
      {
        q: "Why so many sub-domains?",
        a: "Each surface has different latency, caching, and content needs. Splitting them keeps deploys independent — blog rebuilds don't touch insights, agent updates don't touch the homelab dashboard.",
      },
      {
        q: "Is this in production or a sandbox?",
        a: "Production. Live traffic, real WakaTime / ClickHouse / Cloudflare data behind insights, and a homelab cluster I actually run.",
      },
      {
        q: "Is there a roadmap?",
        a: "The roadmap lives in the monorepo at github.com/duyet/monorepo/issues. Public, lightly labelled, no Notion board.",
      },
    ],
  },
  {
    value: "stack",
    label: "Stack",
    items: [
      {
        q: "What framework runs the front-end?",
        a: "TanStack Start with SSG. Most apps pre-render every route at build time and serve static HTML + .md via Cloudflare Pages ASSETS — no worker runtime hit for content.",
      },
      {
        q: "Why Cloudflare end-to-end?",
        a: "Pages for static, Workers + Durable Objects for stateful agents, D1 for SQL, KV for cache, R2 for blobs. One billing surface, one auth, one global edge — fewer moving parts than splitting across clouds.",
      },
      {
        q: "Why ClickHouse for analytics?",
        a: "Time-series queries over millions of rows in sub-second time, columnar storage, and a clean SQL dialect. WakaTime activity, AI token usage, and GitHub commits all land in one cluster.",
      },
      {
        q: "Why shadcn/ui instead of a component library?",
        a: "Source ownership. The primitives live in this repo at packages/components/ui, not in node_modules. I can read every line, patch behaviour without forks, and the design system is genuinely portable.",
      },
    ],
  },
  {
    value: "open-source",
    label: "Open source",
    items: [
      {
        q: "Can I copy this whole site?",
        a: "Yes — fork github.com/duyet/monorepo, replace the content under apps/blog/_posts and apps/home/src/data, and deploy. Attribution appreciated but not required for the layout.",
      },
      {
        q: "What's the license?",
        a: "MIT on the code. Blog posts and photos are copyrighted to me unless noted; please don't republish without asking.",
      },
      {
        q: "Are PRs welcome?",
        a: "Bug fixes, accessibility improvements, doc tweaks — yes, please. For larger features open an issue first so we can agree on scope before code lands.",
      },
      {
        q: "How do I learn the codebase?",
        a: "Start at the root CLAUDE.md, then apps/<name>/CLAUDE.md for per-app architecture. The packages/components README documents the shared primitives.",
      },
    ],
  },
  {
    value: "contact",
    label: "Hiring & contact",
    items: [
      {
        q: "Are you open to work?",
        a: "Selectively — senior data / AI engineering roles, mostly remote, EU or APAC hours. Email me@duyet.net with the role and a short pitch on why.",
      },
      {
        q: "Do you take contract work?",
        a: "Occasionally, for ClickHouse, Cloudflare, or agent-infra projects. Scoped engagements only — no open-ended retainers.",
      },
      {
        q: "Where are you based?",
        a: "Ho Chi Minh City, working remotely. The CV at cv.duyet.net has the latest availability and timezone.",
      },
      {
        q: "Fastest way to reach you?",
        a: "Email me@duyet.net for anything that needs a thoughtful reply. Telegram for time-sensitive pings — handle and approval flow are on the contact page.",
      },
      {
        q: "Do you mentor?",
        a: "Yes, informally and unpaid, when the calendar allows. Email a one-paragraph intro and what you're trying to learn — I reply when I can.",
      },
    ],
  },
];

function FaqSection() {
  return (
    <section className="border-t py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          FAQ
        </p>
        <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
          Frequently asked questions
        </h2>

        <Tabs defaultValue="products" className="mt-8">
          <TabsList>
            {faqTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {faqTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <Accordion type="single" collapsible>
                {tab.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
