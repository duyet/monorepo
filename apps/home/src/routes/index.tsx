import {
  AreasOfExpertise,
  ExploreApps,
  Eyebrow,
  Reveal,
  SecHead,
} from "@duyet/components";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import rawNotes from "../../../blog/public/notes-data.json";
import rawBlogPosts from "../../../blog/public/posts-data.json";
import { BlogTeaser } from "../components/BlogTeaser";
import { GitHubContributions } from "../components/GitHubContributions";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { NowDeco } from "../components/NowDeco";

import { Button } from "../components/ui/button";
import { WorkBento } from "../components/WorkBento";
import { type AppItem, apps } from "../data/projects";

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

const recentNotes = (
  rawNotes as { id: string; title: string; date: string; excerpt: string }[]
).slice(0, 5);

// Hand-picked to show breadth: AI infra, data, agents, DevOps, craft, type.
const SELECTED: { name: string; tag: string }[] = [
  { name: "npx skills add duyet/build-agent", tag: "AI Skill" },
  { name: "Codex & Claude Plugins", tag: "AI" },
  { name: "AnyRouter", tag: "AI Infra" },
  { name: "ClickHouse Monitoring", tag: "Data" },
  { name: "Agent State", tag: "AI" },
  { name: "MCP Tools", tag: "AI" },
  { name: "OMA", tag: "AI Infra" },
  { name: "LLM over DNS", tag: "AI Infra" },
  { name: "ccusage → ClickHouse", tag: "Data" },
  { name: "Clauduck", tag: "Data" },
  { name: "Rust Tieng Viet", tag: "Rust" },
  { name: "Stamps", tag: "Tool" },
  { name: "Helm Charts", tag: "Infra" },
];

const byName = new Map(apps.map((a) => [a.name, a]));
const selectedProjects = SELECTED.map(({ name, tag }) => {
  const item = byName.get(name);
  return item ? { item, tag } : null;
}).filter((x): x is { item: AppItem; tag: string } => x !== null);

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
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(32px,4.5vw,56px)] pb-[clamp(22px,3vw,36px)]">
          <Reveal>
            <div>
              <Eyebrow>DATA &amp; AI ENGINEER</Eyebrow>
              <h1 className="rd-display mt-[13px] text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1.05]">
                Building agent workflows and the{" "}
                <span className="text-[var(--rd-accent)]">
                  <span className="rd-shimmer">data platform</span>
                </span>{" "}
                underneath them.
              </h1>
              <p className="rd-lead mt-[16px] max-w-[64ch] text-[clamp(1.02rem,1.4vw,1.18rem)]">
                I'm Duyet — a Senior Data &amp; AI Engineer. I focus on the
                foundational systems that make software work: data pipelines
                that scale, platforms that stay reliable, and AI agents that are
                actually useful. I build systems that are simple to operate and
                transparent about what they do — and I{" "}
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
            </div>
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
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] border-t border-[var(--rd-border)]">
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
              notes={recentNotes}
            />
          </Reveal>
        </section>

        {/* expertise */}
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] border-t border-[var(--rd-border)]">
          <Reveal>
            <SecHead num="03" eyebrow="Discipline" title="Areas of Expertise" />
            <div className="mt-6">
              <AreasOfExpertise hideHeader />
            </div>
          </Reveal>
        </section>

        {/* now band */}
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
          <Reveal>
            <div className="rd-card p-[clamp(18px,2.2vw,26px)] relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 overflow-hidden">
              <NowDeco />
              <div className="relative">
                <Eyebrow>
                  <span className="rd-dot rd-ok rd-pulse inline-block" /> NOW
                </Eyebrow>
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

        <ExploreApps currentApp="home" />
      </div>
    </>
  );
}
