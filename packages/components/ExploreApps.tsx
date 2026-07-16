/**
 * ExploreApps — shared cross-app discovery section.
 *
 * Renders a compact, uniform grid of every public surface in the duyet.net
 * network. Each app gets a hand-drawn monochrome glyph, its name, and its
 * domain; the blurb rides along as the tooltip.
 *
 * Styled entirely with the `--rd-*` token layer (see styles.css) so it looks
 * identical across blog, home, insights, and homelab and recolors in light/dark.
 *
 * Pass `currentApp` to drop the app the visitor is already on.
 */
import type { ReactNode } from "react";
import { SecHead } from "./redesign";

export type ExploreAppKey =
  | "home"
  | "blog"
  | "cv"
  | "insights"
  | "homelab"
  | "photos"
  | "llm-timeline"
  | "ai-percentage"
  | "agents"
  | "kb";

interface AppEntry {
  key: ExploreAppKey;
  name: string;
  /** Live domain without scheme, e.g. `blog.duyet.net`. */
  domain: string;
  href: string;
  blurb: string;
  glyph: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Monochrome SVG glyphs — 24×24 viewBox, currentColor stroke        */
/*  Each one has a bit more personality than a bare icon set.         */
/* ------------------------------------------------------------------ */
const G = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Glyph = {
  home: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9.5h14V10" />
      <path d="M9.5 19.5v-5h5v5" />
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
      <path d="M15.5 3.5v2.5h-7V3.5" />
    </svg>
  ),
  cv: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="11" r="2.1" />
      <path d="M6 16c.4-1.6 1.7-2.4 3-2.4s2.6.8 3 2.4M15 9.5h3.5M15 13h3" />
    </svg>
  ),
  insights: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <path d="M4 20h16" />
      <path d="M6.5 20v-5M11 20V9.5M15.5 20v-7.5M20 20V6" />
      <circle cx="20" cy="6" r="1" fill="currentColor" />
      <circle cx="15.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="11" cy="9.5" r="1" fill="currentColor" />
    </svg>
  ),
  homelab: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="3.5" y="3.5" width="17" height="5" rx="1.5" />
      <rect x="3.5" y="10" width="17" height="5" rx="1.5" />
      <rect x="3.5" y="16.5" width="17" height="4" rx="1.5" />
      <circle cx="7" cy="6" r="1" fill="currentColor" />
      <circle cx="7" cy="12.5" r="1" fill="currentColor" />
      <circle cx="7" cy="18.5" r="1" fill="currentColor" />
    </svg>
  ),
  photos: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 17 4.5-4.5L13 17M12 14l3-3 5 5" />
      <path d="M3.5 16.5 8 12l4.5 4.5" />
    </svg>
  ),
  "llm-timeline": (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <path d="M4 12h16" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="13" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" />
      <path d="M7 6v4M13 14v4" />
      <path d="M7 6h10M7 18h8" />
    </svg>
  ),
  "ai-percentage": (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 8.5 15.5 15.5" />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" />
      <circle cx="15" cy="15" r="1.1" fill="currentColor" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" />
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <rect x="6" y="8" width="12" height="9" rx="3" />
      <path d="M12 5v3M9.5 12.5h.01M14.5 12.5h.01M4 11v3M20 11v3" />
      <path d="M6 17.5v2.5h12v-2.5" />
    </svg>
  ),
  kb: (
    <svg viewBox="0 0 24 24" width="22" height="22" {...G}>
      <path d="M12 6c-1.6-1.2-3.6-1.5-6-1.5V18c2.4 0 4.4.3 6 1.5 1.6-1.2 3.6-1.5 6-1.5V4.5c-2.4 0-4.4.3-6 1.5Z" />
      <path d="M12 6v13.5" />
      <path d="M7 9.5h2M7 12.5h2" strokeWidth="1.2" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  App registry                                                      */
/* ------------------------------------------------------------------ */
const APPS: AppEntry[] = [
  {
    key: "home",
    name: "Home",
    domain: "duyet.net",
    href: "https://duyet.net",
    blurb:
      "The index — who I am, what I ship, and where to find it across the network.",
    glyph: Glyph.home,
  },
  {
    key: "insights",
    name: "Insights",
    domain: "insights.duyet.net",
    href: "https://insights.duyet.net",
    blurb:
      "Live dashboards: coding hours, site traffic, and token spend, all refreshed daily.",
    glyph: Glyph.insights,
  },
  {
    key: "blog",
    name: "Blog",
    domain: "blog.duyet.net",
    href: "https://blog.duyet.net",
    blurb: "Long-form notes on data, distributed systems, and AI agents.",
    glyph: Glyph.blog,
  },
  {
    key: "agents",
    name: "AI Agents",
    domain: "agents.duyet.net",
    href: "https://agents.duyet.net",
    blurb:
      "Chat over Workers AI with streaming, artifacts, and tool integration.",
    glyph: Glyph.agents,
  },
  {
    key: "cv",
    name: "Résumé",
    domain: "cv.duyet.net",
    href: "https://cv.duyet.net",
    blurb: "CV and project history — data platforms, AI products, teams.",
    glyph: Glyph.cv,
  },
  {
    key: "homelab",
    name: "Homelab",
    domain: "homelab.duyet.net",
    href: "https://homelab.duyet.net",
    blurb:
      "Monitoring for a three-node mini-PC cluster and smart-home devices.",
    glyph: Glyph.homelab,
  },
  {
    key: "photos",
    name: "Photos",
    domain: "photos.duyet.net",
    href: "https://photos.duyet.net",
    blurb:
      "Photo journal with build-time EXIF metadata, maps, and timelines.",
    glyph: Glyph.photos,
  },
  {
    key: "kb",
    name: "Knowledge base",
    domain: "kb.duyet.net",
    href: "https://kb.duyet.net",
    blurb:
      "A public second brain — durable notes on engineering and life, openly indexed.",
    glyph: Glyph.kb,
  },
  {
    key: "llm-timeline",
    name: "LLM Timeline",
    domain: "llm-timeline.duyet.net",
    href: "https://llm-timeline.duyet.net",
    blurb:
      "Interactive timeline of language-model releases since 2017 with benchmarks.",
    glyph: Glyph["llm-timeline"],
  },
  {
    key: "ai-percentage",
    name: "AI Percentage",
    domain: "ai-percentage.duyet.net",
    href: "https://ai-percentage.duyet.net",
    blurb:
      "How much of each repo is co-authored by AI assistants — a transparency tool.",
    glyph: Glyph["ai-percentage"],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export interface ExploreAppsProps {
  /** App the visitor is currently on — excluded from the grid. */
  currentApp?: ExploreAppKey;
  /** Override the section eyebrow. */
  eyebrow?: string;
  /** Override the section title. */
  title?: string;
  className?: string;
}

export function ExploreApps({
  currentApp,
  eyebrow = "The network",
  title = "More from duyet.net",
  className,
}: ExploreAppsProps) {
  const apps = APPS.filter((a) => a.key !== currentApp);

  return (
    <section className={className} style={{ borderTop: "1px solid var(--rd-border)" }}>
      <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(32px,4vw,52px)]">
        <SecHead
          eyebrow={eyebrow}
          title={title}
          links={[
            {
              label: "duyet.net",
              href: "https://duyet.net",
            },
          ]}
        />

        {/* Compact uniform grid — one small row per app */}
        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {apps.map((app) => (
              <a
                key={app.key}
                href={app.href}
                className="rd-explore-card group flex items-center gap-2.5 px-3 py-2.5 no-underline text-inherit border border-[var(--rd-border)] rounded-[var(--rd-r)] bg-[var(--rd-surface)]"
                title={app.blurb}
              >
                <div className="rd-explore-glyph w-7 h-7 rounded-[8px] [&_svg]:w-3.5 [&_svg]:h-3.5">
                  {app.glyph}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block font-semibold tracking-[-0.01em] leading-snug truncate text-[var(--rd-text)] text-[12.5px] group-hover:text-[var(--rd-accent-ink)] transition-colors duration-200">
                    {app.name}
                  </span>
                  <span className="block font-[var(--font-mono)] text-[9.5px] text-[var(--rd-text-4)] truncate mt-0.5">
                    {app.domain}
                  </span>
                </div>

                <span className="rd-explore-arrow opacity-0 group-hover:opacity-100 text-[10px] text-[var(--rd-text-4)] transition-all duration-200 font-mono">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExploreApps;
