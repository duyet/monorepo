import { duyetUrls } from "@duyet/urls";

/**
 * A sibling app deployed from this monorepo to a public production domain.
 *
 * Source of truth for live URLs:
 * - Convention is `{appName}.duyet.net` (see `scripts/cf-deploy.ts`),
 *   except `home` → `duyet.net` and `agent-ui` → `agents.duyet.net`.
 * - Where `@duyet/urls` already exposes the URL, prefer that value so
 *   environment overrides flow through.
 *
 * Excluded:
 * - `home` (this app — already on the page)
 * - Backend-only workers without a UI surface
 *   (`api`, `agent-api`, `data-sync`)
 */
export interface SiblingApp {
  /** Display name shown in the directory row. */
  name: string;
  /** One-line description (sans serif, muted). */
  description: string;
  /** Live production domain, no scheme — e.g. `blog.duyet.net`. */
  domain: string;
}

export const siblingApps: SiblingApp[] = [
  {
    name: "Blog",
    description:
      "Long-form notes on data engineering, distributed systems, AI agents, and open source.",
    domain: hostOf(duyetUrls.apps.blog) ?? "blog.duyet.net",
  },
  {
    name: "Resume",
    description:
      "CV and project history covering data platforms, AI products, and team leadership.",
    domain: hostOf(duyetUrls.apps.cv) ?? "cv.duyet.net",
  },
  {
    name: "Insights",
    description:
      "Live dashboards for coding activity, site traffic, and token spend across the network.",
    domain: hostOf(duyetUrls.apps.insights) ?? "insights.duyet.net",
  },
  {
    name: "Photos",
    description:
      "Photo journal with build-time EXIF metadata extraction and Unsplash mirroring.",
    domain: hostOf(duyetUrls.apps.photos) ?? "photos.duyet.net",
  },
  {
    name: "Homelab",
    description:
      "Monitoring dashboard for a three-node mini-PC cluster running self-hosted workloads.",
    domain: hostOf(duyetUrls.apps.homelab) ?? "homelab.duyet.net",
  },
  {
    name: "LLM Timeline",
    description:
      "Interactive timeline of large language model releases from 2017 onward.",
    domain: "llm-timeline.duyet.net",
  },
  {
    name: "AI Percentage",
    description:
      "Tracks how much code in each repository is co-authored by AI assistants.",
    domain: "ai-percentage.duyet.net",
  },
  {
    name: "Agent Assistant",
    description:
      "Claude-backed chat assistant with streaming, thread persistence, and tool use.",
    domain: "agent-assistant.duyet.net",
  },
  {
    name: "AI Agents",
    description:
      "Chat surface over Cloudflare Workers AI with streaming, artifacts, and tools.",
    domain: "agents.duyet.net",
  },
  {
    name: "Burns",
    description:
      "Visualization of language burndown across projects using historical commit data.",
    domain: "burns.duyet.net",
  },
];

function hostOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}
