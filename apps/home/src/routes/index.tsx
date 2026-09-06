import { Reveal } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import rawNotes from "../../../blog/public/notes-data.json";
import rawBlogPosts from "../../../blog/public/posts-data.json";
import { BlogTeaser } from "../components/BlogTeaser";
import { KeyboardFeatures } from "../components/KeyboardFeatures";
import { SectionHead } from "../components/SectionHead";
import { SelectedWorkShowcase } from "../components/SelectedWorkShowcase";
import { SkillsBento } from "../components/SkillsBento";
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
          "duyet — AI / Data Engineer. Selected work, open-source projects, and writing.",
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

const FEATURED: { name: string; tag: string }[] = [
  { name: "AnyRouter", tag: "AI Infra" },
  { name: "TemplateBot", tag: "Marketplace" },
  { name: "ClickHouse Monitoring", tag: "Data" },
  { name: "MCP Tools", tag: "AI" },
  { name: "npx skills add duyet/build-agent", tag: "AI Skill" },
];

const MORE_NAMES = [
  "OMA",
  "Codex & Claude Plugins",
  "LLM over DNS",
  "ccusage → ClickHouse",
  "Clauduck",
  "Stamps",
  "ShareHTML",
  "AI Agents",
];

const byName = new Map(apps.map((a) => [a.name, a]));
const featuredProjects = FEATURED.map(({ name, tag }) => {
  const item = byName.get(name);
  return item ? { item, tag } : null;
}).filter((x): x is { item: AppItem; tag: string } => x !== null);

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
        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(3rem,7vw,5.5rem)] pb-[clamp(48px,6vw,80px)]">
          <Reveal>
            <SkillsBento />
          </Reveal>
        </section>

        <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(48px,6vw,80px)]">
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
      </div>
    </>
  );
}
