import { Reveal } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import rawNotes from "../../../blog/public/notes-data.json";
import rawBlogPosts from "../../../blog/public/posts-data.json";
import { BlogTeaser } from "../components/BlogTeaser";
import { HomeHero } from "../components/HomeHero";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { SectionHead } from "../components/SectionHead";
import { SelectedWorkShowcase } from "../components/SelectedWorkShowcase";
import { type AppItem, apps } from "../data/projects";
import {
  organizationJsonLd,
  personJsonLd,
  websiteJsonLd,
} from "../lib/jsonld";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Duyet — Senior Data & AI Engineer. Agent workflows, data platforms, selected work, and writing.",
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(websiteJsonLd()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(personJsonLd()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(organizationJsonLd()),
      },
    ],
  }),
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
const featuredPost = allBlogPosts[0];
const recentPosts = allBlogPosts.slice(1, 6);

const recentNotes = (
  rawNotes as { id: string; title: string; date: string; excerpt: string }[]
).slice(0, 5);

const FEATURED: { name: string; tag: string; label: string }[] = [
  { name: "AnyRouter", tag: "AI Infra", label: "anyrouter.dev" },
  { name: "ClickHouse Monitoring", tag: "Data", label: "chmonitor.dev" },
  { name: "Templatebot", tag: "Marketplace", label: "templatebot" },
  { name: "AI;DR", tag: "News", label: "aidr.today" },
  { name: "OMA", tag: "AI", label: "oma.duyet.net" },
  { name: "Summa", tag: "Data", label: "summa.duyet.net" },
  { name: "Agent State", tag: "AI", label: "agentstate.app" },
  {
    name: "Rust Tieng Viet",
    tag: "Rust",
    label: "rust-tieng-viet.github.io",
  },
  {
    name: "npx skills add duyet/build-agent",
    tag: "AI Skill",
    label: "duyet/build-agent",
  },
];

const MORE_NAMES = [
  "LLM over DNS",
  "ShareHTML",
  "Stamps",
  "Codex & Claude Plugins",
  "ccusage → ClickHouse",
  "Clauduck",
  "AI Agents",
  "MCP Tools",
];

const byName = new Map(apps.map((a) => [a.name, a]));
const featuredProjects = FEATURED.map(({ name, tag, label }) => {
  const item = byName.get(name);
  return item ? { item, tag, label } : null;
}).filter(
  (x): x is { item: AppItem; tag: string; label: string } => x !== null
);

const featuredNames = new Set(featuredProjects.map((p) => p.item.name));
const moreProjects = MORE_NAMES.map((name) => byName.get(name)).filter(
  (item): item is AppItem => !!item && !featuredNames.has(item.name)
);

function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <KeyboardFeatures />
      </Suspense>

      <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
        <HomeHero />

        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(1rem,3vw,2rem)] pb-[clamp(48px,6vw,80px)]">
          <Reveal>
            <SelectedWorkShowcase
              featured={featuredProjects}
              more={moreProjects}
            />
          </Reveal>
        </section>

        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(48px,6vw,80px)]">
          <Reveal>
            <SectionHead
              title="From the blog"
              links={[
                {
                  label: "blog.duyet.net",
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
      </div>
    </>
  );
}
