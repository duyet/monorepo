import { ArrowUpRight, ArrowRight, Flame } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { Button } from "../components/ui/button";
import rawBlogPosts from "../../../blog/public/posts-data.json";
import rawNotes from "../../../blog/public/notes-data.json";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { type AppItem, apps } from "../data/projects";
import { siblingApps } from "../data/sibling-apps";
import { SecHead, Eyebrow, Reveal } from "@duyet/components";
import { SignalBar } from "../components/SignalBar";
import { WorkBento } from "../components/WorkBento";
import { BlogTeaser } from "../components/BlogTeaser";
import { HeroDiagram3D as HeroDiagram } from "../components/HeroDiagram3D";
import { NowDeco } from "../components/NowDeco";
import { GitHubContributions } from "../components/GitHubContributions";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

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
const featuredPost = allBlogPosts[0];
const recentPosts = allBlogPosts.slice(1, 6);

const totalPosts = allBlogPosts.length;
const recentNotes = (rawNotes as { id: string; title: string; date: string; excerpt: string }[]).slice(0, 5);
const sinceYear = allBlogPosts.length
  ? new Date(allBlogPosts[allBlogPosts.length - 1].date).getFullYear()
  : 2015;
const yearsWriting = new Date().getFullYear() - sinceYear;

// Hand-picked to show breadth: AI infra, data, agents, DevOps, craft, type.
const SELECTED: { name: string; tag: string }[] = [
  { name: "Codex & Claude Plugins", tag: "AI" },
  { name: "AnyRouter", tag: "AI Infra" },
  { name: "ClickHouse Monitoring", tag: "Data" },
  { name: "AI Agents", tag: "AI" },
  { name: "MCP Tools", tag: "AI" },
  { name: "LLM over DNS", tag: "AI Infra" },
  { name: "ccusage → ClickHouse", tag: "Data" },
  { name: "Clauduck", tag: "Data" },
  { name: "Rust Tieng Viet", tag: "Rust" },
  { name: "LLM Timeline", tag: "AI" },
  { name: "Stamps", tag: "Tool" },
  { name: "Helm Charts", tag: "Infra" },
];

const byName = new Map(apps.map((a) => [a.name, a]));
const selectedProjects = SELECTED.map(({ name, tag }) => {
  const item = byName.get(name);
  return item ? { item, tag } : null;
}).filter((x): x is { item: AppItem; tag: string } => x !== null);

// Hardcoded homelab and coding stats — real-ish values matching live cluster.
const homelabSummary = { nodesOnline: 5, nodesTotal: 6, services: 19, avgCpu: 27.6 };
const codingSparkline = [40, 52, 48, 61, 58, 72, 66, 80, 74, 69, 77, 84];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
        {/* hero */}
        <section
          className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(22px,3.2vw,40px)] pb-[clamp(26px,3.5vw,40px)]"
        >
          <Reveal>
            <div className="rd-hero-grid">
              <div>
                <Eyebrow>DATA &amp; AI ENGINEER</Eyebrow>
                <h1
                  className="rd-display mt-[13px] max-w-[17ch] text-[clamp(2.05rem,4.2vw,3.3rem)] leading-[1.02]"
                >
                  I build data platforms, and the{" "}
                  <span className="text-[var(--rd-accent)]">AI agents</span>{" "}
                  that run on top of them.
                </h1>
                <p
                  className="rd-lead mt-4 max-w-[56ch] text-[clamp(0.96rem,1.15vw,1.06rem)]"
                >
                  I'm Duyet — a Senior Data &amp; AI Engineer. I spend my time
                  on the load-bearing parts of software: pipelines that move
                  data at scale, platforms that stay calm under pressure, and
                  the agents and tooling that make them genuinely useful. I like
                  systems that are simple to operate and honest about what
                  they're doing — and I{" "}
                  <a
                    href="https://github.com/duyet"
                    target="_blank"
                    rel="noreferrer"
                    className="rd-ulink"
                  >
                    open-source
                  </a>{" "}
                  most of what I build.
                </p>
                <Link
                  to="/about"
                  className="vibe-flag no-underline text-inherit"
                >
                  <span className="vf-ic grid place-items-center">
                    <Flame size={13} fill="#fff" />
                  </span>
                  <span>
                    <strong>Deep in vibe-coding mode</strong> — most of what ships here is written alongside coding agents, with me steering.
                  </span>
                  <span className="vf-arr inline-flex">
                    <ArrowRight size={14} />
                  </span>
                </Link>
                <div
                  className="flex flex-wrap items-center gap-3 mt-5"
                >
                  <Button variant="default" size="sm" asChild>
                    <a
                      href="https://blog.duyet.net"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read the blog
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href="https://cv.duyet.net"
                      target="_blank"
                      rel="noreferrer"
                    >
                      R&eacute;sum&eacute;
                    </a>
                  </Button>
                  <Button variant="link" size="sm" asChild>
                    <a
                      href="https://github.com/duyet"
                      target="_blank"
                      rel="noreferrer"
                    >
                      github.com/duyet
                    </a>
                  </Button>
                </div>
              </div>
              <HeroDiagram />
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-[clamp(22px,3vw,36px)]">
            <SignalBar
              totalPosts={totalPosts}
              yearsWriting={yearsWriting}
              sinceYear={sinceYear}
              projectCount={apps.length}
              siblingAppCount={siblingApps.length}
              homelabSummary={homelabSummary}
              codingSparkline={codingSparkline}
            />
          </Reveal>
        </section>

        {/* selected work */}
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
          <Reveal>
            <SecHead
              num="01"
              eyebrow="Selected work"
              title="Things I've shipped"
              links={[
                {
                  label: "All projects",
                  onClick: () => window.location.assign("/projects"),
                },
                {
                  label: "GitHub",
                  href: "https://github.com/duyet",
                },
              ]}
            />
            <WorkBento selectedProjects={selectedProjects} />
          </Reveal>
        </section>

        {/* blog */}
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
          <Reveal>
            <SecHead
              num="02"
              eyebrow="Writing"
              title="From the blog"
              links={[
                {
                  label: "Browse the blog",
                  href: "https://blog.duyet.net",
                },
              ]}
            />
            <BlogTeaser
              featuredPost={featuredPost}
              recentPosts={recentPosts}
              totalPosts={totalPosts}
              notes={recentNotes}
            />
          </Reveal>
        </section>

        {/* now band */}
        <section
          className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]"
        >
          <Reveal>
            <div
              className="rd-card p-[clamp(18px,2.2vw,26px)] relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 overflow-hidden"
            >
              <NowDeco />
              <div className="relative">
                <Eyebrow>
                  <span
                    className="rd-dot rd-ok rd-pulse inline-block"
                  />{" "}
                  NOW
                </Eyebrow>
                <p
                  className="mt-[14px] max-w-[42ch] text-[clamp(1.15rem,2vw,1.5rem)] tracking-[-0.02em] leading-[1.35]"
                >
                  Building agent workflows and the data platform underneath them
                  — writing, open-sourcing, and letting{" "}
                  <Link to="/about-duyetbot" className="rd-ulink">
                    @duyetbot
                  </Link>{" "}
                  keep the rest running.
                </p>
                <GitHubContributions />
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/about"
                  className="relative cursor-pointer no-underline"
                >
                  About me <ArrowUpRight size={16} />
                </Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
