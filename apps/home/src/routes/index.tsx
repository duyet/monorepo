import { ArrowUpRight } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { addUtmParams } from "../../app/lib/utm";
import rawBlogPosts from "../../../blog/public/posts-data.json";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { type AppItem, apps } from "../data/projects";
import { siblingApps } from "../data/sibling-apps";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  readingTime?: number;
  thumbnail?: string;
};

const allBlogPosts: BlogPost[] = rawBlogPosts as BlogPost[];
const latestBlogPosts = allBlogPosts.slice(0, 4);

// Hand-picked to show breadth in one scan: AI infra, data, agents,
// beautiful web, DevOps, craft. Each name resolves against projects.ts.
const SELECTED: { name: string; status: string }[] = [
  { name: "AnyRouter", status: "Live" },
  { name: "ClickHouse Monitoring", status: "Live" },
  { name: "AI Agents", status: "Beta" },
  { name: "Stamps", status: "Live" },
  { name: "Helm Charts", status: "OSS" },
  { name: "Duyet Serif", status: "OSS" },
];

const byName = new Map(apps.map((a) => [a.name, a]));
const selectedProjects = SELECTED.map(({ name, status }) => {
  const item = byName.get(name);
  return item ? { item, status } : null;
}).filter((x): x is { item: AppItem; status: string } => x !== null);

const totalProjects = apps.length;
const githubProjects = apps.filter((a) => a.host === "github.com").length;

// Footer link row — keeps every sibling site reachable in compact form.
const footerLinks = [
  { label: "duyet.net", href: "https://duyet.net" },
  ...siblingApps.map((s) => ({
    label: s.domain.replace(".duyet.net", ""),
    href: `https://${s.domain}`,
  })),
  { label: "github.com/duyet", href: "https://github.com/duyet" },
];

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="bg-background text-foreground">
        <main className="mx-auto max-w-[1080px] px-4 py-12 md:py-16 sm:px-6 lg:px-8 space-y-14 md:space-y-20">
          <Hero />
          <SelectedWork />
          <LatestWriting />
          <FooterLinks />
        </main>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Data &amp; AI Engineer · Building AI Agents
      </p>
      <h1 className="mt-4 max-w-3xl text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
        I&apos;m Duyet. I build AI agents — and the data platforms that keep
        them honest.
      </h1>

      <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-foreground/90">
        Senior Data &amp; AI Engineer, 8+ years. By day I move petabyte-scale
        data — recently migrated a 350TB+ Iceberg lake to ClickHouse on
        Kubernetes (300% better compression, queries 2–100× faster). By night I
        ship multi-agent LLM systems, write regularly on the{" "}
        <HeroLink href="https://blog.duyet.net">blog</HeroLink>, and open-source
        most of it — <HeroLink href="https://chmonitor.dev">ClickHouse
        monitoring</HeroLink>, <HeroLink href="https://insights.duyet.net">
        insights dashboards</HeroLink>, Helm charts, and a pile of GitHub
        Actions.{" "}
        <Link
          to="/about-duyetbot"
          className="font-medium underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground"
        >
          @duyetbot
        </Link>{" "}
        handles the rest.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button size="sm" asChild>
          <a
            href="https://blog.duyet.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the blog
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://cv.duyet.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            Résumé
          </a>
        </Button>
        <a
          href="https://github.com/duyet"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          github.com/duyet
          <ArrowUpRight size={12} />
        </a>
      </div>
    </section>
  );
}

function HeroLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium underline underline-offset-4 decoration-muted-foreground/40 hover:decoration-foreground"
    >
      {children}
    </a>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </span>
        <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function SelectedWork() {
  return (
    <section>
      <SectionHeader
        eyebrow="01 / Selected Work"
        title="Things I've shipped"
        action={
          <div className="flex shrink-0 items-baseline gap-4">
            <Link
              to="/projects"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              All {totalProjects} projects &rarr;
            </Link>
            <a
              href="https://github.com/duyet"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors sm:inline"
            >
              {githubProjects} on GitHub &rarr;
            </a>
          </div>
        }
      />
      <ul className="divide-y border">
        {selectedProjects.map(({ item, status }) => (
          <li key={item.name}>
            <ProjectRow item={item} status={status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectRow({ item, status }: { item: AppItem; status: string }) {
  return (
    <ProjectLink item={item}>
      <div className="group flex flex-wrap items-baseline gap-x-4 gap-y-0.5 px-4 py-3.5 sm:flex-nowrap sm:py-3 hover:bg-muted transition-colors">
        {/* Domain leads on desktop; the least-useful field on a phone, so hidden there */}
        <span className="hidden sm:block w-36 shrink-0 font-mono text-xs text-muted-foreground truncate">
          {item.domain || item.host}
        </span>
        <span className="order-1 shrink-0 text-sm font-medium group-hover:underline underline-offset-4 sm:order-none">
          {item.name}
        </span>
        <Badge
          variant="outline"
          className="order-2 ml-auto shrink-0 sm:order-last sm:ml-0"
        >
          {status}
        </Badge>
        {/* Description: full row on mobile, inline with the name on desktop */}
        <span className="order-3 w-full min-w-0 basis-full truncate text-sm text-muted-foreground sm:order-none sm:w-auto sm:flex-1 sm:basis-auto">
          {item.description}
        </span>
      </div>
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
  const className =
    "block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LatestWriting() {
  return (
    <section>
      <SectionHeader
        eyebrow="02 / Writing"
        title="From the blog"
        action={
          <a
            href="https://blog.duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse the blog &rarr;
          </a>
        }
      />
      <ul className="divide-y border">
        {latestBlogPosts.map((post) => (
          <li key={post.slug}>
            <a
              href={`https://blog.duyet.net${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors no-underline text-foreground group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground w-24 sm:w-28">
                {formatDateShort(post.date)}
              </span>
              <span className="flex-1 text-sm font-medium group-hover:underline underline-offset-4 truncate">
                {post.title}
              </span>
              {post.readingTime != null && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {post.readingTime} min
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FooterLinks() {
  return (
    <section className="border-t pt-6">
      <p className="font-mono text-xs text-muted-foreground tabular-nums">
        {allBlogPosts.length} posts · {totalProjects} projects · 9 apps
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
        {footerLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        ))}
        <Link
          to="/about-duyetbot"
          className="hover:text-foreground transition-colors"
        >
          @duyetbot
        </Link>
      </div>
    </section>
  );
}
